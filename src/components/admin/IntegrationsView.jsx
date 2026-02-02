import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { ShippingSettings } from './ShippingSettings';
import { CreditCard, Truck, Mail, Lock, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';

export const IntegrationsView = () => {
    const { paymentConfig, updatePaymentConfig, addToast } = useStore();
    const [activeTab, setActiveTab] = useState('shipping');

    // MP State
    const [mpConfig, setMpConfig] = useState({ publicKey: '', accessToken: '' });
    const [showToken, setShowToken] = useState(false);
    const [isSavingMp, setIsSavingMp] = useState(false);

    useEffect(() => {
        if (paymentConfig) {
            setMpConfig(paymentConfig);
        }
    }, [paymentConfig]);

    const handleSaveMp = async () => {
        setIsSavingMp(true);
        try {
            await updatePaymentConfig(mpConfig);
        } catch (error) {
            console.error(error);
            addToast("Error al guardar MP", "error");
        }
        setIsSavingMp(false);
    };

    const tabs = [
        { id: 'shipping', label: 'Envíos / Logística', icon: Truck },
        { id: 'payments', label: 'Medios de Pago', icon: CreditCard },
        { id: 'email', label: 'Notificaciones', icon: Mail }
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold dark:text-white mb-2">Integraciones</h1>
            <p className="text-slate-500 text-sm mb-8">Conectá tu tienda con servicios externos.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* MENU LATERAL */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#C19A6B] text-white shadow-lg shadow-[#C19A6B]/20' : 'bg-white dark:bg-[#1e293b] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 animate-fadeIn">

                    {/* ENVIOS */}
                    {activeTab === 'shipping' && (
                        <ShippingSettings />
                    )}

                    {/* MERCADO PAGO */}
                    {activeTab === 'payments' && (
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <CreditCard className="w-5 h-5 text-[#009EE3]" /> Mercado Pago
                            </h3>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 mb-6">
                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                    Conectá tu cuenta de Mercado Pago para recibir cobros. Necesitás crear una aplicación en el <a href="https://www.mercadopago.com.ar/developers/panel" target="_blank" className="underline font-bold">Panel de Desarrolladores</a>.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Public Key</label>
                                    <input
                                        value={mpConfig.publicKey}
                                        onChange={e => setMpConfig({ ...mpConfig, publicKey: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#009EE3] transition-colors text-sm font-mono text-slate-600 dark:text-slate-300"
                                        placeholder="TEST-..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Access Token</label>
                                    <div className="relative">
                                        <input
                                            type={showToken ? "text" : "password"}
                                            value={mpConfig.accessToken}
                                            onChange={e => setMpConfig({ ...mpConfig, accessToken: e.target.value })}
                                            className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#009EE3] transition-colors text-sm font-mono text-slate-600 dark:text-slate-300"
                                            placeholder="TEST-..."
                                        />
                                        <button
                                            onClick={() => setShowToken(!showToken)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">
                                        Costo de Servicio / Recargo (%)
                                        <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] normal-case">Se cobra al cliente</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={mpConfig.mpFee || ''}
                                        onChange={e => setMpConfig({ ...mpConfig, mpFee: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#009EE3] transition-colors text-sm font-mono text-slate-600 dark:text-slate-300"
                                        placeholder="Ej: 6"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Este porcentaje se sumará al total de la compra cuando elijan Mercado Pago.</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <Button onClick={handleSaveMp} disabled={isSavingMp} className="bg-[#009EE3] hover:bg-[#0081b8] text-white">
                                    {isSavingMp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Guardar Credenciales
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* EMAILS */}
                    {activeTab === 'email' && (
                        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl border dark:border-slate-700 shadow-sm text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Notificaciones por Correo</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto">
                                Próximamente podrás configurar plantillas automáticas para enviar correos cuando se confirme una compra o se despache un envío.
                            </p>
                            <div className="mt-6 inline-block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500">
                                En Desarrollo
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
