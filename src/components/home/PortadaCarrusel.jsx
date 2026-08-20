import React, { useEffect, useState } from 'react';

const MEDIA_TELEFONO = '(max-width: 767px)';
const MEDIA_ESCRITORIO = '(min-width: 768px)';
const PASO_MS = 7000;

// Carrusel de portadas con fundido cruzado.
//
// Va partido en hook + dos piezas a propósito: las fotos tienen que ir DENTRO
// de la capa con parallax (que lleva `transform`) y los puntitos NO. Un
// elemento con transform abre su propio contexto de apilamiento, así que un
// `z-index` alto adentro no sube por encima de los velos oscuros del hero: los
// puntitos quedarían apagados y a medio tapar.
//
// Tres cuidados que no son opcionales:
//  1. La PRIMERA portada marca el LCP de la home. Se dibuja sola y en `eager`;
//     las demás no entran al DOM hasta que el navegador está desocupado.
//  2. El zoom lento (`kenburns`) se reinicia en cada portada: la clase se pone
//     sólo en la activa, así arranca de cero en vez de estar todas en el mismo
//     punto del recorrido.
//  3. Si la persona pidió menos movimiento, o la pestaña está oculta, no rota.

export const usePortadas = (slides) => {
    const [activa, setActiva] = useState(0);
    const [resto, setResto] = useState(false);

    useEffect(() => {
        if (slides.length < 2) return undefined;
        const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
        const handle = schedule(() => setResto(true), { timeout: 3000 });
        return () => {
            if (window.cancelIdleCallback && handle) window.cancelIdleCallback(handle);
        };
    }, [slides.length]);

    useEffect(() => {
        if (slides.length < 2 || !resto) return undefined;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined;

        let id = 0;
        const arrancar = () => {
            clearInterval(id);
            id = setInterval(() => setActiva((i) => (i + 1) % slides.length), PASO_MS);
        };
        const alCambiarVisibilidad = () => {
            if (document.hidden) clearInterval(id);
            else arrancar();
        };
        arrancar();
        document.addEventListener('visibilitychange', alCambiarVisibilidad);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', alCambiarVisibilidad);
        };
    }, [slides.length, resto]);

    return { activa, setActiva, visibles: resto ? slides : slides.slice(0, 1) };
};

export const CapaPortadas = ({ visibles, activa, propias }) => (
    <>
        {visibles.map((s, i) => {
            const esActiva = i === activa;
            return (
                <picture key={s.escritorio}>
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
                            'absolute inset-0 w-full h-full object-cover object-center',
                            'transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none',
                            esActiva ? 'opacity-95' : 'opacity-0',
                            esActiva
                                ? 'animate-kenburns motion-reduce:animate-none motion-reduce:scale-110'
                                : 'scale-[1.02]',
                        ].join(' ')}
                    />
                </picture>
            );
        })}
    </>
);

export const PuntosPortada = ({ slides, activa, onElegir }) => {
    if (slides.length < 2) return null;
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 lg:left-auto lg:right-24 lg:translate-x-0">
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
                            'block h-px transition-all duration-500',
                            i === activa ? 'w-10 bg-cielo-gold' : 'w-5 bg-white/35 group-hover:bg-white/70',
                        ].join(' ')}
                    />
                </button>
            ))}
        </div>
    );
};
