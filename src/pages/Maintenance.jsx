import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from '../components/ui/ToastContainer';

export const Maintenance = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const { loginWithGoogle, isAdmin, user } = useStore();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    const handleAdminLogin = async () => {
        setLoginLoading(true);
        setLoginError('');
        try {
            const success = await loginWithGoogle();
            if (success) {
                // Wait a moment for auth state to update
                setTimeout(() => {
                    // Check if user became admin after login
                    // Note: isAdmin will update reactively, but we need a slight delay
                    navigate('/admin');
                }, 500);
            }
        } catch (error) {
            setLoginError('Error al iniciar sesión');
        } finally {
            setLoginLoading(false);
        }
    };

    // If already logged in as admin, redirect
    React.useEffect(() => {
        if (isAdmin) {
            navigate('/admin');
        }
    }, [isAdmin, navigate]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto font-sans relative">
            <ToastContainer />

            {/* ========== PREMIUM BACKGROUND ========== */}
            <div className="fixed inset-0 z-0 bg-black"></div>
            <div
                className="fixed inset-0 z-0 opacity-20 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop')",
                    maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 35%, black 50%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 35%, black 50%, black 100%)'
                }}
            ></div>
            <div className="fixed bottom-0 left-0 right-0 h-1/3 z-0 bg-gradient-to-t from-[#D4AF37]/5 via-transparent to-transparent"></div>

            {/* ========== MAIN CONTENT ========== */}
            <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">

                {/* Logo Section with Sparkles */}
                <div className="mb-8 md:mb-12 relative">
                    {/* Radial black fade for seamless blend */}
                    <div className="absolute inset-0 -m-20 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,1)_0%,rgba(0,0,0,0.9)_50%,transparent_75%)] z-0"></div>

                    {/* BREATHING GOLDEN GLOW - Always on, pulses brighter */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37] rounded-full blur-[120px] z-0"
                        style={{
                            animation: 'breathingGlow 3s ease-in-out infinite',
                        }}
                    ></div>
                    <style>{`
                        @keyframes breathingGlow {
                            0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
                            50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
                        }
                        @keyframes twinkle {
                            0%, 100% { opacity: 0.6; transform: scale(1); }
                            50% { opacity: 1; transform: scale(1.3); }
                        }
                    `}</style>

                    {/* ========== MANY SPARKLE STARS - Very close to logo ========== */}
                    {/* Top area */}
                    <div className="absolute -top-1 right-6 z-20 text-[#D4AF37]" style={{ animation: 'twinkle 2s ease-in-out infinite' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute top-2 right-1 z-20 text-[#D4AF37]" style={{ animation: 'twinkle 1.8s ease-in-out infinite 0.3s' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute -top-2 left-8 z-20 text-[#D4AF37]/90" style={{ animation: 'twinkle 2.2s ease-in-out infinite 0.5s' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute top-0 left-2 z-20 text-white/60" style={{ animation: 'twinkle 2.5s ease-in-out infinite 0.2s' }}>
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>

                    {/* Right side */}
                    <div className="absolute top-1/4 -right-1 z-20 text-[#D4AF37]" style={{ animation: 'twinkle 1.9s ease-in-out infinite 0.7s' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute top-1/2 right-0 z-20 text-[#D4AF37]/80" style={{ animation: 'twinkle 2.3s ease-in-out infinite 0.4s' }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>

                    {/* Left side */}
                    <div className="absolute top-1/3 -left-1 z-20 text-[#D4AF37]" style={{ animation: 'twinkle 2.1s ease-in-out infinite 0.6s' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute top-1/2 left-1 z-20 text-white/50" style={{ animation: 'twinkle 2.6s ease-in-out infinite 0.9s' }}>
                        <svg width="5" height="5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>

                    {/* Bottom area */}
                    <div className="absolute bottom-2 right-4 z-20 text-[#D4AF37]" style={{ animation: 'twinkle 2s ease-in-out infinite 0.8s' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute -bottom-1 right-8 z-20 text-[#D4AF37]/70" style={{ animation: 'twinkle 1.7s ease-in-out infinite 0.1s' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute bottom-0 left-6 z-20 text-[#D4AF37]/80" style={{ animation: 'twinkle 2.4s ease-in-out infinite 0.35s' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>
                    <div className="absolute bottom-4 left-0 z-20 text-white/40" style={{ animation: 'twinkle 2.8s ease-in-out infinite 0.55s' }}>
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                    </div>

                    <img
                        src="/logo_custom.png"
                        alt="La Boutique de la Elegancia"
                        className="w-48 md:w-56 h-auto relative z-10 mx-auto object-contain mix-blend-screen"
                    />
                </div>

                {/* Gold Divider */}
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6 opacity-50"></div>

                {/* Main Heading */}
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-light text-white mb-3 tracking-[0.2em] uppercase">
                    En Renovación
                </h1>

                {/* Professional Maintenance Description */}
                <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed mb-6 max-w-md mx-auto tracking-wide">
                    Estamos trabajando para ofrecerte una experiencia de compra renovada y exclusiva.
                    <span className="block mt-2 text-gray-500 text-xs">Nuestra tienda online está siendo optimizada para brindarte el mejor servicio.</span>
                </p>

                <span className="block text-[#D4AF37] font-medium tracking-[0.2em] text-xs md:text-sm mb-6 uppercase">Nueva Colección 2026 • Muy Pronto</span>

                {/* Email Form */}
                <div className="w-full max-w-sm mx-auto mb-10">
                    <form onSubmit={handleSubmit} className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 pl-5 shadow-xl hover:border-[#D4AF37]/30 transition-colors duration-500">
                        <input
                            type="email"
                            required
                            placeholder="Tu email..."
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500 font-light tracking-wide"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'success' || status === 'loading'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'success' || status === 'loading'}
                            className="bg-[#D4AF37] hover:bg-[#C19A2E] text-black px-5 py-2.5 rounded-full font-semibold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                            {status === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : (status === 'success' ? '¡Listo!' : 'Notificarme')}
                        </button>
                    </form>
                    {status === 'success' && (
                        <p className="mt-4 text-[#D4AF37] text-xs font-medium uppercase tracking-widest animate-pulse">
                            Te avisaremos.
                        </p>
                    )}
                </div>

                {/* Social Icons */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <a href="https://www.instagram.com/laboutiquedelaeleganciaoficial/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#D4AF37] transition-colors duration-300" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#D4AF37] transition-colors duration-300" aria-label="TikTok">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                        </svg>
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#D4AF37] transition-colors duration-300" aria-label="YouTube">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                    </a>
                </div>

                {/* ========== ADMIN LOGIN (Discrete Google Icon) ========== */}
                <div className="mt-8 mb-6">
                    <button
                        onClick={handleAdminLogin}
                        disabled={loginLoading}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 group"
                        title="Acceso"
                    >
                        {loginLoading ? (
                            <Loader className="w-5 h-5 animate-spin text-gray-400" />
                        ) : (
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                    </button>
                    {loginError && (
                        <p className="mt-2 text-red-400 text-xs text-center">{loginError}</p>
                    )}
                    {user && !isAdmin && (
                        <p className="mt-2 text-yellow-400/60 text-xs text-center">
                            Sin acceso.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">
                    La Boutique de la Elegancia &copy; 2026
                </p>
            </div>
        </div>
    );
};