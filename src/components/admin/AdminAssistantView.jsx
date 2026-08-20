import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, X, Loader2, User, AlertTriangle, Check, Trash2, BookOpen, PackagePlus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductWizard } from './ProductWizard';
import { generateText, generateProductCopy, hasAdminAI } from '../../utils/ai';
import { isSensitive, buildSnapshot, buildAgentMessages, parsePlan } from '../../utils/aiCopilot';
import { generateShippingLabel } from '../../utils/shippingLabel';
import { getTotalStock, getVariantStock } from '../../utils/variants';

const HISTORY_KEY = 'lau_copilot_v4';
const MAX_STEPS = 5;
const WELCOME = {
    role: 'ai', text:
        '¡Hola! 👋 Soy Lau, tu copiloto. Manejás toda la tienda hablándome como a una empleada — y yo ejecuto las acciones de verdad (lo importante siempre te lo confirmo antes).\n\n' +
        'Para cargar un producto, tocá el botón dorado "Cargar producto (paso a paso)" abajo: te lleva con botones por nombre, color, talle, stock y precio, sin vueltas. Para todo lo demás, pedímelo en tus palabras.\n\n' +
        'Tocá 📖 Guía arriba para ver TODO con ejemplos. ¿Arrancamos?'
};

// Tarjetas de capacidades para el estado inicial (abren la Guía).
const CAPS = [
    { icon: '📸', label: 'Cargar productos' },
    { icon: '💰', label: 'Precios y ofertas' },
    { icon: '📦', label: 'Pedidos y envíos' },
    { icon: '🛒', label: 'Ventas y stock' },
    { icon: '💸', label: 'Gastos y ganancia' },
    { icon: '🏠', label: 'Home, cupones, reseñas' },
];

// Pasos ilustrados para cargar un producto (el wizard). Bien simple y visual.
const LOAD_STEPS = [
    { emoji: '🟡', title: 'Tocá el botón dorado', text: 'Abajo de todo dice "Cargar producto (paso a paso)". Tocalo.' },
    { emoji: '📷', title: 'Foto (si querés)', text: 'Subí una o varias fotos de la prenda. O seguí sin foto, no pasa nada.' },
    { emoji: '✏️', title: 'Nombre', text: 'Escribí cómo se llama la prenda. Ej: "Vestido Lino Blanco".' },
    { emoji: '🎨', title: 'Color y talle', text: 'Tocá los colores y talles que tenga. Podés elegir varios.' },
    { emoji: '🔢', title: 'Stock', text: 'Tocá cuántas unidades tenés (1, 2, 3, 5, 10… o escribí otra).' },
    { emoji: '💵', title: 'Precio', text: '"Tengo el precio" o "Calcular del costo". Si das el costo, te dice a cuánto venderlo ganando.' },
    { emoji: '✅', title: 'Listo', text: 'Te muestra todo para revisar. Tocás "Publicar" y ya está en la tienda.' },
];

const COMMAND_GUIDE = [
    {
        icon: '💰', title: 'Saber a cuánto vender', color: 'precio',
        sub: 'Le decís lo que te costó y cuánto querés ganar.',
        items: [
            'Me costó $8000 y quiero ganar 50%, ¿a cuánto lo vendo?',
            '¿A cuánto vendo algo que me salió $12000 con 60% de ganancia?',
        ],
    },
    {
        icon: '✏️', title: 'Cambiar un producto', color: 'editar',
        sub: 'Editás algo que ya está cargado, sin volver a hacerlo.',
        items: [
            'Cambiá el precio del Vestido Rojo a $25000',
            'Editá el Blazer Negro: stock 12 y sacale el talle XL',
            'Ponele al Top Blanco la descripción "ideal para verano"',
            'Cambiá el stock del Vestido Aurora a 20',
            'Ocultá el Vestido Rojo (que no se vea en la tienda)',
        ],
    },
    {
        icon: '🛒', title: 'Anotar una venta de afuera', color: 'venta',
        sub: 'Vendiste por WhatsApp, Insta o en persona. Se lo decís y descuenta el stock.',
        items: [
            'Vendí 2 Vestidos Rojos talle M a $50000 en persona',
            'Se vendió 1 Cartera Negra por Instagram a $30000',
            'Anulá la venta MAN-123456 (fue un error)',
        ],
    },
    {
        icon: '📦', title: 'Reponer stock', color: 'stock',
        sub: 'Te llegó mercadería nueva.',
        items: [
            'Me llegaron 10 Vestidos Aurora, sumalos al stock',
            'Restá 3 al stock del Blazer talle S beige',
        ],
    },
    {
        icon: '🏷️', title: 'Hacer ofertas', color: 'oferta',
        sub: 'Bajás precios con un descuento. Queda el precio viejo tachado.',
        items: [
            'Poné 20% off toda la tienda',
            'Hacé 15% de descuento en la categoría Vestidos',
            'Programá 25% off para el sábado',
            'Quitá la oferta del Vestido Rojo',
        ],
    },
    {
        icon: '💸', title: 'Plata: gastos y ganancia', color: 'plata',
        sub: 'Anotás lo que gastás y te dice cuánto ganaste de verdad.',
        items: [
            'Gasté $80000 en tela',
            'Registrá un gasto de $20000 en publicidad',
            '¿Cuánto vendí hoy?',
            '¿Cuánto me quedó limpio este mes?',
        ],
    },
    {
        icon: '📊', title: 'Resumen y consejos', color: 'resumen',
        sub: 'Te cuenta cómo va el negocio y qué te conviene hacer.',
        items: [
            'Hacé un resumen del negocio',
            '¿Cómo va la tienda este mes?',
            '¿Qué me conviene reponer?',
            'Dame consejos para vender más',
        ],
    },
    {
        icon: '📮', title: 'Pedidos y envíos', color: 'pedido',
        sub: 'Los pedidos que entran por la web.',
        items: [
            '¿Qué pedidos tengo para enviar?',
            'Hacé la etiqueta de envío del pedido ORD-123456',
            'Marcá el pedido ORD-123456 como enviado',
        ],
    },
    {
        icon: '🏠', title: 'Cambiar la home y categorías', color: 'home',
        sub: 'Los textos de la página de inicio y las categorías.',
        items: [
            'Quiero cambiar la home',
            'Cambiá el anuncio de arriba a "Envío gratis desde $50000"',
            'Destacá en la home los 4 productos más nuevos',
            'Creá la categoría "Abrigos"',
        ],
    },
    {
        icon: '🎟️', title: 'Cupones y reseñas', color: 'extra',
        sub: 'Códigos de descuento y opiniones de clientas.',
        items: [
            'Creá un cupón VERANO15 de 15%',
            'Mostrame las reseñas pendientes',
            'Aprobá todas las reseñas pendientes',
        ],
    },
];

const toArr = (v) => Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean)
    : (typeof v === 'string' ? v.split(/[,/]+/).map(s => s.trim()).filter(Boolean) : []);

// Interpreta fechas simples en español para programar ofertas. Devuelve timestamp
// (ms) o null si no se entiende. Soporta: ahora, mañana, en N horas/días, día de
// la semana (próxima ocurrencia), "el finde"=sábado. Hora opcional "HH" o "HH:MM".
const DOW = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, 'miércoles': 3, jueves: 4, viernes: 5, sabado: 6, 'sábado': 6 };
const parseWhen = (raw) => {
    const s = String(raw || '').toLowerCase().trim();
    if (!s || /\b(ahora|ya|hoy)\b/.test(s)) return Date.now();
    const hm = s.match(/(\d{1,2})(?::(\d{2}))?\s*(hs|h|horas?)?/);
    let hour = 10, min = 0;
    const timeMatch = s.match(/\b(\d{1,2}):(\d{2})\b/) || s.match(/\ba?\s*las?\s*(\d{1,2})\b/);
    if (timeMatch) { hour = Math.min(23, parseInt(timeMatch[1])); min = timeMatch[2] ? parseInt(timeMatch[2]) : 0; }
    const setTime = (d) => { d.setHours(hour, min, 0, 0); return d.getTime(); };
    const enHoras = s.match(/en\s+(\d{1,3})\s*(hs|h|horas?)/);
    if (enHoras) return Date.now() + parseInt(enHoras[1]) * 36e5;
    const enDias = s.match(/en\s+(\d{1,3})\s*(d|dias?|días?)/);
    if (enDias) { const d = new Date(); d.setDate(d.getDate() + parseInt(enDias[1])); return setTime(d); }
    if (/\bmañana\b/.test(s) || /\bmanana\b/.test(s)) { const d = new Date(); d.setDate(d.getDate() + 1); return setTime(d); }
    const targetDow = /\bfinde?\b/.test(s) ? 6 : Object.keys(DOW).find(k => s.includes(k)) != null ? DOW[Object.keys(DOW).find(k => s.includes(k))] : null;
    if (targetDow != null) {
        const d = new Date();
        let add = (targetDow - d.getDay() + 7) % 7;
        if (add === 0) add = 7; // próxima ocurrencia, no hoy
        d.setDate(d.getDate() + add);
        return setTime(d);
    }
    if (hm && /\bhoy\b/.test(s)) { const d = new Date(); return setTime(d); }
    return null;
};

