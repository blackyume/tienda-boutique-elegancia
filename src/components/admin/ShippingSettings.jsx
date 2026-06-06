import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Truck, Save, RefreshCw } from 'lucide-react';

export const ShippingSettings = () => {
    const { shippingRates, updateShippingRates, addToast } = useStore();
    const [localRates, setLocalRates] = useState(shippingRates);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalRates(shippingRates);
    }, [shippingRates]);

    const handleChange = (key, field, value) => {
        setLocalRates(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
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

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                <Truck className="w-5 h-5 text-[#D4AF37]" /> Tarifas de Envío
            </h3>

            <div className="space-y-6">
                {Object.entries(localRates).map(([key, data]) => (
                    <div key={key} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-sm uppercase text-slate-500">{key.replace('_', ' ')}</span>
                            <div className="flex gap-2">
                                <input
                                    value={data.cost}
                                    type="number"
                                    onChange={(e) => handleChange(key, 'cost', Number(e.target.value))}
                                    className="w-24 p-2 text-right font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-colors"
                                    placeholder="Precio"
                                />
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
                                className="w-32 p-2 text-sm bg-white dark:bg-[#121212] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="Tiempo"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-[#D4AF37] hover:bg-[#B8932E] text-white">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Tarifas
                </Button>
            </div>
        </div>
    );
};
