// Cerebro nuevo de Lau (23/11/2026): Gemini con herramientas NATIVAS.
// Antes el modelo devolvía un JSON escrito a mano dentro del texto y había que
// adivinarlo ("No entendí bien" cuando venía torcido). Ahora Google recibe la
// lista de herramientas con sus campos y tipos, y contesta con llamadas ya
// armadas. Acá vive todo lo puro (testeable): los esquemas, el ciclo del agente
// con el modelo inyectado, la memoria y el "Deshacer todo".
import { TOOLS } from './aiCopilot';

// --- Esquemas (subconjunto OpenAPI que acepta Gemini) ---
const S = (description) => ({ type: 'STRING', ...(description ? { description } : {}) });
const N = (description) => ({ type: 'NUMBER', ...(description ? { description } : {}) });
const B = (description) => ({ type: 'BOOLEAN', ...(description ? { description } : {}) });
const A = (items, description) => ({ type: 'ARRAY', items, ...(description ? { description } : {}) });
const O = (properties, required, description) => ({
    type: 'OBJECT',
    properties,
    ...(required?.length ? { required } : {}),
    ...(description ? { description } : {}),
});
const RANGO = S('"today" | "7d" | "30d" | "all"');
const MEDIDAS = O({ busto: N(), cintura: N(), cadera: N(), largo: N(), manga: N(), tiro: N() }, null, 'centímetros');
const MEDIDAS_POR_TALLE = O({
    XS: MEDIDAS, S: MEDIDAS, M: MEDIDAS, L: MEDIDAS, XL: MEDIDAS, XXL: MEDIDAS, U: MEDIDAS,
}, null, 'medidas por talle; usá la clave del talle tal cual (S, M, 38, Único…)');
const VARIANTE = O({ size: S(), color: S(), stock: N() }, ['stock']);
const CAMPOS_PRODUCTO = O({
    name: S(), price: N(), stock: N(), category: S(), colors: A(S()), sizes: A(S()),
    description: S(), details: A(S()), material: S(), care: A(S()), measurements: MEDIDAS_POR_TALLE,
    cost: N(), shippingCost: N(), packagingCost: N(),
});

// Campos de cada herramienta. La descripción larga sale de TOOLS (aiCopilot).
export const ESQUEMAS = {
    query_inventory: O({ search: S(), category: S(), lowStock: B(), onlyDrafts: B() }),
    get_product: O({ idOrName: S('id o nombre del producto') }, ['idOrName']),
    query_orders: O({ status: S(), sinceDays: N(), limit: N() }),
    query_sales: O({ range: RANGO }),
    query_profit: O({ range: RANGO }),
    query_expenses: O({ range: RANGO }),
    query_mp_fee: O({}),
    query_customers: O({ top: N() }),
    business_summary: O({ range: RANGO }),
    query_coupons: O({}),
    query_reviews: O({ onlyPending: B(), productId: S() }),
    generate_label: O({ orderId: S() }, ['orderId']),
    quote_price: O({ cost: N(), category: S(), margin: N(), packaging: N(), shipping: N() }, ['cost']),
    create_category: O({ name: S() }, ['name']),
    rename_category: O({ from: S(), to: S() }, ['from', 'to']),
    delete_category: O({ name: S() }, ['name']),
    generate_copy: O({ productId: S() }, ['productId']),
    set_badges: O({
        productId: S(),
        badges: O({ isNew: B(), isOnSale: B(), isSeason: B(), isFeatured: B(), isExclusive: B() }),
    }, ['productId', 'badges']),
    update_product_fields: O({
        productId: S(),
        fields: O({ name: S(), description: S(), category: S(), colors: A(S()), sizes: A(S()) }),
    }, ['productId', 'fields']),
    edit_product: O({ productId: S(), fields: CAMPOS_PRODUCTO }, ['productId', 'fields']),
    set_photo: O({ productId: S(), imageUrls: A(S()), mode: S('"replace" | "add"') }, ['productId', 'imageUrls']),
    schedule_promotion: O({ category: S('nombre o "all"'), discount: N(), when: S(), name: S() }, ['discount']),
    feature_products: O({ productIds: A(S()) }, ['productIds']),
    create_coupon: O({
        code: S(), type: S('"percentage" | "fixed"'), value: N(), minPurchase: N(), maxUses: N(), expiresInDays: N(),
    }, ['code', 'type', 'value']),
    approve_review: O({ reviewId: S() }, ['reviewId']),
    create_product: O({
        name: S(), price: N(), category: S(), sizes: A(S()), colors: A(S()), stock: N(), variants: A(VARIANTE),
        description: S(), details: A(S()), material: S(), care: A(S()), measurements: MEDIDAS_POR_TALLE,
        videoUrl: S(), launchSalePercent: N(), featured: B(), imageUrl: S(), imageUrls: A(S()), visible: B(),
        cost: N(), packagingCost: N(), shippingCost: N(),
    }, ['name', 'price', 'visible']),
    set_price: O({ productId: S(), price: N() }, ['productId', 'price']),
    set_stock: O({ productId: S(), stock: N(), size: S(), color: S() }, ['productId', 'stock']),
    set_sale: O({ productId: S(), percent: N('0 para quitar la oferta') }, ['productId', 'percent']),
    set_order_status: O({ orderId: S(), status: S('"pending" | "shipped" | "delivered" | "cancelled"'), tracking: S() }, ['orderId', 'status']),
    record_sale: O({
        productId: S(), quantity: N(), unitPrice: N(), amount: N(), size: S(), color: S(),
        channel: S('"whatsapp" | "instagram" | "local" | "otro"'), customer: S(),
    }, ['productId']),
    adjust_stock: O({ productId: S(), delta: N(), size: S(), color: S() }, ['productId', 'delta']),
    cancel_sale: O({ orderId: S() }, ['orderId']),
    record_expense: O({ amount: N(), concept: S(), category: S(), date: N('fecha en milisegundos, opcional') }, ['amount', 'concept']),
    delete_expense: O({ expenseId: S() }, ['expenseId']),
    bulk_price: O({ category: S('nombre o "all"'), percent: N(), direction: S('"up" | "down"') }, ['percent', 'direction']),
    toggle_visible: O({ productId: S(), visible: B() }, ['productId', 'visible']),
    delete_product: O({ productId: S() }, ['productId']),
    delete_coupon: O({ couponId: S() }, ['couponId']),
    reject_review: O({ reviewId: S() }, ['reviewId']),
    update_home: O({
        hero: O({ title: S(), subtitle: S(), tagline: S(), buttonText: S(), buttonLink: S() }),
        announcement: O({ text: S(), enabled: B() }),
        marquee: S(),
    }),
    toggle_maintenance: O({ on: B() }, ['on']),
    post_instagram: O({ productId: S(), caption: S() }, ['productId']),
    // --- nuevas (23/11/2026) ---
    remember: O({ fact: S('el dato a recordar, una oración corta') }, ['fact']),
    forget: O({ number: N('el número del recuerdo, como figura en MEMORIA') }, ['number']),
    review_photo: O({ imageUrl: S('la imageUrl exacta de una foto ya subida') }, ['imageUrl']),
};

