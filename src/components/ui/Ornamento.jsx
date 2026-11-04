import React, { useEffect, useRef, useState } from 'react';

// El rombo del logo, como remate de los títulos y los separadores.
export const Rombo = ({ className = 'bg-cielo-gold/70' }) => (
    <span aria-hidden="true" className={`inline-block w-1.5 h-1.5 rotate-45 flex-shrink-0 ${className}`} />
);

// Hilo dorado que se dibuja desde el rombo cuando entra en pantalla.
export const Hilo = ({ className = '' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) { setVisible(true); return undefined; }
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); io.disconnect(); }
        }, { threshold: 0.6 });
        io.observe(ref.current);
        return () => io.disconnect();
    }, []);

    const trazo = `h-px flex-1 from-transparent to-cielo-gold/45 transition-transform duration-[1600ms] ease-out ${visible ? 'scale-x-100' : 'scale-x-0'}`;
    return (
        <div ref={ref} aria-hidden="true" className={`flex items-center gap-4 max-w-[1400px] mx-auto px-6 ${className}`}>
            <span className={`${trazo} bg-gradient-to-r origin-right`} />
            <Rombo />
            <span className={`${trazo} bg-gradient-to-l origin-left`} />
        </div>
    );
};
