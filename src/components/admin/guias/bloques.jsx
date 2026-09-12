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
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${esVos
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
        <div className="p-4 sm:p-6">{children}</div>
        {titulo && <figcaption className="px-5 py-3 text-[13px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">{titulo}</figcaption>}
    </figure>
);

/** Enlace externo que abre en pestaña nueva. */
export const Link = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#8a6a1a] dark:text-[#E8C65E] underline decoration-[#E8C65E]/40 underline-offset-2 hover:decoration-[#E8C65E] break-all">
        {children || href}
    </a>
);
