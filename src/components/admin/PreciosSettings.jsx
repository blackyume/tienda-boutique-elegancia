import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Calculator, Save } from 'lucide-react';
import { configPrecios, comisionMP, precioSugerido, PRECIOS_DEFAULT } from '../../utils/comision';
import { configLiquidacion } from '../../utils/liquidacion';
import { formatMoney } from '../../utils/helpers';

// Configuración → Precios: lo que hace que "me costó 24000" salga con precio
// sin preguntar nada. Se guarda en config/site_content.precios.
export const PreciosSettings = () => {
    const { siteConfig, updateSiteConfig, paymentConfig, categories, addToast } = useStore();
    const guardado = useMemo(() => configPrecios(siteConfig), [siteConfig]);
    const liqGuardada = useMemo(() => configLiquidacion(siteConfig), [siteConfig]);
    const [form, setForm] = useState({
        margen: String(guardado.margen),
        packaging: guardado.packaging ? String(guardado.packaging) : '',
        flete: guardado.flete ? String(guardado.flete) : '',
        redondeo: guardado.redondeo,
        margenPorCategoria: Object.fromEntries(Object.entries(guardado.margenPorCategoria).map(([k, v]) => [k, String(v)])),
        liqDias: String(liqGuardada.dias),
        liqDescuento: String(liqGuardada.descuento),
        liqDesde: liqGuardada.desde ? new Date(liqGuardada.desde).toISOString().slice(0, 10) : '',
    });
    const [guardando, setGuardando] = useState(false);
    const [costoEjemplo, setCostoEjemplo] = useState('20000');

    const comision = comisionMP(paymentConfig);
    const real = Number(paymentConfig?.realMpFeePercent) > 0;

    // Lo que se guardaría, para el ejemplo en vivo.
    const borrador = useMemo(() => {
        const porCat = {};
        for (const [k, v] of Object.entries(form.margenPorCategoria)) if (Number(v) > 0) porCat[k] = Number(v);
        const liquidacion = { dias: Number(form.liqDias) || 45, descuento: Number(form.liqDescuento) || 20, ...(form.liqDesde ? { desde: form.liqDesde } : {}) };
        return { precios: { margen: Number(form.margen) || PRECIOS_DEFAULT.margen, packaging: Number(form.packaging) || 0, flete: Number(form.flete) || 0, redondeo: Number(form.redondeo), margenPorCategoria: porCat, liquidacion } };
    }, [form]);
    const ejemplo = precioSugerido(costoEjemplo, { siteConfig: borrador, paymentConfig });

    const guardar = async () => {
        if (!(Number(form.margen) > 0)) return addToast('El margen tiene que ser mayor a 0', 'error');
        setGuardando(true);
        try { await updateSiteConfig(borrador); } catch (e) { console.error(e); addToast('No se pudo guardar', 'error'); }
        setGuardando(false);
    };

    const inputCls = 'w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E8C65E]';
    const labelCls = 'text-xs font-bold uppercase text-slate-400 mb-1 block';
    const cardCls = 'bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border dark:border-slate-700 shadow-sm';
    const nombresCat = (categories || []).map((c) => c.name).filter(Boolean);

    return (
        <div className="space-y-6">
            <div className={cardCls}>
                <h3 className="font-bold mb-2 flex items-center gap-2 text-slate-800 dark:text-white"><Calculator className="w-5 h-5 text-[#E8C65E]" /> Precio automático</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Con esto, cuando cargás una prenda alcanza con decir cuánto te costó: Lau, el cargador rápido, el editor y el Excel calculan el precio solos. Cada uno se puede pisar a mano en el momento.</p>

                <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label className={labelCls}>Margen de ganancia (%)</label>
                        <input type="number" min="1" max="500" step="5" value={form.margen} onChange={(e) => setForm({ ...form, margen: e.target.value })} className={inputCls + ' font-mono'} />
                        <p className="text-[10px] text-slate-400 mt-1">Sobre el costo, limpio después de Mercado Pago. 100% = ganás lo mismo que te costó.</p>
                    </div>
                    <div>
                        <label className={labelCls}>Redondeo del precio</label>
                        <select value={form.redondeo} onChange={(e) => setForm({ ...form, redondeo: Number(e.target.value) })} className={inputCls}>
                            <option value={100}>A los $100 (45.500)</option>
                            <option value={500}>A los $500 (45.500 / 46.000)</option>
                            <option value={1000}>A los $1.000 (46.000)</option>
                            <option value={99}>Terminado en 99 (45.499)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Siempre para arriba: nunca te come margen.</p>
                    </div>
                    <div>
                        <label className={labelCls}>Packaging por prenda ($)</label>
                        <input type="number" min="0" step="50" value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })} className={inputCls + ' font-mono'} placeholder="0" />
                        <p className="text-[10px] text-slate-400 mt-1">Bolsa, etiqueta, papel. Dejalo en 0 hasta saber el precio de las bolsas.</p>
                    </div>
                    <div>
                        <label className={labelCls}>Flete por prenda ($)</label>
                        <input type="number" min="0" step="50" value={form.flete} onChange={(e) => setForm({ ...form, flete: e.target.value })} className={inputCls + ' font-mono'} placeholder="0" />
                        <p className="text-[10px] text-slate-400 mt-1">Lo que te cuesta traer cada prenda del proveedor. En el cargador podés poner el flete del bulto y lo reparte.</p>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Comisión de Mercado Pago: {comision}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {real
                            ? 'Medida de tus ventas reales (lo que MP cobró menos lo que te depositó). Se actualiza sola con cada venta aprobada; no hay nada que cargar.'
                            : 'Todavía no hubo ventas por Mercado Pago, así que es un estimado (6,29% + IVA, "dinero al instante"). Con la primera venta aprobada se mide sola y se reemplaza.'}
                    </p>
                </div>
            </div>

            {nombresCat.length > 0 && (
                <div className={cardCls}>
                    <h3 className="font-bold mb-1 text-slate-800 dark:text-white">Margen distinto por categoría (opcional)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Vacío = usa el margen general ({form.margen || PRECIOS_DEFAULT.margen}%).</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {nombresCat.map((nombre) => {
                            const k = nombre.trim().toLowerCase();
                            return (
                                <div key={k} className="flex items-center gap-2">
                                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate" title={nombre}>{nombre}</span>
                                    <input type="number" min="1" max="500" step="5" value={form.margenPorCategoria[k] || ''} placeholder={form.margen} onChange={(e) => setForm({ ...form, margenPorCategoria: { ...form.margenPorCategoria, [k]: e.target.value } })} className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-[#E8C65E]" />
                                    <span className="text-xs text-slate-400">%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={cardCls}>
                <h3 className="font-bold mb-1 text-slate-800 dark:text-white">Liquidación inteligente</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Lo que lleva muchos días sin venderse, Lau te propone bajarlo (nunca por debajo del costo + comisión). Vos confirmás. Decile "liquidación" o "¿qué no se está vendiendo?".</p>
                <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                        <label className={labelCls}>Días sin venderse</label>
                        <input type="number" min="7" max="365" value={form.liqDias} onChange={(e) => setForm({ ...form, liqDias: e.target.value })} className={inputCls + ' font-mono'} />
                    </div>
                    <div>
                        <label className={labelCls}>Descuento propuesto (%)</label>
                        <input type="number" min="5" max="80" step="5" value={form.liqDescuento} onChange={(e) => setForm({ ...form, liqDescuento: e.target.value })} className={inputCls + ' font-mono'} />
                    </div>
                    <div>
                        <label className={labelCls}>Contar desde (apertura)</label>
                        <input type="date" value={form.liqDesde} onChange={(e) => setForm({ ...form, liqDesde: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-slate-400 mt-1">Los días antes de abrir la tienda no cuentan.</p>
                    </div>
                </div>
            </div>

            <div className={cardCls}>
                <h3 className="font-bold mb-3 text-slate-800 dark:text-white">Probalo</h3>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className={labelCls}>Si una prenda te cuesta ($)</label>
                        <input type="number" min="0" step="500" value={costoEjemplo} onChange={(e) => setCostoEjemplo(e.target.value)} className={inputCls + ' font-mono w-40'} />
                    </div>
                    {ejemplo ? (
                        <div className="flex-1 min-w-[16rem]">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">se vende a {formatMoney(ejemplo.precio)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Costo total {formatMoney(ejemplo.costoTotal)} · MP {ejemplo.comision}% = {formatMoney(ejemplo.comisionMonto)} · te quedan <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(ejemplo.neto)}</span> limpios ({ejemplo.margen}% sobre el costo).</p>
                        </div>
                    ) : <p className="text-sm text-slate-400">Poné un costo mayor a 0.</p>}
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={guardar} disabled={guardando} className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <Save className="w-4 h-4" /> {guardando ? 'Guardando…' : 'Guardar precios'}
                </Button>
            </div>
        </div>
    );
};
