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
    const tagline = siteConfig?.hero?.tagline || siteConfig?.hero?.description || 'Elegancia que habla por vos. Prendas elegidas una a una para la mujer que se viste con intención.';
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
        <section className="relative md:min-h-screen flex flex-col md:flex-row md:items-center justify-start overflow-hidden bg-cielo-dark">
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

            {/* En el teléfono la foto va ARRIBA y el texto DEBAJO: superpuesto le tapaba
                la ropa a la modelo, y la prenda se tiene que ver entera (pedido del dueño,
                1/11/2026). En escritorio sigue a pantalla completa con el texto a la izquierda. */}
            <div ref={layerRef} className="relative h-[86svh] md:h-auto md:absolute md:inset-x-0 md:bottom-0 md:top-[7.5rem] z-0 will-change-transform sin-textura">
                <CapaPortadas visibles={visibles} activa={activa} propias={esPortadaPropia} />
                <div className="md:hidden absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#11100D] pointer-events-none" />
            </div>

            {/* Los velos sólo tocan los bordes: arriba para el menú, abajo para el
                pase a la sección siguiente. Las modelos van a plena luz (pedido del
                dueño, 1/11/2026: «más premium»); antes un velo las apagaba enteras.
                La capa de fotos arranca debajo del menú (md:top-[7.5rem]): en pantallas
                anchas y bajas el logo le tapaba la cabeza a la modelo del medio. */}
            <div
                className="hidden md:block absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `linear-gradient(180deg,
                        rgba(17,16,13,0.60) 0%,
                        rgba(17,16,13,0) 20%,
                        rgba(17,16,13,0) 90%,
                        rgba(17,16,13,0.80) 100%
                    )`
                }}
            />

            {/* Velo lateral: la columna de texto arranca sobre fondo oscuro sí o sí
                aunque la foto del CMS sea clara. Muere antes de la primera modelo. */}
            <div
                className="hidden md:block absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: `linear-gradient(90deg,
                        rgba(17,16,13,0.70) 0%,
                        rgba(17,16,13,0.35) 24%,
                        rgba(17,16,13,0) 38%
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

            {/* La columna de texto vive en el aire oscuro de la izquierda de la portada
                (las modelos arrancan al 42% del ancho) y nunca pasa del 36% de la
                pantalla: antes el titular de 7vw se montaba sobre la primera modelo.
                md:pt-28 deja libre el menú fijo en pantallas bajas. */}
            <div ref={contentRef} className="relative z-10 w-full md:w-auto px-8 md:pl-[5.5vw] md:pr-0 pt-2 md:pt-28 pb-16 md:pb-20 will-change-transform md:max-w-[36vw]">

                <span className="block text-2xs uppercase tracking-[0.35em] md:tracking-[0.5em] font-medium text-cielo-gold/90 mb-7 animate-fadeIn">
                    Colección 2027
                </span>

                <h1
                    className="font-cinzel font-medium leading-none tracking-[0.06em] text-white animate-slideUp text-[clamp(1.9rem,9.5vw,2.6rem)] md:text-[clamp(2.4rem,3.3vw,4.5rem)]"
                >
                    {title}
                </h1>

                <p
                    className="font-serif italic font-light text-noche-100/90 mt-3 animate-fadeIn opacity-0 [animation-delay:300ms]"
                    style={{ fontSize: 'clamp(1.35rem, 1.9vw, 2.4rem)' }}
                >
                    {subtitle}
                </p>

                <span className="block h-px w-14 bg-cielo-gold/50 mt-9 animate-fadeIn opacity-0 [animation-delay:400ms]" />

                <div className="mt-9 flex flex-col items-start gap-9 animate-fadeIn opacity-0 [animation-delay:550ms]">
                    <p className="text-sm md:text-[0.95rem] text-noche-300/90 max-w-sm font-light leading-relaxed">
                        {/* La primera oración es el lema y va en serif, más grande */}
                        {lema ? (
                            <>
                                <span className="block font-serif italic text-noche-100 text-xl md:text-2xl leading-snug mb-3 text-balance">
                                    {lema}
                                </span>
                                {resto}
                            </>
                        ) : tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                        <Link
                            to="/shop"
                            onClick={primaryAction}
                            className="group inline-flex items-center gap-3 px-9 py-4 bg-cielo-gold text-[#11100D] font-cinzel font-semibold text-2xs uppercase tracking-[0.3em] transition-colors duration-300 hover:bg-[#F3D985]"
                        >
                            <span>{buttonText}</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        <a
                            href="#categories"
                            onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="font-cinzel text-2xs uppercase tracking-[0.3em] text-noche-100/85 border-b border-cielo-gold/40 pb-1.5 transition-colors hover:text-white hover:border-cielo-gold"
                        >
                            Categorías
                        </a>
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
