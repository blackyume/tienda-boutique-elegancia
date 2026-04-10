import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatMoney, getColorHex, optimizeImage } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Heart, Truck, ShieldCheck, ArrowRight, Star, Share2 } from 'lucide-react';
import { SizeGuideModal } from '../components/shop/SizeGuideModal';
import { Accordion } from '../components/ui/Accordion';

import { SEO } from '../components/seo/SEO';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { TrustBadges } from '../components/ui/TrustBadges';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { inventory, addToCart, wishlist, setWishlist, addToast, setIsSizeGuideOpen, incrementProductView, siteConfig } = useStore();

    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [mainImage, setMainImage] = useState("");

    // Buscar producto
    useEffect(() => {
        const found = inventory.find(p => p.id === Number(id) || p.id === String(id));
        if (found) {
            setProduct(found);
            setMainImage(found.image);
            setSelectedColor(found.colors[0] || "");
            window.scrollTo(0, 0);
            // Increment view count
            incrementProductView(found.id);
        } else {
            navigate('/404');
        }
    }, [id, inventory, navigate]);

    if (!product) return <div className="h-screen bg-white dark:bg-[#0B1120]" />;

    // Get current variant (if exists) or fallback to base product
    const getSelectedVariant = () => {
        if (!product.variants || product.variants.length === 0) return null;
        return product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
    };

    const selectedVariant = getSelectedVariant();
    const currentPrice = selectedVariant?.price ?? product.basePrice ?? product.price;
    const currentStock = selectedVariant?.stock ?? product.stock;

    // Productos Relacionados
    const relatedProducts = inventory
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) return addToast("Seleccioná talle y color", "error");
        // Pass variant price to cart
        const productWithVariantPrice = { ...product, price: currentPrice, variantStock: currentStock };
        addToCart(productWithVariantPrice, selectedSize, selectedColor);
    };
    // Images Array (Simulado 4 imágenes)
    const productImages = [product.image, product.image, product.image, product.image];

    return (
        <div className="bg-white dark:bg-[#0B1120] min-h-screen text-slate-900 dark:text-white transition-colors duration-500">
            <SEO
                title={product.name}
                description={product.description || `Compra ${product.name} en nuestra tienda exclusiva. Envíos a todo el país.`}
                image={product.image}
                type="product"
            />

            <div className="lg:flex">
                {/* --- LEFT: IMMERSIVE GALLERY (STICKY SCROLL) --- */}
                <div className="w-full lg:w-[60%] lg:min-h-screen bg-slate-100 dark:bg-[#0f172a]">
                    {/* PC Layout: Vertical Stack */}
                    <div className="hidden lg:flex flex-col gap-1">
                        {productImages.map((img, i) => (
                            <div key={i} className="w-full h-screen sticky top-0 bg-cover bg-center" style={{ backgroundImage: `url(${optimizeImage(img, 1200)})` }}>
                                {/* Mobile Parallax Effect Placeholder if needed */}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Layout: Carousel */}
                    <div className="lg:hidden w-full h-[60vh] overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
                        {productImages.map((img, i) => (
                            <div key={i} className="w-full flex-shrink-0 snap-center relative">
                                <img src={optimizeImage(img, 800)} className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">
                                    {i + 1} / {productImages.length}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT: STICKY DETAILS PANEL --- */}
                <div className="w-full lg:w-[40%] flex flex-col justify-center min-h-screen relative z-10 bg-white dark:bg-[#0B1120]">
                    <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto px-6 py-12 lg:px-16 lg:py-24 scrollbar-hide">

                        {/* Header */}
                        <div className="mb-8 animate-fadeIn">
                            <Breadcrumbs items={[
                                { label: 'Shop', path: '/' },
                                { label: product.category, path: `/?category=${encodeURIComponent(product.category)}` },
                                { label: product.name }
                            ]} />
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold tracking-[0.2em] text-cielo-gold uppercase">{product.category}</span>
                                <button className="text-slate-400 hover:text-cielo-gold transition-colors"><Share2 className="w-5 h-5" /></button>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-cinzel text-slate-900 dark:text-white leading-[0.9] mb-6 font-medium">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-8">
                                <p className="text-2xl font-montserrat font-bold text-slate-900 dark:text-white">{formatMoney(currentPrice)}</p>
                                {selectedVariant && selectedVariant.price !== (product.basePrice ?? product.price) && (
                                    <span className="text-sm text-slate-400 line-through">{formatMoney(product.basePrice ?? product.price)}</span>
                                )}
                                <div className="flex text-cielo-gold text-xs gap-1">
                                    <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                    <span className="text-slate-400 ml-2">(24 reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Selectors */}
                        <div className="space-y-8 mb-10 border-t border-slate-100 dark:border-slate-800 pt-8 animate-slideUp">

                            {/* Colors */}
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest block mb-4 text-slate-500">Color Seleccionado: <span className="text-slate-900 dark:text-white">{selectedColor}</span></span>
                                <div className="flex gap-4">
                                    {product.colors.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColor(c)}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group`}
                                        >
                                            <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-700 group-hover:border-slate-400"></div>
                                            <div className={`w-8 h-8 rounded-full shadow-sm transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : ''}`} style={{ backgroundColor: getColorHex(c) }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Seleccionar Talle</span>
                                    <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-cielo-gold hover:underline">Guía de Talles</button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {product.sizes.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={`h-12 border flex items-center justify-center text-sm font-bold uppercase transition-all duration-300 ${selectedSize === s ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Scarcity / Stock Warning */}
                        {siteConfig?.sales?.scarcity?.enabled && currentStock > 0 && currentStock <= (parseInt(siteConfig.sales.scarcity.threshold) || 5) && (
                            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-3 animate-pulse">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">¡Alta Demanda!</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">Solo quedan <span className="font-bold">{currentStock} unidades</span> en stock.</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-4 mb-12 animate-slideUp delay-100">
                            <Button onClick={handleAddToCart} className="w-full py-5 text-sm font-bold tracking-[0.2em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 h-16 hover:bg-cielo-gold dark:hover:bg-cielo-gold hover:text-black transition-colors shadow-xl" disabled={currentStock === 0}>
                                {currentStock === 0 ? 'AGOTADO' : 'AGREGAR AL SHOPPING BAG'}
                            </Button>

                            <button
                                onClick={() => setWishlist(prev => prev.includes(product.id) ? prev.filter(i => i !== product.id) : [...prev, product.id])}
                                className="w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
                            >
                                <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current text-red-500' : ''}`} />
                                {wishlist.includes(product.id) ? 'Quitar de Wishlist' : 'Agregar a Wishlist'}
                            </button>
                        </div>

                        <div className="mb-12 animate-slideUp delay-150">
                            <TrustBadges />
                        </div>

                        {/* Accordions (Details) */}
                        <div className="space-y-2 animate-slideUp delay-200">
                            <Accordion title="Descripción & Detalles" defaultOpen={true}>
                                <p className="mb-4">{product.description || "Esta prenda exclusiva ha sido confeccionada con los más altos estándares de calidad. Su diseño atemporal fusiona la elegancia clásica con texturas modernas."}</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Composición: 100% Algodón Premium</li>
                                    <li>Corte: Relaxed Fit</li>
                                    <li>Origen: Fabricado en Argentina</li>
                                    <li>Cuidados: Lavado a mano o en seco</li>
                                </ul>
                            </Accordion>
                            <Accordion title="Envíos & Entregas">
                                Realizamos envíos a todo el país a través de Andreani y OCA.
                                <br /><br />
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="w-4 h-4" /> <strong>Envío Standard:</strong> 3-6 días hábiles.
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> <strong>Express:</strong> 24-48 horas (CABA).
                                </div>
                            </Accordion>
                            <Accordion title="Cambios & Devoluciones">
                                Tenés 30 días desde que recibís tu pedido para realizar cambios sin cargo. La prenda debe estar sin uso y con etiqueta.<br />
                                Para devoluciones, contactanos en <strong>soporte@laboutique.com</strong>.
                            </Accordion>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- RELATED PRODUCTS --- */}
            {relatedProducts.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-cinzel mb-4">You May Also Like</h3>
                            <div className="w-24 h-[1px] bg-cielo-gold mx-auto"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                            {relatedProducts.map(rp => (
                                <div key={rp.id} onClick={() => { navigate(`/product/${rp.id}`); window.scrollTo(0, 0); }} className="cursor-pointer group flex flex-col">
                                    <div className="aspect-[3/4] overflow-hidden mb-6 relative">
                                        <img src={rp.image} className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-serif text-lg group-hover:text-cielo-gold transition-colors text-center">{rp.name}</h4>
                                    <p className="text-sm font-bold text-slate-500 text-center mt-2">{formatMoney(rp.price)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};