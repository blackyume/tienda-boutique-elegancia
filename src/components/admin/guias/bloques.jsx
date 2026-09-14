import React from 'react';
import { AlertTriangle, Lightbulb, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

// Piezas con las que se escriben las guías. La idea es que el texto de cada
// guía se lea como una receta: pasos numerados, un camino de menú a seguir,
// y avisos que se distinguen a la vista (rojo = te puede morder, dorado =
// consejo, gris = dato).

const ORO = '#E8C65E';

/** Título de sección dentro de una guía, con ancla para el índice lateral. */
export const Seccion = ({ id, titulo, children }) => (
    <section id={id} className="scroll-mt-24 space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 pt-6">
            <span className="w-1.5 h-6 rounded-full shrink-0" style={{ background: ORO }} />
            {titulo}
        </h3>
        {children}
    </section>
);

/** Párrafo normal. */
export const P = ({ children, className = '' }) => (
    <p className={`text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 ${className}`}>{children}</p>
);

/** Nombre de un botón o menú, o algo que hay que escribir textual. */
export const K = ({ children }) => (
    <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-slate-700 text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap font-sans">
        {children}
    </kbd>
);

/** Nombre de archivo, columna o valor: monoespaciado. */
export const Cod = ({ children }) => (
    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[13px] font-mono text-[#8a6a1a] dark:text-[#E8C65E]">
        {children}
    </code>
);

/** Camino de menú: Admin → Inventario → Importar Excel. */
export const Ruta = ({ pasos = [] }) => (
    <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700">
        {pasos.map((p, i) => (
            <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className={`text-[13px] font-bold ${i === pasos.length - 1 ? 'text-[#8a6a1a] dark:text-[#E8C65E]' : 'text-slate-600 dark:text-slate-300'}`}>{p}</span>
            </React.Fragment>
        ))}
    </div>
);

/** Lista de pasos numerados con círculo dorado. Cada hijo es un paso. */
export const Pasos = ({ children }) => (
    <ol className="space-y-3 list-none pl-0">
        {React.Children.map(children, (child, i) => (
            <li className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-black shadow-md"
                    style={{ background: 'linear-gradient(135deg, #BF953F, #FCF6BA 50%, #B38728)' }}>
                    {i + 1}
                </span>
                <div className="flex-1 pt-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">{child}</div>
            </li>
        ))}
    </ol>
);

/** Un paso. Es sólo un contenedor; Pasos le pone el número. */
export const Paso = ({ children }) => <>{children}</>;

/** Lista con tildes verdes: cosas a tener a mano o checklist. */
export const Lista = ({ items = [] }) => (
    <ul className="space-y-2">
        {items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
                <span>{it}</span>
            </li>
        ))}
    </ul>
);

