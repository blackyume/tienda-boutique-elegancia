import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, X, Loader2, User, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateText, generateProductCopy, hasAdminAI } from '../../utils/ai';
import { analyzeProductImage } from '../../utils/vision';
import { isSensitive, buildSnapshot, buildPrompt, parsePlan } from '../../utils/aiCopilot';

const HISTORY_KEY = 'laurina_copilot_v1';
const MAX_STEPS = 5;
const WELCOME = { role: 'ai', text: 'Hola 👋 Soy Lau, tu copiloto. Pedime lo que necesites en lenguaje natural y lo hago: crear/publicar productos (mandame la foto y, si querés, el COSTO y te calculo el precio cubriendo la comisión de Mercado Pago + tu margen), precios y ofertas, cupones, destacar en la home, gestionar pedidos (marcar enviados/entregados), moderar reseñas, o consultarme ventas, stock y clientes. Lo sensible te lo confirmo antes.' };

const toArr = (v) => Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean)
    : (typeof v === 'string' ? v.split(/[,/]+/).map(s => s.trim()).filter(Boolean) : []);

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
        case 'set_sale': return Number(A.percent) > 0 ? `Poner ${A.productId} en oferta −${A.percent}%` : `Quitar oferta de ${A.productId}`;
        case 'reject_review': return `ELIMINAR reseña ${A.reviewId}`;
        case 'update_home': return `Editar la home (${Object.keys(A).join(', ')})`;
        case 'toggle_maintenance': return `Mantenimiento → ${A.on ? 'ACTIVAR' : 'desactivar'}`;
        default: return `${a.tool} ${JSON.stringify(A)}`;
    }
};

