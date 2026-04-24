const mercadopago = require('mercadopago');

// --- Rate limiter en memoria (sliding window por IP) ---
// Notas: en Vercel cada instancia tiene su propia memoria. Suficiente para
// frenar abuso básico; para producción seria sustituir por Upstash / Redis.
const RATE_WINDOW_MS = 60_000; // 1 min
const RATE_MAX_REQUESTS = 8;   // 8 requests por minuto por IP
const rateBuckets = new Map();

const getClientIp = (req) => {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
    return req.socket?.remoteAddress || 'unknown';
};

const checkRateLimit = (ip) => {
    const now = Date.now();
    const bucket = rateBuckets.get(ip) || [];
    const recent = bucket.filter((ts) => now - ts < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX_REQUESTS) {
        const oldest = recent[0];
        const retryAfterSec = Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - oldest)) / 1000));
        return { ok: false, retryAfterSec };
    }
    recent.push(now);
    rateBuckets.set(ip, recent);
    // Limpieza ocasional para no crecer indefinidamente.
    if (rateBuckets.size > 1000) {
        for (const [key, arr] of rateBuckets) {
            if (!arr.length || now - arr[arr.length - 1] > RATE_WINDOW_MS) {
                rateBuckets.delete(key);
            }
        }
    }
    return { ok: true };
};

// Dominios permitidos (producción + desarrollo local).
// Se puede extender vía variable de entorno CORS_EXTRA_ORIGINS (separados por coma).
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
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    return [...STATIC_ALLOWED_ORIGINS, ...extra];
};

const applyCors = (req, res) => {
    const origin = req.headers.origin;
    const allowed = getAllowedOrigins();
    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
};

module.exports = async (req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = getClientIp(req);
    const limit = checkRateLimit(ip);
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({
            error: 'Too many requests. Try again later.',
            retry_after_seconds: limit.retryAfterSec
        });
    }

    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
        return res.status(500).json({ error: 'Server config error: Missing MP_ACCESS_TOKEN' });
    }

    mercadopago.configure({ access_token: ACCESS_TOKEN });

    try {
        const { items, payer, shipping_cost, external_reference } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty items' });
        }
        if (!payer || !payer.email) {
            return res.status(400).json({ error: 'Missing payer data' });
        }

        const sanitizedItems = items.map(item => {
            const price = Number(item.unit_price);
            const qty = Number(item.quantity);
            if (!item.title || !isFinite(price) || price < 0 || !isFinite(qty) || qty <= 0) {
                throw new Error('Invalid item payload');
            }
            return {
                title: String(item.title).slice(0, 240),
                unit_price: Math.round(price * 100) / 100,
                quantity: Math.floor(qty),
                currency_id: 'ARS'
            };
        });

        const shippingCost = Math.max(0, Number(shipping_cost) || 0);
        const baseUrl = STATIC_ALLOWED_ORIGINS[0];

        const preference = {
            items: sanitizedItems,
            payer: {
                name: payer.name || '',
                surname: payer.surname || '',
                email: String(payer.email).slice(0, 120),
                phone: { area_code: '', number: String(payer.phone || '') },
                identification: { type: 'DNI', number: String(payer.dni || '') },
                address: {
                    zip_code: String(payer.zip || ''),
                    street_name: String(payer.street || ''),
                    street_number: 0
                }
            },
            external_reference: String(external_reference || Date.now()),
            back_urls: {
                success: `${baseUrl}/payment-status?status=success`,
                failure: `${baseUrl}/payment-status?status=failure`,
                pending: `${baseUrl}/payment-status?status=pending`
            },
            auto_return: 'approved',
            shipments: { cost: shippingCost, mode: 'not_specified' }
        };

        const response = await mercadopago.preferences.create(preference);

        return res.status(200).json({
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point,
            id: response.body.id
        });
    } catch (error) {
        console.error('MP Error:', error);
        return res.status(500).json({ error: error.message || 'Unknown error' });
    }
};
