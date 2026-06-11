// Cerebro del copiloto del Admin. Define el catálogo de herramientas que la
// IA puede invocar, arma el prompt agéntico y parsea el plan que devuelve.
// Es agnóstico del proveedor: la ejecución real vive en el componente
// (tiene acceso a dbActions). Acá sólo va la lógica pura.
import { parseJsonFromResponse } from './gemini';

// sensitive: requiere confirmación explícita del usuario antes de ejecutar.
export const TOOLS = [
    // --- LECTURA (auto, sin confirmación) ---
    { name: 'query_inventory', sensitive: false, desc: 'Listar/buscar productos. args: {search?, category?, lowStock?(bool), onlyDrafts?(bool)}' },
    { name: 'get_product', sensitive: false, desc: 'Detalle de un producto. args: {idOrName}' },
    { name: 'query_orders', sensitive: false, desc: 'Listar órdenes. args: {status?, sinceDays?, limit?}' },
    { name: 'query_sales', sensitive: false, desc: 'Resumen de ventas (facturación). args: {range: "today"|"7d"|"30d"|"all"}' },
    { name: 'query_profit', sensitive: false, desc: 'Calcular la GANANCIA NETA real (lo que te queda en el bolsillo) en un período: ingresos − costo de los productos vendidos − comisión de Mercado Pago − gastos cargados. args: {range:"today"|"7d"|"30d"|"all"}. Usala cuando pregunten "cuánto gané", "ganancia neta", "cuánto me quedó limpio".' },
    { name: 'query_expenses', sensitive: false, desc: 'Listar/sumar los GASTOS cargados en un período (compra de mercadería, packaging, publicidad, etc.). args: {range:"today"|"7d"|"30d"|"all"}.' },
    { name: 'query_mp_fee', sensitive: false, desc: 'Decir cuánto es la comisión actual de Mercado Pago que usás para calcular precios (la REAL medida de las ventas, o el estimado si todavía no hubo ventas). args: {}.' },
    { name: 'query_customers', sensitive: false, desc: 'Top clientes por gasto. args: {top?}' },
    { name: 'query_coupons', sensitive: false, desc: 'Listar cupones. args: {}' },
    { name: 'query_reviews', sensitive: false, desc: 'Listar reseñas. args: {onlyPending?(bool), productId?}' },
    { name: 'generate_label', sensitive: false, desc: 'Generar y descargar la ETIQUETA DE ENVÍO en PDF de un pedido (remitente + destinatario + datos del pedido) para imprimir y pegar al paquete. args: {orderId}. Usala cuando el dueño te pida "la etiqueta", "etiqueta del correo" o "imprimir el envío" de un pedido.' },
    { name: 'quote_price', sensitive: false, desc: 'Calcular el PRECIO DE VENTA a partir del costo, cubriendo la comisión de Mercado Pago y el margen deseado. args: {cost(costo de la prenda), packaging?(0), shipping?(0), margin?(50, en %), commission?(6, % comisión MP)}. Devuelve precio sugerido + ganancia neta. Usalo SIEMPRE que el usuario te dé un COSTO o "me costó X" en vez de un precio final.' },
    // --- ESCRITURA SUAVE (auto) ---
    { name: 'create_category', sensitive: false, desc: 'Crear categoría. args: {name}' },
    { name: 'rename_category', sensitive: true, desc: 'Renombrar una categoría. Actualiza también los productos que la usaban. args: {from (nombre actual), to (nombre nuevo)}.' },
    { name: 'delete_category', sensitive: true, desc: 'Eliminar una categoría. args: {name}. Avisá si hay productos usándola.' },
    { name: 'generate_copy', sensitive: false, desc: 'Generar y guardar descripción + keywords SEO de un producto. args: {productId}' },
    { name: 'set_badges', sensitive: false, desc: 'Marcar etiquetas de un producto. args: {productId, badges:{isNew?,isOnSale?,isSeason?,isFeatured?,isExclusive?}}' },
    { name: 'update_product_fields', sensitive: false, desc: 'Editar campos no-precio. args: {productId, fields:{name?,description?,category?,colors?(array),sizes?(array)}}' },
    { name: 'feature_products', sensitive: false, desc: 'Destacar productos en la home (badges.isFeatured=true). args: {productIds:[...]}' },
    { name: 'create_coupon', sensitive: false, desc: 'Crear cupón. args: {code, type:"percentage"|"fixed", value, minPurchase?, maxUses?, expiresInDays?}' },
    { name: 'approve_review', sensitive: false, desc: 'Aprobar/publicar una reseña pendiente. args: {reviewId}' },
    // --- SENSIBLES (confirmación obligatoria) ---
    { name: 'create_product', sensitive: true, desc: 'Crear/publicar producto. args: {name, price, category, sizes:[], colors:[], stock, description, imageUrl?, imageUrls?:[...] (varias fotos del MISMO producto -> galería), visible(bool)}' },
    { name: 'set_price', sensitive: true, desc: 'Cambiar precio de un producto. args: {productId, price}' },
    { name: 'set_stock', sensitive: true, desc: 'Setear el stock de un producto a un número exacto. Si el producto tiene variantes (talle/color), pasá size y color para setear ESA variante; si no tiene variantes, setea el stock total. args: {productId, stock, size?, color?}. Ej: "poné 3 unidades del Short talle 5 color Chocolate".' },
    { name: 'set_sale', sensitive: true, desc: 'Poner/quitar oferta a un producto (baja el precio y muestra el anterior tachado). args: {productId, percent (0 para quitar la oferta)}' },
    { name: 'set_order_status', sensitive: true, desc: 'Cambiar el estado de un pedido. args: {orderId, status:"pending"|"shipped"|"delivered"|"cancelled", tracking?}' },
    { name: 'record_sale', sensitive: true, desc: 'Registrar una VENTA hecha POR FUERA de la tienda (en persona, WhatsApp, Instagram, local). Descuenta el stock del producto y la suma a las ventas/estadísticas (queda como pedido pagado). args: {productId, quantity?(default 1), unitPrice?(precio por unidad), amount?(monto total cobrado), size?, color?, channel?("whatsapp"|"instagram"|"local"|"otro"), customer?(nombre opcional)}. Si el dueño dice "vendí X a $Y" usá amount=Y. Si el producto tiene variantes (talle/color), PEDÍ talle y color antes de registrar.' },
    { name: 'adjust_stock', sensitive: true, desc: 'Sumar o restar unidades al stock de un producto (reposición de mercadería o corrección), SIN registrar venta. args: {productId, delta(número: + para sumar, - para restar), size?, color?}. Ej: "me llegaron 10 carteras" -> delta 10. Para productos con variantes pedí talle y color.' },
    { name: 'cancel_sale', sensitive: true, desc: 'Anular/borrar una venta o pedido registrado por error: repone el stock que se había descontado (talle/color exacto) y saca la venta de los números. args: {orderId (ej: MAN-123456 o ORD-123456)}. Usala cuando digan "anulá/borrá/cancelá la venta X" o "esa venta fue un error".' },
    { name: 'record_expense', sensitive: true, desc: 'Registrar un GASTO del negocio (compra de mercadería, packaging, publicidad, envíos, etc.) para que se reste de la ganancia neta. args: {amount(monto), concept(qué fue), category?("mercaderia"|"packaging"|"publicidad"|"envios"|"servicios"|"otros")}. Ej: "gasté $80000 en tela" -> amount 80000, concept "tela", category "mercaderia".' },
    { name: 'delete_expense', sensitive: true, desc: 'Eliminar un gasto cargado. args: {expenseId}' },
    { name: 'bulk_price', sensitive: true, desc: 'Cambio masivo de precio. args: {category?(o "all"), percent, direction:"up"|"down"}' },
    { name: 'toggle_visible', sensitive: true, desc: 'Mostrar/ocultar producto. args: {productId, visible(bool)}' },
    { name: 'delete_product', sensitive: true, desc: 'Eliminar producto. args: {productId}' },
    { name: 'delete_coupon', sensitive: true, desc: 'Eliminar cupón. args: {couponId}' },
    { name: 'reject_review', sensitive: true, desc: 'Rechazar/eliminar una reseña. args: {reviewId}' },
    { name: 'update_home', sensitive: true, desc: 'Editar contenido de la home. args: {hero?:{title?,subtitle?,buttonText?,buttonLink?}, editorial?:{title?,subtitle?,text?,quote?,quoteAuthor?}, announcement?:{text?,enabled?}, marquee?}' },
    { name: 'toggle_maintenance', sensitive: true, desc: 'Activar/desactivar modo mantenimiento. args: {on(bool)}' },
];

