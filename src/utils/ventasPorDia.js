// Las ventas día por día: qué pedidos cuentan como venta, el calendario del
// mes del Inicio y la tendencia diaria. Todo en hora local (Argentina), no en
// UTC: una venta a las 22:00 es de ese día, no del siguiente. Lógica pura.

const DIA = 86_400_000;

// Un pedido anulado, rechazado por Mercado Pago o devuelto no es una venta.
export const CANCELADOS = new Set(['cancelled', 'canceled', 'rejected', 'refunded', 'failure']);
export const esVenta = (o) => !!o && !CANCELADOS.has(String(o.status || '').toLowerCase());
export const soloVentas = (orders = []) => orders.filter(esVenta);

export const claveDia = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fechaDe = (o) => {
    const d = new Date(o?.date || o?.createdAt || 0);
    return Number.isNaN(d.getTime()) || d.getTime() === 0 ? null : d;
};

/** Plata corta para una celda chica: $48 mil, $1,2 M. */
export const plataCorta = (n) => {
    const v = Math.round(Number(n) || 0);
    if (v >= 1_000_000) return `$${(v / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`;
    if (v >= 1000) return `$${Math.round(v / 1000)} mil`;
    return `$${v}`;
};

/** { 'YYYY-MM-DD': { total, cantidad } } sólo con las ventas válidas. */
export const totalesPorDia = (orders = []) => {
    const m = new Map();
    for (const o of soloVentas(orders)) {
        const d = fechaDe(o);
        if (!d) continue;
        const k = claveDia(d);
        const cur = m.get(k) || { total: 0, cantidad: 0 };
        cur.total += Number(o.total) || 0;
        cur.cantidad += 1;
        m.set(k, cur);
    }
    return m;
};

const NOMBRE_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const NOMBRE_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * El calendario de un mes: semanas de lunes a domingo, cada día con su total y
 * cuántas ventas hubo, más el resumen (total, mejor día, comparación con el
 * mes anterior). `mes` va de 0 a 11.
 */
export const mesDeVentas = (orders = [], { anio, mes, hoy = new Date() } = {}) => {
    const h = hoy instanceof Date ? hoy : new Date(hoy);
    const a = Number.isInteger(anio) ? anio : h.getFullYear();
    const m = Number.isInteger(mes) ? mes : h.getMonth();
    const porDia = totalesPorDia(orders);
    const claveHoy = claveDia(h);
    const primero = new Date(a, m, 1);
    const dias = new Date(a, m + 1, 0).getDate();

    const celdas = [];
    // Lunes = 0 … domingo = 6.
    const relleno = (primero.getDay() + 6) % 7;
    for (let i = 0; i < relleno; i++) celdas.push(null);
    let total = 0, cantidad = 0, diasConVenta = 0, mejorDia = null, maximo = 0;
    for (let dia = 1; dia <= dias; dia++) {
        const d = new Date(a, m, dia);
        const clave = claveDia(d);
        const v = porDia.get(clave) || { total: 0, cantidad: 0 };
        total += v.total; cantidad += v.cantidad;
        if (v.cantidad) diasConVenta++;
        if (v.total > maximo) { maximo = v.total; mejorDia = { clave, dia, nombre: `${NOMBRE_DIA[d.getDay()]} ${dia}`, total: v.total, cantidad: v.cantidad }; }
        celdas.push({ dia, clave, total: v.total, cantidad: v.cantidad, esHoy: clave === claveHoy, futuro: clave > claveHoy });
    }
    while (celdas.length % 7) celdas.push(null);
    const semanas = [];
    for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));

    // Mes anterior completo, para la comparación.
    const antA = m === 0 ? a - 1 : a, antM = m === 0 ? 11 : m - 1;
    const antDias = new Date(antA, antM + 1, 0).getDate();
    let anterior = { total: 0, cantidad: 0 };
    for (let dia = 1; dia <= antDias; dia++) {
        const v = porDia.get(claveDia(new Date(antA, antM, dia)));
        if (v) { anterior.total += v.total; anterior.cantidad += v.cantidad; }
    }
    const variacion = anterior.total > 0 ? Math.round((total - anterior.total) / anterior.total * 100) : null;

    return {
        anio: a, mes: m,
        titulo: `${capitalizar(NOMBRE_MES[m])} ${a}`,
        nombreMes: NOMBRE_MES[m],
        esMesActual: a === h.getFullYear() && m === h.getMonth(),
        semanas, total, cantidad, diasConVenta, dias, maximo, mejorDia,
        promedioPorDiaConVenta: diasConVenta ? Math.round(total / diasConVenta) : 0,
        anterior: { ...anterior, nombreMes: NOMBRE_MES[antM], variacion },
    };
};

/** Un punto por día de los últimos `dias`, en hora local: para el gráfico de tendencia. */
export const tendenciaDiaria = (orders = [], dias = 30, hoy = new Date()) => {
    const porDia = totalesPorDia(orders);
    const h = hoy instanceof Date ? hoy : new Date(hoy);
    const out = [];
    for (let i = dias - 1; i >= 0; i--) {
        const d = new Date(h.getTime() - i * DIA);
        const k = claveDia(d);
        const v = porDia.get(k) || { total: 0, cantidad: 0 };
        out.push({ fecha: k, label: `${k.slice(8, 10)}/${k.slice(5, 7)}`, ventas: v.total, pedidos: v.cantidad });
    }
    return out;
};
