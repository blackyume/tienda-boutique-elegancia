import React, { useState } from 'react';
import { Eye, ShoppingBag, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, getColorHex } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useMarcoFoto } from '../../utils/marcoFoto';

export const QuickAddCard = ({ product, onQuickView }) => {
    const { addToCart, addToast } = useStore();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [marcoFoto, setMarcoFoto] = useMarcoFoto();

    // Premium Interaction: Open Modal for everything
    const handleOpenModal = (e) => {
        e.stopPropagation();
        if (onQuickView) onQuickView(product);
        else navigate(`/product/${product.id}`);
    };

    return (
        <div
            className="group relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOpenModal}
        >
            <div className={`relative ${marcoFoto} overflow-hidden bg-slate-100 dark:bg-slate-900 mb-4 rounded-sm ring-1 ring-transparent group-hover:ring-white/10 transition-[box-shadow] duration-500`}>
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onLoad={(e) => setMarcoFoto(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                    className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.06]"
                />

                {/* Velo sutil al hover (sin oscurecer de más) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                {product.stock === 0 && (
                    <span className="absolute top-2 left-2 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-20">Agotado</span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-2 left-2 bg-cielo-gold text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-20">Pocas Unidades</span>
                )}

                {/* OVERLAY ACTIONS - PREMIUM CENTERED BUTTON */}
                <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0`}>
                    <button
                        onClick={handleOpenModal}
                        className="bg-white/90 backdrop-blur-sm text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-cielo-gold hover:text-white transition-all shadow-lg transform hover:scale-105"
                    >
                        Vista Rápida
                    </button>
                </div>

                {/* SIZE PREVIEW ON BOTTOM (Hover) */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2 text-center">Talles Disponibles</p>
                        <div className="flex justify-center gap-2 flex-wrap">
                            {product.sizes.map(size => (
                                <span key={size} className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded min-w-[24px] text-center border border-white/30">
                                    {size}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center">
                {product.category && (
                    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-1.5">{product.category}</p>
                )}
                <h3 className="font-serif text-lg text-slate-900 dark:text-white mb-1.5 transition-opacity duration-300 group-hover:opacity-70">{product.name}</h3>
                <div className="flex justify-center items-center gap-3 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatMoney(product.price)}</span>

                    {/* Color Dots */}
                    {(product.colors || []).length > 0 && (
                        <div className="flex -space-x-1 pl-3 border-l border-slate-200 dark:border-white/10 ml-3">
                            {(product.colors || []).slice(0, 3).map(c => (
                                <div key={c} className="w-3 h-3 rounded-full border border-white dark:border-slate-800 shadow-sm" style={{ background: getColorHex(c, product.colorHex) }} title={c} />
                            ))}
                            {(product.colors || []).length > 3 && (
                                <span className="text-[9px] text-slate-400 ml-1">+{product.colors.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