export const HERRAMIENTAS_NUEVAS = [
    { name: 'remember', sensitive: false, desc: 'Guardar en tu MEMORIA un dato que el dueño quiere que recuerdes entre días (cómo le gusta algo, un precio confirmado, algo pendiente). Usala cuando diga "acordate", "anotá que", "de ahora en más". Nunca guardes llaves, contraseñas ni datos de clientas.' },
    { name: 'forget', sensitive: false, desc: 'Borrar un recuerdo de tu MEMORIA por su número. Usala cuando el dueño diga "olvidate de…" o el dato ya no vale.' },
    { name: 'review_photo', sensitive: false, desc: 'MIRAR una foto ya subida y devolver un control: si la prenda o la modelo salen cortadas, si está borrosa u oscura, y una SUGERENCIA de tipo de prenda y color. Es sólo una ayuda: lo que sugiera se le PREGUNTA al dueño, nunca se carga sin que lo confirme.' },
];

const TODAS = [...TOOLS, ...HERRAMIENTAS_NUEVAS];
const SENSIBLES = new Set(TODAS.filter(t => t.sensitive).map(t => t.name));
export const esSensible = (nombre) => SENSIBLES.has(nombre);
export const esLectura = (nombre) => nombre.startsWith('query_') || ['get_product', 'quote_price', 'business_summary', 'review_photo'].includes(nombre);

// Lo que Gemini recibe en "tools": nombre, para qué sirve y los campos con tipo.
export const declaraciones = () => TODAS.map((t) => {
    const parameters = ESQUEMAS[t.name];
    if (!parameters) throw new Error(`Falta el esquema de ${t.name}`);
    const description = `${t.sensitive ? '[PIDE CONFIRMACIÓN] ' : ''}${t.desc}`;
    const decl = { name: t.name, description };
    if (Object.keys(parameters.properties).length) decl.parameters = parameters;
    return decl;
});

// --- Memoria (dura entre días; vive en ai_history/lau_memoria) ---
export const MAX_RECUERDOS = 40;
const PROHIBIDO = /(api[\s_-]?key|llave|contrase(ñ|n)a|password|token|AIza|AQ\.|APP_USR|cbu|cvu|tarjeta)/i;

