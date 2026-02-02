import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';
import { Clock, CheckCircle, Truck, Package, AlertCircle } from 'lucide-react';

export const KanbanBoard = ({ orders, updateOrderStatus }) => {
    const [draggedOrder, setDraggedOrder] = useState(null);

    // Columns Configuration
    const columns = [
        { id: 'pending', title: 'Pendientes', icon: Clock, color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
        { id: 'shipped', title: 'En Camino', icon: Truck, color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
        { id: 'delivered', title: 'Entregados', icon: CheckCircle, color: 'bg-green-100 text-green-700', border: 'border-green-200' },
    ];

    const handleDragStart = (e, order) => {
        setDraggedOrder(order);
        e.dataTransfer.setData('text/plain', order.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('text/plain');

        if (draggedOrder && draggedOrder.id === orderId && draggedOrder.status !== status) {

            if (status === 'shipped') {
                const tracking = prompt("Ingresa el código de seguimiento (opcional):");
                updateOrderStatus(orderId, status, { trackingNumber: tracking || '' });
            } else {
                if (confirm(`¿Mover pedido #${orderId.slice(-4)} a ${status.toUpperCase()}?`)) {
                    updateOrderStatus(orderId, status);
                }
            }
        }
        setDraggedOrder(null);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] overflow-x-auto pb-4">
            {columns.map(col => {
                const colOrders = orders.filter(o => o.status === col.id);
                const Icon = col.icon;

                return (
                    <div
                        key={col.id}
                        className={`flex-1 min-w-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border ${col.border} dark:border-opacity-10 flex flex-col`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        {/* Column Header */}
                        <div className={`p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-2xl`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${col.color} bg-opacity-20`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{col.title}</h3>
                            </div>
                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500">{colOrders.length}</span>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[70vh] scrollbar-hide">
                            {colOrders.map(order => (
                                <div
                                    key={order.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, order)}
                                    className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono text-slate-400">#{order.id.slice(-6)}</span>
                                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-white">{formatMoney(order.total)}</span>
                                    </div>

                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-[#C19A6B] transition-colors">{order.customer.nombre} {order.customer.apellido}</h4>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                        <Package className="w-3 h-3" /> {order.items.length} items
                                    </div>

                                    {order.trackingNumber && (
                                        <div className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded mb-2 inline-block">
                                            TRK: {order.trackingNumber}
                                        </div>
                                    )}

                                    <div className="text-[10px] text-slate-400 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                                        <span>{new Date(order.date).toLocaleDateString()}</span>
                                        <span className="uppercase">{order.shipping}</span>
                                    </div>
                                </div>
                            ))}
                            {colOrders.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <span className="text-xs uppercase font-bold tracking-widest">Vacío</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
