// Presence tracking — registra sesiones activas en Firestore para métricas live.
// Cada cliente escribe `active_sessions/{sessionId}` con lastSeen cada 30s.
// Se considera activa una sesión cuyo lastSeen es < 60s.
//
// Además: incrementa un contador horario en `visit_stats_hourly/{YYYYMMDDHH}`
// una sola vez por sesión x hora (usa sessionStorage para dedupe).
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';

const SESSION_STORAGE_KEY = 'lbe_session_id';
const PING_INTERVAL_MS = 30_000;

const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
        id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
};

// Ignora carritos admin (no contamos a nosotros mismos como visitantes reales)
const ADMIN_EMAILS = new Set([
    'laboutiquedelaeleganciaoficial@gmail.com',
    'juampi218@gmail.com'
]);

export const startPresence = (user) => {
    if (typeof window === 'undefined') return () => { };
    if (user && ADMIN_EMAILS.has(user.email)) return () => { };

    const sessionId = getSessionId();
    if (!sessionId) return () => { };

    const ping = async () => {
        try {
            await setDoc(doc(db, 'active_sessions', sessionId), {
                lastSeen: serverTimestamp(),
                path: window.location.pathname,
                uid: user?.uid || null,
                userAgent: navigator.userAgent?.slice(0, 120) || null
            }, { merge: true });
        } catch { }

        // Contador horario — una sola vez por sesión x hora
        try {
            const now = new Date();
            const bucket = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}${String(now.getUTCHours()).padStart(2, '0')}`;
            const flagKey = `lbe_hour_counted_${bucket}`;
            if (!sessionStorage.getItem(flagKey)) {
                await setDoc(doc(db, 'visit_stats_hourly', bucket), {
                    count: increment(1),
                    hour: bucket,
                    ts: Date.now()
                }, { merge: true });
                sessionStorage.setItem(flagKey, '1');
            }
        } catch { }
    };

    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);

    const cleanup = () => {
        clearInterval(interval);
        // Intento best-effort de borrar la sesión al salir
        deleteDoc(doc(db, 'active_sessions', sessionId)).catch(() => { });
    };

    const onVisibility = () => {
        if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', cleanup);

    return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('beforeunload', cleanup);
        cleanup();
    };
};

// Filtra las sesiones frescas (<60s)
export const getLiveVisitors = (sessions) => {
    if (!Array.isArray(sessions)) return [];
    const cutoff = Date.now() - 60_000;
    return sessions.filter(s => {
        const ms = s.lastSeen?.toMillis?.() || 0;
        return ms > cutoff;
    });
};
