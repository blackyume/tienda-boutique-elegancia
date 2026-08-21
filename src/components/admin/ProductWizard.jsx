import React, { useMemo, useRef, useState } from 'react';
import { Paperclip, X, ChevronLeft, Check, Plus, Sparkles, Loader2, Image as ImageIcon, Star, Tag } from 'lucide-react';
import { getColorHex } from '../../utils/helpers';
import { generateGroundedDescription, hasAdminAI } from '../../utils/ai';

// Wizard DETERMINÍSTICO de carga de producto. NO usa IA: es una secuencia fija
// de pasos con botones que junta los datos en estado y crea el producto al final
// llamando directo a la base. Por eso nunca entra en loop ni inventa nada.

const COLORES = ['Negro', 'Blanco', 'Rojo', 'Rosa', 'Beige', 'Azul', 'Verde', 'Dorado', 'Chocolate', 'Gris'];
// Todos los talles de ropa de mujer que se usan en Argentina, agrupados.
const TALLES_GRUPOS = [
    { label: 'Letra', items: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { label: 'Numérico', items: ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56'] },
    { label: 'Por marca', items: ['1', '2', '3', '4', '5', '6'] },
    { label: 'Especial', items: ['Único', 'S/M', 'M/L', 'L/XL'] },
];
const TALLES = TALLES_GRUPOS.flatMap(g => g.items);
const STOCKS = ['1', '2', '3', '5', '10'];
const MARGENES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Dorado/oro como gradiente metálico real (premium), el resto plano.
// `overrides` = mapa nombre→hex elegido por el dueño (gana sobre el diccionario).
const swatchBg = (name, overrides) => {
    const n = String(name || '').toLowerCase();
    if (!overrides?.[name] && (n === 'dorado' || n === 'oro')) return 'linear-gradient(135deg, #BF953F, #FCF6BA 50%, #B38728)';
    return getColorHex(name, overrides);
};

const GOLD = 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)';

const Chip = ({ active, onClick, children, swatch, overrides }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${active
            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white'
            : 'border-white/10 bg-white/[0.03] text-white/80 hover:border-[#D4AF37]/50 hover:bg-white/[0.06]'}`}
    >
        {swatch && <span className="w-4 h-4 rounded-full border border-white/30 shrink-0" style={{ background: swatchBg(swatch, overrides) }} />}
        {children}
        {active && <Check className="w-4 h-4 text-[#D4AF37]" />}
    </button>
);

const Field = ({ label, children, hint }) => (
    <div>
        <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">{label}</p>
        {hint && <p className="text-xs text-white/50 mb-3">{hint}</p>}
        {children}
    </div>
);

// IMPORTANTE: a nivel de módulo (NO dentro del componente) para que los inputs
// no se remonten en cada tecla y pierdan el foco.
const StepShell = ({ children, canNext, onNext, nextLabel = 'Continuar', isFirst, onBack }) => (
    <div className="flex flex-col gap-5">
        {children}
        <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} disabled={isFirst} className="flex items-center gap-1 text-sm text-white/50 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button
                onClick={onNext}
                disabled={canNext === false}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: GOLD }}
            >
                {nextLabel}
            </button>
        </div>
    </div>
);

// Vista previa EN VIVO: muestra cómo va quedando el producto mientras lo cargás.
const LivePreview = ({ image, name, price, colors = [], sizes = [], totalStock, category, colorHex }) => (
    <div className="flex gap-3 mb-6 rounded-2xl border border-[#D4AF37]/25 bg-white/[0.03] p-3">
        <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/[0.04] flex items-center justify-center">
            {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-white/20" />}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#D4AF37]/70 font-bold">Vista previa</p>
            <p className="text-white font-semibold text-sm truncate mt-0.5">{name?.trim() || 'Tu producto'}</p>
            <p className="text-sm font-black mt-0.5" style={{ background: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                {price > 0 ? `$${price.toLocaleString('es-AR')}` : 'Sin precio aún'}
            </p>
            {category && <p className="text-[10px] text-white/35 mt-0.5">{category}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {colors.slice(0, 6).map(c => <span key={c} title={c} className="w-3.5 h-3.5 rounded-full border border-white/25" style={{ background: swatchBg(c, colorHex) }} />)}
                {sizes.slice(0, 6).map(s => <span key={s} className="text-[10px] font-bold text-white/70 border border-white/15 rounded px-1.5 py-0.5">{s}</span>)}
            </div>
            {typeof totalStock === 'number' && totalStock > 0 && <p className="text-[10px] text-white/35 mt-1.5">Stock: {totalStock} u.</p>}
        </div>
    </div>
);

export const ProductWizard = ({ categories = [], uploadImage, addProduct, addCategory, paymentConfig, aiConfig, initialImages = [], onClose, onDone }) => {
    const [step, setStep] = useState(initialImages.length ? 'name' : 'photos');
    const [images, setImages] = useState(initialImages);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [created, setCreated] = useState(null);
    const fileRef = useRef(null);

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [newCat, setNewCat] = useState('');
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [customColor, setCustomColor] = useState('');
    const [customHex, setCustomHex] = useState('#C9A04E'); // tono elegido para el color custom
    const [hexTouched, setHexTouched] = useState(false);   // ¿el dueño ajustó el tono a mano?
    const [colorHex, setColorHex] = useState({});          // mapa nombre→hex (overrides)
    const [customSize, setCustomSize] = useState('');
    const [stock, setStock] = useState('');
    const [variantStock, setVariantStock] = useState({}); // { "talle::color": cantidad }
    const [description, setDescription] = useState('');
    const [descDetails, setDescDetails] = useState('');
    const [genDesc, setGenDesc] = useState(false);
    const [descErr, setDescErr] = useState('');
    const [material, setMaterial] = useState('');     // tela / composición
    const [launchSale, setLaunchSale] = useState(false);
    const [salePercent, setSalePercent] = useState(20);
    const [featured, setFeatured] = useState(false);  // destacar en home
    const [priceMode, setPriceMode] = useState('');
    const [priceFinal, setPriceFinal] = useState('');
    const [cost, setCost] = useState('');
    const [margin, setMargin] = useState(50);
    const [packaging, setPackaging] = useState('');
    const [flete, setFlete] = useState('');
    const [fleteUnits, setFleteUnits] = useState('');
    const [visible, setVisible] = useState(true);

    const commission = Number(paymentConfig?.realMpFeePercent) || Number(paymentConfig?.mpFee) || 6;

    const priceCalc = useMemo(() => {
        const c = Number(cost) || 0;
        const pack = Number(packaging) || 0;
        const units = Number(fleteUnits) || 0;
        const shipPer = units > 0 ? (Number(flete) || 0) / units : 0;
        const totalCost = c + pack + shipPer;
        const feeFactor = 1 - commission / 100;
        if (c <= 0 || feeFactor <= 0) return null;
        const price = Math.ceil((totalCost * (1 + margin / 100) / feeFactor) / 100) * 100;
        const commissionAmount = Math.round(price * commission / 100);
        const net = price - totalCost - commissionAmount;
        return { price, totalCost: Math.round(totalCost), commissionAmount, net, shipPer: Math.round(shipPer) };
    }, [cost, packaging, flete, fleteUnits, margin, commission]);

    const finalPrice = priceMode === 'final' ? (Number(priceFinal) || 0) : (priceCalc?.price || 0);

    // Combinaciones talle×color. Si hay más de una, se carga stock POR combinación
    // (variantes). Si hay una sola (o ninguna), es un stock total simple.
    const combos = useMemo(() => {
        const sa = sizes.length ? sizes : [''];
        const ca = colors.length ? colors : [''];
        return sa.flatMap(s => ca.map(c => ({ s, c, key: `${s}::${c}`, label: [s, c].filter(Boolean).join(' · ') || 'Stock' })));
    }, [sizes, colors]);
    const usaVariantes = combos.length > 1;
    const totalVariantStock = useMemo(
        () => combos.reduce((a, cb) => a + (Number(variantStock[cb.key]) || 0), 0),
        [combos, variantStock]
    );
    const totalStock = usaVariantes ? totalVariantStock : (Number(stock) || 0);

    const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    const addCustom = (val, arr, set, clear) => { const v = val.trim(); if (v && !arr.includes(v)) set([...arr, v]); clear(''); };

    // Muestra en el selector el tono que el motor adivina para el nombre tipeado.
    const onCustomColorChange = (val) => {
        setCustomColor(val);
        setHexTouched(false);
        const guess = getColorHex(val.trim());
        if (/^#[0-9a-fA-F]{6}$/.test(guess)) setCustomHex(guess);
    };
    // Agrega el color. Si el dueño NO ajustó el tono, deja que el motor lo resuelva
    // solo (entiende "azul bebé", "verde oscuro", "dorado", inglés, etc.). Si lo
    // ajustó a mano, guarda ese hex exacto como override.
    const addColorWithHex = () => {
        const v = customColor.trim();
        if (!v) return;
        if (!colors.includes(v)) setColors([...colors, v]);
        if (hexTouched) setColorHex(prev => ({ ...prev, [v]: customHex }));
        setCustomColor(''); setHexTouched(false);
    };

    const pickPhotos = async (e) => {
        const fl = Array.from(e.target.files || []);
        if (!fl.length) return;
        setUploading(true);
        try {
            const urls = [];
            for (const f of fl) { const u = await uploadImage(f); if (u) urls.push(u); }
            setImages(prev => [...prev, ...urls]);
        } catch { /* noop */ } finally { setUploading(false); }
    };

    const generarDescripcion = async () => {
        setGenDesc(true); setDescErr('');
        try {
            const txt = await generateGroundedDescription(
                { name: name.trim(), category: newCat.trim() || category, colors, sizes, details: [descDetails.trim(), material.trim() && `Tela/composición: ${material.trim()}`].filter(Boolean).join('. ') },
                aiConfig
            );
            if (txt) setDescription(txt);
            else setDescErr('No vino texto, probá de nuevo.');
        } catch (e) {
            setDescErr(e?.message || 'No se pudo generar.');
        } finally { setGenDesc(false); }
    };

    const publish = async (asVisible) => {
        setSaving(true);
        try {
            const catName = newCat.trim() || category;
            if (newCat.trim() && !categories.some(c => (c.name || '').toLowerCase() === catName.toLowerCase())) {
                await addCategory({ id: catName.toLowerCase().replace(/\s+/g, '-'), name: catName });
            }
            // Stock por variante (talle::color) si hay más de una combinación.
            const variants = usaVariantes
                ? combos.reduce((acc, cb) => { acc[cb.key] = Number(variantStock[cb.key]) || 0; return acc; }, {})
                : null;
            // Oferta de lanzamiento: deja el precio anterior tachado.
            const pct = launchSale ? Math.min(90, Math.max(1, Number(salePercent) || 0)) : 0;
            const salePrice = pct > 0 ? Math.round(finalPrice * (1 - pct / 100)) : finalPrice;
            const product = {
                name: name.trim() || 'Producto',
                price: salePrice,
                ...(pct > 0 ? { compareAtPrice: finalPrice } : {}),
                cost: Number(cost) || 0,
                stock: totalStock,
                ...(variants ? { variants } : {}),
                category: catName,
                colors, sizes,
                ...(Object.keys(colorHex).some(k => colors.includes(k)) ? { colorHex: colors.reduce((a, c) => { if (colorHex[c]) a[c] = colorHex[c]; return a; }, {}) } : {}),
                description: description.trim(),
                material: material.trim(),
                image: images[0] || '',
                images,
                media: images.map(u => ({ type: 'image', url: u })),
                badges: { isNew: true, ...(pct > 0 ? { isOnSale: true } : {}), ...(featured ? { isFeatured: true } : {}) },
                active: asVisible,
            };
            const id = await addProduct(product);
            setCreated({ id, visible: asVisible, name: product.name, price: salePrice });
            setStep('done');
            onDone?.(product);
        } catch (e) {
            setCreated({ error: e?.message || 'Error al guardar' });
            setStep('done');
        } finally { setSaving(false); }
    };

    // --- Navegación de pasos ---
    const ORDER = ['photos', 'name', 'category', 'variantes', 'stock', 'price', 'summary'];
    const goNext = () => {
        const i = ORDER.indexOf(step);
        if (i >= 0 && i < ORDER.length - 1) setStep(ORDER[i + 1]);
    };
    const goBack = () => {
        const i = ORDER.indexOf(step);
        if (i > 0) setStep(ORDER[i - 1]);
    };

    const stepIdx = ORDER.indexOf(step);
    const shellProps = { onNext: goNext, onBack: goBack, isFirst: step === ORDER[0] };

    return (
        <div className="absolute inset-0 z-[60] bg-[#0d0d0d] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                        <Sparkles className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <p className="text-white font-bold tracking-wide leading-tight">Cargar producto</p>
                        <p className="text-[11px] text-white/40">Paso a paso · sin vueltas</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>

            {/* Progreso (tocá un tramo ya hecho para volver a corregirlo) */}
            {step !== 'done' && (
                <div className="flex gap-1 px-5 pt-3 shrink-0">
                    {ORDER.map((s, i) => (
                        <button
                            key={s}
                            onClick={() => { if (i <= stepIdx) setStep(s); }}
                            disabled={i > stepIdx}
                            title={i < stepIdx ? 'Volver a este paso' : undefined}
                            className={`group flex-1 py-2 -my-2 ${i < stepIdx ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <span className="block h-1 rounded-full transition-colors" style={{ background: i <= stepIdx ? GOLD : 'rgba(255,255,255,0.08)' }} />
                        </button>
                    ))}
                </div>
            )}

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
                {/* En el paso de foto: miniaturas con botón de borrar */}
                {images.length > 0 && step === 'photos' && (
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {images.map((u, i) => (
                            <div key={i} className="relative">
                                <img src={u} alt="" className="w-16 h-20 object-cover rounded-lg border border-white/10" />
                                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-[#1C1F25] border border-white/20 rounded-full p-0.5 hover:bg-red-500/20" title="Quitar foto">
                                    <X className="w-3.5 h-3.5 text-white/70" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* En los pasos de carga: vista previa en vivo de cómo va quedando */}
                {!['photos', 'summary', 'done'].includes(step) && (
                    <LivePreview
                        image={images[0]}
                        name={name}
                        price={finalPrice}
                        colors={colors}
                        sizes={sizes}
                        totalStock={totalStock}
                        category={newCat.trim() || category}
                        colorHex={colorHex}
                    />
                )}

                {step === 'photos' && (
                    <StepShell {...shellProps} canNext={true} nextLabel={images.length ? 'Continuar' : 'Continuar sin foto'}>
                        <Field label="Foto de la prenda" hint="Subí una o varias fotos del MISMO producto (quedan como galería). Es opcional, podés seguir sin foto.">
                            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickPhotos} />
                            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full py-8 rounded-2xl border-2 border-dashed border-white/15 hover:border-[#D4AF37]/50 text-white/60 hover:text-white flex flex-col items-center gap-2 transition-colors">
                                {uploading ? <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" /> : <Paperclip className="w-7 h-7" />}
                                <span className="text-sm font-semibold">{uploading ? 'Subiendo…' : 'Tocá para subir foto(s)'}</span>
                            </button>
                        </Field>
                    </StepShell>
                )}

                {step === 'name' && (
                    <StepShell {...shellProps} canNext={!!name.trim()}>
                        <Field label="Nombre de la prenda" hint="Escribí el nombre tal cual querés que aparezca en la tienda.">
                            <input
                                autoFocus value={name} onChange={e => setName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && name.trim()) goNext(); }}
                                placeholder="Ej: Vestido Lino Blanco"
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]"
                            />
                        </Field>
                    </StepShell>
                )}

                {step === 'category' && (
                    <StepShell {...shellProps} canNext={!!(category || newCat.trim())}>
                        <Field label="Categoría" hint="Elegí una o creá una nueva.">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {categories.map(c => (
                                    <Chip key={c.id || c.name} active={category === c.name && !newCat} onClick={() => { setCategory(c.name); setNewCat(''); }}>{c.name}</Chip>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={newCat} onChange={e => { setNewCat(e.target.value); setCategory(''); }} placeholder="…o nueva categoría" className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                            </div>
                        </Field>
                    </StepShell>
                )}

                {step === 'variantes' && (
                    <StepShell {...shellProps} canNext={true}>
                        <div className="flex flex-col gap-6">
                            <Field label="Colores" hint="Tocá todos los que tenga. Para uno propio, escribí el nombre y elegí el tono exacto con el cuadradito.">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {[...COLORES, ...colors.filter(c => !COLORES.includes(c))].map(c => (
                                        <Chip key={c} swatch={c} overrides={colorHex} active={colors.includes(c)} onClick={() => toggle(colors, setColors, c)}>{c}</Chip>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={customColor} onChange={e => onCustomColorChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addColorWithHex(); }} placeholder="Otro color (ej: rosa bebé)…" className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                                    <label className="relative w-12 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] cursor-pointer flex items-center justify-center" title="Elegí el tono exacto">
                                        <span className="w-6 h-6 rounded-full border border-white/30" style={{ background: customHex }} />
                                        <input type="color" value={customHex} onChange={e => { setCustomHex(e.target.value); setHexTouched(true); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </label>
                                    <button onClick={addColorWithHex} className="px-4 rounded-xl bg-white/5 text-white/70 hover:text-white border border-white/10"><Plus className="w-4 h-4" /></button>
                                </div>
                            </Field>
                            <Field label="Talles" hint="Tocá los que tenga. Están todos los de ropa de mujer; si usás otro, agregalo abajo.">
                                <div className="flex flex-col gap-3 mb-3">
                                    {TALLES_GRUPOS.map(g => (
                                        <div key={g.label}>
                                            <p className="text-[10px] uppercase tracking-widest text-white/35 font-bold mb-1.5">{g.label}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {g.items.map(s => (
                                                    <Chip key={s} active={sizes.includes(s)} onClick={() => toggle(sizes, setSizes, s)}>{s}</Chip>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {sizes.filter(s => !TALLES.includes(s)).length > 0 && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/35 font-bold mb-1.5">Tuyos</p>
                                            <div className="flex flex-wrap gap-2">
                                                {sizes.filter(s => !TALLES.includes(s)).map(s => (
                                                    <Chip key={s} active onClick={() => toggle(sizes, setSizes, s)}>{s}</Chip>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input value={customSize} onChange={e => setCustomSize(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addCustom(customSize, sizes, setSizes, setCustomSize); }} placeholder="Otro talle (ej: 38, 40)…" className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                                    <button onClick={() => addCustom(customSize, sizes, setSizes, setCustomSize)} className="px-4 rounded-xl bg-white/5 text-white/70 hover:text-white border border-white/10"><Plus className="w-4 h-4" /></button>
                                </div>
                            </Field>
                        </div>
                    </StepShell>
                )}

                {step === 'stock' && (
                    <StepShell {...shellProps} canNext={totalStock > 0}>
                        {usaVariantes ? (
                            <Field label="Stock por talle" hint="¿Cuántas unidades tenés de cada uno? (ej: 2 de L, 2 de XL, 1 de M)">
                                <div className="flex flex-col gap-2">
                                    {combos.map(cb => (
                                        <div key={cb.key} className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
                                            <span className="text-sm text-white/85 font-semibold flex items-center gap-2">
                                                {cb.c && <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ background: swatchBg(cb.c, colorHex) }} />}
                                                {cb.label}
                                            </span>
                                            <input
                                                type="number" min="0" inputMode="numeric"
                                                value={variantStock[cb.key] ?? ''}
                                                onChange={e => setVariantStock(prev => ({ ...prev, [cb.key]: e.target.value }))}
                                                placeholder="0"
                                                className="w-20 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-center outline-none focus:border-[#D4AF37]"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[#D4AF37] font-bold mt-3">Total: {totalStock} unidad{totalStock === 1 ? '' : 'es'}</p>
                            </Field>
                        ) : (
                            <Field label="Stock" hint="¿Cuántas unidades tenés en total?">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {STOCKS.map(s => <Chip key={s} active={stock === s} onClick={() => setStock(s)}>{s}</Chip>)}
                                </div>
                                <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="Otra cantidad…" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                            </Field>
                        )}
                    </StepShell>
                )}

                {step === 'price' && (
                    <div className="flex flex-col gap-5">
                        {!priceMode && (
                            <Field label="Precio" hint="¿Cómo querés definir el precio?">
                                <div className="flex flex-col gap-2">
                                    <Chip active={false} onClick={() => setPriceMode('final')}>Tengo el precio final</Chip>
                                    <Chip active={false} onClick={() => setPriceMode('cost')}>Calcular desde el costo (margen + MP)</Chip>
                                </div>
                            </Field>
                        )}

                        {priceMode === 'final' && (
                            <Field label="Precio final" hint="El precio de venta en pesos.">
                                <input autoFocus type="number" min="0" value={priceFinal} onChange={e => setPriceFinal(e.target.value)} placeholder="Ej: 25000" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                            </Field>
                        )}

                        {priceMode === 'cost' && (
                            <>
                                <Field label="Costo de la prenda" hint="Lo que te salió a vos (sin packaging ni flete).">
                                    <input autoFocus type="number" min="0" value={cost} onChange={e => setCost(e.target.value)} placeholder="Ej: 4000" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                                </Field>
                                <Field label="Margen de ganancia" hint="% que querés ganar SOBRE el costo (limpio, ya cubre la comisión de MP).">
                                    <div className="flex flex-wrap gap-2">
                                        {MARGENES.map(m => <Chip key={m} active={margin === m} onClick={() => setMargin(m)}>{m}%</Chip>)}
                                    </div>
                                </Field>
                                <Field label="Packaging (opcional)" hint="Costo del packaging por prenda. Dejá vacío si no aplica.">
                                    <input type="number" min="0" value={packaging} onChange={e => setPackaging(e.target.value)} placeholder="Ej: 500" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                                </Field>
                                <Field label="Flete del bulto (opcional)" hint="Costo TOTAL del flete y cuántas unidades vinieron. Reparto el flete por prenda.">
                                    <div className="flex gap-2">
                                        <input type="number" min="0" value={flete} onChange={e => setFlete(e.target.value)} placeholder="Flete total" className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                                        <input type="number" min="0" value={fleteUnits} onChange={e => setFleteUnits(e.target.value)} placeholder="Unidades" className="w-28 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37]" />
                                    </div>
                                </Field>
                                {priceCalc && (
                                    <div className="rounded-2xl p-4 border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06]">
                                        <p className="text-2xl font-black text-white">${priceCalc.price.toLocaleString('es-AR')}</p>
                                        <p className="text-xs text-white/60 mt-1">Costo total ${priceCalc.totalCost.toLocaleString('es-AR')}{priceCalc.shipPer ? ` (flete $${priceCalc.shipPer.toLocaleString('es-AR')}/u)` : ''} · comisión MP {commission}% = ${priceCalc.commissionAmount.toLocaleString('es-AR')}</p>
                                        <p className="text-sm text-emerald-400 font-bold mt-1">Ganás ${priceCalc.net.toLocaleString('es-AR')} limpios por venta</p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <button onClick={() => { if (priceMode) setPriceMode(''); else goBack(); }} className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Atrás
                            </button>
                            <button onClick={() => setStep('summary')} disabled={finalPrice <= 0} className="px-6 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: GOLD }}>
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {step === 'summary' && (
                    <div className="flex flex-col gap-4">
                        <p className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">Revisá antes de cargar</p>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                            {[
                                ['Nombre', name || '—'],
                                ['Categoría', newCat.trim() || category || '—'],
                                ['Colores', colors.length ? colors.join(', ') : '—'],
                                ['Talles', sizes.length ? sizes.join(', ') : '—'],
                                ['Stock', usaVariantes ? `${totalStock} (${combos.filter(cb => Number(variantStock[cb.key]) > 0).map(cb => `${cb.label}: ${Number(variantStock[cb.key]) || 0}`).join(', ') || 'sin cargar'})` : (totalStock || '0')],
                                ['Precio', launchSale && finalPrice > 0 ? `$${Math.round(finalPrice * (1 - salePercent / 100)).toLocaleString('es-AR')} (antes $${finalPrice.toLocaleString('es-AR')}, −${salePercent}%)` : `$${finalPrice.toLocaleString('es-AR')}`],
                                ...(material.trim() ? [['Tela', material.trim()]] : []),
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between px-4 py-2.5">
                                    <span className="text-white/50 text-sm">{k}</span>
                                    <span className="text-white text-sm font-semibold text-right max-w-[60%]">{v}</span>
                                </div>
                            ))}
                        </div>
                        {priceMode === 'cost' && priceCalc && (
                            <p className="text-sm text-emerald-400 font-bold text-center">Ganás ${priceCalc.net.toLocaleString('es-AR')} limpios por venta 💛</p>
                        )}
                        <Field label="Descripción (opcional)" hint="Contale a la IA qué es la prenda y te la escribe sola — solo con datos reales, sin inventar.">
                            {hasAdminAI(aiConfig) && (
                                <div className="mb-2.5 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.05] p-3">
                                    <input
                                        value={descDetails}
                                        onChange={e => setDescDetails(e.target.value)}
                                        placeholder="¿Qué es? Ej: remera oversize, cuello redondo, para el día"
                                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm outline-none focus:border-[#D4AF37] mb-2"
                                    />
                                    <button
                                        type="button" onClick={generarDescripcion} disabled={genDesc || !name.trim()}
                                        title={!name.trim() ? 'Primero el nombre' : 'Generar con IA'}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-[#1C1F25] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] hover:brightness-110 disabled:opacity-40"
                                    >
                                        {genDesc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {genDesc ? 'Escribiendo…' : 'Generar descripción con IA'}
                                    </button>
                                    {descErr && <p className="text-xs text-red-400 mt-1.5">{descErr}</p>}
                                </div>
                            )}
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Acá aparece la descripción (o escribila vos)." className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#D4AF37] resize-none" />
                        </Field>

                        <Field label="Detalles extra (opcional)" hint="Lo que sumás acá hace tu prenda más completa. Todo es opcional.">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-xs text-white/55 mb-1.5">Tela / composición <span className="text-white/30">(opcional · si NO la sabés, dejala vacía — no se inventa)</span></p>
                                    <input value={material} onChange={e => setMaterial(e.target.value)} placeholder="Solo si la conocés. Ej: Algodón 95%, Elastano 5%" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-[#D4AF37]" />
                                </div>
                                <button type="button" onClick={() => setFeatured(v => !v)} className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${featured ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white' : 'border-white/10 bg-white/[0.03] text-white/75'}`}>
                                    <span className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4AF37]" /> Destacar en la home</span>
                                    {featured ? <Check className="w-4 h-4 text-[#D4AF37]" /> : <span className="text-white/30 text-xs">Off</span>}
                                </button>
                                <div className={`rounded-xl border transition-all ${launchSale ? 'border-[#D4AF37]/60 bg-[#D4AF37]/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
                                    <button type="button" onClick={() => setLaunchSale(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/85">
                                        <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-[#D4AF37]" /> Lanzarla en oferta</span>
                                        {launchSale ? <Check className="w-4 h-4 text-[#D4AF37]" /> : <span className="text-white/30 text-xs">Off</span>}
                                    </button>
                                    {launchSale && finalPrice > 0 && (
                                        <div className="px-4 pb-3 -mt-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {[10, 15, 20, 30, 40, 50].map(p => (
                                                    <button key={p} type="button" onClick={() => setSalePercent(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${salePercent === p ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-white' : 'border-white/10 text-white/70'}`}>{p}%</button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-white/60">
                                                Queda <span className="text-white font-bold">${Math.round(finalPrice * (1 - salePercent / 100)).toLocaleString('es-AR')}</span>
                                                <span className="text-white/35 line-through ml-2">${finalPrice.toLocaleString('es-AR')}</span>
                                                <span className="text-emerald-400 font-bold ml-2">−{salePercent}%</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Field>
                        <div className="flex flex-col gap-2 pt-2">
                            <button onClick={() => publish(true)} disabled={saving} className="w-full py-3 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: GOLD }}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Publicar en la tienda
                            </button>
                            <button onClick={() => publish(false)} disabled={saving} className="w-full py-3 rounded-xl text-sm font-bold text-white/80 border border-white/15 hover:bg-white/5 disabled:opacity-50">
                                Guardar como borrador
                            </button>
                            <button onClick={goBack} className="text-sm text-white/40 hover:text-white py-1">← Corregir algo</button>
                        </div>
                    </div>
                )}

                {step === 'done' && (
                    <div className="flex flex-col items-center text-center gap-4 py-10">
                        {created?.error ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center"><X className="w-8 h-8 text-red-400" /></div>
                                <p className="text-white font-bold">No se pudo guardar</p>
                                <p className="text-white/50 text-sm">{created.error}</p>
                                <button onClick={() => setStep('summary')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-black" style={{ background: GOLD }}>Reintentar</button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: GOLD }}><Check className="w-8 h-8 text-black" /></div>
                                <p className="text-white font-bold text-lg">¡{created?.name} {created?.visible ? 'publicado' : 'guardado'}!</p>
                                <p className="text-white/50 text-sm">{created?.visible ? 'Ya está visible en la tienda' : 'Quedó como borrador en tu inventario'} · ${Number(created?.price || 0).toLocaleString('es-AR')}</p>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white/80 border border-white/15 hover:bg-white/5">Cerrar</button>
                                    <button onClick={() => onDone?.('reset')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-black" style={{ background: GOLD }}>Cargar otro</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductWizard;
