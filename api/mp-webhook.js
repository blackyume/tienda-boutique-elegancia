// Webhook de Mercado Pago: recibe notificaciones de cambio de estado de pago
// y actualiza la orden correspondiente en Firestore.
//
// Requiere env vars:
//   MP_ACCESS_TOKEN          — para consultar /v1/payments/{id}
//   FIREBASE_SERVICE_ACCOUNT — para escribir en Firestore con Admin SDK
//   MP_WEBHOOK_SECRET        — opcional. Si lo seteás en MP, validamos x-signature.
//
// Flujo:
//   1. MP manda POST con {type, data: {id}} cuando hay un payment event.
//   2. Consultamos /v1/payments/{id} para obtener status y external_reference.
//   3. external_reference === order.id (que setea el checkout al crear la pref).
//   4. Actualizamos order.status según payment.status.
//
// Config en MP: Mercado Pago Dashboard → Webhooks → URL: /api/mp-webhook
const crypto = require('crypto');
const { getDb } = require('./_firebaseAdmin');

const MP_STATUS_MAP = {
    approved: 'approved',
    authorized: 'approved',
    in_process: 'pending',
    in_mediation: 'pending',
    pending: 'pending',
    rejected: 'cancelled',
    refunded: 'refunded',
    charged_back: 'refunded',
    cancelled: 'cancelled'
};

const verifySignature = (req, paymentId) => {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return true; // Validación opcional

    const signatureHeader = req.headers['x-signature'] || '';
    const requestId = req.headers['x-request-id'] || '';
    if (!signatureHeader || !requestId) return false;

    // Formato: "ts=1234567890,v1=abcdef..."
    const parts = Object.fromEntries(
        signatureHeader.split(',').map(p => p.trim().split('='))
    );
    const ts = parts.ts;
    const v1 = parts.v1;
    if (!ts || !v1) return false;

    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    return hmac === v1;
};

const fetchPayment = async (paymentId) => {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error('MP_ACCESS_TOKEN no configurado');
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`MP API ${res.status}: ${text}`);
    }
    return res.json();
};

module.exports = async (req, res) => {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // MP hace GET como verificación inicial — respondemos ok.
    if (req.method === 'GET') return res.status(200).json({ ok: true });

    try {
        const body = req.body || {};
        const topic = body.type || body.topic || '';
        const resourceId = body.data?.id || body.resource || body.id;

        // Ignorar eventos que no sean de payment
        if (topic !== 'payment' || !resourceId) {
            return res.status(200).json({ ignored: true, topic });
        }

        // Validar firma (opcional)
        if (!verifySignature(req, resourceId)) {
            return res.status(401).json({ error: 'Firma inválida' });
        }

        // Consultar el pago en MP
        const payment = await fetchPayment(resourceId);
        const externalRef = payment.external_reference;
        const mpStatus = payment.status;

        if (!externalRef) {
            return res.status(200).json({ ignored: true, reason: 'sin external_reference' });
        }

        const newStatus = MP_STATUS_MAP[mpStatus] || 'pending';

        // Buscar la orden por id (el external_reference debe ser el order.id)
        const db = getDb();
        const docRef = db.collection('orders').doc(String(externalRef));
        const snap = await docRef.get();

        if (!snap.exists) {
            // También buscamos como id custom (order.id puede no ser el docId)
            const query = await db.collection('orders')
                .where('id', '==', String(externalRef))
                .limit(1)
                .get();
            if (query.empty) {
                return res.status(200).json({ ignored: true, reason: 'orden no encontrada', externalRef });
            }
            await query.docs[0].ref.update({
                status: newStatus,
                mpStatus,
                mpPaymentId: String(resourceId),
                mpUpdatedAt: Date.now()
            });
        } else {
            await docRef.update({
                status: newStatus,
                mpStatus,
                mpPaymentId: String(resourceId),
                mpUpdatedAt: Date.now()
            });
        }

        return res.status(200).json({ ok: true, status: newStatus, paymentId: resourceId });
    } catch (err) {
        console.error('[mp-webhook] error:', err);
        return res.status(500).json({ error: err.message });
    }
};
