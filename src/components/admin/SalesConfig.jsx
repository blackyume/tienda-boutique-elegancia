import React, { useState } from 'react';
import { Save, AlertTriangle, Check, Bell, Mail, Truck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';

export const SalesConfig = () => {
    const { siteConfig, updateSiteConfig } = useStore();
    const [loading, setLoading] = useState(false);

    // Local state init from global config
    const [config, setConfig] = useState({
        promoPopup: siteConfig.promoPopup || { active: false, title: '', text: '', code: '', image: '' },
        sales: siteConfig.sales || {
            freeShipping: { enabled: false, threshold: 100000 },
            scarcity: { enabled: false, threshold: 5 }
        }
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateSiteConfig({
                ...siteConfig,
                promoPopup: config.promoPopup,
                sales: config.sales
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-cinzel text-white">Ventas & Conversión</h2>
                    <p className="text-slate-400 text-sm mt-1">Configura herramientas para aumentar tus ventas.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* NEWSLETTER POPUP */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Mail className="w-5 h-5" /></div>
                        <h3 className="text-lg font-bold text-white">Newsletter Popup</h3>
                        <div className="ml-auto">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.promoPopup.active}
                                    onChange={(e) => setConfig(prev => ({ ...prev, promoPopup: { ...prev.promoPopup, active: e.target.checked } }))}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className={`space-y-4 transition-opacity ${config.promoPopup.active ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título</label>
                            <input
                                value={config.promoPopup.title}
                                onChange={(e) => setConfig(prev => ({ ...prev, promoPopup: { ...prev.promoPopup, title: e.target.value } }))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-purple-500 outline-none"
                                placeholder="Ej: Join the Club"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Texto Principal</label>
                            <input
                                value={config.promoPopup.text}
                                onChange={(e) => setConfig(prev => ({ ...prev, promoPopup: { ...prev.promoPopup, text: e.target.value } }))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-purple-500 outline-none"
                                placeholder="Ej: Obtén un 10% OFF"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Código Cupón</label>
                                <input
                                    value={config.promoPopup.code}
                                    onChange={(e) => setConfig(prev => ({ ...prev, promoPopup: { ...prev.promoPopup, code: e.target.value } }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-cielo-gold font-mono text-sm focus:border-purple-500 outline-none"
                                    placeholder="WELCOME10"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imagen URL</label>
                                <input
                                    value={config.promoPopup.image}
                                    onChange={(e) => setConfig(prev => ({ ...prev, promoPopup: { ...prev.promoPopup, image: e.target.value } }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-purple-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FREE SHIPPING & SCARCITY */}
                <div className="space-y-8">
                    {/* Free Shipping */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Truck className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-white">Barra Envío Gratis</h3>
                            <div className="ml-auto">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={config.sales.freeShipping?.enabled}
                                        onChange={(e) => setConfig(prev => ({ ...prev, sales: { ...prev.sales, freeShipping: { ...prev.sales.freeShipping, enabled: e.target.checked } } }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className={`transition-opacity ${config.sales.freeShipping?.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monto para Envío Gratis ($)</label>
                            <input
                                type="number"
                                value={config.sales.freeShipping?.threshold}
                                onChange={(e) => setConfig(prev => ({ ...prev, sales: { ...prev.sales, freeShipping: { ...prev.sales.freeShipping, threshold: e.target.value } } }))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-green-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">Aparecerá una barra de progreso en el carrito motivando al cliente.</p>
                        </div>
                    </div>

                    {/* Scarcity */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Zap className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-white">Alerta de Escasez</h3>
                            <div className="ml-auto">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={config.sales.scarcity?.enabled}
                                        onChange={(e) => setConfig(prev => ({ ...prev, sales: { ...prev.sales, scarcity: { ...prev.sales.scarcity, enabled: e.target.checked } } }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className={`transition-opacity ${config.sales.scarcity?.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mostrar alerta si el stock es menor a:</label>
                            <input
                                type="number"
                                value={config.sales.scarcity?.threshold}
                                onChange={(e) => setConfig(prev => ({ ...prev, sales: { ...prev.sales, scarcity: { ...prev.sales.scarcity, threshold: e.target.value } } }))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-orange-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">Mostrará "🔥 Solo quedan X unidades" en la página de producto.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
