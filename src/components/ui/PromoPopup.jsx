import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';

export const PromoPopup = () => {
    const { siteConfig, addToast } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if enabled and not seen yet
        if (siteConfig?.promoPopup?.active) {
            const hasSeen = sessionStorage.getItem('cielo_promo_seen');
            if (!hasSeen) {
                // Delay slightly for better UX
                const timer = setTimeout(() => setIsOpen(true), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [siteConfig?.promoPopup?.active]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('cielo_promo_seen', 'true');
    };

    const copyCode = () => {
        navigator.clipboard.writeText(siteConfig.promoPopup.code);
        addToast("Código copiado al portapapeles", "success");
    };

    if (!isOpen || !siteConfig?.promoPopup) return null;

    const { title, text, code, image } = siteConfig.promoPopup;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scaleIn">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white md:text-black dark:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* IMAGE */}
                <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img src={image} className="w-full h-full object-cover" alt="Promo" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-none"></div>
                </div>

                {/* CONTENT */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                        {text}
                    </p>

                    {code && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#E8C65E]">Tu código exclusivo</p>
                            <div
                                onClick={copyCode}
                                className="bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-[#E8C65E] group transition-colors"
                            >
                                <span className="font-mono text-xl font-bold tracking-widest text-slate-800 dark:text-white">{code}</span>
                                <Copy className="w-5 h-5 text-slate-400 group-hover:text-[#E8C65E]" />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Haz click para copiar</p>
                        </div>
                    )}

                    <Button onClick={handleClose} className="mt-8 bg-slate-900 text-white w-full py-4">
                        ENTENDIDO
                    </Button>
                </div>
            </div>
        </div>
    );
};
