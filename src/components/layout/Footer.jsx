import React, { useState } from 'react';
import { Instagram, Youtube, ArrowRight, Scale, Mail, MessageCircle } from 'lucide-react';

// TikTok SVG Icon (not in lucide-react)
const TikTokIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { RegretModal } from './RegretModal';
import { TrustBadges } from '../ui/TrustBadges';

export const Footer = () => {
    const { setIsSizeGuideOpen, siteConfig } = useStore();
    const [isRegretOpen, setIsRegretOpen] = useState(false);

    return (
        <footer className="bg-slate-950 text-white pt-20 pb-8 border-t border-slate-900 mt-auto font-sans">
            <RegretModal isOpen={isRegretOpen} onClose={() => setIsRegretOpen(false)} />

            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-5 gap-12 mb-16">

                {/* Brand */}
                <div className="col-span-1">
                    <div className="mb-6 flex items-center gap-4">
                        {/* Footer Logo */}
                        <img src="/assets/logo-footer.png?v=4" alt="LBE Footer Logo" className="w-24 h-auto shadow-lg" />
                        <div>
                            <h4 className="text-lg font-cinzel text-white leading-none tracking-wide">
                                LA BOUTIQUE
                            </h4>
                            <span className="text-xs font-serif text-cielo-gold italic tracking-widest block mt-1">
                                de la Elegancia
                            </span>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm font-light leading-relaxed mb-6">
                        Moda ética y atemporal diseñada para el mundo moderno. <br />
                        Cada prenda cuenta una historia de lujo silencioso desde Rafaela para el mundo.
                    </p>
                    <div className="flex gap-4">
                        {siteConfig?.social?.instagram && (
                            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"><Instagram className="w-4 h-4" /></a>
                        )}
                        {siteConfig?.social?.youtube && (
                            <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"><Youtube className="w-4 h-4" /></a>
                        )}
                        {siteConfig?.social?.tiktok && (
                            <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"><TikTokIcon className="w-4 h-4" /></a>
                        )}
                    </div>
                </div>

                {/* Contacto */}
                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-[#C19A6B]">Contacto</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-light">
                        <li>
                            <a href="https://wa.me/5493492216487" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-3 group">
                                <span className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                                    <MessageCircle className="w-4 h-4" />
                                </span>
                                WhatsApp
                            </a>
                        </li>
                        <li>
                            <a href="mailto:hola@laboutique.com.ar" className="hover:text-white transition-colors flex items-center gap-3 group">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4" />
                                </span>
                                Email
                            </a>
                        </li>
                        <li className="pt-2">
                            <span className="block text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-wider">Nuestras Redes</span>
                            <div className="flex gap-2.5">
                                {siteConfig?.social?.instagram && (
                                    <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:border-[#C19A6B] transition-all"><Instagram className="w-4 h-4" /></a>
                                )}
                                {siteConfig?.social?.youtube && (
                                    <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:border-[#C19A6B] transition-all"><Youtube className="w-4 h-4" /></a>
                                )}
                                {siteConfig?.social?.tiktok && (
                                    <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:border-[#C19A6B] transition-all"><TikTokIcon className="w-4 h-4" /></a>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Ayuda */}
                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-[#C19A6B]">Ayuda</h4>
                    <ul className="space-y-3 text-sm text-slate-400 font-light">
                        <li><Link to="/tracking" className="hover:text-white transition-colors">Seguimiento de Orden</Link></li>
                        <li><button onClick={() => setIsSizeGuideOpen(true)} className="hover:text-white transition-colors text-left">Tabla de Talles</button></li>
                        <li><Link to="/about" className="hover:text-white transition-colors">Envíos y Entregas</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-[#C19A6B]">Legal</h4>
                    <ul className="space-y-3 text-sm text-slate-400 font-light">
                        <li><Link to="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                        <li><Link to="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                        <li><a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2"><Scale className="w-3 h-3" /> Defensa del Consumidor</a></li>
                        <li><button onClick={() => setIsRegretOpen(true)} className="hover:text-red-400 transition-colors text-left font-medium border-b border-transparent hover:border-red-400">Botón de Arrepentimiento</button></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-[#C19A6B]">Newsletter</h4>
                    <p className="text-slate-400 text-xs mb-4">Suscribite para recibir novedades exclusivas.</p>
                    <div className="flex border-b border-white/20 pb-2 focus-within:border-white transition-colors">
                        <input placeholder="Tu email" className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600 text-white" />
                        <button className="text-xs uppercase font-bold hover:text-[#C19A6B] transition-colors flex items-center gap-1">Enviar <ArrowRight className="w-3 h-3" /></button>
                    </div>
                </div>
            </div>
            {/* Trust Badges Row */}
            <div className="border-t border-slate-900 border-b border-white/5 py-4 mb-8 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <TrustBadges className="bg-transparent border-none grid-cols-2 md:grid-cols-4 gap-8 py-0" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/10 flex flex-col items-center text-center">

                <div className="mb-6 flex flex-col items-center gap-3">
                    <span className="font-cinzel text-xl tracking-[0.25em] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">
                        LBE
                    </span>
                    <span className="text-[10px] text-slate-500 tracking-[0.3em] uppercase">
                        Moda femenina · Hecho en Argentina
                    </span>
                </div>

                <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose">
                    <p>© 2026 La Boutique de la Elegancia · Todos los derechos reservados</p>
                </div>
            </div>
        </footer >
    );
};