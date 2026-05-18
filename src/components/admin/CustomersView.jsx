import React, { useMemo } from 'react';
import { formatMoney } from '../../utils/helpers';
import { Users, Mail, Phone, Calendar, ShoppingBag, BadgeCheck } from 'lucide-react';
import { usePagination, Pagination } from '../ui/Pagination';

export const CustomersView = ({ orders }) => {

    // AGGREGATE DATA
    const customers = useMemo(() => {
        const customerMap = {};

        (orders || []).forEach(order => {
            const cust = order.customer || {};
            const email = cust.email || 'sin-email';
            if (!customerMap[email]) {
                customerMap[email] = {
                    id: email,
                    name: `${cust.nombre || 'Cliente'} ${cust.apellido || ''}`.trim(),
                    email: email,
                    phone: cust.telefono || '—',
                    totalSpent: 0,
                    orderCount: 0,
                    lastOrder: order.date,
                    city: cust.ciudad || '—',
                    province: cust.provincia || ''
                };
            }
            customerMap[email].totalSpent += order.total;
            customerMap[email].orderCount += 1;
            if (new Date(order.date) > new Date(customerMap[email].lastOrder)) {
                customerMap[email].lastOrder = order.date;
            }
        });

        // Convert to array and sort by total spent (VIPs first)
        return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
    }, [orders]);

    const PAGE = 24;
    const custPage = usePagination(customers, PAGE);

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-24 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-wider">Cartera de Clientes</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">
                        {customers.length} clientes registrados históricamente.
                    </p>
                </div>
                <div className="bg-[#C19A6B]/10 text-[#C19A6B] px-4 py-2 rounded-xl flex items-center gap-2 border border-[#C19A6B]/20">
                    <Users className="w-5 h-5" />
                    <span className="font-bold text-sm">CRM Activo</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {custPage.pageItems.map((c, idx) => {
                    const i = (custPage.page - 1) * PAGE + idx;
                    return (
                    <div key={c.id} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

                        {/* VIP BADGE FOR TOP 3 */}
                        {i < 3 && (
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                VIP
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {c.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{c.name}</h3>
                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                    <Mail className="w-3 h-3" /> {c.email}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gastado</span>
                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatMoney(c.totalSpent)}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pedidos</span>
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                                    <span className="text-lg font-bold text-slate-700 dark:text-white">{c.orderCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-[#C19A6B]" /> {c.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="w-3 h-3 text-[#C19A6B]" /> {c.city}, {c.province}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-3">
                                <Calendar className="w-3 h-3 text-slate-400" /> Última compra: {new Date(c.lastOrder).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            <Pagination page={custPage.page} setPage={custPage.setPage} totalPages={custPage.totalPages} total={custPage.total} pageSize={PAGE} />

            {customers.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Aún no tienes clientes registrados.</p>
                </div>
            )}
        </div>
    );
};
