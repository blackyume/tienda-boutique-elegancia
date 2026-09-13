// La comisión que Mercado Pago le cobra a la tienda por cada venta. Es el
// dato que usan la calculadora de precios (Lau, el wizard, el editor) y los
// informes de ganancia.
//
// Prioridad: la comisión REAL medida de las ventas aprobadas (el webhook la
// guarda en config/payments.realMpFeePercent). Hasta que haya una venta, un
// estimado: en Argentina, "dinero disponible al instante" es 6,29 % + IVA
// (21 % sobre la comisión) ≈ 7,6 %. Mejor pasarse un poco que quedarse corto.
//
// OJO: `paymentConfig.mpFee` NO es esto. Es el recargo que paga la CLIENTA en
// el checkout si elige MP; no es lo que la tienda pierde por venta.

export const COMISION_MP_ESTIMADA = 7.6;

export const comisionMP = (paymentConfig) => {
    const real = Number(paymentConfig?.realMpFeePercent);
    return real > 0 ? real : COMISION_MP_ESTIMADA;
};

/** Comisión efectiva de un producto: la propia si la tiene, si no la de la tienda. */
export const comisionDeProducto = (producto, paymentConfig) => {
    const propia = Number(producto?.feePercent);
    return propia > 0 ? propia : comisionMP(paymentConfig);
};

/** Costo total de una unidad: prenda + envío del proveedor + packaging + fijo. */
export const costoUnitario = (p) =>
    (Number(p?.cost) || 0) + (Number(p?.shippingCost) || 0) + (Number(p?.packagingCost) || 0) + (Number(p?.fixedFee) || 0);

/**
 * Precio de venta para ganar `margen` % SOBRE el costo, limpio después de la
 * comisión de MP. Redondeado al múltiplo de 100 hacia arriba.
 *   precio = costo × (1 + margen/100) / (1 − comisión/100)
 */
export const precioConMargen = (costoTotal, margen, comision) => {
    const factor = 1 - (Number(comision) || 0) / 100;
    if (!(costoTotal > 0) || factor <= 0) return null;
    const precio = Math.ceil((costoTotal * (1 + (Number(margen) || 0) / 100) / factor) / 100) * 100;
    const comisionMonto = Math.round(precio * (Number(comision) || 0) / 100);
    return { precio, comisionMonto, neto: precio - costoTotal - comisionMonto };
};

/**
 * Comisión que se llevó (o se va a llevar) MP en un pedido. Si el webhook ya
 * guardó la real, esa; una venta por fuera (manual) no paga comisión; una de
 * la tienda todavía sin dato, el estimado.
 */
export const comisionDelPedido = (pedido, paymentConfig) => {
    if (pedido?.mpFeeAmount != null && pedido.mpFeeAmount !== '') return Number(pedido.mpFeeAmount) || 0;
    if (pedido?.manual) return 0;
    return (Number(pedido?.total) || 0) * comisionMP(paymentConfig) / 100;
};

// ---------------------------------------------------------------------------
// Precio automático: lo que el dueño configura una vez en Configuración →
// Precios, para que "me costó 24000" salga con precio sin preguntar nada.
// ---------------------------------------------------------------------------

export const PRECIOS_DEFAULT = {
    margen: 100,            // % de ganancia SOBRE el costo, limpio después de MP
    margenPorCategoria: {}, // { 'camperas': 90 } — nombre de categoría en minúsculas
    packaging: 0,           // $ por prenda (bolsa, etiqueta)
    flete: 0,               // $ por prenda (lo que cuesta traerla)
    redondeo: 100,          // 100 | 500 | 1000 | 99 (termina en 99)
};

const n0 = (v, def) => { const x = Number(v); return Number.isFinite(x) && v !== '' && v !== null ? x : def; };

export const configPrecios = (siteConfig) => {
    const c = siteConfig?.precios || {};
    const porCat = {};
    for (const [k, v] of Object.entries(c.margenPorCategoria || {})) { const m = Number(v); if (m > 0) porCat[String(k).trim().toLowerCase()] = m; }
    return {
        margen: n0(c.margen, PRECIOS_DEFAULT.margen),
        margenPorCategoria: porCat,
        packaging: Math.max(0, n0(c.packaging, 0)),
        flete: Math.max(0, n0(c.flete, 0)),
        redondeo: [100, 500, 1000, 99].includes(Number(c.redondeo)) ? Number(c.redondeo) : PRECIOS_DEFAULT.redondeo,
    };
};

export const margenPara = (categoria, cfg) => {
    const k = String(categoria || '').trim().toLowerCase();
    return (k && cfg.margenPorCategoria[k]) || cfg.margen;
};

