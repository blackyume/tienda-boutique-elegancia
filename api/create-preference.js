// Crea la preferencia de Mercado Pago. AUTORITATIVO: no confía en los precios
// que manda el cliente — recalcula todo contra Firestore (productos, stock,
// cupón) y reescribe la orden con el total verificado antes de cobrar.
const mercadopago = require('mercadopago');
const { checkRateLimit, getClientIp } = require('./_rateLimit');
const { getDb } = require('./_firebaseAdmin');
const { getVariantPrice, getVariantStock, hasVariantMap, getTotalStock } = require('./_pricing');

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 8;
const REFERRAL_DISCOUNT_PERCENT = 10;

const STATIC_ALLOWED_ORIGINS = [
    'https://la-boutique-de-la-elegancia.web.app',
    'https://la-boutique-de-la-elegancia.firebaseapp.com',
    'https://tienda-boutique-elegancia.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173'
];

const getAllowedOrigins = () => {
    const extra = (process.env.CORS_EXTRA_ORIGINS || '')
        .split(',').map(s => s.trim()).filter(Boolean);
    return [...STATIC_ALLOWED_ORIGINS, ...extra];
};

const applyCors = (req, res) => {
    const origin = req.headers.origin;
    if (origin && getAllowedOrigins().includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
};

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

module.exports = async (req, res) => {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const ip = getClientIp(req);
    const limit = await checkRateLimit(ip, { windowMs: RATE_WINDOW_MS, max: RATE_MAX_REQUESTS });
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({ error: 'Too many requests. Try again later.', retry_after_seconds: limit.retryAfterSec });
    }

    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) return res.status(500).json({ error: 'Server config error: Missing MP_ACCESS_TOKEN' });

    let db;
    try {
        db = getDb();
    } catch (e) {
        console.error('[create-preference] Firestore admin no disponible:', e.message);
        // Fail-closed: sin verificación de precios no creamos el cobro.
        return res.status(500).json({ error: 'Pago no disponible: falta configuración del servidor (FIREBASE_SERVICE_ACCOUNT).' });
    }

    mercadopago.configure({ access_token: ACCESS_TOKEN });

    try {
        const { items, payer, shipping_cost, external_reference, coupon, referral } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Invalid or empty items' });
        if (!payer || !payer.email) return res.status(400).json({ error: 'Missing payer data' });
        if (!external_reference) return res.status(400).json({ error: 'Missing external_reference (order id)' });

        // --- 1. RECALCULAR PRECIOS Y STOCK CONTRA FIRESTORE ---
        const mpItems = [];
        const verifiedItems = [];
        let subtotal = 0;

        for (const it of items) {
            const id = it.id != null ? String(it.id) : null;
            const qty = Math.floor(Number(it.quantity));
            if (!id || !isFinite(qty) || qty <= 0) return res.status(400).json({ error: 'Item inválido en el carrito' });

            const snap = await db.collection('products').doc(id).get();
            if (!snap.exists) return res.status(400).json({ error: `Producto no encontrado (${it.name || id})` });
            const product = snap.data();
            if (product.active === false) return res.status(400).json({ error: `Producto no disponible: ${product.name || id}` });

            const size = it.size || '';
            const color = it.color || '';
            const unitPrice = round2(getVariantPrice(product, size, color));
            if (!isFinite(unitPrice) || unitPrice <= 0) return res.status(400).json({ error: `Precio inválido para ${product.name || id}` });

            const available = hasVariantMap(product) ? getVariantStock(product, size, color) : getTotalStock(product);
            if (available < qty) {
                return res.status(409).json({ error: `Sin stock suficiente de ${product.name || id}${size ? ` (${size}${color ? '/' + color : ''})` : ''}. Disponible: ${available}.` });
            }

            subtotal += unitPrice * qty;
            mpItems.push({
                title: String(product.name || it.name || 'Producto').slice(0, 240),
                unit_price: unitPrice,
                quantity: qty,
                currency_id: 'ARS'
            });
            verifiedItems.push({ id, name: product.name || it.name || '', size, color, quantity: qty, price: unitPrice });
        }
        subtotal = round2(subtotal);

        // --- 2. CUPÓN (revalidado server-side) ---
        let couponDiscount = 0;
        let couponCode = null;
        if (coupon && coupon.code) {
            const q = await db.collection('coupons').where('code', '==', String(coupon.code)).limit(1).get();
            if (!q.empty) {
                const c = q.docs[0].data();
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                const usedUp = c.maxUses && Number(c.usedCount || 0) >= Number(c.maxUses);
                const belowMin = c.minPurchase && subtotal < Number(c.minPurchase);
                if (c.active !== false && !expired && !usedUp && !belowMin) {
                    couponDiscount = c.type === 'percentage'
                        ? subtotal * (Number(c.value) / 100)
                        : Math.min(Number(c.value) || 0, subtotal);
                    couponCode = String(c.code);
                }
            }
        }
        couponDiscount = round2(Math.max(0, Math.min(couponDiscount, subtotal)));

        // --- 3. REFERIDO (descuento topeado al 10% del subtotal) ---
        let referralDiscount = 0;
        if (referral && (referral.code || referral.ownerUid)) {
            const cap = subtotal * (REFERRAL_DISCOUNT_PERCENT / 100);
            referralDiscount = round2(Math.min(Math.max(0, Number(referral.discount) || cap), cap));
        }

        // --- 4. ENVÍO (del cliente, clampeado) ---
        const shippingCost = round2(Math.min(Math.max(0, Number(shipping_cost) || 0), 9_999_999));

        // --- 5. TOTAL AUTORITATIVO ---
        const total = round2(Math.max(0, subtotal - couponDiscount - referralDiscount + shippingCost));

        // --- 6. PERSISTIR SNAPSHOT VERIFICADO EN LA ORDEN ---
        const orderId = String(external_reference);
        await db.collection('orders').doc(orderId).set({
            items: verifiedItems,
            subtotal,
            couponDiscount,
            couponCode,
            referralDiscount,
            shippingCost,
            total,
            amountExpected: total,
            pricingVerifiedAt: Date.now()
        }, { merge: true });

        // --- 7. URLs estables (no depender de req.host) ---
        const siteBase = process.env.PUBLIC_SITE_URL || STATIC_ALLOWED_ORIGINS[0];
        const apiBase = process.env.MP_NOTIFICATION_BASE
            || (req.headers.host && !req.headers.host.includes('localhost') ? `https://${req.headers.host}` : 'https://tienda-boutique-elegancia.vercel.app');

        const preference = {
            items: mpItems,
            payer: {
                name: payer.name || '',
                surname: payer.surname || '',
                email: String(payer.email).slice(0, 120),
                phone: { area_code: '', number: String(payer.phone || '') },
                identification: { type: 'DNI', number: String(payer.dni || '') },
                address: { zip_code: String(payer.zip || ''), street_name: String(payer.street || ''), street_number: 0 }
            },
            external_reference: orderId,
            back_urls: {
                success: `${siteBase}/payment-status?status=success`,
                failure: `${siteBase}/payment-status?status=failure`,
                pending: `${siteBase}/payment-status?status=pending`
            },
            auto_return: 'approved',
            notification_url: `${apiBase}/api/mp-webhook`,
            shipments: { cost: shippingCost, mode: 'not_specified' }
        };

        const response = await mercadopago.preferences.create(preference);
        return res.status(200).json({
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point,
            id: response.body.id,
            verified_total: total
        });
    } catch (error) {
        console.error('MP Error:', error);
        return res.status(500).json({ error: error.message || 'Unknown error' });
    }
};
