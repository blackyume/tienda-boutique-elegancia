// Rate limiter con fallback:
//   1. Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN están configurados,
//      usa sliding window en Redis (distribuido, escala entre instancias Vercel).
//   2. Sino, cae a un sliding window en memoria por instancia.
//
// API: checkRateLimit(ip, { windowMs, max }) -> { ok, retryAfterSec }

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 8;

// --- FALLBACK: in-memory sliding window ---
const memoryBuckets = new Map();

const checkMemory = (ip, windowMs, max) => {
    const now = Date.now();
    const bucket = memoryBuckets.get(ip) || [];
    const recent = bucket.filter((ts) => now - ts < windowMs);
    if (recent.length >= max) {
        const oldest = recent[0];
        const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
        return { ok: false, retryAfterSec };
    }
    recent.push(now);
    memoryBuckets.set(ip, recent);
    if (memoryBuckets.size > 1000) {
        for (const [key, arr] of memoryBuckets) {
            if (!arr.length || now - arr[arr.length - 1] > windowMs) {
                memoryBuckets.delete(key);
            }
        }
    }
    return { ok: true };
};

// --- UPSTASH: sliding window usando ZSET por IP ---
// Usa pipeline para ejecutar ZADD + ZREMRANGEBYSCORE + ZCARD + EXPIRE en una request.
const checkUpstash = async (ip, windowMs, max) => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const now = Date.now();
    const key = `rl:${ip}`;
    const cutoff = now - windowMs;

    try {
        const res = await fetch(`${url}/pipeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([
                ['ZREMRANGEBYSCORE', key, 0, cutoff],
                ['ZADD', key, now, `${now}-${Math.random().toString(36).slice(2, 8)}`],
                ['ZCARD', key],
                ['PEXPIRE', key, windowMs * 2]
            ])
        });
        if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
        const data = await res.json();
        // data es [{result: ...}, {result: ...}, {result: count}, {result: ...}]
        const count = Number(data?.[2]?.result ?? 0);
        if (count > max) {
            // Consultamos el miembro más antiguo para calcular retry-after
            const oldestRes = await fetch(`${url}/zrange/${encodeURIComponent(key)}/0/0/WITHSCORES`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json()).catch(() => null);
            const oldestScore = Number(oldestRes?.result?.[1] ?? now - windowMs);
            const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldestScore)) / 1000));
            return { ok: false, retryAfterSec };
        }
        return { ok: true };
    } catch (err) {
        // Si Upstash falla, no bloqueamos el servicio: caemos a memoria.
        console.warn('[rateLimit] Upstash error, fallback memory:', err?.message);
        return checkMemory(ip, windowMs, max);
    }
};

const hasUpstash = () =>
    !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const checkRateLimit = async (ip, opts = {}) => {
    const windowMs = Number(opts.windowMs) || DEFAULT_WINDOW_MS;
    const max = Number(opts.max) || DEFAULT_MAX;
    if (!ip) return { ok: true };
    if (hasUpstash()) return checkUpstash(ip, windowMs, max);
    return checkMemory(ip, windowMs, max);
};

const getClientIp = (req) => {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
    return req.socket?.remoteAddress || 'unknown';
};

module.exports = { checkRateLimit, getClientIp };
