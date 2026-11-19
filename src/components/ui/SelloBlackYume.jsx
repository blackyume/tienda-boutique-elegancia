import React from 'react';

// Firma del pie (18/11/2026, pedido del dueño): el emblema de riesgo biológico
// de BlackYume AI girando, en oro y platino. Las medialunas son de oro y el
// anillo de plata; el giro es lento y se apaga con prefers-reduced-motion.
const Emblema = () => (
    <svg viewBox="-50 -50 100 100" className="w-16 h-16 shrink-0 animate-[spin_16s_linear_infinite] motion-reduce:animate-none drop-shadow-[0_0_6px_rgba(232,198,94,0.35)]" aria-hidden="true">
        <defs>
            <linearGradient id="sello-oro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FBEBB0" />
                <stop offset=".45" stopColor="#E8C65E" />
                <stop offset="1" stopColor="#9C7425" />
            </linearGradient>
            <linearGradient id="sello-plata" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset=".5" stopColor="#E4E6EA" />
                <stop offset="1" stopColor="#8B9098" />
            </linearGradient>
            <mask id="sello-hueco">
                <rect x="-50" y="-50" width="100" height="100" fill="white" />
                {[0, 120, 240].map((g) => (
                    <g key={g} transform={`rotate(${g})`}>
                        <circle cx="0" cy="-21" r="11.2" fill="black" />
                        <rect x="-1.3" y="-10.5" width="2.6" height="10.5" fill="black" />
                    </g>
                ))}
                <circle r="4.2" fill="black" />
            </mask>
        </defs>
        <g mask="url(#sello-hueco)">
            {[0, 120, 240].map((g) => (
                <circle key={g} cx="0" cy="-15" r="15" fill="url(#sello-oro)" transform={`rotate(${g})`} />
            ))}
            <circle r="13.5" fill="none" stroke="url(#sello-plata)" strokeWidth="3.2" />
        </g>
    </svg>
);

const SelloBlackYume = () => (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4" aria-label="Powered by BlackYume AI Neuronal Corp">
        <Emblema />
        <div className="leading-none text-center sm:text-left">
            <p className="font-cinzel text-[9px] tracking-[0.42em] uppercase text-plata-400 mb-1.5">Powered by</p>
            <p className="font-cinzel font-bold text-[13px] sm:text-sm tracking-[0.16em] uppercase">
                <span className="bg-gradient-to-r from-[#FBEBB0] via-[#E8C65E] to-[#B08A33] bg-clip-text text-transparent">BlackYume AI</span>{' '}
                <span className="bg-gradient-to-r from-[#FFFFFF] via-[#E4E6EA] to-[#9EA3AB] bg-clip-text text-transparent">Neuronal Corp</span>
            </p>
            <p className="mt-1.5 text-[9px] tracking-[0.28em] uppercase text-plata-600">
                Neural Network Division <span className="text-cielo-gold/70 tracking-normal">神経回路網</span>
            </p>
        </div>
    </div>
);

export default SelloBlackYume;
