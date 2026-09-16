// Los gastos del negocio: qué categorías hay, cómo se suman por período y por
// rubro, y cómo se entienden por chat sin IA ("gasté 20000 en publicidad").
// El costo de la mercadería NO va acá cuando cada prenda tiene su costo
// cargado: ya se descuenta venta por venta. Acá va lo general (publicidad,
// bolsas, envíos que pagás vos, servicios).
import { normalizarTexto } from './importarInventario';

export const CATEGORIAS_GASTO = [
    { value: 'mercaderia', label: 'Mercadería', hint: 'Sólo si la prenda NO tiene costo cargado: si lo tiene, se contaría dos veces.' },
    { value: 'packaging', label: 'Packaging', hint: 'Bolsas, etiquetas, cajas, papel.' },
    { value: 'publicidad', label: 'Publicidad', hint: 'Instagram, Facebook, sorteos, influencers.' },
    { value: 'envios', label: 'Envíos', hint: 'Los que pagás vos (no los que cobra el checkout).' },
    { value: 'servicios', label: 'Servicios', hint: 'Internet, luz, alquiler, contador, monotributo.' },
    { value: 'otros', label: 'Otros', hint: '' },
];

export const etiquetaDeCategoria = (value) => CATEGORIAS_GASTO.find((c) => c.value === value)?.label || value || 'Otros';

/** Los gastos de los últimos `dias` días ('all' = todos, 'hoy' = hoy). */
export const gastosDelPeriodo = (gastos = [], periodo = '30', ahora = new Date()) => {
    if (periodo === 'all') return gastos;
    if (periodo === 'hoy') { const d = ahora.toDateString(); return gastos.filter((g) => new Date(Number(g.date) || 0).toDateString() === d); }
    const corte = ahora.getTime() - (parseInt(periodo, 10) || 30) * 864e5;
    return gastos.filter((g) => (Number(g.date) || 0) >= corte);
};

export const totalGastos = (gastos = []) => gastos.reduce((a, g) => a + (Number(g.amount) || 0), 0);

/** [{ categoria, label, total, n }] de mayor a menor. */
export const gastosPorCategoria = (gastos = []) => {
    const m = new Map();
    for (const g of gastos) {
        const k = g.category || 'otros';
        const e = m.get(k) || { categoria: k, label: etiquetaDeCategoria(k), total: 0, n: 0 };
        e.total += Number(g.amount) || 0; e.n += 1; m.set(k, e);
    }
    return [...m.values()].sort((a, b) => b.total - a.total);
};

// ---------------------------------------------------------------------------
// Por chat, sin IA.
// ---------------------------------------------------------------------------

