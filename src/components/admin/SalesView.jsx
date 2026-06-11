import React, { useState, useMemo } from 'react';
import { Search, Calendar, TrendingUp } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';

export const SalesView = ({ salesLog }) => {
    const [search, setSearch] = useState('');
    const [range, setRange] = useState('all');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const cutoff = range === 'all' ? 0 : Date.now() - parseInt(range) * 864e5;
        return (salesLog || []).filter(s => {
            if (range !== 'all') {
                const t = s.date ? new Date(s.date).getTime() : 0;
                if (t < cutoff) return false;
            }
            if (!q) return true;
            return (s.productName || '').toLowerCase().includes(q)
                || String(s.orderId || '').toLowerCase().includes(q)
                || (s.color || '').toLowerCase().includes(q)
                || (s.channel || '').toLowerCase().includes(q);
        });
    }, [salesLog, search, range]);

    const totalVendido = useMemo(() => filtered.reduce((a, s) => a + (Number(s.total) || 0), 0), [filtered]);
    const totalGanancia = useMemo(() => filtered.reduce((a, s) => a + (Number(s.profit) || 0), 0), [filtered]);

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[#D4AF37]" /> Registro de Ventas</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar producto o N° de pedido…"
                            className="pl-9 pr-3 py-2.5 text-sm w-64 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <select value={range} onChange={e => setRange(e.target.value)} className="bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-white cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white">
                            <option value="all">Todo</option>
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Ventas</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{filtered.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Facturado</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatMoney(totalVendido)}</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Ganancia</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatMoney(totalGanancia)}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                        <p className="text-sm">{(salesLog || []).length === 0 ? 'Todavía no hay ventas registradas.' : 'No hay ventas que coincidan con la búsqueda.'}</p>
                        <p className="text-xs mt-1 text-slate-400/70">{(salesLog || []).length === 0 ? 'Cuando se concrete la primera venta, vas a verla acá.' : 'Probá con otro término o cambiá el filtro de fecha.'}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left min-w-[640px]">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500"><tr><th className="p-4">Producto</th><th className="p-4 text-center">Cant</th><th className="p-4 text-right">Total</th><th className="p-4 text-right">Ganancia</th></tr></thead>
                        <tbody>{filtered.map((s, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    {s.image
                                        ? <img src={s.image} alt="" loading="lazy" className="w-12 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0" />
                                        : <div className="w-12 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />}
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-800 dark:text-white truncate">{s.productName}</p>
                                        {(s.size || s.color) && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {s.size && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Talle {s.size}</span>}
                                                {s.color && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{s.color}</span>}
                                            </div>
                                        )}
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {s.orderId ? <span className="font-mono">{s.orderId}</span> : ''}
                                            {s.date ? ` · ${new Date(s.date).toLocaleDateString('es-AR')}` : ''}
                                            {s.channel ? ` · ${s.channel}` : ''}
                                            {typeof s.stockLeft === 'number' ? ` · quedan ${s.stockLeft}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center text-slate-600 dark:text-slate-300">{s.quantity}</td>
                            <td className="p-4 text-right text-slate-600 dark:text-slate-300">{formatMoney(s.total)}</td>
                            <td className="p-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">+{formatMoney(s.profit)}</td>
                        </tr>)}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
