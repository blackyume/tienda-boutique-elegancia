import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

// WhatsApp glyph oficial
const WhatsAppIcon = ({ className }) => (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
        <path d="M19.11 17.55c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.17.26-.68.86-.84 1.04-.15.17-.31.2-.58.07-.26-.13-1.11-.41-2.12-1.31-.78-.7-1.31-1.56-1.46-1.82-.15-.26-.02-.41.11-.54.12-.12.26-.31.39-.46.13-.16.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.6-1.44-.82-1.98-.22-.53-.44-.45-.6-.46-.16 0-.33-.01-.51-.01-.17 0-.46.07-.7.33-.24.26-.93.91-.93 2.22 0 1.31.96 2.58 1.09 2.76.13.17 1.89 2.89 4.58 4.05.64.28 1.14.44 1.53.57.64.2 1.23.17 1.69.1.52-.08 1.56-.63 1.78-1.25.22-.62.22-1.15.15-1.25-.06-.1-.24-.17-.51-.3zM16.02 5.33c-5.9 0-10.69 4.79-10.69 10.69 0 1.88.49 3.72 1.43 5.34L5.25 26.67l5.45-1.43c1.56.85 3.32 1.3 5.1 1.3h.02c5.9 0 10.69-4.79 10.69-10.69 0-2.85-1.11-5.54-3.13-7.56-2.02-2.02-4.7-3.13-7.56-3.14zm0 19.49c-1.6 0-3.17-.43-4.54-1.24l-.33-.19-3.24.85.86-3.16-.21-.34c-.89-1.41-1.36-3.05-1.36-4.72 0-4.9 3.98-8.89 8.88-8.89 2.37 0 4.6.92 6.28 2.6 1.68 1.68 2.6 3.91 2.6 6.28 0 4.9-3.98 8.88-8.89 8.88z" />
    </svg>
);

export const WhatsAppButton = () => {
    const { siteConfig } = useStore();
    const location = useLocation();
    const [visible, setVisible] = useState(false);
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 1200);
        const t2 = setTimeout(() => setShowTip(true), 5000);
        const t3 = setTimeout(() => setShowTip(false), 11000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') return null;

    const raw = siteConfig?.whatsappNumber || '5491144444444';
    const number = String(raw).replace(/\D/g, '');
    const text = encodeURIComponent(
        '¡Hola! Vi La Boutique de la Elegancia y quería hacer una consulta ✨'
    );
    const href = `https://wa.me/${number}?text=${text}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 group flex flex-col items-end transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
                }`}
        >
            {/* Tooltip elegante (glassmorphism dorado) */}
            <div
                className={`mb-3 origin-bottom-right transition-all duration-400 ${showTip ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="relative bg-slate-900/95 backdrop-blur-xl border border-[#D4AF37]/30 px-4 py-3 rounded-xl rounded-br-none shadow-[0_8px_32px_rgba(0,0,0,0.45)] max-w-[220px]">
                    <p className="text-[11px] font-semibold tracking-wide text-[#D4AF37] mb-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                        Atención Personalizada
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-300">
                        Escribinos por WhatsApp, te asesoramos al instante.
                    </p>
                    {/* Tail */}
                    <span className="absolute -bottom-[6px] right-3 w-3 h-3 rotate-45 bg-slate-900 border-r border-b border-[#D4AF37]/30" />
                </div>
            </div>

            {/* Botón */}
            <div className="relative">
                {/* Anillo dorado sutil */}
                <span className="absolute -inset-1 rounded-full border border-[#D4AF37]/40 animate-pulse" />
                {/* Halo dorado suave */}
                <span className="absolute inset-0 rounded-full bg-[#D4AF37]/30 blur-lg opacity-70 group-hover:opacity-90 transition-opacity" />

                <div className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06] active:scale-95 overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, #FCF6BA 0%, #D4AF37 45%, #B8932E 100%)',
                        boxShadow: '0 8px 24px -6px rgba(212,175,55,0.55), inset 0 1px 0 rgba(255,255,255,0.35)'
                    }}
                >
                    {/* Brillo superior */}
                    <span className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full" />
                    <WhatsAppIcon className="relative w-7 h-7 text-[#0A0A0A]" />
                </div>

                {/* Punto de notificación (estético) */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#0A0A0A] border-2 border-[#D4AF37] shadow" />
            </div>
        </a>
    );
};
