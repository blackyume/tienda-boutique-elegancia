import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, Sparkles, ArrowRight, PartyPopper, ChevronDown, X } from 'lucide-react';

// Panel de "Primeros pasos" para la puesta en marcha de la tienda.
// Compacto: una línea de cabecera con el progreso, y abajo sólo lo que
// falta (lo hecho se resume en una línea). Se puede plegar, y cuando está
// todo listo queda una sola línea que se cierra con la X y no vuelve.

const CLAVE_PLEGADO = 'lbde-primeros-pasos-plegado';
const CLAVE_CERRADO = 'lbde-primeros-pasos-cerrado';
const leer = (k) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } };
const guardar = (k, v) => { try { v ? localStorage.setItem(k, '1') : localStorage.removeItem(k); } catch { /* sin storage */ } };

export const OnboardingPanel = ({ onCreateProduct, onNavigate, toggleMaintenance, isMaintenance }) => {
    const { inventory, paymentConfig, siteConfig, shippingRates } = useStore();
    const [plegado, setPlegado] = useState(() => leer(CLAVE_PLEGADO));
    const [cerrado, setCerrado] = useState(() => leer(CLAVE_CERRADO));

    const steps = [
        {
            key: 'prod',
            label: 'Cargá tu primer producto',
            corto: 'producto',
            desc: 'Una prenda con foto, precio y stock. Podés pedírselo a Lau con una foto.',
            done: (inventory?.length || 0) > 0,
            cta: 'Crear producto',
            action: onCreateProduct,
        },
        {
            key: 'pay',
            label: 'Conectá Mercado Pago',
            corto: 'Mercado Pago',
            desc: 'Para cobrar online (tarjeta, débito, cuotas).',
            done: !!(paymentConfig?.accessToken),
            cta: 'Configurar',
            action: () => onNavigate('settings'),
        },
        {
            key: 'ship',
            label: 'Configurá envíos y tus datos',
            corto: 'envíos',
            desc: 'Tarifas del Correo y los datos del remitente para las etiquetas.',
            done: !!(shippingRates && Object.keys(shippingRates).length) && !!(siteConfig?.remitente?.address),
            cta: 'Configurar',
            action: () => onNavigate('settings'),
        },
        {
            key: 'mail',
            label: 'Activá los emails',
            corto: 'emails',
            desc: 'Confirmación de compra y aviso de envío automáticos.',
            done: !!(siteConfig?.emailjs?.serviceId),
            cta: 'Configurar',
            action: () => onNavigate('settings'),
        },
        {
            key: 'open',
            label: 'Abrí la tienda',
            corto: 'tienda abierta',
            desc: 'Apagá el modo mantenimiento cuando esté todo listo.',
            done: !isMaintenance,
            cta: 'Abrir tienda',
            action: toggleMaintenance,
        },
    ];

    const hechos = steps.filter(s => s.done);
    const faltan = steps.filter(s => !s.done);
    const pct = Math.round((hechos.length / steps.length) * 100);

    if (cerrado) return null;

    // Todo completo → una línea, que se cierra y no vuelve.
    if (faltan.length === 0) {
        return (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/[0.06]">
                <PartyPopper className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="flex-1 text-sm text-slate-700 dark:text-slate-200"><strong>Tienda lista para vender.</strong> Los cinco primeros pasos están hechos.</p>
                <button onClick={() => { setCerrado(true); guardar(CLAVE_CERRADO, true); }} className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white" title="Cerrar" aria-label="Cerrar">
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    const alternar = () => { setPlegado(p => { guardar(CLAVE_PLEGADO, !p); return !p; }); };

    return (
        <div className="rounded-2xl overflow-hidden border border-[#E8C65E]/30 bg-white dark:bg-[#1a1a1a] shadow-sm">
            {/* Cabecera: una línea con el progreso; toca para plegar */}
            <button onClick={alternar} className="w-full text-left px-4 sm:px-5 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(100deg, rgba(232,198,94,0.12), transparent)' }} aria-expanded={!plegado}>
                <span className="w-8 h-8 rounded-full bg-[#E8C65E]/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#E8C65E]" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Primeros pasos</h3>
                        <span className="text-xs font-black text-[#E8C65E]">{hechos.length} de {steps.length}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {faltan.length === 1 ? 'Falta uno: ' : `Faltan ${faltan.length}: `}{faltan.map(s => s.corto).join(', ')}
                        </span>
                    </div>
                    <div className="mt-1.5 w-full max-w-md h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${plegado ? '-rotate-90' : ''}`} />
            </button>

            {!plegado && (
                <div className="border-t border-slate-100 dark:border-white/5">
                    {faltan.map((s) => (
                        <div key={s.key} className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                {steps.indexOf(s) + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{s.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">{s.desc}</p>
                            </div>
                            <button
                                onClick={s.action}
                                className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-[#E8C65E] text-white dark:text-black hover:opacity-90 transition-opacity"
                            >
                                {s.cta} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    {hechos.length > 0 && (
                        <p className="px-4 sm:px-5 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50/60 dark:bg-white/[0.02]">
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Ya hecho: {hechos.map(s => s.corto).join(', ')}.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
