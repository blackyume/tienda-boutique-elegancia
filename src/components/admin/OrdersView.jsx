import React, { useState } from 'react';
import { formatMoney } from '../../utils/helpers';
import { KanbanBoard } from './KanbanBoard';
import { EmptyState } from '../ui/EmptyState';
import { usePrompt } from '../ui/ConfirmDialog';
import { LayoutList, KanbanSquare, PackageOpen } from 'lucide-react';

export const OrdersView = ({ orders, updateOrderStatus }) => {
    const askPrompt = usePrompt();
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
    const [filter, setFilter] = useState('all');

    // Derived state
    const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

    const getStatusColor = (status) => {
        if (status === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        if (status === 'delivered') return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    };

    const handleUpdate = async (id, newStatus) => {
        if (newStatus === 'shipped') {
            const tracking = await askPrompt({
                title: 'Marcar como enviado',
                message: 'Código de seguimiento (opcional).',
                placeholder: 'Ej: AR123456789',
                confirmText: 'Marcar enviado'
            });
            if (tracking === null) return; // cancelado
            updateOrderStatus(id, newStatus, { trackingNumber: tracking || '' });
        } else {
            updateOrderStatus(id, newStatus);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold dark:text-white">Gestión de Pedidos</h1>
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center border border-slate-200 dark:border-slate-700">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-slate-400'}`} title="Vista Lista"><LayoutList className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-slate-400'}`} title="Vista Tablero"><KanbanSquare className="w-5 h-5" /></button>
                    </div>
                </div>

                {viewMode === 'list' && (
                    <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
                        {['all', 'pending', 'shipped', 'delivered'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'shipped' ? 'Enviados' : 'Entregados'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {viewMode === 'board' ? (
                <KanbanBoard orders={orders} updateOrderStatus={updateOrderStatus} />
            ) : (
                <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                    {filteredOrders.length === 0 ? (
                        <EmptyState
                            icon={PackageOpen}
                            title={filter === 'all' ? 'Todavía no hay pedidos' : 'Sin pedidos en este estado'}
                            subtitle={filter === 'all' ? 'Cuando entre la primera venta vas a verla acá en tiempo real.' : 'Probá cambiar el filtro para ver otros pedidos.'}
                        />
                    ) : (
                        filteredOrders.map(o => (
                            <div key={o.id} className="group p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-500">
                                        {o.items.length}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-[#C19A6B] text-lg font-mono">#{o.id.slice(-6)}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(o.status)}`}>
                                                {o.status === 'pending' ? 'Pendiente' : o.status === 'shipped' ? 'Enviado' : 'Entregado'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold dark:text-white">{o.customer.nombre} {o.customer.apellido}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                            {new Date(o.date).toLocaleDateString()} • {o.shipping.toUpperCase()}
                                            {o.trackingNumber && <span className="text-blue-500 font-mono bg-blue-50 dark:bg-blue-900/20 px-1 rounded">TRK: {o.trackingNumber}</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 w-full md:w-auto pl-16 md:pl-0">
                                    <span className="font-bold text-xl dark:text-white mb-2">{formatMoney(o.total)}</span>
                                    <div className="flex items-center gap-2">
                                        {o.status === 'pending' && (
                                            <button
                                                onClick={() => handleUpdate(o.id, 'shipped')}
                                                className="bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:opacity-80 transition-opacity"
                                            >
                                                Marcar Enviado
                                            </button>
                                        )}
                                        {o.status === 'shipped' && (
                                            <button
                                                onClick={() => handleUpdate(o.id, 'delivered')}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-green-700 transition-colors"
                                            >
                                                Marcar Entregado
                                            </button>
                                        )}
                                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors" title="Cancelar Pedido (Próximamente)">
                                            <span className="text-xs font-bold">CANCELAR</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            )}
        </div>
    );
};
