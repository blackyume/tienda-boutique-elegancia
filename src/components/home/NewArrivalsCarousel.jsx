import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney, getColorHex, optimizeImage } from '../../utils/helpers';
import { useStore } from '../../context/StoreContext';

const ArrivalCard = ({ product, onQuickView }) => {
    const { addToCart } = useStore();

    return (
        <div
            className="group relative cursor-pointer flex-shrink-0 w-[260px] md:w-[300px]"
            onClick={() => onQuickView?.(product)}
        >
            {/* Image container */}
            <div className="relative aspect-[4/5] overflow-hidden mb-4" style={{ background: '#080808' }}>
                <img
                    src={optimizeImage(product.image, 600)}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-[1.8s] ease-out group-hover:scale-[1.07]"
                />

                {/* Gold border on hover */}
                <span className="absolute inset-0 border border-cielo-gold/0 group-hover:border-cielo-gold/30 transition-all duration-700 z-10 pointer-events-none" />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                {product.stock === 0 && (
                    <span className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-black/80 text-white text-[9px] font-bold uppercase tracking-widest border border-white/20">
                        Agotado
                    </span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-3 left-3 z-20 px-2.5 py-1 text-black text-[9px] font-bold uppercase tracking-widest"
                        style={{ background: 'linear-gradient(90deg,#BF953F,#FCF6BA 50%,#B38728)' }}>
                        Últimas unidades
                    </span>
                )}

                {/* Quick view button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onQuickView?.(product); }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 hover:bg-cielo-gold whitespace-nowrap"
                >
                    <Eye className="w-3.5 h-3.5" /> Vista rápida
                </button>
            </div>

            {/* Info */}
            <div className="px-1">
                {product.category && (
                    <p className="text-[9px] uppercase tracking-[0.35em] text-cielo-gold/60 mb-1.5 font-semibold">
                        {product.category}
                    </p>
                )}
                <h3 className="font-serif text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-cielo-gold/90 transition-colors duration-300">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-white/85 font-light">{formatMoney(product.price)}</span>
                    {(product.colors || []).length > 0 && (
                        <div className="flex -space-x-1">
                            {(product.colors || []).slice(0, 4).map(c => (
                                <span key={c} className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                                    style={{ background: getColorHex(c, product.colorHex) }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Gold hairline on hover */}
                <div className="mt-3 h-px w-0 group-hover:w-full bg-gradient-to-r from-cielo-gold/60 to-transparent transition-all duration-500" />
            </div>
        </div>
    );
};

export const NewArrivalsCarousel = ({ products, onQuickView }) => {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    };

    if (!products?.length) return null;

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-10 bg-cielo-gold/50" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-cielo-gold/70">
                            Recién llegado
                        </span>
                    </div>
                    <h2 className="font-cinzel font-bold text-white leading-none"
                        style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}>
                        New Arrivals
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/shop"
                        className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-cielo-gold/60 hover:text-cielo-gold transition-colors mr-4 group"
                    >
                        Ver todo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:border-cielo-gold hover:text-cielo-gold transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:border-cielo-gold hover:text-cielo-gold transition-all duration-300"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
            >
                {products.map(p => (
                    <div key={p.id} className="snap-start">
                        <ArrivalCard product={p} onQuickView={onQuickView} />
                    </div>
                ))}
            </div>

            {/* Fade edges */}
            <div className="absolute top-0 right-0 h-full w-20 md:w-32 bg-gradient-to-l from-[#11100D] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-[#11100D] to-transparent pointer-events-none" />
        </div>
    );
};
