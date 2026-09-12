import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Search, Printer, ArrowLeft, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { GUIAS, buscarGuias } from './contenido';

// Sección "Guías" del panel: los manuales de uso de la tienda, siempre online.
// Portada con tarjetas + lector con índice lateral. La guía abierta se
// recuerda en el navegador para retomar donde quedó.

const CLAVE_RECUERDO = 'lbde-guia-abierta';

const leerRecuerdo = () => {
    try { return localStorage.getItem(CLAVE_RECUERDO) || null; } catch { return null; }
};
const guardarRecuerdo = (id) => {
    try { id ? localStorage.setItem(CLAVE_RECUERDO, id) : localStorage.removeItem(CLAVE_RECUERDO); } catch { /* sin storage, sin drama */ }
};

const COLOR_PARA = {
    'Dueño': 'bg-slate-900 text-white dark:bg-white dark:text-black',
    'Quien carga productos': 'bg-[#E8C65E] text-black',
    'Los dos': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
};

const Etiqueta = ({ para }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${COLOR_PARA[para] || COLOR_PARA['Los dos']}`}>
        <User className="w-3 h-3" /> {para}
    </span>
);

const Tarjeta = ({ guia, onAbrir, numero }) => {
    const Icono = guia.icono;
    return (
        <button
            onClick={() => onAbrir(guia.id)}
            className="group text-left relative overflow-hidden bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 hover:border-[#E8C65E]/50 transition-all duration-300 flex flex-col gap-4"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E8C65E] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-[#E8C65E] group-hover:bg-[#E8C65E]/10 transition-colors">
                    <Icono className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black text-slate-300 dark:text-slate-600">{String(numero).padStart(2, '0')}</span>
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{guia.titulo}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{guia.resumen}</p>
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                <Etiqueta para={guia.para} />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400"><Clock className="w-3.5 h-3.5" /> {guia.duracion}</span>
            </div>
        </button>
    );
};

const Portada = ({ onAbrir }) => {
    const [q, setQ] = useState('');
    const lista = useMemo(() => buscarGuias(q), [q]);
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#E8C65E]" /> Guías
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                        Los manuales de la tienda, paso a paso y con dibujos. Siempre están acá, online, para las dos personas que la manejan. Cada una dice al principio para quién es y cuánto tarda.
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar: etiqueta, excel, gemini…"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-[#E8C65E]/50"
                    />
                </div>
            </div>

            {lista.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
                    Ninguna guía habla de <strong>“{q}”</strong>. Probá con otra palabra, o preguntale a Lau.
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {lista.map((g) => <Tarjeta key={g.id} guia={g} numero={GUIAS.indexOf(g) + 1} onAbrir={onAbrir} />)}
                </div>
            )}
        </div>
    );
};

const Lector = ({ guia, onVolver, onAbrir }) => {
    const Icono = guia.icono;
    const { Contenido } = guia;
    const tope = useRef(null);
    const [activa, setActiva] = useState(guia.secciones[0]?.[0]);
    const idx = GUIAS.indexOf(guia);
    const anterior = GUIAS[idx - 1];
    const siguiente = GUIAS[idx + 1];

    // Al cambiar de guía, arrancar desde arriba.
    useEffect(() => {
        tope.current?.scrollIntoView({ block: 'start' });
        setActiva(guia.secciones[0]?.[0]);
    }, [guia]);

    // Resaltar en el índice la sección que está a la vista.
    useEffect(() => {
        const nodos = guia.secciones.map(([id]) => document.getElementById(id)).filter(Boolean);
        if (!nodos.length || typeof IntersectionObserver === 'undefined') return undefined;
        const obs = new IntersectionObserver((entradas) => {
            const visible = entradas.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
            if (visible) setActiva(visible.target.id);
        }, { rootMargin: '-20% 0px -60% 0px' });
        nodos.forEach(n => obs.observe(n));
        return () => obs.disconnect();
    }, [guia]);

    const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <div className="space-y-6" id="guia-impresa">
            <div ref={tope} className="scroll-mt-4" />
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button onClick={onVolver} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#E8C65E] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Todas las guías
                </button>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#E8C65E]/50 transition-colors"
                >
                    <Printer className="w-4 h-4" /> Imprimir / guardar PDF
                </button>
            </div>

            {/* Cabecera de la guía */}
            <header className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] p-6 sm:p-8">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-[#E8C65E]" />
                <div className="flex flex-wrap items-center gap-3 text-[11px] mb-3">
                    <Etiqueta para={guia.para} />
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-400"><Clock className="w-3.5 h-3.5" /> {guia.duracion} de lectura</span>
                    <span className="font-black text-slate-300 dark:text-slate-600">Guía {String(idx + 1).padStart(2, '0')} de {GUIAS.length}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-start gap-3 leading-tight">
                    <Icono className="w-8 h-8 text-[#E8C65E] shrink-0 mt-0.5" /> {guia.titulo}
                </h2>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-3 max-w-3xl leading-relaxed">{guia.resumen}</p>
            </header>

            <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">
                {/* Índice lateral */}
                <nav className="lg:sticky lg:top-4 print:hidden order-first">
                    <p className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">En esta guía</p>
                    <ol className="space-y-0.5">
                        {guia.secciones.map(([id, titulo]) => (
                            <li key={id}>
                                <button
                                    onClick={() => irA(id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] leading-snug transition-colors border-l-2 ${activa === id
                                        ? 'border-[#E8C65E] text-slate-900 dark:text-white font-bold bg-[#E8C65E]/10'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                >
                                    {titulo}
                                </button>
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Contenido */}
                <article className="min-w-0 space-y-2 pb-8">
                    <Contenido abrir={onAbrir} />

                    {/* Anterior / siguiente */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-10 print:hidden">
                        {anterior ? (
                            <button onClick={() => onAbrir(anterior.id)} className="group text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#E8C65E]/50 transition-colors">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400"><ChevronLeft className="w-3 h-3" /> Anterior</span>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1 group-hover:text-[#B38728] dark:group-hover:text-[#E8C65E]">{anterior.titulo}</p>
                            </button>
                        ) : <span />}
                        {siguiente && (
                            <button onClick={() => onAbrir(siguiente.id)} className="group text-right p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#E8C65E]/50 transition-colors">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Siguiente <ChevronRight className="w-3 h-3" /></span>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1 group-hover:text-[#B38728] dark:group-hover:text-[#E8C65E]">{siguiente.titulo}</p>
                            </button>
                        )}
                    </div>
                </article>
            </div>
        </div>
    );
};

export const GuiasView = ({ guiaInicial } = {}) => {
    const [abierta, setAbierta] = useState(() => guiaInicial || leerRecuerdo());
    const guia = GUIAS.find(g => g.id === abierta) || null;

    const abrir = (id) => { setAbierta(id); guardarRecuerdo(id); };
    const volver = () => { setAbierta(null); guardarRecuerdo(null); };

    return guia
        ? <Lector guia={guia} onVolver={volver} onAbrir={abrir} />
        : <Portada onAbrir={abrir} />;
};
