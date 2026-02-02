import React, { useState } from 'react';
import { Eye, ShoppingBag, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, getColorHex } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export const QuickAddCard = ({ product, onQuickView }) => {
    const { addToCart, addToast } = useStore();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState("");
    const [adding, setAdding] = useState(false);

    const handleQuickAdd = (e) => {
        e.stopPropagation();
        if (!selectedSize) {
            // If no size selected, try to select first available or shake animation (omitted for brevity)
            addToast("Por favor selecciona un talle", "info");
            return;
        }

        setAdding(true);
        // Simulate default color (first one)
        const defaultColor = product.colors?.[0] || "Standard";

        addToCart(product, selectedSize, defaultColor);

        setTimeout(() => {
            setAdding(false);
            setSelectedSize(""); // Reset after add
        }, 1000);
    };

    return (
        <div
            className="group relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setSelectedSize(""); }}
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-900 mb-4 rounded-sm">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />

                {/* Badges */}
                {product.stock === 0 && (
                    <span className="absolute top-2 left-2 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-20">Agotado</span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-2 left-2 bg-orange-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-20">Pocas Unidades</span>
                )}

                {/* OVERLAY ACTIONS (Quick Add) */}
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 flex flex-col justify-end p-4 ${isHovered ? 'opacity-100' : ''}`}>

                    {/* Size Selector */}
                    {product.stock > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[10px] font-bold uppercase text-slate-500 mb-2 text-center">Seleccionar Talle</p>
                            <div className="flex justify-center gap-2 mb-3 flex-wrap">
                                {product.sizes?.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full border transition-all ${selectedSize === size ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleQuickAdd}
                                disabled={!selectedSize || adding}
                                className={`w-full py-2 text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all ${selectedSize ? 'bg-cielo-gold text-black hover:bg-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                                {adding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-3 h-3" />}
                                {adding ? 'Agregado' : 'Agregar'}
                            </button>
                        </div>
                    )}

                    {/* View Details (Secondary Action) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(product); }}
                        className="mt-2 w-full py-2 text-xs font-bold uppercase text-white hover:text-cielo-gold transition-colors flex items-center justify-center gap-2"
                    >
                        <Eye className="w-3 h-3" /> Vista Rápida
                    </button>
                </div>
            </div>

            <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-serif text-lg text-white mb-1 group-hover:text-cielo-gold transition-colors">{product.name}</h3>
                <div className="flex justify-center items-center gap-3 text-sm">
                    <span className="font-bold text-slate-200">{formatMoney(product.price)}</span>
                    <div className="flex -space-x-1 pl-2 border-l border-white/10">
                        {(product.colors || []).slice(0, 3).map(c => (
                            <div key={c} className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: getColorHex(c) }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
