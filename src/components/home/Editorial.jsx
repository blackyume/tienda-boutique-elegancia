import React from 'react';
import { useStore } from '../../context/StoreContext';

export const Editorial = () => {
    const { siteConfig } = useStore();

    return (
        <div className="relative w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#020617] text-white">
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
            <div className="w-full md:w-1/2 relative h-[500px] md:h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent z-10" />
                <img
                    src={siteConfig.editorial?.image}
                    className="w-full h-full object-cover grayscale opacity-60 hover:scale-105 transition-transform duration-[2s]"
                    alt="Editorial Fashion"
                />

                <div className="absolute bottom-12 right-12 z-20 text-right hidden md:block">
                    <p className="font-serif italic text-2xl text-white">"{siteConfig.editorial?.quote}"</p>
                    <span className="text-xs uppercase tracking-widest mt-4 block text-cielo-gold">— {siteConfig.editorial?.quoteAuthor}</span>
                </div>
            </div>
        </div>
    );
};
