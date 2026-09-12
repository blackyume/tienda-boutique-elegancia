import React, { useMemo, useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, Check, Users, ShoppingBag, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';
import { celdasDesdeExcel, leerVentasDeCeldas, planearVentas, fechaDesdeNombre, notaDesdeNombre } from '../../utils/importarVentas';

// Importar ventas hechas por fuera desde la planilla del dueño (una columna
// por clienta, o una tabla). Cada clienta queda como un pedido manual, igual
// que los que registra Lau, y suma en Ventas y en el Dashboard.

const CANALES = ['WhatsApp', 'Local', 'Instagram', 'Feria', 'Venta externa'];

const Contador = ({ icono: Icono, n, texto, color }) => (
    <div className={`flex items-center gap-3 px-4 py-3 border ${color}`}>
        <Icono className="w-5 h-5 shrink-0" />
        <div>
            <p className="text-2xl font-bold leading-none">{n}</p>
            <p className="text-[11px] uppercase tracking-wider opacity-70 mt-1">{texto}</p>
        </div>
    </div>
);

export const ImportarVentasModal = ({ onClose }) => {
    const { inventory, orders, createOrder, updateProduct, addToast } = useStore();
    const inputRef = useRef(null);
    const [archivo, setArchivo] = useState('');
    const [leyendo, setLeyendo] = useState(false);
    const [lectura, setLectura] = useState(null); // { ventas, avisos }
    const [fecha, setFecha] = useState('');
    const [canal, setCanal] = useState('WhatsApp');
    const [descontarStock, setDescontarStock] = useState(false);
    const [aplicando, setAplicando] = useState(false);
    const [progreso, setProgreso] = useState('');
    const [listo, setListo] = useState(null);

    const recibir = async (files) => {
        const f = [...(files || [])].find(x => /\.xlsx$/i.test(x.name));
        if (!f) { addToast('Soltá un archivo .xlsx', 'error'); return; }
        setLeyendo(true);
        try {
            const celdas = await celdasDesdeExcel(await f.arrayBuffer());
            const r = leerVentasDeCeldas(celdas);
            setLectura(r);
            setArchivo(f.name);
            setFecha(fechaDesdeNombre(f.name));
            if (!r.ventas.length) addToast('No encontré ventas en la planilla', 'error');
        } catch (e) {
            console.error(e);
            addToast('No pude leer el archivo. ¿Es un .xlsx?', 'error');
        } finally {
            setLeyendo(false);
        }
    };

    const plan = useMemo(() => lectura
        ? planearVentas(lectura.ventas, { inventario: inventory, pedidos: orders, fecha, canal, nota: notaDesdeNombre(archivo), descontarStock })
        : null, [lectura, inventory, orders, fecha, canal, archivo, descontarStock]);

    const confirmar = async () => {
        if (!plan?.nuevos.length) return;
        setAplicando(true);
        let ok = 0;
        try {
            for (const pedido of plan.nuevos) {
                setProgreso(`Guardando ${pedido.customer.nombre}…`);
                const items = pedido.items.map(({ enInventario, ...i }) => i);
                await createOrder({ ...pedido, items });
                if (descontarStock) {
                    for (const i of pedido.items) {
                        if (!i.enInventario) continue;
                        const p = inventory.find(x => String(x.id) === String(i.id));
                        if (p && typeof p.stock === 'number') await updateProduct(p.id, { stock: Math.max(0, p.stock - i.quantity) });
                    }
                }
                ok++;
            }
            setListo(ok);
            addToast(`${ok} venta${ok === 1 ? '' : 's'} registrada${ok === 1 ? '' : 's'}`, 'success');
        } catch (e) {
            console.error(e);
            addToast(`Se guardaron ${ok} de ${plan.nuevos.length}. ${e.message || ''}`, 'error');
        } finally {
            setAplicando(false);
            setProgreso('');
        }
    };

    const reiniciar = () => { setLectura(null); setArchivo(''); setListo(null); };

    return (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={aplicando ? undefined : onClose}>
            <div className="bg-white dark:bg-[#111] w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-[#E8C65E]" />
                        <div>
                            <h2 className="font-luxury font-bold uppercase tracking-[0.2em] text-sm dark:text-white">Importar ventas</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">{archivo || 'Ventas hechas por fuera de la tienda, desde tu planilla'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={aplicando} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"><X className="w-5 h-5" /></button>
                </header>

                <div className="overflow-y-auto p-6 grow space-y-5">
                    {!lectura && (
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); recibir(e.dataTransfer.files); }}
                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#E8C65E] cursor-pointer p-12 text-center transition-colors"
                        >
                            <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" />
                            <p className="font-medium dark:text-white">{leyendo ? 'Leyendo la planilla…' : 'Soltá acá el Excel de ventas, o hacé click para elegirlo'}</p>
                            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                                Sirve tal cual la armás: <strong>una columna por clienta</strong>, con el nombre arriba y debajo cada prenda en cuatro líneas
                                (prenda, <code>TALLE</code>, color, <code>PRECIO $</code>), y al final <code>TOTAL</code> y <code>PAGADO</code>. También una tabla con columnas Cliente, Producto, Talle, Color, Precio.
                            </p>
                            <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { recibir(e.target.files); e.target.value = ''; }} />
                        </div>
                    )}

                    {lectura && listo == null && plan && (
                        <>
                            <div className="grid sm:grid-cols-3 gap-3">
                                <Contador icono={Users} n={plan.nuevos.length} texto={plan.nuevos.length === 1 ? 'clienta' : 'clientas'} color="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/10" />
                                <Contador icono={ShoppingBag} n={plan.prendas} texto="prendas" color="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200" />
                                <Contador icono={Check} n={formatMoney(plan.totalNuevos)} texto="total vendido" color="border-[#E8C65E]/50 text-[#8a6a1a] dark:text-[#E8C65E] bg-[#E8C65E]/5" />
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/[0.03]">
                                <label className="text-xs font-bold uppercase text-slate-500 space-y-1.5">
                                    Fecha de la venta
                                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="block w-full text-sm font-normal normal-case bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#E8C65E]" />
                                </label>
                                <label className="text-xs font-bold uppercase text-slate-500 space-y-1.5">
                                    Canal
                                    <select value={canal} onChange={(e) => setCanal(e.target.value)} className="block w-full text-sm font-normal normal-case bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#E8C65E]">
                                        {CANALES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </label>
                                <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 pt-5 cursor-pointer">
                                    <input type="checkbox" checked={descontarStock} onChange={(e) => setDescontarStock(e.target.checked)} className="mt-0.5 accent-[#E8C65E]" />
                                    <span>Descontar stock de las prendas que están en el inventario ({plan.enInventario} de {plan.prendas} coinciden por nombre)</span>
                                </label>
                            </div>

                            {(lectura.avisos.length > 0 || plan.repetidas.length > 0) && (
                                <div className="p-4 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 text-sm text-amber-900 dark:text-amber-200 space-y-1">
                                    {plan.repetidas.length > 0 && <p className="flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {plan.repetidas.length} venta{plan.repetidas.length === 1 ? ' ya estaba' : 's ya estaban'} registrada{plan.repetidas.length === 1 ? '' : 's'} con esta fecha ({plan.repetidas.map(p => p.customer.nombre).join(', ')}): no se repiten.</p>}
                                    {lectura.avisos.map((a, i) => <p key={i} className="flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {a}</p>)}
                                </div>
                            )}

                            <div className="space-y-3">
                                {plan.nuevos.map((p) => (
                                    <div key={p.id} className="border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-slate-800">
                                            <p className="font-bold text-slate-900 dark:text-white">{p.customer.nombre}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatMoney(p.total)} <span className={`ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}`}>{p.status === 'approved' ? 'pagado' : 'pendiente'}</span></p>
                                        </div>
                                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {p.items.map((i, k) => (
                                                <li key={k} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                                                    <span className="text-slate-800 dark:text-slate-100 min-w-0">
                                                        {i.quantity > 1 && <strong>{i.quantity}× </strong>}{i.name}
                                                        {(i.size || i.color) && <span className="text-slate-400"> · {[i.size && `talle ${i.size}`, i.color].filter(Boolean).join(' · ')}</span>}
                                                        {i.enInventario && <span className="ml-2 text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold">en inventario</span>}
                                                    </span>
                                                    <span className="text-slate-600 dark:text-slate-300 shrink-0">{formatMoney(i.price * i.quantity)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {listo != null && (
                        <div className="text-center py-10">
                            <Check className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                            <p className="text-lg font-bold dark:text-white">{listo} venta{listo === 1 ? '' : 's'} registrada{listo === 1 ? '' : 's'}</p>
                            <p className="text-sm text-slate-500 mt-1">Ya figuran en Ventas y en el Dashboard como pedidos MAN-…</p>
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <p className="text-xs text-slate-500">{progreso}</p>
                    <div className="flex gap-2">
                        {lectura && listo == null && <Button onClick={reiniciar} disabled={aplicando} className="!bg-transparent !text-slate-500 border border-slate-200 dark:border-slate-700 text-xs px-4"><RefreshCw className="w-4 h-4 mr-1" /> Otro archivo</Button>}
                        {listo != null
                            ? <Button onClick={onClose} className="bg-slate-900 text-white dark:bg-white dark:text-black text-xs px-6">Cerrar</Button>
                            : <Button onClick={confirmar} disabled={!plan?.nuevos.length || aplicando || !fecha} className="bg-[#E8C65E] hover:bg-[#B8932E] text-black text-xs px-6 disabled:opacity-40">
                                {aplicando ? 'Guardando…' : `Registrar ${plan?.nuevos.length || 0} venta${plan?.nuevos.length === 1 ? '' : 's'}`}
                            </Button>}
                    </div>
                </footer>
            </div>
        </div>
    );
};
