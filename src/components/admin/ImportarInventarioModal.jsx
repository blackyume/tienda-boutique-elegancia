import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, Plus, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';
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

const esPlanilla = (f) => /\.(xlsx|csv)$/i.test(f?.name || '');
const esImagen = (f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f?.name || '');

// Miniaturas de las fotos que van a un producto. Un File se previsualiza con
// una object URL; una URL ya subida se muestra tal cual.
const Miniaturas = ({ fotos }) => {
    const [urls, setUrls] = useState([]);
    useEffect(() => {
        const creadas = fotos.map((f) => (typeof f === 'string' ? f : URL.createObjectURL(f)));
        setUrls(creadas);
        return () => fotos.forEach((f, i) => { if (typeof f !== 'string') URL.revokeObjectURL(creadas[i]); });
    }, [fotos]);
    if (!fotos.length) return null;
    return (
        <div className="flex gap-1.5 mt-1.5">
            {urls.map((u, i) => (
                <img key={i} src={u} alt="" className="w-10 h-12 object-cover border border-slate-200 dark:border-slate-700" />
            ))}
        </div>
    );
};

export const ImportarInventarioModal = ({ onClose }) => {
    const { inventory, addProduct, updateProduct, uploadImage, addToast } = useStore();
    const [filas, setFilas] = useState(null);
    const [archivo, setArchivo] = useState('');
    const [fotos, setFotos] = useState([]);
    const [plan, setPlan] = useState(null);
    const [leyendo, setLeyendo] = useState(false);
    const [aplicando, setAplicando] = useState(false);
    const [avance, setAvance] = useState('');
    const inputRef = useRef(null);
    const inputFotosRef = useRef(null);

    // El plan se rearma cada vez que cambia el Excel o las fotos: así se pueden
    // soltar las fotos después del Excel, o al revés, y la vista previa sigue.
    useEffect(() => {
        if (!filas) { setPlan(null); return; }
        setPlan(planearImportacion(filas, inventory, fotos));
    }, [filas, fotos, inventory]);

    const recibir = useCallback(async (lista) => {
        const archivos = [...(lista || [])];
        const planilla = archivos.find(esPlanilla);
        const imagenes = archivos.filter(esImagen);
        const otros = archivos.length - imagenes.length - (planilla ? 1 : 0);
        if (otros > 0) addToast(`${otros} archivo${otros > 1 ? 's' : ''} que no son Excel ni foto se ignoraron`, 'info');

        if (imagenes.length) {
            setFotos((prev) => {
                const vistos = new Set(prev.map((f) => f.name));
                return [...prev, ...imagenes.filter((f) => !vistos.has(f.name))];
            });
        }
        if (!planilla) {
            if (!imagenes.length) addToast('Soltá un Excel (.xlsx o .csv) y/o fotos', 'error');
            return;
        }

        setLeyendo(true);
        try {
            const leidas = /\.csv$/i.test(planilla.name)
                ? filasDesdeCsv(await planilla.text())
                : await filasDesdeExcel(await planilla.arrayBuffer());
            if (!leidas.length) {
                addToast('El archivo no tiene filas con datos', 'error');
                return;
            }
            setArchivo(planilla.name);
            setFilas(leidas);
        } catch (e) {
            console.error(e);
            addToast('No pude leer el archivo. Tiene que ser .xlsx o .csv', 'error');
        } finally {
            setLeyendo(false);
        }
    }, [addToast]);

    // Sube las fotos de un ítem y devuelve los campos de imagen listos. Una
    // URL que ya venía en la planilla no se vuelve a subir.
    const subirFotos = async (lista, etiqueta) => {
        const urls = [];
        for (let i = 0; i < lista.length; i += 1) {
            const f = lista[i];
            setAvance(`${etiqueta} · foto ${i + 1} de ${lista.length}`);
            const url = typeof f === 'string' ? f : await uploadImage(f, 'products', { silencioso: true });
            if (url) urls.push(url);
        }
        if (!urls.length) return null;
        return { image: urls[0], media: urls.map((u) => ({ type: 'image', url: u })) };
    };

    const aplicar = async () => {
        if (!plan) return;
        setAplicando(true);
        const total = plan.altas.length + plan.cambios.length;
        let hechos = 0;
        let fallados = 0;
        let sinSubir = 0;

        for (const alta of plan.altas) {
            try {
                const imagenes = alta.fotos.length ? await subirFotos(alta.fotos, alta.nombre) : null;
                if (alta.fotos.length && !imagenes) sinSubir += 1;
                // Si ninguna foto llegó a Cloudinary, no se publica: quedaría un
                // producto visible sin imagen.
                const datos = imagenes ? { ...alta.datos, ...imagenes } : { ...alta.datos, active: false };
                await addProduct(datos, { silencioso: true });
            } catch { fallados += 1; }
            hechos += 1;
            setAvance(`${hechos} de ${total}`);
        }
        for (const cambio of plan.cambios) {
            try {
                const imagenes = cambio.fotos?.length ? await subirFotos(cambio.fotos, cambio.nombre) : null;
                if (cambio.fotos?.length && !imagenes) sinSubir += 1;
                const campos = imagenes ? { ...cambio.campos, ...imagenes } : { ...cambio.campos };
                if (cambio.fotos?.length && !imagenes) delete campos.active;
                await updateProduct(cambio.id, campos, { silencioso: true });
            } catch { fallados += 1; }
            hechos += 1;
            setAvance(`${hechos} de ${total}`);
        }

        setAplicando(false);
        if (fallados) addToast(`${total - fallados} listos, ${fallados} fallaron`, 'error');
        else addToast(`Importación lista: ${plan.altas.length} nuevos y ${plan.cambios.length} actualizados`, 'success');
        if (sinSubir) addToast(`${sinSubir} producto${sinSubir > 1 ? 's' : ''} quedaron como borrador porque la foto no se pudo subir`, 'error');
        onClose();
    };

    const totalEscrituras = plan ? plan.altas.length + plan.cambios.length : 0;
    const conFoto = plan ? plan.altas.filter((a) => a.fotos.length).length + plan.cambios.filter((c) => c.fotos?.length).length : 0;
    const totalFotos = plan
        ? plan.altas.reduce((n, a) => n + a.fotos.length, 0) + plan.cambios.reduce((n, c) => n + (c.fotos?.length || 0), 0)
        : 0;

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
                            <h2 className="font-luxury font-bold uppercase tracking-[0.2em] text-sm dark:text-white">Importar productos</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {archivo ? `${archivo}${fotos.length ? ` + ${fotos.length} foto${fotos.length === 1 ? '' : 's'}` : ''}` : 'Excel o CSV + las fotos, todo junto'}
                            </p>
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
                            onDrop={(e) => { e.preventDefault(); recibir(e.dataTransfer.files); }}
                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#E8C65E] cursor-pointer p-12 text-center transition-colors"
                        >
                            <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" />
                            <p className="font-medium dark:text-white">
                                {leyendo ? 'Leyendo el archivo…' : 'Soltá acá el Excel y las fotos, o hacé click para elegirlos'}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                                Cada foto se empareja con su producto por el <strong>nombre del archivo</strong>: <code>jean-oxford.jpg</code> va al
                                producto "Jean Oxford". Varias fotos: <code>jean-oxford-1.jpg</code>, <code>jean-oxford-2.jpg</code>.
                                Un producto con foto entra <strong>publicado</strong>.
                            </p>
                            {fotos.length > 0 && (
                                <p className="text-xs text-[#B8932E] dark:text-[#E8C65E] mt-3">
                                    {fotos.length} foto{fotos.length === 1 ? '' : 's'} en espera — falta el Excel
                                </p>
                            )}
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.csv,image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => { recibir(e.target.files); e.target.value = ''; }}
                            />
                        </div>
                    )}

                    {plan && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                <Contador icono={Plus} n={plan.altas.length} texto="Nuevos" color="border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10" />
                                <Contador icono={RefreshCw} n={plan.cambios.length} texto="Actualizados" color="border-[#E8C65E]/40 text-[#B8932E] dark:text-[#E8C65E] bg-[#E8C65E]/5" />
                                <Contador icono={ImageIcon} n={conFoto} texto="Con foto" color="border-sky-200 dark:border-sky-900/50 text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/10" />
                                <Contador icono={Check} n={plan.sinCambios} texto="Sin cambios" color="border-slate-200 dark:border-slate-800 text-slate-500" />
                                <Contador icono={AlertTriangle} n={plan.errores.length} texto="Con error" color="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10" />
                            </div>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); recibir(e.dataTransfer.files); }}
                                className="flex items-center justify-between gap-4 border border-dashed border-slate-300 dark:border-slate-700 px-4 py-3"
                            >
                                <p className="text-xs text-slate-500">
                                    {fotos.length
                                        ? `${fotos.length} foto${fotos.length === 1 ? '' : 's'} cargada${fotos.length === 1 ? '' : 's'}. Podés soltar más acá.`
                                        : 'Sin fotos todavía: soltalas acá o elegilas, y la vista previa se actualiza sola.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => inputFotosRef.current?.click()}
                                    className="shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-2 border border-[#E8C65E] text-[#B8932E] dark:text-[#E8C65E] hover:bg-[#E8C65E]/10"
                                >
                                    Agregar fotos
                                </button>
                                <input
                                    ref={inputFotosRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => { recibir(e.target.files); e.target.value = ''; }}
                                />
                            </div>

                            {plan.fotosSueltas.length > 0 && (
                                <section>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-2">Fotos que no van a ningún producto</h3>
                                    <p className="text-xs text-slate-500 mb-2">
                                        El nombre del archivo no coincide con ningún producto de la planilla. Renombrala como el producto, o poné el nombre del archivo en la columna <strong>Foto</strong>.
                                    </p>
                                    <ul className="text-xs border border-amber-200 dark:border-amber-900/40 divide-y divide-amber-100 dark:divide-amber-900/30">
                                        {plan.fotosSueltas.map((n) => (
                                            <li key={n} className="px-3 py-1.5 bg-amber-50/50 dark:bg-amber-900/10 dark:text-slate-200 font-mono">{n}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

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
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Nuevos</h3>
                                    <ul className="text-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {plan.altas.map((a, i) => (
                                            <li key={i} className="px-3 py-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-medium dark:text-white">{a.nombre}</p>
                                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${a.datos.active ? 'border-emerald-300 text-emerald-600' : 'border-slate-300 text-slate-500'}`}>
                                                        {a.datos.active ? 'Publicado' : 'Borrador'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {formatMoney(a.datos.price)} · stock {a.datos.stock}
                                                    {a.datos.category ? ` · ${a.datos.category}` : ''}
                                                </p>
                                                <Miniaturas fotos={a.fotos} />
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
                                                <Miniaturas fotos={c.fotos || []} />
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
                                como <strong>nuevo</strong> en vez de como cambio. A un producto que ya tiene foto no se le pisa.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <p className="text-xs text-slate-500">
                        {aplicando
                            ? `Guardando… ${avance}`
                            : plan
                                ? `${totalEscrituras} producto${totalEscrituras === 1 ? '' : 's'} se van a guardar${totalFotos ? ` y ${totalFotos} foto${totalFotos === 1 ? '' : 's'} a subir` : ''}`
                                : 'Nada se guarda hasta que confirmes'}
                    </p>
                    <div className="flex items-center gap-3">
                        {plan && !aplicando && (
                            <Button onClick={() => { setFilas(null); setArchivo(''); setFotos([]); }} className="!bg-transparent !text-slate-500 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-none text-xs uppercase tracking-[0.2em]">
                                Empezar de nuevo
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