const SENSITIVE = new Set(TOOLS.filter(t => t.sensitive).map(t => t.name));
export const isSensitive = (name) => SENSITIVE.has(name);
export const isKnownTool = (name) => TOOLS.some(t => t.name === name);

// Snapshot compacto del estado de la tienda (lo justo para que la IA decida).
export const buildSnapshot = ({ inventory = [], orders = [], categories = [], coupons = [], reviews = [], isMaintenance, siteConfig = {} }) => {
    const today = new Date().toDateString();
    const salesToday = orders.filter(o => new Date(o.date).toDateString() === today);
    const revToday = salesToday.reduce((a, o) => a + (Number(o.total) || 0), 0);
    const low = inventory.filter(p => Number(p.stock) < 5 && !(p.variants?.length));
    const toShip = orders.filter(o => ['approved', 'paid', 'pending'].includes(o.status)).length;
    const pendingReviews = reviews.filter(r => !r.approved).length;
    const prods = inventory.slice(0, 60).map(p =>
        `#${p.id} "${p.name}" $${p.price ?? '?'} stock:${p.stock ?? (p.variants?.length ? 'var' : 0)} cat:${p.category || '-'} ${p.active === false ? '[BORRADOR]' : '[visible]'}`
    ).join('\n');
    return [
        `FECHA: ${new Date().toLocaleDateString('es-AR')}`,
        `VENTAS HOY: ${salesToday.length} órdenes · $${revToday.toLocaleString('es-AR')}`,
        `TOTAL ÓRDENES: ${orders.length} · PRODUCTOS: ${inventory.length} · STOCK BAJO(<5): ${low.length}`,
        `PENDIENTES DE ENVIAR: ${toShip} · RESEÑAS POR APROBAR: ${pendingReviews}`,
        `MANTENIMIENTO: ${isMaintenance ? 'ACTIVO' : 'off'}`,
        `CATEGORÍAS: ${categories.map(c => c.name).filter(Boolean).join(', ') || '(ninguna)'}`,
        `CUPONES: ${coupons.map(c => c.code).filter(Boolean).join(', ') || '(ninguno)'}`,
        `HERO: título="${siteConfig?.hero?.title || ''}" sub="${siteConfig?.hero?.subtitle || ''}" botón="${siteConfig?.hero?.buttonText || ''}"`,
        `PRODUCTOS (primeros 60):\n${prods || '(sin productos)'}`,
    ].join('\n');
};

