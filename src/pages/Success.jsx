import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, email } = location.state || { orderId: '???', email: 'tu email' };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4 animate-fadeIn">
            <div className="text-center max-w-md w-full">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-serif text-slate-900 mb-4">¡Gracias por tu compra!</h1>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                    <p className="text-slate-500 text-sm mb-2">Tu número de orden es:</p>
                    <p className="text-xl font-bold text-slate-900 font-mono mb-4">{orderId}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Hemos enviado la confirmación a <span className="font-bold text-slate-900">{email}</span>.
                        <br/>Te notificaremos cuando el pedido sea despachado.
                    </p>
                </div>
                <div className="space-y-3">
                    <Button onClick={() => navigate('/tracking')} variant="secondary" className="w-full">
                        Ver Estado del Pedido
                    </Button>
                    <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest mt-4">
                        Volver a la Tienda
                    </button>
                </div>
            </div>
        </div>
    );
};