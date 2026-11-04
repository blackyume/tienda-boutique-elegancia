// Consultas de las clientas (pedido del dueño, 3/11/2026).
//
// Reemplazan a WhatsApp y Telegram mientras esos canales estén apagados: la
// clienta deja su pregunta y su correo, queda guardada en `consultas` (Admin →
// Consultas) y le llega un aviso al correo de la tienda. Lo guardado manda: si
// el aviso falla, la consulta igual está en el panel.
//
// El correo es obligatorio para poder contestarle. Pasa a la lista de publicidad
// SOLO si tildó la casilla: la política de privacidad promete consentimiento
// explícito y la Ley 25.326 lo pide.
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { esCorreoValido, subscribeNewsletter } from './newsletter';

export const CORREO_DE_LA_TIENDA = 'laboutiquedelaeleganciaoficial@gmail.com';

const EVENTO_ABRIR = 'lbde:abrir-consulta';

/** Abre el chat de consultas desde cualquier pantalla, con la prenda si la hay. */
export const abrirConsulta = (producto = '') => {
    window.dispatchEvent(new CustomEvent(EVENTO_ABRIR, { detail: { producto } }));
};

export const alPedirConsulta = (fn) => {
    const oyente = (e) => fn(e.detail?.producto || '');
    window.addEventListener(EVENTO_ABRIR, oyente);
    return () => window.removeEventListener(EVENTO_ABRIR, oyente);
};

/** Lo que se guarda, recortado a los límites de firestore.rules. */
export const limpiarConsulta = ({ nombre = '', email = '', mensaje = '', producto = '', novedades = false, pagina = '' } = {}) => ({
    nombre: String(nombre).trim().slice(0, 80),
    email: String(email).trim().toLowerCase().slice(0, 256),
    mensaje: String(mensaje).trim().slice(0, 1500),
    producto: String(producto).trim().slice(0, 200),
    novedades: novedades === true,
    pagina: String(pagina).slice(0, 200),
});

export const consultaCompleta = (c) => Boolean(c.nombre && c.mensaje && esCorreoValido(c.email));

/** El cuerpo del aviso: lleva el correo a la vista porque hay que contestarle ahí. */
export const textoDelAviso = (c) => [
    `${c.nombre} dejó una consulta en la tienda:`,
    '',
    c.mensaje,
    '',
    c.producto ? `Prenda: ${c.producto}` : null,
    `Responder a: ${c.email}`,
    `Novedades y promociones: ${c.novedades ? 'sí, aceptó recibirlas' : 'no'}`,
].filter((l) => l !== null).join('\n');

// Usa la plantilla de los correos de pedido, la única que hay en EmailJS.
const mandarCorreo = async (params, siteConfig) => {
    const ej = siteConfig?.emailjs || {};
    if (!ej.serviceId || !ej.templateId || !ej.publicKey) throw new Error('EmailJS no configurado');
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: ej.serviceId,
            template_id: ej.templateId,
            user_id: ej.publicKey,
            template_params: params,
        }),
    });
    if (!res.ok) throw new Error(`EmailJS ${res.status}`);
};

const avisarALaTienda = (c, siteConfig, extra) => mandarCorreo({
    to_name: 'La Boutique',
    to_email: siteConfig?.contact?.email || CORREO_DE_LA_TIENDA,
    email: c.email, // la plantilla lo usa de Reply-To: Responder en Gmail le llega a ella
    email_type: 'consulta',
    subject: `Consulta de ${c.nombre}`,
    status_label: 'Consulta nueva',
    message: textoDelAviso(c),
    ...extra,
}, siteConfig);

/** Devuelve true si la consulta quedó guardada. */
export const enviarConsulta = async (datos, siteConfig) => {
    const c = limpiarConsulta(datos);
    if (!consultaCompleta(c)) return false;
    try {
        await addDoc(collection(db, 'consultas'), { ...c, estado: 'nueva', creada: serverTimestamp() });
    } catch (e) {
        console.warn('No se pudo guardar la consulta', e);
        return false;
    }
    if (c.novedades) await subscribeNewsletter(c.email, 'chat');
    await avisarALaTienda(c, siteConfig).catch((e) => console.warn('Aviso de consulta sin enviar', e));
    return true;
};

export const codigoDeArrepentimiento = (ahora = Date.now(), azar = Math.random()) =>
    `ARR-${ahora.toString(36).slice(-4)}${azar.toString(36).slice(2, 6).padEnd(4, '0')}`.toUpperCase();

export const textoDelArrepentimiento = ({ nombre, pedido, codigo }) => [
    `Recibimos tu pedido de arrepentimiento de la compra ${pedido}.`,
    '',
    `Tu código de trámite es ${codigo}. Guardalo: con él seguimos la gestión.`,
    '',
    `${nombre}, te vamos a escribir a este correo para coordinar la devolución. No tiene costo para vos.`,
].join('\n');

/**
 * Botón de Arrepentimiento (Res. 424/2020): la norma pide un código de trámite
 * dentro de las 24 h y por el mismo medio, así que se da en el momento. Va a
 * `consultas` para que la tienda lo vea junto a lo demás que hay que responder.
 * Devuelve { codigo, correo } o null si no se pudo guardar.
 */
export const enviarArrepentimiento = async ({ nombre, pedido, email }, siteConfig) => {
    const p = String(pedido || '').trim().slice(0, 40);
    const c = limpiarConsulta({ nombre, email, mensaje: `Quiere arrepentirse de la compra del pedido ${p}.` });
    if (!p || !consultaCompleta(c)) return null;
    const codigo = codigoDeArrepentimiento();
    try {
        await addDoc(collection(db, 'consultas'), { ...c, tipo: 'arrepentimiento', codigo, estado: 'nueva', creada: serverTimestamp() });
    } catch (e) {
        console.warn('No se pudo guardar el arrepentimiento', e);
        return null;
    }
    await avisarALaTienda(c, siteConfig, {
        subject: `Arrepentimiento ${codigo} · pedido ${p}`,
        status_label: 'Arrepentimiento',
        message: `${c.nombre} pidió arrepentirse de la compra del pedido ${p}.\n\nCódigo de trámite: ${codigo}\nResponder a: ${c.email}\n\nLa devolución la paga la tienda.`,
    }).catch((e) => console.warn('Aviso de arrepentimiento sin enviar', e));
    const correo = await mandarCorreo({
        to_name: c.nombre,
        to_email: c.email,
        email: siteConfig?.contact?.email || CORREO_DE_LA_TIENDA,
        order_id: p,
        email_type: 'arrepentimiento',
        subject: `Recibimos tu arrepentimiento · ${codigo}`,
        status_label: 'Arrepentimiento recibido',
        message: textoDelArrepentimiento({ nombre: c.nombre, pedido: p, codigo }),
    }, siteConfig).then(() => true, (e) => { console.warn('Código sin enviar', e); return false; });
    return { codigo, correo };
};
