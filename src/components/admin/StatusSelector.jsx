import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Package, XCircle, Clock } from 'lucide-react';

export const StatusSelector = ({ product }) => {
    const { updateProduct } = useStore();

    const currentStatus = product.status || (product.stock > 0 ? 'available' : 'out_of_stock');

    const handleStatusChange = async (newStatus) => {
        let updates = { status: newStatus };
        if (newStatus === 'out_of_stock') {
            updates.stock = 0;
            updates.active = false; // Optional: Auto-hide if no stock? Let's keep it visible but marked as no stock for now, or user preference. Keeping active=true by default unless user hides it.
            // Actually, let's NOT change active visibility automatically, just stock number.
            updates.stock = 0;
        }
        await updateProduct(product.id, updates);
    };

    const options = [
        { value: 'available', label: 'En Stock', icon: Package, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100', dot: 'bg-emerald-500' },
        { value: 'out_of_stock', label: 'Sin Stock', icon: XCircle, color: 'text-red-600 bg-red-50 hover:bg-red-100', dot: 'bg-red-500' },
        { value: 'pending', label: 'Pendiente', icon: Clock, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100', dot: 'bg-orange-500' }
    ];

    return (
        <div className="relative group/status inline-block">
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${options.find(o => o.value === currentStatus)?.color || 'border-slate-200'}`}>
                <div className={`w-2 h-2 rounded-full ${options.find(o => o.value === currentStatus)?.dot}`} />
                {options.find(o => o.value === currentStatus)?.label}
            </button>

            {/* DROPDOWN */}
            <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20 hidden group-hover/status:block animate-fadeIn">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(opt.value); }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 ${currentStatus === opt.value ? 'bg-slate-50 dark:bg-slate-700/50 text-[#C19A6B]' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
