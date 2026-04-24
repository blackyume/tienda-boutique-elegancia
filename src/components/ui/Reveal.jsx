import React, { useEffect, useRef, useState } from 'react';

export const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (reduced) { setVisible(true); return; }
        const node = ref.current;
        if (!node) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        io.observe(node);
        return () => io.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`${className} transition-all duration-[900ms] ease-out will-change-transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
        >
            {children}
        </Tag>
    );
};
