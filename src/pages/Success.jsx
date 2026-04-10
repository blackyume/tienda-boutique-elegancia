import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, email } = location.state || { orderId: null, email: null };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1120] p-4 animate-fadeIn">
            <div className="text-center max-w-md w-full">
                {/* Ícono animado */}
                <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>

                <h1 className="text-4xl font-cinzel text-slate-900 dark:text-white mb-2">¡Gracias!</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-light">Tu pedido fue recibido con éxito</p>

                {orderId && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-5 h-5 text-cielo-gold" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Número de orden</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mb-3">{orderId}</p>
                        {email && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Enviamos la confirmación a <span className="font-bold text-slate-700 dark:text-slate-200">{email}</span>.
                                Te avisaremos cuando el pedido sea despachado.
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/tracking')}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold tracking-widest hover:bg-cielo-gold dark:hover:bg-cielo-gold dark:hover:text-black transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4 inline mr-2" />
                        Ver Estado del Pedido
                    </Button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold uppercase tracking-widest mt-4 transition-colors"
                    >
                        Volver a la Tienda
                    </button>
                </div>
            </div>
        </div>
    );
};
