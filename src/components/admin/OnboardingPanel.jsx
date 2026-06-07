import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, Sparkles, ArrowRight, PartyPopper } from 'lucide-react';

// Panel de "Primeros pasos" para la puesta en marcha de la tienda.
// Se muestra mientras falte completar algún paso; cuando está todo listo,
// muestra un mensaje de felicitación discreto (o se oculta).
export const OnboardingPanel = ({ onCreateProduct, onNavigate, toggleMaintenance, isMaintenance }) => {
    const { inventory, paymentConfig, siteConfig, shippingRates } = useStore();

    const steps = [
        {
            key: 'prod',
            label: 'Cargá tu primer producto',
            desc: 'Subí una prenda con foto, precio y stock. Podés pedírselo a Lau con una foto.',
            done: (inventory?.length || 0) > 0,
            cta: 'Crear producto',
            action: onCreateProduct,
        },
        {
            key: 'pay',
            label: 'Conectá Mercado Pago',
            desc: 'Para cobrar online de forma segura (tarjeta, débito, cuotas).',
            done: !!(paymentConfig?.accessToken),
            cta: 'Configurar',
            action: () => onNavigate('settings'),
        },
        {
            key: 'ship',
            label: 'Configurá envíos y tus datos',
            desc: 'Tarifas de Correo Argentino y los datos del remitente (para las etiquetas).',
            done: !!(shippingRates && Object.keys(shippingRates).length) && !!(siteConfig?.remitente?.address),
            cta: 'Configurar',
            action: () => onNavigate('settings'),
        },
        {
            key: 'mail',
            label: 'Activá los emails',
            desc: 'Confirmación de compra y aviso de envío automáticos al cliente.',
            done: !!(siteConfig?.emailjs?.serviceId),
            cta: 'Configurar',
            action: () => onNavigate('settings'),
        },
        {
            key: 'open',
            label: 'Abrí la tienda',
            desc: 'Apagá el modo mantenimiento cuando esté todo listo para vender.',
            done: !isMaintenance,
            cta: 'Abrir tienda',
            action: toggleMaintenance,
        },
    ];

    const doneCount = steps.filter(s => s.done).length;
    const pct = Math.round((doneCount / steps.length) * 100);

    // Todo completo → felicitación compacta.
    if (doneCount === steps.length) {
        return (
            <div className="rounded-2xl p-5 flex items-center gap-4 border border-emerald-500/30 bg-emerald-500/[0.06]">
                <PartyPopper className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                    <p className="font-bold text-slate-900 dark:text-white">¡Tienda lista para vender! 🎉</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completaste todos los pasos. Ahora a difundir y vender.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-white dark:bg-[#1a1a1a] shadow-sm">
            {/* Header dorado */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/5" style={{ background: 'linear-gradient(100deg, rgba(212,175,55,0.12), transparent)' }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                        </span>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Primeros pasos</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Completá esto para dejar tu tienda lista para vender.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-[#D4AF37]">{doneCount}/{steps.length}</span>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">completados</p>
                    </div>
                </div>
                {/* Barra de progreso */}
                <div className="mt-4 w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />
                </div>
            </div>

            {/* Lista de pasos */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
                {steps.map((s, i) => (
                    <div key={s.key} className={`flex items-center gap-4 p-4 sm:px-6 ${s.done ? 'opacity-60' : ''}`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${s.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300'}`}>
                            {s.done ? <Check className="w-4 h-4" /> : i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${s.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{s.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                        </div>
                        {!s.done && (
                            <button
                                onClick={s.action}
                                className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-black hover:opacity-90 transition-opacity"
                            >
                                {s.cta} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
