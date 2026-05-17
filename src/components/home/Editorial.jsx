import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export const Editorial = () => {
    const { siteConfig } = useStore();
    const [imgOk, setImgOk] = useState(true);
    const editorialImg = siteConfig.editorial?.image;

    return (
        <div className="relative w-full min-h-[600px] md:h-[80vh] flex flex-col md:flex-row bg-[#020617] text-white">
            {/* Left Content */}
            <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center relative z-10">
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 mb-8 uppercase animate-fadeIn">{siteConfig.editorial?.subtitle}</span>
                <h2 className="font-serif text-5xl md:text-7xl leading-tight mb-8">
                    {siteConfig.editorial?.title}
                </h2>
                <p className="text-slate-300 max-w-md leading-relaxed mb-12 font-light text-lg">
                    {siteConfig.editorial?.text}
                </p>

                <div className="flex gap-8">
                    <div className="text-center">
                        <span className="block text-3xl font-serif text-white/30 mb-1">01</span>
                        <span className="text-[10px] tracking-widest uppercase">Diseño</span>
                    </div>
                    <div className="w-[1px] h-12 bg-white/10"></div>
                    <div className="text-center">
                        <span className="block text-3xl font-serif text-white/30 mb-1">02</span>
                        <span className="text-[10px] tracking-widest uppercase">Confort</span>
                    </div>
                    <div className="w-[1px] h-12 bg-white/10"></div>
                    <div className="text-center">
                        <span className="block text-3xl font-serif text-white/30 mb-1">03</span>
                        <span className="text-[10px] tracking-widest uppercase">Futuro</span>
                    </div>
                </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-1/2 relative h-[420px] md:h-full overflow-hidden bg-[#0a0f1e]">
                {/* Scrim sólo del lado del texto + base inferior para la cita */}
                <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#020617] via-[#020617]/30 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 via-transparent to-transparent z-10" />
                {editorialImg && imgOk ? (
                    <img
                        src={editorialImg}
                        className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 hover:scale-105 transition-all duration-[2s] ease-out"
                        alt="Editorial Fashion"
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgOk(false)}
                    />
                ) : (
                    // Fallback premium si la imagen falla/falta (no <img> roto)
                    <div
                        className="w-full h-full flex flex-col items-center justify-center gap-5"
                        style={{ background: 'radial-gradient(circle at 60% 40%, rgba(193,154,107,0.18), transparent 60%), linear-gradient(135deg, #0a0f1e 0%, #020617 60%, #0a0f1e 100%)' }}
                    >
                        <span className="font-cinzel text-6xl tracking-[0.2em] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">LBE</span>
                        <span className="text-[10px] uppercase tracking-[0.5em] text-cielo-gold/60">La Boutique de la Elegancia</span>
                    </div>
                )}

                <div className="absolute bottom-12 right-12 z-20 text-right hidden md:block">
                    <p className="font-serif italic text-2xl text-white">"{siteConfig.editorial?.quote}"</p>
                    <span className="text-xs uppercase tracking-widest mt-4 block text-white/50">— {siteConfig.editorial?.quoteAuthor}</span>
                </div>
            </div>
        </div>
    );
};
