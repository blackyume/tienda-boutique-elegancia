import React from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Truck, LogOut, User, MapPin } from 'lucide-react';
import { formatMoney } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
    const { user, orders, logout } = useStore();
    const navigate = useNavigate();

    // Filter orders for current user
    const myOrders = orders.filter(o => o.userId === user?.uid || o.customer?.email === user?.email);

    if (!user) {
        return (
            <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4">
                <p>Inicia sesión para ver tu perfil.</p>
                <Button onClick={() => navigate('/')} className="mt-4">Ir al Inicio</Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto px-6">

                {/* HEADER */}
                <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl font-serif text-[#C19A6B] border border-slate-200 dark:border-slate-700">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-slate-900 dark:text-white">Hola, {user.displayName || 'Cliente'}</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                                <User className="w-3 h-3" /> {user.email}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </Button>
                </div>

                {/* ORDERS SECTION */}
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#C19A6B]" /> Mis Pedidos
                </h2>

                <div className="space-y-4">
                    {myOrders.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400 mb-4">Aún no has realizado pedidos.</p>
                            <Button onClick={() => navigate('/shop')}>Ir a la Tienda</Button>
                        </div>
                    ) : (
                        myOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-lg text-slate-800 dark:text-white">Pedido #{order.id.slice(-6).toUpperCase()}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()} • {order.items.length} artículos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                                        <p className="text-xl font-bold text-[#C19A6B]">{formatMoney(order.total)}</p>
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6">
                                    {/* Tracking Info (if available) */}
                                    {order.trackingNumber && (
                                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                                    <Truck className="w-3 h-3" /> Seguimiento de Envío
                                                </p>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Código: <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 select-all">{order.trackingNumber}</span>
                                                </p>
                                            </div>
                                            {/* We could add a generic tracking link here if we knew the carrier URL pattern */}
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-500">{item.quantity} x {formatMoney(item.price)} {item.size && `• Talle: ${item.size}`}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        shipped: 'bg-blue-100 text-blue-700 border-blue-200',
        delivered: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200'
    };

    const labels = {
        pending: 'Pendiente',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado'
    };

    return (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
            {labels[status] || status}
        </span>
    );
};
