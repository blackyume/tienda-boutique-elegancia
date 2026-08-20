import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Package, Truck, CheckCircle, MapPin, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatMoney } from '../utils/helpers';

export const Tracking = () => {
    const { orders } = useStore();
    const [searchId, setSearchId] = useState("");
    const [activeOrder, setActiveOrder] = useState(null);
    const [error, setError] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        // Busca por ID exacto o si el usuario olvidó el "ORD-"
        const order = orders.find(o => o.id === searchId.trim() || o.id === `ORD-${searchId.trim()}`);

        if (order) {
            setActiveOrder(order);
            setError(false);
        } else {
            setActiveOrder(null);
            setError(true);
        }
    };

    // Definir los pasos según el estado
    const getSteps = (status) => {
        const steps = [
            { status: 'pending', label: 'Confirmado', icon: Package },
            { status: 'processing', label: 'Preparando', icon: Clock },
            { status: 'shipped', label: 'En Camino', icon: Truck },
            { status: 'delivered', label: 'Entregado', icon: CheckCircle }
        ];

        // Lógica simple para simular progreso (en una app real esto viene del backend)
        let currentIdx = 0;
        if (status === 'processing') currentIdx = 1;
        if (status === 'shipped') currentIdx = 2;
        if (status === 'delivered') currentIdx = 3;

        return { steps, currentIdx };
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-[#312721] font-sans transition-colors duration-500">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Seguí tu pedido</h1>
                    <p className="text-slate-500 dark:text-slate-400">Ingresá tu número de orden para ver el estado actual.</p>
                </div>

                {/* Buscador */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 transition-colors">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="Ej: ORD-123456"
                                className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-slate-900 dark:focus:border-[#D4AF37] text-slate-900 dark:text-white transition-colors"
                            />
                        </div>
                        <Button className="px-6">Buscar</Button>
                    </form>
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm animate-fadeIn">
                            <AlertCircle className="w-4 h-4" /> No encontramos una orden con ese ID. Revisalo e intentá nuevamente.
                        </div>
                    )}
                </div>

                {/* Resultado */}
                {activeOrder && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-slideUp transition-colors">
                        {/* Header Orden */}
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Orden ID</p>
                                <p className="text-xl font-bold font-mono">{activeOrder.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Total</p>
                                <p className="text-xl font-bold">{formatMoney(activeOrder.total)}</p>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Línea de Tiempo */}
                            <div className="mb-12 relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000"
                                    style={{ width: `${(getSteps(activeOrder.status).currentIdx / 3) * 100}%` }}
                                />

                                <div className="relative z-10 flex justify-between">
                                    {getSteps(activeOrder.status).steps.map((step, idx) => {
                                        const isCompleted = idx <= getSteps(activeOrder.status).currentIdx;
                                        const Icon = step.icon;
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Dirección de Envío
                                    </h4>
                                    <p className="font-bold text-slate-900 dark:text-white">{activeOrder.customer.calle} {activeOrder.customer.altura}</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{activeOrder.customer.ciudad} ({activeOrder.customer.cp})</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{activeOrder.customer.nombre} {activeOrder.customer.apellido}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                        <Package className="w-4 h-4" /> Resumen Items
                                    </h4>
                                    <div className="space-y-2">
                                        {activeOrder.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">{item.quantity}x {item.name}</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{formatMoney(item.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista Histórica Rápida */}
                {!activeOrder && orders.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Tus Últimos Pedidos</h3>
                        <div className="space-y-3">
                            {orders.map(o => (
                                <div key={o.id} onClick={() => setActiveOrder(o)} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs">#{o.id.slice(-3)}</div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{o.date}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{o.items.length} productos</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};