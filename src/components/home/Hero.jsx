import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { optimizeImage } from '../../utils/helpers';

export const Hero = () => {
    const { siteConfig } = useStore();
    const layerRef = useRef(null);
    const contentRef = useRef(null);
    const [effectsReady, setEffectsReady] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
        const handle = schedule(() => setEffectsReady(true), { timeout: 2000 });

        if (reduced) return () => {};

        let raf = 0;
        let bound = false;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const y = Math.min(window.scrollY, 600);
                if (layerRef.current) layerRef.current.style.transform = `translate3d(0, ${y * 0.22}px, 0) scale(1.08)`;
                if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
                raf = 0;
            });
        };
        const bindTimeout = setTimeout(() => {
            window.addEventListener('scroll', onScroll, { passive: true });
            bound = true;
        }, 800);

        return () => {
            clearTimeout(bindTimeout);
            if (bound) window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
            if (window.cancelIdleCallback && handle) window.cancelIdleCallback(handle);
        };
    }, []);

    const heroImage = typeof siteConfig?.hero === 'string' ? siteConfig.hero : siteConfig?.hero?.image;
    const title = siteConfig?.hero?.title || 'LA BOUTIQUE';
    const subtitle = siteConfig?.hero?.subtitle || 'de la Elegancia';
    const tagline = siteConfig?.hero?.tagline || siteConfig?.hero?.description || 'Piezas curadas que duran temporadas, no semanas.';
    const buttonText = siteConfig?.hero?.buttonText || 'Explorar Shop';
    const buttonLink = siteConfig?.hero?.buttonLink || 'shop';

    const primaryAction = (e) => {
        if (!buttonLink) return;
        if (buttonLink.startsWith('http')) { window.location.href = buttonLink; return; }
        if (buttonLink === 'shop') return;
        e.preventDefault();
        document.getElementById(buttonLink)?.scrollIntoView({ behavior: 'smooth' });
    };

    const heroSrc = heroImage ? optimizeImage(heroImage, 1800) : null;

    return (
        <section className="relative min-h-screen flex items-end justify-center overflow-hidden bg-cielo-dark">
            {heroSrc && (
                <Helmet>
                    <link rel="preload" as="image" href={heroSrc} fetchPriority="high" />
                </Helmet>
            )}

            <div ref={layerRef} className="absolute inset-0 z-0 will-change-transform">
                {heroSrc && (
                    <img
                        src={heroSrc}
                        alt=""
                        aria-hidden="true"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover object-top opacity-[0.80] animate-kenburns motion-reduce:animate-none motion-reduce:scale-110"
                    />
                )}
            </div>

            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `linear-gradient(180deg,
                        rgba(2,6,23,0.75) 0%,
                        rgba(2,6,23,0.20) 30%,
                        rgba(2,6,23,0.10) 50%,
                        rgba(2,6,23,0.60) 75%,
                        rgba(2,6,23,0.97) 100%
                    )`
                }}
            />

            {effectsReady && (
                <div
                    className="absolute inset-0 z-[2] opacity-[0.04] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                    }}
                />
            )}

            <div ref={contentRef} className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 pb-24 md:pb-32 will-change-transform">

                <div className="flex items-center gap-3 mb-8 animate-fadeIn">
                    <span className="h-px w-12 bg-cielo-gold/60" />
                    <span className="text-2xs uppercase tracking-[0.45em] font-semibold text-cielo-gold/80">
                        Colección 2026 · Edición de autor
                    </span>
                </div>

                <h1
                    className="font-cinzel font-bold leading-[0.88] tracking-tight text-white animate-slideUp"
                    style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
                >
                    {title}
                </h1>

                <p
                    className="font-serif italic font-light text-white/75 mt-3 animate-fadeIn opacity-0 [animation-delay:300ms]"
                    style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}
                >
                    {subtitle}
                </p>

                <div className="flex items-center gap-3 mt-8 animate-fadeIn opacity-0 [animation-delay:400ms]">
                    <span className="h-px w-16 bg-cielo-gold/40" />
                    <span className="w-1 h-1 rounded-full bg-cielo-gold/50" />
                    <span className="h-px w-8 bg-cielo-gold/20" />
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-end gap-8 md:gap-16 animate-fadeIn opacity-0 [animation-delay:550ms]">
                    <p className="text-sm md:text-base text-white/60 max-w-sm font-light leading-relaxed">
                        {tagline}
                    </p>

                    <div className="flex items-center gap-5 shrink-0">
                        <Link
                            to="/shop"
                            onClick={primaryAction}
                            className="group relative inline-flex items-center gap-3 px-10 py-4 text-black font-cinzel font-semibold text-2xs uppercase tracking-[0.25em] overflow-hidden shadow-[0_8px_40px_-8px_rgba(193,154,107,0.5)] transition-transform hover:scale-[1.03]"
                            style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                        >
                            <span className="relative z-10">{buttonText}</span>
                            <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            <span className="absolute inset-0 bg-white/40 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                        </Link>
                        <button
                            onClick={() => document.getElementById('editorial')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group inline-flex items-center gap-2 text-white/50 hover:text-white text-2xs uppercase tracking-[0.3em] font-semibold transition-colors"
                        >
                            <span className="relative">
                                Ver colección
                                <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-cielo-gold transition-all duration-500" />
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 animate-fadeIn opacity-0 [animation-delay:750ms]">
                    <span className="flex items-center gap-2 text-2xs text-white/35 tracking-wide">
                        <Truck className="w-3.5 h-3.5 text-cielo-gold/50" strokeWidth={1.5} />
                        Envíos a todo el país
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-2 text-2xs text-white/35 tracking-wide">
                        <CreditCard className="w-3.5 h-3.5 text-cielo-gold/50" strokeWidth={1.5} />
                        Pago en cuotas
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-2 text-2xs text-white/35 tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5 text-cielo-gold/50" strokeWidth={1.5} />
                        Compra protegida
                    </span>
                </div>
            </div>

            <div className="absolute bottom-10 right-8 z-10 hidden lg:flex flex-col items-center gap-3 opacity-40">
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/60 [writing-mode:vertical-rl]">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-cielo-gold/60 to-transparent" />
            </div>
        </section>
    );
};
