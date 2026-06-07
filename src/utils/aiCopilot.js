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
    { name: 'query_sales', sensitive: false, desc: 'Resumen de ventas. args: {range: "today"|"7d"|"30d"|"all"}' },
    { name: 'query_customers', sensitive: false, desc: 'Top clientes por gasto. args: {top?}' },
    { name: 'query_coupons', sensitive: false, desc: 'Listar cupones. args: {}' },
    { name: 'query_reviews', sensitive: false, desc: 'Listar reseñas. args: {onlyPending?(bool), productId?}' },
    { name: 'quote_price', sensitive: false, desc: 'Calcular el PRECIO DE VENTA a partir del costo, cubriendo la comisión de Mercado Pago y el margen deseado. args: {cost(costo de la prenda), packaging?(0), shipping?(0), margin?(50, en %), commission?(6, % comisión MP)}. Devuelve precio sugerido + ganancia neta. Usalo SIEMPRE que el usuario te dé un COSTO o "me costó X" en vez de un precio final.' },
    // --- ESCRITURA SUAVE (auto) ---
    { name: 'create_category', sensitive: false, desc: 'Crear categoría. args: {name}' },
    { name: 'generate_copy', sensitive: false, desc: 'Generar y guardar descripción + keywords SEO de un producto. args: {productId}' },
    { name: 'set_badges', sensitive: false, desc: 'Marcar etiquetas de un producto. args: {productId, badges:{isNew?,isOnSale?,isSeason?,isFeatured?,isExclusive?}}' },
    { name: 'update_product_fields', sensitive: false, desc: 'Editar campos no-precio. args: {productId, fields:{name?,description?,category?,colors?(array),sizes?(array)}}' },
    { name: 'feature_products', sensitive: false, desc: 'Destacar productos en la home (badges.isFeatured=true). args: {productIds:[...]}' },
    { name: 'create_coupon', sensitive: false, desc: 'Crear cupón. args: {code, type:"percentage"|"fixed", value, minPurchase?, maxUses?, expiresInDays?}' },
    { name: 'approve_review', sensitive: false, desc: 'Aprobar/publicar una reseña pendiente. args: {reviewId}' },
    // --- SENSIBLES (confirmación obligatoria) ---
    { name: 'create_product', sensitive: true, desc: 'Crear/publicar producto. args: {name, price, category, sizes:[], colors:[], stock, description, imageUrl?, visible(bool)}' },
    { name: 'set_price', sensitive: true, desc: 'Cambiar precio de un producto. args: {productId, price}' },
    { name: 'set_stock', sensitive: true, desc: 'Cambiar stock TOTAL de un producto SIN variantes. Para productos con variantes (talle/color) avisá que el stock se edita por variante en el editor. args: {productId, stock}' },
    { name: 'set_sale', sensitive: true, desc: 'Poner/quitar oferta a un producto (baja el precio y muestra el anterior tachado). args: {productId, percent (0 para quitar la oferta)}' },
    { name: 'set_order_status', sensitive: true, desc: 'Cambiar el estado de un pedido. args: {orderId, status:"pending"|"shipped"|"delivered"|"cancelled", tracking?}' },
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
{"reply":"<lo que le decís al usuario, claro y breve>","actions":[{"tool":"<nombre>","args":{...}}],"done":<true|false>}
- "actions" puede estar vacío si solo respondés/preguntás. Podés encadenar varias acciones.
- Para CONSULTAR datos (ventas, stock, clientes, órdenes) usá las herramientas query_*; NO inventes números. Poné done:false y después de ver los resultados respondé con done:true.
- Las herramientas [SENSIBLE] (crear/publicar producto, precios, stock, borrar, home, mantenimiento) las confirma el usuario; igual proponelas normalmente, el sistema le pedirá OK.
- Precios: SIEMPRE en pesos argentinos (ARS), número entero. Si el usuario no da precio para un producto nuevo, proponé uno razonable y aclaralo en "reply".
- CÁLCULO DE PRECIO: si el usuario te da el COSTO ("me costó X", "lo pagué X") en vez de un precio de venta, usá primero quote_price para obtener el precio que cubre la comisión de Mercado Pago + el margen, decile el precio sugerido y la ganancia neta, y recién después creá el producto (create_product) con ESE precio. Si no aclara la comisión de MP usá 6% por defecto y aclaralo; si no aclara margen usá 50%. Packaging/envío sólo si los menciona.
- Si el usuario adjuntó una imagen vas a recibir su análisis en el contexto; usalo para crear el producto (create_product) con datos completos y buena descripción.
- Si falta info crítica y no la podés inferir razonablemente, preguntá (actions vacío, done:true).
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
    return {
        reply: String(p.reply || '').trim() || (actions.length ? 'Listo.' : 'No entendí bien, ¿me lo repetís?'),
        actions,
        done: p.done === undefined ? actions.length === 0 : Boolean(p.done),
    };
};
