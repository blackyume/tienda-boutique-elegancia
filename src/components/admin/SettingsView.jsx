import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Settings, Mail, Bot, AlertTriangle, Send, Bell, CreditCard, Truck, Activity, Image as ImageIcon, MessageSquare, Save, Eye, EyeOff, RefreshCw, Download, Upload, Phone, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import { SalesConfig } from './SalesConfig';
import { ShippingSettings } from './ShippingSettings';
import { SettingsHealthPanel } from './SettingsHealthPanel';

const SECTIONS = [
    { id: 'salud', label: 'Salud', icon: Activity },
    { id: 'marca', label: 'Marca & Contacto', icon: MessageSquare },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'envios', label: 'Envíos', icon: Truck },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'ia', label: 'Inteligencia Artificial', icon: Bot },
    { id: 'tienda', label: 'Tienda & Sistema', icon: Settings },
];

export const SettingsView = ({ isMaintenance, toggleMaintenance, migrateData, updateSystemVersion, cleanStorage, siteConfig, updateSiteConfig }) => {
    const { sendOrderEmail, aiConfig, updateAiConfig, addToast, paymentConfig, updatePaymentConfig, cloudinaryConfig, updateCloudinaryConfig } = useStore();
    const confirm = useConfirm();
    const [section, setSection] = useState('salud');
    const [testEmail, setTestEmail] = useState('');
    const [isTestingEmail, setIsTestingEmail] = useState(false);
    const [isTestingKey, setIsTestingKey] = useState(false);
    const [tgTestMsg, setTgTestMsg] = useState('');
    const [isSendingTg, setIsSendingTg] = useState(false);
    const [pushTitle, setPushTitle] = useState('');
    const [pushBody, setPushBody] = useState('');
    const [pushUrl, setPushUrl] = useState('/shop');
    const [isSendingPush, setIsSendingPush] = useState(false);

    // MP local state
    const [mpConfig, setMpConfig] = useState({ publicKey: '', accessToken: '', mpFee: '', backendUrl: '' });
    const [showToken, setShowToken] = useState(false);
    const [isSavingMp, setIsSavingMp] = useState(false);
    useEffect(() => { if (paymentConfig) setMpConfig(prev => ({ ...prev, ...paymentConfig })); }, [paymentConfig]);

    // Cloudinary local state
    const [cldLocal, setCldLocal] = useState({ cloudName: '', uploadPreset: '' });
    useEffect(() => { if (cloudinaryConfig) setCldLocal(prev => ({ ...prev, ...cloudinaryConfig })); }, [cloudinaryConfig]);

    const handleSaveMp = async () => {
        setIsSavingMp(true);
        try { await updatePaymentConfig(mpConfig); } catch (e) { console.error(e); addToast('Error al guardar MP', 'error'); }
        setIsSavingMp(false);
    };

    const handleSendPush = async () => {
        if (!pushTitle.trim() || !pushBody.trim()) return addToast('Completá título y cuerpo', 'error');
        const secret = siteConfig?.push?.adminSecret || '';
        if (!secret) return addToast('Guardá el PUSH_ADMIN_SECRET en este card primero', 'error');
        const apiBase = siteConfig?.mpApiUrl ? siteConfig.mpApiUrl.replace(/\/api\/[^/]+$/, '/api') : `${window.location.origin}/api`;
        setIsSendingPush(true);
        try {
            const res = await fetch(`${apiBase}/send-push`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': secret }, body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            addToast(`Enviadas ${data.sent || 0}. Fallidas ${data.failed || 0}.`, 'success');
            setPushTitle(''); setPushBody('');
        } catch (err) { addToast(err.message || 'Error al enviar push', 'error'); }
        finally { setIsSendingPush(false); }
    };

    const handleTestTelegram = async () => {
        if (!tgTestMsg.trim()) return addToast('Escribí un mensaje para probar', 'error');
        setIsSendingTg(true);
        try {
            const { publishMessageToTelegram } = await import('../../utils/telegram');
            await publishMessageToTelegram({ message: tgTestMsg }, siteConfig);
            addToast('Mensaje enviado al canal', 'success'); setTgTestMsg('');
        } catch (err) { addToast(err.message || 'Error al enviar', 'error'); }
        finally { setIsSendingTg(false); }
    };

    const handleTestKey = async () => {
        const keysText = document.getElementById('aiAdminKeys')?.value || aiConfig?.adminKeys || '';
        const keysArray = keysText.split(/[,\n]+/).map(k => k.trim()).filter(k => k);
        if (keysArray.length === 0) return addToast('No hay llaves para probar', 'error');
        setIsTestingKey(true);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keysArray[0]}`);
            const data = await res.json();
            if (res.ok) {
                const models = data.models.map(m => m.name.replace('models/', ''));
                addToast(`Llave OK. Modelos: ${models.slice(0, 3).join(', ')}…`, 'success');
            } else if (data.error?.message?.includes('API_KEY_INVALID')) addToast('Llave inválida o eliminada en Google Cloud.', 'error');
            else if (res.status === 404 || data.error?.message?.includes('not found')) addToast('Llave válida pero sin Generative Language API habilitada.', 'error');
            else addToast(`Error: ${data.error?.message || res.statusText}`, 'error');
        } catch { addToast('Error de conexión al probar la llave', 'error'); }
        finally { setIsTestingKey(false); }
    };

    const handleTestEmail = async () => {
        if (!testEmail) return addToast('Ingresá un email para probar', 'error');
        setIsTestingEmail(true);
        try {
            await sendOrderEmail({ id: 'TEST-123456', date: new Date().toISOString(), total: 99999, shipping: 'Envío de Prueba', customer: { nombre: 'Tester', email: testEmail }, items: [{ name: 'Producto Prueba', size: 'M', quantity: 1, price: 99999 }] });
            addToast('Correo de prueba enviado. Revisá tu bandeja.', 'success');
        } catch (e) { console.error(e); addToast('Error: ' + (e.text || e.message), 'error'); }
        finally { setIsTestingEmail(false); }
    };

    const exportConfig = () => {
        const dump = { exportedAt: new Date().toISOString(), siteConfig, paymentConfig, cloudinaryConfig, aiConfig: { cerebrasModel: aiConfig?.cerebrasModel || '' /* claves NO se exportan */ } };
        const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `lbe-config-${new Date().toISOString().slice(0, 10)}.json`; a.click();
        addToast('Configuración exportada (sin API keys por seguridad)', 'success');
    };

    const importConfig = async (file) => {
        if (!file) return;
        if (!await confirm({ title: 'Importar configuración', message: 'Esto va a sobrescribir tu configuración actual con la del archivo. Las API keys no se importan. ¿Continuar?', confirmText: 'Importar', danger: true })) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (data.siteConfig) await updateSiteConfig(data.siteConfig);
            if (data.paymentConfig) await updatePaymentConfig(data.paymentConfig);
            if (data.cloudinaryConfig) await updateCloudinaryConfig(data.cloudinaryConfig);
            addToast('Configuración importada', 'success');
        } catch (e) { addToast('Archivo inválido: ' + e.message, 'error'); }
    };

    const cardCls = 'bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border dark:border-slate-700 shadow-sm';
    const labelCls = 'text-xs font-bold uppercase text-slate-400 mb-1 block';
    const inputCls = 'w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E8C65E]';

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold dark:text-white mb-2">Configuración</h1>
            <p className="text-slate-500 text-sm mb-6">Todos los ajustes de la tienda en un solo lugar.</p>

            <div className="flex flex-col md:flex-row gap-6">
                {/* SUB-NAV LATERAL */}
                <aside className="md:w-60 shrink-0 md:sticky md:top-4 md:self-start">
                    <nav className="grid grid-cols-2 md:grid-cols-1 gap-1">
                        {SECTIONS.map(s => {
                            const Icon = s.icon;
                            const active = section === s.id;
                            return (
                                <button key={s.id} onClick={() => setSection(s.id)} className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all text-left ${active ? 'bg-[#E8C65E] text-white shadow-lg shadow-[#E8C65E]/20' : 'bg-white dark:bg-[#1a1a1a] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <Icon className="w-4 h-4" />{s.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 space-y-6 min-w-0">

                    {/* SALUD */}
                    {section === 'salud' && (
                        <>
                            <SettingsHealthPanel onJump={(id) => setSection(id)} />
                            <SalesConfig />
                        </>
                    )}

                    {/* MARCA & CONTACTO */}
                    {section === 'marca' && (
                        <>
                            <div className={cardCls}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Phone className="w-5 h-5 text-[#E8C65E]" /> WhatsApp</h3>
                                <label className={labelCls}>Número (formato internacional sin + ni espacios)</label>
                                <div className="flex gap-2">
                                    <input type="text" defaultValue={siteConfig?.whatsappNumber || ''} placeholder="5491144444444" className={inputCls + ' flex-1 font-mono'} id="whatsappInput" />
                                    <Button onClick={() => { updateSiteConfig({ whatsappNumber: document.getElementById('whatsappInput').value }); addToast('Número guardado', 'success'); }} className="bg-slate-800 text-white text-xs px-4 rounded-lg">Guardar</Button>
                                </div>
                            </div>

                            <div className={cardCls}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><BarChart3 className="w-5 h-5 text-[#E8C65E]" /> Google Analytics 4</h3>
                                <label className={labelCls}>Measurement ID</label>
                                <div className="flex gap-2">
                                    <input type="text" defaultValue={siteConfig?.gaMeasurementId || ''} placeholder="G-XXXXXXXXXX" className={inputCls + ' flex-1 font-mono'} id="gaInput" />
                                    <Button onClick={() => { updateSiteConfig({ gaMeasurementId: document.getElementById('gaInput').value }); addToast('ID guardado', 'success'); }} className="bg-slate-800 text-white text-xs px-4 rounded-lg">Guardar</Button>
                                </div>
                            </div>

                            <div className={cardCls}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><AlertTriangle className="w-5 h-5 text-amber-500" /> Alerta de Stock Bajo</h3>
                                <label className={labelCls}>Umbral (unidades)</label>
                                <div className="flex gap-2">
                                    <input type="number" min="0" step="1" defaultValue={siteConfig?.lowStockThreshold ?? 5} className={inputCls + ' flex-1'} id="lowStockInput" />
                                    <Button onClick={() => { const v = parseInt(document.getElementById('lowStockInput').value, 10); if (Number.isNaN(v) || v < 0) return addToast('Número inválido', 'error'); updateSiteConfig({ lowStockThreshold: v }); addToast('Umbral guardado', 'success'); }} className="bg-slate-800 text-white text-xs px-4 rounded-lg">Guardar</Button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Productos con stock ≤ este valor disparan alerta en Dashboard e Inventario.</p>
                            </div>
                        </>
                    )}

                    {/* PAGOS — Mercado Pago */}
                    {section === 'pagos' && (
                        <div className={cardCls}>
                            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><CreditCard className="w-5 h-5 text-[#009EE3]" /> Mercado Pago</h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 mb-6">
                                <p className="text-xs text-blue-800 dark:text-blue-300">Conectá tu cuenta. Las credenciales se obtienen en el <a href="https://www.mercadopago.com.ar/developers/panel" target="_blank" rel="noopener noreferrer" className="underline font-bold">Panel de Desarrolladores</a>.</p>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className={labelCls}>Public Key</label>
                                    <input value={mpConfig.publicKey} onChange={e => setMpConfig({ ...mpConfig, publicKey: e.target.value })} className={inputCls + ' font-mono'} placeholder="APP_USR-..." />
                                </div>
                                <div>
                                    <label className={labelCls}>Access Token</label>
                                    <div className="relative">
                                        <input type={showToken ? 'text' : 'password'} value={mpConfig.accessToken} onChange={e => setMpConfig({ ...mpConfig, accessToken: e.target.value })} className={inputCls + ' font-mono pr-10'} placeholder="APP_USR-..." />
                                        <button onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Recargo MP al cliente (%)</label>
                                    <input type="number" min="0" max="100" step="0.1" value={mpConfig.mpFee || ''} onChange={e => setMpConfig({ ...mpConfig, mpFee: e.target.value })} className={inputCls + ' font-mono'} placeholder="Ej: 6" />
                                    <p className="text-[10px] text-slate-400 mt-1">Se suma al total cuando el cliente elige MP.</p>
                                </div>
                                <div>
                                    <label className={labelCls}>URL del Backend (Vercel)</label>
                                    <input value={mpConfig.backendUrl || ''} onChange={e => setMpConfig({ ...mpConfig, backendUrl: e.target.value })} className={inputCls + ' font-mono'} placeholder="https://tu-proyecto.vercel.app" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button onClick={handleSaveMp} disabled={isSavingMp} className="bg-[#009EE3] hover:bg-[#0081b8] text-white">
                                        {isSavingMp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Guardar credenciales
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ENVIOS */}
                    {section === 'envios' && <ShippingSettings />}

                    {/* NOTIFICACIONES */}
                    {section === 'notificaciones' && (
                        <>
                            <div className={cardCls + ' border-l-4 border-l-amber-500'}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Bell className="w-5 h-5 text-amber-500" /> Push Web (FCM)</h3>
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-4 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                                    <p><strong>Setup:</strong></p>
                                    <ol className="list-decimal ml-5 space-y-1">
                                        <li>Firebase Console → Cloud Messaging → Web Push certificates → Generate. Copiá la <strong>VAPID key</strong>.</li>
                                        <li>En Vercel agregá <code>FIREBASE_SERVICE_ACCOUNT</code> y <code>PUSH_ADMIN_SECRET</code>. Redeploy.</li>
                                        <li>Pegá los valores abajo.</li>
                                    </ol>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div><label className={labelCls}>VAPID Public Key</label><input type="text" defaultValue={siteConfig?.push?.vapidKey || ''} className={inputCls + ' font-mono'} id="pushVapidInput" placeholder="B..." /></div>
                                    <div><label className={labelCls}>PUSH_ADMIN_SECRET</label><input type="password" defaultValue={siteConfig?.push?.adminSecret || ''} className={inputCls + ' font-mono'} id="pushSecretInput" placeholder="••••••" /></div>
                                </div>
                                <Button onClick={() => { updateSiteConfig({ push: { ...(siteConfig?.push || {}), vapidKey: document.getElementById('pushVapidInput').value, adminSecret: document.getElementById('pushSecretInput').value } }); addToast('Push guardado', 'success'); }} className="bg-slate-800 text-white text-xs px-6 py-2 rounded-lg">Guardar</Button>

                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <label className={labelCls}>Enviar push a todos</label>
                                    <div className="space-y-2">
                                        <input type="text" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} placeholder="Título" className={inputCls} />
                                        <textarea rows={2} value={pushBody} onChange={(e) => setPushBody(e.target.value)} placeholder="Mensaje" className={inputCls + ' resize-y'} />
                                        <input type="text" value={pushUrl} onChange={(e) => setPushUrl(e.target.value)} placeholder="/shop" className={inputCls} />
                                        <Button onClick={handleSendPush} isLoading={isSendingPush} className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-6 py-2.5 rounded-lg w-full"><Bell className="w-4 h-4 mr-2 inline" /> Enviar a todos</Button>
                                    </div>
                                </div>
                            </div>

                            <div className={cardCls + ' border-l-4 border-l-sky-500'}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Send className="w-5 h-5 text-sky-500" /> Telegram (canal)</h3>
                                <div className="bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-100 dark:border-sky-900/30 mb-4 text-xs text-sky-800 dark:text-sky-300 space-y-2">
                                    <p><strong>Setup:</strong> creá un bot con @BotFather, agregalo como admin del canal, en Vercel poné <code>TELEGRAM_BOT_TOKEN</code>, <code>TELEGRAM_CHAT_ID</code> y opcionalmente <code>TELEGRAM_ADMIN_SECRET</code>. Redeploy.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={labelCls}>Admin Secret (opcional)</label>
                                        <div className="flex gap-2">
                                            <input type="password" defaultValue={siteConfig?.telegram?.secret || ''} className={inputCls + ' flex-1'} id="tgSecretInput" placeholder="••••••" />
                                            <Button onClick={() => { updateSiteConfig({ telegram: { ...(siteConfig?.telegram || {}), secret: document.getElementById('tgSecretInput').value } }); addToast('Secret guardado', 'success'); }} className="bg-slate-800 text-white text-xs px-4 rounded-lg">Guardar</Button>
                                        </div>
                                    </div>
                                </div>
                                <label className={labelCls}>Publicar al canal (test)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={tgTestMsg} onChange={(e) => setTgTestMsg(e.target.value)} placeholder="🎉 20% OFF — sólo hoy" className={inputCls + ' flex-1'} />
                                    <Button onClick={handleTestTelegram} isLoading={isSendingTg} className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-6 py-2.5 rounded-lg">Publicar</Button>
                                </div>
                            </div>

                            <div className={cardCls + ' border-l-4 border-l-blue-500'}>
                                <h3 className="font-bold mb-1 flex items-center gap-2 text-slate-800 dark:text-white"><Mail className="w-5 h-5 text-blue-500" /> EmailJS (emails al cliente)</h3>
                                <p className="text-[11px] text-slate-400 mb-4">Confirmación de pedido (al comprar) y aviso de envío (al despachar). Cargá las credenciales de tu cuenta de EmailJS.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div><label className={labelCls}>Service ID</label><input type="text" defaultValue={siteConfig?.emailjs?.serviceId || ''} className={inputCls + ' font-mono'} id="emailjsServiceId" /></div>
                                        <div><label className={labelCls}>Public Key</label><input type="text" defaultValue={siteConfig?.emailjs?.publicKey || ''} className={inputCls + ' font-mono'} id="emailjsPublicKey" /></div>
                                        <div><label className={labelCls}>Template — Confirmación de pedido</label><input type="text" defaultValue={siteConfig?.emailjs?.templateId || ''} className={inputCls + ' font-mono'} id="emailjsTemplateId" placeholder="template_xxx" /></div>
                                        <div><label className={labelCls}>Template — Pedido enviado <span className="text-slate-400 normal-case">(opcional)</span></label><input type="text" defaultValue={siteConfig?.emailjs?.shippedTemplateId || ''} className={inputCls + ' font-mono'} id="emailjsShippedTemplateId" placeholder="si lo dejás vacío usa el de confirmación" /></div>
                                        <div><label className={labelCls}>Template — Carrito abandonado <span className="text-slate-400 normal-case">(opcional)</span></label><input type="text" defaultValue={siteConfig?.emailjs?.abandonedTemplateId || ''} className={inputCls + ' font-mono'} id="emailjsAbandonedTemplateId" placeholder="template_xxx" /></div>
                                        <Button onClick={() => { updateSiteConfig({ emailjs: { serviceId: document.getElementById('emailjsServiceId').value, templateId: document.getElementById('emailjsTemplateId').value, shippedTemplateId: document.getElementById('emailjsShippedTemplateId').value, abandonedTemplateId: document.getElementById('emailjsAbandonedTemplateId').value, publicKey: document.getElementById('emailjsPublicKey').value } }); addToast('EmailJS guardado', 'success'); }} className="w-full bg-slate-800 text-white text-xs py-3 rounded-lg">Guardar credenciales</Button>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <label className="text-xs font-bold uppercase text-blue-800 dark:text-blue-400 mb-2 block">Probar envío</label>
                                        <div className="flex gap-2">
                                            <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="tu@email.com" className={inputCls + ' flex-1'} />
                                            <Button onClick={handleTestEmail} isLoading={isTestingEmail} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 rounded-lg">Enviar</Button>
                                        </div>
                                        <p className="text-[10px] text-blue-400 mt-2">Envía un recibo de prueba a esta dirección.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* IA */}
                    {section === 'ia' && (
                        <div className={cardCls + ' border-l-4 border-l-purple-500'}>
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Bot className="w-5 h-5 text-purple-500" /> Inteligencia Artificial</h3>
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 mb-4">
                                <p className="text-sm text-purple-800 dark:text-purple-300"><strong>Motor:</strong> Cerebras (texto · Lau y copy). <strong>Visión:</strong> Gemini primario, NVIDIA NIM como fallback. El asistente del cliente usa Gemini.</p>
                            </div>

                            <div className="bg-gradient-to-br from-[#E8C65E]/10 to-transparent p-4 rounded-xl border border-[#E8C65E]/30 mb-4">
                                <div className="flex items-center gap-2 mb-3"><Bot className="w-4 h-4 text-[#E8C65E]" /><span className="text-sm font-bold text-[#E8C65E] uppercase tracking-wider">Cerebras · IA Principal</span></div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Obtené tu key en <a href="https://cloud.cerebras.ai" target="_blank" rel="noopener noreferrer" className="underline">cloud.cerebras.ai</a>.</p>
                                <label className={labelCls}>API Key Cerebras</label>
                                <input id="cerebrasKey" type="password" defaultValue={aiConfig?.cerebrasKey || ''} placeholder="csk-..." className={inputCls + ' font-mono mb-3'} />
                                <label className={labelCls}>Modelo (opcional)</label>
                                <input id="cerebrasModel" defaultValue={aiConfig?.cerebrasModel || ''} placeholder="qwen-3-235b-a22b-instruct-2507 (default)" className={inputCls + ' font-mono'} />
                                <p className="text-[10px] text-slate-400 mt-2">Disponibles: qwen-3-235b-a22b-instruct-2507 · zai-glm-4.7 · gpt-oss-120b · llama3.1-8b</p>
                            </div>

                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Gemini · Visión + Fallback</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelCls}>Llaves Administrador (Lau, copy, visión)</label><textarea id="aiAdminKeys" defaultValue={aiConfig?.adminKeys || ''} placeholder="AIzaSy..." className={inputCls + ' min-h-[120px] font-mono resize-y'} /></div>
                                <div><label className={labelCls}>Llaves Cliente (Elegancia IA)</label><textarea id="aiCustomerKeys" defaultValue={aiConfig?.customerKeys || ''} placeholder="AIzaSy..." className={inputCls + ' min-h-[120px] font-mono resize-y'} /></div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent p-4 rounded-xl border border-emerald-500/30 mt-4">
                                <div className="flex items-center gap-2 mb-3"><Bot className="w-4 h-4 text-emerald-500" /><span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">NVIDIA NIM · Visión de fallback</span></div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Detrás de Gemini para analizar fotos de prendas. Key gratuita (créditos iniciales) en <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="underline">build.nvidia.com</a>.</p>
                                <label className={labelCls}>API Key NVIDIA</label>
                                <input id="nvidiaKey" type="password" defaultValue={aiConfig?.nvidiaKey || ''} placeholder="nvapi-..." className={inputCls + ' font-mono mb-3'} />
                                <label className={labelCls}>Modelo (opcional)</label>
                                <input id="nvidiaModel" defaultValue={aiConfig?.nvidiaModel || ''} placeholder="meta/llama-3.2-90b-vision-instruct (default)" className={inputCls + ' font-mono'} />
                                <p className="text-[10px] text-slate-400 mt-2">Disponibles: meta/llama-3.2-90b-vision-instruct · meta/llama-3.2-11b-vision-instruct · mistralai/pixtral-12b-2409</p>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Button onClick={() => { updateAiConfig({ cerebrasKey: document.getElementById('cerebrasKey')?.value || '', cerebrasModel: document.getElementById('cerebrasModel')?.value || '', adminKeys: document.getElementById('aiAdminKeys')?.value || '', customerKeys: document.getElementById('aiCustomerKeys')?.value || '', nvidiaKey: document.getElementById('nvidiaKey')?.value || '', nvidiaModel: document.getElementById('nvidiaModel')?.value || '' }); addToast('Llaves guardadas', 'success'); }} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-6 py-2.5 rounded-lg shadow-lg shadow-purple-500/20">Guardar Keys</Button>
                                <Button onClick={handleTestKey} isLoading={isTestingKey} className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-6 py-2.5 rounded-lg border border-slate-700">Probar (Gemini admin)</Button>
                            </div>
                        </div>
                    )}

                    {/* TIENDA & SISTEMA */}
                    {section === 'tienda' && (
                        <>
                            <div className={cardCls}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Lock className="w-5 h-5 text-[#E8C65E]" /> Disponibilidad</h3>
                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">Modo Mantenimiento</p>
                                        <p className="text-xs text-slate-500 mt-1 max-w-[300px]">Los clientes ven una pantalla de "Próximamente". Vos seguís entrando.</p>
                                    </div>
                                    <button type="button" onClick={toggleMaintenance} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isMaintenance ? 'bg-[#E8C65E]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isMaintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className={cardCls}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><ImageIcon className="w-5 h-5 text-[#E8C65E]" /> Cloudinary (imágenes)</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div><label className={labelCls}>Cloud Name</label><input value={cldLocal.cloudName} onChange={e => setCldLocal({ ...cldLocal, cloudName: e.target.value })} className={inputCls + ' font-mono'} placeholder="mi-cuenta" /></div>
                                    <div><label className={labelCls}>Upload Preset (unsigned)</label><input value={cldLocal.uploadPreset} onChange={e => setCldLocal({ ...cldLocal, uploadPreset: e.target.value })} className={inputCls + ' font-mono'} placeholder="ml_default" /></div>
                                </div>
                                <Button onClick={async () => { await updateCloudinaryConfig(cldLocal); addToast('Cloudinary guardado', 'success'); }} className="bg-slate-800 text-white text-xs px-6 py-2 rounded-lg mt-4">Guardar</Button>
                                <p className="text-[10px] text-slate-400 mt-2">Sin Cloudinary no podés subir fotos de productos ni reseñas.</p>
                            </div>

                            <div className={cardCls}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Download className="w-5 h-5 text-[#E8C65E]" /> Backup / Restore configuración</h3>
                                <p className="text-xs text-slate-500 mb-4">Exportá un JSON con toda tu configuración (sin API keys por seguridad). Útil antes de cambios grandes.</p>
                                <div className="flex gap-3">
                                    <Button onClick={exportConfig} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 rounded-lg"><Download className="w-4 h-4 mr-2 inline" /> Exportar JSON</Button>
                                    <label className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer">
                                        <Upload className="w-4 h-4" /> Importar JSON
                                        <input type="file" accept="application/json" className="hidden" onChange={(e) => { importConfig(e.target.files?.[0]); e.target.value = ''; }} />
                                    </label>
                                </div>
                            </div>

                            <div className={cardCls + ' border-red-100 dark:border-red-900/30'}>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600"><Settings className="w-5 h-5" /> Zona de peligro</h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                        <p className="font-bold text-xs text-red-800 dark:text-red-400 mb-3">Migración de datos locales (legacy)</p>
                                        <Button onClick={async () => {
                                            const localInv = JSON.parse(localStorage.getItem('cielo_inventory'));
                                            const localOrd = JSON.parse(localStorage.getItem('cielo_orders'));
                                            const localCat = JSON.parse(localStorage.getItem('cielo_categories'));
                                            if (await confirm({ title: '⚠️ Migración', message: 'Sube TODOS los datos locales a Firebase. Puede sobrescribir datos reales. Irreversible.', confirmText: 'Subir y sobrescribir', danger: true })) migrateData(localInv, localOrd, localCat);
                                        }} className="bg-red-600 hover:bg-red-700 text-white w-full py-2.5 rounded-xl font-bold text-xs">SUBIR DATOS LOCALES A NUBE</Button>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <p className="font-bold text-xs text-blue-800 dark:text-blue-400 mb-3">Forzar recarga en clientes</p>
                                        <Button onClick={async () => { if (await confirm({ title: 'Notificar actualización', message: 'Se mostrará un cartel a todos los clientes para que recarguen.', confirmText: 'Notificar' })) updateSystemVersion(); }} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2.5 rounded-xl font-bold text-xs">NOTIFICAR ACTUALIZACIÓN</Button>
                                    </div>
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                        <p className="font-bold text-xs text-orange-800 dark:text-orange-400 mb-3">Limpieza de imágenes huérfanas</p>
                                        <Button onClick={async () => { if (await confirm({ title: 'Limpiar', message: 'Borra imágenes que no estén en el inventario. Irreversible.', confirmText: 'Escanear y limpiar', danger: true })) await cleanStorage(); }} className="bg-orange-600 hover:bg-orange-700 text-white w-full py-2.5 rounded-xl font-bold text-xs">SCAN & CLEAN IMAGES</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsView;
