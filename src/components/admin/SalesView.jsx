import React from 'react';
import { formatMoney } from '../../utils/helpers';

export const SalesView = ({ salesLog }) => (
    <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-2xl font-bold dark:text-white mb-8">Registro de Ventas</h1>
        <div className="bg-white dark:bg-[#1e293b] border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500"><tr><th className="p-4">Producto</th><th className="p-4 text-center">Cant</th><th className="p-4 text-right">Total</th><th className="p-4 text-right">Ganancia</th></tr></thead>
                <tbody>{salesLog.map((s, i) => <tr key={i} className="border-b dark:border-slate-700"><td className="p-4 font-medium dark:text-white">{s.productName}</td><td className="p-4 text-center">{s.quantity}</td><td className="p-4 text-right">{formatMoney(s.total)}</td><td className="p-4 text-right text-emerald-500 font-bold">+{formatMoney(s.profit)}</td></tr>)}</tbody>
            </table>
        </div>
    </div>
);
