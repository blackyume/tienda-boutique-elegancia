import React, { useMemo, useState } from 'react';
import { ShoppingCart, Mail, Trash2, Check, Clock, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';
import { useConfirm } from '../ui/ConfirmDialog';
import { usePagination, Pagination } from '../ui/Pagination';

const relative = (ts) => {
    if (!ts) return '—';
    const ms = ts.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : 0);
    if (!ms) return '—';
    const diff = Date.now() - ms;
    if (diff < 60_000) return 'hace segundos';
    if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `hace ${Math.floor(diff / 3_600_000)} h`;
    return `hace ${Math.floor(diff / 86_400_000)} d`;
};

export const AbandonedCartsView = () => {
    const { abandonedCarts, sendAbandonedCartReminder, deleteAbandonedCart, addToast } = useStore();
    const confirm = useConfirm();
    const [filter, setFilter] = useState('pending'); // pending | recovered | all
    const [sendingId, setSendingId] = useState(null);

    const stats = useMemo(() => {
        const all = abandonedCarts || [];
        const pending = all.filter(c => !c.recovered);
        const recovered = all.filter(c => c.recovered);
        const lostValue = pending.reduce((acc, c) => acc + (c.total || 0), 0);
        const recoveredValue = recovered.reduce((acc, c) => acc + (c.total || 0), 0);
        const recoveryRate = all.length
            ? (recovered.length / all.length) * 100
            : 0;
        return { pending, recovered, lostValue, recoveredValue, recoveryRate };
    }, [abandonedCarts]);

    const filtered = useMemo(() => {
        if (filter === 'pending') return stats.pending;
        if (filter === 'recovered') return stats.recovered;
        return abandonedCarts || [];
    }, [filter, stats, abandonedCarts]);

    const cartsPage = usePagination(filtered, 20);

    const handleSend = async (cart) => {
        if (!(await confirm({ title: 'Enviar recordatorio', message: `Se enviará un email de recordatorio a ${cart.email}.`, confirmText: 'Enviar' }))) return;
        setSendingId(cart.id);
        try {
            await sendAbandonedCartReminder(cart);
            addToast("Recordatorio enviado", "success");
        } catch (err) {
            addToast(err.message || "Error al enviar", "error");
        } finally {
            setSendingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!(await confirm({ title: 'Eliminar registro', message: 'Se eliminará este carrito abandonado del historial.', confirmText: 'Eliminar', danger: true }))) return;
        await deleteAbandonedCart(id);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-luxury font-bold dark:text-white text-slate-900 tracking-wider">Carritos Abandonados</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">
                    Clientes que iniciaron checkout y no completaron la compra.
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Pendientes" value={stats.pending.length} icon={Clock} color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
                <StatCard label="Recuperados" value={stats.recovered.length} icon={Check} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
                <StatCard label="Valor Pendiente" value={formatMoney(stats.lostValue)} icon={ShoppingCart} color="text-red-600 bg-red-50 dark:bg-red-900/20" />
                <StatCard label="Tasa Recuperación" value={`${stats.recoveryRate.toFixed(1)}%`} icon={RefreshCw} color="text-[#D4AF37] bg-orange-50 dark:bg-orange-900/20" />
            </div>

            {/* FILTER */}
            <div className="flex gap-2 mb-6">
                <FilterBtn active={filter === 'pending'} onClick={() => setFilter('pending')}>Pendientes ({stats.pending.length})</FilterBtn>
                <FilterBtn active={filter === 'recovered'} onClick={() => setFilter('recovered')}>Recuperados ({stats.recovered.length})</FilterBtn>
                <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>Todos ({(abandonedCarts || []).length})</FilterBtn>
            </div>

            {/* LIST */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Sin carritos {filter === 'pending' ? 'pendientes' : filter === 'recovered' ? 'recuperados' : ''} aún.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {cartsPage.pageItems.map(cart => (
                            <div key={cart.id} className={`p-5 ${cart.recovered ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}`}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-800 dark:text-white">{cart.email}</span>
                                            {cart.recovered && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Check className="w-3 h-3" /> Recuperado
                                                </span>
                                            )}
                                            {cart.reminderSentAt && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Mail className="w-3 h-3" /> Recordado {cart.reminderCount || 1}×
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {cart.customer?.nombre || 'Sin nombre'}
                                            {cart.customer?.telefono ? ` · ${cart.customer.telefono}` : ''}
                                            {' · '}Actualizado {relative(cart.lastUpdated)}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {(cart.items || []).map((i, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {i.image && <img src={i.image} className="w-4 h-4 rounded object-cover" alt="" />}
                                                    <span>{i.name}</span>
                                                    {i.size && <span className="opacity-70">·{i.size}</span>}
                                                    <span className="font-bold">×{i.quantity}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{formatMoney(cart.total)}</span>
                                        <div className="flex gap-2">
                                            {!cart.recovered && (
                                                <button
                                                    onClick={() => handleSend(cart)}
                                                    disabled={sendingId === cart.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#C19A2E] text-white disabled:opacity-50 transition-colors"
                                                >
                                                    {sendingId === cart.id
                                                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> Enviando...</>
                                                        : <><Mail className="w-3 h-3" /> Enviar mail</>}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(cart.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination page={cartsPage.page} setPage={cartsPage.setPage} totalPages={cartsPage.totalPages} total={cartsPage.total} pageSize={20} />
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
);

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
