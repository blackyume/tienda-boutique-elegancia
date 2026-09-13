import { getTotalStock } from './variants';
import { normalizarTexto } from './importarInventario';
import { comisionDeProducto, costoUnitario, configPrecios, redondear } from './comision';

// Liquidación inteligente: lo que lleva más de N días sin venderse se
// propone con un descuento, nunca por debajo del costo (+ comisión de MP).
// Lau lo muestra, el dueño confirma, y recién ahí se toca el precio.

export const LIQUIDACION_DEFAULT = { dias: 45, descuento: 20 };
const DIA = 24 * 3600 * 1000;
const CANCELADOS = new Set(['cancelled', 'canceled', 'rejected', 'refunded', 'failure']);

export const configLiquidacion = (siteConfig) => {
    const c = siteConfig?.precios?.liquidacion || {};
    const dias = Number(c.dias);
    const descuento = Number(c.descuento);
    const desde = c.desde ? new Date(c.desde).getTime() : null;
    return {
        dias: dias > 0 ? Math.round(dias) : LIQUIDACION_DEFAULT.dias,
        descuento: descuento > 0 && descuento < 90 ? Math.round(descuento) : LIQUIDACION_DEFAULT.descuento,
        desde: desde && !Number.isNaN(desde) ? desde : null, // fecha de apertura: antes de eso no cuenta
    };
};

const fechaMs = (o) => { const t = new Date(o?.date || o?.createdAt || 0).getTime(); return Number.isNaN(t) ? 0 : t; };

/** Cuándo se vendió por última vez (ms), o null si nunca. Empareja por id o por nombre. */
export const ultimaVenta = (p, pedidos = []) => {
    const nombre = normalizarTexto(p.name);
    let ultimo = null;
    for (const o of pedidos) {
        if (CANCELADOS.has(o.status)) continue;
        const t = fechaMs(o);
        if (!t || (ultimo && t <= ultimo)) continue;
        const lo = (o.items || []).some((i) => String(i.id) === String(p.id) || (i.name && normalizarTexto(i.name) === nombre));
        if (lo) ultimo = t;
    }
    return ultimo;
};

/** Días que lleva sin venderse: desde la última venta, o desde que se cargó (o desde la apertura). */
export const diasSinVender = (p, pedidos = [], { desde = null, ahora = Date.now() } = {}) => {
    const cargado = Number(p.createdAt) || 0;
    const base = Math.max(cargado, ultimaVenta(p, pedidos) || 0, desde || 0);
    if (!base) return null;
    return Math.floor((ahora - base) / DIA);
};

/** El precio más bajo que no pierde plata: costo total cubierto después de MP. */
export const pisoDePrecio = (p, paymentConfig) => {
    const costo = costoUnitario(p);
    if (!(costo > 0)) return 0;
    const factor = 1 - comisionDeProducto(p, paymentConfig) / 100;
    return factor > 0 ? Math.ceil(costo / factor / 100) * 100 : 0;
};

/**
 * Qué liquidar y a cuánto. Un producto entra si está publicado, tiene stock,
 * no está ya en oferta y lleva más de `dias` sin venderse. El precio nuevo
 * es el actual menos el descuento, redondeado, pero nunca bajo el piso.
 */
export const candidatosLiquidacion = (inventario = [], pedidos = [], { siteConfig, paymentConfig, ahora = Date.now(), descuento } = {}) => {
    const cfg = configLiquidacion(siteConfig);
    const desc = descuento > 0 ? Number(descuento) : cfg.descuento;
    const { redondeo } = configPrecios(siteConfig);
    const out = [];
    for (const p of inventario) {
        if (p.active === false || getTotalStock(p) <= 0 || p.badges?.isOnSale) continue;
        const precio = Number(p.price) || 0;
        if (!(precio > 0)) continue;
        const dias = diasSinVender(p, pedidos, { desde: cfg.desde, ahora });
        if (dias == null || dias < cfg.dias) continue;
        const piso = pisoDePrecio(p, paymentConfig);
        let nuevo = redondear(precio * (1 - desc / 100), redondeo);
        if (nuevo > precio) nuevo = precio; // el redondeo hacia arriba no puede pasarse
        if (piso && nuevo < piso) nuevo = piso;
        if (nuevo >= precio) continue; // no hay lugar para bajar sin perder
        out.push({ producto: p, dias, precio, nuevo, piso, descuentoReal: Math.round((1 - nuevo / precio) * 100), stock: getTotalStock(p) });
    }
    return out.sort((a, b) => b.dias - a.dias);
};

export const resumirLiquidacion = (cands, cfg) => {
    const $ = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
    if (!cands.length) return `🏷️ Nada para liquidar: ningún producto publicado lleva más de ${cfg.dias} días sin venderse (o los que sí, ya están en oferta o no tienen margen para bajar).`;
    const L = [`🏷️ ${cands.length} ${cands.length === 1 ? 'producto lleva' : 'productos llevan'} más de ${cfg.dias} días sin venderse. Propongo −${cfg.descuento}% (nunca por debajo del costo + MP):`];
    for (const c of cands.slice(0, 15)) L.push(`• ${c.producto.name} (${c.dias} días, ${c.stock} en stock): ${$(c.precio)} → ${$(c.nuevo)} (−${c.descuentoReal}%)${c.nuevo === c.piso ? ' · tope: más abajo perdés plata' : ''}`);
    if (cands.length > 15) L.push(`… y ${cands.length - 15} más.`);
    L.push('Quedan como oferta con el precio anterior tachado. Si querés otro %, decime "liquidá con 30%".');
    return L.join('\n');
};

// "liquidación", "liquidá lo que no se vende", "qué no se está vendiendo".
export const esPedidoDeLiquidacion = (texto) => {
    const t = normalizarTexto(texto).replace(/[¿?¡!.,;:]+/g, ' ');
    return /\bliquid\w*/.test(t) || /\b(que|cual\w*)\b.*\b(no se vend\w*|no se esta\w* vend\w*|no esta\w* vend\w*|sin vender|no vend\w*|estancad\w*|clavad\w*)/.test(t);
};

/** "liquidá con 30%" → 30; si no dice %, null. */
export const descuentoPedido = (texto) => {
    const m = normalizarTexto(texto).match(/(\d{1,2})\s*(%|por ?ciento)/);
    const n = m ? Number(m[1]) : null;
    return n > 0 && n < 90 ? n : null;
};