const limpiar = (t) => normalizarTexto(t).replace(/[¿?¡!,;:"'“”«»()]+/g, ' ').replace(/\s+/g, ' ').trim();
const GASTE = /\b(gaste|gastamos|pague|pagamos|inverti|invertimos|se me fue|se fue|puse)\b/;
const PREGUNTA_GASTOS = /\b(cuanto|que|cuales|cuantos|lista|listame|mostrame|dame|ver)\b/;
const HABLA_DE_GASTOS = /\b(gast\w*|gasto|gastos|pagu\w*|inverti\w*)\b/;

const RUBROS = [
    ['publicidad', /\b(publicidad|anuncio\w*|ads|instagram|insta|facebook|meta|sorteo\w*|influencer\w*|promocion\w*|campana)\b/],
    ['packaging', /\b(packaging|bolsa\w*|etiqueta\w*|caja\w*|papel|cinta\w*|embalaje|empaque|tarjetita\w*)\b/],
    ['envios', /\b(envio\w*|correo|flete\w*|moto|mensajeria|cadete\w*|andreani|oca|micorreo)\b/],
    ['servicios', /\b(internet|luz|gas|agua|alquiler|contador\w*|monotributo|impuesto\w*|celular|telefono|hosting|dominio|servicio\w*|afip|arca)\b/],
    ['mercaderia', /\b(mercaderia|tela\w*|prenda\w*|ropa|proveedor\w*|stock|hilo\w*|botones|cierre\w*|insumo\w*)\b/],
];

const RELLENO = new Set(['gaste', 'gastamos', 'pague', 'pagamos', 'inverti', 'invertimos', 'puse', 'se', 'me', 'fue', 'en', 'de', 'del', 'por', 'para', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'pesos', 'plata', 'hoy', 'ayer', 'anteayer', 'recien', 'ahora', 'lau', 'hola', 'che', 'porfa', 'porfas', 'total', 'gasto', 'gastos', 'unas', 'y', 'a', 'al', 'con', 'que', 'lo']);

const montoDe = (t) => {
    const ms = [...t.matchAll(/\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?\b/g)].map((m) => ({ n: Number(m[1].replace(/\./g, '')), raw: m[0] }));
    const grande = ms.filter((x) => x.n >= 100);
    return grande.length ? grande[grande.length - 1] : null;
};

/**
 * "gasté 20000 en publicidad", "pagué 8000 de bolsas ayer", "invertí 15.000 en
 * un sorteo de instagram" → { amount, concept, category, date }. null si no
 * es un gasto (o si `esProducto(concepto)` dice que eso es una prenda del
 * inventario: eso es un costo, no un gasto).
 */
export const interpretarGasto = (texto, { esProducto, ahora = new Date() } = {}) => {
    const t = limpiar(texto);
    if (!t || t.length > 140 || !GASTE.test(t) || PREGUNTA_GASTOS.test(t)) return null;
    const monto = montoDe(t);
    if (!monto) return null;
    let resto = t.replace(monto.raw, ' ');
    let date = ahora.getTime();
    if (/\banteayer\b/.test(resto)) date -= 2 * 864e5;
    else if (/\bayer\b/.test(resto)) date -= 864e5;
    const dia = resto.match(/\bel (\d{1,2})(?:\/(\d{1,2}))?\b/);
    if (dia) {
        const d = new Date(ahora); d.setDate(Number(dia[1])); if (dia[2]) d.setMonth(Number(dia[2]) - 1);
        if (d.getTime() > ahora.getTime()) d.setMonth(d.getMonth() - 1);
        date = d.getTime(); resto = resto.replace(dia[0], ' ');
    }
    const category = (RUBROS.find(([, re]) => re.test(resto)) || ['otros'])[0];
    const concept = resto.split(' ').filter((w) => w && !RELLENO.has(w) && !/^\$?\d/.test(w)).join(' ').trim();
    if (!concept) return null;
    if (typeof esProducto === 'function' && esProducto(concept)) return null;
    return { amount: monto.n, concept: concept.charAt(0).toUpperCase() + concept.slice(1), category, date };
};

/** "¿cuánto gasté este mes?", "gastos de la semana", "qué gastos tengo" → texto, o null. */
export const responderGastos = (texto, gastos = [], ahora = new Date()) => {
    const t = limpiar(texto);
    if (!t || t.length > 120 || !HABLA_DE_GASTOS.test(t) || GASTE.test(t) && !PREGUNTA_GASTOS.test(t)) return null;
    if (!PREGUNTA_GASTOS.test(t) && !/\b(gastos)\b/.test(t)) return null;
    const periodo = /\bhoy\b/.test(t) ? 'hoy' : /\bsemana\b/.test(t) ? '7' : /\b(todo|historico|siempre)\b/.test(t) ? 'all' : '30';
    const lista = gastosDelPeriodo(gastos, periodo, ahora);
    const nombre = { hoy: 'hoy', 7: 'esta semana', 30: 'este mes (30 días)', all: 'en total' }[periodo];
    const $ = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
    if (!lista.length) return `No hay gastos cargados ${nombre}. Para anotar uno: "gasté 20000 en publicidad".`;
    const porCat = gastosPorCategoria(lista).map((c) => `• ${c.label}: ${$(c.total)} (${c.n})`).join('\n');
    const ultimos = [...lista].sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0)).slice(0, 5)
        .map((g) => `· ${new Date(Number(g.date) || 0).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} ${g.concept || 'Gasto'} ${$(g.amount)}`).join('\n');
    return `Gastos ${nombre}: ${$(totalGastos(lista))} en ${lista.length} gasto${lista.length === 1 ? '' : 's'}.\n${porCat}\nÚltimos:\n${ultimos}`;
};
