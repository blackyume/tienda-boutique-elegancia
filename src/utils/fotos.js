// Cambiar o sumar fotos a un producto que ya existe, desde el chat de Lau.
// Lógica pura: entender la frase y armar el parche del producto.
import { normalizarTexto } from './importarInventario';
import { buscarProductos } from './lauDirecto';

const HABLA_DE_FOTO = /\b(foto|fotos|imagen|imagenes|portada|galeria)\b/;
const AGREGAR = /\b(agreg|sum|anad|otra foto|una foto mas|mas fotos|tambien esta|a la galeria)/;
const CAMBIAR = /\b(cambi|reemplaz|actualiz|nueva|nuevo|mejor foto|pon[ée]?le?|usa|usá|sac[aá]|esta es la|es la foto|la foto es)/;

// Palabras del pedido que no forman parte del nombre del producto.
const RELLENO = new Set([
    'cambia', 'cambiale', 'cambiá', 'cambiar', 'reemplaza', 'reemplazale', 'reemplazar', 'actualiza', 'actualizale', 'actualizar',
    'agrega', 'agregale', 'agregar', 'suma', 'sumale', 'sumar', 'pone', 'ponele', 'poner', 'usa', 'usala', 'saca', 'sacale',
    'la', 'las', 'el', 'los', 'le', 'lo', 'de', 'del', 'al', 'a', 'por', 'con', 'en', 'y', 'que', 'ya', 'esta', 'este', 'esa', 'ese', 'estas',
    'foto', 'fotos', 'imagen', 'imagenes', 'portada', 'galeria', 'nueva', 'nuevo', 'nuevas', 'otra', 'otras', 'mas', 'mejor',
    'producto', 'prenda', 'publicado', 'publicada', 'quiero', 'queres', 'podes', 'porfa', 'porfas', 'por', 'favor', 'es', 'son', 'para', 'tambien',
]);

/**
 * Entiende "cambiá la foto del jean oxford" / "agregale esta foto al top rib".
 * Devuelve { modo: 'reemplazar' | 'agregar', productos: [...] } o null si la
 * frase no habla de fotos. `productos` puede venir vacío (no se entendió cuál)
 * o con varios (ambiguo): el chat pregunta.
 */
export const interpretarCambioDeFoto = (texto, inventario = []) => {
    const t = normalizarTexto(texto).replace(/[¿?¡!.,;:"'“”«»()]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t || !HABLA_DE_FOTO.test(t)) return null;
    if (!CAMBIAR.test(t) && !AGREGAR.test(t)) return null;
    const modo = AGREGAR.test(t) && !/\b(cambi|reemplaz)/.test(t) ? 'agregar' : 'reemplazar';
    const nombre = t.split(' ').filter((w) => !RELLENO.has(w)).join(' ').trim();
    const productos = nombre ? buscarProductos(inventario, nombre) : [];
    return { modo, nombre, productos };
};

const urlsDe = (p) => {
    const lista = Array.isArray(p?.images) && p.images.length ? p.images : (p?.image ? [p.image] : []);
    return lista.map((u) => String(u || '').trim()).filter(Boolean);
};

/**
 * Arma el parche de fotos de un producto. "reemplazar" pone las nuevas como
 * únicas fotos (los videos de la galería se conservan); "agregar" las suma al
 * final sin tocar la principal.
 */
export const patchDeFotos = (producto, urls = [], modo = 'reemplazar') => {
    const nuevas = [...new Set(urls.map((u) => String(u || '').trim()).filter(Boolean))];
    if (!nuevas.length) return null;
    const videos = (Array.isArray(producto?.media) ? producto.media : []).filter((m) => m && m.type === 'video' && m.url);
    const actuales = urlsDe(producto);
    const images = modo === 'agregar' ? [...new Set([...actuales, ...nuevas])] : nuevas;
    return {
        image: images[0],
        images,
        media: [...images.map((url) => ({ type: 'image', url })), ...videos],
    };
};
