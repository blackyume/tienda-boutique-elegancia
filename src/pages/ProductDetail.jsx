import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatMoney, getColorHex, optimizeImage } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Heart, Truck, ShieldCheck, Star, Share2, Minus, Plus } from 'lucide-react';
import { Accordion } from '../components/ui/Accordion';
import { SEO } from '../components/seo/SEO';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { TrustBadges } from '../components/ui/TrustBadges';
import { ProductCard } from '../components/shop/ProductCard';
import { ReviewsSection } from '../components/shop/ReviewsSection';
import {
    getTotalStock,
    getVariantStock,
    isColorAvailable,
    isSizeAvailable
} from '../utils/variants';
import { trackViewItem } from '../utils/analytics';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        inventory,
        addToCart,
        isInWishlist,
        toggleWishlist,
        addToast,
        setIsSizeGuideOpen,
        incrementProductView,
        siteConfig
    } = useStore();

    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const found = inventory.find(
            (p) => String(p.id) === String(id) || p.id === Number(id)
        );
        if (!found && inventory.length > 0) {
            navigate('/404');
            return;
        }
        if (found) {
            setProduct(found);
            setSelectedColor((prev) => (found.colors?.includes(prev) ? prev : found.colors?.[0] || ''));
            setSelectedSize('');
            setActiveImage(0);
            setQuantity(1);
            window.scrollTo(0, 0);
            incrementProductView(found.id);
            trackViewItem(found);
        }
    }, [id, inventory, navigate, incrementProductView]);

    const images = useMemo(() => {
        if (!product) return [];
        if (Array.isArray(product.images) && product.images.length > 0) return product.images;
        return [product.image];
    }, [product]);

    const { reviews: allReviews } = useStore();
    const { reviewAverage, reviewCount } = useMemo(() => {
        const r = (allReviews || []).filter(x => x.approved && String(x.productId) === String(product?.id));
        if (r.length === 0) return { reviewAverage: 0, reviewCount: 0 };
        return { reviewAverage: r.reduce((a, x) => a + (x.rating || 0), 0) / r.length, reviewCount: r.length };
    }, [allReviews, product?.id]);

    const totalStock = useMemo(() => (product ? getTotalStock(product) : 0), [product]);
    const variantStock = useMemo(
        () => (product ? getVariantStock(product, selectedSize, selectedColor) : 0),
        [product, selectedSize, selectedColor]
    );

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return inventory
            .filter((p) => p.category === product.category && p.id !== product.id && p.active !== false)
            .slice(0, 4);
    }, [inventory, product]);

    if (!product) return <div className="h-screen bg-white dark:bg-[#0B1120]" />;

    const handleAddToCart = () => {
        if (!selectedSize && (product.sizes?.length || 0) > 0) {
            return addToast('Seleccioná un talle', 'error');
        }
        if (!selectedColor && (product.colors?.length || 0) > 0) {
            return addToast('Seleccioná un color', 'error');
        }
        addToCart(product, selectedSize, selectedColor, quantity);
    };

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: product.description || product.name,
            url: window.location.href
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.href);
                addToast('Link copiado', 'success');
            }
        } catch {/* cancelado */}
    };

    const wished = isInWishlist(product.id);
    const scarcityThreshold = parseInt(siteConfig?.sales?.scarcity?.threshold) || 5;
    const showScarcity = siteConfig?.sales?.scarcity?.enabled && totalStock > 0 && totalStock <= scarcityThreshold;

    return (
        <div className="bg-white dark:bg-[#0B1120] min-h-screen text-slate-900 dark:text-white transition-colors">
            <SEO
                title={product.name}
                description={
                    product.description || `Comprá ${product.name} en La Boutique de la Elegancia. Envíos a todo el país.`
                }
                image={images[0]}
                type="product"
                product={product}
                averageRating={reviewAverage}
                reviewCount={reviewCount}
            />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24">
                <Breadcrumbs
                    items={[
                        { label: 'Shop', path: '/shop' },
                        { label: product.category, path: `/shop?category=${encodeURIComponent(product.category)}` },
                        { label: product.name }
                    ]}
                />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Galería */}
                <div>
                    <div className="aspect-[3/4] bg-slate-100 dark:bg-[#0f172a] overflow-hidden relative rounded-md">
                        <img
                            key={images[activeImage]}
                            src={optimizeImage(images[activeImage], 1200)}
                            alt={product.name}
                            className="w-full h-full object-cover animate-fadeIn"
                            loading="eager"
                            fetchpriority="high"
                            decoding="async"
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur">
                                {activeImage + 1} / {images.length}
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="mt-3 grid grid-cols-4 md:grid-cols-5 gap-2">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    aria-label={`Imagen ${i + 1}`}
                                    className={`aspect-[3/4] overflow-hidden rounded-md transition-all ${i === activeImage ? 'ring-2 ring-cielo-gold' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={optimizeImage(img, 300)} alt="" className="w-full h-full object-cover" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel */}
                <div className="lg:sticky lg:top-28 h-fit">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold tracking-[0.2em] text-cielo-gold uppercase">
                            {product.category}
                        </span>
                        <button
                            onClick={handleShare}
                            className="text-slate-400 hover:text-cielo-gold transition-colors"
                            aria-label="Compartir"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-luxury leading-tight mb-4">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <p className="text-2xl font-semibold">{formatMoney(product.price)}</p>
                        {product.compareAtPrice > product.price && (
                            <span className="text-sm text-slate-400 line-through">
                                {formatMoney(product.compareAtPrice)}
                            </span>
                        )}
                    </div>
                    {reviewCount > 0 ? (
                        <button
                            type="button"
                            onClick={() => {
                                const el = document.getElementById('product-reviews');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="mb-6 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                        >
                            <div className="inline-flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(reviewAverage) ? 'fill-cielo-gold text-cielo-gold' : 'text-slate-300 dark:text-slate-700'}`} />
                                ))}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">{reviewAverage.toFixed(1)}</span>
                            <span className="text-slate-500">· {reviewCount} reseña{reviewCount !== 1 ? 's' : ''}</span>
                        </button>
                    ) : null}

                    {product.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                            {product.description}
                        </p>
                    )}

                    <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                        {/* Colores */}
                        {product.colors?.length > 0 && (
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest block mb-3 text-slate-500">
                                    Color:{' '}
                                    <span className="text-slate-900 dark:text-white">{selectedColor || '—'}</span>
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((c) => {
                                        const available = isColorAvailable(product, c);
                                        const selected = selectedColor === c;
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => setSelectedColor(c)}
                                                disabled={!available}
                                                title={available ? c : `${c} (sin stock)`}
                                                aria-pressed={selected}
                                                className={`w-11 h-11 rounded-full flex items-center justify-center transition relative ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-700" />
                                                <span
                                                    className={`w-7 h-7 rounded-full shadow-sm ${selected ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0B1120] ring-slate-900 dark:ring-white' : ''}`}
                                                    style={{ backgroundColor: getColorHex(c) }}
                                                />
                                                {!available && (
                                                    <span className="absolute w-full h-[2px] bg-slate-400 rotate-45 rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Talles */}
                        {product.sizes?.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                        Talle{selectedSize ? `: ${selectedSize}` : ''}
                                    </span>
                                    <button
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-cielo-gold hover:underline"
                                    >
                                        Guía de talles
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {product.sizes.map((s) => {
                                        const available = isSizeAvailable(product, s);
                                        const selected = selectedSize === s;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => setSelectedSize(s)}
                                                disabled={!available}
                                                aria-pressed={selected}
                                                className={`h-11 border rounded-md flex items-center justify-center text-sm font-bold uppercase transition relative ${selected ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-500'} ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            >
                                                {s}
                                                {!available && (
                                                    <span className="absolute inset-x-1 h-[1px] bg-slate-400 rotate-[-10deg]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Cantidad */}
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest block mb-3 text-slate-500">
                                Cantidad
                            </span>
                            <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="p-3 hover:text-cielo-gold"
                                    aria-label="Restar"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.min(q + 1, variantStock || 99))
                                    }
                                    disabled={variantStock > 0 && quantity >= variantStock}
                                    className="p-3 hover:text-cielo-gold disabled:opacity-40"
                                    aria-label="Sumar"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {selectedSize && selectedColor && variantStock > 0 && variantStock <= scarcityThreshold && (
                                <p className="text-xs text-orange-500 mt-2">
                                    Quedan {variantStock} unidades en {selectedSize} / {selectedColor}
                                </p>
                            )}
                            {selectedSize && selectedColor && variantStock === 0 && (
                                <p className="text-xs text-rose-500 mt-2">Sin stock en esta combinación</p>
                            )}
                        </div>
                    </div>

                    {showScarcity && (
                        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                                    ¡Alta demanda!
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Quedan pocas unidades disponibles.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-8 space-y-3">
                        <Button
                            onClick={handleAddToCart}
                            disabled={totalStock === 0}
                            className="w-full py-5 text-sm font-bold tracking-[0.2em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 h-14 hover:bg-cielo-gold dark:hover:bg-cielo-gold hover:text-black transition-colors shadow-lg"
                        >
                            {totalStock === 0 ? 'AGOTADO' : 'AGREGAR AL SHOPPING BAG'}
                        </Button>

                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className="w-full py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-slate-500 hover:text-rose-500 transition-colors"
                        >
                            <Heart className={`w-4 h-4 ${wished ? 'fill-current text-rose-500' : ''}`} />
                            {wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        </button>
                    </div>

                    <div className="mt-8">
                        <TrustBadges />
                    </div>

                    <div className="space-y-2 mt-6">
                        <Accordion title="Descripción & Detalles" defaultOpen={true}>
                            <p className="mb-4">
                                {product.description ||
                                    'Prenda confeccionada con los más altos estándares de calidad. Diseño atemporal que fusiona elegancia clásica con texturas modernas.'}
                            </p>
                            {product.details && (
                                <ul className="list-disc pl-4 space-y-1">
                                    {product.details.split('\n').filter(Boolean).map((d, i) => (
                                        <li key={i}>{d}</li>
                                    ))}
                                </ul>
                            )}
                        </Accordion>
                        <Accordion title="Envíos & Entregas">
                            Realizamos envíos a todo el país a través de Andreani y OCA.
                            <br />
                            <br />
                            <div className="flex items-center gap-2 mb-2">
                                <Truck className="w-4 h-4" /> <strong>Envío standard:</strong> 3-6 días hábiles.
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> <strong>Express:</strong> 24-48 hs (CABA).
                            </div>
                        </Accordion>
                        <Accordion title="Cambios & Devoluciones">
                            Tenés 30 días desde que recibís tu pedido para cambios sin cargo. La prenda debe estar sin uso y con etiqueta.
                        </Accordion>
                    </div>
                </div>
            </div>

            <div id="product-reviews" className="max-w-5xl mx-auto px-4">
                <ReviewsSection productId={product.id} />
            </div>

            {/* Relacionados */}
            {relatedProducts.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-luxury mb-3">Puede interesarte</h3>
                            <div className="w-24 h-[1px] bg-cielo-gold mx-auto" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                            {relatedProducts.map((rp) => (
                                <ProductCard key={rp.id} product={rp} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MOBILE STICKY CART BAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl">
                <div className="flex items-center gap-3 px-4 py-3 safe-bottom">
                    <div className="flex-shrink-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{formatMoney(product.price * quantity)}</p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={totalStock === 0}
                        className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] text-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: totalStock === 0 ? '#94a3b8' : 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                    >
                        {totalStock === 0 ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                </div>
            </div>
            {/* padding para que el sticky no tape contenido */}
            <div className="md:hidden h-20" />
        </div>
    );
};
