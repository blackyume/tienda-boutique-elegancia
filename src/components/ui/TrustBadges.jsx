import React from 'react';
import { ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react';

export const TrustBadges = ({ className = "" }) => {
    return (
        <div className={`flex flex-col gap-4 py-6 border-t border-b border-slate-100 dark:border-slate-800 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="btn-oro w-12 h-10 shrink-0 rounded-lg flex items-center justify-center shadow-md">
                    <img src="/brands/mercadopago-isotipo.svg" alt="Mercado Pago" className="w-9 h-auto" loading="lazy" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Pago Seguro</h4>
                    <p className="text-[10px] text-slate-500">Procesado por Mercado Pago</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-12 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                    <Truck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Envíos a todo el país</h4>
                    <p className="text-[10px] text-slate-500">Con Correo Argentino</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-12 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                    <CreditCard className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Cuotas</h4>
                    <p className="text-[10px] text-slate-500">Las que ofrezca tu tarjeta</p>
                </div>
            </div>
        </div>
    );
};
