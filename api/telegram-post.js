// Publica un producto o promo al canal/grupo de Telegram configurado.
// Variables de entorno requeridas:
//   TELEGRAM_BOT_TOKEN  — token del bot (obtenido con @BotFather)
//   TELEGRAM_CHAT_ID    — id del canal/grupo (formato @canalpublico o -1001234567890)
// Opcional:
//   TELEGRAM_ADMIN_SECRET — si se setea, el cliente debe mandarlo en headers/body
//                            para evitar que terceros abusen del endpoint.
const { checkRateLimit, getClientIp } = require('./_rateLimit');

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
    const allowed = getAllowedOrigins();
    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');
};

const escapeMarkdown = (s) =>
    String(s || '').replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');

const buildProductCaption = ({ name, price, description, category, url }) => {
    const safePrice = typeof price === 'number'
        ? `$${Number(price).toLocaleString('es-AR')}`
        : price || '';
    const lines = [
        `✨ *${escapeMarkdown(name)}*`,
        category ? `_${escapeMarkdown(category)}_` : '',
        '',
        description ? escapeMarkdown(String(description).slice(0, 400)) : '',
        '',
        safePrice ? `💰 *${escapeMarkdown(safePrice)}*` : '',
        url ? `🛍 [Ver en la tienda](${url})` : ''
    ].filter(Boolean);
    return lines.join('\n');
};

module.exports = async (req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const ADMIN_SECRET = process.env.TELEGRAM_ADMIN_SECRET || '';

    if (!BOT_TOKEN || !CHAT_ID) {
        return res.status(500).json({
            error: 'Telegram no configurado. Falta TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en el servidor.'
        });
    }

    // Si el admin configuró un secret, exigirlo.
    if (ADMIN_SECRET) {
        const provided = req.headers['x-admin-secret'] || req.body?.secret || '';
        if (provided !== ADMIN_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    // Rate limit leve (10 req/min por IP) para evitar abuso.
    const ip = getClientIp(req);
    const limit = await checkRateLimit(ip, { windowMs: 60_000, max: 10 });
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({ error: 'Too many requests', retry_after_seconds: limit.retryAfterSec });
    }

    try {
        const { type, product, message, imageUrl } = req.body || {};

        let apiMethod;
        let payload;

        if (type === 'product' && product) {
            const caption = buildProductCaption(product);
            if (product.image) {
                apiMethod = 'sendPhoto';
                payload = {
                    chat_id: CHAT_ID,
                    photo: product.image,
                    caption,
                    parse_mode: 'MarkdownV2'
                };
            } else {
                apiMethod = 'sendMessage';
                payload = {
                    chat_id: CHAT_ID,
                    text: caption,
                    parse_mode: 'MarkdownV2',
                    disable_web_page_preview: false
                };
            }
        } else if (type === 'message' && message) {
            if (imageUrl) {
                apiMethod = 'sendPhoto';
                payload = {
                    chat_id: CHAT_ID,
                    photo: imageUrl,
                    caption: escapeMarkdown(String(message).slice(0, 1024)),
                    parse_mode: 'MarkdownV2'
                };
            } else {
                apiMethod = 'sendMessage';
                payload = {
                    chat_id: CHAT_ID,
                    text: escapeMarkdown(String(message).slice(0, 4096)),
                    parse_mode: 'MarkdownV2'
                };
            }
        } else {
            return res.status(400).json({ error: 'Payload inválido: esperado {type: "product"|"message", ...}' });
        }

        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${apiMethod}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const tgData = await tgRes.json();

        if (!tgRes.ok || !tgData.ok) {
            return res.status(502).json({
                error: tgData.description || `Telegram API ${tgRes.status}`,
                telegram_error_code: tgData.error_code || null
            });
        }

        return res.status(200).json({
            ok: true,
            message_id: tgData.result?.message_id,
            chat_id: tgData.result?.chat?.id
        });
    } catch (err) {
        console.error('[telegram] error:', err);
        return res.status(500).json({ error: err.message || 'Unknown error' });
    }
};
