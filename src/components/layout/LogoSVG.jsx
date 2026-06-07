import React from 'react';
import { Link } from 'react-router-dom';

// Gradiente de oro metálico (vertical: luz arriba, brillo al medio, sombra abajo)
// + brillo "shimmer" que recorre el texto muy lento para un efecto de lujo sutil.
const GoldDefs = ({ uid, shineFrom = -120, shineTo = 380 }) => (
    <defs>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBEFA8" />
            <stop offset="22%" stopColor="#D4AF37" />
            <stop offset="46%" stopColor="#FFF7CC" />
            <stop offset="55%" stopColor="#EFD98C" />
            <stop offset="78%" stopColor="#AE882C" />
            <stop offset="100%" stopColor="#8C6A22" />
        </linearGradient>
        {/* Brillo que se desliza */}
        <linearGradient id={`${uid}-shine`} gradientUnits="userSpaceOnUse" x1={shineFrom} y1="0" x2={shineFrom + 80} y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fffdf2" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            <animate attributeName="x1" values={`${shineFrom};${shineTo}`} dur="6s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="x2" values={`${shineFrom + 80};${shineTo + 80}`} dur="6s" begin="1.2s" repeatCount="indefinite" />
        </linearGradient>
        <linearGradient id={`${uid}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="30%" stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-line2`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#FCF6BA" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.5" />
        </linearGradient>
    </defs>
);

const GOLD_SHADOW = { filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.45))', overflow: 'visible' };

export const LogoSVG = ({ to = '/', onClick, width = 210, className = '' }) => {
    const uid = 'lg1';
    return (
        <Link to={to} onClick={onClick} className={`shrink-0 block group ${className}`} aria-label="La Boutique de la Elegancia">
            <svg
                viewBox="0 0 340 100"
                width={width}
                height={Math.round(width * 100 / 340)}
                xmlns="http://www.w3.org/2000/svg"
                style={GOLD_SHADOW}
            >
                <GoldDefs uid={uid} shineFrom={-120} shineTo={380} />

                {/* Top hairline */}
                <line x1="0" y1="6" x2="340" y2="6" stroke={`url(#${uid}-line)`} strokeWidth="0.5" />

                {/* LA BOUTIQUE — oro metálico + brillo encima */}
                <text x="170" y="50" fontFamily="Cinzel, 'Times New Roman', serif" fontSize="33" fontWeight="700" letterSpacing="9" textAnchor="middle" fill={`url(#${uid}-gold)`}>LA BOUTIQUE</text>
                <text x="170" y="50" fontFamily="Cinzel, 'Times New Roman', serif" fontSize="33" fontWeight="700" letterSpacing="9" textAnchor="middle" fill={`url(#${uid}-shine)`} style={{ pointerEvents: 'none' }}>LA BOUTIQUE</text>

                {/* Ornamental row */}
                <line x1="18" y1="60" x2="141" y2="60" stroke={`url(#${uid}-line2)`} strokeWidth="0.55" />
                <polygon points="170,53 175,60 170,67 165,60" fill="#D4AF37" opacity="0.65" />
                <line x1="199" y1="60" x2="322" y2="60" stroke={`url(#${uid}-line2)`} strokeWidth="0.55" />

                {/* de la Elegancia */}
                <text x="170" y="84" fontFamily="'Bodoni Moda', 'Playfair Display', Georgia, serif" fontSize="14.5" fontStyle="italic" fontWeight="300" letterSpacing="5.5" textAnchor="middle" fill="#E8C766" opacity="0.85">de la Elegancia</text>

                {/* Bottom hairline */}
                <line x1="0" y1="96" x2="340" y2="96" stroke={`url(#${uid}-line)`} strokeWidth="0.5" />
            </svg>
        </Link>
    );
};

export const LogoSVGFooter = ({ width = 260, className = '' }) => {
    const uid = 'lg2';
    return (
        <svg
            viewBox="0 0 380 110"
            width={width}
            height={Math.round(width * 110 / 380)}
            xmlns="http://www.w3.org/2000/svg"
            aria-label="La Boutique de la Elegancia"
            className={className}
            style={GOLD_SHADOW}
        >
            <GoldDefs uid={uid} shineFrom={-130} shineTo={420} />

            {/* Corner ornaments */}
            <line x1="0" y1="0" x2="18" y2="0" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="0" y1="0" x2="0" y2="18" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="380" y1="0" x2="362" y2="0" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="380" y1="0" x2="380" y2="18" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="0" y1="110" x2="18" y2="110" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="0" y1="110" x2="0" y2="92" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="380" y1="110" x2="362" y2="110" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
            <line x1="380" y1="110" x2="380" y2="92" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />

            {/* LA BOUTIQUE — oro metálico + brillo */}
            <text x="190" y="56" fontFamily="Cinzel, 'Times New Roman', serif" fontSize="36" fontWeight="700" letterSpacing="10" textAnchor="middle" fill={`url(#${uid}-gold)`}>LA BOUTIQUE</text>
            <text x="190" y="56" fontFamily="Cinzel, 'Times New Roman', serif" fontSize="36" fontWeight="700" letterSpacing="10" textAnchor="middle" fill={`url(#${uid}-shine)`} style={{ pointerEvents: 'none' }}>LA BOUTIQUE</text>

            {/* Ornamental row */}
            <line x1="22" y1="67" x2="152" y2="67" stroke={`url(#${uid}-line)`} strokeWidth="0.55" />
            <polygon points="190,60 195,67 190,74 185,67" fill="#D4AF37" opacity="0.65" />
            <line x1="228" y1="67" x2="358" y2="67" stroke={`url(#${uid}-line)`} strokeWidth="0.55" />

            {/* de la Elegancia */}
            <text x="190" y="92" fontFamily="'Bodoni Moda', 'Playfair Display', Georgia, serif" fontSize="15.5" fontStyle="italic" fontWeight="300" letterSpacing="6" textAnchor="middle" fill="#E8C766" opacity="0.82">de la Elegancia</text>
        </svg>
    );
};
