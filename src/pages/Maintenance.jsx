import React from 'react';
import { Lock, Instagram, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Maintenance = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#020617', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>

            <div className="relative z-10 max-w-2xl px-6 text-center">
                {/* Brand Logo */}
                <div className="mb-8 flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 rounded-full border border-[#C19A6B]/30 bg-[#C19A6B]/10 flex items-center justify-center mb-4 shadow-lg shadow-[#C19A6B]/10">
                        <span className="font-serif text-2xl text-[#C19A6B] font-bold">B</span>
                    </div>
                    <h2 className="text-2xl font-serif text-white tracking-[0.3em] uppercase">La Boutique</h2>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="mx-auto mb-6 w-12 h-12 bg-[#C19A6B] rounded-lg flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                    </div>

                    <h1 className="text-4xl font-serif text-white mb-4">
                        Próximamente
                    </h1>

                    <p className="text-slate-300 text-sm mb-8 font-light leading-relaxed">
                        Estamos renovando nuestra experiencia digital. <br />
                        Volveremos muy pronto.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <a href="https://instagram.com" className="px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Instagram
                        </a>
                        <a href="mailto:info@laboutique.com" className="px-6 py-2 rounded-full bg-[#C19A6B] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#a38056] transition-colors">
                            Contacto
                        </a>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <Link to="/admin" className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
                            Acceso Administrativo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};