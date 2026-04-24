import React, { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { isPushSupported, getCurrentPermission, requestAndRegister } from '../../utils/pushNotifications';

const DISMISS_KEY = 'lbe_push_dismissed';

export const PushOptIn = () => {
    const { user, siteConfig, addToast } = useStore();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem(DISMISS_KEY)) return;
            const supported = await isPushSupported();
            if (!supported) return;
            const perm = getCurrentPermission();
            if (perm !== 'default') return;
            const vapidKey = siteConfig?.push?.vapidKey;
            if (!vapidKey) return;
            // Delay 10s para no molestar al aterrizar
            const t = setTimeout(() => setVisible(true), 10_000);
            return () => clearTimeout(t);
        })();
    }, [siteConfig?.push?.vapidKey]);

    const handleEnable = async () => {
        setLoading(true);
        try {
            await requestAndRegister(user, siteConfig?.push?.vapidKey);
            addToast('Notificaciones activadas', 'success');
            setVisible(false);
        } catch (err) {
            addToast(err.message || 'No se pudo activar', 'error');
            localStorage.setItem(DISMISS_KEY, '1');
            setVisible(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[55] max-w-sm animate-slideUp">
            <div className="bg-slate-900 border border-cielo-gold/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-cielo-gold/20 flex items-center justify-center text-cielo-gold shrink-0">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white mb-1">Ofertas exclusivas</p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Avisame cuando haya descuentos o productos nuevos. Podés desactivarlo cuando quieras.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleEnable}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-cielo-gold hover:bg-[#a87f4f] text-black transition-colors disabled:opacity-50"
                            >
                                <Check className="w-3 h-3" /> {loading ? 'Activando…' : 'Activar'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 text-slate-500 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
