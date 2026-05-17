import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

const DEFAULTS = {
    title: 'Confirmar acción',
    message: '¿Estás seguro?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    danger: false
};

export const ConfirmProvider = ({ children }) => {
    const [state, setState] = useState(null);
    const resolver = useRef(null);
    const confirmBtnRef = useRef(null);

    const confirm = useCallback((opts = {}) => {
        return new Promise((resolve) => {
            resolver.current = resolve;
            setState({ ...DEFAULTS, ...(typeof opts === 'string' ? { message: opts } : opts) });
        });
    }, []);

    const close = useCallback((result) => {
        resolver.current?.(result);
        resolver.current = null;
        setState(null);
    }, []);

    useEffect(() => {
        if (!state) return;
        confirmBtnRef.current?.focus();
        const onKey = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); close(false); }
            if (e.key === 'Enter') { e.preventDefault(); close(true); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [state, close]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div
                    className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-desc"
                >
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]"
                        onClick={() => close(false)}
                    />
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-[scaleIn_.18s_ease-out]">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`shrink-0 p-3 rounded-xl ${state.danger ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-[#C19A6B]/10 text-[#C19A6B]'}`}>
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 id="confirm-title" className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                                        {state.title}
                                    </h2>
                                    <p id="confirm-desc" className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {state.message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => close(false)}
                                    aria-label="Cerrar"
                                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => close(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                {state.cancelText}
                            </button>
                            <button
                                ref={confirmBtnRef}
                                onClick={() => close(true)}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:-translate-y-0.5 ${state.danger ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20' : 'bg-[#C19A6B] hover:bg-[#a8835a] shadow-lg shadow-[#C19A6B]/20'}`}
                            >
                                {state.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        // Fallback defensivo: si no hay provider, no romper la app.
        return async (opts) => window.confirm(typeof opts === 'string' ? opts : (opts?.message || '¿Confirmar?'));
    }
    return ctx;
};
