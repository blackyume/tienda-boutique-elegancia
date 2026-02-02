import React, { useState, useEffect } from 'react';
import { X, Heart, Check, Ruler, Share2, Copy, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatMoney, getColorHex } from '../../utils/helpers';
import { useStore } from '../../context/StoreContext';
import { SizeGuideModal } from './SizeGuideModal';

export const QuickViewModal = ({ product, onClose }) => {
    const { addToCart, wishlist, setWishlist, addToast, setIsSizeGuideOpen } = useStore();
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [copied, setCopied] = useState(false);

    // Media State
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    const mediaList = product?.media && product.media.length > 0
        ? product.media
        : [{ type: 'image', url: product?.image }];

    // ESC KEY & WISH LISTENER
    useEffect(() => {
        if (product) setIsWishlisted(wishlist.includes(product.id));
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [product, wishlist, onClose]);

    if (!product) return null;

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) return;
        addToCart(product, selectedSize, selectedColor);
        onClose();
    };

    const toggleWishlist = () => {
        setWishlist(prev => {
            const exists = prev.includes(product.id);
            addToast(exists ? "Eliminado de favoritos" : "Agregado a favoritos", exists ? "info" : "success");
            return exists ? prev.filter(id => id !== product.id) : [...prev, product.id];
        });
    };

    const copyLink = () => {
        const url = `${window.location.origin}/product/${product.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        addToast("Enlace copiado", "success");
        setTimeout(() => setCopied(false), 2000);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="bg-white dark:bg-slate-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col md:flex-row animate-slideUp ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>

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
                        ) : (
                            <img src={mediaList[activeMediaIndex].url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                        )}

                        {/* Navigation Arrows (if multiple) */}
                        {mediaList.length > 1 && (
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
                                    onClick={() => setActiveMediaIndex(idx)}
                                    className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeMediaIndex === idx ? 'border-[#C19A6B] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5"></div>
                                        </div>
                                    ) : (
                                        <img src={item.url} className="w-full h-full object-cover" alt="Thumbnail" />
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
                                {product.colors && product.colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''}`}
                                        style={{ backgroundColor: getColorHex(color) }}
                                        title={color}
                                    >
                                        {selectedColor === color && <Check className={`w-4 h-4 ${color.toLowerCase() === 'blanco' ? 'text-black' : 'text-white'}`} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selector Talle */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Talle: <span className="text-slate-500 font-normal">{selectedSize || 'Elegir'}</span></span>
                                <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-[#C19A6B] hover:underline flex items-center gap-1"><Ruler className="w-3 h-3" /> Tabla de Talles</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes && product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-12 w-12 border flex items-center justify-center text-sm font-bold uppercase transition-all rounded-lg ${selectedSize === size ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-lg' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-900 dark:hover:border-white'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex gap-4">
                        <Button onClick={handleAddToCart} className="flex-1 py-4 text-sm bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl h-14" disabled={!selectedSize || !selectedColor || product.stock === 0}>
                            {product.stock === 0 ? 'SIN STOCK' : (!selectedSize || !selectedColor) ? 'SELECCIONAR OPCIONES' : 'AGREGAR AL CARRITO'}
                        </Button>
                        <button onClick={toggleWishlist} className="w-14 h-14 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};