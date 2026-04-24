import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { formatMoney, getColorHex } from '../../utils/helpers';
import { getTotalStock } from '../../utils/variants';
import { LazyImage } from '../ui/LazyImage';
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
    const navigate = useNavigate();
    const { wishlist, setWishlist, addToast } = useStore();

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

    const goToDetail = () => {
        navigate(`/product/${product.id}`);
        window.scrollTo(0, 0);
    };

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
        <article
            className="group relative flex flex-col cursor-pointer"
            onClick={goToDetail}
            onKeyDown={(e) => (e.key === 'Enter' ? goToDetail() : null)}
            tabIndex={0}
            role="link"
            aria-label={`Ver ${product.name}`}
        >
            {/* Imagen */}
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <LazyImage
                    src={mainImage}
                    alt={product.name}
                    width={640}
                    fetchPriority={priority ? 'high' : 'auto'}
                    className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-[1.05]"
                />
                {hoverImage && (
                    <LazyImage
                        src={hoverImage}
                        alt=""
                        width={640}
                        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {fresh && (
                        <span className="bg-cielo-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                            Nuevo
                        </span>
                    )}
                    {discount > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                            -{discount}%
                        </span>
                    )}
                    {outOfStock && (
                        <span className="bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                            Agotado
                        </span>
                    )}
                    {!outOfStock && lowStock && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
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
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${isWished ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`}
                    />
                </button>

                {/* Quick view */}
                {onQuickView && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickView(product);
                        }}
                        className="absolute bottom-3 left-3 right-3 py-3 text-[11px] font-bold uppercase tracking-widest bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 shadow"
                    >
                        <Eye className="w-3.5 h-3.5" /> Vista rápida
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="pt-4 px-1 flex flex-col items-center text-center">
                <h3 className="font-serif text-[15px] md:text-base text-slate-900 dark:text-white group-hover:text-cielo-gold transition-colors line-clamp-1">
                    {product.name}
                </h3>

                <div className="mt-1 flex items-baseline justify-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {formatMoney(product.price)}
                    </span>
                    {discount > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                            {formatMoney(product.compareAtPrice)}
                        </span>
                    )}
                </div>

                {colors.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                        {colors.map((c) => (
                            <span
                                key={c}
                                title={c}
                                className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700"
                                style={{ backgroundColor: getColorHex(c) }}
                            />
                        ))}
                        {(product.colors?.length || 0) > colors.length && (
                            <span className="text-[10px] text-slate-400">
                                +{product.colors.length - colors.length}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
});
