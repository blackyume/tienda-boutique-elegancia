import { LogoSVGFooter } from './LogoSVG';
import React, { useState } from 'react';
import { Instagram, Youtube, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { RegretModal } from './RegretModal';
import { BrandStrip } from '../ui/BrandBadges';


const TikTokIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

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
        className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-cielo-gold hover:border-cielo-gold/50 transition-all duration-300"
    >
        {children}
    </a>
);

export const Footer = () => {
    const { setIsSizeGuideOpen, siteConfig } = useStore();
    const [isRegretOpen, setIsRegretOpen] = useState(false);
    const [email, setEmail] = useState('');

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
                        <p className="text-white/40 text-sm font-light leading-relaxed mb-8 max-w-xs">
                            Moda atemporal dise&ntilde;ada para la mujer moderna.
                            Cada pieza cuenta una historia de lujo silencioso,
                            hecha con intenci&oacute;n desde Rafaela para el mundo.
                        </p>
                        <div className="flex gap-3">
                            {siteConfig?.social?.instagram && (
                                <SocialBtn href={siteConfig.social.instagram}>
                                    <Instagram className="w-4 h-4" />
                                </SocialBtn>
                            )}
                            {siteConfig?.social?.youtube && (
                                <SocialBtn href={siteConfig.social.youtube}>
                                    <Youtube className="w-4 h-4" />
                                </SocialBtn>
                            )}
                            {siteConfig?.social?.tiktok && (
                                <SocialBtn href={siteConfig.social.tiktok}>
                                    <TikTokIcon className="w-4 h-4" />
                                </SocialBtn>
                            )}
                            {siteConfig?.contact?.whatsapp && (
                                <SocialBtn href={`https://wa.me/${siteConfig.contact.whatsapp}`}>
                                    <MessageCircle className="w-4 h-4" />
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
                                    <Link to={to} className="text-sm text-white/40 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group">
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
                                            className="text-sm text-white/40 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                            <span>{label}</span>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={action}
                                            className="text-sm text-white/40 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group text-left"
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
                                            className="text-sm text-white/40 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-cielo-gold/60 transition-all duration-300" />
                                            <span>{label}</span>
                                        </Link>
                                    ) : (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-white/40 hover:text-cielo-gold transition-colors duration-200 flex items-center gap-2 group"
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
                                    className="text-sm text-white/40 hover:text-rose-400 transition-colors duration-200 flex items-center gap-2 group text-left"
                                >
                                    <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-rose-400/60 transition-all duration-300" />
                                    Bot&oacute;n Arrepentimiento
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter — 3 cols */}
                    <div className="md:col-span-3">
                        <FooterHeading>Newsletter</FooterHeading>
                        <p className="text-sm text-white/35 font-light mb-5 leading-relaxed">
                            Novedades, lanzamientos y acceso prioritario a nuevas colecciones.
                        </p>
                        <div className="relative">
                            <div className="flex items-center border border-white/10 hover:border-cielo-gold/30 focus-within:border-cielo-gold/50 transition-colors duration-300 bg-white/[0.03]">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                                />
                                <button
                                    onClick={() => email && setEmail('')}
                                    className="px-4 py-3 text-white/40 hover:text-cielo-gold transition-colors"
                                    aria-label="Suscribirse"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-2xs text-white/20 mt-3 tracking-wide">Sin spam. Cancelar cuando quieras.</p>

                        {/* Contact */}
                        <div className="mt-8 space-y-3">
                            <a
                                href="https://wa.me/5493492216487"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-white/35 hover:text-white transition-colors group"
                            >
                                <span className="w-7 h-7 rounded-full border border-white/10 group-hover:border-green-400/40 flex items-center justify-center group-hover:text-green-400 transition-all">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                </span>
                                WhatsApp
                            </a>
                            <a
                                href={`mailto:${siteConfig?.contact?.email || 'hola@laboutique.com.ar'}`}
                                className="flex items-center gap-3 text-sm text-white/35 hover:text-white transition-colors group"
                            >
                                <span className="w-7 h-7 rounded-full border border-white/10 group-hover:border-blue-400/40 flex items-center justify-center group-hover:text-blue-400 transition-all">
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
                    <span className="text-2xs uppercase tracking-[0.25em] text-white/30">Medios de pago y envío</span>
                    <BrandStrip />
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-2xs text-white/20 tracking-[0.2em] uppercase">
                        &copy; 2026 La Boutique de la Elegancia &nbsp;&middot;&nbsp; Todos los derechos reservados
                    </span>
                    <span className="text-2xs text-white/15 tracking-[0.25em] uppercase">
                        Moda femenina &nbsp;&middot;&nbsp; Hecho en Argentina
                    </span>
                </div>
            </div>

            {/* Línea dorada inferior */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cielo-gold/20 to-transparent" />
        </footer>
    );
};
