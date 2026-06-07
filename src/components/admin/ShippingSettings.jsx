import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Truck, Save, RefreshCw, Plus, Trash2, Store } from 'lucide-react';

export const ShippingSettings = () => {
    const { shippingRates, updateShippingRates, addToast } = useStore();
    const [localRates, setLocalRates] = useState(shippingRates || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalRates(shippingRates || {});
    }, [shippingRates]);

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

    const addPickup = () => {
        setLocalRates(prev => ({
            ...prev,
            retiro: { name: 'Retiro en persona', cost: 0, time: 'Coordinás por WhatsApp', pickup: true }
        }));
        addToast('Agregá la dirección/horario en el campo de instrucciones y guardá', 'info');
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

    const hasPickup = Object.values(localRates).some(d => d?.pickup);

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Truck className="w-5 h-5 text-[#D4AF37]" /> Métodos de Envío y Retiro
                </h3>
                <div className="flex gap-2">
                    {!hasPickup && (
                        <button onClick={addPickup} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                            <Store className="w-4 h-4" /> Retiro en persona
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
                {Object.entries(localRates).map(([key, data]) => (
                    <div key={key} className={`p-4 rounded-xl border ${data?.pickup ? 'bg-[#D4AF37]/5 border-[#D4AF37]/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-sm uppercase text-slate-500 flex items-center gap-1.5">
                                {data?.pickup && <Store className="w-3.5 h-3.5 text-[#D4AF37]" />}
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
                                className="flex-1 p-2 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder={data?.pickup ? 'Dirección / horario de retiro' : 'Tiempo (ej: 2-4 días)'}
                            />
                        </div>
                        {data?.pickup && <p className="text-[11px] text-[#D4AF37] mt-2">📍 Con este método el cliente no carga dirección. Poné acá dónde y cuándo retira.</p>}
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-[#D4AF37] hover:bg-[#B8932E] text-white">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar
                </Button>
            </div>
        </div>
    );
};
