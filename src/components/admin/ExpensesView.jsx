import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Wallet, Plus, Trash2, Calendar } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';

const CATS = [
    { value: 'mercaderia', label: 'Mercadería' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'publicidad', label: 'Publicidad' },
    { value: 'envios', label: 'Envíos' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'otros', label: 'Otros' },
];

const inputCls = 'p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors';

export const ExpensesView = () => {
    const { expenses = [], addExpense, deleteExpense, addToast } = useStore();
    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('mercaderia');
    const [range, setRange] = useState('30');
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => {
        if (range === 'all') return expenses;
        const cutoff = Date.now() - parseInt(range) * 864e5;
        return expenses.filter(e => (Number(e.date) || 0) >= cutoff);
    }, [expenses, range]);

    const total = useMemo(() => filtered.reduce((a, e) => a + (Number(e.amount) || 0), 0), [filtered]);

    const handleAdd = async () => {
        const amt = Number(amount) || 0;
        if (amt <= 0) return addToast('Poné un monto válido', 'error');
        if (!concept.trim()) return addToast('Escribí qué fue el gasto', 'error');
        setSaving(true);
        await addExpense({ amount: amt, concept: concept.trim(), category, date: Date.now() });
        setConcept(''); setAmount('');
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#121212] p-6 lg:p-10 font-sans text-slate-900 dark:text-slate-100">
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                <div>
                    <h1 className="text-3xl font-bold tracking-wide flex items-center gap-3">
                        <Wallet className="w-7 h-7 text-[#E8C65E]" /> Gastos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Registrá lo que gastás en el negocio. Se resta de tu ganancia neta.</p>
                </div>

                {/* Alta de gasto */}
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold mb-4 text-slate-800 dark:text-white">Nuevo gasto</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <input value={concept} onChange={e => setConcept(e.target.value)} placeholder="¿Qué fue? (ej: tela, etiquetas)" className={inputCls + ' sm:col-span-5'} />
                        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Monto $" className={inputCls + ' sm:col-span-3'} />
                        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls + ' sm:col-span-2 [&>option]:bg-slate-800'}>
                            {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <Button onClick={handleAdd} disabled={saving} className="sm:col-span-2 bg-[#E8C65E] hover:bg-[#B8932E] text-white justify-center">
                            <Plus className="w-4 h-4 mr-1" /> Cargar
                        </Button>
                    </div>
                </div>

                {/* Total + filtro */}
                <div className="flex items-center justify-between flex-wrap gap-3 bg-gradient-to-br from-[#1a1a1a] to-[#121212] text-white p-6 rounded-2xl">
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

                {/* Lista */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-white/5">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-10">No hay gastos cargados en este período. Cargá el primero arriba 👆</p>
                    )}
                    {filtered.map(e => (
                        <div key={e.id} className="flex items-center justify-between gap-4 p-4">
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{e.concept || 'Gasto'}</p>
                                <p className="text-xs text-slate-400">
                                    {(CATS.find(c => c.value === e.category)?.label || e.category || 'Otros')} · {e.date ? new Date(Number(e.date)).toLocaleDateString('es-AR') : ''}
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
