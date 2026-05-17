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
        <section className="relative min-h-screen flex items-end overflow-hidden bg-[#020617] px-6 md:px-16 lg:px-24 pb-20 md:pb-28">
            {heroSrc && (
                <Helmet>
                    <link rel="preload" as="image" href={heroSrc} fetchPriority="high" />
                </Helmet>
            )}
            {/* Background image with parallax */}
            <div ref={layerRef} className="absolute inset-0 z-0 will-change-transform">
                {heroSrc && (
                    <img
                        src={heroSrc}
                        alt=""
                        aria-hidden="true"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover opacity-[0.78] animate-kenburns motion-reduce:animate-none motion-reduce:scale-110"
                    />
                )}
            </div>

            {/* Gradient mesh */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 60% 50% at 20% 30%, rgba(212,175,55,0.07), transparent 60%),
                        radial-gradient(ellipse 55% 45% at 50% 45%, rgba(2,6,23,0.55), transparent 70%),
                        radial-gradient(ellipse 70% 40% at 50% 100%, rgba(2,6,23,1) 0%, transparent 70%),
                        linear-gradient(180deg, rgba(2,6,23,0.30) 0%, rgba(2,6,23,0.55) 60%, #020617 100%)
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

            {/* Content — editorial, alineado abajo-izquierda */}
            <div ref={contentRef} className="relative z-10 text-left max-w-4xl will-change-transform">
                <div className="animate-fadeIn flex items-center gap-4 mb-6">
                    <span className="h-px w-12 bg-cielo-gold/60" />
                    <span className="text-[10px] uppercase tracking-[0.45em] font-bold text-white/70">
                        Colección 2026 · Edición de autor
                    </span>
                </div>

                <h1 className="font-cinzel text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.95] tracking-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.5)] animate-slideUp">
                    {title}
                    <span className="block italic font-serif text-2xl md:text-4xl lg:text-5xl mt-4 font-light tracking-normal text-white/85">
                        {subtitle}
                    </span>
                </h1>

                <p className="mt-10 text-sm md:text-base text-slate-300/75 max-w-md font-light tracking-wide leading-relaxed animate-fadeIn opacity-0 [animation-delay:500ms]">
                    Moda femenina curada a mano. Donde la tradición del oficio encuentra el lenguaje estético del presente.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-8 animate-fadeIn opacity-0 [animation-delay:800ms]">
                    <Link
                        to="/shop"
                        onClick={primaryAction}
                        className="group relative inline-flex items-center justify-center gap-3 px-12 py-4 text-black font-bold text-[11px] uppercase tracking-[0.35em] overflow-hidden rounded-sm shadow-[0_10px_50px_-12px_rgba(212,175,55,0.6)] transition-transform hover:scale-[1.03]"
                        style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                    >
                        <span className="relative z-10">{buttonText}</span>
                        <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span className="absolute inset-0 bg-white/60 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                    </Link>
                    <button
                        onClick={() => document.getElementById('editorial')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group inline-flex items-center gap-2 text-white/60 hover:text-white text-[10px] uppercase tracking-[0.35em] font-bold transition-colors"
                    >
                        <span className="relative">
                            Descubrir la colección
                            <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-cielo-gold transition-all duration-500" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Scroll hint — discreto, a la derecha */}
            <div className="absolute bottom-10 right-8 md:right-16 z-10 hidden sm:flex flex-col items-center opacity-50">
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/60 mb-2 [writing-mode:vertical-rl] rotate-180">Scroll</span>
                <div className="w-[1px] h-14 bg-gradient-to-b from-cielo-gold/70 to-transparent" />
            </div>
        </section>
    );
};
