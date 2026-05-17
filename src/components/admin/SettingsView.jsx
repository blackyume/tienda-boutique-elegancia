import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Settings, Mail, Bot, AlertTriangle, Send, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import { SalesConfig } from './SalesConfig';

export const SettingsView = ({ isMaintenance, toggleMaintenance, migrateData, updateSystemVersion, cleanStorage, siteConfig, updateSiteConfig }) => {
    const { sendOrderEmail, aiConfig, updateAiConfig, addToast } = useStore();
    const confirm = useConfirm();
    const [testEmail, setTestEmail] = useState("");
    const [isTestingEmail, setIsTestingEmail] = useState(false);
    const [isTestingKey, setIsTestingKey] = useState(false);
    const [tgTestMsg, setTgTestMsg] = useState("");
    const [isSendingTg, setIsSendingTg] = useState(false);
    const [pushTitle, setPushTitle] = useState("");
    const [pushBody, setPushBody] = useState("");
    const [pushUrl, setPushUrl] = useState("/shop");
    const [isSendingPush, setIsSendingPush] = useState(false);

    const handleSendPush = async () => {
        if (!pushTitle.trim() || !pushBody.trim()) return addToast("Completá título y cuerpo", "error");
        const secret = siteConfig?.push?.adminSecret || '';
        if (!secret) return addToast("Guardá el PUSH_ADMIN_SECRET en el card de abajo", "error");

        const apiBase = siteConfig?.mpApiUrl
            ? siteConfig.mpApiUrl.replace(/\/api\/[^/]+$/, '/api')
            : `${window.location.origin}/api`;
        setIsSendingPush(true);
        try {
            const res = await fetch(`${apiBase}/send-push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': secret
                },
                body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            addToast(`Enviadas ${data.sent || 0}. Fallidas ${data.failed || 0}.`, "success");
            setPushTitle(""); setPushBody("");
        } catch (err) {
            addToast(err.message || "Error al enviar push", "error");
        } finally {
            setIsSendingPush(false);
        }
    };

    const handleTestTelegram = async () => {
        if (!tgTestMsg.trim()) return addToast("Escribí un mensaje para probar", "error");
        setIsSendingTg(true);
        try {
            const { publishMessageToTelegram } = await import('../../utils/telegram');
            await publishMessageToTelegram({ message: tgTestMsg }, siteConfig);
            addToast("Mensaje enviado al canal", "success");
            setTgTestMsg("");
        } catch (err) {
            addToast(err.message || "Error al enviar", "error");
        } finally {
            setIsSendingTg(false);
        }
    };

    const handleTestKey = async () => {
        const keysText = document.getElementById('aiAdminKeys').value || aiConfig?.adminKeys || '';
        const keysArray = keysText.split(/[,\n]+/).map(k => k.trim()).filter(k => k);

        if (keysArray.length === 0) {
            return addToast("No hay llaves para probar", "error");
        }

        setIsTestingKey(true);
        const keyToTest = keysArray[0];

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                const models = data.models.map(m => m.name.replace('models/', ''));
                const hasGemini = models.some(m => m.includes('gemini'));

                if (hasGemini) {
                    addToast(`¡Éxito! Llave válida y activa. Modelos: ${models.slice(0, 3).join(', ')}...`, "success");
                } else {
                    addToast(`Llave válida, pero inusual (sin modelos Gemini detectados).`, "warning");
                }
            } else {
                if (data.error?.message?.includes("API_KEY_INVALID") || data.error?.code === 400) {
                    addToast("ERROR: La llave provista es inválida o fue eliminada en Google Cloud.", "error");
                } else if (response.status === 404 || data.error?.message?.includes("not found")) {
                    addToast("ERROR DE PERMISOS: La llave es válida PERO no tiene la 'Generative Language API' habilitada en Google Cloud.", "error");
                } else {
                    addToast(`Error al probar llave: ${data.error?.message || response.statusText}`, "error");
                }
            }
        } catch (error) {
            addToast("Error de conexión al probar la llave", "error");
        } finally {
            setIsTestingKey(false);
        }
    };

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

                {/* PUSH NOTIFICATIONS */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm md:col-span-2 border-l-4 border-l-amber-500">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                        <Bell className="w-5 h-5 text-amber-500" /> Notificaciones Push (FCM)
                    </h3>
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-4 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                        <p><strong>Setup (una sola vez):</strong></p>
                        <ol className="list-decimal ml-5 space-y-1">
                            <li>Firebase Console → Project settings → Cloud Messaging → Web Push certificates → Generate key pair. Copiá la <strong>VAPID key</strong>.</li>
                            <li>Pegala abajo y guardala.</li>
                            <li>En Vercel env vars: agregá <code>FIREBASE_SERVICE_ACCOUNT</code> (JSON descargado de Firebase → Project settings → Service accounts → Generate new private key) y <code>PUSH_ADMIN_SECRET</code> (cualquier string — pegalo también abajo).</li>
                            <li>Redeploy Vercel.</li>
                            <li>Los visitantes verán un popup para activar notificaciones después de 10s en el sitio.</li>
                        </ol>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">VAPID Public Key</label>
                            <input
                                type="text"
                                defaultValue={siteConfig?.push?.vapidKey || ''}
                                placeholder="B..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-amber-500"
                                id="pushVapidInput"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">PUSH_ADMIN_SECRET (debe coincidir con Vercel)</label>
                            <input
                                type="password"
                                defaultValue={siteConfig?.push?.adminSecret || ''}
                                placeholder="••••••"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-amber-500"
                                id="pushSecretInput"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            updateSiteConfig({
                                push: {
                                    ...(siteConfig?.push || {}),
                                    vapidKey: document.getElementById('pushVapidInput').value,
                                    adminSecret: document.getElementById('pushSecretInput').value
                                }
                            });
                            addToast("Configuración push guardada", "success");
                        }}
                        className="bg-slate-800 text-white text-xs px-6 py-2 rounded-lg"
                    >
                        Guardar
                    </Button>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Enviar push a todos los suscriptores</label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={pushTitle}
                                onChange={(e) => setPushTitle(e.target.value)}
                                placeholder="Título (ej: 🎉 30% OFF hoy)"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500"
                            />
                            <textarea
                                rows={2}
                                value={pushBody}
                                onChange={(e) => setPushBody(e.target.value)}
                                placeholder="Mensaje (ej: Solo por hoy en toda la tienda. ¡Aprovechá!)"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500"
                            />
                            <input
                                type="text"
                                value={pushUrl}
                                onChange={(e) => setPushUrl(e.target.value)}
                                placeholder="/shop"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500"
                            />
                            <Button
                                onClick={handleSendPush}
                                isLoading={isSendingPush}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-6 py-2.5 rounded-lg w-full"
                            >
                                <Bell className="w-4 h-4 mr-2 inline" /> Enviar a todos
                            </Button>
                        </div>
                    </div>
                </div>

                {/* TELEGRAM BOT */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm md:col-span-2 border-l-4 border-l-sky-500">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                        <Send className="w-5 h-5 text-sky-500" /> Bot de Telegram (Publicación al Canal)
                    </h3>

                    <div className="bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-100 dark:border-sky-900/30 mb-4 text-xs text-sky-800 dark:text-sky-300 leading-relaxed space-y-2">
                        <p><strong>Setup (una sola vez):</strong></p>
                        <ol className="list-decimal ml-5 space-y-1">
                            <li>Abrí Telegram → buscá <code className="bg-sky-100 dark:bg-sky-900/30 px-1 rounded">@BotFather</code> → <code>/newbot</code> → guardá el <strong>token</strong>.</li>
                            <li>Creá un canal público (ej. <code>@LaBoutiqueElegancia</code>) → agregá tu bot como <strong>administrador</strong> del canal.</li>
                            <li>En Vercel → tu proyecto → Settings → Environment Variables, agregá:
                                <ul className="list-disc ml-5 mt-1">
                                    <li><code>TELEGRAM_BOT_TOKEN</code> = token del bot</li>
                                    <li><code>TELEGRAM_CHAT_ID</code> = <code>@LaBoutiqueElegancia</code> (o el -100... si es privado)</li>
                                    <li><code>TELEGRAM_ADMIN_SECRET</code> = (opcional) cualquier string — si lo ponés acá, tenés que pegarlo también abajo</li>
                                </ul>
                            </li>
                            <li>Redeployá en Vercel para que las variables queden activas.</li>
                            <li>Desde <strong>Inventario</strong> vas a ver un botón ✉ "Publicar en Telegram" en cada producto.</li>
                        </ol>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Admin Secret (opcional, si lo usaste)</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    defaultValue={siteConfig?.telegram?.secret || ''}
                                    placeholder="••••••"
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-sky-500"
                                    id="tgSecretInput"
                                />
                                <Button
                                    onClick={() => {
                                        updateSiteConfig({
                                            telegram: {
                                                ...(siteConfig?.telegram || {}),
                                                secret: document.getElementById('tgSecretInput').value
                                            }
                                        });
                                        addToast("Secret guardado", "success");
                                    }}
                                    className="bg-slate-800 text-white text-xs px-4 rounded-lg"
                                >
                                    Guardar
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Debe coincidir con <code>TELEGRAM_ADMIN_SECRET</code> del servidor.</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Publicar mensaje/promo al canal</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tgTestMsg}
                                onChange={(e) => setTgTestMsg(e.target.value)}
                                placeholder="Ej: 🎉 20% OFF en toda la tienda — sólo hoy!"
                                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-sky-500"
                            />
                            <Button
                                onClick={handleTestTelegram}
                                isLoading={isSendingTg}
                                className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-6 py-2.5 rounded-lg"
                            >
                                Publicar
                            </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Test rápido: enviá un mensaje al canal para verificar que todo funciona.</p>
                    </div>
                </div>

                {/* LOW STOCK THRESHOLD */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Alerta de Stock Bajo
                    </h3>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Umbral (unidades)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={siteConfig?.lowStockThreshold ?? 5}
                            placeholder="5"
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-gray-200 outline-none focus:border-[#C19A6B]"
                            id="lowStockInput"
                        />
                        <Button
                            onClick={() => {
                                const v = parseInt(document.getElementById('lowStockInput').value, 10);
                                if (Number.isNaN(v) || v < 0) return addToast("Ingresá un número válido (0 o más)", "error");
                                updateSiteConfig({ lowStockThreshold: v });
                                addToast("Umbral de stock actualizado", "success");
                            }}
                            className="bg-slate-800 text-white text-xs px-4 rounded-lg"
                        >
                            Guardar
                        </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Productos o variantes con stock ≤ este valor dispararán alerta en el Dashboard e Inventario.</p>
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

                {/* AI CONFIGURATION */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm sm:col-span-2 md:col-span-1 lg:col-span-2 border-l-4 border-l-purple-500">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Bot className="w-5 h-5 text-purple-500" /> Inteligencia Artificial (API Keys)</h3>

                    <div className="space-y-4">
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 mb-4">
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                💡 <strong>Nota Importante:</strong> Las cuotas de mensajes <strong>no se comparten</strong> entre el panel de administrador y los clientes de la tienda, a menos que pegues las mismas llaves en ambos cuadros.
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                                Puedes pegar múltiples llaves (separadas por comas o saltos de línea) en cada caja. Si una llave se queda sin límite de cuota, el sistema saltará automáticamente a la siguiente sin interrumpir el servicio.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Llaves de Administrador (Cerebro IA)</label>
                                <textarea
                                    id="aiAdminKeys"
                                    defaultValue={aiConfig?.adminKeys || ''}
                                    placeholder="AIzaSy...\nAIzaSy..."
                                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-purple-500 resize-y"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Llaves de Clientes (Elegancia IA)</label>
                                <textarea
                                    id="aiCustomerKeys"
                                    defaultValue={aiConfig?.customerKeys || ''}
                                    placeholder="AIzaSy...\nAIzaSy..."
                                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-purple-500 resize-y"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => {
                                    updateAiConfig({
                                        adminKeys: document.getElementById('aiAdminKeys').value,
                                        customerKeys: document.getElementById('aiCustomerKeys').value
                                    });
                                    addToast("Llaves guardadas correctamente", "success");
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-6 py-2.5 rounded-lg shadow-lg shadow-purple-500/20"
                            >
                                Guardar Keys de IA
                            </Button>

                            <Button
                                onClick={handleTestKey}
                                isLoading={isTestingKey}
                                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-6 py-2.5 rounded-lg border border-slate-700"
                            >
                                Probar Acceso (Llave Administrador 1)
                            </Button>
                        </div>
                    </div>
                </div>

                {/* EMAIL SETTINGS & TEST */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm sm:col-span-2 md:col-span-1 lg:col-span-2 border-l-4 border-l-blue-500">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Mail className="w-5 h-5 text-blue-500" /> Configuración de EmailJS</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                Configura tus credenciales de <a href="https://dashboard.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">EmailJS</a> para enviar correos.
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
                        <Button onClick={async () => {
                            const localInv = JSON.parse(localStorage.getItem('cielo_inventory'));
                            const localOrd = JSON.parse(localStorage.getItem('cielo_orders'));
                            const localCat = JSON.parse(localStorage.getItem('cielo_categories'));
                            if (await confirm({ title: '⚠️ Migración de datos', message: 'Se subirán TODOS los datos locales a Firebase. Esto puede sobrescribir datos reales. Esta acción es irreversible.', confirmText: 'Subir y sobrescribir', danger: true })) {
                                migrateData(localInv, localOrd, localCat);
                            }
                        }} className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-xl font-bold text-xs shadow-lg shadow-red-500/20">
                            SUBIR DATOS LOCALES A NUBE
                        </Button>
                        <p className="text-[10px] text-red-400 mt-2 text-center">Usar solo si venís de la versión antigua sin base de datos.</p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 mt-4">
                        <p className="font-bold text-xs text-blue-800 dark:text-blue-400 mb-3">Control de Versiones</p>
                        <Button onClick={async () => {
                            if (await confirm({ title: 'Notificar actualización', message: 'Se mostrará un cartel a todos los clientes para que recarguen la página.', confirmText: 'Notificar' })) updateSystemVersion();
                        }} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20">
                            NOTIFICAR ACTUALIZACIÓN
                        </Button>
                        <p className="text-[10px] text-blue-400 mt-2 text-center">Muestra un cartel a los clientes para que recarguen la página.</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 mt-4">
                        <p className="font-bold text-xs text-orange-800 dark:text-orange-400 mb-3">Limpieza de Almacenamiento</p>
                        <Button onClick={async () => {
                            if (await confirm({ title: 'Limpiar almacenamiento', message: 'Se escanearán y eliminarán las imágenes no utilizadas. Esta acción es irreversible.', confirmText: 'Escanear y limpiar', danger: true })) {
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
