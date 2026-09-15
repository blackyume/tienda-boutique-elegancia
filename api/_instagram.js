// Ayudas para publicar en Instagram, compartidas por el endpoint y el cron.

/**
 * Instagram sólo acepta JPEG público con proporción entre 4:5 y 1.91:1.
 * Las fotos de la tienda viven en Cloudinary, que las convierte al vuelo:
 * se piden en JPEG, recortadas a 4:5 (el formato de feed que más lugar ocupa)
 * y centradas en lo importante. Cualquier otra URL se manda tal cual.
 */
const imagenParaInstagram = (url) => {
    const s = String(url || '');
    if (!/res\.cloudinary\.com\/.+\/upload\//.test(s)) return s;
    const [antes, despues] = s.split('/upload/');
    // Si la URL ya trae transformaciones (letras seguidas de _ antes de la
    // versión o el nombre), se pisan por las de Instagram.
    const sinTransformaciones = despues.replace(/^(?:[a-z]{1,2}_[^/]+\/)+/, '');
    return `${antes}/upload/c_fill,ar_4:5,g_auto,f_jpg,q_auto:good,w_1080/${sinTransformaciones}`;
};

/** Huella corta de una llave, para saber de cuál salió la renovada sin guardarla entera. */
const firma = (token) => String(token || '').slice(-16);

const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Renueva la llave de Instagram antes de que venza. La llave que da Meta dura
 * 60 días y se puede renovar por otros 60 mientras tenga más de 24 h de vida.
 * La renovada se guarda en Firestore (doc secrets/instagram, que ninguna regla
 * deja leer desde el navegador) y api/instagram-post.js la prefiere sobre la
 * de Vercel. Así el dueño pega la llave UNA vez. Lo llama el cron diario.
 */
const renovarLlave = async (db) => {
    const inicial = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    if (!inicial) return { skipped: 'Instagram no configurado' };
    // Sólo el flujo "Instagram Login" (graph.instagram.com) renueva así; el de
    // Facebook usa llaves de página que no vencen.
    const host = process.env.INSTAGRAM_GRAPH_HOST || 'graph.instagram.com';
    if (host !== 'graph.instagram.com') return { skipped: 'Llave de página de Facebook: no vence' };

    const ref = db.collection('secrets').doc('instagram');
    const snap = await ref.get();
    const guardada = snap.exists ? snap.data() : null;
    // Si el dueño pegó una llave nueva en Vercel, la guardada (hija de la
    // vieja) se descarta y se arranca de la nueva.
    const hijaDeEsta = guardada?.desde === firma(inicial);
    const vigente = hijaDeEsta && guardada?.token && new Date(guardada.vence) > new Date() ? guardada : null;
    const token = vigente ? vigente.token : inicial;

    // Se renueva cuando faltan menos de 20 días; antes no hace falta.
    if (vigente && new Date(vigente.vence) - Date.now() > 20 * DIA_MS) {
        return { skipped: `Vence el ${vigente.vence.slice(0, 10)}, todavía no` };
    }

    const url = new URL(`https://${host}/refresh_access_token`);
    url.searchParams.set('grant_type', 'ig_refresh_token');
    url.searchParams.set('access_token', token);
    const r = await fetch(url);
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.access_token) {
        const msg = data.error?.message || `Instagram respondió ${r.status}`;
        return { error: msg, hint: 'Si la llave venció hay que generar una nueva en Meta y pegarla en Vercel.' };
    }

    const vence = new Date(Date.now() + (Number(data.expires_in) || 60 * 86400) * 1000).toISOString();
    await ref.set({ token: data.access_token, vence, renovada: new Date().toISOString(), desde: firma(inicial) });
    return { vence };
};

module.exports = { imagenParaInstagram, firma, renovarLlave };
