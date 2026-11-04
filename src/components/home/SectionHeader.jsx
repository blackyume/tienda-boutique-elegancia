import React from 'react';
import { Rombo } from '../ui/Ornamento';

export const SectionHeader = ({ eyebrow, title, subtitle, align = 'center', className = '', titleClassName = 'text-4xl md:text-5xl lg:text-6xl', marfil = false }) => {
    const centered = align === 'center';
    const oro = marfil ? 'bg-marfil-oro' : 'bg-cielo-gold/70';
    return (
        <div className={`${centered ? 'text-center mx-auto' : 'text-left'} ${className}`}>
            {eyebrow && (
                <div className={`flex items-center gap-4 mb-5 ${centered ? 'justify-center' : 'justify-start'}`}>
                    <Rombo className={oro} />
                    <span className={`text-2xs uppercase tracking-[0.4em] font-semibold whitespace-nowrap ${marfil ? 'text-marfil-oro' : 'text-cielo-gold/70'}`}>
                        {eyebrow}
                    </span>
                    {centered && <Rombo className={oro} />}
                </div>
            )}
            <h2 className={`font-serif leading-tight ${marfil ? 'text-marfil-tinta' : 'text-noche-100'} ${titleClassName}`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-5 text-sm md:text-base font-light leading-relaxed ${marfil ? 'text-marfil-tinta/75' : 'text-noche-300/85'} ${centered ? 'mx-auto' : ''} max-w-xl`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};
