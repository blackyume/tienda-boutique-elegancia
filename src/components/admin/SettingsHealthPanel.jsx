import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Activity } from 'lucide-react';

// Panel de "salud" de la tienda — al toque ves qué está conectado y qué falta.
const Row = ({ ok, label, hint, onGoTo }) => (
    <button
        type="button"
        onClick={onGoTo}
        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${ok
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20'
            : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/20'
            }`}
    >
        {ok
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
        <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 dark:text-white">{label}</div>
            <div className={`text-[11px] ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'}`}>{hint}</div>
        </div>
    </button>
);

export const SettingsHealthPanel = ({ onJump }) => {
    const { siteConfig, aiConfig, paymentConfig, cloudinaryConfig } = useStore();
    const checks = [
        { id: 'pay',  ok: Boolean(paymentConfig?.accessToken && paymentConfig?.publicKey), label: 'Mercado Pago', okHint: 'Credenciales cargadas', badHint: 'Falta accessToken o publicKey', goto: 'pagos' },
        { id: 'cld',  ok: Boolean(cloudinaryConfig?.cloudName && cloudinaryConfig?.uploadPreset), label: 'Cloudinary (imágenes)', okHint: 'Subida de fotos activa', badHint: 'Falta cloudName / uploadPreset — sin esto no podés subir fotos', goto: 'tienda' },
        { id: 'cer',  ok: Boolean((aiConfig?.cerebrasKey || '').trim()), label: 'Cerebras (Laurina)', okHint: 'Motor principal activo', badHint: 'Sin Cerebras el copiloto cae a Gemini si está', goto: 'ia' },
        { id: 'gma',  ok: Boolean((aiConfig?.adminKeys || '').trim()), label: 'Gemini · Admin (visión + fallback)', okHint: 'Análisis de fotos disponible', badHint: 'Sin Gemini, Laurina no puede analizar fotos', goto: 'ia' },
        { id: 'gmc',  ok: Boolean((aiConfig?.customerKeys || '').trim()), label: 'Gemini · Asistente cliente', okHint: 'Elegancia IA del cliente activa', badHint: 'El chat del cliente no responderá', goto: 'ia' },
        { id: 'mail', ok: Boolean(siteConfig?.emailjs?.serviceId && siteConfig?.emailjs?.templateId && siteConfig?.emailjs?.publicKey), label: 'EmailJS (recibos)', okHint: 'Envío de correos OK', badHint: 'Faltan credenciales — sin esto no se envían recibos', goto: 'notificaciones' },
        { id: 'push', ok: Boolean(siteConfig?.push?.vapidKey && siteConfig?.push?.adminSecret), label: 'Notificaciones Push (FCM)', okHint: 'Push web activo', badHint: 'Falta VAPID key o admin secret', goto: 'notificaciones' },
        { id: 'tg',   ok: Boolean(siteConfig?.telegram?.secret), label: 'Telegram (opcional)', okHint: 'Secret configurado', badHint: 'Opcional. Si lo usás en Vercel pegá el secret', goto: 'notificaciones' },
        { id: 'wa',   ok: Boolean(siteConfig?.whatsappNumber), label: 'WhatsApp Business', okHint: `Número ${siteConfig?.whatsappNumber}`, badHint: 'Falta número — el botón de WA no funcionará', goto: 'marca' },
        { id: 'ga',   ok: Boolean(siteConfig?.gaMeasurementId), label: 'Google Analytics 4', okHint: `ID ${siteConfig?.gaMeasurementId}`, badHint: 'Sin medición de tráfico web', goto: 'marca' },
    ];
    const okCount = checks.filter(c => c.ok).length;
    const total = checks.length;

    return (
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Activity className="w-5 h-5 text-[#C19A6B]" /> Salud de la tienda
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${okCount === total ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                    {okCount}/{total} conectado
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {checks.map(c => (
                    <Row key={c.id} ok={c.ok} label={c.label} hint={c.ok ? c.okHint : c.badHint} onGoTo={() => onJump?.(c.goto)} />
                ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Los servicios marcados como faltantes no rompen la tienda — pero conviene tenerlos al día. Click en cualquier ítem te lleva a configurarlo.</p>
        </div>
    );
};

export default SettingsHealthPanel;
