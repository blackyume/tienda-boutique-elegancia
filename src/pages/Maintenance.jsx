import React, { useState } from 'react';
import { Instagram, Mail, Youtube, Check, Loader } from 'lucide-react'; // Added Youtube, Check is useful. 
// I will use an SVG for TikTok to be safe as it's often missing or requires newer versions.

export const Maintenance = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0B1120] text-white flex flex-col items-center justify-center p-6 overflow-hidden">

            {/* Background Effects */}
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            {/* Darker dual overlay for contrast on gold */}
            <div className="absolute inset-0 z-0 bg-black/60"></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B1120] via-[#0B1120]/80 to-[#0B1120]"></div>

            {/* Content Container */}
            <div className="relative z-10 max-w-lg w-full text-center px-6">

                {/* Logo with Glow */}
                <div className="mb-12 relative flex justify-center">
                    <div className="absolute w-40 h-40 bg-[#C19A6B] rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                    <img
                        src="/logo_new.png"
                        alt="La Boutique de la Elegancia"
                        className="w-48 md:w-64 h-auto relative z-10 mix-blend-screen object-contain contrast-125 brightness-110"
                        style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 80%)' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo-main.png'; }}
                    />
                </div>

                {/* Main Text */}
                <h1 className="text-4xl md:text-5xl font-cinzel text-white mb-6 tracking-wide">
                    Próximamente
                </h1>

                <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed mb-10 max-w-md mx-auto">
                    Estamos elevando nuestra experiencia digital para ofrecerte lo mejor del lujo y la elegancia. <br className="hidden md:block" />
                    Prepárate para descubrir nuestra <span className="text-[#C19A6B]">Nueva Colección 2026</span>.
                </p>

                {/* Newsletter Form */}
                <div className="bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 flex items-center max-w-sm mx-auto mb-12 focus-within:border-[#C19A6B]/50 transition-colors shadow-xl">
                    <div className="pl-4 text-slate-500">
                        <Mail className="w-4 h-4" />
                    </div>
                    <form onSubmit={handleSubmit} className="flex-1 flex">
                        <input
                            type="email"
                            required
                            placeholder="Tu email exclusivo..."
                            className="bg-transparent border-none outline-none text-sm text-white px-4 py-3 w-full placeholder:text-slate-500 font-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'success' || status === 'loading'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'success' || status === 'loading'}
                            className="bg-[#C19A6B] hover:bg-[#a38056] text-white px-6 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 m-1 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : (status === 'success' ? 'Suscrito' : 'Notificarme')}
                        </button>
                    </form>
                </div>

                {/* Success Message */}
                {status === 'success' && (
                    <div className="absolute bottom-24 left-0 w-full text-center animate-fadeIn">
                        <p className="text-[#C19A6B] text-xs font-bold uppercase tracking-widest">¡Gracias! Te avisaremos pronto.</p>
                    </div>
                )}

                {/* Footer Socials */}
                <div className="flex flex-col items-center gap-6">
                    <div className="h-px w-12 bg-white/10"></div>
                    <div className="flex gap-8">
                        {/* TikTok */}
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-[#C19A6B] group-hover:bg-[#C19A6B]/10 transition-all">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 group-hover:text-[#C19A6B] transition-colors">TikTok</span>
                        </a>

                        {/* Instagram */}
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-[#C19A6B] group-hover:bg-[#C19A6B]/10 transition-all">
                                <Instagram className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 group-hover:text-[#C19A6B] transition-colors">Instagram</span>
                        </a>

                        {/* Youtube */}
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-[#C19A6B] group-hover:bg-[#C19A6B]/10 transition-all">
                                <Youtube className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 group-hover:text-[#C19A6B] transition-colors">Youtube</span>
                        </a>

                        {/* Contact */}
                        <a href="mailto:contacto@laboutique.com" className="group flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-[#C19A6B] group-hover:bg-[#C19A6B]/10 transition-all">
                                <Mail className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 group-hover:text-[#C19A6B] transition-colors">Contacto</span>
                        </a>
                    </div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-light mt-4">
                        © 2026 La Boutique
                    </p>
                </div>

            </div>
        </div>
    );
};