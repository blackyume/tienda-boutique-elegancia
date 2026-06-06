// Proxy de IA server-side. Su razón de ser: que el chat "Elegancia IA" (público,
// corre en el navegador del cliente) NO necesite las API keys client-side. Antes
// las keys vivían en config/ai_settings (Firestore público-read) y cualquiera las
// podía leer. Acá las keys viven SÓLO como env vars en Vercel y nunca se exponen.
//
// El cliente (utils/ai.js) llama primero a este endpoint; si no está configurado
// (faltan env vars) cae al método viejo, así nada se rompe durante la migración.
//
// Env vars (Vercel):
//   CEREBRAS_KEY            — key de Cerebras (motor principal). Acepta varias separadas por coma.
//   GEMINI_CUSTOMER_KEYS    — keys de Gemini para el chat del cliente (fallback).
//   GEMINI_ADMIN_KEYS       — keys de Gemini para uso admin (fallback).
const { checkRateLimit, getClientIp } = require('./_rateLimit');

const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_MODELS = ['qwen-3-235b-a22b-instruct-2507', 'zai-glm-4.7', 'gpt-oss-120b', 'llama3.1-8b'];
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-pro'];

const STATIC_ALLOWED_ORIGINS = [
    'https://la-boutique-de-la-elegancia.web.app',
    'https://la-boutique-de-la-elegancia.firebaseapp.com',
    'https://tienda-boutique-elegancia.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
];

const getAllowedOrigins = () => {
    const extra = (process.env.CORS_EXTRA_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    return [...STATIC_ALLOWED_ORIGINS, ...extra];
};

const applyCors = (req, res) => {
    const origin = req.headers.origin;
    if (origin && getAllowedOrigins().includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const parseKeys = (raw) => String(raw || '').split(/[,\n]+/).map(k => k.trim()).filter(Boolean);

const tryCerebras = async (prompt, keys) => {
    for (const key of keys) {
        for (const model of CEREBRAS_MODELS) {
            try {
                const res = await fetch(CEREBRAS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.6, max_tokens: 2500 }),
                });
                if (res.status === 401 || res.status === 403) break; // key inválida → próxima key
                if (!res.ok) continue;
                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text) return text;
            } catch { /* próximo modelo/key */ }
        }
    }
    return null;
};

const tryGemini = async (prompt, keys) => {
    for (const key of keys) {
        for (const model of GEMINI_MODELS) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    }
                );
                if (!res.ok) {
                    if (res.status === 400 || res.status === 403) break; // key inválida
                    continue;
                }
                const data = await res.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            } catch { /* próximo modelo/key */ }
        }
    }
    return null;
};

module.exports = async (req, res) => {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const cerebrasKeys = parseKeys(process.env.CEREBRAS_KEY);
    const customerKeys = parseKeys(process.env.GEMINI_CUSTOMER_KEYS);
    const adminKeys = parseKeys(process.env.GEMINI_ADMIN_KEYS);

    // Si no hay NINGUNA key configurada server-side, avisamos al cliente que use
    // el método viejo (fallback). 200 + configured:false para no romper nada.
    if (!cerebrasKeys.length && !customerKeys.length && !adminKeys.length) {
        return res.status(200).json({ configured: false });
    }

    const ip = getClientIp(req);
    const limit = await checkRateLimit(ip, { windowMs: 60_000, max: 20 });
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfterSec));
        return res.status(429).json({ error: 'Demasiadas consultas. Probá en un momento.' });
    }

    const { prompt, scope = 'customer' } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Falta prompt' });
    if (prompt.length > 12000) return res.status(400).json({ error: 'Prompt demasiado largo' });

    try {
        // Cerebras primero (igual que el cliente), Gemini de fallback.
        let text = cerebrasKeys.length ? await tryCerebras(prompt, cerebrasKeys) : null;
        if (!text) {
            const geminiKeys = scope === 'admin' ? adminKeys : customerKeys;
            if (geminiKeys.length) text = await tryGemini(prompt, geminiKeys);
        }
        if (!text) return res.status(502).json({ error: 'Sin respuesta de los proveedores de IA' });
        return res.status(200).json({ text });
    } catch (err) {
        console.error('[ai-proxy] error:', err);
        return res.status(500).json({ error: 'Error generando respuesta' });
    }
};