const actionLabel = (a) => {
    const A = a.args || {};
    switch (a.tool) {
        case 'create_product': return `Publicar producto "${A.name}" — $${Number(A.price || 0).toLocaleString('es-AR')} · ${A.category || 's/categoría'} · stock ${A.stock ?? 0}${A.visible === false ? ' (borrador)' : ''}`;
        case 'set_price': return `Cambiar precio de ${A.productId} → $${Number(A.price || 0).toLocaleString('es-AR')}`;
        case 'set_stock': return `Cambiar stock de ${A.productId} → ${A.stock}`;
        case 'bulk_price': return `Precio masivo: ${A.category || 'TODOS'} ${A.direction === 'down' ? '−' : '+'}${A.percent}%`;
        case 'toggle_visible': return `${A.visible ? 'Mostrar' : 'Ocultar'} producto ${A.productId}`;
        case 'delete_product': return `ELIMINAR producto ${A.productId}`;
        case 'delete_coupon': return `ELIMINAR cupón ${A.couponId}`;
        case 'set_order_status': return `Pedido ${A.orderId} → ${A.status}${A.tracking ? ` (tracking ${A.tracking})` : ''}`;
        case 'record_sale': {
            const q = Number(A.quantity) || 1;
            const v = [A.size, A.color].filter(Boolean).join('/');
            const tot = A.amount != null ? Number(A.amount) : (A.unitPrice != null ? Number(A.unitPrice) * q : 0);
            return `Registrar venta externa: ${q}× ${A.productId}${v ? ` (${v})` : ''}${tot ? ` por $${tot.toLocaleString('es-AR')}` : ''} — descuenta stock`;
        }
        case 'adjust_stock': return `Ajustar stock de ${A.productId}: ${Number(A.delta) > 0 ? '+' : ''}${A.delta}${[A.size, A.color].filter(Boolean).length ? ` (${[A.size, A.color].filter(Boolean).join('/')})` : ''}`;
        case 'cancel_sale': return `ANULAR venta ${A.orderId} (repone el stock)`;
        case 'record_expense': return `Registrar gasto: ${A.concept || 'Gasto'} — $${(Number(A.amount) || 0).toLocaleString('es-AR')}${A.category ? ` (${A.category})` : ''}`;
        case 'rename_category': return `Renombrar categoría "${A.from}" → "${A.to}" (y sus productos)`;
        case 'delete_category': return `ELIMINAR categoría "${A.name}"`;
        case 'delete_expense': return `ELIMINAR gasto ${A.expenseId}`;
        case 'set_sale': return Number(A.percent) > 0 ? `Poner ${A.productId} en oferta −${A.percent}%` : `Quitar oferta de ${A.productId}`;
        case 'edit_product': return `Editar "${A.productId}": ${Object.entries(A.fields || {}).map(([k, v]) => `${k} ${k === 'price' ? '$' + Number(v).toLocaleString('es-AR') : (Array.isArray(v) ? v.join('/') : v)}`).join(', ') || '(sin cambios)'}`;
        case 'schedule_promotion': return `Oferta −${A.discount}% ${A.category && !['all', 'todo', 'todos'].includes(String(A.category).toLowerCase()) ? `en ${A.category}` : 'toda la tienda'} · ${A.when || 'ahora'}`;
        case 'reject_review': return `ELIMINAR reseña ${A.reviewId}`;
        case 'update_home': return `Editar la home (${Object.keys(A).join(', ')})`;
        case 'toggle_maintenance': return `Mantenimiento → ${A.on ? 'ACTIVAR' : 'desactivar'}`;
        default: return `${a.tool} ${JSON.stringify(A)}`;
    }
};

