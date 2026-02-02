import React, { useState, useEffect } from 'react';
import { X, Mail, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../context/StoreContext';

export const NewsletterPopup = () => {
    const { siteConfig } = useStore();
    const config = siteConfig.promoPopup || {}; // Fallback if undefined

    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (!config.active) return; // Don't show if disabled in Admin by user

        const hasSeen = localStorage.getItem('lbe_newsletter_seen');
        const isSubscribed = localStorage.getItem('lbe_newsletter_subscribed');

        if (!hasSeen && !isSubscribed) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [config.active]);

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('lbe_newsletter_seen', 'true');
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            localStorage.setItem('lbe_newsletter_subscribed', 'true');
            setTimeout(() => {
                setIsOpen(false);
            }, 3000);
        }, 1500);
    };

    if (!isOpen || !config.active) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                onClick={handleDismiss}
            />
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0B1120] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-slideUp">
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-slate-100">
                    <img
                        src={config.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"}
                        alt="Join the club"
                        className="w-full h-full object-cover grayscale opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <span className="text-white font-cinzel text-3xl font-bold italic tracking-wide">
                            {config.title || "Join the Club"}
                        </span>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fadeIn">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-cinzel text-slate-900 dark:text-white">¡Bienvenido!</h3>
                            <p className="text-slate-500 dark:text-slate-400">Tu código es: <span className="text-cielo-gold font-bold">{config.code || "WELCOME10"}</span></p>
                        </div>
                    ) : (
                        <>
                            <span className="text-xs font-bold text-cielo-gold uppercase tracking-[0.2em] mb-3 block">
                                Exclusividad & Estilo
                            </span>
                            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-white mb-4 leading-tight">
                                {config.text || "Obtén beneficios exclusivos"}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 font-light text-sm leading-relaxed">
                                Suscríbete para recibir novedades exclusivas, acceso anticipado a colecciones y descuentos especiales.
                            </p>

                            <form onSubmit={handleSubscribe} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="Tu correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cielo-gold/50 transition-colors"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-4 tracking-[0.2em] uppercase font-bold"
                                >
                                    {status === 'loading' ? 'Suscribiendo...' : 'Suscribirme Ahora'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
