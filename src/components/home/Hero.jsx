import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { optimizeImage } from '../../utils/helpers';

export const Hero = () => {
    const { siteConfig } = useStore();
    const layerRef = useRef(null);
    const contentRef = useRef(null);
    // Efectos no críticos (noise, parallax) se montan post-LCP para no bloquear render
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
                if (layerRef.current) layerRef.current.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.08)`;
                if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${y * -0.08}px, 0)`;
                raf = 0;
            });
        };
        // Atar el listener después del primer paint
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
    const buttonText = siteConfig?.hero?.buttonText || 'Explorar Shop';
    const buttonLink = siteConfig?.hero?.buttonLink || 'shop';

    const primaryAction = (e) => {
        if (!buttonLink) return;
        if (buttonLink.startsWith('http')) { window.location.href = buttonLink; return; }
        if (buttonLink === 'shop') return; // let Link handle
        e.preventDefault();
        document.getElementById(buttonLink)?.scrollIntoView({ behavior: 'smooth' });
    };

    const heroSrc = heroImage ? optimizeImage(heroImage, 1800) : null;

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
            {heroSrc && (
                <Helmet>
                    <link rel="preload" as="image" href={heroSrc} fetchpriority="high" />
                </Helmet>
            )}
            {/* Background image with parallax */}
            <div ref={layerRef} className="absolute inset-0 z-0 will-change-transform">
                {heroSrc && (
                    <img
                        src={heroSrc}
                        alt=""
                        aria-hidden="true"
                        fetchpriority="high"
                        decoding="async"
                        className="w-full h-full object-cover opacity-[0.78] scale-110"
                    />
                )}
            </div>

            {/* Gradient mesh */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 60% 50% at 20% 30%, rgba(212,175,55,0.18), transparent 60%),
                        radial-gradient(ellipse 50% 60% at 80% 70%, rgba(191,149,63,0.15), transparent 65%),
                        radial-gradient(ellipse 55% 45% at 50% 45%, rgba(2,6,23,0.6), transparent 70%),
                        radial-gradient(ellipse 70% 40% at 50% 100%, rgba(2,6,23,1) 0%, transparent 70%),
                        linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(2,6,23,0.55) 60%, #020617 100%)
                    `
                }}
            />

            {/* Shimmer grain (diferido hasta post-LCP para no bloquear render) */}
            {effectsReady && (
                <div className="absolute inset-0 z-[2] opacity-[0.06] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                    }}
                />
            )}

            {/* Gold thin edges */}
            <span className="absolute top-8 left-8 w-10 h-px bg-cielo-gold/50 z-[3]" />
            <span className="absolute top-8 left-8 w-px h-10 bg-cielo-gold/50 z-[3]" />
            <span className="absolute top-8 right-8 w-10 h-px bg-cielo-gold/50 z-[3]" />
            <span className="absolute top-8 right-8 w-px h-10 bg-cielo-gold/50 z-[3]" />
            <span className="absolute bottom-8 left-8 w-10 h-px bg-cielo-gold/50 z-[3]" />
            <span className="absolute bottom-8 left-8 w-px h-10 bg-cielo-gold/50 z-[3]" />
            <span className="absolute bottom-8 right-8 w-10 h-px bg-cielo-gold/50 z-[3]" />
            <span className="absolute bottom-8 right-8 w-px h-10 bg-cielo-gold/50 z-[3]" />

            {/* Content */}
            <div ref={contentRef} className="relative z-10 text-center px-4 max-w-5xl mx-auto will-change-transform">
                <div className="animate-fadeIn">
                    <span className="inline-block px-5 py-2 rounded-full border border-cielo-gold/30 bg-cielo-gold/10 backdrop-blur-md text-[10px] uppercase tracking-[0.4em] font-bold text-cielo-gold mb-8 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                        Colección 2026 · Edición de autor
                    </span>
                </div>

                <h1 className="relative font-cinzel text-5xl md:text-7xl lg:text-[7rem] leading-[0.95] tracking-tight text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)] animate-slideUp">
                    {title}
                    <span
                        className="block italic font-serif text-2xl md:text-4xl lg:text-5xl mt-4 font-light tracking-normal"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {subtitle}
                    </span>
                </h1>

                <p className="mt-10 text-sm md:text-base text-slate-300/90 max-w-xl font-light tracking-wide leading-relaxed animate-fadeIn opacity-0 [animation-delay:500ms] mx-auto">
                    Moda femenina curada a mano. Donde la tradición del oficio encuentra el lenguaje estético del presente.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn opacity-0 [animation-delay:800ms]">
                    <Link
                        to="/shop"
                        onClick={primaryAction}
                        className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-black font-bold text-[11px] uppercase tracking-[0.3em] overflow-hidden rounded-sm shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] transition-transform hover:scale-[1.03]"
                        style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                    >
                        <span className="relative z-10">{buttonText}</span>
                        <ArrowRight className="relative z-10 w-4 h-4" />
                        <span className="absolute inset-0 bg-white/60 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                    </Link>
                    <button
                        onClick={() => document.getElementById('editorial')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 hover:border-cielo-gold/60 hover:bg-white/5 text-white font-bold text-[11px] uppercase tracking-[0.3em] backdrop-blur-sm transition-colors rounded-sm"
                    >
                        Ver editorial
                    </button>
                </div>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce opacity-60">
                <div className="w-[1px] h-12 bg-gradient-to-b from-cielo-gold to-transparent" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/60 mt-2">Scroll</span>
            </div>
        </section>
    );
};