export const AdminAssistantView = ({ orders, inventory, onClose }) => {
    const {
        siteConfig, aiConfig, categories, coupons, reviews, isMaintenance, paymentConfig,
        addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, addCoupon, deleteCoupon,
        updateSiteConfig, toggleMaintenance, uploadImage, logAiAction,
        updateOrderStatus, approveReview, rejectReview, createOrder, deleteOrder,
        expenses, addExpense, deleteExpense, addScheduledPromotion,
    } = useStore();

    const [messages, setMessages] = useState(() => {
        try { const s = JSON.parse(localStorage.getItem(HISTORY_KEY)); if (Array.isArray(s) && s.length) return s; } catch { /* noop */ }
        return [WELCOME];
    });
    const [input, setInput] = useState('');
    const [showGuide, setShowGuide] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busyMsg, setBusyMsg] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    // Fotos ya subidas+analizadas, pendientes de decidir qué hacer (publicar/borrador/venta).
    // Se mantienen entre mensajes para que el flujo guiado no pierda las URLs.
    const pendingPhotosRef = useRef([]);
    const [confirm, setConfirm] = useState(null); // { actions, resolve }
    const [wizardOpen, setWizardOpen] = useState(false); // wizard determinístico de carga
    const listRef = useRef(null);
    const fileRef = useRef(null);
    const confirmResolver = useRef(null);

    useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-60))); } catch { /* noop */ } }, [messages]);
    useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [messages, loading, confirm]);

    // Parte del día: al abrir Lau (una vez por día) resume ventas, pedidos
    // por enviar y stock que se está agotando. Cero configuración.
    useEffect(() => {
        try {
            const today = new Date().toDateString();
            if (localStorage.getItem('lau_briefing') === today) return;
            const ordersToday = (orders || []).filter(o => { try { return new Date(o.date).toDateString() === today; } catch { return false; } });
            const revToday = ordersToday.reduce((a, o) => a + (Number(o.total) || 0), 0);
            const threshold = parseInt(siteConfig?.sales?.scarcity?.threshold) || 5;
            const low = (inventory || []).filter(p => !(p.variants?.length) && Number(p.stock) > 0 && Number(p.stock) <= threshold);
            const out = (inventory || []).filter(p => !(p.variants?.length) && Number(p.stock) === 0 && p.active !== false);
            const toShip = (orders || []).filter(o => ['approved', 'paid', 'pending'].includes(o.status)).length;
            if (!ordersToday.length && !low.length && !out.length && !toShip) return;
            const lines = ['📊 ¡Hola! Resumen de hoy:'];
            lines.push(ordersToday.length ? `• 💰 ${ordersToday.length} venta(s) por $${revToday.toLocaleString('es-AR')}.` : '• Todavía no hubo ventas hoy.');
            if (toShip) lines.push(`• 📦 ${toShip} pedido(s) pendientes de enviar.`);
            if (out.length) lines.push(`• ⛔ SIN stock (reponer): ${out.slice(0, 6).map(p => p.name).join(', ')}${out.length > 6 ? '…' : ''}.`);
            if (low.length) lines.push(`• ⚠️ Poco stock: ${low.slice(0, 6).map(p => `${p.name} (${p.stock})`).join(', ')}${low.length > 6 ? '…' : ''}.`);
            lines.push('Pedime lo que necesites 💛');
            localStorage.setItem('lau_briefing', today);
            setMessages(prev => [...prev, { role: 'ai', text: lines.join('\n') }]);
        } catch { /* noop */ }
    }, []);

    const push = (m) => setMessages(prev => [...prev, m]);
    const aiConfigured = hasAdminAI(aiConfig);

    const findProduct = (q) => {
        if (q == null) return null;
        const s = String(q).trim().toLowerCase();
        return inventory.find(p => String(p.id).toLowerCase() === s)
            || inventory.find(p => (p.name || '').toLowerCase() === s)
            || inventory.find(p => (p.name || '').toLowerCase().includes(s));
    };
    const pCompact = (p) => `#${p.id} "${p.name}" $${p.price ?? '?'} stock:${p.stock ?? (p.variants?.length ? 'variantes' : 0)} cat:${p.category || '-'} ${p.active === false ? '[BORRADOR]' : '[visible]'}`;

    // Construye el patch para sumar/restar stock (delta negativo descuenta).
    // Soporta stock simple y variantes (array u objeto talle::color).
    const buildStockPatch = (p, size, color, delta) => {
        const hasVar = Array.isArray(p.variants)
            ? p.variants.length > 0
            : (p.variants && typeof p.variants === 'object' && Object.keys(p.variants).length > 0);
        if (hasVar) {
            if (!size && !color) return { error: `"${p.name}" maneja stock por talle/color. Decime el talle y color (ej: "talle M rojo").` };
            if (Array.isArray(p.variants)) {
                let found = false;
                const variants = p.variants.map(v => {
                    if (v.size === size && v.color === color) { found = true; return { ...v, stock: Math.max(0, (Number(v.stock) || 0) + delta) }; }
                    return v;
                });
                if (!found) return { error: `No encontré la variante ${[size, color].filter(Boolean).join(' / ')} en "${p.name}".` };
                const nuevo = getTotalStock({ ...p, variants });
                return { patch: { variants }, nuevo };
            }
            const key = `${size}::${color}`;
            const cur = Number(p.variants[key]) || 0;
            const variants = { ...p.variants, [key]: Math.max(0, cur + delta) };
            return { patch: { variants }, nuevo: getTotalStock({ ...p, variants }) };
        }
        const nuevo = Math.max(0, (Number(p.stock) || 0) + delta);
        return { patch: { stock: nuevo }, nuevo };
    };

    // --- EJECUTORES DE HERRAMIENTAS ---
    const exec = async (tool, A) => {
        switch (tool) {
            case 'query_inventory': {
                let r = [...inventory];
                if (A.search) r = r.filter(p => (p.name || '').toLowerCase().includes(String(A.search).toLowerCase()));
                if (A.category) r = r.filter(p => (p.category || '').toLowerCase() === String(A.category).toLowerCase());
                if (A.lowStock) r = r.filter(p => Number(p.stock) < 5 && !(p.variants?.length));
                if (A.onlyDrafts) r = r.filter(p => p.active === false);
                return r.length ? r.slice(0, 40).map(pCompact).join('\n') + (r.length > 40 ? `\n…(+${r.length - 40})` : '') : 'Sin resultados.';
            }
            case 'get_product': {
                const p = findProduct(A.idOrName); if (!p) return 'No encontré ese producto.';
                return JSON.stringify({ id: p.id, name: p.name, price: p.price, compareAtPrice: p.compareAtPrice, stock: p.stock, variants: p.variants || null, hasVariants: Array.isArray(p.variants) && p.variants.length > 0, category: p.category, colors: p.colors, sizes: p.sizes, visible: p.active !== false, badges: p.badges, description: p.description }, null, 1);
            }
            case 'quote_price': {
                const cost = Number(A.cost) || 0;
                if (cost <= 0) return 'Decime el costo de la prenda para calcular el precio.';
                const pack = Number(A.packaging) || 0;
                const ship = Number(A.shipping) || 0;
                const margin = A.margin != null ? Number(A.margin) : 50;
                const defaultFee = Number(paymentConfig?.realMpFeePercent) || Number(paymentConfig?.mpFee) || 6;
                const commission = A.commission != null ? Number(A.commission) : defaultFee;
                const totalCost = cost + pack + ship;
                const feeFactor = 1 - commission / 100;
                if (feeFactor <= 0) return `La comisión de MP (${commission}%) es 100% o más, revisá ese dato.`;
                // Margen = markup SOBRE el costo (lo que querés ganar sobre lo que te costó),
                // ajustado para que ESE margen te quede LIMPIO después de la comisión de MP.
                // precio = costo × (1 + margen%) / (1 − comisión%). Redondeo al múltiplo de 100.
                const price = Math.ceil((totalCost * (1 + margin / 100) / feeFactor) / 100) * 100;
                const commissionAmount = Math.round(price * commission / 100);
                const net = price - totalCost - commissionAmount;
                return `Precio de venta sugerido: $${price.toLocaleString('es-AR')}. Desglose: costo $${totalCost.toLocaleString('es-AR')}${(pack || ship) ? ` (prenda $${cost.toLocaleString('es-AR')}${pack ? ' + packaging $' + pack.toLocaleString('es-AR') : ''}${ship ? ' + envío $' + ship.toLocaleString('es-AR') : ''})` : ''}, comisión MP ${commission}% = $${commissionAmount.toLocaleString('es-AR')}. Con un margen del ${margin}% sobre el costo, ganás $${net.toLocaleString('es-AR')} netos por venta (después de MP). Para publicarlo usá create_product con price ${price}.`;
            }
            case 'query_mp_fee': {
                const real = Number(paymentConfig?.realMpFeePercent) || 0;
                const manual = Number(paymentConfig?.mpFee) || 0;
                if (real > 0) return `La comisión de Mercado Pago que uso es ${real}%, MEDIDA de tus ventas reales (se actualiza sola con cada venta aprobada — no tenés que fijarte nada). Es la que aplico al calcular precios.`;
                if (manual > 0) return `Uso ${manual}% de comisión de MP (la que cargaste en Configuración). Apenas entren ventas por Mercado Pago, la mido sola de tu cuenta y la actualizo a la real.`;
                return `Todavía no hubo ventas por Mercado Pago para medir tu comisión real, así que uso un estimado de 6%. En cuanto tengas una venta aprobada, la mido sola de tu cuenta y la empiezo a usar automáticamente (no tenés que mirar nada).`;
            }
            case 'query_reviews': {
                let r = [...(reviews || [])];
                if (A.onlyPending) r = r.filter(x => !x.approved);
                if (A.productId) { const p = findProduct(A.productId); if (p) r = r.filter(x => String(x.productId) === String(p.id)); }
                return r.length
                    ? r.slice(0, 20).map(x => `#${x.id} ${'★'.repeat(x.rating || 0)} "${(x.text || '').slice(0, 70)}" — ${x.userName || '?'} ${x.approved ? '[aprobada]' : '[PENDIENTE]'}`).join('\n')
                    : 'Sin reseñas.';
            }
            case 'approve_review': {
                if (!A.reviewId) return 'Falta el id de la reseña.';
                await approveReview(A.reviewId);
                return `Reseña ${A.reviewId} aprobada y publicada.`;
            }
            case 'reject_review': {
                if (!A.reviewId) return 'Falta el id de la reseña.';
                await rejectReview(A.reviewId);
                return `Reseña ${A.reviewId} eliminada.`;
            }
            case 'set_order_status': {
                const o = orders.find(x => String(x.id).toLowerCase() === String(A.orderId).toLowerCase());
                if (!o) return 'No encontré ese pedido.';
                const st = String(A.status || '').toLowerCase();
                if (!['pending', 'shipped', 'delivered', 'cancelled', 'approved'].includes(st)) return `Estado inválido: ${A.status}.`;
                await updateOrderStatus(o.id, st, A.tracking ? { trackingNumber: String(A.tracking) } : {});
                return `Pedido ${o.id} → ${st}${A.tracking ? ` (tracking ${A.tracking})` : ''}.`;
            }
            case 'generate_label': {
                const o = orders.find(x => String(x.id).toLowerCase() === String(A.orderId).toLowerCase());
                if (!o) return 'No encontré ese pedido. Decime el N° (ej: ORD-123456).';
                const r = siteConfig?.remitente || {};
                await generateShippingLabel(o, r);
                const faltan = (!r.address || !r.cp) ? ' (Tip: completá la dirección y CP del remitente en Admin → Configuración → Envíos para que la etiqueta salga completa.)' : '';
                return `Etiqueta del pedido ${o.id} generada y descargada en PDF. Imprimila y pegala al paquete.${faltan}`;
            }
            case 'record_sale': {
                const p = findProduct(A.productId); if (!p) return 'No encontré ese producto.';
                const qty = Math.max(1, Number(A.quantity) || 1);
                const size = A.size ? String(A.size) : '';
                const color = A.color ? String(A.color) : '';
                // Descontar stock (variante-aware)
                const sp = buildStockPatch(p, size, color, -qty);
                if (sp.error) return sp.error;
                // Precio / total
                const unit = A.unitPrice != null ? Number(A.unitPrice)
                    : (A.amount != null ? Number(A.amount) / qty : (Number(p.price) || 0));
                const total = A.amount != null ? Number(A.amount) : Math.round(unit * qty);
                await updateProduct(p.id, sp.patch);
                const orderId = `MAN-${String(Date.now()).slice(-6)}`;
                const channel = A.channel ? String(A.channel) : 'externa';
                await createOrder({
                    id: orderId,
                    date: new Date().toISOString(),
                    status: 'approved',
                    total,
                    manual: true,
                    channel,
                    paymentMethod: channel,
                    stockApplied: true,
                    customer: { nombre: A.customer ? String(A.customer) : 'Venta externa', email: '' },
                    items: [{ id: p.id, name: p.name, price: Math.round(unit), quantity: qty, size, color, category: p.category || '', image: p.image || p.media?.[0]?.url || '', cost: Number(p.cost) || 0 }],
                });
                const variante = (size || color) ? ` (${[size, color].filter(Boolean).join(' / ')})` : '';
                return `✅ Venta registrada: ${qty}× "${p.name}"${variante} por $${total.toLocaleString('es-AR')} (${channel}). Stock descontado → quedan ${sp.nuevo}. Quedó como pedido ${orderId} y ya cuenta en tus ventas.`;
            }
            case 'adjust_stock': {
                const p = findProduct(A.productId); if (!p) return 'No encontré ese producto.';
                const delta = Math.trunc(Number(A.delta) || 0);
                if (!delta) return 'Decime cuántas unidades sumar (ej: "sumá 10") o restar (ej: "restá 3").';
                const size = A.size ? String(A.size) : '';
                const color = A.color ? String(A.color) : '';
                const sp = buildStockPatch(p, size, color, delta);
                if (sp.error) return sp.error;
                await updateProduct(p.id, sp.patch);
                const variante = (size || color) ? ` (${[size, color].filter(Boolean).join(' / ')})` : '';
                return `Stock de "${p.name}"${variante} ${delta > 0 ? '+' : ''}${delta} → ahora ${sp.nuevo} unidad(es). (Sin registrar venta.)`;
            }
            case 'cancel_sale': {
                const o = orders.find(x => String(x.id).toLowerCase() === String(A.orderId).toLowerCase());
                if (!o) return 'No encontré esa venta/pedido. Decime el N° (ej: MAN-123456).';
                let restored = 0;
                // Reponer stock SOLO si la venta lo había descontado (evita inflar el stock).
                if (o.stockApplied) {
                    for (const it of (o.items || [])) {
                        const prod = inventory.find(p => String(p.id) === String(it.id));
                        if (!prod) continue;
                        const sp = buildStockPatch(prod, it.size ? String(it.size) : '', it.color ? String(it.color) : '', Number(it.quantity) || 0);
                        if (sp.patch) { await updateProduct(prod.id, sp.patch); restored++; }
                    }
                }
                await deleteOrder(o.id);
                return `Venta ${o.id} anulada y borrada de tus números.${restored ? ` Repuse el stock de ${restored} producto(s).` : ' (No había stock descontado para reponer.)'}`;
            }
            case 'query_profit': {
                const range = A.range || 'today';
                const now = Date.now();
                const span = range === '7d' ? 7 : range === '30d' ? 30 : range === 'all' ? null : 0;
                const today = new Date().toDateString();
                const paid = new Set(['approved', 'paid', 'shipped', 'delivered']);
                const list = (orders || []).filter(o => {
                    if (!paid.has(o.status) && !o.manual) return false;
                    if (range === 'all') return true;
                    if (range === 'today') { try { return new Date(o.date).toDateString() === today; } catch { return false; } }
                    return new Date(o.date).getTime() >= now - span * 864e5;
                });
                if (!list.length) return `No hay ventas registradas en ese período (${range}). La ganancia neta es $0.`;
                let revenue = 0, cost = 0, fees = 0, sinCosto = 0;
                for (const o of list) {
                    revenue += Number(o.total) || 0;
                    for (const it of (o.items || [])) {
                        const prod = inventory.find(p => String(p.id) === String(it.id));
                        const c = Number(prod?.cost) || 0;
                        if (!c) sinCosto++;
                        cost += c * (Number(it.quantity) || 1);
                    }
                    if (o.mpFeeAmount != null) fees += Number(o.mpFeeAmount) || 0;
                    else if (!o.manual) {
                        const pct = Number(paymentConfig?.realMpFeePercent || paymentConfig?.mpFee) || 0;
                        fees += (Number(o.total) || 0) * pct / 100;
                    }
                }
                // Gastos cargados en el mismo período
                let gastos = 0;
                for (const e of (expenses || [])) {
                    const ed = Number(e.date) || 0;
                    if (range === 'all') gastos += Number(e.amount) || 0;
                    else if (range === 'today') { try { if (new Date(ed).toDateString() === today) gastos += Number(e.amount) || 0; } catch { /* noop */ } }
                    else if (ed >= now - span * 864e5) gastos += Number(e.amount) || 0;
                }
                const net = revenue - cost - fees - gastos;
                const fmt = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
                const aviso = sinCosto ? ` Ojo: ${sinCosto} ítem(s) sin costo cargado, así que la ganancia real podría ser menor.` : '';
                const gLine = gastos ? ` − Gastos ${fmt(gastos)}` : '';
                return `Ganancia neta (${range}): ${fmt(net)} sobre ${list.length} venta(s).\nIngresos ${fmt(revenue)} − Costo de productos ${fmt(cost)} − Comisión MP ${fmt(fees)}${gLine} = ${fmt(net)}.${aviso}`;
            }
            case 'record_expense': {
                const amount = Number(A.amount) || 0;
                if (amount <= 0) return 'Decime el monto del gasto (ej: "gasté $80000 en tela").';
                const concept = A.concept ? String(A.concept) : 'Gasto';
                const category = A.category ? String(A.category) : 'otros';
                const id = await addExpense({ amount, concept, category, date: Date.now() });
                return id ? `Gasto registrado: ${concept} — $${amount.toLocaleString('es-AR')} (${category}). Se va a restar de tu ganancia neta.` : 'No se pudo registrar el gasto.';
            }
            case 'query_expenses': {
                const range = A.range || '30d';
                const now = Date.now();
                const span = range === '7d' ? 7 : range === 'today' ? 0 : range === 'all' ? null : 30;
                const today = new Date().toDateString();
                const list = (expenses || []).filter(e => {
                    const ed = Number(e.date) || 0;
                    if (range === 'all') return true;
                    if (range === 'today') { try { return new Date(ed).toDateString() === today; } catch { return false; } }
                    return ed >= now - span * 864e5;
                });
                if (!list.length) return `No hay gastos cargados en ese período (${range}).`;
                const total = list.reduce((a, e) => a + (Number(e.amount) || 0), 0);
                const lines = list.slice(0, 15).map(e => `• ${e.concept || 'Gasto'} — $${(Number(e.amount) || 0).toLocaleString('es-AR')} (${e.category || 'otros'})${e.id ? ` [id ${e.id}]` : ''}`).join('\n');
                return `Gastos (${range}): $${total.toLocaleString('es-AR')} en ${list.length} ítem(s).\n${lines}`;
            }
            case 'delete_expense': {
                if (!A.expenseId) return 'Falta el id del gasto.';
                await deleteExpense(A.expenseId);
                return `Gasto ${A.expenseId} eliminado.`;
            }
            case 'set_sale': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                const pct = Number(A.percent) || 0;
                if (pct <= 0) {
                    await updateProduct(p.id, { compareAtPrice: 0, badges: { ...(p.badges || {}), isOnSale: false } });
                    return `Oferta quitada de "${p.name}".`;
                }
                const original = Number(p.compareAtPrice) > Number(p.price) ? Number(p.compareAtPrice) : Number(p.price);
                const newPrice = Math.round(original * (1 - pct / 100));
                await updateProduct(p.id, { price: newPrice, compareAtPrice: original, badges: { ...(p.badges || {}), isOnSale: true } });
                return `"${p.name}" −${pct}% → $${newPrice.toLocaleString('es-AR')} (antes $${original.toLocaleString('es-AR')}).`;
            }
            case 'edit_product': {
                const p = findProduct(A.productId); if (!p) return 'No encontré ese producto.';
                const f = A.fields || {};
                const patch = {};
                if (f.name != null) patch.name = String(f.name);
                if (f.price != null) patch.price = Math.max(0, Number(f.price) || 0);
                if (f.category != null) patch.category = String(f.category);
                if (f.colors != null) patch.colors = toArr(f.colors);
                if (f.sizes != null) patch.sizes = toArr(f.sizes);
                if (f.description != null) patch.description = String(f.description);
                let stockNota = '';
                if (f.stock != null) {
                    const hasVar = Array.isArray(p.variants) ? p.variants.length > 0 : (p.variants && typeof p.variants === 'object' && Object.keys(p.variants).length > 0);
                    if (hasVar) stockNota = ' (el stock no lo toqué: este producto maneja stock por talle/color, decime "poné N del talle X color Y").';
                    else patch.stock = Math.max(0, Number(f.stock) || 0);
                }
                if (!Object.keys(patch).length) return `No cambié nada${stockNota ? '.' + stockNota : ' (decime qué editar: precio, stock, nombre, colores, talles, categoría o descripción).'}`;
                await updateProduct(p.id, patch);
                const resumen = Object.entries(patch).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('/') : (k === 'price' ? '$' + Number(v).toLocaleString('es-AR') : v)}`).join(', ');
                return `"${p.name}" actualizado → ${resumen}.${stockNota}`;
            }
            case 'business_summary': {
                const range = A.range || '30d';
                const now = Date.now();
                const span = range === 'today' ? 0 : range === '7d' ? 7 : range === 'all' ? null : 30;
                const today = new Date().toDateString();
                const paid = new Set(['approved', 'paid', 'shipped', 'delivered', 'pending']);
                const list = (orders || []).filter(o => {
                    if (!paid.has(o.status) && !o.manual) return false;
                    if (range === 'all') return true;
                    if (range === 'today') { try { return new Date(o.date).toDateString() === today; } catch { return false; } }
                    return new Date(o.date).getTime() >= now - span * 864e5;
                });
                let revenue = 0, cost = 0, fees = 0; const counts = {};
                for (const o of list) {
                    revenue += Number(o.total) || 0;
                    for (const it of (o.items || [])) {
                        const prod = inventory.find(pp => String(pp.id) === String(it.id));
                        cost += (Number(prod?.cost) || 0) * (Number(it.quantity) || 1);
                        const key = it.name || prod?.name || 'Producto';
                        counts[key] = (counts[key] || 0) + (Number(it.quantity) || 1);
                    }
                    if (!o.manual) { const pct = Number(paymentConfig?.realMpFeePercent || paymentConfig?.mpFee) || 0; fees += (Number(o.total) || 0) * pct / 100; }
                }
                let gastos = 0;
                for (const e of (expenses || [])) {
                    const ed = Number(e.date) || 0;
                    if (range === 'all') gastos += Number(e.amount) || 0;
                    else if (range === 'today') { try { if (new Date(ed).toDateString() === today) gastos += Number(e.amount) || 0; } catch { /* noop */ } }
                    else if (ed >= now - span * 864e5) gastos += Number(e.amount) || 0;
                }
                const net = revenue - cost - fees - gastos;
                const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                const out = (inventory || []).filter(p => !(p.variants?.length) && Number(p.stock) === 0 && p.active !== false);
                const low = (inventory || []).filter(p => !(p.variants?.length) && Number(p.stock) > 0 && Number(p.stock) <= 5);
                const drafts = (inventory || []).filter(p => p.active === false);
                const fmt = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
                const L = [`RESUMEN (${range}):`];
                L.push(`• Ventas: ${list.length} · Facturado ${fmt(revenue)} · Ganancia neta ${fmt(net)}.`);
                L.push(top.length ? `• Más vendidos: ${top.map(([n, q]) => `${n} (${q})`).join(', ')}.` : '• Todavía sin ventas en el período.');
                if (out.length) L.push(`• ⛔ SIN stock (reponer ya): ${out.slice(0, 8).map(p => p.name).join(', ')}.`);
                if (low.length) L.push(`• ⚠️ Poco stock: ${low.slice(0, 8).map(p => `${p.name} (${p.stock})`).join(', ')}.`);
                if (drafts.length) L.push(`• 📝 ${drafts.length} en borrador sin publicar.`);
                L.push('CONSEJOS: priorizá reponer lo agotado/más vendido, destacá en la home lo que más sale, y publicá los borradores que estén listos.');
                return L.join('\n');
            }
            case 'schedule_promotion': {
                const discount = Math.abs(Number(A.discount) || 0);
                if (!discount) return 'Decime el % de descuento (ej: "20% off").';
                const catRaw = String(A.category || '').trim().toLowerCase();
                const allCats = !catRaw || ['all', 'todo', 'todos', 'toda', 'tienda', 'la tienda'].includes(catRaw);
                const targets = (inventory || []).filter(p => allCats || (p.category || '').toLowerCase() === catRaw);
                if (!targets.length) return `No encontré productos${allCats ? '' : ` en la categoría "${A.category}"`}.`;
                const ts = parseWhen(A.when);
                const ahora = ts != null && ts <= Date.now() + 60000;
                if (ahora) {
                    let n = 0;
                    for (const p of targets) {
                        const base = Number(p.compareAtPrice) > Number(p.price) ? Number(p.compareAtPrice) : Number(p.price);
                        if (!base) continue;
                        await updateProduct(p.id, { price: Math.round(base * (1 - discount / 100)), compareAtPrice: base, badges: { ...(p.badges || {}), isOnSale: true } });
                        n++;
                    }
                    return `✅ Oferta de −${discount}% aplicada YA a ${n} producto(s)${allCats ? ' de toda la tienda' : ` de "${A.category}"`}. El precio anterior queda tachado. Para sacarla decime "quitá la oferta de ...".`;
                }
                const name = A.name ? String(A.name) : `Oferta ${discount}% ${allCats ? 'tienda' : A.category}`;
                await addScheduledPromotion({ name, type: 'bulk_discount', category: allCats ? '' : String(A.category), discount, whenText: String(A.when || ''), startsAt: ts || null });
                const cuando = ts ? new Date(ts).toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : `"${A.when}"`;
                return `🗓️ Oferta "${name}" (−${discount}%) programada para ${cuando}. Se aplica sola cuando llegue el momento (necesitás tener la tienda/admin abierta cerca de esa hora).${ts ? '' : ' Ojo: no pude entender bien la fecha, igual la dejé anotada para que la actives vos.'}`;
            }
            case 'query_orders': {
                let r = [...orders];
                if (A.status) r = r.filter(o => o.status === A.status);
                if (A.sinceDays) { const t = Date.now() - A.sinceDays * 864e5; r = r.filter(o => new Date(o.date).getTime() >= t); }
                r = r.slice(0, A.limit || 15);
                return r.length ? r.map(o => `${o.id} · ${new Date(o.date).toLocaleDateString('es-AR')} · $${Number(o.total || 0).toLocaleString('es-AR')} · ${o.status} · ${o.customer?.email || ''}`).join('\n') : 'Sin órdenes.';
            }
            case 'query_sales': {
                const range = A.range || 'today';
                const now = Date.now();
                const span = range === 'today' ? 0 : range === '7d' ? 7 : range === '30d' ? 30 : null;
                const list = orders.filter(o => {
                    if (range === 'all') return true;
                    if (range === 'today') return new Date(o.date).toDateString() === new Date().toDateString();
                    return new Date(o.date).getTime() >= now - span * 864e5;
                });
                const rev = list.reduce((a, o) => a + (Number(o.total) || 0), 0);
                return `Rango ${range}: ${list.length} órdenes, facturado $${rev.toLocaleString('es-AR')}.`;
            }
            case 'query_customers': {
                const map = {};
                orders.forEach(o => { const e = o.customer?.email; if (!e) return; map[e] = map[e] || { email: e, n: 0, total: 0 }; map[e].n++; map[e].total += Number(o.total) || 0; });
                const top = Object.values(map).sort((a, b) => b.total - a.total).slice(0, A.top || 5);
                return top.length ? top.map(c => `${c.email} · ${c.n} compras · $${c.total.toLocaleString('es-AR')}`).join('\n') : 'Sin clientes aún.';
            }
            case 'query_coupons':
                return coupons.length ? coupons.map(c => `${c.code} · ${c.type === 'fixed' ? '$' + (c.value ?? c.discount) : (c.value ?? c.discount) + '%'} · ${c.active === false ? 'inactivo' : 'activo'} · usos ${c.usedCount || 0}`).join('\n') : 'Sin cupones.';
            case 'create_category': {
                const name = String(A.name || '').trim(); if (!name) return 'Falta el nombre.';
                const exists = (categories || []).some(c => (c.name || '').toLowerCase() === name.toLowerCase());
                if (exists) return `La categoría "${name}" ya existía (no la dupliqué).`;
                await addCategory({ id: name.toLowerCase().replace(/\s+/g, '-'), name });
                return `Categoría "${name}" creada.`;
            }
            case 'rename_category': {
                const from = String(A.from || '').trim();
                const to = String(A.to || '').trim();
                if (!from || !to) return 'Decime la categoría actual y el nombre nuevo.';
                const cat = (categories || []).find(c => (c.name || '').toLowerCase() === from.toLowerCase() || String(c.id) === from);
                if (!cat) return `No encontré la categoría "${from}".`;
                await addCategory({ id: cat.id, name: to });
                // Migrar los productos que usaban el nombre viejo
                let n = 0;
                for (const p of inventory) {
                    if ((p.category || '').toLowerCase() === (cat.name || '').toLowerCase()) {
                        await updateProduct(p.id, { category: to }); n++;
                    }
                }
                return `Categoría "${cat.name}" renombrada a "${to}".${n ? ` Actualicé ${n} producto(s).` : ''}`;
            }
            case 'delete_category': {
                const key = String(A.name || '').trim();
                const cat = (categories || []).find(c => (c.name || '').toLowerCase() === key.toLowerCase() || String(c.id) === key);
                if (!cat) return `No encontré la categoría "${key}".`;
                const orphans = (inventory || []).filter(p => (p.category || '').toLowerCase() === (cat.name || '').toLowerCase()).length;
                await deleteCategory(cat.id);
                return `Categoría "${cat.name}" eliminada.${orphans ? ` Ojo: ${orphans} producto(s) tenían esa categoría y quedaron sin categoría en el menú (reasignáles otra cuando quieras).` : ''}`;
            }
            case 'generate_copy': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                const c = await generateProductCopy(p, aiConfig);
                await updateProduct(p.id, { description: c.description, seoKeywords: (c.keywords || []).join(', ') });
                return `Copy actualizado en "${p.name}".`;
            }
            case 'set_badges': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                await updateProduct(p.id, { badges: { ...(p.badges || {}), ...(A.badges || {}) } });
                return `Etiquetas actualizadas en "${p.name}".`;
            }
            case 'update_product_fields': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                const f = A.fields || {}; const up = {};
                if (f.name) up.name = String(f.name);
                if (f.description) up.description = String(f.description);
                if (f.category) up.category = String(f.category);
                if (f.colors) up.colors = toArr(f.colors);
                if (f.sizes) up.sizes = toArr(f.sizes);
                if (!Object.keys(up).length) return 'No había campos para actualizar.';
                await updateProduct(p.id, up);
                return `"${p.name}" actualizado (${Object.keys(up).join(', ')}).`;
            }
            case 'feature_products': {
                const ids = Array.isArray(A.productIds) ? A.productIds : [];
                let n = 0;
                for (const id of ids) { const p = findProduct(id); if (p) { await updateProduct(p.id, { badges: { ...(p.badges || {}), isFeatured: true } }); n++; } }
                return `${n} producto(s) destacado(s) en la home.`;
            }
            case 'create_coupon': {
                const code = String(A.code || '').toUpperCase().trim(); if (!code) return 'Falta el código.';
                const value = Number(A.value) || 0;
                await addCoupon({
                    code, type: A.type === 'fixed' ? 'fixed' : 'percentage',
                    value, discount: value,
                    minPurchase: Number(A.minPurchase) || 0,
                    maxUses: Number(A.maxUses) || 0,
                    active: true,
                    expiresAt: A.expiresInDays ? Date.now() + Number(A.expiresInDays) * 864e5 : null,
                });
                return `Cupón ${code} creado.`;
            }
            case 'create_product': {
                const visible = A.visible !== false;
                // Soporta una sola foto (imageUrl) o varias del mismo producto (imageUrls -> galería)
                const imgs = (Array.isArray(A.imageUrls) ? A.imageUrls : [A.imageUrl]).map(u => String(u || '').trim()).filter(Boolean);
                const img = imgs[0] || '';
                const product = {
                    name: String(A.name || 'Producto'),
                    price: Number(A.price) || 0,
                    stock: Number(A.stock) || 0,
                    category: String(A.category || ''),
                    colors: toArr(A.colors),
                    sizes: toArr(A.sizes),
                    description: String(A.description || ''),
                    image: img,
                    images: imgs,
                    media: imgs.map(u => ({ type: 'image', url: u })),
                    badges: { isNew: true },
                    active: visible,
                };
                const id = await addProduct(product);
                // Quitar de las fotos pendientes las que se acaban de usar (flujo guiado)
                if (imgs.length) pendingPhotosRef.current = pendingPhotosRef.current.filter(p => !imgs.includes(p.url));
                const galeria = imgs.length > 1 ? ` con ${imgs.length} fotos` : '';
                return id ? `Producto "${product.name}"${galeria} ${visible ? 'PUBLICADO' : 'guardado como borrador'} (id ${id}).` : 'No se pudo crear (revisá Cloudinary/permisos).';
            }
            case 'set_price': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                await updateProduct(p.id, { price: Number(A.price) || 0 });
                return `Precio de "${p.name}" → $${Number(A.price || 0).toLocaleString('es-AR')}.`;
            }
            case 'set_stock': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                const value = Math.max(0, Number(A.stock) || 0);
                const size = A.size ? String(A.size) : '';
                const color = A.color ? String(A.color) : '';
                const hasVar = Array.isArray(p.variants)
                    ? p.variants.length > 0
                    : (p.variants && typeof p.variants === 'object' && Object.keys(p.variants).length > 0);
                if (hasVar) {
                    if (!size && !color) return `"${p.name}" maneja stock por talle/color. Decime el talle y color (ej: "talle 5 color Chocolate") y lo seteo.`;
                    const cur = getVariantStock(p, size, color);
                    const sp = buildStockPatch(p, size, color, value - cur);
                    if (sp.error) return sp.error;
                    await updateProduct(p.id, sp.patch);
                    return `Stock de "${p.name}" (${[size, color].filter(Boolean).join(' / ')}) → ${value}. Total ahora: ${sp.nuevo}.`;
                }
                await updateProduct(p.id, { stock: value });
                return `Stock de "${p.name}" → ${value}.`;
            }
            case 'bulk_price': {
                const pct = Number(A.percent) || 0;
                const f = A.direction === 'down' ? 1 - pct / 100 : 1 + pct / 100;
                const all = !A.category || String(A.category).toLowerCase() === 'all' || String(A.category).toLowerCase() === 'todos';
                const targets = inventory.filter(p => all || (p.category || '').toLowerCase() === String(A.category).toLowerCase());
                let n = 0;
                for (const p of targets) { if (p.price) { await updateProduct(p.id, { price: Math.round(Number(p.price) * f) }); n++; } }
                return `${n} producto(s) ajustados ${A.direction === 'down' ? '−' : '+'}${pct}%.`;
            }
            case 'toggle_visible': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                await updateProduct(p.id, { active: A.visible !== false });
                return `"${p.name}" ahora ${A.visible !== false ? 'visible' : 'oculto'}.`;
            }
            case 'delete_product': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                await deleteProduct(p.id);
                return `Producto "${p.name}" eliminado.`;
            }
            case 'delete_coupon': {
                const c = coupons.find(x => String(x.id) === String(A.couponId) || (x.code || '').toLowerCase() === String(A.couponId).toLowerCase());
                if (!c) return 'No encontré el cupón.';
                await deleteCoupon(c.id);
                return `Cupón ${c.code} eliminado.`;
            }
            case 'update_home': {
                const cfg = {};
                if (A.hero) cfg.hero = { ...(siteConfig.hero || {}), ...A.hero };
                if (A.announcement) cfg.announcement = { ...(siteConfig.announcement || {}), ...A.announcement };
                if (A.marquee !== undefined) cfg.marquee = String(A.marquee);
                if (!Object.keys(cfg).length) return 'No había cambios para la home.';
                await updateSiteConfig(cfg);
                return `Home actualizada (${Object.keys(cfg).join(', ')}).`;
            }
            case 'toggle_maintenance': {
                const want = Boolean(A.on);
                if (want === isMaintenance) return `Mantenimiento ya estaba ${want ? 'activo' : 'desactivado'}.`;
                await toggleMaintenance();
                return `Mantenimiento ${want ? 'ACTIVADO' : 'desactivado'}.`;
            }
            default:
                return `Herramienta desconocida: ${tool}`;
        }
    };

    const askConfirm = (actions) => new Promise((resolve) => { confirmResolver.current = resolve; setConfirm({ actions }); });
    const resolveConfirm = (ok) => { const r = confirmResolver.current; confirmResolver.current = null; setConfirm(null); r && r(ok); };

    const runActions = async (actions) => {
        const results = [];
        for (const a of actions) {
            try {
                setBusyMsg(`Ejecutando ${a.tool}…`);
                const out = await exec(a.tool, a.args || {});
                results.push(`✓ ${a.tool}: ${out}`);
            } catch (e) {
                results.push(`✗ ${a.tool}: ${e?.message || 'error'}`);
            }
        }
        return results;
    };

    const agentLoop = async (transcript, snapshotCtx) => {
        for (let step = 0; step < MAX_STEPS; step++) {
            setBusyMsg('Pensando…');
            const { system, user } = buildAgentMessages({ snapshot: buildSnapshot(snapshotCtx), transcript: transcript.slice(-60) });
            const raw = await generateText(user, aiConfig, { scope: 'admin', system, temperature: 0.3 });
            let plan = parsePlan(raw);
            // Auto-recuperación: si el modelo no devolvió nada interpretable,
            // reintentá UNA vez exigiendo JSON estricto antes de darte por vencida.
            if (!plan.actions.length && plan.reply === 'No entendí bien, ¿me lo repetís?') {
                setBusyMsg('Reintentando…');
                const raw2 = await generateText(
                    user + '\n\nIMPORTANTE: respondé SOLO con el objeto JSON {"reply":"...","actions":[...],"done":true|false}. Sin texto fuera del JSON. Si falta algún dato, pedilo en "reply".',
                    aiConfig, { scope: 'admin', system, temperature: 0.2 }
                );
                const plan2 = parsePlan(raw2);
                if (plan2.actions.length || plan2.reply !== 'No entendí bien, ¿me lo repetís?') plan = plan2;
            }
            transcript.push({ role: 'assistant', content: JSON.stringify({ reply: plan.reply, actions: plan.actions, done: plan.done }) });
            if (plan.reply) push({ role: 'ai', text: plan.reply, options: plan.options });

            // Sin acciones = respondió o te hizo una pregunta. Paramos y esperamos tu
            // respuesta (antes seguía el loop y repetía el mismo mensaje hasta el límite).
            if (!plan.actions.length) return;

            const sensitive = plan.actions.filter(a => isSensitive(a.tool));
            const auto = plan.actions.filter(a => !isSensitive(a.tool));
            const results = [];

            if (auto.length) results.push(...await runActions(auto));

            if (sensitive.length) {
                const ok = await askConfirm(sensitive);
                if (ok) {
                    push({ role: 'system', text: 'Confirmado ✓' });
                    results.push(...await runActions(sensitive));
                } else {
                    push({ role: 'system', text: 'Cancelado por vos' });
                    results.push(`✗ usuario canceló: ${sensitive.map(a => a.tool).join(', ')}`);
                }
            }

            transcript.push({ role: 'tool', content: results.join('\n') });
            push({ role: 'system', text: results.join('\n') });

            // CLAVE para no repetir: si hubo cualquier ESCRITURA, frenamos y esperamos
            // al usuario (la respuesta ya le dijo qué pasó o le hizo la próxima pregunta).
            // Solo seguimos el loop cuando fueron PURAS lecturas (query_*/get_product),
            // así el modelo puede contestar con esos datos. Antes, con done:false el loop
            // re-ejecutaba la misma acción (ej: creaba la categoría 3 veces).
            const onlyReads = plan.actions.every(a => a.tool.startsWith('query_') || a.tool === 'get_product');
            if (!onlyReads) return;
        }
        push({ role: 'system', text: 'Llegué al límite de pasos. Si quedó algo a medias, pedímelo de nuevo más puntual.' });
    };

    const handleSend = async (overrideText) => {
        const text = (typeof overrideText === 'string' ? overrideText : input).trim();
        if ((!text && !files.length) || loading) return;
        if (!aiConfigured) { push({ role: 'system', text: 'Configurá una key de Cerebras (o Gemini) en Admin → Configuración para activarme.' }); return; }

        setInput('');
        setLoading(true);
        const batch = files;
        const batchPreviews = previews;
        setFiles([]); setPreviews([]);
        const transcript = [];
        // Reconstruir contexto desde el chat visible. Ventana AMPLIA (40) para que un
        // wizard largo (nombre, categoría, varios colores y talles, stock, precio) NO
        // pierda los datos del principio y vuelva a preguntarlos en loop.
        messages.filter(m => m.role === 'user' || m.role === 'ai').slice(-40).forEach(m => transcript.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

        const nFotos = batch.length;
        push({ role: 'user', text: text || (nFotos ? `(${nFotos} foto${nFotos > 1 ? 's' : ''} adjunta${nFotos > 1 ? 's' : ''})` : '(imagen adjunta)'), img: batchPreviews[0] });

        try {
            if (nFotos) {
                setBusyMsg(nFotos > 1 ? `Subiendo ${nFotos} fotos…` : 'Subiendo la foto…');
                const analyzed = [];
                for (let i = 0; i < batch.length; i++) {
                    const url = await uploadImage(batch[i]);
                    if (!url) continue;
                    // El dueño da TODOS los datos a mano: no auto-detectamos nada.
                    analyzed.push({ url });
                }
                if (!analyzed.length) throw new Error('No se pudieron subir las imágenes (revisá Cloudinary en Configuración).');
                pendingPhotosRef.current = analyzed;
            }

            // Inyectar las fotos pendientes (recién subidas o de un turno anterior) para
            // que el flujo guiado no pierda las URLs entre pregunta y respuesta.
            if (pendingPhotosRef.current.length) {
                const items = pendingPhotosRef.current
                    .map((p, i) => `${i + 1}) imageUrl: ${p.url}`)
                    .join('\n');
                transcript.push({
                    role: 'system', content:
                        `Hay ${pendingPhotosRef.current.length} foto(s) de prenda YA subida(s), esperando que el dueño cargue los datos:\n${items}\n\n` +
                        `IMPORTANTE: NO sabés qué prenda es, ni el nombre, ni el color, ni nada — NO lo adivines ni lo deduzcas de la imagen. El dueño te va a dictar TODOS los datos (nombre, color, talle, stock, precio/costo). Pedíselos de a uno, con menús de botones cuando se pueda. ` +
                        `EMPEZÁ preguntando el NOMBRE de la prenda (eso va en texto). Después seguí el wizard pidiendo color, talle, stock y precio/costo con menús. ` +
                        `Cuando tengas todo, preguntá qué hacer (Publicar / Borrador / Registrar venta) y ejecutá create_product (visible=true publicar, false borrador) usando la imageUrl exacta. Si te da el costo, calculá con quote_price. Si hay varias fotos, procesalas todas.`
                });
            }
            transcript.push({ role: 'user', content: text || 'Tengo estas prendas.' });
            await agentLoop(transcript, { inventory, orders, categories, coupons, reviews, isMaintenance, siteConfig });
            logAiAction?.('copilot', text || '(imagen)', 'ok');
        } catch (e) {
            push({ role: 'system', text: `Error: ${e?.message || e}` });
        } finally {
            setLoading(false); setBusyMsg('');
        }
    };

    const onPick = (e) => {
        const picked = Array.from(e.target.files || []); if (!picked.length) return;
        setFiles(prev => [...prev, ...picked].slice(0, 12));
        setPreviews(prev => [...prev, ...picked.map(f => URL.createObjectURL(f))].slice(0, 12));
        e.target.value = '';
    };

    const SUGGESTIONS = [
        'Cargá este producto, me costó $8000 y quiero 50% de margen',
        '¿Cuánto vendí esta semana?',
        '¿Qué pedidos tengo pendientes de enviar?',
        '¿Qué productos tienen poco stock?',
        'Creá un cupón VERANO15 de 15%',
        'Destacá en la home los 4 productos más nuevos',
        'Aprobá las reseñas pendientes',
    ];

    const clearChat = () => {
        if (loading) return;
        setMessages([WELCOME]);
        try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0A0A0A]/95 backdrop-blur-md">
            {/* Wizard determinístico de carga de producto (no usa IA: cero loops) */}
            {wizardOpen && (
                <ProductWizard
                    categories={categories}
                    uploadImage={uploadImage}
                    addProduct={addProduct}
                    addCategory={addCategory}
                    paymentConfig={paymentConfig}
                    aiConfig={aiConfig}
                    onClose={() => setWizardOpen(false)}
                    onDone={(r) => { if (r === 'reset') { setWizardOpen(false); setTimeout(() => setWizardOpen(true), 50); } }}
                />
            )}
            {/* glow ambiental dorado */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] max-w-full h-64 bg-[#D4AF37]/10 blur-[120px] rounded-full" />

            {/* HEADER */}
            <div className="relative shrink-0 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
                <div className="max-w-3xl mx-auto flex items-center justify-between px-5 h-[72px] [@media(max-height:780px)]:h-14">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] flex items-center justify-center shadow-[0_0_22px_rgba(212,175,55,0.45)]">
                                <Sparkles className="w-5 h-5 text-[#0A0A0A]" />
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0A0A0A] ${aiConfigured ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-white font-cinzel tracking-[0.25em] text-lg leading-none">LAU</h2>
                            <p className="text-[11px] text-white/40 mt-1.5">{aiConfigured ? 'Copiloto · en línea' : 'IA no configurada'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setShowGuide(true)} title="Guía de comandos" className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-xs font-bold uppercase tracking-wider">
                            <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">Guía</span>
                        </button>
                        <button onClick={clearChat} disabled={loading} title="Limpiar chat" className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} title="Cerrar" className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {showGuide && (
                <div className="absolute inset-0 z-[70] bg-[#0A0A0A]/97 backdrop-blur-xl flex flex-col animate-fadeIn">
                    <div className="shrink-0 border-b border-white/10 bg-white/[0.03]">
                        <div className="max-w-3xl mx-auto flex items-center justify-between px-5 h-[72px] [@media(max-height:780px)]:h-14">
                            <div className="flex items-center gap-2.5">
                                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                                <div>
                                    <h2 className="text-white font-cinzel tracking-[0.2em] text-base leading-none">GUÍA DE COMANDOS</h2>
                                    <p className="text-[11px] text-white/40 mt-1">Tocá cualquier ejemplo para escribírselo a Lau</p>
                                </div>
                            </div>
                            <button onClick={() => setShowGuide(false)} title="Cerrar guía" className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-gold">
                        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
                            <p className="text-white/55 text-sm leading-relaxed">
                                Hablale a Lau <span className="text-[#D4AF37] font-semibold">como a una empleada</span>, con tus palabras. No tenés que escribir exacto. Acá abajo está <span className="text-white/80">todo lo que podés hacer</span>, bien fácil. Tocá cualquier ejemplo y se escribe solo. Lo importante (publicar, borrar, precios) <span className="text-white/80">siempre te pregunta antes</span>.
                            </p>

                            {/* CÓMO CARGAR UN PRODUCTO — visual, paso a paso */}
                            <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#D4AF37]/[0.08] to-transparent p-5">
                                <h3 className="text-white font-bold text-base mb-1 flex items-center gap-2"><span className="text-xl">🛍️</span> Cargar un producto (lo más fácil)</h3>
                                <p className="text-white/50 text-xs mb-4">Seguí estos pasitos. Lau te lleva de la mano, vos solo tocás botones.</p>
                                <div className="flex flex-col gap-2.5">
                                    {LOAD_STEPS.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5">
                                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-sm font-black text-[#D4AF37]">{i + 1}</div>
                                            <span className="text-xl shrink-0">{s.emoji}</span>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-semibold leading-tight">{s.title}</p>
                                                <p className="text-white/50 text-xs leading-snug">{s.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => { setShowGuide(false); setWizardOpen(true); }}
                                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[#0A0A0A] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] hover:brightness-110 transition"
                                >
                                    <PackagePlus className="w-4 h-4" /> Probar ahora
                                </button>
                            </div>

                            {/* PEDIRLE COSAS A LA IA — por temas */}
                            <div>
                                <h3 className="text-white font-bold text-base mb-1 flex items-center gap-2"><span className="text-xl">💬</span> Pedirle cosas a Lau</h3>
                                <p className="text-white/50 text-xs mb-4">Tocá un ejemplo para mandárselo. Son solo ejemplos: podés decírselo a tu manera.</p>
                                <div className="space-y-6">
                                    {COMMAND_GUIDE.map((cat) => (
                                        <div key={cat.title}>
                                            <h4 className="text-white font-semibold text-sm flex items-center gap-2"><span className="text-lg">{cat.icon}</span> {cat.title}</h4>
                                            {cat.sub && <p className="text-white/40 text-xs mb-2.5 ml-7">{cat.sub}</p>}
                                            <div className="flex flex-col gap-2">
                                                {cat.items.map((cmd) => (
                                                    <button
                                                        key={cmd}
                                                        onClick={() => { setInput(cmd); setShowGuide(false); }}
                                                        className="text-left text-sm text-white/75 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 hover:border-[#D4AF37]/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center gap-2.5 group"
                                                    >
                                                        <span className="text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors">›</span>
                                                        <span>{cmd}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl p-4 bg-[#D4AF37]/[0.06] border border-[#D4AF37]/20">
                                <p className="text-white/70 text-sm leading-relaxed">
                                    💡 <span className="text-white font-semibold">Acordate:</span> para <span className="text-white">cargar</span> una prenda usá el botón dorado de abajo. Para <span className="text-white">todo lo demás</span> (precios, ventas, ofertas, resúmenes), escribile o tocá un ejemplo de acá arriba.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={listRef} className="relative flex-1 overflow-y-auto scrollbar-gold">
                <div className="max-w-3xl w-full mx-auto px-4 py-6 [@media(max-height:780px)]:py-3 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2.5 animate-fadeIn ${m.role === 'user' ? 'justify-end' : m.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                            {m.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF953F] to-[#FCF6BA] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_14px_rgba(212,175,55,0.3)]">
                                    <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                                </div>
                            )}
                            {m.role === 'system' ? (
                                <div className="max-w-[88%] flex items-start gap-2 rounded-xl px-3.5 py-2 bg-white/[0.04] border border-white/10 text-white/55 text-xs font-mono whitespace-pre-wrap">
                                    <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-400/70 shrink-0" />
                                    <span>{m.text}</span>
                                </div>
                            ) : m.role === 'ai' ? (
                                <div className="flex flex-col items-start gap-2.5 max-w-[82%]">
                                    <div className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-lg bg-white/[0.08] text-white border border-white/10 rounded-bl-md">
                                        {m.img && <img src={m.img} alt="" className="rounded-lg mb-2 max-h-44 border border-white/10" />}
                                        {m.text}
                                    </div>
                                    {Array.isArray(m.options) && m.options.length > 0 && i === messages.length - 1 && !loading && !confirm && (
                                        <div className="flex flex-wrap gap-2">
                                            {m.options.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleSend(opt)}
                                                    className="text-xs font-bold text-[#0A0A0A] bg-gradient-to-br from-[#D4AF37] to-[#B38728] rounded-full px-4 py-2 hover:brightness-110 active:scale-95 transition shadow-md"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-lg max-w-[82%] bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#0A0A0A] font-medium rounded-br-md">
                                    {m.img && <img src={m.img} alt="" className="rounded-lg mb-2 max-h-44 border border-white/10" />}
                                    {m.text}
                                </div>
                            )}
                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5"><User className="w-4 h-4 text-white/60" /></div>
                            )}
                        </div>
                    ))}

                    {confirm && (
                        <div className="animate-fadeIn rounded-2xl p-4 bg-amber-500/[0.08] border border-amber-500/30 max-w-[92%] shadow-lg">
                            <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold mb-3">
                                <AlertTriangle className="w-4 h-4" /> Confirmá esta acción
                            </div>
                            <ul className="space-y-2 mb-4">
                                {confirm.actions.map((a, i) => (
                                    <li key={i} className="text-white/85 text-sm flex gap-2 bg-white/[0.04] rounded-lg px-3 py-2"><span className="text-amber-400 shrink-0">›</span>{actionLabel(a)}</li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <button onClick={() => resolveConfirm(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-[#0A0A0A] text-sm font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition">
                                    <Check className="w-4 h-4" /> Confirmar
                                </button>
                                <button onClick={() => resolveConfirm(false)} className="text-white/60 hover:text-white text-sm px-5 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 transition">Cancelar</button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="flex gap-2.5 items-end animate-fadeIn">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF953F] to-[#FCF6BA] flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-[#0A0A0A]" /></div>
                            <div className="bg-white/[0.08] border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" />
                                </span>
                                <span className="text-white/50 text-xs">{busyMsg || 'Lau está pensando…'}</span>
                            </div>
                        </div>
                    )}

                    {messages.length <= 1 && !loading && (
                        <div className="pt-2 space-y-7 [@media(max-height:780px)]:space-y-4">
                            {/* Tarjetas de capacidades */}
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-3 text-center">Lo que puedo hacer</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {CAPS.map(c => (
                                        <button key={c.label} onClick={() => setShowGuide(true)} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 hover:bg-white/[0.07] transition-all text-left group">
                                            <span className="text-xl shrink-0">{c.icon}</span>
                                            <span className="text-xs text-white/75 leading-tight group-hover:text-white transition-colors">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Sugerencias rápidas */}
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-3 text-center">Probá pedirle</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {SUGGESTIONS.map(s => (
                                        <button key={s} onClick={() => setInput(s)} className="text-xs text-white/70 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-2 hover:border-[#D4AF37]/50 hover:text-white hover:bg-white/[0.07] transition-all">{s}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative shrink-0 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 [@media(max-height:780px)]:p-2.5">
                <div className="max-w-3xl mx-auto">
                    {previews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2.5">
                            {previews.map((src, i) => (
                                <div key={i} className="relative inline-block">
                                    <img src={src} alt="" className="h-20 w-20 object-cover rounded-xl border border-white/15" />
                                    <button onClick={() => { setFiles(prev => prev.filter((_, j) => j !== i)); setPreviews(prev => prev.filter((_, j) => j !== i)); }} className="absolute -top-2 -right-2 bg-[#0A0A0A] border border-white/20 rounded-full p-1 hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5 text-white/70" /></button>
                                </div>
                            ))}
                            {previews.length > 1 && <span className="self-end text-[10px] text-white/40 pb-1">{previews.length} fotos</span>}
                        </div>
                    )}
                    <button
                        onClick={() => setWizardOpen(true)}
                        className="w-full mb-2.5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[#0A0A0A] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] hover:brightness-110 transition shadow-[0_0_18px_rgba(212,175,55,0.35)]"
                    >
                        <PackagePlus className="w-4 h-4" /> Cargar producto (paso a paso)
                    </button>
                    <div className="flex items-end gap-1 bg-white/[0.06] border border-white/15 rounded-2xl pl-1.5 pr-1.5 py-1.5 transition-colors focus-within:border-[#D4AF37]/60 focus-within:bg-white/[0.08]">
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
                        <button onClick={() => setWizardOpen(true)} disabled={loading} className="p-2.5 rounded-xl text-white/40 hover:text-[#D4AF37] hover:bg-white/5 disabled:opacity-40 transition-colors shrink-0" title="Cargar producto paso a paso"><Paperclip className="w-5 h-5" /></button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            rows={1}
                            placeholder="Escribile a Lau…"
                            disabled={loading}
                            className="flex-1 resize-none bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-0 max-h-32"
                        />
                        <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !files.length)} className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#0A0A0A] disabled:opacity-40 disabled:saturate-50 hover:brightness-110 transition shrink-0">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-white/25 text-center mt-2.5">Lau ejecuta acciones reales · lo sensible te lo confirma antes</p>
                </div>
            </div>
        </div>
    );
};

export default AdminAssistantView;
