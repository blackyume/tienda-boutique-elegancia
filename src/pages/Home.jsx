import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney, getColorHex, optimizeImage } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Eye, ArrowRight, ArrowDown, X } from 'lucide-react';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { Features } from '../components/home/Features';
import { InstagramFeed } from '../components/home/InstagramFeed';
import { Marquee } from '../components/home/Marquee';
import { Editorial } from '../components/home/Editorial';
import { FeaturedCollection } from '../components/home/FeaturedCollection';
import { NewArrivalsCarousel } from '../components/home/NewArrivalsCarousel';
import { QuickAddCard } from '../components/shop/QuickAddCard';

import { SEO } from '../components/seo/SEO';

export const Home = () => {
    const { inventory, wishlist, setWishlist, addToast, categories, siteConfig, globalFilter, setGlobalFilter } = useStore();
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // FILTRADO MAESTRO
    const filteredProducts = inventory.filter(p => {
        const matchesCategory = globalFilter.category === "Todos" || p.category === globalFilter.category;
        const matchesSearch = p.name.toLowerCase().includes(globalFilter.search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleWishlist = (e, product) => {
        e.stopPropagation();
        setWishlist(prev => {
            const exists = prev.includes(product.id);
            addToast(exists ? "Eliminado de favoritos" : "Agregado a favoritos", exists ? "info" : "success");
            return exists ? prev.filter(id => id !== product.id) : [...prev, product.id];
        });
    };

    return (
        <div className="pb-0 font-sans bg-[#020617] text-white transition-colors duration-500 overflow-x-hidden">
            <SEO
                title={siteConfig.hero?.title}
                description={siteConfig.editorial?.text}
                image={typeof siteConfig.hero === 'string' ? siteConfig.hero : siteConfig.hero?.image}
            />
            {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}

            {/* HERO 2026 FUTURE LUXURY */}
            {!globalFilter.search && (
                <div className="relative h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Parallax Layer */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={optimizeImage(typeof siteConfig.hero === 'string' ? siteConfig.hero : siteConfig.hero?.image, 1600)}
                            className="w-full h-full object-cover opacity-60 scale-110 animate-[float_10s_ease-in-out_infinite]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
                        <div className="animate-fadeIn opacity-0 [animation-delay:200ms]">
                            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] uppercase tracking-[0.4em] font-bold text-cielo-gold mb-6 shadow-2xl">
                                Nueva Colección 2026
                            </span>
                        </div>

                        <h1 className="relative font-cinzel text-5xl md:text-8xl lg:text-[7rem] leading-none tracking-tighter mix-blend-overlay opacity-90 animate-slideUp">
                            {siteConfig.hero?.title || "LA BOUTIQUE"}
                            <span className="block italic font-serif text-3xl md:text-5xl lg:text-6xl text-white/80 mt-2 font-light tracking-normal transform -rotate-2">
                                {siteConfig.hero?.subtitle || "de la Elegancia"}
                            </span>
                        </h1>

                        <p className="mt-8 text-sm md:text-base text-slate-300 max-w-lg font-light tracking-wide leading-relaxed animate-fadeIn opacity-0 [animation-delay:600ms]">
                            Descubre la fusión perfecta entre la moda clásica y la innovación digital. Diseños exclusivos para quienes marcan tendencia.
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row gap-6 animate-fadeIn opacity-0 [animation-delay:800ms]">
                            <button
                                onClick={() => {
                                    const target = siteConfig.hero?.buttonLink || 'shop';
                                    if (target.startsWith('http')) window.location.href = target;
                                    else document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="group relative px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105"
                            >
                                <span className="relative z-10">{siteConfig.hero?.buttonText || "Explorar Shop"}</span>
                                <div className="absolute inset-0 bg-cielo-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
                            </button>
                            <button className="px-8 py-4 border border-white/20 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-[0.2em] backdrop-blur-sm transition-all" onClick={() => document.getElementById('editorial')?.scrollIntoView({ behavior: 'smooth' })}>
                                Ver Lookbook
                            </button>
                        </div>
                    </div>

                    {/* Footer Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent mx-auto mb-2"></div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/50">Scroll</span>
                    </div>
                </div>
            )}

            {siteConfig.showMarquee && !globalFilter.search && <Marquee />}

            <div id="editorial">
                {siteConfig.showEditorial && !globalFilter.search && <Editorial />}
            </div>

            {!globalFilter.search && <Features />}

            {!globalFilter.search && <FeaturedCollection onQuickView={(p) => setQuickViewProduct(p)} />}

            {/* CATEGORÍAS 2026 (Masonry / Asymmetrical) */}
            {!globalFilter.search && (
                <div id="categories" className="py-24 px-4 bg-[#020617] relative">
                    <div className="max-w-[1800px] mx-auto">
                        <div className="flex justify-between items-end mb-16 px-4">
                            <div>
                                <span className="text-cielo-gold text-xs uppercase tracking-[0.3em] font-bold">Categorías</span>
                                <h2 className="text-4xl md:text-5xl font-serif text-white mt-4">Curaduría Exclusiva</h2>
                            </div>
                            <Button variant="outline" className="hidden md:flex border-white/20 text-white hover:bg-white/10" onClick={() => setGlobalFilter({ category: "Todos", search: "" })}>
                                Ver Todo
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px] md:h-[500px]">
                            {categories.map((cat, index) => (
                                <div
                                    key={cat.id}
                                    onClick={() => { setGlobalFilter({ category: cat.name, search: "" }); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}
                                    className={`relative group cursor-pointer overflow-hidden rounded-sm transition-all duration-700 ${index === 0 ? 'md:col-span-2' : ''}`}
                                >
                                    <div className="absolute inset-0 bg-slate-800 animate-pulse"></div>
                                    <img src={optimizeImage(cat.image, 600)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                    <div className="absolute bottom-0 left-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-3xl font-cinzel text-white mb-2">{cat.name}</h3>
                                        <div className="w-12 h-[1px] bg-cielo-gold mb-4 group-hover:w-24 transition-all duration-500"></div>
                                        <p className="text-xs uppercase tracking-widest text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-500 delay-100">
                                            Explorar <ArrowRight className="w-3 h-3 text-cielo-gold" />
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SHOP SECTION REDESIGN */}
            {/* SHOP SECTION REDESIGN */}
            <div id="shop" className="max-w-[1920px] mx-auto px-4 sm:px-8 py-32 min-h-screen relative z-10">

                {/* 1. NEW ARRIVALS CAROUSEL (Show only if no search/filter active) */}
                {!globalFilter.search && globalFilter.category === "Todos" && (
                    <div className="mb-32">
                        <NewArrivalsCarousel
                            products={inventory.slice(0, 8)} // Show top 8 as "New"
                            onQuickView={(p) => setQuickViewProduct(p)}
                        />
                    </div>
                )}

                {/* 2. MAIN SHOP GRID (Best Sellers / Filtered) */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        {globalFilter.search ? (
                            <h2 className="text-3xl font-serif text-white">Resultados para: <span className="text-cielo-gold italic">"{globalFilter.search}"</span></h2>
                        ) : (
                            <>
                                <span className="text-xs font-bold text-cielo-gold uppercase tracking-[0.3em] mb-4 block">
                                    {globalFilter.category === "Todos" ? "Best Sellers & Favorites" : "Shop Online"}
                                </span>
                                <h2 className="text-5xl md:text-6xl font-serif text-white leading-none">{globalFilter.category}</h2>
                            </>
                        )}
                    </div>

                    {/* Filtros visuales (Glass Pills) */}
                    <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full overflow-x-auto max-w-full items-center">
                        {globalFilter.search && <button onClick={() => setGlobalFilter({ category: "Todos", search: "" })} className="px-4 py-2 text-xs font-bold bg-red-500/20 text-red-400 rounded-full flex items-center gap-1 hover:bg-red-500/30 transition-colors"><X className="w-3 h-3" /> Limpiar</button>}

                        <button onClick={() => setGlobalFilter({ ...globalFilter, category: "Todos" })} className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${globalFilter.category === "Todos" ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Todos</button>

                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setGlobalFilter({ ...globalFilter, category: cat.name })} className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${globalFilter.category === cat.name ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{cat.name}</button>
                        ))}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <p className="text-xl font-light">No se encontraron productos que coincidan.</p>
                        <Button variant="outline" className="mt-6 border-white/20 text-white hover:bg-white/10" onClick={() => setGlobalFilter({ category: "Todos", search: "" })}>Ver todo el catálogo</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-8">
                        {filteredProducts.map(product => (
                            <QuickAddCard
                                key={product.id}
                                product={product}
                                onQuickView={(p) => setQuickViewProduct(p)}
                            />
                        ))}
                    </div>
                )}
            </div>
            {!globalFilter.search && <InstagramFeed />}
        </div>
    );
};