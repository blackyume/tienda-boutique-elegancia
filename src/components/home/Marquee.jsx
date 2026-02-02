import React from 'react';
import { useStore } from '../../context/StoreContext';

const MarqueeItem = ({ text }) => (
    <div className="flex items-center">
        {text.split('•').map((segment, i) => (
            <React.Fragment key={i}>
                <span className="mx-4">{segment.trim()}</span>
                <span className="mx-4">•</span>
            </React.Fragment>
        ))}
    </div>
);

export const Marquee = () => {
    const { siteConfig } = useStore();
    const text = siteConfig.marquee || "La Boutique de la Elegancia • Collection 2026";

    return (
        <div className="relative flex overflow-x-hidden bg-cielo-gold text-black py-3 border-y border-white/10 z-20">
            <div className="animate-marquee whitespace-nowrap flex font-bold tracking-[0.3em] text-xs uppercase">
                <MarqueeItem text={text} />
                <MarqueeItem text={text} />
                <MarqueeItem text={text} />
            </div>

            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex font-bold tracking-[0.3em] text-xs uppercase">
                <MarqueeItem text={text} />
                <MarqueeItem text={text} />
                <MarqueeItem text={text} />
            </div>
        </div>
    );
};
