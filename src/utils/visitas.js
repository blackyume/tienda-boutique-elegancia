// Registro de visitantes por día (pedido del dueño, 1/11/2026).
//
// `visit_stats_daily/{AAAA-MM-DD}` (día de Argentina, no UTC) lleva:
//   visitantes  — dispositivos distintos ese día (marca en localStorage)
//   visitas     — sesiones (marca en sessionStorage: volver a la tarde suma otra)
//   origen.*    — de dónde llegó el visitante: instagram, whatsapp, google…
//   dispositivo.* — celular o computadora
// Las visitas de la casa no llegan acá (ver visitasPropias.js).

const DIA = 86_400_000;

export const ORIGENES = {
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    google: 'Google',
    tiktok: 'TikTok',
    directo: 'Directo',
    otro: 'Otro sitio',
};

/** Día local AAAA-MM-DD. */
export const claveDiaLocal = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * De dónde vino la visita. Manda el `utm_source` de un enlace armado; después
 * el navegador interno de la app (Instagram y Facebook abren los enlaces
 * adentro y casi nunca mandan referrer); después el referrer.
 */
export const origenDeVisita = ({ referrer = '', search = '', userAgent = '', host = '' } = {}) => {
    const utm = (new URLSearchParams(search).get('utm_source') || '').toLowerCase();
    const buscar = (texto) => {
        if (/instagram|^ig$/.test(texto)) return 'instagram';
        if (/whatsapp|wa\.me|^wa$/.test(texto)) return 'whatsapp';
        if (/facebook|fb\.|^fb$|fbclid/.test(texto)) return 'facebook';
        if (/google\./.test(texto) || texto === 'google') return 'google';
        if (/tiktok/.test(texto)) return 'tiktok';
        return null;
    };
    if (utm) return buscar(utm) || 'otro';
    if (/Instagram/.test(userAgent)) return 'instagram';
    if (/FBAN|FBAV|FB_IAB/.test(userAgent)) return 'facebook';
    if (/WhatsApp/i.test(userAgent)) return 'whatsapp';
    let deDonde = '';
    try { deDonde = referrer ? new URL(referrer).hostname.toLowerCase() : ''; } catch { deDonde = ''; }
    if (!deDonde || (host && deDonde === host.toLowerCase())) return 'directo';
    return buscar(deDonde) || 'otro';
};

export const dispositivoDe = (userAgent = '') =>
    /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'celular' : 'computadora';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Una fila por día, del más nuevo al más viejo. Los días anteriores al
 * registro diario no tienen visitantes únicos: muestran las visitas que se
 * reconstruyen del conteo por hora (`aprox: true`).
 */
export const registroPorDia = (diarios = [], horarios = [], dias = 30, ahora = new Date()) => {
    const porDia = new Map(diarios.map(d => [d.id || d.fecha, d]));
    const horasPorDia = new Map();
    for (const v of horarios) {
        const id = String(v.id || v.hour || '');
        if (!/^\d{10}$/.test(id)) continue;
        const d = new Date(Date.UTC(+id.slice(0, 4), +id.slice(4, 6) - 1, +id.slice(6, 8), +id.slice(8, 10)));
        const k = claveDiaLocal(d);
        horasPorDia.set(k, (horasPorDia.get(k) || 0) + (Number(v.count) || 0));
    }
    const filas = [];
    for (let i = 0; i < dias; i++) {
        const d = new Date(ahora.getTime() - i * DIA);
        const k = claveDiaLocal(d);
        const reg = porDia.get(k);
        filas.push({
            fecha: k,
            etiqueta: `${DIAS_SEMANA[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
            visitantes: reg ? Number(reg.visitantes) || 0 : null,
            visitas: reg ? Number(reg.visitas) || 0 : (horasPorDia.get(k) || 0),
            aprox: !reg,
            origen: reg?.origen || {},
            dispositivo: reg?.dispositivo || {},
        });
    }
    return filas;
};

/** Totales de un conjunto de filas (sólo las que tienen registro diario suman visitantes). */
export const totalesDeVisitas = (filas = []) => {
    const t = { visitantes: 0, visitas: 0, origen: {}, dispositivo: {}, mejor: null };
    for (const f of filas) {
        t.visitas += f.visitas;
        if (f.visitantes != null) {
            t.visitantes += f.visitantes;
            if (!t.mejor || f.visitantes > t.mejor.visitantes) t.mejor = f;
        }
        for (const [k, n] of Object.entries(f.origen)) t.origen[k] = (t.origen[k] || 0) + (Number(n) || 0);
        for (const [k, n] of Object.entries(f.dispositivo)) t.dispositivo[k] = (t.dispositivo[k] || 0) + (Number(n) || 0);
    }
    return t;
};
