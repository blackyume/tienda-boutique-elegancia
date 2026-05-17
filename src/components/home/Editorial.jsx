import React from 'react';
import { useStore } from '../../context/StoreContext';

export const Editorial = () => {
    const { siteConfig } = useStore();

    return (
        <div className="relative w-full min-h-[600px] md:h-[80vh] flex flex-col md:flex-row bg-[#020617] text-white">
            {/* Left Content */}
            <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center relative z-10">
                <span className="text-sm font-bold tracking-[0.4em] text-cielo-gold mb-8 uppercase animate-fadeIn">{siteConfig.editorial?.subtitle}</span>
                <h2 className="font-serif text-5xl md:text-7xl leading-tight mb-8">
                    {siteConfig.editorial?.title}
                </h2>
                <p className="text-slate-300 max-w-md leading-relaxed mb-12 font-light text-lg">
                    {siteConfig.editorial?.text}
                </p>

                <div className="flex gap-8">
                    <div className="text-center">
                        <span className="block text-3xl font-serif text-cielo-gold mb-1">01</span>
                        <span className="text-[10px] tracking-widest uppercase">Diseño</span>
                    </div>
                    <div className="w-[1px] h-12 bg-white/10"></div>
                    <div className="text-center">
                        <span className="block text-3xl font-serif text-cielo-gold mb-1">02</span>
                        <span className="text-[10px] tracking-widest uppercase">Confort</span>
                    </div>
                    <div className="w-[1px] h-12 bg-white/10"></div>
                    <div className="text-center">
                        <span className="block text-3xl font-serif text-cielo-gold mb-1">03</span>
                        <span className="text-[10px] tracking-widest uppercase">Futuro</span>
                    </div>
                </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-1/2 relative h-[420px] md:h-full overflow-hidden bg-[#0a0f1e]">
                {/* Scrim sólo del lado del texto + base inferior para la cita */}
                <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#020617] via-[#020617]/30 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 via-transparent to-transparent z-10" />
                {siteConfig.editorial?.image ? (
                    <img
                        src={siteConfig.editorial.image}
                        className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 hover:scale-105 transition-all duration-[2s] ease-out"
                        alt="Editorial Fashion"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-cielo-gold/30 font-cinzel text-2xl tracking-widest">
                        LBE
                    </div>
                )}

                <div className="absolute bottom-12 right-12 z-20 text-right hidden md:block">
                    <p className="font-serif italic text-2xl text-white">"{siteConfig.editorial?.quote}"</p>
                    <span className="text-xs uppercase tracking-widest mt-4 block text-cielo-gold">— {siteConfig.editorial?.quoteAuthor}</span>
                </div>
            </div>
        </div>
    );
};