const SYSTEM = `Sos "Lau", la copiloto de IA del panel de administración de "La Boutique de la Elegancia" (moda femenina premium, Argentina). Hablás español rioplatense (vos/tenés/podés), cálida y concreta, sin emojis salvo que el usuario los use.

Tu trabajo: el dueño te pide cosas en lenguaje natural igual que se las pediría a un asistente humano, y vos las EJECUTÁS usando herramientas. No sos solo un chat: actuás.

Tenés estas herramientas (invocás por nombre con args JSON):
${TOOLS.map(t => `- ${t.name}${t.sensitive ? ' [SENSIBLE]' : ''}: ${t.desc}`).join('\n')}

Reglas:
- Respondé SIEMPRE y SOLO con un objeto JSON válido (sin markdown, sin texto fuera del JSON) con esta forma:
{"reply":"<lo que le decís al usuario, claro y breve>","actions":[{"tool":"<nombre>","args":{...}}],"done":<true|false>,"options":["<botón 1>","<botón 2>"]}
- "actions" puede estar vacío si solo respondés/preguntás. Podés encadenar varias acciones.
- MENÚ INTERACTIVO ("options"): cuando le hagas una pregunta de OPCIONES, incluí "options" con botones (máx 4, cortos) para que toque en vez de escribir. Mantené cada menú LIMPIO (3-4 opciones), no lo llenes — premium es claro, no abarrotado.
- WIZARD DE CARGA DE PRODUCTO (paso a paso, un menú por vez):
  1) Confirmá lo que detectaste (prenda, color) y pedí lo que FALTE. Para el PRECIO ofrecé menú: options ["Te doy el costo", "Te doy el precio final"]. Si elige costo, ofrecé el margen: options ["40%","50%","60%"] (y calculás con quote_price). El talle y el stock pedilos en texto (son datos libres) — no sigas sin el talle ni el stock.
  2) Cuando tengas los datos, preguntá QUÉ HACER con la prenda: options ["Publicar en la tienda","Guardar como borrador","Registrar una venta"].
  3) Ejecutá la acción (create_product / record_sale).
  4) Después de PUBLICAR, ofrecé un último menú de extras: options ["Destacar en la home","Ponerla en oferta","Marcar como Nuevo","Listo, cargar otra"] → según lo que elija usá feature_products / set_sale / set_badges, o cerrá. Si hay varias prendas en cola, seguí con la próxima.
- Para CONSULTAR datos (ventas, stock, clientes, órdenes) usá las herramientas query_*; NO inventes números. Poné done:false y después de ver los resultados respondé con done:true.
- Las herramientas [SENSIBLE] (crear/publicar producto, precios, stock, borrar, home, mantenimiento) las confirma el usuario; igual proponelas normalmente, el sistema le pedirá OK.
- Precios: SIEMPRE en pesos argentinos (ARS), número entero. Si el usuario no da precio para un producto nuevo, proponé uno razonable y aclaralo en "reply".
- CÁLCULO DE PRECIO: si el usuario te da el COSTO ("me costó X", "lo pagué X") en vez de un precio de venta, usá primero quote_price para obtener el precio que cubre la comisión de Mercado Pago + el margen, decile el precio sugerido y la ganancia neta, y recién después creá el producto (create_product) con ESE precio. Si no aclara la comisión de MP usá 6% por defecto y aclaralo; si no aclara margen usá 50%. Packaging/envío sólo si los menciona.
- FOTOS DE PRENDAS (flujo guiado): cuando el usuario adjunta una o VARIAS fotos, recibís en el contexto la URL ya subida + el análisis de cada una. NO publiques de una.
  · Si hay 2+ fotos, PRIMERO preguntá con options ["Es el mismo producto (varias fotos)","Son productos distintos"]. Si elige "mismo producto": creás UN create_product con imageUrls = TODAS las URLs (quedan como galería del producto, ideal para mostrar cada color/ángulo). Si elige "distintos": una create_product por cada foto.
  · Después seguí el wizard: pedí lo que falte (talle, color, stock, precio o costo) y preguntá con options qué hacer (Publicar / Borrador / Registrar venta). Usá la imageUrl/imageUrls exacta. Si te dan el costo usá quote_price.
- ENTENDÉ LENGUAJE NATURAL Y DESPROLIJO: el dueño escribe rápido, con typos, todo junto y sin estructura. Interpretá su INTENCIÓN, no pidas que reformule. Ejemplos de interpretación: "publicalo" / "subilo" / "ponelo" = create_product con visible=true; "guardalo" / "borrador" = create_product visible=false; "tengo 5" / "hay 5" / "5 productos" / "quedan 5" = stock 5; "todos blancos" / "es blanco" = color blanco; "generá/hacé una descripción" o "ponele una buena descripción" = escribí vos una buena descripción en el campo description; "me costó X" = costo (usá quote_price); números sueltos tras hablar de precio = precio.
- NUNCA respondas vacío ni con "no entendí". Si algo es confuso o se contradice (ej: dice un color y después otro), tomá lo más reciente o asumí lo más razonable y AVISÁ qué asumiste, o preguntá UNA sola cosa puntual y breve. Siempre devolvé un "reply" útil.
- Si en un mismo mensaje el dueño te da la intención + datos + un pedido extra (ej: "publicalo, stock 5, y generá la descripción"), hacé TODO junto en una sola respuesta (create_product con esos datos y la descripción ya escrita).
- Si falta info crítica y no la podés inferir razonablemente, preguntá (actions vacío, done:true).
- VENTAS POR FUERA DE LA WEB: si el dueño te dice que vendió algo en persona, por WhatsApp o Instagram ("vendí 2 vestidos a $50000", "se vendió una cartera por insta"), usá record_sale: descuenta el stock y la cuenta en las ventas/estadísticas. Si el producto tiene variantes (talle/color), preguntá talle y color antes. Para SOLO reponer o corregir stock sin venta (ej: "me llegaron 10", "sumá 5 al stock", "corregí el stock a tal número") usá adjust_stock (o set_stock si te dan el número final).
- STOCK POR TALLE/COLOR: SÍ podés editar el stock de una variante específica. Si el producto tiene variantes, usá set_stock (valor exacto) o adjust_stock (sumar/restar) pasando talle y color. NUNCA digas que hay que ir al panel/editor: vos lo hacés. Si no sabés qué talle/color, preguntalo y listo.
- GASTOS: si el dueño dice que gastó plata en algo del negocio ("compré tela por $80000", "pagué $20000 de publicidad", "gasté en packaging"), usá record_expense para registrarlo; eso se resta de la ganancia neta. Para ver los gastos usá query_expenses.
- Sé proactiva pero no destructiva: nunca borres ni hagas cambios masivos sin que lo haya pedido.
- "armar/mejorar la home" = usar update_home (textos) y feature_products/set_badges (curaduría). No podés tocar el diseño/código, sí el contenido.`;

