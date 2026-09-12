// Opciones de envío del checkout.
//
// Vienen de `config/shipping` en Firestore (se editan en Admin → Envíos). El
// checkout las lista tal cual, y mostraba lo que hubiera: en producción el doc
// quedó guardado con tres transportes de nombre vacío y costo 0, así que la
// clienta veía tres botones sin nombre, todos "Gratis", y cada venta con envío
// salía de la caja de la tienda. Acá una opción sin nombre o con costo que no
// es un número se descarta, y si no queda ninguna válida corren las de la
// casa.

// Tarifa MiCorreo de septiembre 2026 para 1 kg (lo que pesa una prenda),
// zona MÁS CARA (Patagonia sur: $10.586 a domicilio, $7.745 a sucursal), para
// que ningún destino deje en pérdida, más ~3% de embalaje. La clienta paga el
// envío: decisión del dueño (12/09/2026). El correo aumenta cada dos o tres
// meses: revisar contra el cotizador y ajustar desde Admin → Envíos.
export const TARIFAS_DE_LA_CASA = Object.freeze({
    correo_domicilio: {
        name: 'Correo Argentino a domicilio',
        cost: 10900,
        time: '3-7 días hábiles',
    },
    sucursal: {
        name: 'Correo Argentino · Retiro en sucursal',
        cost: 7900,
        time: '3-5 días hábiles',
        note: 'Lo enviamos a la sucursal de Correo Argentino más cercana a tu domicilio para que lo retires. Te avisamos cuál cuando lo despachamos.',
    },
});

// Lo que cobra el correo, sin margen, para tener el piso a mano.
export const COSTO_REAL_CORREO_1KG = Object.freeze({ domicilio: 10586, sucursal: 7745 });

// Una opción sirve si tiene nombre y un costo numérico no negativo. Costo 0
// SÍ vale (envío gratis a propósito), pero sólo con nombre: sin nombre no hay
// forma de que sea intencional.
export const esOpcionValida = (opcion) => {
    if (!opcion || typeof opcion !== 'object') return false;
    if (typeof opcion.name !== 'string' || !opcion.name.trim()) return false;
    const costo = Number(opcion.cost);
    return Number.isFinite(costo) && costo >= 0;
};

export const sanearTarifas = (crudo) => {
    if (!crudo || typeof crudo !== 'object') return TARIFAS_DE_LA_CASA;
    const validas = Object.fromEntries(
        Object.entries(crudo).filter(([, opcion]) => esOpcionValida(opcion))
    );
    return Object.keys(validas).length ? validas : TARIFAS_DE_LA_CASA;
};
