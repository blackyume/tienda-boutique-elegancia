import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { Package, XCircle, Clock } from 'lucide-react';
import { getTotalStock } from '../../utils/variants';

const OPTIONS = [
    { value: 'available', label: 'En Stock', icon: Package, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900/50', dot: 'bg-emerald-500' },
    { value: 'out_of_stock', label: 'Sin Stock', icon: XCircle, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50', dot: 'bg-red-500' },
    { value: 'pending', label: 'Pendiente', icon: Clock, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-900/50', dot: 'bg-orange-500' }
];

export const StatusSelector = ({ product }) => {
    const { updateProduct } = useStore();
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);

    const currentStatus = product.status || (getTotalStock(product) > 0 ? 'available' : 'out_of_stock');
    const current = OPTIONS.find(o => o.value === currentStatus) || OPTIONS[0];

    const place = useCallback(() => {
        const r = btnRef.current?.getBoundingClientRect();
        if (r) setPos({ top: r.bottom + 6, left: r.left });
    }, []);

    useEffect(() => {
        if (!open) return;
        place();
        const close = () => setOpen(false);
        // Reposiciona/cierra ante scroll o resize (el menú es position:fixed).
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        document.addEventListener('mousedown', onDocClick);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
            document.removeEventListener('mousedown', onDocClick);
        };
         
    }, [open]);

    const onDocClick = (e) => {
        if (!btnRef.current?.contains(e.target)) setOpen(false);
    };

    const handleStatusChange = async (newStatus) => {
        setOpen(false);
        const updates = { status: newStatus };
        if (newStatus === 'out_of_stock') updates.stock = 0;
        await updateProduct(product.id, updates);
    };

    return (
        <div className="relative inline-block">
            <button
                ref={btnRef}
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${current.color}`}
            >
                <span className={`w-2 h-2 rounded-full ${current.dot}`} />
                {current.label}
            </button>

            {open && createPortal(
                <div
                    className="fixed w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[200] animate-fadeIn"
                    style={{ top: pos.top, left: pos.left }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(opt.value); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 ${currentStatus === opt.value ? 'bg-slate-50 dark:bg-slate-700/50 text-[#D4AF37]' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                            {opt.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};
