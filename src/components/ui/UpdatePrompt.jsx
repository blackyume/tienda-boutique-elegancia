import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Rombo } from './Ornamento';

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
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-max max-w-[calc(100vw-2rem)] pointer-events-auto animate-fadeIn">
            <div className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-noche-900/95 backdrop-blur-xl border border-cielo-gold/30 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
                <Rombo />
                <span className="text-xs text-noche-100 font-medium">
                    Actualizamos la tienda
                </span>
                <button
                    onClick={() => { activate?.(); }}
                    className="btn-oro inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                >
                    <RefreshCw className="w-3 h-3" /> Ver
                </button>
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Descartar"
                    className="p-1.5 text-noche-300 hover:text-cielo-gold transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
