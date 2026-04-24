// Vercel cron: escanea abandoned_carts y envía recordatorio por email
// a los que tienen 2-72 h sin completar, sin reminder previo.
//
// Requiere env vars:
//   FIREBASE_SERVICE_ACCOUNT   — JSON service account de Firebase
//   EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY
//   EMAILJS_PRIVATE_KEY        — API key privada de EmailJS (requerida server-side)
//   CRON_SECRET                — opcional. Si está, validar header Authorization: Bearer <secret>
//   PUBLIC_SITE_URL            — opcional. Para el link de recuperación. Default: https://la-boutique-de-la-elegancia.web.app
const { getDb } = require('../_firebaseAdmin');

const MIN_AGE_MS = 2 * 60 * 60 * 1000;   // 2 horas
const MAX_AGE_MS = 72 * 60 * 60 * 1000;  // 72 horas

const formatMoney = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

const sendEmailJS = async ({ to_email, to_name, items_summary, total, recovery_link }) => {
    const service_id = process.env.EMAILJS_SERVICE_ID;
    const template_id = process.env.EMAILJS_TEMPLATE_ID;
    const user_id = process.env.EMAILJS_PUBLIC_KEY;
    const accessToken = process.env.EMAILJS_PRIVATE_KEY;

    if (!service_id || !template_id || !user_id || !accessToken) {
        throw new Error('EmailJS env vars incompletas');
    }

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id,
            template_id,
            user_id,
            accessToken,
            template_params: {
                to_name: to_name || 'Cliente',
                to_email,
                order_id: 'Recordatorio',
                total: formatMoney(total),
                items_summary,
                shipping_method: `Completá tu pedido: ${recovery_link}`,
                recovery_link
            }
        })
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`EmailJS ${res.status}: ${text}`);
    }
};

module.exports = async (req, res) => {
    // Auth opcional para invocación manual/scheduled
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret) {
        const authHeader = req.headers['authorization'] || '';
        if (authHeader !== `Bearer ${expectedSecret}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    const baseUrl = process.env.PUBLIC_SITE_URL || 'https://la-boutique-de-la-elegancia.web.app';

    try {
        const db = getDb();
        const now = Date.now();
        const cutoffOld = new Date(now - MAX_AGE_MS);
        const cutoffNew = new Date(now - MIN_AGE_MS);

        const snap = await db.collection('abandoned_carts')
            .where('recovered', '==', false)
            .get();

        let sent = 0;
        let skipped = 0;
        const errors = [];

        for (const docSnap of snap.docs) {
            const cart = { id: docSnap.id, ...docSnap.data() };

            // Ya tuvo al menos 1 recordatorio → skip
            if (cart.reminderSentAt) { skipped++; continue; }

            // Edad del carrito
            const lastUpdated = cart.lastUpdated?.toDate
                ? cart.lastUpdated.toDate()
                : (cart.lastUpdated ? new Date(cart.lastUpdated) : null);
            if (!lastUpdated) { skipped++; continue; }

            if (lastUpdated > cutoffNew) { skipped++; continue; } // muy fresco
            if (lastUpdated < cutoffOld) { skipped++; continue; } // muy viejo

            // Sin email → skip
            if (!cart.email) { skipped++; continue; }

            const itemsSummary = (cart.items || [])
                .map(i => `${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` · ${i.color}` : ''} x${i.quantity}`)
                .join(', ');

            try {
                await sendEmailJS({
                    to_email: cart.email,
                    to_name: cart.customer?.nombre || 'Cliente',
                    items_summary: itemsSummary,
                    total: cart.total || 0,
                    recovery_link: `${baseUrl}/checkout`
                });

                await docSnap.ref.update({
                    reminderSentAt: Date.now(),
                    reminderCount: (cart.reminderCount || 0) + 1,
                    reminderType: 'auto'
                });
                sent++;
            } catch (err) {
                errors.push({ id: cart.id, error: err.message });
            }
        }

        return res.status(200).json({
            ok: true,
            scanned: snap.docs.length,
            sent,
            skipped,
            errors
        });
    } catch (err) {
        console.error('[cron abandoned-reminder] error:', err);
        return res.status(500).json({ error: err.message });
    }
};
