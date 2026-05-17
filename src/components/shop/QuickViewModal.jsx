import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Check, Ruler, Share2, ChevronDown, ArrowRight, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatMoney, getColorHex } from '../../utils/helpers';
import { useStore } from '../../context/StoreContext';
import { getTotalStock, isColorAvailable, isSizeAvailable } from '../../utils/variants';
import { Garment360Viewer, getViewerMode } from './Garment360Viewer';

export const QuickViewModal = ({ product, onClose }) => {
    const navigate = useNavigate();
    const { addToCart, isInWishlist, toggleWishlist: toggleWishlistCtx, addToast, setIsSizeGuideOpen, setIsCartOpen } = useStore();
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [copied, setCopied] = useState(false);

    // Media State
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    const mediaList = product?.media && product.media.length > 0
        ? product.media
        : Array.isArray(product?.images) && product.images.length > 0
            ? product.images.map(url => ({ type: 'image', url }))
            : [{ type: 'image', url: product?.image }];

    // Visor giratorio (convive con la galería estática vía toggle)
    const imageUrls = mediaList.filter(m => m.type === 'image' && m.url).map(m => m.url);
    const viewerMode = getViewerMode(product, imageUrls);
    const [spinOn, setSpinOn] = useState(false);

    useEffect(() => {
        if (!product) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [product, onClose]);

    if (!product) return null;

    const isWishlisted = isInWishlist(product.id);
    const totalStock = getTotalStock(product);

    const handleAddToCart = () => {
        const ok = addToCart(product, selectedSize, selectedColor);
        if (ok) {
            onClose();
            setTimeout(() => setIsCartOpen(true), 300);
        }
    };

    const toggleWishlist = () => {
        const wasIn = isInWishlist(product.id);
        toggleWishlistCtx(product.id);
        addToast(wasIn ? "Eliminado de favoritos" : "Agregado a favoritos", wasIn ? "info" : "success");
    };

    const copyLink = () => {
        const url = `${window.location.origin}/product/${product.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        addToast("Enlace copiado", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const goToDetail = () => {
        onClose();
        navigate(`/product/${product.id}`);
        window.scrollTo(0, 0);
    };

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1] || url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
        }
        return url; // Return as is for MP4 or unknown (handled by iframe or video tag logic later if expanded)
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-label={`Vista rápida: ${product.name}`}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* Halo dorado que respira detrás del modal */}
            <div aria-hidden className="pointer-events-none absolute w-[min(1080px,92vw)] h-[78vh] rounded-full bg-[#C19A6B]/15 blur-[130px] animate-pulse" />

            {/* Marco con borde dorado animado (cometa que gira y destaca) */}
            <div
                className="relative w-full max-w-5xl max-h-[92vh] rounded-[26px] p-[2px] overflow-hidden shadow-[0_0_80px_-14px_rgba(193,154,107,0.6)] animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-[60%] animate-[spin_5s_linear_infinite]"
                    style={{
                        background:
                            'conic-gradient(from 0deg, rgba(193,154,107,0) 0deg, rgba(193,154,107,0) 225deg, #BF953F 280deg, #FCF6BA 312deg, #B38728 344deg, rgba(193,154,107,0) 360deg)'
                    }}
                />
                {/* Borde estático tenue para que el marco siempre se lea */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-[#C19A6B]/20" />

                <div className="relative bg-white dark:bg-slate-950 w-full max-h-[92vh] overflow-y-auto rounded-[24px] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>

                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full transition-colors backdrop-blur-md shadow-sm">
                    <X className="w-5 h-5 text-slate-900 dark:text-white" />
                </button>

                {/* GALERÍA MULTIMEDIA */}
                <div className="w-full md:w-[55%] bg-slate-100 dark:bg-slate-900 relative flex flex-col">
                    {/* Main Viewer */}
                    <div className="flex-1 relative min-h-[300px] md:min-h-[500px]">
                        {mediaList[activeMediaIndex].type === 'video' ? (
                            <iframe
                                src={getEmbedUrl(mediaList[activeMediaIndex].url)}
                                className="absolute inset-0 w-full h-full object-cover"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Product Video"
                            ></iframe>
                        ) : spinOn && viewerMode !== 'static' ? (
                            <Garment360Viewer
                                images={imageUrls}
                                mode={viewerMode}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full"
                            />
                        ) : (
                            <img src={mediaList[activeMediaIndex].url} alt={product.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                        )}

                        {/* Toggle: galería estática ⇄ visor giratorio (conviven) */}
                        {viewerMode !== 'static' && mediaList[activeMediaIndex].type !== 'video' && (
                            <button
                                type="button"
                                onClick={() => setSpinOn(s => !s)}
                                className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur transition-colors ${spinOn ? 'bg-[#C19A6B] text-black' : 'bg-black/55 hover:bg-black/75 text-white'}`}
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                                {spinOn ? 'Ver galería' : (viewerMode === 'spin' ? 'Girar 360°' : 'Girar prenda')}
                            </button>
                        )}

                        {/* Navigation Arrows (if multiple, sólo en galería estática) */}
                        {!spinOn && mediaList.length > 1 && (
                            <>
                                <button onClick={() => setActiveMediaIndex(prev => prev === 0 ? mediaList.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-sm transition-all"><ChevronDown className="w-5 h-5 rotate-90" /></button>
                                <button onClick={() => setActiveMediaIndex(prev => prev === mediaList.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-sm transition-all"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails (Only if > 1) */}
                    {mediaList.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 scrollbar-hide">
                            {mediaList.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveMediaIndex(idx); setSpinOn(false); }}
                                    className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${!spinOn && activeMediaIndex === idx ? 'border-[#C19A6B] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5"></div>
                                        </div>
                                    ) : (
                                        <img src={item.url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="Thumbnail" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* INFO */}
                <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col bg-white dark:bg-slate-950">
                    <div className="flex justify-between items-start mb-2 pr-8">
                        <span className="text-xs font-bold text-[#C19A6B] uppercase tracking-[0.2em]">{product.category}</span>
                        <button onClick={copyLink} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-cielo-gold transition-colors" title="Copiar enlace">
                            {copied ? <span className="text-green-500 flex items-center gap-1"><Check className="w-4 h-4" /> Copiado</span> : <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> Compartir</span>}
                        </button>
                    </div>

                    <h2 className="text-3xl font-serif text-slate-900 dark:text-white mb-2 leading-tight">{product.name}</h2>
                    <p className="text-2xl text-slate-800 dark:text-slate-200 font-light mb-6">{formatMoney(product.price)}</p>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-light text-sm tracking-wide">{product.description || "Sin descripción disponible."}</p>

                    <div className="space-y-6 mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                        {/* Selector Color */}
                        <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest block mb-3">Color: <span className="text-slate-500 font-normal capitalize">{selectedColor || 'Elegir'}</span></span>
                            <div className="flex flex-wrap gap-3">
                                {product.colors && product.colors.map(color => {
                                    const available = isColorAvailable(product, color);
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            disabled={!available}
                                            className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-110 flex items-center justify-center relative ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''} ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            style={{ backgroundColor: getColorHex(color) }}
                                            title={available ? color : `${color} (sin stock)`}
                                        >
                                            {selectedColor === color && <Check className={`w-4 h-4 ${color.toLowerCase() === 'blanco' ? 'text-black' : 'text-white'}`} />}
                                            {!available && <span className="absolute w-full h-[2px] bg-slate-400 rotate-45 rounded-full" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selector Talle */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Talle: <span className="text-slate-500 font-normal">{selectedSize || 'Elegir'}</span></span>
                                <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-[#C19A6B] hover:underline flex items-center gap-1"><Ruler className="w-3 h-3" /> Tabla de Talles</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes && product.sizes.map(size => {
                                    const available = isSizeAvailable(product, size);
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            disabled={!available}
                                            className={`h-12 w-12 border flex items-center justify-center text-sm font-bold uppercase transition-all rounded-lg relative ${selectedSize === size ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-lg' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-900 dark:hover:border-white'} ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        >
                                            {size}
                                            {!available && <span className="absolute inset-x-1 h-[1px] bg-slate-400 rotate-[-10deg]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex gap-4">
                        <Button onClick={handleAddToCart} className="flex-1 py-4 text-sm bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl h-14" disabled={totalStock === 0}>
                            {totalStock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
                        </Button>
                        <button onClick={toggleWishlist} className="w-14 h-14 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                        </button>
                    </div>

                    <button
                        onClick={goToDetail}
                        className="mt-4 w-full text-xs font-bold uppercase tracking-[0.2em] text-[#C19A6B] hover:text-[#FCF6BA] transition-colors flex items-center justify-center gap-2"
                    >
                        Ver ficha completa <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};