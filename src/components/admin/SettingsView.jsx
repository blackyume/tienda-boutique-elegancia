import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Settings, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { SalesConfig } from './SalesConfig';

export const SettingsView = ({ isMaintenance, toggleMaintenance, migrateData, updateSystemVersion, cleanStorage, siteConfig, updateSiteConfig }) => {
    const { sendOrderEmail, addToast } = useStore();
    const [testEmail, setTestEmail] = useState("");
    const [isTestingEmail, setIsTestingEmail] = useState(false);

    const handleTestEmail = async () => {
        if (!testEmail) return addToast("Ingresa un email para probar", "error");
        setIsTestingEmail(true);
        try {
            await sendOrderEmail({
                id: 'TEST-123456',
                date: new Date().toISOString(),
                total: 99999,
                shipping: 'Envío de Prueba',
                customer: { nombre: 'Tester', email: testEmail },
                items: [{ name: 'Producto Prueba', size: 'M', quantity: 1, price: 99999 }]
            });
            addToast("Correo de prueba enviado. Revisa tu bandeja.", "success");
        } catch (error) {
            console.error(error);
            addToast("Error al enviar correo: " + error.text, "error");
        } finally {
            setIsTestingEmail(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-2xl font-bold dark:text-white mb-8">Configuración del Sistema</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SALES & CONVERSION STRATEGY (New) */}
                <div className="md:col-span-2">
                    <SalesConfig />
                </div>

                {/* STORE STATUS */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Lock className="w-5 h-5 text-[#C19A6B]" /> Disponibilidad de la Tienda</h3>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                        <div>
                            <p className="font-bold text-sm dark:text-white">Modo Mantenimiento</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Si activas esto, los clientes verán una pantalla de "Próximamente". Vos podés seguir entrando.</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleMaintenance}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C19A6B] focus:ring-offset-2 ${isMaintenance ? 'bg-[#C19A6B]' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isMaintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* CONTACT & SOCIAL */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">Contacto & Redes</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Número de WhatsApp</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={siteConfig?.whatsappNumber || ''}
                                    placeholder="54911..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-gray-200 outline-none focus:border-[#C19A6B]"
                                    id="whatsappInput"
                                />
                                <Button
                                    onClick={() => updateSiteConfig({ whatsappNumber: document.getElementById('whatsappInput').value })}
                                    className="bg-slate-800 text-white text-xs px-4 rounded-lg"
                                >
                                    Guardar
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Formato internacional sin + ni espacios. Ej: 5491144444444</p>
                        </div>
                    </div>
                </div>

                {/* GOOGLE ANALYTICS */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">Google Analytics 4</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Measurement ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={siteConfig?.gaMeasurementId || ''}
                                    placeholder="G-XXXXXXXXXX"
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-gray-200 outline-none focus:border-[#C19A6B]"
                                    id="gaInput"
                                />
                                <Button
                                    onClick={() => updateSiteConfig({ gaMeasurementId: document.getElementById('gaInput').value })}
                                    className="bg-slate-800 text-white text-xs px-4 rounded-lg"
                                >
                                    Guardar
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Tu ID de medición de flujo de datos web.</p>
                        </div>
                    </div>
                </div>

                {/* EMAIL SETTINGS & TEST */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm sm:col-span-2 md:col-span-1 lg:col-span-2 border-l-4 border-l-blue-500">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Mail className="w-5 h-5 text-blue-500" /> Configuración de EmailJS</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                Configura tus credenciales de <a href="https://dashboard.emailjs.com" target="_blank" className="text-blue-500 underline">EmailJS</a> para enviar correos.
                            </p>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Service ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        defaultValue={siteConfig?.emailjs?.serviceId || ''}
                                        placeholder="service_xxxxxxx"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono"
                                        id="emailjsServiceId"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Template ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        defaultValue={siteConfig?.emailjs?.templateId || ''}
                                        placeholder="template_xxxxxxx"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono"
                                        id="emailjsTemplateId"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Public Key</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        defaultValue={siteConfig?.emailjs?.publicKey || ''}
                                        placeholder="xxxxxxxxxxxx"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono"
                                        id="emailjsPublicKey"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    updateSiteConfig({
                                        emailjs: {
                                            serviceId: document.getElementById('emailjsServiceId').value,
                                            templateId: document.getElementById('emailjsTemplateId').value,
                                            publicKey: document.getElementById('emailjsPublicKey').value
                                        }
                                    });
                                    addToast("Credenciales de EmailJS guardadas", "success");
                                }}
                                className="w-full bg-slate-800 text-white text-xs py-3 rounded-lg"
                            >
                                Guardar Credenciales
                            </Button>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <label className="text-xs font-bold uppercase text-blue-800 dark:text-blue-400 mb-2 block">Enviar Correo de Prueba</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="tu-email@ejemplo.com"
                                    className="flex-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 text-sm outline-none"
                                />
                                <Button
                                    onClick={handleTestEmail}
                                    isLoading={isTestingEmail}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 rounded-lg shadow-lg shadow-blue-500/20"
                                >
                                    Enviar
                                </Button>
                            </div>
                            <p className="text-[10px] text-blue-400 mt-2">Enviará un recibo de compra falso a esta dirección.</p>
                        </div>
                    </div>
                </div>

                {/* DANGER ZONE */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm md:col-span-2">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-red-600"><Settings className="w-5 h-5" /> Zona de Peligro / Utilidades</h3>

                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                        <p className="font-bold text-xs text-red-800 dark:text-red-400 mb-3">Migración de Datos</p>
                        <Button onClick={() => {
                            const localInv = JSON.parse(localStorage.getItem('cielo_inventory'));
                            const localOrd = JSON.parse(localStorage.getItem('cielo_orders'));
                            const localCat = JSON.parse(localStorage.getItem('cielo_categories'));
                            if (confirm("¿ATENCIÓN: Estás seguro de subir TODOS los datos locales a Firebase? Esto podría sobrescribir datos reales.")) {
                                migrateData(localInv, localOrd, localCat);
                            }
                        }} className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-xl font-bold text-xs shadow-lg shadow-red-500/20">
                            SUBIR DATOS LOCALES A NUBE
                        </Button>
                        <p className="text-[10px] text-red-400 mt-2 text-center">Usar solo si venís de la versión antigua sin base de datos.</p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 mt-4">
                        <p className="font-bold text-xs text-blue-800 dark:text-blue-400 mb-3">Control de Versiones</p>
                        <Button onClick={() => {
                            if (confirm("¿Notificar a todos los usuarios de una nueva actualización?")) updateSystemVersion();
                        }} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20">
                            NOTIFICAR ACTUALIZACIÓN
                        </Button>
                        <p className="text-[10px] text-blue-400 mt-2 text-center">Muestra un cartel a los clientes para que recarguen la página.</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 mt-4">
                        <p className="font-bold text-xs text-orange-800 dark:text-orange-400 mb-3">Limpieza de Almacenamiento</p>
                        <Button onClick={async () => {
                            if (confirm("¿Escanear y eliminar imágenes no utilizadas? Esta acción es irreversible.")) {
                                await cleanStorage();
                            }
                        }} className="bg-orange-600 hover:bg-orange-700 text-white w-full py-3 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 mb-2">
                            SCAN & CLEAN IMAGES
                        </Button>
                        <p className="text-[10px] text-orange-400 text-center">Elimina fotos de Firebase que ya no existen en el inventario.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