export const agregarRecuerdo = (lista = [], texto, ahora = Date.now()) => {
    const t = String(texto || '').trim().replace(/\s+/g, ' ').slice(0, 240);
    if (!t) return { lista, error: 'No había nada para recordar.' };
    if (PROHIBIDO.test(t)) return { lista, error: 'Eso parece una llave o un dato privado: no lo guardo en la memoria.' };
    if (lista.some(r => r.texto.toLowerCase() === t.toLowerCase())) return { lista, error: 'Eso ya lo tenía anotado.' };
    const nueva = [...lista, { texto: t, fecha: ahora }].slice(-MAX_RECUERDOS);
    return { lista: nueva };
};

export const quitarRecuerdo = (lista = [], numero) => {
    const i = Number(numero) - 1;
    if (!(i >= 0 && i < lista.length)) return { lista, error: `No tengo el recuerdo número ${numero}.` };
    return { lista: lista.filter((_, j) => j !== i), quitado: lista[i].texto };
};

export const memoriaComoTexto = (lista = []) => (lista.length
    ? lista.map((r, i) => `${i + 1}. ${r.texto} (${new Date(r.fecha).toLocaleDateString('es-AR')})`).join('\n')
    : '(vacía)');

// --- Deshacer todo: foto de los productos ANTES de que se toquen ---
const CAMPOS_RESTAURABLES = ['name', 'price', 'compareAtPrice', 'stock', 'variants', 'category', 'colors', 'sizes', 'description', 'details', 'material', 'care', 'measurements', 'cost', 'shippingCost', 'packagingCost', 'badges', 'active', 'image', 'images', 'media', 'onSale', 'salePercent'];

const productosAfectados = (accion, inventario, buscar) => {
    const a = accion.args || {};
    const ids = [];
    if (a.productId) ids.push(a.productId);
    if (Array.isArray(a.productIds)) ids.push(...a.productIds);
    if (accion.tool === 'bulk_price' || accion.tool === 'schedule_promotion') {
        const cat = String(a.category || 'all').toLowerCase();
        return inventario.filter(p => ['all', 'todo', 'todos', ''].includes(cat) || String(p.category || '').toLowerCase() === cat);
    }
    if (accion.tool === 'rename_category') {
        return inventario.filter(p => String(p.category || '').toLowerCase() === String(a.from || '').toLowerCase());
    }
    return ids.map(id => buscar(id)).filter(Boolean);
};

// Herramientas cuyos cambios en productos se pueden volver atrás tal cual.
export const DESHACIBLES = new Set(['set_price', 'set_stock', 'set_sale', 'edit_product', 'update_product_fields', 'set_badges', 'feature_products', 'toggle_visible', 'set_photo', 'bulk_price', 'schedule_promotion', 'rename_category', 'adjust_stock']);

export const instantanea = (acciones, inventario, buscar) => {
    const foto = {};
    for (const ac of acciones) {
        if (!DESHACIBLES.has(ac.tool)) continue;
        for (const p of productosAfectados(ac, inventario, buscar)) {
            if (foto[p.id]) continue;
            foto[p.id] = Object.fromEntries(CAMPOS_RESTAURABLES.filter(k => p[k] !== undefined).map(k => [k, JSON.parse(JSON.stringify(p[k]))]));
            foto[p.id].__nombre = p.name;
        }
    }
    return foto;
};

// --- El ciclo del agente ---
export const MAX_PASOS = 10;

/**
 * llamar(contents) -> { content: {role:'model', parts:[…]} } (lo que devolvió Gemini)
 * ejecutar(acciones) -> [{name, resultado}]  (ya resolvió la confirmación)
 * avisar(texto)       -> muestra un texto de Lau en el chat
 * Devuelve { contents, pasos, llamadas } para tests y registro.
 */
export const correrAgente = async ({ contents, llamar, ejecutar, avisar, maxPasos = MAX_PASOS }) => {
    const vistas = new Map();
    let llamadas = 0;
    for (let paso = 0; paso < maxPasos; paso++) {
        const r = await llamar(contents);
        const content = r?.content || { role: 'model', parts: [] };
        const parts = Array.isArray(content.parts) ? content.parts : [];
        contents.push({ role: 'model', parts });
        const texto = parts.filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('').trim();
        const pedidas = parts.filter(p => p.functionCall).map(p => ({ tool: p.functionCall.name, args: p.functionCall.args || {} }));
        if (texto) avisar(texto);
        if (!pedidas.length) return { contents, pasos: paso + 1, llamadas };
        // Freno a los loops: la misma llamada con los mismos datos por tercera vez.
        const repetidas = pedidas.filter(a => {
            const k = a.tool + JSON.stringify(a.args);
            vistas.set(k, (vistas.get(k) || 0) + 1);
            return vistas.get(k) > 2;
        });
        if (repetidas.length) {
            avisar('Me estaba repitiendo, así que frené. Decime cómo seguimos.');
            return { contents, pasos: paso + 1, llamadas, cortado: 'repeticion' };
        }
        llamadas += pedidas.length;
        const resultados = await ejecutar(pedidas);
        contents.push({
            role: 'function',
            parts: resultados.map(r2 => ({ functionResponse: { name: r2.name, response: { resultado: String(r2.resultado) } } })),
        });
        // Si el dueño canceló algo, no seguimos haciendo cosas por nuestra cuenta.
        if (resultados.some(r2 => String(r2.resultado).startsWith('CANCELADO'))) {
            const fin = await llamar(contents).catch(() => null);
            const t = (fin?.content?.parts || []).filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('').trim();
            if (t) avisar(t);
            return { contents, pasos: paso + 2, llamadas, cortado: 'cancelado' };
        }
    }
    avisar('Llegué al límite de pasos para un solo pedido. Si quedó algo a medias, decime y sigo.');
    return { contents, pasos: maxPasos, llamadas, cortado: 'limite' };
};

