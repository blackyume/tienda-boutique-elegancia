import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';
import { mesDeVentas, plataCorta } from '../../utils/ventasPorDia';

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * El almanaque del mes con lo vendido cada día. Un día con ventas se pinta de
 * oro (más fuerte cuanto más se vendió) y al tocarlo abre Ventas filtrado en
 * esa fecha. Cuenta las ventas de la web y las dictadas a Lau; las anuladas no.
 */
export const CalendarioVentas = ({ orders = [], onVerDia }) => {
    const [cursor, setCursor] = useState(() => { const d = new Date(); return { anio: d.getFullYear(), mes: d.getMonth() }; });
    const c = useMemo(() => mesDeVentas(orders, cursor), [orders, cursor]);

    const mover = (n) => setCursor(({ anio, mes }) => { const d = new Date(anio, mes + n, 1); return { anio: d.getFullYear(), mes: d.getMonth() }; });
    const volverAHoy = () => { const d = new Date(); setCursor({ anio: d.getFullYear(), mes: d.getMonth() }); };
    const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#E8C65E]" /> Calendario de ventas
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Cuánto vendiste cada día. Tocá un día para ver esas ventas.</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                    <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior" className="p-1.5 rounded-md text-slate-500 hover:text-[#E8C65E] hover:bg-white dark:hover:bg-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button type="button" onClick={volverAHoy} className="px-2 text-sm font-bold text-slate-800 dark:text-white min-w-[150px] text-center hover:text-[#E8C65E] transition-colors" title="Volver a este mes">{c.titulo}</button>
                    <button type="button" onClick={() => mover(1)} disabled={c.esMesActual} aria-label="Mes siguiente" className="p-1.5 rounded-md text-slate-500 hover:text-[#E8C65E] hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:text-slate-500"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Resumen del mes */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.esMesActual ? 'Este mes' : capitalizar(c.nombreMes)}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">{formatMoney(c.total)}</p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                        {c.cantidad === 0 ? 'sin ventas' : `${c.cantidad} ${c.cantidad === 1 ? 'venta' : 'ventas'}`}
                        {c.anterior.variacion !== null && (
                            <> · <span className={c.anterior.variacion >= 0 ? 'text-emerald-500' : 'text-red-500'}>{c.anterior.variacion >= 0 ? '↑' : '↓'} {Math.abs(c.anterior.variacion)}%</span> vs {c.anterior.nombreMes}</>
                        )}
                    </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mejor día</p>
                    {c.mejorDia ? (
                        <>
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">{formatMoney(c.mejorDia.total)}</p>
                            <p className="text-[11px] text-slate-400 leading-tight">{capitalizar(c.mejorDia.nombre)} · {c.mejorDia.cantidad} {c.mejorDia.cantidad === 1 ? 'venta' : 'ventas'}</p>
                        </>
                    ) : <p className="text-lg font-black text-slate-400 leading-tight">—</p>}
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Días con venta</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{c.diasConVenta} <span className="text-xs font-bold text-slate-400">de {c.dias}</span></p>
                    <p className="text-[11px] text-slate-400 leading-tight truncate">{c.diasConVenta ? `${plataCorta(c.promedioPorDiaConVenta)} por día con venta` : 'todavía ninguno'}</p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {DIAS.map((d, i) => <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1">{d}</div>)}
            </div>
            <div className="space-y-1">
                {c.semanas.map((semana, i) => (
                    <div key={i} className="grid grid-cols-7 gap-1">
                        {semana.map((dia, j) => {
                            if (!dia) return <div key={j} />;
                            const conVenta = dia.cantidad > 0;
                            const fuerza = conVenta && c.maximo > 0 ? 0.14 + 0.5 * (dia.total / c.maximo) : 0;
                            const Tag = conVenta && onVerDia ? 'button' : 'div';
                            return (
                                <Tag
                                    key={j}
                                    type={Tag === 'button' ? 'button' : undefined}
                                    onClick={Tag === 'button' ? () => onVerDia(dia.clave) : undefined}
                                    title={conVenta ? `${dia.dia}/${c.mes + 1}: ${formatMoney(dia.total)} en ${dia.cantidad} ${dia.cantidad === 1 ? 'venta' : 'ventas'}` : undefined}
                                    style={conVenta ? { backgroundColor: `rgba(232,198,94,${fuerza.toFixed(2)})` } : undefined}
                                    className={`relative h-14 sm:h-16 rounded-lg border text-left p-1.5 transition-all
                                        ${conVenta ? 'border-[#E8C65E]/40 hover:border-[#E8C65E] hover:-translate-y-0.5 cursor-pointer' : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30'}
                                        ${dia.esHoy ? 'ring-2 ring-[#E8C65E] ring-offset-1 ring-offset-white dark:ring-offset-[#1a1a1a]' : ''}
                                        ${dia.futuro ? 'opacity-35' : ''}`}
                                >
                                    <span className={`text-[11px] font-bold leading-none ${dia.esHoy ? 'text-[#B8932E] dark:text-[#E8C65E]' : conVenta ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{dia.dia}</span>
                                    {conVenta && (
                                        <>
                                            <span className="hidden md:block absolute left-1.5 right-1 bottom-1.5 text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate">{plataCorta(dia.total)}</span>
                                            <span className="hidden md:block absolute right-1.5 top-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">{dia.cantidad}</span>
                                            <span className="md:hidden absolute left-1.5 bottom-1.5 text-[10px] font-black text-slate-900 dark:text-white">{dia.cantidad}<span className="text-[8px] font-bold opacity-70"> v.</span></span>
                                        </>
                                    )}
                                </Tag>
                            );
                        })}
                    </div>
                ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
                {c.cantidad === 0
                    ? (c.esMesActual ? 'Cuando entre la primera venta del mes, el día se pinta de oro.' : `Sin ventas en ${c.nombreMes}.`)
                    : 'Más oro, más vendido. El número chico arriba a la derecha es cuántas ventas hubo ese día. Cuenta la web y lo que le dictás a Lau; las anuladas no.'}
            </p>
        </div>
    );
};
