import { normalizarTexto } from './importarInventario';
import { getTotalStock, hasVariantMap } from './variants';

// Respuestas directas de Lau, sin IA: el stock de un producto, cómo está el
// stock en general y qué se vendió hoy / ayer / esta semana / este mes. Se
// leen del inventario y los pedidos que ya están en pantalla (Firestore los
// actualiza en vivo), así que son instantáneas, exactas y funcionan aunque
// falte la llave de Gemini. Si el mensaje no es una de estas preguntas,
// `responderDirecto` devuelve null y la IA sigue como siempre.
//
// También arma los avisos en vivo: "se vendió tal cosa" y "tal producto se
// está agotando", que Lau muestra sola cuando cambian los datos.

const $ = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-AR')}`;
const plural = (n, uno, muchos) => (n === 1 ? uno : muchos);

const CANCELADOS = new Set(['cancelled', 'canceled', 'rejected', 'refunded', 'failure']);
const ESTADO = {
    approved: 'pagado', paid: 'pagado', pending: 'pendiente de pago', processing: 'en proceso',
    shipped: 'enviado', delivered: 'entregado', review: 'en revisión',
};

export const nombreCliente = (o) =>
    o?.customer?.name || [o?.customer?.nombre, o?.customer?.apellido].filter(Boolean).join(' ') || 'Cliente';

export const canalDePedido = (o) => o?.channel || (o?.manual ? o?.paymentMethod : '') || 'Tienda web';

const fechaDe = (o) => { const d = new Date(o?.date || o?.createdAt || 0); return Number.isNaN(d.getTime()) ? null : d; };
const hora = (d) => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
const diaCorto = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

const itemEnLinea = (i) => {
    const det = [i.size && `talle ${i.size}`, i.color].filter(Boolean).join(', ');
    return `${(Number(i.quantity) || 1) > 1 ? `${i.quantity}× ` : ''}${i.name}${det ? ` (${det})` : ''}`;
};

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------

/** Cada combinación talle/color con su stock, para los dos formatos de variantes. */
export const variantesDe = (p) => {
    if (!hasVariantMap(p)) return [];
    if (Array.isArray(p.variants)) return p.variants.map((v) => ({ size: v.size || '', color: v.color || '', stock: Number(v.stock) || 0 }));
    return Object.entries(p.variants).map(([k, n]) => { const [size = '', color = ''] = k.split('::'); return { size, color, stock: Number(n) || 0 }; });
};

const etiquetaVariante = (v) => [v.size && `talle ${v.size}`, v.color].filter(Boolean).join(' · ') || 'única';

/** Una ficha de stock para un producto: total y, si tiene, el detalle por talle/color. */
export const describirStock = (p, { umbral = 5, detalle = true } = {}) => {
    const total = getTotalStock(p);
    const vars = variantesDe(p);
    const estado = p.active === false ? ' · en borrador, no se ve en la tienda' : '';
    const precio = p.price != null && p.price !== '' ? ` · ${$(p.price)}` : '';
    let cab;
    if (total <= 0) cab = `⛔ ${p.name}: sin stock${precio}${estado}`;
    else cab = `${total <= umbral ? '⚠️' : '✅'} ${p.name}: ${total === 1 ? 'queda 1 unidad' : `quedan ${total} unidades`}${precio}${estado}`;
    if (!detalle || !vars.length) return cab;
    return [cab, ...vars.map((v) => `   ${v.stock > 0 ? '•' : '○'} ${etiquetaVariante(v)}: ${v.stock}`)].join('\n');
};

const raiz = (w) => (w.length > 4 && w.endsWith('es') ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);

/** Busca por nombre: exacto, contenido, y por palabras (todas, o la mayoría). */
export const buscarProductos = (inventario = [], termino) => {
    const t = normalizarTexto(termino);
    if (!t) return [];
    const exacto = inventario.filter((p) => normalizarTexto(p.name) === t);
    if (exacto.length) return exacto;
    const contiene = inventario.filter((p) => normalizarTexto(p.name).includes(t));
    if (contiene.length) return contiene;
    const palabras = t.split(' ').filter((w) => w.length > 1).map(raiz);
    if (!palabras.length) return [];
    const puntaje = (p) => {
        const nw = normalizarTexto(p.name).split(' ').map(raiz);
        return palabras.filter((w) => nw.some((n) => n.startsWith(w) || w.startsWith(n) && n.length > 2)).length;
    };
    const todas = inventario.filter((p) => puntaje(p) === palabras.length);
    if (todas.length) return todas;
    return inventario
        .map((p) => [p, puntaje(p)])
        .filter(([, s]) => s > 0 && s >= Math.ceil(palabras.length / 2))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([p]) => p);
};

