import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { trackPurchase } from '../utils/analytics';

export const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateOrderStatus, sendOrderEmail, user, orders, cart, clearCart } = useStore();
    const [processed, setProcessed] = useState(false);

    const status = searchParams.get('status'); // success, failure, pending
    const external_reference = searchParams.get('external_reference'); // Order ID
    const payment_id = searchParams.get('payment_id');

    useEffect(() => {
        if (!status || !external_reference || processed) return;

        const handleStatusUpdate = async () => {
            setProcessed(true);
            try {
                if (status === 'success' || status === 'approved') {
                    // Actualizar orden a 'paid'
                    await updateOrderStatus(external_reference, 'paid', {
                        paymentId: payment_id,
                        paidAt: new Date().toISOString()
                    });

                    // GA4 purchase (use persisted order if available, else fallback to live cart)
                    const persisted = (orders || []).find(o => String(o.id) === String(external_reference));
                    const items = persisted?.items || cart || [];
                    const total = persisted?.total || items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0);
                    if (items.length > 0) {
                        trackPurchase({
                            id: external_reference,
                            total,
                            cart: items,
                            coupon: persisted?.coupon?.code,
                            shipping: persisted?.shippingCost || 0,
                        });
                    }
                    // Limpiar carrito tras pago exitoso
                    if (cart && cart.length > 0) clearCart();

                    // Enviar Email (Solo si tenemos el objeto order, o fetch from DB done inside context? 
                    // Context sendOrderEmail takes full order object.
                    // We need to reconstruct minimal order data or fetch it.
                    // For now, let's skip the email here to avoid complexity of fetching order again.
                    // Ideally, the user received an email from MP too.
                    // Better: Trigger email from backend webhook. But for frontend-only EmailJS:
                    // sendOrderEmail({ id: external_reference, customer: { nombre: user?.displayName || 'Cliente', email: user?.email } });
                } else if (status === 'failure') {
                    await updateOrderStatus(external_reference, 'cancelled', { failureReason: 'payment_rejected' });
                }
            } catch (error) {
                console.error("Error updating order status:", error);
            }
        };

        handleStatusUpdate();
    }, [status, external_reference]);

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white flex items-center justify-center animate-fadeIn">
            <div className="text-center max-w-md w-full px-6">

                {status === 'success' || status === 'approved' ? (
                    <>
                        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-4xl font-serif mb-4">¡Pago Exitoso!</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Tu pedido <strong>#{external_reference}</strong> ha sido confirmado.</p>
                        <Button onClick={() => navigate('/profile')} className="w-full">Ver Mis Pedidos</Button>
                    </>
                ) : status === 'failure' ? (
                    <>
                        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-4xl font-serif mb-4">Pago Rechazado</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Hubo un problema con tu pago. Por favor intenta nuevamente.</p>
                        <Button onClick={() => navigate('/checkout')} variant="secondary" className="w-full">Volver al Checkout</Button>
                    </>
                ) : (
                    <>
                        <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h1 className="text-4xl font-serif mb-4">Pago Pendiente</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Tu pago se está procesando. Te avisaremos cuando se confirme.</p>
                        <Button onClick={() => navigate('/')} variant="secondary" className="w-full">Volver a la Tienda</Button>
                    </>
                )}

            </div>
        </div>
    );
};