const AVISOS = {
    ojo: { icon: AlertTriangle, cls: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-100', ico: 'text-red-500', titulo: 'Ojo' },
    tip: { icon: Lightbulb, cls: 'bg-[#E8C65E]/10 border-[#E8C65E]/40 text-slate-800 dark:text-slate-100', ico: 'text-[#B38728] dark:text-[#E8C65E]', titulo: 'Consejo' },
    dato: { icon: Info, cls: 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200', ico: 'text-slate-400', titulo: 'Dato' },
};

/** Recuadro de aviso. tipo: 'ojo' | 'tip' | 'dato'. */
export const Aviso = ({ tipo = 'dato', titulo, children }) => {
    const a = AVISOS[tipo] || AVISOS.dato;
    const Icon = a.icon;
    return (
        <div className={`flex gap-3 p-4 rounded-xl border ${a.cls}`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${a.ico}`} />
            <div className="text-[14px] leading-relaxed space-y-1 min-w-0">
                <p className="font-bold text-[12px] uppercase tracking-widest opacity-80">{titulo || a.titulo}</p>
                <div>{children}</div>
            </div>
        </div>
    );
};

/** Tabla simple: cabecera + filas de texto/JSX. */
export const Tabla = ({ cabecera = [], filas = [] }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
            <thead>
                <tr className="bg-slate-50 dark:bg-white/5 text-left text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {cabecera.map((c, i) => <th key={i} className="px-4 py-3 font-bold">{c}</th>)}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filas.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] align-top">
                        {f.map((c, j) => <td key={j} className="px-4 py-3 text-slate-700 dark:text-slate-200">{c}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/** Burbuja de chat: lo que se le escribe a Lau (de='vos') o lo que contesta (de='lau'). */
export const Mensaje = ({ de = 'vos', children }) => {
    const esVos = de === 'vos';
    return (
        <div className={`flex ${esVos ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${esVos
                ? 'bg-[#E8C65E] text-black rounded-br-sm'
                : 'bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm'}`}>
                {!esVos && <p className="text-[10px] font-black uppercase tracking-widest text-[#B38728] dark:text-[#E8C65E] mb-1">Lau</p>}
                {children}
            </div>
        </div>
    );
};

/** Botones de opción como los que muestra Lau. */
export const Botones = ({ opciones = [] }) => (
    <div className="flex flex-wrap gap-2 pl-2">
        {opciones.map((o, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-[13px] font-semibold border border-[#E8C65E]/50 text-[#8a6a1a] dark:text-[#E8C65E] bg-[#E8C65E]/5">{o}</span>
        ))}
    </div>
);

/** Marco para una ilustración, con su epígrafe. */
export const Figura = ({ titulo, children }) => (
    <figure className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616] overflow-hidden">
        <div className="p-3 sm:p-6 overflow-x-auto"><div className="min-w-[560px] sm:min-w-0">{children}</div></div>
        <p className="sm:hidden px-4 pb-2 text-[11px] text-slate-400">← deslizá para ver el dibujo completo →</p>
        {titulo && <figcaption className="px-5 py-3 text-[13px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">{titulo}</figcaption>}
    </figure>
);

/** Enlace externo que abre en pestaña nueva. */
export const Link = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#8a6a1a] dark:text-[#E8C65E] underline decoration-[#E8C65E]/40 underline-offset-2 hover:decoration-[#E8C65E] break-all">
        {children || href}
    </a>
);

/**
 * Toda la guía de un vistazo: tarjetas grandes con un dibujo, dos o tres
 * palabras y (opcional) una línea más. Va siempre al principio.
 * pasos: [{ icono: '📎', titulo: 'Tocá el clip', detalle: 'y elegí la foto' }]
 */
export const Resumen = ({ titulo = 'Toda la guía en un vistazo', pasos = [] }) => (
    <div className="rounded-2xl border border-[#E8C65E]/40 bg-[#E8C65E]/[0.07] p-4 sm:p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#8a6a1a] dark:text-[#E8C65E] mb-3">{titulo}</p>
        <ol className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${pasos.length > 4 ? 120 : 150}px, 1fr))` }}>
            {pasos.map((p, i) => (
                <li key={i} className="relative rounded-xl bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 px-3 pt-5 pb-3 text-center shadow-sm">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black text-black shadow"
                        style={{ background: 'linear-gradient(135deg, #BF953F, #FCF6BA 50%, #B38728)' }}>{i + 1}</span>
                    <div className="text-[34px] leading-none mt-1" aria-hidden="true">{p.icono}</div>
                    <p className="font-bold text-[14px] text-slate-900 dark:text-white mt-2 leading-tight">{p.titulo}</p>
                    {p.detalle && <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{p.detalle}</p>}
                </li>
            ))}
        </ol>
    </div>
);

/** Un número grande con su explicación: "$11.200 · por cada visita". */
export const Numero = ({ valor, etiqueta, nota, tono = 'oro' }) => {
    const cls = { oro: 'text-[#8a6a1a] dark:text-[#E8C65E]', verde: 'text-emerald-600 dark:text-emerald-400', rojo: 'text-red-500' }[tono] || '';
    return (
        <div className="flex-1 min-w-[150px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f1f1f] p-4">
            <p className={`text-2xl sm:text-3xl font-black leading-none ${cls}`}>{valor}</p>
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-2">{etiqueta}</p>
            {nota && <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{nota}</p>}
        </div>
    );
};

/** Fila de Numeros. */
export const Numeros = ({ children }) => <div className="flex flex-wrap gap-3">{children}</div>;

/** Dos columnas: lo que está bien (verde) y lo que está mal (rojo). */
export const BienMal = ({ bien = [], mal = [], tituloBien = 'Así sí', tituloMal = 'Así no' }) => (
    <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/[0.06] p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">✓ {tituloBien}</p>
            <ul className="space-y-1.5">{bien.map((b, i) => <li key={i} className="text-[14px] text-slate-800 dark:text-slate-100 leading-snug">{b}</li>)}</ul>
        </div>
        <div className="rounded-xl border border-red-400/40 bg-red-500/[0.06] p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">✗ {tituloMal}</p>
            <ul className="space-y-1.5">{mal.map((m, i) => <li key={i} className="text-[14px] text-slate-800 dark:text-slate-100 leading-snug">{m}</li>)}</ul>
        </div>
    </div>
);

/** Quién hace este paso: 'vos' | 'solo' | 'correo' | 'clienta'. Va al lado de un título de paso. */
export const Quien = ({ quien = 'vos' }) => {
    const e = {
        vos: ['VOS', 'bg-[#E8C65E] text-black'],
        solo: ['SE HACE SOLO', 'bg-emerald-500 text-white'],
        correo: ['EL CORREO', 'bg-blue-600 text-white'],
        clienta: ['LA CLIENTA', 'bg-purple-500 text-white'],
    }[quien] || ['VOS', 'bg-[#E8C65E] text-black'];
    return <span className={`inline-block align-middle ml-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${e[1]}`}>{e[0]}</span>;
};
