import React from 'react';

// Insignias de medios de pago y envío con los LOGOS OFICIALES (archivos en
// public/brands/). Van en chips blancos para que los logos a color resalten
// sobre el fondo oscuro de la tienda.

const GOLD_BG = { background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)' };

export const MercadoPagoBadge = ({ className = '' }) => (
    <span style={GOLD_BG} className={`inline-flex items-center rounded-lg px-4 py-2.5 shadow-md ${className}`}>
        <img src="/brands/mercadopago.svg" alt="Mercado Pago" className="h-6 w-auto" loading="lazy" />
    </span>
);

export const CorreoArgentinoBadge = ({ className = '' }) => (
    <span style={GOLD_BG} className={`inline-flex items-center rounded-lg px-4 py-2.5 shadow-md ${className}`}>
        <img src="/brands/correo-argentino.svg" alt="Correo Argentino" className="h-7 w-auto" loading="lazy" />
    </span>
);

// Tira combinada lista para footer / checkout.
export const BrandStrip = ({ className = '' }) => (
    <div className={`flex flex-col items-center gap-2.5 ${className}`}>
        <div className="flex flex-wrap items-center justify-center gap-3">
            <MercadoPagoBadge />
            <CorreoArgentinoBadge />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Envíos a todo el país</span>
    </div>
);
