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
