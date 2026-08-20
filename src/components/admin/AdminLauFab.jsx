import React, { useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// Asistente Lau flotante: aparece en toda la tienda SOLO para el admin logueado.
// Un botón dorado abajo a la izquierda (lejos del WhatsApp) que abre el chat.
const AdminAssistantView = lazy(() =>
    import('./AdminAssistantView').then(m => ({ default: m.AdminAssistantView }))
);

export const AdminLauFab = () => {
    const { isAdmin, orders, inventory } = useStore();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    // Solo admin, y no en el panel (ahí Lau ya está como pestaña).
    if (!isAdmin) return null;
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Abrir asistente Lau"
                    title="Asistente Lau"
                    className="fixed bottom-6 left-6 z-[55] group flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                    <span className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(212,175,55,0.65)] overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #FCF6BA 0%, #D4AF37 45%, #B8932E 100%)' }}>
                        <span className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />
                        <Sparkles className="relative w-6 h-6 text-[#312721]" />
                        <span className="absolute -inset-1 rounded-full border border-[#D4AF37]/40 animate-pulse pointer-events-none" />
                    </span>
                    <span className="hidden sm:block bg-[#312721]/90 backdrop-blur border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                        Lau
                    </span>
                </button>
            )}
            {open && (
                <Suspense fallback={null}>
                    <AdminAssistantView orders={orders} inventory={inventory} onClose={() => setOpen(false)} />
                </Suspense>
            )}
        </>
    );
};
