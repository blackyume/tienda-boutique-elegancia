import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Wallet, Plus, Trash2, Calendar, Info } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';
import { CATEGORIAS_GASTO, etiquetaDeCategoria, gastosDelPeriodo, gastosPorCategoria, totalGastos } from '../../utils/gastos';

const inputCls = 'p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors';

// "2026-09-16" del <input type=date> → timestamp del mediodía local de ese día
// (mediodía para que no se corra de día por la zona horaria).
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fechaATimestamp = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return y && m && d ? new Date(y, m - 1, d, 12).getTime() : Date.now(); };

export const ExpensesView = () => {
    const { expenses = [], addExpense, deleteExpense, addToast } = useStore();
    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('publicidad');
    const [fecha, setFecha] = useState(hoyISO());
    const [range, setRange] = useState('30');
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => gastosDelPeriodo(expenses, range), [expenses, range]);
    const total = useMemo(() => totalGastos(filtered), [filtered]);
    const porRubro = useMemo(() => gastosPorCategoria(filtered), [filtered]);
    const hint = CATEGORIAS_GASTO.find(c => c.value === category)?.hint;

    const handleAdd = async () => {
        const amt = Number(amount) || 0;
        if (amt <= 0) return addToast('Poné un monto válido', 'error');
        if (!concept.trim()) return addToast('Escribí qué fue el gasto', 'error');
        setSaving(true);
        await addExpense({ amount: amt, concept: concept.trim(), category, date: fechaATimestamp(fecha) });
        setConcept(''); setAmount(''); setFecha(hoyISO());
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#121212] p-6 lg:p-10 font-sans text-slate-900 dark:text-slate-100">
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                <div>
                    <h1 className="text-3xl font-bold tracking-wide flex items-center gap-3">
                        <Wallet className="w-7 h-7 text-[#E8C65E]" /> Gastos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Lo que pagás para que el negocio funcione: publicidad, bolsas, envíos, servicios. Se resta de la ganancia en Ventas y en el Inicio.</p>
                </div>

                {/* Alta de gasto */}
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold mb-4 text-slate-800 dark:text-white">Nuevo gasto</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-3">
                        <input value={concept} onChange={e => setConcept(e.target.value)} placeholder="¿Qué fue? (ej: bolsas, sorteo de Instagram)" className={inputCls + ' col-span-2 sm:col-span-4'} />
                        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" inputMode="numeric" placeholder="Monto $" className={inputCls + ' sm:col-span-2'} />
                        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls + ' sm:col-span-2 [&>option]:bg-slate-800'}>
                            {CATEGORIAS_GASTO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <input value={fecha} onChange={e => setFecha(e.target.value)} type="date" max={hoyISO()} title="Fecha del gasto (podés cargar uno de días atrás)" className={inputCls + ' sm:col-span-2 [color-scheme:dark]'} />
                        <Button onClick={handleAdd} disabled={saving} className="col-span-2 sm:col-span-2 bg-[#E8C65E] hover:bg-[#B8932E] text-white justify-center">
                            <Plus className="w-4 h-4 mr-1" /> Cargar
                        </Button>
                    </div>
                    {hint && (
                        <p className={`mt-3 text-xs flex items-start gap-1.5 ${category === 'mercaderia' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {category === 'mercaderia' ? 'Ojo: si cargaste el costo en las prendas (que es lo normal), no cargues acá la compra de mercadería: se descontaría dos veces. Usalo sólo para mercadería que no tiene costo por prenda.' : hint}
                        </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">También por chat: decile a Lau <em>“gasté 20000 en publicidad”</em> o <em>“pagué 8000 de bolsas ayer”</em>.</p>
                </div>

                {/* Total + filtro + por rubro */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] text-white p-6 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Total gastado ({range === 'all' ? 'histórico' : `${range} días`})</p>
                            <p className="text-3xl font-black text-[#E8C65E]">{formatMoney(total)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <select value={range} onChange={e => setRange(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white">
                                <option value="7">Últimos 7 días</option>
                                <option value="30">Últimos 30 días</option>
                                <option value="all">Todo</option>
                            </select>
                        </div>
                    </div>
                    {porRubro.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Por rubro</p>
                            <div className="space-y-2">
                                {porRubro.map(r => (
                                    <div key={r.categoria} className="flex items-center gap-3 text-sm">
                                        <span className="w-28 shrink-0 text-slate-300">{r.label}</span>
                                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div className="h-full rounded-full bg-[#E8C65E]" style={{ width: `${total > 0 ? Math.max(3, (r.total / total) * 100) : 0}%` }} />
                                        </div>
                                        <span className="w-24 text-right font-bold tabular-nums">{formatMoney(r.total)}</span>
                                        <span className="w-8 text-right text-xs text-slate-500">{Math.round(total > 0 ? (r.total / total) * 100 : 0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-white/5">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-10">No hay gastos cargados en este período. Cargá el primero arriba 👆</p>
                    )}
                    {[...filtered].sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0)).map(e => (
                        <div key={e.id} className="flex items-center justify-between gap-4 p-4">
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{e.concept || 'Gasto'}</p>
                                <p className="text-xs text-slate-400">
                                    {etiquetaDeCategoria(e.category)} · {e.date ? new Date(Number(e.date)).toLocaleDateString('es-AR') : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-slate-900 dark:text-white">{formatMoney(Number(e.amount) || 0)}</span>
                                <button onClick={() => deleteExpense(e.id)} title="Eliminar" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