// transcript: [{role:'user'|'assistant'|'tool'|'system', content:string}]
export const buildPrompt = ({ snapshot, transcript }) => {
    const convo = transcript.map(m => {
        if (m.role === 'user') return `USUARIO: ${m.content}`;
        if (m.role === 'assistant') return `LAURINA(JSON): ${m.content}`;
        if (m.role === 'tool') return `RESULTADO_HERRAMIENTAS:\n${m.content}`;
        return `NOTA: ${m.content}`;
    }).join('\n\n');
    return `${SYSTEM}

=== ESTADO ACTUAL DE LA TIENDA ===
${snapshot}

=== CONVERSACIÓN ===
${convo}

Respondé ahora SOLO con el JSON (reply/actions/done).`;
};

export const parsePlan = (raw) => {
    const p = parseJsonFromResponse(raw) || {};
    let actions = Array.isArray(p.actions) ? p.actions : [];
    actions = actions
        .filter(a => a && typeof a.tool === 'string')
        .map(a => ({ tool: a.tool, args: (a.args && typeof a.args === 'object') ? a.args : {} }))
        .filter(a => isKnownTool(a.tool));
    let reply = String(p.reply || '').trim();
    // Si no hubo JSON parseable pero el modelo respondió en prosa, usá esa prosa
    // como respuesta en vez de fallar con "No entendí bien".
    if (!reply && !actions.length) {
        const prose = String(raw || '').replace(/```[a-z]*\s*/gi, '').replace(/```/g, '').trim();
        if (prose && !prose.startsWith('{') && !prose.startsWith('[') && prose.length > 1) {
            reply = prose.slice(0, 1500);
        }
    }
    const options = Array.isArray(p.options)
        ? p.options.map(o => String(o).trim()).filter(Boolean).slice(0, 6)
        : [];
    return {
        reply: reply || (actions.length ? 'Listo.' : 'No entendí bien, ¿me lo repetís?'),
        actions,
        done: p.done === undefined ? actions.length === 0 : Boolean(p.done),
        options,
    };
};
