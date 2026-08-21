import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { trackPurchase } from '../utils/analytics';

export const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // OJO: esta pantalla es SOLO display. El estado real del pedido lo setea
    // el webhook de Mercado Pago server-side (api/mp-webhook.js), que es la
    // única fuente de verdad. No escribimos status desde acá: los query params
    // de la URL de retorno son falsificables y, si los escribiéramos, alguien
    // podría marcar su propio pedido como "pagado" sin pagar.
    const { orders, cart, clearCart, user, linkGuestWithGoogle } = useStore();
    const trackedRef = useRef(false);
    const [linked, setLinked] = useState(false);

    const status = searchParams.get('status'); // success, failure, pending
    const external_reference = searchParams.get('external_reference'); // Order ID

    const isSuccess = status === 'success' || status === 'approved';

    useEffect(() => {
        if (!isSuccess || !external_reference || trackedRef.current) return;

        // Sólo trackeamos la compra cuando el pedido ya está persistido en
        // Firestore (evita disparar GA4 con carrito vacío en el primer render).
        const persisted = (orders || []).find(o => String(o.id) === String(external_reference));
        if (!persisted) return;

        trackedRef.current = true;
        const items = persisted.items || [];
        if (items.length > 0) {
            trackPurchase({
                id: external_reference,
                total: persisted.total || 0,
                cart: items,
                coupon: persisted.coupon?.code,
                shipping: persisted.shippingCost || 0,
            });
        }
        // Limpiar carrito tras pago exitoso
        if (cart && cart.length > 0) clearCart();
    }, [isSuccess, external_reference, orders, cart, clearCart]);

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white dark:bg-[#1C1F25] text-slate-900 dark:text-white flex items-center justify-center animate-fadeIn">
            <div className="text-center max-w-md w-full px-6">

                {isSuccess ? (
                    <>
                        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-4xl font-serif mb-4">¡Pago Exitoso!</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Tu pedido <strong>#{external_reference}</strong> ha sido confirmado.</p>

                        {/* Ofrecimiento OPCIONAL de crear cuenta (solo si compró como invitado) */}
                        {user?.isAnonymous && !linked && (
                            <div className="mb-6 rounded-2xl border border-cielo-gold/30 bg-cielo-gold/[0.06] p-5 text-left">
                                <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                                    <UserPlus className="w-4 h-4 text-cielo-gold" /> ¿Creás tu cuenta?
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Opcional. Guardás este pedido y seguís su envío desde tu perfil.
                                </p>
                                <button
                                    onClick={async () => { const ok = await linkGuestWithGoogle(); if (ok) setLinked(true); }}
                                    className="w-full py-2.5 rounded-lg text-sm font-bold text-black transition-all"
                                    style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                                >
                                    Crear cuenta con Google
                                </button>
                            </div>
                        )}

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
