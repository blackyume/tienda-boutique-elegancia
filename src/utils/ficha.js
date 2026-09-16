// La ficha de un producto, completa: cuidados, medidas por talle, las
// viñetas de "Detalles" y la revisión antes de publicar. Lógica pura; la
// usan el paso a paso, el editor, Lau (con y sin IA) y el importador.
import { normalizarTexto } from './importarInventario';
import { buscarProductos } from './lauDirecto';

export const CUIDADOS = [
    { id: 'mano', label: 'Lavar a mano', icono: '🫧' },
    { id: 'suave', label: 'Lavarropas, ciclo suave', icono: '🌀' },
    { id: 'fria', label: 'Agua fría', icono: '❄️' },
    { id: 'seco', label: 'Lavado en seco', icono: '🧺' },
    { id: 'reves', label: 'Lavar del revés', icono: '🔄' },
    { id: 'sin-lavandina', label: 'Sin lavandina', icono: '🚫' },
    { id: 'sin-secadora', label: 'No usar secadora', icono: '🌬️' },
    { id: 'sombra', label: 'Secar a la sombra', icono: '⛱️' },
    { id: 'plancha-baja', label: 'Planchar a baja temperatura', icono: '♨️' },
    { id: 'sin-plancha', label: 'No planchar', icono: '🚫' },
];

const cuidadoPorTexto = (t) => {
    const n = normalizarTexto(t);
    const hit = CUIDADOS.find((c) => c.id === n || normalizarTexto(c.label) === n);
    if (hit) return hit.id;
    if (/\ba mano\b/.test(n)) return 'mano';
    if (/suave|delicado/.test(n)) return 'suave';
    if (/fria|frio/.test(n)) return 'fria';
    if (/en seco|tintoreria/.test(n)) return 'seco';
    if (/reves/.test(n)) return 'reves';
    if (/lavandina|cloro|blanqueador/.test(n)) return 'sin-lavandina';
    if (/secadora/.test(n)) return 'sin-secadora';
    if (/sombra/.test(n)) return 'sombra';
    if (/no planch|sin planch/.test(n)) return 'sin-plancha';
    if (/planch/.test(n)) return 'plancha-baja';
    return null;
};

/** Cualquier lista (ids, etiquetas o frases sueltas) → ids conocidos, sin repetir. */
export const normalizarCuidados = (lista) => {
    const arr = Array.isArray(lista) ? lista : String(lista || '').split(/[,;\n]/);
    return [...new Set(arr.map(cuidadoPorTexto).filter(Boolean))];
};

export const etiquetaCuidado = (id) => CUIDADOS.find((c) => c.id === id)?.label || id;

// ---------------------------------------------------------------------------
// Medidas por talle: { M: { busto: 92, largo: 88 } } en centímetros.
// ---------------------------------------------------------------------------
export const MEDIDAS = [
    ['busto', 'Busto'], ['cintura', 'Cintura'], ['cadera', 'Cadera'], ['largo', 'Largo'], ['manga', 'Manga'], ['tiro', 'Tiro'],
];