export const AdminAssistantView = ({ orders, inventory, onClose }) => {
    const {
        siteConfig, aiConfig, categories, coupons, reviews, isMaintenance,
        addProduct, updateProduct, deleteProduct, addCategory, addCoupon, deleteCoupon,
        updateSiteConfig, toggleMaintenance, uploadImage, logAiAction,
        updateOrderStatus, approveReview, rejectReview,
    } = useStore();

    const [messages, setMessages] = useState(() => {
        try { const s = JSON.parse(localStorage.getItem(HISTORY_KEY)); if (Array.isArray(s) && s.length) return s; } catch { /* noop */ }
        return [WELCOME];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [busyMsg, setBusyMsg] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [confirm, setConfirm] = useState(null); // { actions, resolve }
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
            if (localStorage.getItem('laurina_briefing') === today) return;
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
            localStorage.setItem('laurina_briefing', today);
            setMessages(prev => [...prev, { role: 'ai', text: lines.join('\n') }]);
        } catch { /* noop */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                const commission = A.commission != null ? Number(A.commission) : 6;
                const totalCost = cost + pack + ship;
                const denom = 1 - (margin + commission) / 100;
                if (denom <= 0) return `El margen (${margin}%) + comisión (${commission}%) suman 100% o más, no se puede calcular. Bajá el margen.`;
                const price = Math.round(totalCost / denom);
                const commissionAmount = Math.round(price * commission / 100);
                const net = price - totalCost - commissionAmount;
                return `Precio de venta sugerido: $${price.toLocaleString('es-AR')}. Desglose: costo $${totalCost.toLocaleString('es-AR')}${(pack || ship) ? ` (prenda $${cost.toLocaleString('es-AR')}${pack ? ' + packaging $' + pack.toLocaleString('es-AR') : ''}${ship ? ' + envío $' + ship.toLocaleString('es-AR') : ''})` : ''}, comisión MP ${commission}% = $${commissionAmount.toLocaleString('es-AR')}, margen ${margin}%. Ganás $${net.toLocaleString('es-AR')} netos por venta. Para publicarlo usá create_product con price ${price}.`;
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
                await addCategory({ id: name.toLowerCase().replace(/\s+/g, '-'), name });
                return `Categoría "${name}" creada.`;
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
                const img = A.imageUrl || '';
                const product = {
                    name: String(A.name || 'Producto'),
                    price: Number(A.price) || 0,
                    stock: Number(A.stock) || 0,
                    category: String(A.category || ''),
                    colors: toArr(A.colors),
                    sizes: toArr(A.sizes),
                    description: String(A.description || ''),
                    image: img,
                    media: img ? [{ type: 'image', url: img }] : [],
                    badges: { isNew: true },
                    active: visible,
                };
                const id = await addProduct(product);
                return id ? `Producto "${product.name}" ${visible ? 'PUBLICADO' : 'guardado como borrador'} (id ${id}).` : 'No se pudo crear (revisá Cloudinary/permisos).';
            }
            case 'set_price': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                await updateProduct(p.id, { price: Number(A.price) || 0 });
                return `Precio de "${p.name}" → $${Number(A.price || 0).toLocaleString('es-AR')}.`;
            }
            case 'set_stock': {
                const p = findProduct(A.productId); if (!p) return 'No encontré el producto.';
                if (Array.isArray(p.variants) && p.variants.length) {
                    return `"${p.name}" maneja stock por VARIANTES (talle/color), así que un único número no aplica. Editá el stock por variante desde el editor del producto. (No cambié nada para no romper el stock real.)`;
                }
                await updateProduct(p.id, { stock: Number(A.stock) || 0 });
                return `Stock de "${p.name}" → ${Number(A.stock) || 0}.`;
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
                if (A.editorial) cfg.editorial = { ...(siteConfig.editorial || {}), ...A.editorial };
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
            const prompt = buildPrompt({ snapshot: buildSnapshot(snapshotCtx), transcript: transcript.slice(-24) });
            const raw = await generateText(prompt, aiConfig, { scope: 'admin' });
            const plan = parsePlan(raw);
            transcript.push({ role: 'assistant', content: JSON.stringify({ reply: plan.reply, actions: plan.actions, done: plan.done }) });
            if (plan.reply) push({ role: 'ai', text: plan.reply });

            if (!plan.actions.length) { if (plan.done) return; else { transcript.push({ role: 'tool', content: '(sin acciones)' }); continue; } }

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

            // si solo hubo lectura, dejá que el modelo responda con los datos
            const onlyReads = plan.actions.every(a => a.tool.startsWith('query_') || a.tool === 'get_product');
            if (plan.done && !onlyReads) return;
        }
        push({ role: 'system', text: 'Llegué al límite de pasos. Si quedó algo a medias, pedímelo de nuevo más puntual.' });
    };

    const handleSend = async () => {
        const text = input.trim();
        if ((!text && !file) || loading) return;
        if (!aiConfigured) { push({ role: 'system', text: 'Configurá una key de Cerebras (o Gemini) en Admin → Configuración para activarme.' }); return; }

        setInput('');
        setLoading(true);
        const transcript = [];
        // reconstruir contexto breve desde el chat visible
        messages.filter(m => m.role === 'user' || m.role === 'ai').slice(-8).forEach(m => transcript.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

        push({ role: 'user', text: text || '(imagen adjunta)', img: preview });

        try {
            if (file) {
                setBusyMsg('Subiendo y analizando la foto…');
                const url = await uploadImage(file);
                if (!url) throw new Error('No se pudo subir la imagen (revisá Cloudinary en Configuración).');
                const an = await analyzeProductImage(file, aiConfig, categories.map(c => c.name).filter(Boolean));
                transcript.push({ role: 'system', content: `El usuario adjuntó la foto de una prenda. Imagen YA subida (usá esta URL en imageUrl): ${url}\nAnálisis automático de la imagen: ${JSON.stringify(an)}\nProponé create_product con esos datos (precio = suggestedPrice como sugerencia editable) salvo que el usuario pida otra cosa.` });
            }
            transcript.push({ role: 'user', content: text || 'Publicá esta prenda.' });
            await agentLoop(transcript, { inventory, orders, categories, coupons, reviews, isMaintenance, siteConfig });
            logAiAction?.('copilot', text || '(imagen)', 'ok');
        } catch (e) {
            push({ role: 'system', text: `Error: ${e?.message || e}` });
        } finally {
            setFile(null); setPreview(null); setLoading(false); setBusyMsg('');
        }
    };

    const onPick = (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setFile(f); setPreview(URL.createObjectURL(f));
    };

    const SUGGESTIONS = [
        'Cargá este producto, me costó $8000 y quiero 50% de margen',
        '¿Cuánto vendí esta semana?',
        '¿Qué pedidos tengo pendientes de enviar?',
        'Destacá en la home los 4 productos más nuevos',
    ];

    const clearChat = () => {
        if (loading) return;
        setMessages([WELCOME]);
        try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0A0A0A]/95 backdrop-blur-md">
            {/* glow ambiental dorado */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] max-w-full h-64 bg-[#D4AF37]/10 blur-[120px] rounded-full" />

            {/* HEADER */}
            <div className="relative shrink-0 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
                <div className="max-w-3xl mx-auto flex items-center justify-between px-5 h-[72px]">
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
                        <button onClick={clearChat} disabled={loading} title="Limpiar chat" className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} title="Cerrar" className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            <div ref={listRef} className="relative flex-1 overflow-y-auto scrollbar-gold">
                <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-4">
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
                            ) : (
                                <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-lg max-w-[82%] ${m.role === 'user' ? 'bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#0A0A0A] font-medium rounded-br-md' : 'bg-white/[0.08] text-white border border-white/10 rounded-bl-md'}`}>
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
                        <div className="pt-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-3 text-center">Probá pedirle</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => setInput(s)} className="text-xs text-white/70 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-2 hover:border-[#D4AF37]/50 hover:text-white hover:bg-white/[0.07] transition-all">{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative shrink-0 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
                <div className="max-w-3xl mx-auto">
                    {preview && (
                        <div className="relative inline-block mb-2.5">
                            <img src={preview} alt="" className="h-20 rounded-xl border border-white/15" />
                            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-2 -right-2 bg-[#0A0A0A] border border-white/20 rounded-full p-1 hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5 text-white/70" /></button>
                        </div>
                    )}
                    <div className="flex items-end gap-1 bg-white/[0.06] border border-white/15 rounded-2xl pl-1.5 pr-1.5 py-1.5 transition-colors focus-within:border-[#D4AF37]/60 focus-within:bg-white/[0.08]">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
                        <button onClick={() => fileRef.current?.click()} disabled={loading} className="p-2.5 rounded-xl text-white/40 hover:text-[#D4AF37] hover:bg-white/5 disabled:opacity-40 transition-colors shrink-0" title="Adjuntar foto de prenda"><Paperclip className="w-5 h-5" /></button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            rows={1}
                            placeholder="Escribile a Lau…"
                            disabled={loading}
                            className="flex-1 resize-none bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-0 max-h-32"
                        />
                        <button onClick={handleSend} disabled={loading || (!input.trim() && !file)} className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#0A0A0A] disabled:opacity-40 disabled:saturate-50 hover:brightness-110 transition shrink-0">
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
