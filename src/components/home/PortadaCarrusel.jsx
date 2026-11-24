import React, { useEffect, useRef, useState } from 'react';

const MEDIA_TELEFONO = '(max-width: 1023px)';
const MEDIA_ESCRITORIO = '(min-width: 1024px)';
export const PASO_MS = 9000;
const CIERRA_MS = 950;
const QUIETA_MS = 250;
const ABRE_MS = 1400;

// Carrusel de portadas con PUERTAS art déco (pedido del dueño, 23/11/2026:
// «que entren y salgan por esa puerta, que se abra y se cierre»). Dos hojas de
// laca negra con filetes de oro se cierran sobre la modelo, la juntura brilla,
// y se abren con la siguiente adentro; después una luz cálida barre los
// paneles. Las puertas están dibujadas en código: no se pide a Flow que haga
// entrar a la modelo, porque al caminar inventa la prenda. Si la portada trae
// `video` (Flow, la modelo respira y se mueve en el lugar), en escritorio se
// reproduce encima de la foto, que queda de póster.
//
// Va partido en hook + piezas a propósito: las fotos tienen que ir DENTRO
// de la capa con parallax (que lleva `transform`) y los puntitos NO. Un
// elemento con transform abre su propio contexto de apilamiento, así que un
// `z-index` alto adentro no sube por encima de los velos oscuros del hero.
//
// Cuidados que no son opcionales:
//  1. La PRIMERA portada marca el LCP de la home: se dibuja sola, en `eager`,
//     sin puertas; las demás no entran al DOM hasta que el navegador está
//     desocupado.
//  2. Si la persona pidió menos movimiento, o la pestaña está oculta, no rota
//     y no hay video.
//  3. El tiempo se cuenta por portada (setTimeout): si la clienta elige una,
//     la barrita de progreso arranca de cero con ella.

const pideQuietud = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

export const usePortadas = (slides) => {
    const [activa, setActivaCruda] = useState(0);
    const [fase, setFase] = useState('abierta');
    const [vueltas, setVueltas] = useState(0);
    const [resto, setResto] = useState(false);
    const [oculta, setOculta] = useState(false);
    const ultima = useRef(0);
    const relojes = useRef([]);

    const limpiar = () => { relojes.current.forEach(clearTimeout); relojes.current = []; };
    useEffect(() => limpiar, []);

    const setActiva = (i) => {
        const siguiente = typeof i === 'function' ? i(ultima.current) : i;
        if (siguiente === ultima.current) return;
        limpiar();
        if (pideQuietud()) {
            ultima.current = siguiente;
            setActivaCruda(siguiente);
            return;
        }
        setFase('cierra');
        relojes.current.push(setTimeout(() => {
            ultima.current = siguiente;
            setActivaCruda(siguiente);
            setFase('cerrada');
        }, CIERRA_MS));
        relojes.current.push(setTimeout(() => {
            setFase('abre');
            setVueltas((v) => v + 1);
        }, CIERRA_MS + QUIETA_MS));
        relojes.current.push(setTimeout(() => setFase('abierta'), CIERRA_MS + QUIETA_MS + ABRE_MS));
    };

    useEffect(() => {
        if (slides.length < 2) return undefined;
        const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
        const handle = schedule(() => setResto(true), { timeout: 3000 });
        return () => {
            if (window.cancelIdleCallback && handle) window.cancelIdleCallback(handle);
        };
    }, [slides.length]);

    useEffect(() => {
        const alCambiar = () => setOculta(document.hidden);
        document.addEventListener('visibilitychange', alCambiar);
        return () => document.removeEventListener('visibilitychange', alCambiar);
    }, []);

    const rotando = slides.length > 1 && resto && !oculta && !pideQuietud();

    useEffect(() => {
        if (!rotando || fase !== 'abierta') return undefined;
        const id = setTimeout(() => setActiva((i) => (i + 1) % slides.length), PASO_MS);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rotando, activa, fase, slides.length]);

    return { activa, fase, vueltas, setActiva, rotando, visibles: resto ? slides : slides.slice(0, 1) };
};

// El video sólo en escritorio, con movimiento permitido y sin ahorro de datos.
export const usePuedeVideo = () => {
    const [puede, setPuede] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia?.(MEDIA_ESCRITORIO);
        const ahorro = navigator.connection?.saveData;
        const actualizar = () => setPuede(Boolean(mq?.matches) && !ahorro && !pideQuietud());
        actualizar();
        mq?.addEventListener?.('change', actualizar);
        return () => mq?.removeEventListener?.('change', actualizar);
    }, []);
    return puede;
};

