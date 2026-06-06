// Envía una notificación push a todos los suscriptores (o un subset por uid).
// Solo admin puede invocar — exige header X-Admin-Secret.
//
// Requiere env vars:
//   FIREBASE_SERVICE_ACCOUNT  — JSON del service account
//   PUSH_ADMIN_SECRET         — string secreto compartido con Admin
const { admin, getDb } = require('./_firebaseAdmin');
const { checkRateLimit, getClientIp, safeEqual } = require('./_rateLimit');

const STATIC_ALLOWED_ORIGINS = [
    'https://la-boutique-de-la-elegancia.web.app',
    'https://la-boutique-de-la-elegancia.firebaseapp.com',
    'https://tienda-boutique-elegancia.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173'
];

const applyCors = (req, res) => {
    const origin = req.headers.origin;
    if (origin && STATIC_ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');
};

module.exports = async (req, res) => {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const expected = process.env.PUSH_ADMIN_SECRET;
    const provided = req.headers['x-admin-secret'] || req.body?.secret || '';
    if (!expected || !safeEqual(provided, expected)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const ip = getClientIp(req);
    const limit = await checkRateLimit(ip, { windowMs: 60_000, max: 5 });
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({ error: 'Too many requests' });
    }

    try {
        const { title, body, url, uidFilter } = req.body || {};
        if (!title || !body) return res.status(400).json({ error: 'Faltan title o body' });

        const db = getDb();
        const subsSnap = await db.collection('push_subscriptions')
            .where('active', '==', true)
            .get();

        const tokens = [];
        for (const d of subsSnap.docs) {
            const s = d.data();
            if (uidFilter && s.uid !== uidFilter) continue;
            if (s.token) tokens.push(s.token);
        }

        if (tokens.length === 0) return res.status(200).json({ sent: 0, message: 'Sin suscriptores activos' });

        // FCM sendEach en batches de 500 (límite de la API)
        const messaging = admin.messaging();
        const message = {
            notification: { title, body },
            data: {
                url: String(url || '/'),
                click_action: String(url || '/')
            },
            webpush: {
                fcmOptions: { link: String(url || '/') },
                notification: {
                    icon: '/assets/logo-seal.png',
                    badge: '/assets/logo-seal.png'
                }
            }
        };

        let success = 0;
        let failure = 0;
        const invalidTokens = [];
        for (let i = 0; i < tokens.length; i += 500) {
            const batch = tokens.slice(i, i + 500);
            const resp = await messaging.sendEachForMulticast({ tokens: batch, ...message });
            resp.responses.forEach((r, idx) => {
                if (r.success) {
                    success++;
                } else {
                    failure++;
                    const code = r.error?.code || '';
                    if (code.includes('registration-token-not-registered') || code.includes('invalid-registration-token')) {
                        invalidTokens.push(batch[idx]);
                    }
                }
            });
        }

        // Desactivar tokens inválidos
        for (const bad of invalidTokens) {
            await db.collection('push_subscriptions').doc(bad).update({ active: false }).catch(() => { });
        }

        return res.status(200).json({ sent: success, failed: failure, cleaned: invalidTokens.length });
    } catch (err) {
        console.error('[send-push] error:', err);
        return res.status(500).json({ error: err.message });
    }
};
