// Vercel cron: marca como 'expired' las órdenes que quedaron en
// 'pending_payment' (el cliente abrió el checkout / MP pero nunca pagó)
// con más de 24 h y sin pago asociado. No borra: deja historial y saca
// el ruido de las métricas / la vista de pedidos.
//
// Requiere env vars:
//   FIREBASE_SERVICE_ACCOUNT   — JSON service account de Firebase
//   CRON_SECRET                — opcional. Si está, valida Authorization: Bearer <secret>
const { getDb } = require('../_firebaseAdmin');
const { safeEqual } = require('../_rateLimit');

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas

module.exports = async (req, res) => {
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret) {
        const authHeader = req.headers['authorization'] || '';
        if (!safeEqual(authHeader, `Bearer ${expectedSecret}`)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const db = getDb();
        const snap = await db.collection('orders')
            .where('status', '==', 'pending_payment')
            .get();

        const now = Date.now();
        let expired = 0;
        let skipped = 0;
        let batch = db.batch();
        let batchCount = 0;

        for (const doc of snap.docs) {
            const o = doc.data();
            // Nunca pagó (sin mpPaymentId) y suficientemente vieja
            if (o.mpPaymentId) { skipped++; continue; }
            const created = o.date ? new Date(o.date).getTime() : (Number(o.pricingVerifiedAt) || 0);
            if (!created || isNaN(created) || (now - created) < MAX_AGE_MS) { skipped++; continue; }

            batch.update(doc.ref, { status: 'expired', expiredAt: now });
            expired++;
            batchCount++;
            if (batchCount >= 400) {
                await batch.commit();
                batch = db.batch();
                batchCount = 0;
            }
        }
        if (batchCount > 0) await batch.commit();

        return res.status(200).json({ ok: true, scanned: snap.size, expired, skipped });
    } catch (err) {
        console.error('[cron/cleanup-orders] error:', err);
        return res.status(500).json({ error: err.message });
    }
};
