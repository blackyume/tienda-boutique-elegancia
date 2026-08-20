import React from 'react';

export const SectionHeader = ({ eyebrow, title, subtitle, align = 'center', className = '', titleClassName = 'text-4xl md:text-5xl lg:text-6xl' }) => {
    const centered = align === 'center';
    return (
        <div className={`${centered ? 'text-center mx-auto' : 'text-left'} ${className}`}>
            {eyebrow && (
                <div className={`flex items-center gap-4 mb-5 ${centered ? 'justify-center' : 'justify-start'}`}>
                    <span className="h-px w-8 bg-cielo-gold/50 flex-shrink-0" />
                    <span className="text-2xs uppercase tracking-[0.4em] font-semibold text-cielo-gold/70 whitespace-nowrap">
                        {eyebrow}
                    </span>
                    <span className="h-px w-8 bg-cielo-gold/50 flex-shrink-0" />
                </div>
            )}
            <h2 className={`font-serif leading-tight text-white ${titleClassName}`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-5 text-sm md:text-base font-light leading-relaxed text-white/55 ${centered ? 'mx-auto' : ''} max-w-xl`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};
