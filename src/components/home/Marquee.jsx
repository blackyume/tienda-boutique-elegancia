import React from 'react';
import { useStore } from '../../context/StoreContext';

const Diamond = () => (
    <svg viewBox="0 0 8 8" width="6" height="6" className="mx-5 opacity-60 shrink-0" fill="currentColor" aria-hidden="true">
        <polygon points="4,0 8,4 4,8 0,4" />
    </svg>
);

const MarqueeTrack = ({ segments, className = '' }) => (
    <div className={`flex items-center whitespace-nowrap font-cinzel font-semibold tracking-[0.35em] text-2xs uppercase ${className}`}>
        {segments.map((seg, i) => (
            <React.Fragment key={i}>
                <span>{seg.trim()}</span>
                <Diamond />
            </React.Fragment>
        ))}
    </div>
);

export const Marquee = () => {
    const { siteConfig } = useStore();
    const raw = siteConfig?.marquee || 'La Boutique de la Elegancia - Collection 2026 - Moda Atemporal';
    const segments = Array.from({ length: 6 }, () => raw.split('-')).flat();

    return (
        <div className="relative flex overflow-x-hidden bg-cielo-gold text-black py-3 z-20" aria-hidden="true">
            <div className="flex items-center min-w-full">
                <MarqueeTrack segments={segments} className="animate-marquee" />
            </div>
            <div className="flex items-center min-w-full absolute top-0 left-0 h-full">
                <MarqueeTrack segments={segments} className="animate-marquee2" />
            </div>
        </div>
    );
};
