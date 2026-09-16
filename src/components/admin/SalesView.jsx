import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Search, Calendar, TrendingUp, Package, Download, Upload } from 'lucide-react';

const ImportarVentasModal = lazy(() => import('./ImportarVentasModal').then(m => ({ default: m.ImportarVentasModal })));
import { formatMoney } from '../../utils/helpers';
import { useStore } from '../../context/StoreContext';
import { gastosDelPeriodo, totalGastos } from '../../utils/gastos';
import { claveDia } from '../../utils/ventasPorDia';

// Miniatura con fallback: si no hay imagen o se rompe (ej: producto borrado),
// muestra un placeholder prolijo en vez de un cuadro vacío.
const SaleThumb = ({ src, name }) => {
    const [err, setErr] = useState(false);
    if (!src || err) {
        return (
            <div className="w-12 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            </div>
        );
    }
    return <img src={src} alt={name} loading="lazy" onError={() => setErr(true)} className="w-12 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0" />;
};

export const SalesView = ({ salesLog, metrics, dia = '', onLimpiarDia }) => {
    const { expenses = [] } = useStore();
    const [search, setSearch] = useState('');
    const [range, setRange] = useState('all');
    const [importando, setImportando] = useState(false);
    // Los gastos del mismo período: la ganancia neta es la bruta menos esto.
    const gastos = useMemo(() => totalGastos(gastosDelPeriodo(expenses, range)), [expenses, range]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const cutoff = range === 'all' ? 0 : Date.now() - parseInt(range) * 864e5;
        return (salesLog || []).filter(s => {
            if (dia) {
                if (!s.date || claveDia(new Date(s.date)) !== dia) return false;
            } else if (range !== 'all') {
                const t = s.date ? new Date(s.date).getTime() : 0;
                if (t < cutoff) return false;
            }
            if (!q) return true;
            return (s.productName || '').toLowerCase().includes(q)
                || String(s.orderId || '').toLowerCase().includes(q)
                || (s.color || '').toLowerCase().includes(q)
                || (s.channel || '').toLowerCase().includes(q);
        });
    }, [salesLog, search, range, dia]);
    const diaLindo = dia ? new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';

    const totalVendido = useMemo(() => filtered.reduce((a, s) => a + (Number(s.total) || 0), 0), [filtered]);
    const totalGanancia = useMemo(() => filtered.reduce((a, s) => a + (Number(s.profit) || 0), 0), [filtered]);

    const exportSales = async () => {
        if (!filtered.length) return;
        const XLSX = await import('xlsx');
        const rows = filtered.map(s => ({
            'N° Pedido': s.orderId || '',
            Producto: s.productName || '',
            Talle: s.size || '',
            Color: s.color || '',
            Cantidad: s.quantity || 0,
            'Precio unit.': Number(s.price) || 0,
            Total: Number(s.total) || 0,
            Ganancia: Number(s.profit) || 0,
            Fecha: s.date ? new Date(s.date).toLocaleDateString('es-AR') : '',
            Canal: s.channel || '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 14 }, { wch: 32 }, { wch: 8 }, { wch: 14 }, { wch: 9 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
        XLSX.writeFile(wb, `Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
            {importando && <Suspense fallback={null}><ImportarVentasModal onClose={() => setImportando(false)} /></Suspense>}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[#E8C65E]" /> Ventas y ganancia</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar producto o N° de pedido…"
                            className="pl-9 pr-3 py-2.5 text-sm w-64 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors"
                        />
                    </div>
                    {!dia && <div className="flex items-center gap-2 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <select value={range} onChange={e => setRange(e.target.value)} className="bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-white cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white">
                            <option value="all">Todo</option>
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                        </select>
                    </div>}
                    <button
                        onClick={() => setImportando(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider hover:border-[#E8C65E] hover:text-[#B8932E] dark:hover:text-[#E8C65E] transition-colors"
                        title="Registrar ventas hechas por fuera desde tu planilla"
                    >
                        <Upload className="w-4 h-4" /> Importar ventas
                    </button>
                    <button
                        onClick={exportSales}
                        disabled={!filtered.length}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E8C65E] hover:bg-[#B8932E] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-4 h-4" /> Excel
                    </button>
                </div>
            </div>

            {dia && (
                <div className="mb-6 flex items-center justify-between gap-3 flex-wrap rounded-xl border border-[#E8C65E]/50 bg-[#E8C65E]/10 px-4 py-3">
                    <p className="text-sm text-slate-800 dark:text-white"><Calendar className="w-4 h-4 inline -mt-0.5 mr-1.5 text-[#E8C65E]" />Viendo sólo las ventas del <strong>{diaLindo}</strong>.</p>
                    <button type="button" onClick={onLimpiarDia} className="text-xs font-bold uppercase tracking-wider text-[#B8932E] dark:text-[#E8C65E] hover:underline">Ver todas</button>
                </div>
            )}

            {/* Resumen */}
            {(salesLog || []).length === 0 && metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Ventas</p>
                    <p className="text-xl font-black text-slate-400 mt-1">Todavía ninguna</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Ganancia potencial del stock</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatMoney(metrics.potentialProfit)}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Si vendés todo al precio de la tienda, ya descontada la comisión de MP.</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Margen promedio</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{metrics.totalValue > 0 ? `${Math.round(metrics.potentialProfit / metrics.totalValue * 100)} %` : '—'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">De cada $100 que cobrás, lo que te queda limpio.</p>
                </div>
            </div>
            ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Ventas</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{filtered.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Facturado</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatMoney(totalVendido)}</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Ganancia bruta</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatMoney(totalGanancia)}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Ventas − costo de las prendas − comisión de MP.</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">− Gastos</p>
                    <p className={`text-xl font-black mt-1 ${gastos > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>{formatMoney(gastos)}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{gastos > 0 ? 'Publicidad, bolsas, envíos, servicios.' : 'Sin gastos cargados en el período.'}</p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#E8C65E]/60 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#B8932E] dark:text-[#E8C65E]">= Ganancia neta</p>
                    <p className={`text-xl font-black mt-1 ${totalGanancia - gastos >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{formatMoney(totalGanancia - gastos)}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Lo que te queda de verdad.</p>
                </div>
            </div>
            )}

            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                        <p className="text-sm">{(salesLog || []).length === 0 ? 'Todavía no hay ventas registradas.' : 'No hay ventas que coincidan con la búsqueda.'}</p>
                        <p className="text-xs mt-1 text-slate-400/70">{(salesLog || []).length === 0 ? 'Cada venta de la tienda entra sola. Las que hacés por fuera (WhatsApp, local) las cargás con "Importar ventas" o le decís a Lau "vendí el jean a Ana".' : 'Probá con otro término o cambiá el filtro de fecha.'}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left min-w-[640px]">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500"><tr><th className="p-4">Producto</th><th className="p-4 text-center">Cant</th><th className="p-4 text-right">Total</th><th className="p-4 text-right">Ganancia</th></tr></thead>
                        <tbody>{filtered.map((s, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <SaleThumb src={s.image} name={s.productName} />
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
