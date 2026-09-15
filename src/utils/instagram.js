// Publicar en Instagram desde el panel: arma el texto de la publicación y
// habla con api/instagram-post.js. Lo usan Lau (post_instagram), el botón de
// Instagram del inventario y el "Probar conexión" de Configuración.
//
// Instagram no deja links en el texto: se pone la dirección de la tienda
// escrita y se invita al link de la bio.

const getApiBase = (siteConfig) => {
    const base = siteConfig?.mpApiUrl || siteConfig?.apiBaseUrl || '';
    if (base && typeof base === 'string') return base.replace(/\/api\/[^/]+$/, '/api');
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;
    return '/api';
};

const TIENDA = 'la-boutique-de-la-elegancia.web.app';
const LARGO_MAXIMO = 2200;

const formatMoney = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

/** #LaBoutiqueDeLaElegancia, #Rafaela y la categoría como hashtag. */
const hashtagsDe = (producto) => {
    const base = ['#LaBoutiqueDeLaElegancia', '#Rafaela', '#ModaFemenina'];
    const cat = String(producto?.category || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
    if (cat) base.push('#' + cat.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''));
    return base.join(' ');
};

/**
 * Texto de la publicación de un producto. `extra` es lo que el dueño le dijo
 * a Lau ("con este texto: ..."): va primero, y abajo el precio y los datos.
 */
export const captionDeProducto = (producto, { extra = '', storeUrl = TIENDA } = {}) => {
    const nombre = String(producto?.name || '').trim();
    const partes = [];
    if (extra && String(extra).trim()) partes.push(String(extra).trim());
    else {
        partes.push(`✨ ${nombre}`);
        const desc = String(producto?.description || '').replace(/\s+/g, ' ').trim();
        if (desc) partes.push(desc.length > 300 ? desc.slice(0, 297).replace(/\s+\S*$/, '') + '…' : desc);
    }
    const datos = [];
    if (Number(producto?.price) > 0) {
        datos.push(producto.originalPrice > producto.price
            ? `💰 ${formatMoney(producto.price)} (antes ${formatMoney(producto.originalPrice)})`
            : `💰 ${formatMoney(producto.price)}`);
    }
    const talles = Array.isArray(producto?.sizes) ? producto.sizes.filter(Boolean) : [];
    if (talles.length) datos.push(`📏 Talles: ${talles.join(' · ')}`);
    datos.push(`🛍️ Comprá en ${String(storeUrl).replace(/^https?:\/\//, '')} (link en la bio)`);
    partes.push(datos.join('\n'));
    partes.push(hashtagsDe(producto));
    return partes.join('\n\n').slice(0, LARGO_MAXIMO);
};

/** La foto que va a Instagram: la principal del producto. */
export const fotoDeProducto = (producto) =>
    producto?.image || (Array.isArray(producto?.images) ? producto.images[0] : '') || '';

const llamar = async (payload, siteConfig) => {
    const secret = siteConfig?.instagram?.secret || '';
    const res = await fetch(`${getApiBase(siteConfig)}/instagram-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-Admin-Secret': secret } : {}) },
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
};

/** Comprueba que la llave funcione. Devuelve { username, userId }. */
export const probarInstagram = (siteConfig) => llamar({ type: 'check' }, siteConfig);

/** Publica una foto con texto. Devuelve { id, permalink, username }. */
export const publicarEnInstagram = ({ caption, imageUrl }, siteConfig) =>
    llamar({ type: 'post', caption, imageUrl }, siteConfig);
