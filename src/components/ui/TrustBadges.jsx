import React from 'react';
import { ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react';

export const TrustBadges = ({ className = "" }) => {
    return (
        <div className={`grid grid-cols-2 gap-4 py-6 border-t border-b border-slate-100 dark:border-slate-800 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Compra Segura</h4>
                    <p className="text-[10px] text-slate-500">Datos encriptados SSL</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
                    <Truck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Envío Gratis</h4>
                    <p className="text-[10px] text-slate-500">En compras superiores</p>
                </div>
            </div>



            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
                    <CreditCard className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Cuotas</h4>
                    <p className="text-[10px] text-slate-500">Sin interés con bancos</p>
                </div>
            </div>
        </div>
    );
};
