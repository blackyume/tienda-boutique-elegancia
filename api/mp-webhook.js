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
const { getDb, admin } = require('./_firebaseAdmin');
const { applyStockDecrement, applyStockRestore } = require('./_pricing');

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
        const paidAmount = Number(payment.transaction_amount) || 0;

        // Buscar la orden (external_reference == order.id; puede o no ser el docId)
        const db = getDb();
        let docRef = db.collection('orders').doc(String(externalRef));
        let snap = await docRef.get();
        if (!snap.exists) {
            const query = await db.collection('orders')
                .where('id', '==', String(externalRef)).limit(1).get();
            if (query.empty) {
                return res.status(200).json({ ignored: true, reason: 'orden no encontrada', externalRef });
            }
            docRef = query.docs[0].ref;
            snap = query.docs[0];
        }
        const order = snap.data() || {};

        // Idempotencia: mismo pago + mismo estado ya procesado
        if (order.mpPaymentId === String(resourceId) && order.status === newStatus) {
            return res.status(200).json({ ok: true, deduped: true, status: newStatus });
        }

        const base = {
            mpStatus,
            mpPaymentId: String(resourceId),
            mpUpdatedAt: Date.now(),
            mpAmountPaid: paidAmount
        };

        // Verificar monto pagado vs esperado (anti-fraude / manipulación de precio)
        const expected = Number(order.amountExpected ?? order.total) || 0;
        if (newStatus === 'approved' && expected > 0 && Math.abs(paidAmount - expected) > 1) {
            await docRef.update({
                ...base,
                status: 'review',
                mpAmountMismatch: true
            });
            console.warn(`[mp-webhook] MONTO NO COINCIDE order=${externalRef} esperado=${expected} pagado=${paidAmount}`);
            return res.status(200).json({ ok: true, status: 'review', reason: 'amount_mismatch', expected, paid: paidAmount });
        }

        await docRef.update({ ...base, status: newStatus });

        // Descontar stock al aprobar (idempotente vía flag stockApplied)
        if (newStatus === 'approved' && !order.stockApplied && Array.isArray(order.items) && order.items.length) {
            const lines = order.items.filter(i => i && i.id != null);
            if (lines.length) {
                try {
                    await db.runTransaction(async (tx) => {
                        const byProduct = new Map();
                        for (const l of lines) {
                            const pid = String(l.id);
                            if (!byProduct.has(pid)) byProduct.set(pid, []);
                            byProduct.get(pid).push({ size: l.size || '', color: l.color || '', quantity: Number(l.quantity) || 0 });
                        }
                        const refs = [...byProduct.keys()].map(pid => db.collection('products').doc(pid));
                        const docs = await Promise.all(refs.map(r => tx.get(r)));
                        docs.forEach((pdoc, idx) => {
                            if (!pdoc.exists) return;
                            const pid = [...byProduct.keys()][idx];
                            const patch = applyStockDecrement(pdoc.data(), byProduct.get(pid));
                            tx.update(pdoc.ref, patch);
                        });
                        tx.update(docRef, { stockApplied: true, stockAppliedAt: Date.now() });
                    });
                } catch (stockErr) {
                    console.error(`[mp-webhook] stock decrement falló order=${externalRef}:`, stockErr.message);
                    await docRef.update({ stockError: stockErr.message, needsStockReview: true });
                }
            }
        }

        // Acreditar al dueño del referido SOLO cuando el pago se aprobó
        // (server-side, idempotente, sin auto-referido).
        if (newStatus === 'approved' && !order.referralCredited && order.referral && order.referral.ownerUid) {
            const ownerUid = String(order.referral.ownerUid);
            const isSelf = order.userId && String(order.userId) === ownerUid;
            if (!isSelf) {
                try {
                    await db.collection('users').doc(ownerUid).set({
                        referralsCount: admin.firestore.FieldValue.increment(1),
                        referralsEarnings: admin.firestore.FieldValue.increment(Number(order.referralDiscount) || 0),
                        referralsRevenue: admin.firestore.FieldValue.increment(Number(order.total) || 0)
                    }, { merge: true });
                } catch (refErr) {
                    console.error(`[mp-webhook] credit referido falló order=${externalRef}:`, refErr.message);
                }
            }
            await docRef.update({ referralCredited: true });
        }

        // Consumir el cupón SOLO cuando el pago se aprobó (idempotente).
        // Antes el cliente lo incrementaba al crear la orden, así que un
        // checkout abandonado o un pago fallido quemaba un uso del cupón.
        if (newStatus === 'approved' && !order.couponRedeemed) {
            const code = order.couponCode || order.coupon?.code;
            if (code) {
                try {
                    const cq = await db.collection('coupons').where('code', '==', String(code)).limit(1).get();
                    if (!cq.empty) {
                        await cq.docs[0].ref.update({
                            usedCount: admin.firestore.FieldValue.increment(1)
                        });
                    }
                    await docRef.update({ couponRedeemed: true });
                } catch (couponErr) {
                    console.error(`[mp-webhook] redeem cupón falló order=${externalRef}:`, couponErr.message);
                }
            }
        }

        // Avisar al dueño por Telegram cuando entra una venta (si está configurado).
        // Incluye alerta de stock bajo de los productos vendidos.
        if (newStatus === 'approved') {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const ownerChat = process.env.TELEGRAM_OWNER_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
            if (botToken && ownerChat) {
                try {
                    const { getTotalStock } = require('./_pricing');
                    const items = (order.items || []).map(i => `• ${i.name || 'Producto'}${i.size ? ` (${i.size})` : ''}${i.color ? `/${i.color}` : ''} x${i.quantity}`).join('\n');
                    let lowMsg = '';
                    try {
                        const ids = [...new Set((order.items || []).filter(i => i && i.id != null).map(i => String(i.id)))];
                        const pdocs = await Promise.all(ids.map(id => db.collection('products').doc(id).get()));
                        const lows = [];
                        pdocs.forEach(d => { if (d.exists) { const p = d.data(); const s = getTotalStock(p); if (s <= 5) lows.push(`${p.name || d.id}: ${s}`); } });
                        if (lows.length) lowMsg = `\n\n⚠️ Stock bajo (reponer): ${lows.join(', ')}`;
                    } catch { /* noop */ }
                    const cliente = order.customer?.nombre || order.customer?.email || '—';
                    const text = `💰 ¡Nueva venta!\nPedido: ${order.id || externalRef}\nTotal: $${(Number(order.total) || 0).toLocaleString('es-AR')}\nCliente: ${cliente}\n\n${items}${lowMsg}`;
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: ownerChat, text })
                    });
                } catch (notifyErr) {
                    console.error(`[mp-webhook] aviso de venta falló order=${externalRef}:`, notifyErr.message);
                }
            }
        }

        // Reponer stock si se reembolsa/cancela tras haber descontado
        if ((newStatus === 'refunded' || newStatus === 'cancelled') && order.stockApplied && Array.isArray(order.items)) {
            const lines = order.items.filter(i => i && i.id != null);
            if (lines.length) {
                try {
                    await db.runTransaction(async (tx) => {
                        const byProduct = new Map();
                        for (const l of lines) {
                            const pid = String(l.id);
                            if (!byProduct.has(pid)) byProduct.set(pid, []);
                            byProduct.get(pid).push({ size: l.size || '', color: l.color || '', quantity: Number(l.quantity) || 0 });
                        }
                        const keys = [...byProduct.keys()];
                        const docs = await Promise.all(keys.map(pid => tx.get(db.collection('products').doc(pid))));
                        docs.forEach((pdoc, idx) => {
                            if (!pdoc.exists) return;
                            const patch = applyStockRestore(pdoc.data(), byProduct.get(keys[idx]));
                            tx.update(pdoc.ref, patch);
                        });
                        tx.update(docRef, { stockApplied: false, stockRestoredAt: Date.now() });
                    });
                } catch (restoreErr) {
                    console.error(`[mp-webhook] restock falló order=${externalRef}:`, restoreErr.message);
                }
            }
        }

        return res.status(200).json({ ok: true, status: newStatus, paymentId: resourceId });
    } catch (err) {
        console.error('[mp-webhook] error:', err);
        return res.status(500).json({ error: err.message });
    }
};
