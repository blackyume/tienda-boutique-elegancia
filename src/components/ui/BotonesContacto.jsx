import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { telegramDeConfig, whatsappDeConfig } from '../../utils/contacto';

const IconoTelegram = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M21.94 4.66a1.3 1.3 0 0 0-1.32-.2L3.4 11.2c-.86.34-.85 1.57.02 1.9l4.2 1.55 1.62 5.04c.2.6.96.78 1.4.32l2.36-2.45 4.2 3.1c.5.36 1.2.1 1.34-.5l3.2-14.5a1.3 1.3 0 0 0-.4-1zM9.7 14.1l8.2-5.1c.16-.1.33.12.19.25l-6.7 6.1c-.24.22-.39.52-.44.85l-.23 1.6-.99-3.08a.7.7 0 0 1 .28-.77z" />
    </svg>
);

const IconoWhatsApp = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 0 16.48z" />
    </svg>
);

const Burbuja = ({ href, etiqueta, children, retraso }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={etiqueta}
        className="group/btn relative block"
        style={{ transitionDelay: `${retraso}ms` }}
    >
        <span className="absolute -inset-1 rounded-full border border-[#D4AF37]/40 animate-pulse" />
        <span className="absolute inset-0 rounded-full bg-[#D4AF37]/30 blur-lg opacity-70 group-hover/btn:opacity-90 transition-opacity" />
        <div
            className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover/btn:scale-[1.06] active:scale-95 overflow-hidden"
            style={{
                background: 'linear-gradient(145deg, #FCF6BA 0%, #D4AF37 45%, #B8932E 100%)',
                boxShadow: '0 8px 24px -6px rgba(212,175,55,0.55), inset 0 1px 0 rgba(255,255,255,0.35)'
            }}
        >
            <span className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full" />
            {children}
        </div>
    </a>
);

// Botones flotantes de contacto: Telegram y WhatsApp conviven.
// Cada uno aparece SOLO si su dato esta cargado, asi nunca queda un link
// muerto ni se manda a la clienta a un numero que no es de la tienda.
export const BotonesContacto = () => {
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

    const telegram = telegramDeConfig(siteConfig);
    const whatsapp = whatsappDeConfig(siteConfig);
    if (!telegram && !whatsapp) return null;

    return (
        <div
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 group flex flex-col items-end gap-3 transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        >
            <div className={`origin-bottom-right transition-all duration-400 ${showTip ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
                <div className="relative bg-slate-900/95 backdrop-blur-xl border border-[#D4AF37]/30 px-4 py-3 rounded-xl rounded-br-none shadow-[0_8px_32px_rgba(0,0,0,0.45)] max-w-[220px]">
                    <p className="text-[11px] font-semibold tracking-wide text-[#D4AF37] mb-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                        Atención Personalizada
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-300">
                        {telegram && whatsapp
                            ? 'Escribinos por Telegram o WhatsApp, te asesoramos al instante.'
                            : `Escribinos por ${telegram ? 'Telegram' : 'WhatsApp'}, te asesoramos al instante.`}
                    </p>
                    <span className="absolute -bottom-[6px] right-3 w-3 h-3 rotate-45 bg-slate-900 border-r border-b border-[#D4AF37]/30" />
                </div>
            </div>

            {telegram && (
                <Burbuja href={telegram} etiqueta="Contactar por Telegram" retraso={0}>
                    <IconoTelegram className="relative w-7 h-7 text-[#1C1F25]" />
                </Burbuja>
            )}
            {whatsapp && (
                <Burbuja href={whatsapp} etiqueta="Contactar por WhatsApp" retraso={80}>
                    <IconoWhatsApp className="relative w-7 h-7 text-[#1C1F25]" />
                </Burbuja>
            )}
        </div>
    );
};