/** 45.454 → 45.500 (100), 45.500 (500), 46.000 (1000) o 45.499 (99). Siempre para arriba. */
export const redondear = (precio, modo = 100) => {
    if (!(precio > 0)) return 0;
    if (modo === 99) return Math.ceil(precio / 100) * 100 - 1;
    const m = [100, 500, 1000].includes(modo) ? modo : 100;
    return Math.ceil(precio / m) * m;
};

/**
 * El precio para una prenda que costó `costo`, con los valores configurados
 * (o los que se pasen explícitos). Devuelve todo el desglose para mostrarlo.
 */
export const precioSugerido = (costo, { categoria, siteConfig, paymentConfig, margen, packaging, flete, comision } = {}) => {
    const cfg = configPrecios(siteConfig);
    const c = Number(costo) || 0;
    if (c <= 0) return null;
    const m = margen != null && margen !== '' ? Number(margen) : margenPara(categoria, cfg);
    const pack = packaging != null && packaging !== '' ? Number(packaging) || 0 : cfg.packaging;
    const fl = flete != null && flete !== '' ? Number(flete) || 0 : cfg.flete;
    const fee = comision != null && comision !== '' ? Number(comision) : comisionMP(paymentConfig);
    const costoTotal = c + pack + fl;
    const factor = 1 - fee / 100;
    if (factor <= 0) return null;
    const precio = redondear(costoTotal * (1 + m / 100) / factor, cfg.redondeo);
    const comisionMonto = Math.round(precio * fee / 100);
    return { precio, costo: c, packaging: pack, flete: fl, costoTotal, margen: m, comision: fee, comisionMonto, neto: precio - costoTotal - comisionMonto };
};

/** Texto del precio sugerido, para Lau. */
export const explicarPrecio = (r) => {
    if (!r) return 'Decime el costo de la prenda para calcular el precio.';
    const $ = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
    const extras = [r.packaging ? `packaging ${$(r.packaging)}` : '', r.flete ? `flete ${$(r.flete)}` : ''].filter(Boolean).join(' + ');
    return `Precio sugerido: ${$(r.precio)}. Costo ${$(r.costo)}${extras ? ` + ${extras} = ${$(r.costoTotal)}` : ''}, comisión MP ${r.comision}% = ${$(r.comisionMonto)}. Con tu margen del ${r.margen}% sobre el costo te quedan ${$(r.neto)} limpios por venta.`;
};

/** Margen real (% sobre el costo, después de MP) que deja un producto con su precio actual. */
export const margenActual = (p, paymentConfig) => {
    const costo = costoUnitario(p);
    const precio = Number(p?.price) || 0;
    if (!(costo > 0) || !(precio > 0)) return null;
    const neto = precio * (1 - comisionDeProducto(p, paymentConfig) / 100) - costo;
    return Math.round((neto / costo) * 100);
};

/**
 * Aviso cuando a un producto le subió el costo (o le bajó el precio) y ya no
 * llega al margen configurado. `antes` es un Map id → { cost, price }.
 */
export const avisoMargenBajo = (antes, inventario = [], { siteConfig, paymentConfig } = {}) => {
    const cfg = configPrecios(siteConfig);
    const $ = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
    const L = [];
    for (const p of inventario) {
        const prev = antes.get(String(p.id));
        if (!prev) continue;
        const cambioCosto = Number(p.cost) !== Number(prev.cost);
        const cambioPrecio = Number(p.price) !== Number(prev.price);
        if (!cambioCosto && !cambioPrecio) continue;
        const m = margenActual(p, paymentConfig);
        if (m == null) continue;
        const objetivo = margenPara(p.category, cfg);
        if (m >= objetivo - 10) continue;
        const sug = precioSugerido(p.cost, { categoria: p.category, siteConfig, paymentConfig });
        const que = cambioCosto ? `subió el costo (${$(prev.cost || 0)} → ${$(p.cost)})` : `bajó el precio (${$(prev.price || 0)} → ${$(p.price)})`;
        L.push(`📈 ${p.name}: ${que} y con el precio actual ganás ${m}% (tu margen es ${objetivo}%).${sug ? ` Para volver al margen, precio ${$(sug.precio)}: decime "ponele ${$(sug.precio)} al ${p.name}".` : ''}`);
    }
    return L.length ? L.join('\n') : null;
};

export const fotoDeCostos = (inventario = []) => new Map(inventario.map((p) => [String(p.id), { cost: Number(p.cost) || 0, price: Number(p.price) || 0 }]));