// La conversación visible pasada al formato de Gemini: turnos alternados que
// empiezan por el dueño (Gemini rechaza un historial que arranca con el modelo).
export const historialParaGemini = (mensajes, max = 40) => {
    const turnos = [];
    for (const m of mensajes.slice(-max)) {
        const role = m.role === 'user' ? 'user' : m.role === 'ai' ? 'model' : null;
        const text = String(m.text || '').trim();
        if (!role || !text) continue;
        const ultimo = turnos[turnos.length - 1];
        if (ultimo && ultimo.role === role) ultimo.parts[0].text += `\n${text}`;
        else turnos.push({ role, parts: [{ text }] });
    }
    while (turnos.length && turnos[0].role !== 'user') turnos.shift();
    return turnos;
};

export const REGLAS_NUEVAS = `
CÓMO TRABAJÁS AHORA (más importante que todo lo de abajo sobre el formato):
- Ya NO respondés con JSON. Para hacer algo, llamá a la herramienta directamente; para hablarle al dueño, escribí texto normal. Los botones de opciones: poné cada opción en una línea final que empiece con "OPCIONES:" separadas por " | " (ej: "OPCIONES: Publicar | Borrador").
- PENSÁ ANTES DE HACER: si el pedido tiene varias partes, hacé un plan corto en tu cabeza y resolvé TODAS las partes en el mismo turno, encadenando herramientas (primero consultá lo que necesites, después cambiá).
- CONTROLÁ TU TRABAJO: después de cambiar algo, si el resultado no es obvio, verificalo con get_product o la consulta que corresponda, y recién ahí decile al dueño cómo quedó, con el número concreto (precio, stock, cantidad de productos tocados).
- Las herramientas [PIDE CONFIRMACIÓN] le muestran al dueño un cuadro para aprobar. Si el resultado empieza con "CANCELADO", no insistas ni busques otra forma: preguntale qué quiere.
- Cambios grandes (varios productos): proponelos TODOS juntos en el mismo turno; el dueño los aprueba con un solo OK y después tiene "Deshacer todo".
- MEMORIA: abajo tenés lo que el dueño te pidió recordar. Respetalo. Si te dice "acordate…" usá remember.
- FOTOS: con review_photo podés MIRAR una foto para avisar si está cortada, borrosa u oscura, y sugerir prenda y color. Lo que sugieras se lo PREGUNTÁS ("¿es un sweater gris?"), nunca lo cargás sin que lo confirme.
- Respuestas cortas, claras, sin palabras técnicas y sin formato (nada de asteriscos ni títulos). Primero lo que preguntó, en una línea.`;

export const sistemaCompleto = ({ sistemaViejo, snapshot, memoria }) =>
    `${REGLAS_NUEVAS}\n\nMEMORIA (lo que el dueño te pidió recordar):\n${memoriaComoTexto(memoria)}\n\n${sistemaViejo
        .replace(/- Respondé SIEMPRE y SOLO con un objeto JSON[^]*?- "actions" puede estar vacío[^\n]*\n/, '')}\n\nHERRAMIENTAS NUEVAS: remember, forget, review_photo (ver arriba).\n\nESTADO DE LA TIENDA (ahora):\n${snapshot}`;

// El chat muestra texto plano: los ** y las viñetas de markdown se verían tal cual.
export const sinMarkdown = (t) => String(t || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1');

// "OPCIONES: a | b" al final del texto -> botones.
export const separarOpciones = (texto) => {
    const limpio = sinMarkdown(texto);
    const m = limpio.match(/\n?\s*OPCIONES:\s*(.+)\s*$/i);
    if (!m) return { texto: limpio.trim(), opciones: undefined };
    const opciones = m[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 4);
    return { texto: limpio.slice(0, m.index).trim(), opciones: opciones.length ? opciones : undefined };
};