/** Panorama general: cuántos productos, cuántas unidades, qué falta. */
export const resumenDeStock = (inventario = [], { umbral = 5 } = {}) => {
    const publicados = inventario.filter((p) => p.active !== false);
    const unidades = inventario.reduce((a, p) => a + getTotalStock(p), 0);
    const sin = publicados.filter((p) => getTotalStock(p) <= 0);
    const poco = publicados.filter((p) => { const s = getTotalStock(p); return s > 0 && s <= umbral; });
    const L = [`📦 Stock ahora: ${publicados.length} ${plural(publicados.length, 'producto publicado', 'productos publicados')}, ${unidades} ${plural(unidades, 'unidad', 'unidades')} en total.`];
    if (sin.length) L.push(`⛔ Sin stock (${sin.length}): ${sin.slice(0, 12).map((p) => p.name).join(', ')}${sin.length > 12 ? '…' : ''}.`);
    if (poco.length) L.push(`⚠️ Poco stock, ${umbral} o menos (${poco.length}): ${poco.slice(0, 12).map((p) => `${p.name} (${getTotalStock(p)})`).join(', ')}${poco.length > 12 ? '…' : ''}.`);
    if (!sin.length && !poco.length) L.push('✅ Nada agotado ni por agotarse.');
    L.push('Preguntame por uno: "¿cuánto queda del vestido negro?"');
    return L.join('\n');
};

// ---------------------------------------------------------------------------
// Ventas
// ---------------------------------------------------------------------------

const inicioDelDia = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

/** Pedidos válidos (no cancelados) dentro de un período. */
export const ventasDelPeriodo = (pedidos = [], periodo = 'hoy', ahora = new Date()) => {
    const validos = pedidos.filter((o) => !CANCELADOS.has(o.status) && fechaDe(o));
    const hoy0 = inicioDelDia(ahora);
    let desde, hasta = null, titulo;
    switch (periodo) {
        case 'ayer': { hasta = hoy0; desde = new Date(hoy0); desde.setDate(desde.getDate() - 1); titulo = `Ayer (${diaCorto(desde)})`; break; }
        case 'semana': { desde = new Date(hoy0); desde.setDate(desde.getDate() - 6); titulo = `Últimos 7 días (desde el ${diaCorto(desde)})`; break; }
        case 'mes': { desde = new Date(hoy0.getFullYear(), hoy0.getMonth(), 1); titulo = `Este mes (desde el ${diaCorto(desde)})`; break; }
        case 'ultimas': {
            const lista = [...validos].sort((a, b) => fechaDe(b) - fechaDe(a)).slice(0, 5);
            return { titulo: `Últimas ${lista.length} ventas`, lista, periodo };
        }
        default: { desde = hoy0; titulo = `Hoy (${diaCorto(hoy0)})`; }
    }
    const lista = validos
        .filter((o) => { const d = fechaDe(o); return d >= desde && (!hasta || d < hasta); })
        .sort((a, b) => fechaDe(b) - fechaDe(a));
    return { titulo, lista, periodo };
};

export const resumirVentas = (pedidos = [], periodo = 'hoy', ahora = new Date()) => {
    const { titulo, lista } = ventasDelPeriodo(pedidos, periodo, ahora);
    if (!lista.length) return `📊 ${titulo}: todavía ninguna venta.`;
    const total = lista.reduce((a, o) => a + (Number(o.total) || 0), 0);
    const prendas = lista.reduce((a, o) => a + (o.items || []).reduce((b, i) => b + (Number(i.quantity) || 1), 0), 0);
    const L = [`📊 ${titulo}: ${lista.length} ${plural(lista.length, 'venta', 'ventas')} por ${$(total)} · ${prendas} ${plural(prendas, 'prenda', 'prendas')}.`];
    const mostrar = lista.slice(0, 12);
    for (const o of mostrar) {
        const d = fechaDe(o);
        const cuando = periodo === 'hoy' ? hora(d) : `${diaCorto(d)} ${hora(d)}`;
        const estado = ESTADO[o.status] || o.status || '';
        L.push(`• ${cuando} — ${nombreCliente(o)} · ${$(o.total)} · ${canalDePedido(o)}${estado ? ` · ${estado}` : ''}`);
        const items = (o.items || []).map(itemEnLinea);
        if (items.length) L.push(`   ${items.slice(0, 4).join(', ')}${items.length > 4 ? ` y ${items.length - 4} más` : ''}`);
    }
    if (lista.length > mostrar.length) L.push(`… y ${lista.length - mostrar.length} más. El detalle completo está en Ventas.`);
    return L.join('\n');
};

// ---------------------------------------------------------------------------
// Avisos en vivo
// ---------------------------------------------------------------------------