const CLASE_MEDIO = 'absolute inset-0 w-full h-full object-cover object-center';
const CLASE_PROPIA = 'portada-propia md:object-contain lg:left-auto lg:w-auto lg:max-w-none';

const VideoPortada = ({ src, poster, propias }) => {
    const ref = useRef(null);
    const [listo, setListo] = useState(false);
    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        v.currentTime = 0;
        v.play?.().catch(() => {});
    }, [src]);
    return (
        <video
            ref={ref}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
            onPlaying={() => setListo(true)}
            style={{ aspectRatio: '16 / 9' }}
            className={[CLASE_MEDIO, propias && CLASE_PROPIA, 'transition-opacity duration-500', listo ? 'opacity-100' : 'opacity-0'].filter(Boolean).join(' ')}
        />
    );
};

export const CapaPortadas = ({ visibles, activa, fase = 'abierta', vueltas = 0, propias }) => {
    const puedeVideo = usePuedeVideo();
    return (
        <>
            {visibles.map((s, i) => {
                const esActiva = i === activa;
                return (
                    <picture key={s.escritorio} className={`portada-capa${esActiva ? ' es-activa' : ''}`}>
                        {propias && (
                            <>
                                <source media={MEDIA_TELEFONO} type="image/webp" srcSet={s.telefono} />
                                <source media={MEDIA_ESCRITORIO} type="image/webp" srcSet={s.escritorio} />
                            </>
                        )}
                        <img
                            src={propias ? s.respaldo : s.escritorio}
                            alt=""
                            aria-hidden="true"
                            fetchPriority={i === 0 ? 'high' : 'low'}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            className={[
                                // Las propias de escritorio van con todo su alto, apoyadas a la derecha
                                // (la modelo está en el tercio derecho); lo que sobra se come de la
                                // izquierda, que es pared en penumbra, y ese borde se funde con la página.
                                CLASE_MEDIO,
                                propias && CLASE_PROPIA,
                                esActiva && !s.video ? 'animate-kenburns motion-reduce:animate-none' : '',
                            ].filter(Boolean).join(' ')}
                        />
                        {esActiva && s.video && puedeVideo && (
                            <VideoPortada src={s.video} poster={s.escritorio} propias={propias} />
                        )}
                    </picture>
                );
            })}
            <span key={`luz-${vueltas}`} aria-hidden="true" className={`portada-luz${vueltas ? ' tras-puertas' : ''}`} />
            {visibles.length > 1 && (
                <span aria-hidden="true" className={`puertas puertas-${fase}`}>
                    <span className="puerta puerta-izq" />
                    <span className="puerta puerta-der" />
                    <span className="puertas-juntura" />
                </span>
            )}
        </>
    );
};

const dosCifras = (n) => String(n).padStart(2, '0');

export const PuntosPortada = ({ slides, activa, fase = 'abierta', onElegir, rotando }) => {
    if (slides.length < 2) return null;
    const corre = rotando && fase === 'abierta';
    return (
        <div className="absolute top-[calc(78svh-2.5rem)] lg:top-auto lg:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 lg:left-auto lg:right-24 lg:translate-x-0">
            <span className="hidden lg:inline font-cinzel text-2xs tracking-[0.25em] text-cielo-gold tabular-nums">{dosCifras(activa + 1)}</span>
            {slides.map((s, i) => (
                <button
                    key={s.escritorio}
                    type="button"
                    onClick={() => onElegir(i)}
                    aria-label={`Ver portada ${i + 1}`}
                    aria-current={i === activa}
                    className="p-2.5 -m-2.5 group"
                >
                    <span
                        className={[
                            'relative block h-px overflow-hidden transition-all duration-500',
                            i === activa ? 'w-12 bg-white/25' : 'w-5 bg-white/35 group-hover:bg-white/70',
                        ].join(' ')}
                    >
                        {i === activa && (
                            <span
                                key={`p-${activa}-${corre}`}
                                className={`absolute inset-y-0 left-0 bg-cielo-gold ${corre ? 'portada-progreso' : rotando ? 'w-0' : 'w-full'}`}
                                style={corre ? { animationDuration: `${PASO_MS}ms` } : undefined}
                            />
                        )}
                    </span>
                </button>
            ))}
            <span className="hidden lg:inline font-cinzel text-2xs tracking-[0.25em] text-white/40 tabular-nums">{dosCifras(slides.length)}</span>
        </div>
    );
};
