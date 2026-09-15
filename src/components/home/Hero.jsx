import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { resolveHeroImage, PORTADA_PROPIA } from '../../utils/helpers';
import { armarSlides } from '../../utils/portadas';
import { usePortadas, CapaPortadas, PuntosPortada } from './PortadaCarrusel';

export const Hero = () => {
    const { siteConfig } = useStore();
    const layerRef = useRef(null);
    const contentRef = useRef(null);
    const [effectsReady, setEffectsReady] = useState(false);

    const slides = useMemo(() => armarSlides(siteConfig), [siteConfig]);
    const { activa, setActiva, visibles } = usePortadas(slides);

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

    const heroImage = resolveHeroImage(siteConfig);
    const title = siteConfig?.hero?.title || 'LA BOUTIQUE';
    // Los textos viejos que quedaron guardados en el CMS se muestran con la
    // forma nueva; lo que el dueño edite después manda igual.
    const LEGADO = { 'DE LA ELEGANCIA': 'de la Elegancia', 'EXPLORAR SHOP': 'Ver la tienda' };
    const subtitle = LEGADO[siteConfig?.hero?.subtitle] || siteConfig?.hero?.subtitle || 'de la Elegancia';
    // El eslogan de la marca. Habla de la clienta y de cómo se elige acá, sin
    // repetir el titular de la sección La Boutique, que ya cuenta el detalle.
    const tagline = siteConfig?.hero?.tagline || siteConfig?.hero?.description || 'La elegancia no se improvisa: se elige. Prendas seleccionadas con criterio para la mujer que se viste con intención.';
    const [, lema, resto] = tagline.match(/^(.+?[.!?])\s+(\S.*)$/s) || [];
    const buttonText = LEGADO[siteConfig?.hero?.buttonText] || siteConfig?.hero?.buttonText || 'Ver la tienda';
    const buttonLink = siteConfig?.hero?.buttonLink || 'shop';

    const primaryAction = (e) => {
        if (!buttonLink) return;
        if (buttonLink.startsWith('http')) { window.location.href = buttonLink; return; }
        if (buttonLink === 'shop') return;
        e.preventDefault();
        document.getElementById(buttonLink)?.scrollIntoView({ behavior: 'smooth' });
    };

    // Las portadas propias vienen en WebP y en una versión de teléfono: son el
    // elemento más pesado de la home y el que marca el LCP. En JPG a 2400px
    // pesaban 300 KB y el teléfono se las bajaba enteras aunque recorte los
    // costados; así son ~39 KB en escritorio y ~30 KB en el celular.
    //
    // Art direction, no sólo resolución: la foto de modelo es vertical (2:3).
    // La apaisada de escritorio se arma extendiendo el dorado a los costados;
    // en el teléfono, donde la pantalla YA es vertical, va la foto casi entera.
    // Con un srcSet por ancho el teléfono elegía la apaisada (390px x DPR 3 =
    // 1170 > 760) y se comía a la modelo.
    const esPortadaPropia = heroImage === PORTADA_PROPIA;
    const primera = slides[0];
    const MEDIA_TELEFONO = '(max-width: 767px)';
    const MEDIA_ESCRITORIO = '(min-width: 768px)';

    return (
        <section className="relative min-h-screen flex items-end justify-center overflow-hidden bg-cielo-dark">
            {primera && (
                <Helmet>
                    {esPortadaPropia ? (
                        <>
                            <link rel="preload" as="image" href={primera.telefono} media={MEDIA_TELEFONO} fetchPriority="high" />
                            <link rel="preload" as="image" href={primera.escritorio} media={MEDIA_ESCRITORIO} fetchPriority="high" />
                        </>
                    ) : (
                        <link rel="preload" as="image" href={primera.escritorio} fetchPriority="high" />
                    )}
                </Helmet>
            )}

            <div ref={layerRef} className="absolute inset-0 z-0 will-change-transform sin-textura">
                <CapaPortadas visibles={visibles} activa={activa} propias={esPortadaPropia} />
            </div>

            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `linear-gradient(180deg,
                        rgba(17,16,13,0.75) 0%,
                        rgba(17,16,13,0.20) 30%,
                        rgba(17,16,13,0.10) 50%,
                        rgba(17,16,13,0.60) 75%,
                        rgba(17,16,13,0.97) 100%
                    )`
                }}
            />

            {/* Velo lateral: la columna de texto arranca sobre fondo oscuro sí o sí.
                Sin esto el volante dorado queda dorado-sobre-dorado e ilegible
                cuando la foto del CMS es clara. */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `linear-gradient(100deg,
                        rgba(17,16,13,0.85) 0%,
                        rgba(17,16,13,0.55) 32%,
                        rgba(17,16,13,0.12) 58%,
                        rgba(17,16,13,0) 75%
                    )`
                }}
            />

            <PuntosPortada slides={slides} activa={activa} onElegir={setActiva} />

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
                    <span className="text-2xs uppercase tracking-[0.25em] md:tracking-[0.45em] font-semibold text-cielo-gold">
                        Colección 2026 · Rafaela
                    </span>
                </div>

                <h1
                    className="font-cinzel font-bold leading-[0.88] tracking-tight text-white animate-slideUp max-w-3xl"
                    style={{ fontSize: 'clamp(2.75rem, 7vw, 6rem)' }}
                >
                    {title}
                </h1>

                <p
                    className="font-serif italic font-light text-noche-100/85 mt-3 animate-fadeIn opacity-0 [animation-delay:300ms]"
                    style={{ fontSize: 'clamp(1.25rem, 3vw, 2.5rem)' }}
                >
                    {subtitle}
                </p>

                <div className="flex items-center gap-3 mt-8 animate-fadeIn opacity-0 [animation-delay:400ms]">
                    <span className="h-px w-16 bg-cielo-gold/40" />
                    <span className="w-1 h-1 rounded-full bg-cielo-gold/50" />
                    <span className="h-px w-8 bg-cielo-gold/20" />
                </div>

                <div className="mt-8 flex flex-col items-start gap-7 animate-fadeIn opacity-0 [animation-delay:550ms]">
                    <p className="text-sm md:text-base text-noche-300/85 max-w-md font-light leading-relaxed">
                        {/* La primera oración es el lema y va en serif, más grande */}
                        {lema ? (
                            <>
                                <span className="block font-serif italic text-noche-100 text-lg md:text-2xl leading-snug mb-2 text-balance">
                                    {lema}
                                </span>
                                {resto}
                            </>
                        ) : tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-5">
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
                    </div>
                </div>

            </div>

            <div className="absolute bottom-10 right-8 z-10 hidden lg:flex flex-col items-center gap-3 opacity-40">
                <span className="text-[9px] uppercase tracking-[0.4em] text-noche-300/85 [writing-mode:vertical-rl]">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-cielo-gold/60 to-transparent" />
            </div>
        </section>
    );
};
