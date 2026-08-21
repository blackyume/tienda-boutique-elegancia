import { AuthModal } from '../components/auth/AuthModal';
import { useStore } from '../context/StoreContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { User, Lock, ChevronRight, ShieldCheck, ShoppingBag, Ticket, X, MessageCircle } from 'lucide-react';
import { formatMoney } from '../utils/helpers';
import { trackBeginCheckout } from '../utils/analytics';
import { trackAbandonedCart, markAbandonedCartRecovered } from '../utils/abandonedCart';
import { findReferralOwner, REFERRAL_DISCOUNT_PERCENT } from '../utils/referral';
import { BrandStrip } from '../components/ui/BrandBadges';

export const Checkout = () => {
    const { cart, cartTotal, createOrder, addToast, user, loginAnonymously, shippingRates, paymentConfig, createPreferenceMP, siteConfig, coupons, sendOrderEmail } = useStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', telefono: '', dni: '', calle: '', altura: '', piso: '', cp: '', ciudad: '' });
    const [shippingMethod, setShippingMethod] = useState('correo_domicilio');
    const [loading, setLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Pre-fill email from user
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Referral state
    const [referralCode, setReferralCode] = useState('');
    const [appliedReferral, setAppliedReferral] = useState(null); // { code, ownerUid }
    const [referralError, setReferralError] = useState('');
    const [applyingReferral, setApplyingReferral] = useState(false);

    const shippingOptions = shippingRates || {
        correo_domicilio: { name: 'Correo Argentino a domicilio', cost: 6000, time: '3-7 días hábiles' },
        sucursal: { name: 'Correo Argentino · Retiro en sucursal', cost: 4500, time: '3-5 días hábiles', note: 'Lo enviamos a la sucursal de Correo Argentino más cercana a tu domicilio para que lo retires. Te avisamos cuál cuando lo despachamos.' }
    };
    const selectedShipping = shippingOptions[shippingMethod] || {};

    // Si el método elegido no existe entre las opciones (cambió la config), uso el primero válido.
    useEffect(() => {
        const keys = Object.keys(shippingOptions);
        if (keys.length && !shippingOptions[shippingMethod]) setShippingMethod(keys[0]);
    }, [shippingRates]);

    // Calculate Surcharge based on config
    const mpFeePercentage = paymentConfig?.mpFee ? parseFloat(paymentConfig.mpFee) : 0;
    const paymentSurcharge = cartTotal * (mpFeePercentage / 100);

    // Calculate coupon discount
    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'percentage') {
            return cartTotal * (appliedCoupon.value / 100);
        }
        return Math.min(appliedCoupon.value, cartTotal);
    };
    const couponDiscount = calculateDiscount();
    const referralDiscount = appliedReferral ? cartTotal * (REFERRAL_DISCOUNT_PERCENT / 100) : 0;

    const finalTotal = cartTotal + (selectedShipping.cost || 0) + paymentSurcharge - couponDiscount - referralDiscount;

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Validate and apply coupon
    const handleApplyCoupon = () => {
        setCouponError('');
        setApplyingCoupon(true);

        const code = couponCode.toUpperCase().trim();
        if (!code) {
            setCouponError('Ingresa un código');
            setApplyingCoupon(false);
            return;
        }

        const coupon = coupons.find(c => c.code === code);

        if (!coupon) {
            setCouponError('Código no válido');
            setApplyingCoupon(false);
            return;
        }

        // Check if active
        if (coupon.active === false) {
            setCouponError('Este cupón no está activo');
            setApplyingCoupon(false);
            return;
        }

        // Check expiration
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            setCouponError('Este cupón ha expirado');
            setApplyingCoupon(false);
            return;
        }

        // Check max uses
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            setCouponError('Este cupón ha alcanzado su límite de usos');
            setApplyingCoupon(false);
            return;
        }

        // Check min purchase
        if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
            setCouponError(`Compra mínima: ${formatMoney(coupon.minPurchase)}`);
            setApplyingCoupon(false);
            return;
        }

        // Success!
        setAppliedCoupon(coupon);
        setCouponCode('');
        addToast(`¡Cupón aplicado! ${coupon.type === 'percentage' ? coupon.value + '%' : formatMoney(coupon.value)} de descuento`, 'success');
        setApplyingCoupon(false);
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError('');
    };

    const handleApplyReferral = async () => {
        setReferralError('');
        const code = referralCode.trim().toUpperCase();
        if (!code) return setReferralError('Ingresá un código');
        setApplyingReferral(true);
        try {
            const owner = await findReferralOwner(code);
            if (!owner) return setReferralError('Código no válido');
            if (user && owner.uid === user.uid) return setReferralError('No podés usar tu propio código');
            setAppliedReferral({ code, ownerUid: owner.uid, ownerName: owner.name || owner.email?.split('@')[0] });
            setReferralCode('');
            addToast(`¡Código aplicado! ${REFERRAL_DISCOUNT_PERCENT}% de descuento`, 'success');
        } catch (err) {
            setReferralError('No se pudo validar');
        } finally {
            setApplyingReferral(false);
        }
    };
    const removeReferral = () => { setAppliedReferral(null); setReferralError(''); };

    // Auto-aplicar si viene por URL ?ref=REF-XXXX
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref && !appliedReferral) {
            setReferralCode(ref.toUpperCase());
            // Trigger validation
            (async () => {
                const owner = await findReferralOwner(ref);
                if (owner && (!user || owner.uid !== user.uid)) {
                    setAppliedReferral({ code: ref.toUpperCase(), ownerUid: owner.uid, ownerName: owner.name || owner.email?.split('@')[0] });
                    addToast(`¡Código de referido aplicado! ${REFERRAL_DISCOUNT_PERCENT}% OFF`, 'success');
                    setReferralCode('');
                }
            })();
        }
    }, [user]);

    // Abandoned cart tracking — registra carrito cuando el usuario ingresa su email
    // y deja de completar. Se debouncea para no escribir en cada keystroke.
    useEffect(() => {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return;
        if (cart.length === 0) return;
        const timer = setTimeout(() => {
            trackAbandonedCart({
                email: formData.email,
                cart,
                customer: {
                    nombre: formData.nombre || '',
                    apellido: formData.apellido || '',
                    telefono: formData.telefono || '',
                    ciudad: formData.ciudad || ''
                },
                total: finalTotal
            });
        }, 2000);
        return () => clearTimeout(timer);
    }, [formData.email, formData.nombre, formData.apellido, cart.length, finalTotal]);

    const buildWhatsAppMessage = (orderId) => {
        const itemsList = cart.map(i => `• ${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` · ${i.color}` : ''} x${i.quantity} — ${formatMoney(i.price * i.quantity)}`).join('\n');
        const shippingLine = `*Envío:* ${shippingOptions[shippingMethod]?.name || shippingMethod} — ${formatMoney(shippingOptions[shippingMethod]?.cost || 0)}`;
        const couponLine = appliedCoupon ? `\n*Cupón:* ${appliedCoupon.code} (-${formatMoney(couponDiscount)})` : '';
        const addressLine = formData.calle ? `\n*Dirección:* ${formData.calle}${formData.altura ? ' ' + formData.altura : ''}${formData.ciudad ? ', ' + formData.ciudad : ''}${formData.cp ? ' (' + formData.cp + ')' : ''}` : '';
        return [
            `¡Hola! Quisiera finalizar mi pedido *#${orderId}* por WhatsApp.`,
            '',
            '*Detalle:*',
            itemsList,
            '',
            shippingLine + couponLine,
            `*Total:* ${formatMoney(finalTotal)}`,
            '',
            `*Nombre:* ${formData.nombre || ''}`,
            `*Email:* ${formData.email || ''}`,
            `*DNI:* ${formData.dni || ''}` + addressLine,
        ].join('\n');
    };

    // Devuelve el comprador: el usuario logueado, o una sesión de INVITADO
    // (login anónimo) para que pueda comprar sin registrarse. Si el login anónimo
    // no está habilitado en Firebase, cae al modal de login como respaldo.
    const ensureBuyer = async () => {
        if (user) return user;
        const guest = await loginAnonymously();
        if (!guest) { setIsAuthModalOpen(true); return null; }
        return guest;
    };

    const handleWhatsappCheckout = async () => {
        if (!formData.nombre || !formData.email || !formData.dni) {
            return addToast("Completá nombre, email y DNI antes de continuar", "error");
        }
        if (cart.length === 0) return;

        setLoading(true);
        const buyer = await ensureBuyer();
        if (!buyer) { setLoading(false); return; }
        try {
            const orderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
            const newOrder = {
                id: orderId,
                date: new Date().toISOString(),
                status: 'pending_wa',
                total: finalTotal,
                customer: { ...formData, userId: buyer.uid, email: formData.email },
                items: cart,
                shipping: shippingMethod,
                shippingName: selectedShipping.name || shippingMethod,
                shippingCost: selectedShipping.cost || 0,
                coupon: appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : null,
                referral: appliedReferral ? { code: appliedReferral.code, ownerUid: appliedReferral.ownerUid, discount: referralDiscount } : null,
                paymentMethod: 'whatsapp'
            };

            trackBeginCheckout(cart, finalTotal);
            await createOrder(newOrder);
            // Email de confirmación al cliente (no rompe el flujo si EmailJS no está configurado)
            await sendOrderEmail(newOrder).catch(() => {});
            // El cupón se redime cuando el pedido se confirma (admin marca el
            // pedido de WhatsApp como pagado/enviado), no al crearlo — así no se
            // quema un uso si el cliente nunca concreta la compra.
            markAbandonedCartRecovered(formData.email, orderId).catch(() => {});

            const msg = encodeURIComponent(buildWhatsAppMessage(orderId));
            const whatsappNumber = (siteConfig?.whatsappNumber || "5491144444444").replace(/\D/g, '');
            window.location.href = `https://wa.me/${whatsappNumber}?text=${msg}`;
        } catch (error) {
            console.error(error);
            addToast(`Error: ${error.message}`, "error");
            setLoading(false);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.email || !formData.dni) return addToast("Completa los datos obligatorios", "error");

        setLoading(true);
        const buyer = await ensureBuyer();
        if (!buyer) { setLoading(false); return; }

        try {
            const newOrder = {
                id: `ORD-${Math.floor(Math.random() * 900000) + 100000}`,
                date: new Date().toISOString(),
                status: 'pending_payment', // Inicialmente pendiente
                total: finalTotal,
                customer: { ...formData, userId: buyer.uid, email: formData.email },
                items: cart,
                shipping: shippingMethod,
                shippingName: selectedShipping.name || shippingMethod,
                shippingCost: selectedShipping.cost || 0,
                coupon: appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : null,
                referral: appliedReferral ? { code: appliedReferral.code, ownerUid: appliedReferral.ownerUid, discount: referralDiscount } : null
            };

            // GA4 begin_checkout
            trackBeginCheckout(cart, finalTotal);

            // 1. Crear Orden en Firebase (Persistencia)
            await createOrder(newOrder);
            markAbandonedCartRecovered(formData.email, newOrder.id).catch(() => {});
            // El email de confirmación de MercadoPago lo manda el servidor (webhook)
            // recién cuando el pago se aprueba, para no avisar antes de cobrar.

            // El cupón se redime server-side en el webhook de MP cuando el pago
            // se aprueba (idempotente). No lo incrementamos acá para no quemar un
            // uso en checkouts abandonados o pagos rechazados.

            // 2. Generar Link de Pago (Backend Vercel)
            try {
                addToast("Generando link de pago...", "info");
                const initPoint = await createPreferenceMP(newOrder); // Usa la URL de Vercel configurada en StoreContext

                // Redirigir a Mercado Pago
                window.location.href = initPoint;
            } catch (mpError) {
                console.error("Error MP, fallback WhatsApp:", mpError);

                // 3. Fallback: Redirigir a WhatsApp si falla MP
                addToast("Error conectando con Mercado Pago. Redirigiendo a WhatsApp...", "error");

                const itemsList = cart.map(i => `• ${i.name} (${i.size}) x${i.quantity}`).join('%0A');
                const message = `Hola! Acabo de realizar el pedido *#${newOrder.id}*.%0A%0A*Detalle del pedido:*%0A${itemsList}%0A%0A*Total: ${formatMoney(finalTotal)}*%0A*Envío:* ${shippingOptions[shippingMethod].name}%0A%0AHubo un error con el pago automático. Quisiera coordinar por acá.`;

                const whatsappNumber = siteConfig?.whatsappNumber || "5491144444444";
                window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`;
            }

        } catch (error) {
            console.error(error);
            addToast(`Error: ${error.message}`, "error");
            setLoading(false);
        }
    };

    if (cart.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white dark:bg-[#1C1F25] text-slate-900 dark:text-white transition-colors">
            <ShoppingBag className="w-16 h-16 text-state-300 dark:text-slate-600 mb-6" />
            <h2 className="text-3xl font-cinzel mb-4">Tu bolsa está vacía</h2>
            <Button onClick={() => navigate('/')} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">Volver al Shop</Button>
        </div>
    );

    // Compra como INVITADO: ya no se exige registro para comprar. El formulario
    // se muestra a todos; la sesión de invitado (anónima) se crea al confirmar.

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-[#1C1F25] font-sans text-slate-900 dark:text-white transition-colors">
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <div className="max-w-[1400px] mx-auto px-4 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-20">

                {/* --- IZQUIERDA: FORMULARIO --- */}
                <div className="lg:col-span-7 space-y-12 animate-slideUp">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => navigate('/')} className="text-xs font-bold uppercase text-slate-400 hover:text-cielo-gold flex items-center gap-1 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" /> Volver
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-cinzel text-slate-900 dark:text-white">Checkout</h1>

                    {/* Comprás como invitado — registro NO requerido. Login opcional para quien vuelve. */}
                    {!user && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Comprás como invitado, sin crear cuenta.{' '}
                            <button type="button" onClick={() => setIsAuthModalOpen(true)} className="font-bold text-cielo-gold hover:underline">
                                ¿Ya tenés cuenta? Iniciá sesión
                            </button>
                        </p>
                    )}

                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-10">
                        {/* Datos Personales */}
                        <section className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cielo-gold mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-cielo-gold/10 flex items-center justify-center text-cielo-gold text-lg font-serif">1</span>
                                Tus Datos
                            </h3>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nombre</label>
                                    <input required name="nombre" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors placeholder-transparent" placeholder="Nombre" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Apellido</label>
                                    <input required name="apellido" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors placeholder-transparent" placeholder="Apellido" />
                                </div>
                            </div>
                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email</label>
                                <input
                                    required
                                    name="email"
                                    onChange={handleInputChange}
                                    value={formData.email}
                                    className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors placeholder-transparent"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">DNI</label>
                                    <input required name="dni" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Teléfono</label>
                                    <input required name="telefono" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors" />
                                </div>
                            </div>
                        </section>

                        {/* Envío */}
                        <section className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cielo-gold mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-cielo-gold/10 flex items-center justify-center text-cielo-gold text-lg font-serif">2</span>
                                Envío
                            </h3>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Dirección</label>
                                    <input required name="calle" value={formData.calle} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors" placeholder="Calle y número" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">CP</label>
                                    <input required name="cp" value={formData.cp} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(shippingOptions).map(([key, option]) => (
                                    <label key={key} className={`relative flex items-center justify-between p-6 border rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${shippingMethod === key ? `bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900` : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === key ? 'border-cielo-gold' : 'border-slate-300'}`}>
                                                {shippingMethod === key && <div className="w-2.5 h-2.5 rounded-full bg-cielo-gold" />}
                                            </div>
                                            <input type="radio" checked={shippingMethod === key} onChange={() => setShippingMethod(key)} className="hidden" />
                                            <div>
                                                <span className="font-bold font-serif text-lg block tracking-wide">{option.name}</span>
                                                <span className={`text-xs uppercase tracking-widest font-bold ${shippingMethod === key ? 'text-white/60 dark:text-black/60' : 'text-slate-400'}`}>Llega en {option.time}</span>
                                            </div>
                                        </div>
                                        <span className=" font-bold text-lg">{Number(option.cost) > 0 ? formatMoney(option.cost) : 'Gratis'}</span>
                                    </label>
                                ))}
                            </div>
                            {selectedShipping.note && (
                                <div className="mt-5 p-4 rounded-2xl border border-cielo-gold/30 bg-cielo-gold/5 flex items-start gap-3">
                                    <span className="text-xl">📦</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{selectedShipping.note}</p>
                                </div>
                            )}
                        </section>
                    </form>
                </div>

                {/* --- DERECHA: RESUMEN (STICKY) --- */}
                <div className="lg:col-span-5">
                    <div className="bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-3xl sticky top-32 border border-slate-100 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-fadeIn">
                        <h3 className="text-2xl font-cinzel text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-100 dark:border-white/10">Resumen de Compra</h3>

                        <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {cart.map(i => (
                                <div key={i.key} className="flex gap-4">
                                    <div className="w-20 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 flex-shrink-0 relative group">
                                        <img src={i.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <span className="absolute bottom-0 right-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] px-1.5 py-0.5 font-bold">x{i.quantity}</span>
                                    </div>
                                    <div className="flex-1 py-1">
                                        <p className="font-serif font-bold text-slate-900 dark:text-white text-lg leading-none mb-1">{i.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{i.color} / {i.size}</p>
                                        <p className=" font-bold text-slate-900 dark:text-white mt-2">{formatMoney(i.price * i.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
                            <div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span>{formatMoney(cartTotal)}</span></div>
                            <div className="flex justify-between text-slate-500 text-sm"><span>Envío</span><span>{Number(selectedShipping.cost) > 0 ? formatMoney(selectedShipping.cost) : 'Gratis'}</span></div>
                            {paymentConfig?.mpFee > 0 && (
                                <div className="flex justify-between text-slate-500 text-xs italic">
                                    <span>Recargo Gestión de Pago ({paymentConfig.mpFee}%)</span>
                                    <span>{formatMoney(paymentSurcharge)}</span>
                                </div>
                            )}
                            {appliedCoupon && (
                                <div className="flex justify-between text-emerald-600 text-sm font-bold">
                                    <span className="flex items-center gap-2">
                                        <Ticket className="w-4 h-4" />
                                        Cupón: {appliedCoupon.code}
                                        <button onClick={removeCoupon} className="text-red-400 hover:text-red-500 p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                    <span>-{formatMoney(couponDiscount)}</span>
                                </div>
                            )}
                            {appliedReferral && (
                                <div className="flex justify-between text-sky-600 text-sm font-bold">
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Referido: {appliedReferral.code}
                                        <button onClick={removeReferral} className="text-red-400 hover:text-red-500 p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                    <span>-{formatMoney(referralDiscount)}</span>
                                </div>
                            )}
                        </div>

                        {/* Coupon Input */}
                        {!appliedCoupon && (
                            <div className="pt-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            placeholder="Código de descuento"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold tracking-wider text-sm outline-none focus:border-cielo-gold transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon || !couponCode}
                                        className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applyingCoupon ? '...' : 'Aplicar'}
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
                                        <X className="w-3 h-3" /> {couponError}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Referral Input */}
                        {!appliedReferral && (
                            <div className="pt-3">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralError(''); }}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyReferral())}
                                            placeholder="Código de referido (REF-XXXXXXXX)"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold tracking-wider text-sm outline-none focus:border-sky-500 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyReferral}
                                        disabled={applyingReferral || !referralCode}
                                        className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {applyingReferral ? '...' : 'Aplicar'}
                                    </button>
                                </div>
                                {referralError && (
                                    <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
                                        <X className="w-3 h-3" /> {referralError}
                                    </p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">Ingresá el código de un amigo y obtené {REFERRAL_DISCOUNT_PERCENT}% OFF.</p>
                            </div>
                        )}

                        <div className="flex justify-between items-end pt-6 mt-2 pb-8">
                            <span className="font-cinzel text-xl text-slate-900 dark:text-white">Total</span>
                            <span className=" font-bold text-3xl text-slate-900 dark:text-white">{formatMoney(finalTotal)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-cielo-gold hover:bg-[#B8932E] text-black hover:text-white py-5 rounded-xl font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-cielo-gold/20 transition-all transform hover:-translate-y-1 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? <span className="animate-pulse">Procesando...</span> : <span>Pagar con Mercado Pago</span>}
                        </button>

                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">o</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </div>

                        <button
                            type="button"
                            onClick={handleWhatsappCheckout}
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110"
                            style={{ background: 'linear-gradient(145deg, #25D366 0%, #1FA851 100%)' }}
                            title="Enviar el pedido directamente por WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Finalizar por WhatsApp
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-2">Coordiná el pago y envío por chat con una asesora.</p>

                        <div className="mt-6 flex justify-center items-center gap-4 text-slate-400">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Pago 100% Protegido</span>
                            <ShieldCheck className="w-4 h-4" />
                        </div>

                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/10">
                            <BrandStrip />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
