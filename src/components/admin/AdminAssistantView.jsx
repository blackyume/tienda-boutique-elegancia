import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, X, ShieldCheck, Loader2, Bot, User, AlertTriangle, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateText, generateProductCopy, hasAdminAI } from '../../utils/ai';
import { analyzeProductImage } from '../../utils/vision';
import { isSensitive, buildSnapshot, buildPrompt, parsePlan } from '../../utils/aiCopilot';

const HISTORY_KEY = 'laurina_copilot_v1';
const MAX_STEPS = 5;
const WELCOME = { role: 'ai', text: 'Hola 👋 Soy Laurina, tu copiloto. Pedime lo que necesites en lenguaje natural y lo hago: crear/publicar productos (podés adjuntar la foto), cambiar precios o stock, cupones, destacar en la home, o consultarme ventas, stock y clientes. Lo sensible te lo confirmo antes.' };

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
        case 'update_home': return `Editar la home (${Object.keys(A).join(', ')})`;
        case 'toggle_maintenance': return `Mantenimiento → ${A.on ? 'ACTIVAR' : 'desactivar'}`;
        default: return `${a.tool} ${JSON.stringify(A)}`;
    }
};

export const AdminAssistantView = ({ orders, inventory, onClose }) => {
    const {
        siteConfig, aiConfig, categories, coupons, isMaintenance,
        addProduct, updateProduct, deleteProduct, addCategory, addCoupon, deleteCoupon,
        updateSiteConfig, toggleMaintenance, uploadImage, logAiAction,
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
                return JSON.stringify({ id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category, colors: p.colors, sizes: p.sizes, visible: p.active !== false, badges: p.badges, description: p.description }, null, 1);
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
            await agentLoop(transcript, { inventory, orders, categories, coupons, isMaintenance, siteConfig });
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
        '¿Cuánto vendí esta semana?',
        '¿Qué productos tienen stock bajo?',
        'Creá un cupón VERANO15 de 15%',
        'Destacá en la home los 4 productos más nuevos',
    ];

    return (
        <div className="fixed inset-0 z-[60] bg-cielo-dark/95 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#BF953F] to-[#FCF6BA] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-cielo-dark" />
                    </div>
                    <div>
                        <h2 className="text-white font-cinzel tracking-widest text-sm">LAURINA · COPILOTO</h2>
                        <p className="text-[11px] text-white/40">{aiConfigured ? 'Cerebras + Gemini · ejecuta acciones reales' : 'IA no configurada'}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white p-2"><X className="w-5 h-5" /></button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role !== 'user' && (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'system' ? 'bg-white/10' : 'bg-gradient-to-br from-[#BF953F] to-[#FCF6BA]'}`}>
                                {m.role === 'system' ? <ShieldCheck className="w-4 h-4 text-white/60" /> : <Bot className="w-4 h-4 text-cielo-dark" />}
                            </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap max-w-[80%] ${m.role === 'user' ? 'bg-gradient-to-br from-[#BF953F] to-[#B38728] text-cielo-dark font-medium' : m.role === 'system' ? 'bg-white/5 text-white/60 text-xs font-mono border border-white/10' : 'bg-white/10 text-white'}`}>
                            {m.img && <img src={m.img} alt="" className="rounded-lg mb-2 max-h-40" />}
                            {m.text}
                        </div>
                        {m.role === 'user' && <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-white/60" /></div>}
                    </div>
                ))}

                {confirm && (
                    <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 max-w-[90%]">
                        <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold mb-3">
                            <AlertTriangle className="w-4 h-4" /> Confirmá esta acción
                        </div>
                        <ul className="space-y-1.5 mb-4">
                            {confirm.actions.map((a, i) => (
                                <li key={i} className="text-white/85 text-sm flex gap-2"><span className="text-amber-400">›</span>{actionLabel(a)}</li>
                            ))}
                        </ul>
                        <div className="flex gap-2">
                            <button onClick={() => resolveConfirm(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-[#BF953F] to-[#B38728] text-cielo-dark text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90">
                                <Check className="w-4 h-4" /> Confirmar
                            </button>
                            <button onClick={() => resolveConfirm(false)} className="text-white/60 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/15">Cancelar</button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex gap-3 items-center text-white/50 text-sm">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BF953F] to-[#FCF6BA] flex items-center justify-center"><Bot className="w-4 h-4 text-cielo-dark" /></div>
                        <Loader2 className="w-4 h-4 animate-spin" /> {busyMsg || 'Trabajando…'}
                    </div>
                )}

                {messages.length <= 1 && !loading && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {SUGGESTIONS.map(s => (
                            <button key={s} onClick={() => setInput(s)} className="text-xs text-white/60 border border-white/15 rounded-full px-3 py-1.5 hover:border-[#BF953F]/60 hover:text-white">{s}</button>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-white/10 p-4 shrink-0">
                <div className="max-w-3xl mx-auto">
                    {preview && (
                        <div className="relative inline-block mb-2">
                            <img src={preview} alt="" className="h-20 rounded-lg border border-white/15" />
                            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-2 -right-2 bg-cielo-dark border border-white/20 rounded-full p-0.5"><X className="w-3.5 h-3.5 text-white/70" /></button>
                        </div>
                    )}
                    <div className="flex items-end gap-2">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
                        <button onClick={() => fileRef.current?.click()} disabled={loading} className="p-3 text-white/50 hover:text-[#BF953F] disabled:opacity-40" title="Adjuntar foto de prenda"><Paperclip className="w-5 h-5" /></button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            rows={1}
                            placeholder="Pedile algo a Laurina… (Enter para enviar)"
                            disabled={loading}
                            className="flex-1 resize-none bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#BF953F]/60 max-h-32"
                        />
                        <button onClick={handleSend} disabled={loading || (!input.trim() && !file)} className="p-3 rounded-xl bg-gradient-to-br from-[#BF953F] to-[#B38728] text-cielo-dark disabled:opacity-40 hover:opacity-90">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAssistantView;
