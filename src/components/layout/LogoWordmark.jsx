import React from 'react';
import { Link } from 'react-router-dom';

export const LogoWordmark = ({ to = '/', onClick, size = 'md', className = '' }) => {
    const sizes = {
        sm:  { title: 'text-xs',   sub: 'text-[7px]',  gap: 'mt-0.5',  line: 'w-full my-0.5' },
        md:  { title: 'text-sm',   sub: 'text-[8px]',  gap: 'mt-0.5',  line: 'w-full my-0.5' },
        lg:  { title: 'text-lg',   sub: 'text-[10px]', gap: 'mt-1',    line: 'w-full my-1'   },
        xl:  { title: 'text-2xl',  sub: 'text-xs',     gap: 'mt-1',    line: 'w-full my-1'   },
    };
    const s = sizes[size] || sizes.md;

    return (
        <Link to={to} onClick={onClick} className={`group flex flex-col items-start select-none ${className}`}>
            <span
                className={`font-cinzel font-bold tracking-[0.22em] leading-none whitespace-nowrap ${s.title}`}
                style={{
                    background: 'linear-gradient(90deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                LA BOUTIQUE
            </span>
            <div className={`flex items-center gap-1.5 ${s.line}`}>
                <span className="h-px flex-1 bg-gradient-to-r from-cielo-gold/50 to-transparent" />
                <span className="w-0.5 h-0.5 rounded-full bg-cielo-gold/40 shrink-0" />
            </div>
            <span
                className={`font-serif italic font-light tracking-[0.18em] leading-none whitespace-nowrap transition-opacity duration-300 group-hover:opacity-80 ${s.sub}`}
                style={{ color: 'rgba(193,154,107,0.65)' }}
            >
                de la Elegancia
            </span>
        </Link>
    );
};