/** Aviso de una venta que acaba de entrar, con lo que queda de cada prenda. */
export const avisoNuevaVenta = (o, inventario = [], { umbral = 5 } = {}) => {
    const estado = ESTADO[o.status] || '';
    const L = [`🛍️ ¡Venta nueva! ${nombreCliente(o)} · ${$(o.total)} · ${canalDePedido(o)}${estado ? ` · ${estado}` : ''}`];
    for (const i of o.items || []) {
        const p = inventario.find((x) => String(x.id) === String(i.id));
        let queda = '';
        if (p) {
            const s = getTotalStock(p);
            queda = s <= 0 ? ' → ⛔ se agotó' : ` → ${s <= umbral ? '⚠️ ' : ''}${s === 1 ? 'queda 1' : `quedan ${s}`}`;
        }
        L.push(`• ${itemEnLinea(i)}${queda}`);
    }
    if (o.status === 'approved' || o.status === 'paid') L.push('Cuando lo despaches, en Pedidos tenés "Copiar datos para MiCorreo".');
    return L.join('\n');
};

/**
 * Compara dos fotos del inventario y arma un aviso con lo que bajó de stock
 * (una venta, o un ajuste). Devuelve null si nada bajó.
 */
export const avisoCambiosDeStock = (antes = new Map(), inventario = [], { umbral = 5 } = {}) => {
    const cambios = [];
    for (const p of inventario) {
        const prev = antes.get(String(p.id));
        if (prev == null) continue;
        const ahora = getTotalStock(p);
        if (ahora < prev) cambios.push({ p, prev, ahora });
    }
    if (!cambios.length) return null;
    if (cambios.length > 6) return `📉 Bajó el stock de ${cambios.length} productos a la vez (${cambios.slice(0, 5).map((c) => c.p.name).join(', ')}…). Lo ves completo en Inventario.`;
    return cambios.map(({ p, prev, ahora }) => {
        if (ahora <= 0) return `⛔ ${p.name} se agotó (tenías ${prev}). Reponer o sacarlo de la tienda.`;
        return `📉 ${p.name}: ${prev} → ${ahora}${ahora <= umbral ? ' · ⚠️ queda poco' : ''}`;
    }).join('\n');
};

/** Foto del stock total por producto, para comparar después. */
export const fotoDeStock = (inventario = []) => new Map(inventario.map((p) => [String(p.id), getTotalStock(p)]));

/** Lo que entró desde una fecha (para "mientras no estabas"). */
export const ventasDesde = (pedidos = [], desdeIso) => {
    const desde = new Date(desdeIso || 0);
    if (Number.isNaN(desde.getTime())) return [];
    return pedidos
        .filter((o) => !CANCELADOS.has(o.status) && fechaDe(o) && fechaDe(o) > desde)
        .sort((a, b) => fechaDe(b) - fechaDe(a));
};

// ---------------------------------------------------------------------------
// ¿Qué me está preguntando?
// ---------------------------------------------------------------------------

// Verbos de acción: si aparecen, el mensaje es un pedido de cambio y va a la
// IA (que confirma antes de tocar nada). "vendí 2 jeans" también es acción.
const ACCION = /\b(sub[ií]\w*|baj[aá]\w*|pon[eé]\w*|poner|cambi\w*|actualiz\w*|sum[aá]\w*|rest[aá]\w*|descont\w*|agreg\w*|cre[aá]\w*|borr\w*|elimin\w*|public\w*|ocult\w*|edit\w*|modific\w*|carg[aá]\w*|registr\w*|anot\w*|gast[eé]\w*|marc[aá]\w*|envi[aá]\w*|despach\w*|mand[aá]\w*|arm[aá]\w*|gener[aá]\w*|escrib\w*|redact\w*)\b/;
const MENCIONA_STOCK = /\b(stock|qued[ao]n?|ked[ao]n?|unidades|disponibles?|agotad\w*|repon\w*|inventario)\b/;
// "stock de X", "cuánto queda de X", "hay X": el dueño nombró un producto a propósito.
const PIDE_PRODUCTO = /\b(stock|qued[ao]n?|ked[ao]n?|hay|ten[eé]s|tengo|tenemos) (de |del |de la |de los |de las |el |la |los |las )?\S/;
const PREGUNTA = /\b(cuant\w*|hay|ten[eé]s|tengo|tenemos|tiene|que|q|ke|cual\w*|como|dame|mostrame|decime|dime|ver)\b/;
const RESUMEN_STOCK = /\b(agotad\w*|sin stock|poco stock|bajo stock|falta stock|stock bajo|repon\w*|como (esta|anda|va|viene|estamos)( de| el| con)? ?(el )?stock|stock (general|total|de todo)|todo el stock|inventario)\b/;
// "vendo" / "vender" es de precios ("¿a cuánto vendo…?"), no de ventas hechas.
const VENTA = /\b(vend(i|io|ieron|imos|ido|ida|idos|idas|iste)|ventas?|pedidos?|compr(o|aron|as|a)|factur\w*|entr[oó]|cobr(e|amos|ado)|plata|recaud\w*)\b/;
const PREGUNTA_VENTA = /\b(cuant\w*|que|cuales?|como|hubo|ultim\w*|resumen|dame|mostrame|decime|dime|ver|hoy|ayer|semana|mes)\b/;
const RELLENO = new Set(['cuanto', 'cuanta', 'cuantos', 'cuantas', 'stock', 'queda', 'quedan', 'quedo', 'hay', 'tenes', 'tengo', 'tenemos', 'tiene', 'tienen', 'me', 'te', 'le', 'de', 'del', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'a', 'en', 'total', 'todavia', 'aun', 'producto', 'productos', 'prenda', 'prendas', 'articulo', 'articulos', 'decime', 'dime', 'dame', 'mostrame', 'ver', 'lau', 'hola', 'che', 'porfa', 'porfas', 'por', 'favor', 'ya', 'ahora', 'mismo', 'unidades', 'unidad', 'disponible', 'disponibles', 'sobre', 'y', 'que', 'q', 'ke', 'cual', 'cuales', 'es', 'esta', 'estan', 'para', 'con', 'talle', 'talles', 'color', 'colores', 'inventario', 'exactamente', 'realmente', 'tiempo', 'real', 'vivo', 'hoy', 'todo', 'toda', 'mi', 'mis', 'nuestro', 'nuestra', 'tienda', 'sabes', 'sabe', 'si', 'o', 'e']);

