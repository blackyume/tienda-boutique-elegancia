// Opciones de envío del checkout.
//
// Vienen de `config/shipping` en Firestore (se editan en Admin → Envíos). El
// checkout las lista tal cual, y mostraba lo que hubiera: en producción el doc
// quedó guardado con tres transportes de nombre vacío y costo 0, así que la
// clienta veía tres botones sin nombre, todos "Gratis", y cada venta con envío
// salía de la caja de la tienda. Acá una opción sin nombre o con costo que no
// es un número se descarta, y si no queda ninguna válida corren las de la
// casa.

// Decisión del dueño para el lanzamiento (12/09/2026): envío gratis a todo el
// país, y la tienda absorbe el correo. Una sola opción a propósito: si
// domicilio y sucursal son las dos gratis, la clienta elige domicilio igual y
// la segunda opción sólo suma una decisión más al checkout.
export const TARIFAS_DE_LA_CASA = Object.freeze({
    envio_gratis: {
        name: 'Envío gratis a todo el país',
        cost: 0,
        time: '3-7 días hábiles',
        note: 'Lo mandamos por Correo Argentino a tu domicilio, sin cargo. Te avisamos el número de seguimiento cuando lo despachamos.',
    },
});

// Lo que cuesta de verdad cada envío que la tienda regala. Tarifa MiCorreo de
// septiembre 2026 para 1 kg (una prenda), zona más cara (Patagonia sur). El
// día que se cobre, este es el piso para no perder; el correo aumenta cada
// dos o tres meses, así que revisar contra el cotizador.
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
