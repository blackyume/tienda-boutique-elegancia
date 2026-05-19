import React from 'react';

// Header de sección único — un solo lenguaje visual para toda la home.
// eyebrow neutro (white/40), título serif con escala fija, subtítulo opcional.
export const SectionHeader = ({ eyebrow, title, subtitle, align = 'center', className = '' }) => {
    const centered = align === 'center';
    return (
        <div className={`${centered ? 'text-center mx-auto' : 'text-left'} ${className}`}>
            {eyebrow && (
                <span className="block text-[11px] uppercase tracking-[0.35em] font-semibold text-white/40">
                    {eyebrow}
                </span>
            )}
            <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-tight text-white">
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-4 text-sm md:text-[15px] font-light leading-relaxed text-slate-400 ${centered ? 'max-w-xl mx-auto' : 'max-w-xl'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};
