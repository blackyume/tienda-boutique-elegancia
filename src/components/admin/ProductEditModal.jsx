import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useConfirm } from '../ui/ConfirmDialog';
import { Button } from '../ui/Button';
import {
    Tag, X, DollarSign, TrendingUp, Calculator, SlidersHorizontal,
    Image as ImageIcon, UploadCloud, Monitor, Check as CheckIcon, Sparkles,
    AlertTriangle
} from 'lucide-react';
import { formatMoney } from '../../utils/helpers';
import { generateProductCopy } from '../../utils/gemini';
import { getTotalStock } from '../../utils/variants';
import { getColorHex } from '../../utils/colors';

const TABS = [
    { id: 'info', label: 'Producto' },
    { id: 'variants', label: 'Variantes' },
    { id: 'pricing', label: 'Precio & Costos' },
];

export const ProductEditModal = ({ initialProduct, onClose }) => {
    const { inventory, addProduct, updateProduct, addToast, categories, uploadImage, aiConfig } = useStore();
    const confirm = useConfirm();

    const [currentProduct, setCurrentProduct] = useState(() => initialProduct || {});
    const [tab, setTab] = useState('info');
    const [tempColor, setTempColor] = useState('');
    const [tempSize, setTempSize] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
    const [calcEnvioTotal, setCalcEnvioTotal] = useState('');
    const [calcEnvioCant, setCalcEnvioCant] = useState('');
    const [targetMargin, setTargetMargin] = useState('');
    const [targetProfit, setTargetProfit] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    // --- VALIDACIÓN EN VIVO ---
    const totalCost = (Number(currentProduct.cost) || 0) + (Number(currentProduct.shippingCost) || 0)
        + (Number(currentProduct.packagingCost) || 0) + (Number(currentProduct.fixedFee) || 0);

    // Simulación (precio vacío => sin ganancia calculable, no número negativo)
    const priceNum = Number(currentProduct.price) || 0;
    const baseCosts = (Number(currentProduct.cost) || 0) + (Number(currentProduct.shippingCost) || 0) + (Number(currentProduct.packagingCost) || 0);
    const fixedFeeNum = Number(currentProduct.fixedFee) || 0;
    const feeVar = priceNum * ((Number(currentProduct.feePercent) || 0) / 100);
    const netProfit = priceNum > 0 ? priceNum - baseCosts - fixedFeeNum - feeVar : null;
    const marginPct = priceNum > 0 ? ((netProfit / priceNum) * 100).toFixed(1) : null;

    const validation = useMemo(() => {
        const blocking = [];
        const warnings = [];
        if (!String(currentProduct.name || '').trim()) blocking.push({ tab: 'info', msg: 'Falta el nombre del producto' });
        if (!currentProduct.price || Number(currentProduct.price) <= 0) blocking.push({ tab: 'pricing', msg: 'El precio debe ser mayor a 0' });
        if ((currentProduct.media || []).some(m => m.isUploading)) blocking.push({ tab: 'info', msg: 'Esperá a que terminen de subir las imágenes' });
        if (Number(currentProduct.stock) < 0) blocking.push({ tab: 'info', msg: 'El stock no puede ser negativo' });

        if (Number(currentProduct.price) > 0 && totalCost > 0 && Number(currentProduct.price) <= totalCost) {
            warnings.push('El precio es menor o igual al costo total — venderías a pérdida');
        }
        if (currentProduct.active && getTotalStock(currentProduct) <= 0) {
            warnings.push('Sin stock comprable: se publicará como "Sin stock"');
        }
        if (!String(currentProduct.category || '').trim()) {
            warnings.push('Sin categoría: el producto no aparecerá filtrado por categoría');
        }
        return { blocking, warnings };
    }, [currentProduct, totalCost]);

    const tabHasError = (tabId) => validation.blocking.some(b => b.tab === tabId);

    // --- MEDIA HANDLERS ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const tempId = Date.now();
        const localPreview = URL.createObjectURL(file);
        const tempMediaItem = { type: 'image', url: localPreview, isUploading: true, tempId };
        setCurrentProduct(prev => ({ ...prev, media: [...(prev.media || []), tempMediaItem] }));
        addToast('Subiendo imagen...', 'info');
        try {
            const url = await uploadImage(file);
            if (url) {
                setCurrentProduct(curr => {
                    const updatedMedia = (curr.media || []).map(item =>
                        item.tempId === tempId ? { type: 'image', url: url } : item
                    );
                    return { ...curr, media: updatedMedia, image: updatedMedia.find(m => m.type === 'image')?.url || '' };
                });
                addToast('Imagen subida correctamente', 'success');
            } else {
                console.warn('Upload returned null');
                setCurrentProduct(curr => ({
                    ...curr,
                    media: (curr.media || []).map(item =>
                        item.tempId === tempId ? { ...item, isUploading: false, status: 'error', errorMessage: 'Respuesta vacía del servidor' } : item
                    )
                }));
                addToast('Error al subir imagen (Null)', 'error');
            }
        } catch (error) {
            console.error('Error en handleImageUpload:', error);
            const msg = error.message || 'Error de conexión';
            addToast('Error al subir: ' + msg, 'error');
            setCurrentProduct(curr => ({
                ...curr,
                media: (curr.media || []).map(item =>
                    item.tempId === tempId ? { ...item, isUploading: false, status: 'error', errorMessage: msg } : item
                )
            }));
        }
    };

    const handleAddVideo = (url) => {
        if (!url.trim()) return;
        const newMedia = [...(currentProduct.media || []), { type: 'video', url }];
        setCurrentProduct({ ...currentProduct, media: newMedia });
        addToast('Video agregado', 'success');
    };

    const removeMedia = (index) => {
        const newMedia = [...(currentProduct.media || [])];
        newMedia.splice(index, 1);
        setCurrentProduct({
            ...currentProduct,
            media: newMedia,
            image: newMedia.find(m => m.type === 'image')?.url || ''
        });
    };

    // --- SAVE ---
    const handleSaveProduct = async () => {
        if (validation.blocking.length) {
            setShowErrors(true);
            setTab(validation.blocking[0].tab);
            return addToast(validation.blocking[0].msg, 'error');
        }

        const media = currentProduct.media || [];
        const cleanMedia = media.filter(m =>
            !m.isUploading && m.status !== 'error' && !String(m.url || '').startsWith('blob:')
        );
        const firstImg = cleanMedia.find(m => m.type === 'image')?.url || '';
        const cleanImage = firstImg || (String(currentProduct.image || '').startsWith('blob:') ? '' : (currentProduct.image || ''));

        const productToSave = {
            ...currentProduct,
            media: cleanMedia,
            image: cleanImage,
            price: Number(currentProduct.price),
            stock: Number(currentProduct.stock),
            cost: Number(currentProduct.cost || 0),
            shippingCost: Number(currentProduct.shippingCost || 0),
            packagingCost: Number(currentProduct.packagingCost || 0),
            feePercent: Number(currentProduct.feePercent || 0),
            fixedFee: Number(currentProduct.fixedFee || 0),
            active: currentProduct.active !== undefined ? currentProduct.active : true
        };

        if (productToSave.active && getTotalStock(productToSave) <= 0) {
            const ok = await confirm({
                title: 'Sin stock comprable',
                message: 'Se va a publicar pero no tiene stock (ni variantes con stock). Aparecerá como "Sin stock" y no se podrá comprar. ¿Publicar igual?',
                confirmText: 'Publicar igual'
            });
            if (!ok) return;
        }

        setIsSaving(true);
        try {
            if (productToSave.id && inventory.find(p => p.id === productToSave.id)) {
                await updateProduct(productToSave.id, productToSave);
            } else {
                await addProduct(productToSave);
            }
            addToast(productToSave.active ? 'Producto publicado' : 'Borrador guardado', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            addToast('Error al guardar: ' + error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateCopy = async () => {
        if (!currentProduct?.name) return addToast('Agregá primero el nombre del producto', 'error');
        if (!aiConfig?.adminKeys) return addToast('Configurá las API keys de Admin en Integraciones', 'error');
        setIsGeneratingCopy(true);
        try {
            const copy = await generateProductCopy(currentProduct, aiConfig);
            setCurrentProduct(prev => {
                const existingDesc = prev.description ? String(prev.description).trim() : '';
                const bulletsBlock = copy.bullets.length ? '\n\n• ' + copy.bullets.join('\n• ') : '';
                return {
                    ...prev,
                    description: (copy.description || existingDesc) + bulletsBlock,
                    seoKeywords: copy.keywords.join(', ') || prev.seoKeywords || ''
                };
            });
            addToast('Descripción generada', 'success');
        } catch (err) {
            console.error('Gemini error:', err);
            addToast(err.message || 'No se pudo generar', 'error');
        } finally {
            setIsGeneratingCopy(false);
        }
    };

    const updateShippingFromCalc = (t, c) => {
        setCalcEnvioTotal(t);
        setCalcEnvioCant(c);
        const cNum = Number(c);
        if (cNum > 0) setCurrentProduct(prev => ({ ...prev, shippingCost: (Number(t) / cNum).toFixed(0) }));
    };

    const handleAddColor = () => {
        if (!tempColor) return;
        setCurrentProduct({ ...currentProduct, colors: [...(currentProduct.colors || []), tempColor] });
        setTempColor('');
    };
    const removeColor = (index) => setCurrentProduct({ ...currentProduct, colors: currentProduct.colors.filter((_, i) => i !== index) });
    const handleAddSize = () => {
        if (!tempSize) return;
        setCurrentProduct({ ...currentProduct, sizes: [...(currentProduct.sizes || []), tempSize] });
        setTempSize('');
    };
    const removeSize = (index) => setCurrentProduct({ ...currentProduct, sizes: currentProduct.sizes.filter((_, i) => i !== index) });

    const applyTargetMargin = () => {
        const margin = Number(targetMargin);
        if (!targetMargin || isNaN(margin) || margin <= 0) return addToast('Ingresá un margen % válido', 'error');
        const t = Number(currentProduct.cost || 0) + Number(currentProduct.shippingCost || 0) + Number(currentProduct.packagingCost || 0) + Number(currentProduct.fixedFee || 0);
        if (t <= 0) return addToast('Cargá primero el costo de la prenda para usar el margen %', 'error');
        const feeDecimal = (Number(currentProduct.feePercent || 0) / 100);
        if (feeDecimal >= 1) return addToast('La comisión no puede ser 100% o más', 'error');
        let p = (t * (1 + margin / 100)) / (1 - feeDecimal);
        if (!isFinite(p) || p <= 0) return addToast('No se pudo calcular el precio', 'error');
        p = Math.ceil(p / 100) * 100;
        setCurrentProduct(prev => ({ ...prev, price: p }));
        setTargetProfit('');
        addToast(`Precio fijado en ${formatMoney(p)}`, 'success');
    };

    const applyTargetProfit = () => {
        const profit = Number(targetProfit);
        if (!targetProfit || isNaN(profit) || profit <= 0) return addToast('Ingresá un monto de ganancia válido', 'error');
        const t = Number(currentProduct.cost || 0) + Number(currentProduct.shippingCost || 0) + Number(currentProduct.packagingCost || 0) + Number(currentProduct.fixedFee || 0);
        const feeDecimal = (Number(currentProduct.feePercent || 0) / 100);
        if (feeDecimal >= 1) return addToast('La comisión no puede ser 100% o más', 'error');
        let p = (t + profit) / (1 - feeDecimal);
        if (!isFinite(p) || p <= 0) return addToast('No se pudo calcular el precio', 'error');
        p = Math.ceil(p / 100) * 100;
        setCurrentProduct(prev => ({ ...prev, price: p }));
        setTargetMargin('');
        addToast(`Precio fijado en ${formatMoney(p)}`, 'success');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#F8FAFC] dark:bg-[#0f172a] w-full max-w-[95vw] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl">
                {/* Header */}
                <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1e293b] shrink-0">
                    <h3 className="font-bold text-base sm:text-lg dark:text-white flex items-center gap-2"><Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" /> {currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={onClose} aria-label="Cerrar modal" className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>

                {/* Tabs */}
                <div className="flex shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] px-3 sm:px-5 gap-1">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`relative px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === t.id ? 'text-[#C19A6B]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {t.label}
                            {showErrors && tabHasError(t.id) && <span className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C19A6B]" />}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* FORM SCROLLABLE */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white dark:bg-[#1e293b]">
                        {/* TAB: PRODUCTO */}
                        {tab === 'info' && (
                            <section className="flex flex-col gap-6">
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-widest"><UploadCloud className="w-4 h-4 text-[#C19A6B]" /> Galería Multimedia</h4>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                                        {(currentProduct.media || []).map((item, index) => (
                                            <div key={item.tempId || item.url || index} className={`aspect-square rounded-xl overflow-hidden relative group border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${item.isUploading ? 'opacity-70' : ''}`}>
                                                {item.type === 'image' ? (
                                                    <>
                                                        <img src={item.url} className={`w-full h-full object-cover ${item.status === 'error' ? 'grayscale opacity-50' : ''}`} alt="Media" />
                                                        {item.isUploading && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                                                                <div className="w-8 h-8 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin mb-2"></div>
                                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Subiendo...</span>
                                                            </div>
                                                        )}
                                                        {item.status === 'error' && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/95 z-20 p-2 text-center fade-in">
                                                                <div className="text-white font-bold text-[10px] mb-1">¡FALLÓ!</div>
                                                                <div className="text-red-200 text-[9px] leading-tight mb-2 px-1 max-h-[40px] overflow-hidden text-ellipsis" title={item.errorMessage || 'Error desconocido'}>
                                                                    {item.errorMessage || 'Error desconocido'}
                                                                </div>
                                                                <button onClick={() => removeMedia(index)} className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors">
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white relative">
                                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                                        <div className="text-center z-10">
                                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1 backdrop-blur-sm border border-white/10"><div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5"></div></div>
                                                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Video</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 top-0 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/50 to-transparent">
                                                    <button onClick={() => removeMedia(index)} aria-label="Quitar media" className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transform hover:scale-110 transition-all">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                {index === 0 && <span className="absolute bottom-2 left-2 bg-[#C19A6B] text-white text-[9px] px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider backdrop-blur-md">Principal</span>}
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#C19A6B] dark:hover:border-[#C19A6B] cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-[#C19A6B] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all bg-transparent group">
                                            <UploadCloud className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold uppercase text-center px-1">Subir Foto</span>
                                            <input type="file" className="hidden" accept=".jpg, .jpeg, .png, .webp" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                    <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-[#C19A6B] transition-colors">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400"><Monitor className="w-4 h-4" /></div>
                                        <input
                                            type="text"
                                            placeholder="Pegar URL de video (YouTube, MP4...)"
                                            className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white placeholder:text-slate-400/70"
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideo(e.target.value); e.target.value = ''; } }}
                                        />
                                        <Button onClick={(e) => { const input = e.target.previousSibling; handleAddVideo(input.value); input.value = ''; }} className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider h-auto py-2">
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <InputGroup label="Nombre del Producto">
                                        <input value={currentProduct.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="input font-bold text-lg" placeholder="Ej: Remera Básica" />
                                        {showErrors && !String(currentProduct.name || '').trim() && <p className="text-[11px] text-red-500 mt-1 font-medium">Requerido</p>}
                                    </InputGroup>
                                    <div className="mb-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción Detallada</label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateCopy}
                                                disabled={isGeneratingCopy || !currentProduct.name}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-black shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
                                                style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                                                title="Generar descripción con Elegancia IA (requiere nombre y categoría)"
                                            >
                                                <Sparkles className={`w-3 h-3 ${isGeneratingCopy ? 'animate-pulse' : ''}`} />
                                                {isGeneratingCopy ? 'Generando…' : 'Generar con IA'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={currentProduct.description || ''}
                                            onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                            className="input min-h-[80px] text-sm resize-none"
                                            placeholder="Describe las características de la prenda (tela, corte, cuidados...)"
                                        />
                                        {currentProduct.seoKeywords && (
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                <span className="uppercase tracking-wider font-bold">Keywords SEO: </span>
                                                {currentProduct.seoKeywords}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Categoría">
                                            <input list="categories-list" value={currentProduct.category || ''} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="input" placeholder="Ej: Vestidos" />
                                            <datalist id="categories-list">
                                                {categories.map(c => <option key={c.id} value={c.name} />)}
                                            </datalist>
                                        </InputGroup>
                                        <InputGroup label="Stock Actual">
                                            <input type="number" min="0" placeholder="0" value={currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value })} className="input font-bold" />
                                            {showErrors && Number(currentProduct.stock) < 0 && <p className="text-[11px] text-red-500 mt-1 font-medium">No puede ser negativo</p>}
                                        </InputGroup>
                                    </div>
                                    <InputGroup label="Variantes de Talle">
                                        <div className="flex gap-2 mb-2">
                                            <div className="relative flex-1">
                                                <input
                                                    value={tempSize}
                                                    onChange={e => setTempSize(e.target.value.toUpperCase())}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddSize()}
                                                    className="input"
                                                    placeholder="Ej: S, M, L, XL, 38, 40..."
                                                />
                                                <button onClick={handleAddSize} aria-label="Agregar talle" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-[#C19A6B] transition-colors"><CheckIcon className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(currentProduct.sizes || []).map((size, index) => (
                                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm">
                                                    {size}
                                                    <button onClick={() => removeSize(index)} aria-label={`Quitar talle ${size}`} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                            {(currentProduct.sizes || []).length === 0 && <span className="text-xs text-slate-400 italic">Sin talles definidos</span>}
                                        </div>
                                    </InputGroup>
                                    <InputGroup label="Variantes de Color">
                                        <div className="flex gap-2 mb-2">
                                            <div className="relative flex-1">
                                                <input
                                                    value={tempColor}
                                                    onChange={e => setTempColor(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddColor()}
                                                    className="input"
                                                    placeholder="Ej: Rojo, Negro, Nude..."
                                                />
                                                {tempColor && (
                                                    <div
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-colors duration-300"
                                                        style={{ backgroundColor: getColorHex(tempColor) }}
                                                    />
                                                )}
                                            </div>
                                            <Button onClick={handleAddColor} className="bg-slate-800 text-white px-3 py-0 rounded-lg h-[42px]">+</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(currentProduct.colors || []).map((c, i) => (
                                                <div key={`${c}-${i}`} className="relative group/color">
                                                    <div
                                                        className="w-8 h-8 rounded-full border border-slate-200 shadow-sm cursor-help relative"
                                                        style={{ backgroundColor: getColorHex(c) }}
                                                        title={c}
                                                    >
                                                        <button
                                                            onClick={() => removeColor(i)}
                                                            aria-label={`Quitar color ${c}`}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/color:opacity-100 transition-opacity shadow-sm"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                        {c}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </InputGroup>
                                    <InputGroup label="Etiquetas / Badges">
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { key: 'isNew', label: 'NUEVO', color: 'bg-emerald-500' },
                                                { key: 'isOnSale', label: 'OFERTA', color: 'bg-red-500' },
                                                { key: 'isSeason', label: 'TEMPORADA', color: 'bg-amber-500' },
                                                { key: 'isFeatured', label: 'DESTACADO', color: 'bg-purple-500' },
                                                { key: 'isExclusive', label: 'EXCLUSIVO', color: 'bg-slate-900' }
                                            ].map(badge => (
                                                <button
                                                    key={badge.key}
                                                    type="button"
                                                    onClick={() => setCurrentProduct({
                                                        ...currentProduct,
                                                        badges: { ...currentProduct.badges, [badge.key]: !currentProduct.badges?.[badge.key] }
                                                    })}
                                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${currentProduct.badges?.[badge.key]
                                                        ? `${badge.color} text-white shadow-lg scale-105`
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {currentProduct.badges?.[badge.key] ? '✓ ' : ''}{badge.label}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">Las etiquetas se muestran como badges en la tienda.</p>
                                    </InputGroup>
                                </div>
                            </section>
                        )}

                        {/* TAB: VARIANTES */}
                        {tab === 'variants' && (
                            <section>
                                <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4">
                                    <SlidersHorizontal className="w-4 h-4 text-[#C19A6B]" /> Variantes (Precio por Talle/Color)
                                </h4>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                                    <p className="text-xs text-slate-500 mb-3">Opcional: Define precios y stock diferentes para cada combinación de talle y color.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const sizes = currentProduct.sizes || [];
                                            const colors = currentProduct.colors || [];
                                            if (sizes.length === 0 || colors.length === 0) {
                                                return addToast('Primero agregá talles y colores', 'error');
                                            }
                                            const newVariants = [];
                                            sizes.forEach(size => {
                                                colors.forEach(color => {
                                                    const exists = (currentProduct.variants || []).find(v => v.size === size && v.color === color);
                                                    if (!exists) {
                                                        newVariants.push({ size, color, price: currentProduct.price || 0, stock: 0 });
                                                    }
                                                });
                                            });
                                            setCurrentProduct({ ...currentProduct, variants: [...(currentProduct.variants || []), ...newVariants] });
                                            addToast(`${newVariants.length} variantes generadas`, 'success');
                                        }}
                                        className="px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-[#C19A6B] transition-colors"
                                    >
                                        Generar Variantes Automáticas
                                    </button>
                                </div>
                                {(currentProduct.variants || []).length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                                    <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Talle</th>
                                                    <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Color</th>
                                                    <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Precio</th>
                                                    <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Stock</th>
                                                    <th className="py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(currentProduct.variants || []).map((variant, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                                                        <td className="py-2">
                                                            <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold">{variant.size}</span>
                                                        </td>
                                                        <td className="py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: getColorHex(variant.color) }}></div>
                                                                <span className="text-xs">{variant.color}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                aria-label={`Precio variante ${variant.size} ${variant.color}`}
                                                                value={variant.price}
                                                                onChange={(e) => setCurrentProduct({
                                                                    ...currentProduct,
                                                                    variants: currentProduct.variants.map((v, i) => i === idx ? { ...v, price: Number(e.target.value) } : v)
                                                                })}
                                                                className="w-24 p-1 border rounded text-center font-bold dark:bg-slate-800 dark:border-slate-700"
                                                            />
                                                        </td>
                                                        <td className="py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                aria-label={`Stock variante ${variant.size} ${variant.color}`}
                                                                value={variant.stock}
                                                                onChange={(e) => setCurrentProduct({
                                                                    ...currentProduct,
                                                                    variants: currentProduct.variants.map((v, i) => i === idx ? { ...v, stock: Number(e.target.value) } : v)
                                                                })}
                                                                className="w-20 p-1 border rounded text-center font-bold dark:bg-slate-800 dark:border-slate-700"
                                                            />
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            <button
                                                                type="button"
                                                                aria-label="Quitar variante"
                                                                onClick={() => {
                                                                    const updated = currentProduct.variants.filter((_, i) => i !== idx);
                                                                    setCurrentProduct({ ...currentProduct, variants: updated });
                                                                }}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Sin variantes. Generá automáticas o usá el stock simple de la pestaña Producto.</p>
                                )}
                            </section>
                        )}

                        {/* TAB: PRECIO & COSTOS */}
                        {tab === 'pricing' && (
                            <div className="space-y-8">
                                <section>
                                    <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4"><DollarSign className="w-4 h-4 text-[#C19A6B]" /> Estructura de Costos</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <InputGroup label="Costo Prenda ($)" help="Fabricación/Compra">
                                            <input type="number" min="0" placeholder="0" value={currentProduct.cost} onChange={e => setCurrentProduct({ ...currentProduct, cost: e.target.value })} className="input" />
                                        </InputGroup>
                                        <InputGroup label="Packaging ($)" help="Bolsa, etiquetas">
                                            <input type="number" min="0" placeholder="0" value={currentProduct.packagingCost} onChange={e => setCurrentProduct({ ...currentProduct, packagingCost: e.target.value })} className="input" />
                                        </InputGroup>
                                        <InputGroup label="Comisión MP (%)" help="Ej: 6%">
                                            <input type="number" min="0" max="100" placeholder="0" value={currentProduct.feePercent} onChange={e => setCurrentProduct({ ...currentProduct, feePercent: e.target.value })} className="input" />
                                        </InputGroup>
                                        <InputGroup label="Costo Fijo MP ($)" help="Ej: 1500 (Opcional)">
                                            <input type="number" min="0" placeholder="0" value={currentProduct.fixedFee} onChange={e => setCurrentProduct({ ...currentProduct, fixedFee: e.target.value })} className="input" />
                                        </InputGroup>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-sm mt-4">
                                        <div className="flex items-center gap-2 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700 pb-2">
                                            <TruckIcon className="w-4 h-4 text-[#C19A6B]" />
                                            <span className="text-xs uppercase font-bold tracking-wider">Asistente de Flete (Calculadora Unitaria)</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block mb-1">Costo Total del Bulto</label>
                                                <input type="number" placeholder="0" value={calcEnvioTotal} onChange={(e) => updateShippingFromCalc(e.target.value, calcEnvioCant)} className="w-full p-2 border rounded-lg bg-white dark:bg-black outline-none focus:border-[#C19A6B] text-center font-bold" />
                                            </div>
                                            <span className="text-slate-300 text-xl font-light">/</span>
                                            <div className="w-24">
                                                <label className="text-[10px] text-slate-400 block mb-1">Unidades</label>
                                                <input type="number" placeholder="0" value={calcEnvioCant} onChange={(e) => updateShippingFromCalc(calcEnvioTotal, e.target.value)} className="w-full p-2 border rounded-lg bg-white dark:bg-black outline-none focus:border-[#C19A6B] text-center font-bold" />
                                            </div>
                                            <span className="text-slate-300 text-xl font-light">=</span>
                                            <div className="flex-1 bg-white dark:bg-black border border-emerald-100 dark:border-emerald-900/30 p-2 rounded-lg text-center">
                                                <span className="block text-emerald-600 dark:text-emerald-400 font-black text-lg">{formatMoney(currentProduct.shippingCost)}</span>
                                                <span className="block text-[9px] text-emerald-600/60 uppercase font-bold">Costo x Prenda</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4" /> Estrategia de Precio</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex gap-2 items-center justify-between bg-white dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider">Margen Deseado %</span>
                                                <input type="number" placeholder="50" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} className="w-full text-lg border-none outline-none bg-transparent text-emerald-900 dark:text-emerald-100 placeholder-emerald-300/50 font-bold p-0 mt-1" />
                                            </div>
                                            <Button onClick={applyTargetMargin} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 h-auto rounded-lg shadow-emerald-200 dark:shadow-none">Aplicar</Button>
                                        </div>
                                        <div className="flex gap-2 items-center justify-between bg-white dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider">Ganancia Deseada $</span>
                                                <input type="number" placeholder="5000" value={targetProfit} onChange={(e) => setTargetProfit(e.target.value)} className="w-full text-lg border-none outline-none bg-transparent text-emerald-900 dark:text-emerald-100 placeholder-emerald-300/50 font-bold p-0 mt-1" />
                                            </div>
                                            <Button onClick={applyTargetProfit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 h-auto rounded-lg shadow-emerald-200 dark:shadow-none">Aplicar</Button>
                                        </div>
                                    </div>
                                    <InputGroup label="PRECIO DE VENTA PÚBLICO">
                                        <input type="number" min="0" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="w-full p-4 text-3xl font-black text-right bg-white dark:bg-[#111827] border-2 border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-white focus:border-emerald-400 outline-none shadow-sm placeholder:text-slate-200 dark:placeholder:text-slate-700" placeholder="0.00" />
                                        {showErrors && (!currentProduct.price || Number(currentProduct.price) <= 0)
                                            ? <p className="text-right text-[11px] text-red-500 mt-2 font-medium">El precio debe ser mayor a 0</p>
                                            : <p className="text-right text-xs text-slate-400 mt-2 font-medium">Este es el precio final que verá el cliente</p>}
                                    </InputGroup>
                                </section>
                            </div>
                        )}
                    </div>

                    {/* PREVIEW SIDEBAR */}
                    <div className="w-full lg:w-80 bg-slate-50 dark:bg-[#020617] border-l border-slate-200 dark:border-slate-800 p-8 flex flex-col">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 text-center flex items-center justify-center gap-2"><Calculator className="w-4 h-4" /> Simulación Real</h4>
                        <div className="space-y-3 text-sm flex-1">
                            <Row label="Costo Prenda" value={currentProduct.cost} />
                            <Row label="Flete Unitario" value={currentProduct.shippingCost} />
                            <Row label="Packaging" value={currentProduct.packagingCost} />
                            <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
                            <Row label="Subtotal Costos" value={(Number(currentProduct.cost) || 0) + (Number(currentProduct.shippingCost) || 0) + (Number(currentProduct.packagingCost) || 0)} bold />
                            <div className="py-4"></div>
                            <Row label={`Comisión Variable (${currentProduct.feePercent || 0}%)`} value={feeVar} isNegative />
                            {fixedFeeNum > 0 && <Row label="Comisión Fija MP" value={fixedFeeNum} isNegative />}
                            <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>
                            <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 text-center">Tu Ganancia Neta</p>
                                <p className={`text-3xl font-black text-center mb-2 ${netProfit === null ? 'text-slate-400' : netProfit < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {netProfit === null ? '—' : formatMoney(netProfit)}
                                </p>
                                <div className="text-center">
                                    <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-bold uppercase">
                                        Margen: {marginPct === null ? '—' : `${marginPct}%`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avisos (warnings no bloqueantes) */}
                {validation.warnings.length > 0 && (
                    <div className="shrink-0 border-t border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/15 px-4 py-2.5 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <ul className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight space-y-0.5">
                            {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </div>
                )}

                {/* Barra de acción fija */}
                <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-3 sm:p-4 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentProduct(p => ({ ...p, active: !p.active }))}
                        className="flex items-center gap-2.5 group select-none"
                        title="Si está apagado, se guarda como borrador y NO se ve en la tienda"
                    >
                        <span className={`relative w-11 h-6 rounded-full transition-colors ${currentProduct.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${currentProduct.active ? 'translate-x-5' : ''}`} />
                        </span>
                        <span className="text-left leading-tight">
                            <span className={`block text-xs sm:text-sm font-bold ${currentProduct.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                {currentProduct.active ? 'Visible en la tienda' : 'Borrador (oculto)'}
                            </span>
                            <span className="block text-[10px] text-slate-400">{currentProduct.active ? 'Se publica al guardar' : 'No aparece en la web'}</span>
                        </span>
                    </button>
                    <div className="flex items-center gap-3">
                        {validation.blocking.length > 0 && (
                            <span className="hidden sm:block text-[11px] text-red-500 font-medium max-w-[220px] text-right leading-tight">
                                {validation.blocking[0].msg}
                            </span>
                        )}
                        <button onClick={onClose} className="px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Cancelar
                        </button>
                        <Button
                            onClick={handleSaveProduct}
                            isLoading={isSaving}
                            disabled={validation.blocking.length > 0}
                            className="bg-[#C19A6B] hover:bg-[#a38056] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#C19A6B]/20 text-base sm:text-lg transition-transform active:scale-95"
                        >
                            {isSaving ? 'Guardando…' : (currentProduct.active ? 'PUBLICAR' : 'GUARDAR BORRADOR')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputGroup = ({ label, help, children }) => (
    <div className="mb-1">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-500">{label}</label>
        {children}
        {help && <p className="text-[10px] text-slate-400 mt-1 italic">{help}</p>}
    </div>
);

const Row = ({ label, value, isNegative, bold }) => (
    <div className={`flex justify-between items-center py-1 ${bold ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
        <span>{label}</span>
        <span className={`font-mono ${isNegative ? 'text-red-500' : ''}`}>{isNegative ? '-' : ''}{formatMoney(value)}</span>
    </div>
);

const TruckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" /><circle cx="7" cy="18" r="2" /><circle cx="15" cy="18" r="2" /></svg>
);
