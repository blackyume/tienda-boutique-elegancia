import React, { memo, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatMoney, getColorHex } from '../../utils/helpers';
import { getTotalStock } from '../../utils/variants';
import { LazyImage } from '../ui/LazyImage';
import { QuickViewModal } from './QuickViewModal';
import { useStore } from '../../context/StoreContext';

const isNew = (product) => {
    if (!product?.createdAt) return false;
    const days = (Date.now() - Number(product.createdAt)) / (1000 * 60 * 60 * 24);
    return days <= 21;
};

const discountPct = (product) => {
    if (!product?.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
};

export const ProductCard = memo(function ProductCard({ product, priority = false, onQuickView }) {
    const { wishlist, setWishlist, addToast } = useStore();
    const [quickOpen, setQuickOpen] = useState(false);

    const totalStock = getTotalStock(product);
    const outOfStock = totalStock <= 0;
    const lowStock = !outOfStock && totalStock <= 5;
    const discount = discountPct(product);
    const fresh = isNew(product);

    const wishlistIds = (wishlist || []).map((w) => String(w?.id ?? w));
    const isWished = wishlistIds.includes(String(product.id));

    const hoverImage =
        product.hoverImage || (Array.isArray(product.images) && product.images[1]) || null;
    const mainImage = product.image || (Array.isArray(product.images) && product.images[0]);

    const openQuick = () => setQuickOpen(true);

    const toggleWishlist = (e) => {
        e.stopPropagation();
        setWishlist((prev) => {
            const ids = (prev || []).map((w) => String(w?.id ?? w));
            if (ids.includes(String(product.id))) {
                return (prev || []).filter((w) => String(w?.id ?? w) !== String(product.id));
            }
            addToast('Guardado en favoritos', 'success');
            return [...(prev || []), String(product.id)];
        });
    };

    const colors = (product.colors || []).slice(0, 4);

    return (
        <>
            {quickOpen && <QuickViewModal product={product} onClose={() => setQuickOpen(false)} />}
            <article
                className="group relative flex flex-col cursor-pointer"
                onClick={openQuick}
                onKeyDown={(e) => (e.key === 'Enter' ? openQuick() : null)}
                tabIndex={0}
                role="button"
                aria-haspopup="dialog"
                aria-label={`Vista rápida de ${product.name}`}
            >
                {/* Imagen */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#080808]">
                    <LazyImage
                        src={mainImage}
                        alt={product.name}
                        width={640}
                        fetchPriority={priority ? 'high' : 'auto'}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    {hoverImage && (
                        <LazyImage
                            src={hoverImage}
                            alt=""
                            width={640}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                    )}

                    {/* Velo oscuro al hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500 pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {fresh && !outOfStock && (
                            <span className="bg-cielo-gold text-black text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                                Nuevo
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="bg-white/10 backdrop-blur text-white border border-white/20 text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                                -{discount}%
                            </span>
                        )}
                        {outOfStock && (
                            <span className="bg-black/60 backdrop-blur text-white/70 text-[9px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1">
                                Agotado
                            </span>
                        )}
                        {!outOfStock && lowStock && (
                            <span className="bg-white/10 backdrop-blur text-cielo-gold border border-cielo-gold/30 text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
                                Últimas unidades
                            </span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        aria-label={isWished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        aria-pressed={isWished}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center hover:border-cielo-gold/50 transition-all duration-300 hover:scale-110"
                    >
                        <Heart
                            className={`w-3.5 h-3.5 transition-colors ${isWished ? 'fill-rose-400 text-rose-400' : 'text-white/70 hover:text-white'}`}
                        />
                    </button>

                    {/* CTA al hover — gold bar al fondo */}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 z-10">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onQuickView ? onQuickView(product) : openQuick(); }}
                            className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black"
                            style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Ver producto
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="pt-4 pb-1 flex flex-col items-center text-center">
                    {product.category && (
                        <span className="text-2xs uppercase tracking-[0.3em] text-cielo-gold/60 mb-1">
                            {product.category}
                        </span>
                    )}
                    <h3 className="font-serif text-[15px] text-white/90 group-hover:text-white transition-colors line-clamp-1 leading-snug">
                        {product.name}
                    </h3>

                    <div className="mt-2 flex items-baseline justify-center gap-2">
                        <span className="font-semibold text-white text-sm tracking-wide">
                            {formatMoney(product.price)}
                        </span>
                        {discount > 0 && (
                            <span className="text-xs text-white/30 line-through">
                                {formatMoney(product.compareAtPrice)}
                            </span>
                        )}
                    </div>

                    {colors.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                            {colors.map((c) => (
                                <span
                                    key={c}
                                    title={c}
                                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                                    style={{ background: getColorHex(c, product.colorHex) }}
                                />
                            ))}
                            {(product.colors?.length || 0) > colors.length && (
                                <span className="text-[10px] text-white/30">
                                    +{product.colors.length - colors.length}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Línea dorada inferior al hover */}
                <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-cielo-gold/40 to-transparent transition-all duration-500 mx-auto mt-1" />
            </article>
        </>
    );
});
