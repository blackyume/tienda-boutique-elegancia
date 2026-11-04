import React from 'react';

// Insignias de medios de pago y envío con los LOGOS OFICIALES (archivos en
// public/brands/, con el viewBox recortado al dibujo). Las dos miden igual y los
// logos ocupan lo mismo: los dos son 4:1. Antes Mercado Pago traía aire adentro
// del archivo y se veía la mitad que Correo Argentino.
const Insignia = ({ src, alt }) => (
    <span className="btn-oro flex items-center justify-center h-16 md:h-[4.5rem] rounded-lg shadow-md">
        <img src={src} alt={alt} className="w-[70%] h-auto" loading="lazy" />
    </span>
);

export const MercadoPagoBadge = () => <Insignia src="/brands/mercadopago.svg" alt="Mercado Pago" />;

export const CorreoArgentinoBadge = () => <Insignia src="/brands/correo-argentino.svg" alt="Correo Argentino" />;

// Tira combinada lista para footer / checkout.
export const BrandStrip = ({ className = '' }) => (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className="grid grid-cols-2 gap-3 w-full max-w-[24rem]">
            <MercadoPagoBadge />
            <CorreoArgentinoBadge />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Envíos a todo el país</span>
    </div>
);
