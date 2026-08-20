import React, { useState, useMemo, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { optimizeImage, resolveHeroImage } from '../utils/helpers';
import { ArrowRight } from 'lucide-react';
import { lazyConReintento } from '../utils/lazyConReintento';

// Above-the-fold: import directo
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';

// Below-the-fold: lazy loading para mejor LCP
const FeaturedCollection = lazyConReintento(() => import('../components/home/FeaturedCollection').then(m => ({ default: m.FeaturedCollection })));
const ShopTheLook = lazyConReintento(() => import('../components/home/ShopTheLook').then(m => ({ default: m.ShopTheLook })));
const NewArrivalsCarousel = lazyConReintento(() => import('../components/home/NewArrivalsCarousel').then(m => ({ default: m.NewArrivalsCarousel })));
const Testimonials = lazyConReintento(() => import('../components/home/Testimonials').then(m => ({ default: m.Testimonials })));
const HowItWorks = lazyConReintento(() => import('../components/home/HowItWorks').then(m => ({ default: m.HowItWorks })));
const CountdownBanner = lazyConReintento(() => import('../components/home/CountdownBanner').then(m => ({ default: m.CountdownBanner })));
const NewsletterInline = lazyConReintento(() => import('../components/home/NewsletterInline').then(m => ({ default: m.NewsletterInline })));
const InstagramFeed = lazyConReintento(() => import('../components/home/InstagramFeed').then(m => ({ default: m.InstagramFeed })));
const Atelier = lazyConReintento(() => import('../components/home/Atelier').then(m => ({ default: m.Atelier })));

import { QuickViewModal } from '../components/shop/QuickViewModal';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeader } from '../components/home/SectionHeader';
import { SEO } from '../components/seo/SEO';

export const Home = () => {
    const { inventory, categories, siteConfig } = useStore();
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Solo productos activos, más recientes primero, máximo 8
    const newArrivals = useMemo(
        () => (inventory || [])
            .filter(p => p.active !== false)
            .sort((a, b) => (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0))
            .slice(0, 8),
        [inventory]
    );

    // Categorías para el grid. Si la categoría no tiene imagen propia, usa la
    // foto de un producto de esa categoría como portada (así la sección premium
    // aparece sola, sin tener que asignar imágenes a mano).
    const validCategories = useMemo(
        () => (categories || [])
            .filter(c => c && c.name)
            .map(c => {
                if (c.image) return c;
                const prod = (inventory || []).find(p =>
                    p.active !== false &&
                    (p.category || '').toLowerCase() === (c.name || '').toLowerCase() &&
                    (p.image || p.media?.[0]?.url)
                );
                const cover = prod ? (prod.image || prod.media?.[0]?.url) : null;
                return cover ? { ...c, image: cover } : null;
            })
            .filter(Boolean),
        [categories, inventory]
    );

    return (
        <div className="font-sans bg-[#312721] text-white overflow-x-hidden">
            <SEO
                title={siteConfig?.hero?.title}
                image={resolveHeroImage(siteConfig)}
            />
            {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}

            <Hero />

            <TrustBar />

            {/* Producto primero: el visitante ve mercadería apenas baja */}
            <Suspense fallback={<div className="h-[600px] bg-[#312721]" />}>
                <FeaturedCollection onQuickView={(p) => setQuickViewProduct(p)} />
            </Suspense>

            {/* Categorías — caminos de compra arriba, junto al producto */}
            {validCategories.length > 0 && <section id="categories" className="py-14 md:py-20 px-6 bg-[#312721] relative">
                <Reveal className="max-w-[1400px] mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <SectionHeader align="left" eyebrow="Categorías" title="Curaduría exclusiva" />
                        <Link
                            to="/shop"
                            className="hidden md:inline-flex items-center gap-2 px-5 py-3 border border-white/20 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 rounded-sm shrink-0"
                        >
                            Ver todo <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {validCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                                aria-label={`Ver categoría ${cat.name}`}
                                className="relative group cursor-pointer overflow-hidden rounded-sm aspect-[4/5] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.12)]"
                            >
                                <div className="absolute inset-0 bg-slate-800 animate-pulse" />
                                <img
                                    src={optimizeImage(cat.image, 700)}
                                    alt={cat.name}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.07] grayscale-[20%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 opacity-70 group-hover:opacity-55 transition-opacity duration-700" />

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                    <span className="px-3 py-1 bg-white/90 text-black text-[9px] font-bold uppercase tracking-widest rounded-sm">Ver todo</span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                                    {/* Dos renglones reservados: sin esto, una categoría de nombre
                                        largo empuja el título hacia arriba y rompe la línea de la fila. */}
                                    <div className="flex items-end min-h-[2.75rem] md:min-h-[3.75rem] mb-2">
                                        <h3 className="text-lg md:text-2xl font-serif text-white drop-shadow-lg leading-tight">{cat.name}</h3>
                                    </div>
                                    <div className="w-8 h-[1px] bg-white/40 mb-3 group-hover:w-20 transition-all duration-700 ease-out" />
                                    <p className="text-xs uppercase tracking-widest text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 delay-100">
                                        Explorar <ArrowRight className="w-3 h-3 text-white/70" />
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Reveal>
            </section>}

            {/* New Arrivals — más producto arriba */}
            <section className="py-14 md:py-20 px-6 bg-[#312721]">
                <div className="max-w-[1400px] mx-auto">
                    <Suspense fallback={<div className="h-[400px]" />}>
                        <NewArrivalsCarousel
                            products={newArrivals}
                            onQuickView={(p) => setQuickViewProduct(p)}
                        />
                    </Suspense>
                </div>
            </section>

            {/* Urgencia: cuenta regresiva del próximo drop/promo (si hay una programada) */}
            <Suspense fallback={<div className="h-[200px] bg-[#312721]" />}>
                <CountdownBanner />
            </Suspense>

            <Suspense fallback={<div className="h-[600px] bg-[#312721]" />}>
                <ShopTheLook />
            </Suspense>

            {/* Prueba social */}
            <Suspense fallback={<div className="h-[400px] bg-[#312721]" />}>
                <Testimonials />
            </Suspense>

            {/* Pausa de marca: la historia real de la marca */}
            <Suspense fallback={<div className="h-[400px] bg-[#312721]" />}>
                <Atelier />
            </Suspense>

            <Suspense fallback={<div className="h-[400px] bg-[#312721]" />}>
                <HowItWorks />
            </Suspense>

            <Suspense fallback={<div className="h-[200px] bg-[#312721]" />}>
                <NewsletterInline />
            </Suspense>

            <Suspense fallback={<div className="h-[400px] bg-[#312721]" />}>
                <InstagramFeed />
            </Suspense>
        </div>
    );
};
