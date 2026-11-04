import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { MessageCircle, Mail, Check, RotateCcw, Trash2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { EmptyState } from '../ui/EmptyState';

const FILTROS = [
    { id: 'nueva', label: 'Sin responder' },
    { id: 'respondida', label: 'Respondidas' },
    { id: 'todas', label: 'Todas' },
];

const fecha = (ts) => {
    const d = ts?.toDate?.();
    if (!d) return '—';
    return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// Abre un correo nuevo en el Gmail de la tienda, ya dirigido a la clienta.
const enlaceRespuesta = (c) => {
    const asunto = c.producto ? `Tu consulta por ${c.producto}` : 'Tu consulta en La Boutique de la Elegancia';
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}&su=${encodeURIComponent(asunto)}`;
};

export const ConsultasView = () => {
    const { addToast } = useStore();
    const [consultas, setConsultas] = useState([]);
    const [filtro, setFiltro] = useState('nueva');

    useEffect(() => onSnapshot(collection(db, 'consultas'), (snap) => {
        setConsultas(snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.creada?.toMillis?.() || 0) - (a.creada?.toMillis?.() || 0)));
    }, () => setConsultas([])), []);

    const lista = useMemo(() => (filtro === 'todas' ? consultas : consultas.filter(c => c.estado === filtro)), [consultas, filtro]);
    const sinResponder = consultas.filter(c => c.estado === 'nueva').length;

    const cambiarEstado = async (c, estado) => {
        try {
            await updateDoc(doc(db, 'consultas', c.id), { estado });
        } catch {
            addToast?.('No se pudo guardar', 'error');
        }
    };

    const borrar = async (c) => {
        if (!window.confirm(`¿Borrar la consulta de ${c.nombre}?`)) return;
        try {
            await deleteDoc(doc(db, 'consultas', c.id));
        } catch {
            addToast?.('No se pudo borrar', 'error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle className="w-6 h-6 text-[#E8C65E]" /> Consultas</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {sinResponder ? `${sinResponder} sin responder.` : 'Nada pendiente.'} También llegan al correo de la tienda.
                    </p>
                </div>
                <div className="flex gap-2">
                    {FILTROS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFiltro(f.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filtro === f.id ? 'bg-[#E8C65E] text-black' : 'bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {lista.length === 0 ? (
                <EmptyState
                    icon={MessageCircle}
                    title={filtro === 'nueva' ? 'No hay consultas sin responder' : 'Sin consultas todavía'}
                    subtitle="Cuando una clienta escriba desde la burbuja dorada, la página de Contacto o una prenda, aparece acá."
                />
            ) : (
                <ul className="space-y-3">
                    {lista.map(c => (
                        <li key={c.id} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {c.nombre} <span className="font-normal text-sm text-slate-400 break-all">{c.email}</span>
                                </p>
                                <span className="text-xs text-slate-400">{fecha(c.creada)}</span>
                            </div>
                            {c.producto && <p className="text-xs font-bold text-[#B8932E] dark:text-[#E8C65E] mb-2">Por: {c.producto}</p>}
                            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{c.mensaje}</p>
                            <p className="text-[11px] text-slate-400 mt-3">
                                {c.novedades ? 'Aceptó recibir novedades: está en Newsletter.' : 'No pidió novedades: no le mandes publicidad.'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <a
                                    href={enlaceRespuesta(c)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8C65E] text-black text-sm font-bold hover:brightness-105 transition"
                                >
                                    <Mail className="w-4 h-4" /> Responder
                                </a>
                                {c.estado === 'nueva' ? (
                                    <button onClick={() => cambiarEstado(c, 'respondida')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <Check className="w-4 h-4" /> Marcar respondida
                                    </button>
                                ) : (
                                    <button onClick={() => cambiarEstado(c, 'nueva')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Volver a sin responder
                                    </button>
                                )}
                                <button onClick={() => borrar(c)} aria-label="Borrar" className="inline-flex items-center px-3 py-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
