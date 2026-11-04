import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { Users, Eye, Smartphone, Monitor, Trophy, RotateCcw } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { registroPorDia, totalesDeVisitas, ORIGENES } from '../../utils/visitas';

const PERIODOS = [
    { dias: 7, label: '7 días' },
    { dias: 30, label: '30 días' },
    { dias: 90, label: '90 días' },
];

const Tarjeta = ({ icono: Icono, titulo, valor, pie }) => (
    <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            <Icono className="w-3.5 h-3.5 text-[#E8C65E]" /> {titulo}
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{valor}</p>
        {pie && <p className="text-[11px] text-slate-400 mt-1">{pie}</p>}
    </div>
);

const Barras = ({ titulo, datos, etiquetas }) => {
    const total = Object.values(datos).reduce((a, b) => a + b, 0);
    const filas = Object.entries(datos).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">{titulo}</h3>
            {filas.length === 0 ? (
                <p className="text-sm text-slate-400">Todavía no hay datos en este período.</p>
            ) : (
                <ul className="space-y-3">
                    {filas.map(([k, n]) => (
                        <li key={k}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-700 dark:text-slate-200">{etiquetas[k] || k}</span>
                                <span className="text-slate-400">{n} · {Math.round((n / total) * 100)}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div className="h-full bg-[#E8C65E]" style={{ width: `${(n / total) * 100}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Borra los tres registros de visitas: por día, por hora (el gráfico del Inicio)
// y el total. Una tanda de Firestore admite hasta 500 operaciones.
const borrarVisitas = async () => {
    for (const nombre of ['visit_stats_daily', 'visit_stats_hourly']) {
        const { docs } = await getDocs(collection(db, nombre));
        for (let i = 0; i < docs.length; i += 400) {
            const tanda = writeBatch(db);
            docs.slice(i, i + 400).forEach(d => tanda.delete(d.ref));
            await tanda.commit();
        }
    }
    await setDoc(doc(db, 'stats', 'visits'), { count: 0 });
};

export const VisitasView = () => {
    const { visitStatsHourly = [], addToast } = useStore();
    const [diarios, setDiarios] = useState([]);
    const [dias, setDias] = useState(30);
    const [borrando, setBorrando] = useState(false);

    const ponerEnCero = async () => {
        if (!window.confirm('¿Poner las visitas en cero? Se borra todo el registro y no se puede recuperar.')) return;
        setBorrando(true);
        try {
            await borrarVisitas();
            addToast?.('Visitas en cero', 'success');
        } catch {
            addToast?.('No se pudieron borrar las visitas', 'error');
        }
        setBorrando(false);
    };

    useEffect(() => onSnapshot(collection(db, 'visit_stats_daily'), (snap) => {
        setDiarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => setDiarios([])), []);

    const filas = useMemo(() => registroPorDia(diarios, visitStatsHourly, dias), [diarios, visitStatsHourly, dias]);
    const t = useMemo(() => totalesDeVisitas(filas), [filas]);
    const conRegistro = filas.filter(f => !f.aprox).length;
    const maxVisitas = Math.max(1, ...filas.map(f => f.visitantes ?? f.visitas));

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-[#E8C65E]" /> Visitas a la tienda</h2>
                    <p className="text-sm text-slate-400 mt-1">Cuántas personas entraron cada día y de dónde llegaron. No cuenta las visitas de ustedes.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={ponerEnCero}
                        disabled={borrando}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" /> {borrando ? 'Borrando…' : 'Poner en cero'}
                    </button>
                    {PERIODOS.map(p => (
                        <button
                            key={p.dias}
                            onClick={() => setDias(p.dias)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${dias === p.dias ? 'bg-[#E8C65E] text-black' : 'bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <Tarjeta icono={Users} titulo="Visitantes" valor={t.visitantes} pie="Personas distintas (una por celular o compu por día)" />
                <Tarjeta icono={Eye} titulo="Visitas" valor={t.visitas} pie="Veces que entraron" />
                <Tarjeta icono={Users} titulo="Promedio por día" valor={conRegistro ? Math.round(t.visitantes / conRegistro) : '—'} pie="Visitantes" />
                <Tarjeta icono={Trophy} titulo="Mejor día" valor={t.mejor?.visitantes ? t.mejor.visitantes : '—'} pie={t.mejor?.visitantes ? t.mejor.etiqueta : 'Todavía sin datos'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
                <Barras titulo="De dónde llegaron" datos={t.origen} etiquetas={ORIGENES} />
                <Barras titulo="Con qué entraron" datos={t.dispositivo} etiquetas={{ celular: 'Celular', computadora: 'Computadora' }} />
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-4 font-medium">Día</th>
                            <th className="p-4 font-medium text-right">Visitantes</th>
                            <th className="p-4 font-medium text-right">Visitas</th>
                            <th className="p-4 font-medium text-right hidden sm:table-cell"><Smartphone className="w-4 h-4 inline" /></th>
                            <th className="p-4 font-medium text-right hidden sm:table-cell"><Monitor className="w-4 h-4 inline" /></th>
                            <th className="p-4 font-medium hidden md:table-cell">Llegaron más por</th>
                            <th className="p-4 w-1/4 hidden lg:table-cell" />
                        </tr>
                    </thead>
                    <tbody>
                        {filas.map(f => {
                            const principal = Object.entries(f.origen).sort((a, b) => b[1] - a[1])[0];
                            const n = f.visitantes ?? f.visitas;
                            return (
                                <tr key={f.fecha} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                                    <td className="p-4 text-slate-800 dark:text-slate-100 font-medium whitespace-nowrap">{f.etiqueta}</td>
                                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">{f.visitantes ?? <span className="text-slate-500 font-normal">—</span>}</td>
                                    <td className="p-4 text-right text-slate-600 dark:text-slate-300">{f.aprox && f.visitas ? `≈${f.visitas}` : f.visitas}</td>
                                    <td className="p-4 text-right text-slate-500 hidden sm:table-cell">{f.aprox ? '' : (f.dispositivo.celular || 0)}</td>
                                    <td className="p-4 text-right text-slate-500 hidden sm:table-cell">{f.aprox ? '' : (f.dispositivo.computadora || 0)}</td>
                                    <td className="p-4 text-slate-500 hidden md:table-cell">{principal ? ORIGENES[principal[0]] || principal[0] : ''}</td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div className={`h-full ${f.aprox ? 'bg-slate-500/50' : 'bg-[#E8C65E]'}`} style={{ width: `${(n / maxVisitas) * 100}%` }} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
                El registro por día arrancó el 1/11/2026 a la noche. Los días anteriores no tienen visitantes distintos: la columna Visitas (≈) sale del conteo por hora, donde alguien que estuvo dos horas cuenta dos veces.
            </p>
        </div>
    );
};
