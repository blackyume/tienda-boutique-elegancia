import React, { useMemo, useState } from 'react';
import { Star, Check, Trash2, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useConfirm } from '../ui/ConfirmDialog';

export const ReviewsView = () => {
    const { reviews, inventory, approveReview, rejectReview } = useStore();
    const confirm = useConfirm();
    const [filter, setFilter] = useState('pending');

    const stats = useMemo(() => {
        const pending = reviews.filter(r => !r.approved);
        const approved = reviews.filter(r => r.approved);
        return { pending, approved };
    }, [reviews]);

    const list = useMemo(() => {
        if (filter === 'pending') return stats.pending;
        if (filter === 'approved') return stats.approved;
        return reviews;
    }, [filter, stats, reviews]);

    const productName = (id) => {
        const p = inventory.find(x => String(x.id) === String(id));
        return p ? p.name : `Producto #${id}`;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-10 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-luxury font-bold dark:text-white text-slate-900 tracking-wider">Reseñas</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">
                    Solo usuarios que compraron el producto pueden enviar reseñas. Aprobá las que te parezcan apropiadas para publicarlas.
                </p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                <FilterBtn active={filter === 'pending'} onClick={() => setFilter('pending')}>
                    Pendientes ({stats.pending.length})
                </FilterBtn>
                <FilterBtn active={filter === 'approved'} onClick={() => setFilter('approved')}>
                    Aprobadas ({stats.approved.length})
                </FilterBtn>
                <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                    Todas ({reviews.length})
                </FilterBtn>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                {list.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Sin reseñas {filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobadas' : ''}.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {list.map(r => (
                            <div key={r.id} className="p-5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-bold text-slate-800 dark:text-white">{r.userName}</span>
                                            <span className="text-xs text-slate-400">· {productName(r.productId)}</span>
                                            {r.approved ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Check className="w-3 h-3" /> Aprobada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Pendiente
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <Star key={n} className={`w-3.5 h-3.5 ${n <= (r.rating || 0) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-slate-300 dark:text-slate-600'}`} />
                                            ))}
                                            <span className="ml-1 text-xs text-slate-400">· {new Date(r.createdAt || 0).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{r.text || r.body}</p>
                                        {Array.isArray(r.photos) && r.photos.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {r.photos.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 block">
                                                        <img src={url} loading="lazy" decoding="async" alt="" className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {!r.approved && (
                                            <button
                                                onClick={() => approveReview(r.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                            >
                                                <Check className="w-3 h-3" /> Aprobar
                                            </button>
                                        )}
                                        <button
                                            onClick={async () => { if (await confirm({ title: 'Eliminar reseña', message: 'La reseña se eliminará permanentemente.', confirmText: 'Eliminar', danger: true })) rejectReview(r.id); }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterBtn = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${active
            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}
    >
        {children}
    </button>
);