/** Filas para mostrar: sólo los talles con algún número y sólo las columnas usadas. */
export const tablaDeMedidas = (producto) => {
    const m = producto?.measurements;
    if (!m || typeof m !== 'object') return null;
    const filas = Object.entries(m)
        .map(([size, v]) => [size, Object.fromEntries(MEDIDAS.filter(([k]) => Number(v?.[k]) > 0).map(([k]) => [k, Number(v[k])]))])
        .filter(([, v]) => Object.keys(v).length);
    if (!filas.length) return null;
    const orden = Array.isArray(producto.sizes) && producto.sizes.length ? producto.sizes : filas.map(([s]) => s);
    filas.sort((a, b) => { const ia = orden.indexOf(a[0]), ib = orden.indexOf(b[0]); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    const columnas = MEDIDAS.filter(([k]) => filas.some(([, v]) => v[k] != null));
    return { columnas, filas };
};

const limpiar = (t) => normalizarTexto(t).replace(/[¿?¡!,;:"'“”«»()]+/g, ' ').replace(/\s+/g, ' ').trim();
const MIDE = /\b(mide|miden|medidas?)\b|\b(busto|cintura|cadera|largo|manga|tiro)\s*(?:de |es )?\d|\d\s*(?:cm)?\s*(?:de )?(busto|cintura|cadera|largo|manga|tiro)\b/;

/**
 * "el vestido lino talle M mide 92 de busto y 88 de largo" →
 * { productos, talle, medidas: { busto: 92, largo: 88 } }. null si no habla de medidas.
 */
export const interpretarMedidas = (texto, inventario = []) => {
    let t = limpiar(texto);
    if (!t || t.length > 160 || !MIDE.test(t) || /\b(cuant\w*|que|cual\w*)\b/.test(t)) return null;
    const medidas = {};
    for (const [k] of MEDIDAS) {
        const re = new RegExp(`(?:(?<![a-z\\d])(\\d{2,3})\\s*(?:cm)?\\s*(?:de )?${k}|${k}\\s*(?:de |es |:)?\\s*(\\d{2,3}))\\b`);
        const m = t.match(re);
        if (m) { medidas[k] = Number(m[1] || m[2]); t = t.replace(m[0], ' '); }
    }
    if (!Object.keys(medidas).length) return null;
    const talleM = t.match(/\btalle (\S+)/) || t.match(/\bt(\d{2})\b/) || t.match(/\bel (xs|s|m|l|xl|xxl|\d{2})\b/);
    const talle = talleM ? talleM[1].toUpperCase() : '';
    if (talleM) t = t.replace(talleM[0], ' ');
    t = t.replace(/\b(mide|miden|medidas?|tiene|de|el|la|los|las|un|una|y|cm|es|son|tiene|para|con|lau|hola|ponele|cargale|anota|anotale|agrega|agregale)\b/g, ' ').replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim();
    const productos = t ? buscarProductos(inventario, t) : [];
    return { nombre: t, productos, talle, medidas };
};

// ---------------------------------------------------------------------------
// "Detalles del producto": 3 a 5 viñetas cortas, sólo con datos reales.
// ---------------------------------------------------------------------------
const listar = (arr) => arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`;

export const detallesPorPlantilla = (p = {}) => {
    const L = [];
    if (p.material) L.push(`Composición: ${String(p.material).trim()}`);
    const colores = Array.isArray(p.colors) ? p.colors.filter(Boolean) : [];
    if (colores.length) L.push(colores.length === 1 ? `Color: ${colores[0]}` : `Disponible en ${listar(colores)}`);
    const talles = Array.isArray(p.sizes) ? p.sizes.filter(Boolean) : [];
    if (talles.length === 1) L.push(/unico/i.test(normalizarTexto(talles[0])) ? 'Talle único' : `Talle ${talles[0]}`);
    else if (talles.length > 1) L.push(`Talles: ${talles.join(', ')}`);
    const cuidados = normalizarCuidados(p.care || []);
    if (cuidados.length) L.push(`Cuidados: ${listar(cuidados.map(etiquetaCuidado)).toLowerCase()}`);
    if (tablaDeMedidas(p)) L.push('Medidas por talle en la guía de talles');
    return L.slice(0, 5).join('\n');
};

// ---------------------------------------------------------------------------
// Revisión antes de publicar: qué le falta a la ficha.
// ---------------------------------------------------------------------------
export const revisarFicha = (p = {}) => {
    const A = [];
    const fotos = (Array.isArray(p.media) ? p.media.filter((m) => m?.type === 'image') : []).length || (Array.isArray(p.images) ? p.images.length : 0) || (p.image ? 1 : 0);
    if (!fotos) A.push({ nivel: 'alto', texto: 'Sin foto: en la tienda se ve un cuadro vacío.' });
    if (!(Number(p.price) > 0)) A.push({ nivel: 'alto', texto: 'Sin precio.' });
    if (!String(p.name || '').trim()) A.push({ nivel: 'alto', texto: 'Sin nombre.' });
    if (!(Number(p.cost) > 0)) A.push({ nivel: 'medio', texto: 'Sin costo: no se puede calcular cuánto ganás con cada venta.' });
    if (!String(p.description || '').trim()) A.push({ nivel: 'medio', texto: 'Sin descripción: la ficha queda seca.' });
    if (!String(p.category || '').trim()) A.push({ nivel: 'medio', texto: 'Sin categoría: no aparece en los filtros de la tienda.' });
    const talles = Array.isArray(p.sizes) ? p.sizes.filter(Boolean) : [];
    if (!talles.length) A.push({ nivel: 'medio', texto: 'Sin talles: la clienta no puede elegir.' });
    const stock = p.variants && typeof p.variants === 'object' && !Array.isArray(p.variants)
        ? Object.values(p.variants).reduce((a, n) => a + (Number(n) || 0), 0)
        : Array.isArray(p.variants) ? p.variants.reduce((a, v) => a + (Number(v?.stock) || 0), 0) : Number(p.stock) || 0;
    if (!(stock > 0)) A.push({ nivel: 'medio', texto: 'Stock 0: se va a ver como agotado.' });
    if (fotos === 1) A.push({ nivel: 'bajo', texto: 'Una sola foto: con dos o tres se vende mejor.' });
    if (!String(p.material || '').trim()) A.push({ nivel: 'bajo', texto: 'Sin tela/composición.' });
    return A;
};

/** true si conviene dejarlo en borrador. */
export const mejorBorrador = (avisos) => avisos.some((a) => a.nivel === 'alto');
