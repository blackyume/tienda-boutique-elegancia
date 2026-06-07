import React from 'react';

// Insignias de medios de pago y envío (Mercado Pago + Correo Argentino).
// Hechas con los colores oficiales de cada marca, en chips blancos para que
// se vean prolijas sobre fondo oscuro o claro.
//
// 👉 Si querés usar el ARCHIVO oficial exacto (PNG/SVG): dejá la imagen en
//    public/brands/ (ej. public/brands/mercadopago.svg) y reemplazá el bloque
//    <svg>…</svg> por <img src="/brands/mercadopago.svg" alt="Mercado Pago" className="h-5" />.

// Isologo Mercado Pago: óvalo celeste con "apretón de manos" en blanco.
const MpIso = ({ className = '' }) => (
    <svg viewBox="0 0 40 28" className={className} aria-hidden="true">
        <rect x="0.5" y="0.5" width="39" height="27" rx="13.5" fill="#009EE3" />
        <path
            d="M20 7.4c-3.7 0-7.6 1.9-7.6 5 0 .9.5 1.6 1.3 1.9.7.3 1.4.1 2.2-.3l3.2-1.7c.3-.2.7-.2 1 0l4.6 2.6c.5.3.7.9.4 1.4-.2.4-.7.6-1.2.4l-2.6-1.2c-.3-.1-.6 0-.7.3-.1.3 0 .6.3.7l2.6 1.2c.1.1.3.1.4.2-.4.6-1.5 1.5-3.9 1.5-1.4 0-2.7-.4-3.6-.9-.3-.2-.7-.1-.9.2-.2.3-.1.7.2.9 1.1.7 2.7 1.1 4.3 1.1 3.9 0 5.6-1.9 5.9-2.5.6-.1 1.1-.5 1.4-1 .5-.9.2-2.1-.8-2.6l-4.6-2.6c-.7-.4-1.6-.4-2.3 0L16 11.2c-.3.2-.6.2-.8.1-.2-.1-.3-.2-.3-.5 0-1.4 2.6-3 5.1-3 1.9 0 3.4.6 4.2 1.1.3.2.7.1.9-.2.2-.3.1-.7-.2-.9-1-.6-2.7-1.4-4.9-1.4Z"
            fill="#fff"
        />
    </svg>
);

export const MercadoPagoBadge = ({ className = '' }) => (
    <span className={`inline-flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm ${className}`}>
        <MpIso className="h-5 w-auto" />
        <span className="font-sans font-bold text-[#2D3277] text-sm leading-none tracking-tight">Mercado&nbsp;Pago</span>
    </span>
);

// Isologo Correo Argentino: pájaro/sobre estilizado en azul + celeste.
const CorreoIso = ({ className = '' }) => (
    <svg viewBox="0 0 32 28" className={className} aria-hidden="true">
        <path d="M3 8.5 16 3l13 5.5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11Z" fill="#0A3D91" />
        <path d="M3.6 8.2 16 13.7l12.4-5.5L16 3 3.6 8.2Z" fill="#1CA9E2" />
        <path d="M3 8.6 16 14l13-5.4v1.5L16 15.5 3 10.1V8.6Z" fill="#fff" opacity="0.85" />
    </svg>
);

export const CorreoArgentinoBadge = ({ className = '' }) => (
    <span className={`inline-flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm ${className}`}>
        <CorreoIso className="h-5 w-auto" />
        <span className="leading-none">
            <span className="block font-sans font-bold text-[#0A3D91] text-sm tracking-tight">Correo&nbsp;Argentino</span>
            <span className="block text-[9px] uppercase tracking-[0.12em] text-[#1CA9E2] font-semibold mt-0.5">Envíos a todo el país</span>
        </span>
    </span>
);

// Tira combinada lista para footer / checkout.
export const BrandStrip = ({ className = '' }) => (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
        <MercadoPagoBadge />
        <CorreoArgentinoBadge />
    </div>
);
