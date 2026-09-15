import { LogoSVGFooter } from './LogoSVG';
import React, { useState } from 'react';
import { Instagram, Mail, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { whatsappDeConfig } from '../../utils/contacto';
import { RegretModal } from './RegretModal';
import { BrandStrip } from '../ui/BrandBadges';

// Cuenta oficial de Instagram (default si no hay nada cargado en config).
const OFFICIAL_IG = 'https://www.instagram.com/laboutiquedelaeleganciaoficial/';

const FooterHeading = ({ children }) => (
    <h4 className="font-cinzel text-2xs uppercase tracking-[0.35em] text-cielo-gold/80 mb-6 flex items-center gap-3">
        <span className="h-px w-5 bg-cielo-gold/40" />
        {children}
    </h4>
);

const SocialBtn = ({ href, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-noche-300/80 hover:text-cielo-gold hover:border-cielo-gold/50 transition-all duration-300"
    >
        {children}
    </a>
);

export const Footer = () => {
    const { setIsSizeGuideOpen, siteConfig } = useStore();
    const [isRegretOpen, setIsRegretOpen] = useState(false);


    return (
        <footer className="bg-cielo-dark text-white border-t border-white/[0.05] mt-auto">
            <RegretModal isOpen={isRegretOpen} onClose={() => setIsRegretOpen(false)} />

            {/* Línea dorada superior */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cielo-gold/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                    {/* Brand — 3 cols */}
                    <div className="md:col-span-3">
                        <LogoSVGFooter width={240} className="mb-6 opacity-95" />
                        <p className="text-noche-300/80 text-sm font-light leading-relaxed mb-8 max-w-xs">
                            Moda femenina elegida con criterio.
                            Rafaela, Santa Fe. Env&iacute;os a todo el pa&iacute;s.
                        </p>
                        <div className="flex gap-3">
                            {/* Instagram: siempre visible, apunta a la cuenta oficial */}
                            <SocialBtn href={siteConfig?.social?.instagram || OFFICIAL_IG}>
                                <Instagram className="w-4 h-4" />
                            </SocialBtn>
                            {/* Telegram: aparece cuando se carga el usuario en config. WhatsApp retirado. */}
                            {(siteConfig?.social?.telegram || siteConfig?.telegram) && (
                                <SocialBtn href={`https://t.me/${String(siteConfig?.social?.telegram || siteConfig?.telegram).replace(/^@/, '').replace(/^t\.me\//, '')}`}>
                                    <Send className="w-4 h-4" />
                                </SocialBtn>
                            )}
                        </div>
                    </div>

                    {/* Tienda — 2 cols */}
                    <div className="md:col-span-2">
                        <FooterHeading>Tienda</FooterHeading>
                        <ul className="space-y-3">
                            {[
                                { to: '/', label: 'Inicio' },
                                { to: '/shop', label: 'Ver Tienda' },
                                { to: '/about', label: 'Quiénes Somos' },
                            ].map(({ to, label }) => (
                                <li key={label}>
                                    <Link to={to} className="text-sm text-noche-300/80 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group">
                                        <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                        <span>{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Ayuda — 2 cols */}
                    <div className="md:col-span-2">
                        <FooterHeading>Ayuda</FooterHeading>
                        <ul className="space-y-3">
                            {[
                                { to: '/tracking', label: 'Seguimiento' },
                                { to: '/envios', label: 'Envíos y Devoluciones' },
                                { to: '/faq', label: 'Preguntas Frecuentes' },
                                { to: '/contacto', label: 'Contacto' },
                                { action: () => setIsSizeGuideOpen(true), label: 'Tabla de Talles' },
                            ].map(({ to, action, label }) => (
                                <li key={label}>
                                    {to ? (
                                        <Link
                                            to={to}
                                            className="text-sm text-noche-300/80 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                            <span>{label}</span>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={action}
                                            className="text-sm text-noche-300/80 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group text-left"
                                        >
                                            <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                            {label}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal — 2 cols */}
                    <div className="md:col-span-2">
                        <FooterHeading>Legal</FooterHeading>
                        <ul className="space-y-3">
                            {[
                                { to: '/terms', label: 'Términos' },
                                { to: '/privacy', label: 'Privacidad' },
                                { href: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario', label: 'Defensa al Consumidor' },
                            ].map(({ to, href, label }) => (
                                <li key={label}>
                                    {to ? (
                                        <Link
                                            to={to}
                                            className="text-sm text-noche-300/80 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                            <span>{label}</span>
                                        </Link>
                                    ) : (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-noche-300/80 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                            <span>{label}</span>
                                        </a>
                                    )}
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => setIsRegretOpen(true)}
                                    className="text-sm text-noche-300/80 hover:text-rose-400 transition-colors duration-200 flex items-center gap-2 group text-left"
                                >
                                    <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-rose-400/60 transition-all duration-300" />
                                    Bot&oacute;n Arrepentimiento
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto — 3 cols */}
                    <div className="md:col-span-3">
                        <FooterHeading>Contacto</FooterHeading>
                        <p className="text-sm text-noche-300/80 font-light mb-5 leading-relaxed">
                            Dudas con un talle, un pedido o un env&iacute;o: escribinos, contesta una persona.
                        </p>
                        <div className="space-y-3">
                            <a
                                href={whatsappDeConfig(siteConfig, 'Hola! Tengo una consulta.')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-noche-300/80 hover:text-white transition-colors group"
                            >
                                <span className="w-7 h-7 rounded-full border border-white/10 group-hover:border-cielo-gold/50 flex items-center justify-center group-hover:text-cielo-gold transition-all">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                </span>
                                WhatsApp
                            </a>
                            {(siteConfig?.social?.telegram || siteConfig?.telegram) && (
                                <a
                                    href={`https://t.me/${String(siteConfig?.social?.telegram || siteConfig?.telegram).replace(/^@/, '').replace(/^t\.me\//, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm text-noche-300/80 hover:text-white transition-colors group"
                                >
                                    <span className="w-7 h-7 rounded-full border border-white/10 group-hover:border-cielo-gold/50 flex items-center justify-center group-hover:text-cielo-gold transition-all">
                                        <Send className="w-3.5 h-3.5" />
                                    </span>
                                    Telegram
                                </a>
                            )}
                            <a
                                href={`mailto:${siteConfig?.contact?.email || 'hola@laboutique.com.ar'}`}
                                className="flex items-center gap-3 text-sm text-noche-300/80 hover:text-white transition-colors group"
                            >
                                <span className="w-7 h-7 rounded-full border border-white/10 group-hover:border-cielo-gold/50 flex items-center justify-center group-hover:text-cielo-gold transition-all">
                                    <Mail className="w-3.5 h-3.5" />
                                </span>
                                Email
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-8" />

                {/* Medios de pago y envío */}
                <div className="flex flex-col items-center gap-3 mb-10">
                    <span className="text-2xs uppercase tracking-[0.25em] text-noche-300/70">Medios de pago y envío</span>
                    <BrandStrip />
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-2xs text-noche-300/70 tracking-[0.2em] uppercase">
                        &copy; 2026 La Boutique de la Elegancia &nbsp;&middot;&nbsp; Todos los derechos reservados
                    </span>
                    <span className="text-2xs text-noche-300/70 tracking-[0.25em] uppercase">
                        Moda femenina &nbsp;&middot;&nbsp; Hecho en Argentina
                    </span>
                </div>
            </div>

            {/* Línea dorada inferior */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cielo-gold/20 to-transparent" />
        </footer>
    );
};
