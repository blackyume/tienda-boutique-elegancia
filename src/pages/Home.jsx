import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { optimizeImage } from '../utils/helpers';
import { ArrowRight } from 'lucide-react';

// Above-the-fold: import directo
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';

// Below-the-fold: lazy loading para mejor LCP
const Editorial = lazy(() => import('../components/home/Editorial').then(m => ({ default: m.Editorial })));
const FeaturedCollection = lazy(() => import('../components/home/FeaturedCollection').then(m => ({ default: m.FeaturedCollection })));
const ShopTheLook = lazy(() => import('../components/home/ShopTheLook').then(m => ({ default: m.ShopTheLook })));
const NewArrivalsCarousel = lazy(() => import('../components/home/NewArrivalsCarousel').then(m => ({ default: m.NewArrivalsCarousel })));
const Testimonials = lazy(() => import('../components/home/Testimonials').then(m => ({ default: m.Testimonials })));
const HowItWorks = lazy(() => import('../components/home/HowItWorks').then(m => ({ default: m.HowItWorks })));
const CountdownBanner = lazy(() => import('../components/home/CountdownBanner').then(m => ({ default: m.CountdownBanner })));
const NewsletterInline = lazy(() => import('../components/home/NewsletterInline').then(m => ({ default: m.NewsletterInline })));
const InstagramFeed = lazy(() => import('../components/home/InstagramFeed').then(m => ({ default: m.InstagramFeed })));
const Atelier = lazy(() => import('../components/home/Atelier').then(m => ({ default: m.Atelier })));

import { QuickViewModal } from '../components/shop/QuickViewModal';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeader } from '../components/home/SectionHeader';
import { SEO } from '../components/seo/SEO';

export const Home = () => {
    const { inventory, categories, siteConfig, setGlobalFilter } = useStore();
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Solo productos activos, más recientes primero, máximo 8
    const newArrivals = useMemo(
        () => (inventory || [])
            .filter(p => p.active !== false)
            .sort((a, b) => (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0))
            .slice(0, 8),
        [inventory]
    );

    // Categorías válidas (con imagen) para el grid
    const validCategories = useMemo(
        () => (categories || []).filter(c => c && c.name && c.image),
        [categories]
    );

    return (
        <div className="font-sans bg-[#020617] text-white overflow-x-hidden">
            <SEO
                title={siteConfig?.hero?.title}
                description={siteConfig?.editorial?.text}
                image={typeof siteConfig?.hero === 'string' ? siteConfig.hero : siteConfig?.hero?.image}
            />
            {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}

            <Hero />

            <TrustBar />

            {/* Producto primero: el visitante ve mercadería apenas baja */}
            <Suspense fallback={<div className="h-[600px] bg-[#020617]" />}>
                <FeaturedCollection onQuickView={(p) => setQuickViewProduct(p)} />
            </Suspense>

            {/* Editorial como pausa de marca */}
            <Suspense fallback={<div className="h-[400px] bg-[#020617]" />}>
                <div id="editorial">
                    {siteConfig?.showEditorial !== false && <Editorial />}
                </div>
            </Suspense>

            <Suspense fallback={<div className="h-[600px] bg-[#020617]" />}>
                <ShopTheLook />
            </Suspense>

            {/* Categorías — solo renderiza si hay categorías válidas */}
            {validCategories.length > 0 && <section id="categories" className="py-24 md:py-32 px-6 bg-[#020617] relative">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px] md:auto-rows-[500px]">
                        {validCategories.map((cat, index) => (
                            <Link
                                key={cat.id}
                                to="/shop"
                                onClick={() => setGlobalFilter({ category: cat.name, search: "" })}
                                aria-label={`Ver categoría ${cat.name}`}
                                className={`relative group cursor-pointer overflow-hidden rounded-sm transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(212,175,55,0.3)] ${index === 0 ? 'md:col-span-2' : ''}`}
                            >
                                <div className="absolute inset-0 bg-slate-800 animate-pulse" />
                                <img
                                    src={optimizeImage(cat.image, 800)}
                                    alt={cat.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[40%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 opacity-70 group-hover:opacity-50 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-cielo-gold/0 via-cielo-gold/5 to-cielo-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                    <span className="px-3 py-1 bg-cielo-gold/90 text-black text-[9px] font-bold uppercase tracking-widest rounded-sm">Ver todo</span>
                                </div>

                                <div className="absolute bottom-0 left-0 p-8">
                                    <h3 className="text-3xl font-cinzel text-white mb-2 drop-shadow-lg group-hover:text-cielo-gold transition-colors duration-500">{cat.name}</h3>
                                    <div className="w-8 h-[1px] bg-cielo-gold/60 mb-4 group-hover:w-28 transition-all duration-700 ease-out" />
                                    <p className="text-xs uppercase tracking-widest text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 delay-100">
                                        Explorar <ArrowRight className="w-3 h-3 text-cielo-gold" />
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Reveal>
            </section>}

            {/* New Arrivals */}
            <section className="py-20 px-4 sm:px-8 bg-[#020617]">
                <div className="max-w-[1800px] mx-auto">
                    <Suspense fallback={<div className="h-[400px]" />}>
                        <NewArrivalsCarousel
                            products={newArrivals}
                            onQuickView={(p) => setQuickViewProduct(p)}
                        />
                    </Suspense>
                </div>
            </section>

            <Suspense fallback={<div className="h-[200px] bg-[#020617]" />}>
                <CountdownBanner />
            </Suspense>

            <Suspense fallback={<div className="h-[400px] bg-[#020617]" />}>
                <Testimonials />
            </Suspense>

            {/* Pausa de marca, distribuida lejos de la Editorial */}
            <Suspense fallback={<div className="h-[400px] bg-[#020617]" />}>
                <Atelier />
            </Suspense>

            <Suspense fallback={<div className="h-[400px] bg-[#020617]" />}>
                <HowItWorks />
            </Suspense>

            <Suspense fallback={<div className="h-[200px] bg-[#020617]" />}>
                <NewsletterInline />
            </Suspense>

            <Suspense fallback={<div className="h-[400px] bg-[#020617]" />}>
                <InstagramFeed />
            </Suspense>
        </div>
    );
};
