import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Truck, Save, RefreshCw, Plus, Trash2, Store, MapPin } from 'lucide-react';

export const ShippingSettings = () => {
    const { shippingRates, updateShippingRates, addToast, siteConfig, updateSiteConfig } = useStore();
    const [localRates, setLocalRates] = useState(shippingRates || {});
    const [isSaving, setIsSaving] = useState(false);
    const [remitente, setRemitente] = useState(siteConfig?.remitente || { name: 'La Boutique de la Elegancia', address: '', cp: '', city: 'Rafaela', province: 'Santa Fe', phone: '' });
    const [savingRem, setSavingRem] = useState(false);

    useEffect(() => {
        setLocalRates(shippingRates || {});
    }, [shippingRates]);

    useEffect(() => {
        if (siteConfig?.remitente) setRemitente(r => ({ ...r, ...siteConfig.remitente }));
    }, [siteConfig?.remitente]);

    const saveRemitente = async () => {
        setSavingRem(true);
        try {
            await updateSiteConfig({ remitente });
        } catch (e) { console.error(e); addToast('Error al guardar el remitente', 'error'); }
        setSavingRem(false);
    };
    const remChange = (field, value) => setRemitente(prev => ({ ...prev, [field]: value }));

    const handleChange = (key, field, value) => {
        setLocalRates(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const addMethod = () => {
        const key = `metodo_${Date.now()}`;
        setLocalRates(prev => ({ ...prev, [key]: { name: 'Nuevo método', cost: 0, time: '2-4 días' } }));
    };

    const addSucursal = () => {
        setLocalRates(prev => ({
            ...prev,
            sucursal: { name: 'Retiro en sucursal del correo', cost: 2500, time: '3-5 días', note: 'Lo enviamos a la sucursal de correo más cercana a tu domicilio para que lo retires. Te avisamos cuál cuando lo despachamos.' }
        }));
        addToast('Listo, ajustá el precio y guardá', 'info');
    };

    const removeMethod = (key) => {
        setLocalRates(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateShippingRates(localRates);
        } catch (error) {
            console.error(error);
            addToast("Error al guardar", "error");
        }
        setIsSaving(false);
    };

    const hasSucursal = Object.keys(localRates).some(k => k === 'sucursal');

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Truck className="w-5 h-5 text-[#D4AF37]" /> Métodos de Envío
                </h3>
                <div className="flex gap-2">
                    {!hasSucursal && (
                        <button onClick={addSucursal} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                            <Store className="w-4 h-4" /> Retiro en sucursal
                        </button>
                    )}
                    <button onClick={addMethod} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                        <Plus className="w-4 h-4" /> Método
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(localRates).length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-6">No hay métodos cargados. Agregá uno con los botones de arriba.</p>
                )}
                {Object.entries(localRates).map(([key, data]) => {
                    const isSucursal = key === 'sucursal';
                    return (
                    <div key={key} className={`p-4 rounded-xl border ${isSucursal ? 'bg-[#D4AF37]/5 border-[#D4AF37]/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-sm uppercase text-slate-500 flex items-center gap-1.5">
                                {isSucursal && <Store className="w-3.5 h-3.5 text-[#D4AF37]" />}
                                {key.replace(/_/g, ' ')}
                            </span>
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <input
                                        value={data.cost}
                                        type="number"
                                        onChange={(e) => handleChange(key, 'cost', Number(e.target.value))}
                                        className="w-28 p-2 pl-6 text-right font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-colors"
                                        placeholder="0"
                                    />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                                </div>
                                <button onClick={() => removeMethod(key)} title="Eliminar método" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <input
                                value={data.name}
                                onChange={(e) => handleChange(key, 'name', e.target.value)}
                                className="flex-1 p-2 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="Nombre Visible"
                            />
                            <input
                                value={data.time}
                                onChange={(e) => handleChange(key, 'time', e.target.value)}
                                className="w-40 p-2 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="Tiempo (ej: 2-4 días)"
                            />
                        </div>
                        <input
                            value={data.note || ''}
                            onChange={(e) => handleChange(key, 'note', e.target.value)}
                            className="w-full mt-3 p-2 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                            placeholder="Nota opcional para el cliente (aparece al elegir este método)"
                        />
                    </div>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-[#D4AF37] hover:bg-[#B8932E] text-white">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar
                </Button>
            </div>

            {/* Datos del remitente — para las etiquetas de envío que genera Lau */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-bold mb-1 flex items-center gap-2 text-slate-800 dark:text-white">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" /> Datos del remitente
                </h4>
                <p className="text-[11px] text-slate-400 mb-4">Tus datos como vendedor. Aparecen en la etiqueta de envío (la que genera Lau para pegar al paquete).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={remitente.name || ''} onChange={(e) => remChange('name', e.target.value)} placeholder="Nombre / Tienda" className="p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors md:col-span-2" />
                    <input value={remitente.address || ''} onChange={(e) => remChange('address', e.target.value)} placeholder="Calle y número" className="p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors md:col-span-2" />
                    <input value={remitente.cp || ''} onChange={(e) => remChange('cp', e.target.value)} placeholder="Código postal" className="p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors" />
                    <input value={remitente.phone || ''} onChange={(e) => remChange('phone', e.target.value)} placeholder="Teléfono" className="p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors" />
                    <input value={remitente.city || ''} onChange={(e) => remChange('city', e.target.value)} placeholder="Ciudad" className="p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors" />
                    <input value={remitente.province || ''} onChange={(e) => remChange('province', e.target.value)} placeholder="Provincia" className="p-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors" />
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={saveRemitente} disabled={savingRem} className="bg-slate-800 dark:bg-white dark:text-slate-900 text-white">
                        {savingRem ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar remitente
                    </Button>
                </div>
            </div>
        </div>
    );
};
