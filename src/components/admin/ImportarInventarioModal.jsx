import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, Plus, RefreshCw, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../context/StoreContext';
import { planearImportacion, filasDesdeCsv, filasDesdeExcel } from '../../utils/importarInventario';
import { formatMoney } from '../../utils/helpers';

const Contador = ({ icono: Icono, n, texto, color }) => (
    <div className={`flex items-center gap-3 px-4 py-3 border ${color}`}>
        <Icono className="w-5 h-5 shrink-0" />
        <div>
            <p className="text-2xl font-bold leading-none">{n}</p>
            <p className="text-[11px] uppercase tracking-wider opacity-70 mt-1">{texto}</p>
        </div>
    </div>
);

const valorLegible = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'number') return v > 999 ? formatMoney(v) : String(v);
    return String(v);
};

export const ImportarInventarioModal = ({ onClose }) => {
    const { inventory, addProduct, updateProduct, addToast } = useStore();
    const [plan, setPlan] = useState(null);
    const [archivo, setArchivo] = useState('');
    const [leyendo, setLeyendo] = useState(false);
    const [aplicando, setAplicando] = useState(false);
    const [avance, setAvance] = useState(0);
    const inputRef = useRef(null);

    const procesar = useCallback(async (file) => {
        if (!file) return;
        setLeyendo(true);
        setPlan(null);
        try {
            const esCsv = /\.csv$/i.test(file.name);
            const filas = esCsv
                ? filasDesdeCsv(await file.text())
                : await filasDesdeExcel(await file.arrayBuffer());
            if (!filas.length) {
                addToast('El archivo no tiene filas con datos', 'error');
                return;
            }
            setArchivo(file.name);
            setPlan(planearImportacion(filas, inventory));
        } catch (e) {
            console.error(e);
            addToast('No pude leer el archivo. Tiene que ser .xlsx o .csv', 'error');
        } finally {
            setLeyendo(false);
        }
    }, [inventory, addToast]);

    const aplicar = async () => {
        if (!plan) return;
        setAplicando(true);
        setAvance(0);
        const total = plan.altas.length + plan.cambios.length;
        let hechos = 0;
        let fallados = 0;
        for (const alta of plan.altas) {
            try { await addProduct(alta.datos, { silencioso: true }); }
            catch { fallados += 1; }
            hechos += 1;
            setAvance(Math.round((hechos / total) * 100));
        }
        for (const cambio of plan.cambios) {
            try { await updateProduct(cambio.id, cambio.campos, { silencioso: true }); }
            catch { fallados += 1; }
            hechos += 1;
            setAvance(Math.round((hechos / total) * 100));
        }
        setAplicando(false);
        if (fallados) addToast(`${total - fallados} listos, ${fallados} fallaron`, 'error');
        else addToast(`Importación lista: ${plan.altas.length} nuevos y ${plan.cambios.length} actualizados`, 'success');
        onClose();
    };

    const totalEscrituras = plan ? plan.altas.length + plan.cambios.length : 0;

    return (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={aplicando ? undefined : onClose}>
            <div
                className="bg-white dark:bg-[#111] w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-[#E8C65E]" />
                        <div>
                            <h2 className="font-luxury font-bold uppercase tracking-[0.2em] text-sm dark:text-white">Importar inventario</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">{archivo || 'Excel o CSV — se empareja por nombre de producto'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={aplicando} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40">
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <div className="overflow-y-auto p-6 grow">
                    {!plan && (
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); procesar(e.dataTransfer.files?.[0]); }}
                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#E8C65E] cursor-pointer p-12 text-center transition-colors"
                        >
                            <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" />
                            <p className="font-medium dark:text-white">{leyendo ? 'Leyendo el archivo…' : 'Soltá acá el Excel o hacé click para elegirlo'}</p>
                            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                                Sirve la misma planilla que baja <strong>Exportar Excel</strong>: cambiás precios y stock en Excel y la volvés a subir.
                                Un nombre que no exista se crea como borrador.
                            </p>
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.csv"
                                className="hidden"
                                onChange={(e) => { procesar(e.target.files?.[0]); e.target.value = ''; }}
                            />
                        </div>
                    )}

                    {plan && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <Contador icono={Plus} n={plan.altas.length} texto="Nuevos" color="border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10" />
                                <Contador icono={RefreshCw} n={plan.cambios.length} texto="Actualizados" color="border-[#E8C65E]/40 text-[#B8932E] dark:text-[#E8C65E] bg-[#E8C65E]/5" />
                                <Contador icono={Check} n={plan.sinCambios} texto="Sin cambios" color="border-slate-200 dark:border-slate-800 text-slate-500" />
                                <Contador icono={AlertTriangle} n={plan.errores.length} texto="Con error" color="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10" />
                            </div>

                            {plan.errores.length > 0 && (
                                <section>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-red-600 mb-2">No se van a tocar</h3>
                                    <ul className="text-sm border border-red-200 dark:border-red-900/40 divide-y divide-red-100 dark:divide-red-900/30">
                                        {plan.errores.map((e, i) => (
                                            <li key={i} className="px-3 py-2 flex gap-3 bg-red-50/50 dark:bg-red-900/10">
                                                <span className="text-red-400 text-xs shrink-0 w-14">Fila {e.fila}</span>
                                                <span className="dark:text-slate-200">{e.nombre || '(sin nombre)'} — <span className="text-red-600 dark:text-red-400">{e.motivo}</span></span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {plan.altas.length > 0 && (
                                <section>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Se crean como borrador</h3>
                                    <ul className="text-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {plan.altas.map((a, i) => (
                                            <li key={i} className="px-3 py-2">
                                                <p className="font-medium dark:text-white">{a.nombre}</p>
                                                <p className="text-xs text-slate-500">
                                                    {formatMoney(a.datos.price)} · stock {a.datos.stock}
                                                    {a.datos.category ? ` · ${a.datos.category}` : ''}
                                                </p>
                                                {a.avisos.map((av, j) => (
                                                    <p key={j} className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">⚠ {av}</p>
                                                ))}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {plan.cambios.length > 0 && (
                                <section>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#B8932E] dark:text-[#E8C65E] mb-2">Cambios</h3>
                                    <ul className="text-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {plan.cambios.map((c, i) => (
                                            <li key={i} className="px-3 py-2">
                                                <p className="font-medium dark:text-white">{c.nombre}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                                                    {c.detalle.map((d, j) => (
                                                        <span key={j} className="text-xs text-slate-500">
                                                            {d.campo}: <span className="line-through opacity-60">{valorLegible(d.de)}</span>
                                                            {' → '}
                                                            <span className="text-slate-800 dark:text-slate-200 font-medium">{valorLegible(d.a)}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                                {c.avisos.map((av, j) => (
                                                    <p key={j} className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">⚠ {av}</p>
                                                ))}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <p className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">
                                Se empareja por <strong>nombre</strong>. Si le cambiaste el nombre a un producto en el Excel, acá va a aparecer
                                como <strong>nuevo</strong> en vez de como cambio.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <p className="text-xs text-slate-500">
                        {aplicando
                            ? `Guardando… ${avance}%`
                            : plan
                                ? `${totalEscrituras} producto${totalEscrituras === 1 ? '' : 's'} se van a guardar`
                                : 'Nada se guarda hasta que confirmes'}
                    </p>
                    <div className="flex items-center gap-3">
                        {plan && !aplicando && (
                            <Button onClick={() => { setPlan(null); setArchivo(''); }} className="!bg-transparent !text-slate-500 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-none text-xs uppercase tracking-[0.2em]">
                                Otro archivo
                            </Button>
                        )}
                        <Button
                            onClick={aplicar}
                            disabled={!plan || aplicando || totalEscrituras === 0}
                            className="bg-black hover:bg-[#E8C65E] text-white px-6 py-2.5 rounded-none border border-[#E8C65E] text-xs uppercase tracking-[0.2em] disabled:opacity-40 disabled:pointer-events-none"
                        >
                            {aplicando ? 'Guardando…' : 'Confirmar importación'}
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
