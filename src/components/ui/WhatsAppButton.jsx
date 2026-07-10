import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

// Glyph oficial de Telegram
const TelegramIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M21.94 4.66a1.3 1.3 0 0 0-1.32-.2L3.4 11.2c-.86.34-.85 1.57.02 1.9l4.2 1.55 1.62 5.04c.2.6.96.78 1.4.32l2.36-2.45 4.2 3.1c.5.36 1.2.1 1.34-.5l3.2-14.5a1.3 1.3 0 0 0-.4-1zM9.7 14.1l8.2-5.1c.16-.1.33.12.19.25l-6.7 6.1c-.24.22-.39.52-.44.85l-.23 1.6-.99-3.08a.7.7 0 0 1 .28-.77z" />
    </svg>
);

// Botón flotante de contacto por Telegram. WhatsApp quedó retirado de la tienda.
// Aparece SOLO si hay un Telegram configurado (siteConfig.social.telegram), así
// nunca queda un link muerto.
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

    // Normaliza el Telegram a un link t.me. Acepta "@usuario", "usuario" o "t.me/usuario".
    const tgRaw = (siteConfig?.social?.telegram || siteConfig?.telegram || '').trim();
    if (!tgRaw) return null; // sin Telegram cargado → no mostramos botón (WhatsApp ya no va)
    const href = tgRaw.startsWith('http')
        ? tgRaw
        : `https://t.me/${tgRaw.replace(/^@/, '').replace(/^t\.me\//, '')}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por Telegram"
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
                        Escribinos por Telegram, te asesoramos al instante.
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
                    <TelegramIcon className="relative w-7 h-7 text-[#0A0A0A]" />
                </div>
            </div>
        </a>
    );
};