const limpiar = (texto) => normalizarTexto(texto).replace(/[¿?¡!.,;:"'“”«»()]+/g, ' ').replace(/\s+/g, ' ').trim();

const periodoDe = (t) => {
    if (/\bayer\b/.test(t)) return 'ayer';
    if (/\b(semana|7 dias|siete dias|semanal)\b/.test(t)) return 'semana';
    if (/\b(mes|mensual|30 dias)\b/.test(t)) return 'mes';
    if (/\bultim\w*\b/.test(t)) return 'ultimas';
    return 'hoy';
};

/**
 * Si el texto es una pregunta de stock o de ventas, devuelve la respuesta.
 * Si no (o si es un pedido de cambio), devuelve null y sigue la IA.
 */
export const responderDirecto = (texto, { inventario = [], pedidos = [], umbral = 5, ahora = new Date() } = {}) => {
    const t = limpiar(texto);
    if (!t || t.length > 140) return null;

    // Ventas: "¿cuánto vendí hoy?", "qué se vendió ayer", "últimas ventas".
    // Con números ("vendí 2 jeans") o con envíos ("qué tengo que enviar") va a la IA.
    if (VENTA.test(t) && PREGUNTA_VENTA.test(t) && !/\d/.test(t) && !/\b(enviar|envio|envios|despach\w*|pendientes? de|sin enviar|entregar)\b/.test(t)) {
        if (/\b(vend[ií]|vendimos)\b/.test(t) && !/\b(cuant\w*|que|hoy|ayer|semana|mes)\b/.test(t)) return null;
        return resumirVentas(pedidos, periodoDe(t), ahora);
    }

    if (ACCION.test(t)) return null;
    const menciona = MENCIONA_STOCK.test(t);
    if (!menciona && !PREGUNTA.test(t)) return null;
    const termino = t.split(' ').filter((w) => !RELLENO.has(w) && !MENCIONA_STOCK.test(w) && !/^(sin|poco|bajo|falta|general|anda|va|viene|estamos|hace|falt\w*)$/.test(w)).join(' ').trim();
    if (!termino) return menciona ? resumenDeStock(inventario, { umbral }) : null;
    if (menciona && RESUMEN_STOCK.test(t) && !PIDE_PRODUCTO.test(t)) return resumenDeStock(inventario, { umbral });

    const encontrados = buscarProductos(inventario, termino);
    if (!encontrados.length) {
        if (!menciona || !PIDE_PRODUCTO.test(t)) return null;
        return `No encontré ningún producto que se llame «${termino}» en el inventario. Probá con una parte del nombre tal como figura en Inventario, o preguntame "cómo está el stock" para ver todo.`;
    }
    if (encontrados.length === 1) return describirStock(encontrados[0], { umbral });
    if (encontrados.length <= 8) {
        return [`Hay ${encontrados.length} productos que coinciden con «${termino}»:`, ...encontrados.map((p) => describirStock(p, { umbral, detalle: false })), 'Si querés el detalle por talle y color, nombrá uno.'].join('\n');
    }
    return `Hay ${encontrados.length} productos que coinciden con «${termino}»: ${encontrados.slice(0, 10).map((p) => p.name).join(', ')}… ¿Cuál querés?`;
};
