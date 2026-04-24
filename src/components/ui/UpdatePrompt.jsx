import React, { useEffect, useState } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export const UpdatePrompt = () => {
    const [activate, setActivate] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const onUpdate = (e) => {
            setActivate(() => e.detail?.activate || null);
            setDismissed(false);
        };
        window.addEventListener('lbe:sw-update', onUpdate);
        return () => window.removeEventListener('lbe:sw-update', onUpdate);
    }, []);

    if (!activate || dismissed) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto animate-fadeIn">
            <div
                className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full border border-cielo-gold/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                style={{ background: 'rgba(15, 23, 42, 0.95)' }}
            >
                <Sparkles className="w-4 h-4 text-cielo-gold shrink-0" />
                <span className="text-xs text-white/90 font-medium">
                    Nueva versión disponible
                </span>
                <button
                    onClick={() => { activate?.(); }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-black transition-transform hover:scale-[1.03]"
                    style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                >
                    <RefreshCw className="w-3 h-3" /> Actualizar
                </button>
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Descartar"
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
