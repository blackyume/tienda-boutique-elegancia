// Borra una imagen de Cloudinary. Solo admin (verifica el ID token de Firebase).
// La API Secret de Cloudinary vive SOLO acá (server-side), nunca en el navegador.
//
// Requiere env vars en Vercel:
//   FIREBASE_SERVICE_ACCOUNT  — JSON del service account (ya configurado)
//   CLOUDINARY_API_KEY        — API Key de tu cuenta Cloudinary
//   CLOUDINARY_API_SECRET     — API Secret de tu cuenta Cloudinary
const crypto = require('crypto');
const { admin } = require('./_firebaseAdmin');
const { checkRateLimit, getClientIp } = require('./_rateLimit');

const ADMIN_EMAILS = [
    'laboutiquedelaeleganciaoficial@gmail.com',
    'juampi218@gmail.com',
];

const STATIC_ALLOWED_ORIGINS = [
    'https://la-boutique-de-la-elegancia.web.app',
    'https://la-boutique-de-la-elegancia.firebaseapp.com',
    'https://tienda-boutique-elegancia.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
];

const applyCors = (req, res) => {
    const origin = req.headers.origin;
    if (origin && STATIC_ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async (req, res) => {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiKey || !apiSecret) {
        // Todavía no configurado: respondemos OK suave para no romper el borrado de producto.
        return res.status(200).json({ ok: false, configured: false });
    }

    // Rate limit
    const ip = getClientIp(req);
    const limit = await checkRateLimit(ip, { windowMs: 60_000, max: 30 });
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({ error: 'Too many requests' });
    }

    // Auth: verificar que es un admin logueado
    const { idToken, cloudName, publicId } = req.body || {};
    if (!idToken || !cloudName || !publicId) {
        return res.status(400).json({ error: 'Faltan datos (idToken, cloudName, publicId)' });
    }
    try {
        const decoded = await admin.auth().verifyIdToken(String(idToken));
        if (!ADMIN_EMAILS.includes((decoded.email || '').toLowerCase())) {
            return res.status(403).json({ error: 'No autorizado' });
        }
    } catch {
        return res.status(401).json({ error: 'Token inválido' });
    }

    // Firmar y llamar al destroy de Cloudinary
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(toSign).digest('hex');

        const form = new URLSearchParams();
        form.append('public_id', String(publicId));
        form.append('api_key', String(apiKey));
        form.append('timestamp', String(timestamp));
        form.append('signature', signature);

        const r = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString(),
        });
        const data = await r.json().catch(() => ({}));
        // Cloudinary devuelve { result: 'ok' } o { result: 'not found' }
        return res.status(200).json({ ok: data.result === 'ok', result: data.result || 'unknown' });
    } catch (err) {
        console.error('[cloudinary-delete] error:', err.message);
        return res.status(500).json({ error: 'Error al borrar la imagen' });
    }
};
