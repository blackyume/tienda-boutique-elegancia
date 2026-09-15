// Publica una foto con texto en la cuenta de Instagram de la tienda, o
// comprueba que la conexión funcione. Lo usa Lau ("publicá X en Instagram")
// y el botón de Instagram del inventario.
//
// Variables de entorno requeridas (en Vercel):
//   INSTAGRAM_ACCESS_TOKEN — la llave que da Meta for Developers (dura 60 días;
//                            el cron diario cleanup-orders la renueva sola y
//                            guarda la nueva en Firestore, doc secrets/instagram)
// Opcionales:
//   INSTAGRAM_USER_ID      — id de la cuenta profesional. Si falta se pregunta
//                            a la API con /me (sirve con "Instagram Login").
//   INSTAGRAM_GRAPH_HOST   — graph.instagram.com (default, Instagram Login) o
//                            graph.facebook.com (si la llave salió del flujo
//                            con página de Facebook).
//   INSTAGRAM_ADMIN_SECRET — si se setea, el panel debe mandarlo en el header
//                            X-Admin-Secret para que nadie más publique.
//
// La API de contenido funciona en dos pasos: primero se crea un "contenedor"
// con la foto y el texto, después se publica. La foto tiene que ser un JPEG
// público; las de Cloudinary se piden ya convertidas y recortadas a 4:5.
const { checkRateLimit, getClientIp, safeEqual } = require('./_rateLimit');
const { imagenParaInstagram, firma } = require('./_instagram');

const API_VERSION = 'v21.0';

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
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');
};

const graphHost = () => process.env.INSTAGRAM_GRAPH_HOST || 'graph.instagram.com';

/** La llave vigente: la renovada por el cron (Firestore) si existe, si no la de Vercel. */
const leerToken = async () => {
    try {
        const { getDb } = require('./_firebaseAdmin');
        const snap = await getDb().collection('secrets').doc('instagram').get();
        const guardada = snap.exists ? snap.data() : null;
        const hijaDeEsta = guardada?.desde === firma(process.env.INSTAGRAM_ACCESS_TOKEN);
        if (hijaDeEsta && guardada?.token && new Date(guardada.vence) > new Date()) return guardada.token;
    } catch {
        // Sin service account o sin doc: se usa la de Vercel.
    }
    return process.env.INSTAGRAM_ACCESS_TOKEN || '';
};

const graph = async (path, { method = 'GET', params = {}, token } = {}) => {
    const url = new URL(`https://${graphHost()}/${API_VERSION}/${path}`);
    const body = new URLSearchParams({ ...params, access_token: token });
    let res;
    if (method === 'GET') {
        body.forEach((v, k) => url.searchParams.set(k, v));
        res = await fetch(url);
    } else {
        res = await fetch(url, { method, body });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
        const e = data.error || {};
        const err = new Error(traducirError(e, res.status));
        err.code = e.code;
        err.status = res.status;
        throw err;
    }
    return data;
};

/** Los errores de Meta vienen en inglés y con códigos: se explican en criollo. */
const traducirError = (e, status) => {
    const msg = e.message || `Instagram respondió ${status}`;
    if (e.code === 190 || /access token/i.test(msg)) return 'La llave de Instagram venció o no sirve. Hay que generar una nueva en Meta for Developers y pegarla en Vercel (INSTAGRAM_ACCESS_TOKEN).';
    if (e.code === 4 || e.code === 9 || /rate limit|limit reached/i.test(msg)) return 'Instagram dice que se publicó demasiado seguido (permite 25 publicaciones por día). Probá más tarde.';
    if (/aspect ratio|image size|media type|Only photo/i.test(msg)) return `Instagram rechazó la foto: ${msg}. Tiene que ser JPEG, entre 4:5 y 1.91:1.`;
    if (/permission|scope/i.test(msg)) return 'La llave no tiene permiso para publicar (instagram_business_content_publish). Revisá los permisos al generarla.';
    return msg;
};

/** Id y usuario de la cuenta. Con INSTAGRAM_USER_ID fijo sirve para los dos flujos de Meta. */
const quienSoy = async (token) => {
    const fijo = process.env.INSTAGRAM_USER_ID;
    if (fijo) {
        const d = await graph(`${fijo}`, { params: { fields: 'username' }, token });
        return { userId: fijo, username: d.username };
    }
    const yo = await graph('me', { params: { fields: 'user_id,username' }, token });
    return { userId: yo.user_id || yo.id, username: yo.username };
};

const esperar = (ms) => new Promise(r => setTimeout(r, ms));

/** Crea el contenedor, espera a que Instagram procese la foto y publica. */
const publicar = async ({ igUserId, imageUrl, caption, token }) => {
    const cont = await graph(`${igUserId}/media`, { method: 'POST', params: { image_url: imageUrl, caption }, token });
    // La foto se procesa en segundo plano; se consulta hasta que esté lista.
    for (let i = 0; i < 10; i++) {
        const st = await graph(`${cont.id}`, { params: { fields: 'status_code,status' }, token });
        if (st.status_code === 'FINISHED') break;
        if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new Error(`Instagram no pudo procesar la foto${st.status ? ` (${st.status})` : ''}.`);
        await esperar(1500);
    }
    const pub = await graph(`${igUserId}/media_publish`, { method: 'POST', params: { creation_id: cont.id }, token });
    let permalink = null;
    try {
        permalink = (await graph(`${pub.id}`, { params: { fields: 'permalink' }, token })).permalink || null;
    } catch { /* el link es un lujo; la publicación ya salió */ }
    return { id: pub.id, permalink };
};

module.exports = async (req, res) => {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const ADMIN_SECRET = process.env.INSTAGRAM_ADMIN_SECRET || '';
    if (ADMIN_SECRET) {
        const provided = req.headers['x-admin-secret'] || req.body?.secret || '';
        if (!safeEqual(provided, ADMIN_SECRET)) return res.status(401).json({ error: 'Unauthorized' });
    }

    const ip = getClientIp(req);
    const limit = await checkRateLimit(ip, { windowMs: 60_000, max: 10 });
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({ error: 'Too many requests', retry_after_seconds: limit.retryAfterSec });
    }

    const token = await leerToken();
    if (!token) {
        return res.status(500).json({
            error: 'Instagram no está conectado todavía. Falta INSTAGRAM_ACCESS_TOKEN en Vercel (ver la guía "Publicar en Instagram con Lau").',
            configured: false
        });
    }

    try {
        const { type, caption, imageUrl } = req.body || {};

        // Quién soy: sirve de prueba de conexión y para saber el id de la cuenta.
        const yo = await quienSoy(token);
        const igUserId = yo.userId;

        if (type === 'check') {
            return res.status(200).json({ ok: true, username: yo.username, userId: igUserId });
        }

        if (type !== 'post' || !caption) {
            return res.status(400).json({ error: 'Payload inválido: esperado {type: "check"|"post", caption, imageUrl}' });
        }
        const texto = String(caption).slice(0, 2200);
        const foto = imageUrl;
        if (!foto) return res.status(400).json({ error: 'Instagram no acepta publicaciones sin foto.' });

        const out = await publicar({ igUserId, imageUrl: imagenParaInstagram(foto), caption: texto, token });
        return res.status(200).json({ ok: true, username: yo.username, ...out });
    } catch (err) {
        console.error('[instagram] error:', err);
        const status = err.status === 400 || err.code === 190 ? 502 : 500;
        return res.status(status).json({ error: err.message || 'Unknown error' });
    }
};
