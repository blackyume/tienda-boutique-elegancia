import React from 'react';
import { formatMoney } from '../../utils/helpers';

export const SalesView = ({ salesLog }) => (
    <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-2xl font-bold dark:text-white mb-8">Registro de Ventas</h1>
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            {(!salesLog || salesLog.length === 0) ? (
                <div className="py-20 text-center text-slate-400">
                    <p className="text-sm">Todavía no hay ventas registradas.</p>
                    <p className="text-xs mt-1 text-slate-400/70">Cuando se concrete la primera venta, vas a verla acá.</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500"><tr><th className="p-4">Producto</th><th className="p-4 text-center">Cant</th><th className="p-4 text-right">Total</th><th className="p-4 text-right">Ganancia</th></tr></thead>
                    <tbody>{salesLog.map((s, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-800"><td className="p-4 font-medium text-slate-800 dark:text-white">{s.productName}</td><td className="p-4 text-center text-slate-600 dark:text-slate-300">{s.quantity}</td><td className="p-4 text-right text-slate-600 dark:text-slate-300">{formatMoney(s.total)}</td><td className="p-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">+{formatMoney(s.profit)}</td></tr>)}</tbody>
                </table>
            )}
        </div>
    </div>
);
