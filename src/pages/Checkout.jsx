import { AuthModal } from '../components/auth/AuthModal';
import { useStore } from '../context/StoreContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { User, Lock, Truck, ChevronRight, CreditCard, ShieldCheck, ShoppingBag, Ticket, X, Check } from 'lucide-react';
import { formatMoney } from '../utils/helpers';

export const Checkout = () => {
    const { cart, cartTotal, createOrder, updateProduct, inventory, setCart, addToast, user, shippingRates, paymentConfig, createPreferenceMP, sendOrderEmail, siteConfig, coupons, useCoupon } = useStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', telefono: '', dni: '', calle: '', altura: '', piso: '', cp: '', ciudad: '' });
    const [shippingMethod, setShippingMethod] = useState('andreani');
    const [loading, setLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const shippingOptions = shippingRates || {
        andreani: { name: 'Andreani', cost: 5800, time: '2-4 días' },
        oca: { name: 'OCA', cost: 4900, time: '3-6 días' },
        correo_argentino: { name: 'Correo Argentino', cost: 3500, time: '5-7 días' }
    };

    // Calculate Surcharge based on config
    const mpFeePercentage = paymentConfig?.mpFee ? parseFloat(paymentConfig.mpFee) : 0;
    const paymentSurcharge = cartTotal * (mpFeePercentage / 100);

    // Calculate coupon discount
    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'percentage') {
            return cartTotal * (appliedCoupon.value / 100);
        }
        return Math.min(appliedCoupon.value, cartTotal); // Fixed discount can't exceed cart total
    };
    const couponDiscount = calculateDiscount();

    const finalTotal = cartTotal + shippingOptions[shippingMethod].cost + paymentSurcharge - couponDiscount;

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

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!formData.nombre || !formData.email || !formData.dni) return addToast("Completa los datos obligatorios", "error");

        setLoading(true);

        try {
            const newOrder = {
                id: `ORD-${Math.floor(Math.random() * 900000) + 100000}`,
                date: new Date().toISOString(),
                status: 'pending_payment', // Inicialmente pendiente
                total: finalTotal,
                customer: { ...formData, userId: user.uid, email: user.email }, // Force Auth Email
                items: cart,
                shipping: shippingMethod,
                shippingCost: shippingOptions[shippingMethod].cost,
                coupon: appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : null
            };

            // 1. Crear Orden en Firebase (Persistencia)
            await createOrder(newOrder);

            // 1.5 Register coupon usage if applied
            if (appliedCoupon) {
                await useCoupon(appliedCoupon.id);
            }

            // 2. Generar Link de Pago (Backend) - SKIPPED (User preference: WhatsApp)
            // 3. Fallback: Redirigir a WhatsApp
            addToast("Enviando confirmación...", "info");
            await sendOrderEmail(newOrder); // Enviamos el mail antes de salir
            addToast("Pedido registrado. Abriendo WhatsApp...", "success");

            // Construir mensaje de WhatsApp
            const itemsList = cart.map(i => `• ${i.name} (${i.size}) x${i.quantity}`).join('%0A');
            const message = `Hola! Acabo de realizar el pedido *#${newOrder.id}*.%0A%0A*Detalle del pedido:*%0A${itemsList}%0A%0A*Total: ${formatMoney(finalTotal)}*%0A*Envío:* ${shippingOptions[shippingMethod].name}%0A%0AQuisiera coordinar el pago. Aguardo el link.`;

            // Número de teléfono de la tienda (Dynamic from config)
            const whatsappNumber = siteConfig?.whatsappNumber || "5491144444444";
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

            window.location.href = whatsappUrl;

            // Navegar a success en background para limpiar carro (opcional, o manejarlo al volver)
            navigate(`/payment-status?status=pending&payment_id=whatsapp-${newOrder.id}`, { replace: true });

        } catch (error) {
            console.error(error);
            addToast(`Error: ${error.message}`, "error");
            setLoading(false);
        }
    };

    if (cart.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white transition-colors">
            <ShoppingBag className="w-16 h-16 text-state-300 dark:text-slate-600 mb-6" />
            <h2 className="text-3xl font-cinzel mb-4">Tu bolsa está vacía</h2>
            <Button onClick={() => navigate('/')} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">Volver al Shop</Button>
        </div>
    );

    // Gated Content for Non-Auth Users
    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-white dark:bg-[#0B1120] font-sans flex flex-col items-center justify-center max-w-md mx-auto px-6 text-center transition-colors">
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8">
                    <Lock className="w-8 h-8 text-cielo-gold" />
                </div>
                <h2 className="text-4xl font-cinzel text-slate-900 dark:text-white mb-4">Finalizar Compra</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-montserrat leading-relaxed">Para proteger tu seguridad y asegurar el seguimiento de tu pedido, necesitamos que ingreses a tu cuenta.</p>
                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                    >
                        Ingresar o Registrarme
                    </button>
                    <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-300 mt-4">Volver al Shop</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-[#0B1120] font-sans text-slate-900 dark:text-white transition-colors">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-20">

                {/* --- IZQUIERDA: FORMULARIO --- */}
                <div className="lg:col-span-7 space-y-12 animate-slideUp">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => navigate('/')} className="text-xs font-bold uppercase text-slate-400 hover:text-cielo-gold flex items-center gap-1 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" /> Volver
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-cinzel text-slate-900 dark:text-white">Checkout</h1>

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
                                    value={user.email}
                                    disabled
                                    className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
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
                                Envío a Domicilio
                            </h3>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Dirección</label>
                                    <input required name="calle" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors" placeholder="Calle y número" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">CP</label>
                                    <input required name="cp" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-lg outline-none focus:border-cielo-gold transition-colors" />
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
                                        <span className="font-montserrat font-bold text-lg">{formatMoney(option.cost)}</span>
                                    </label>
                                ))}
                            </div>
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
                                        <p className="font-montserrat font-bold text-slate-900 dark:text-white mt-2">{formatMoney(i.price * i.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
                            <div className="flex justify-between text-slate-500 font-montserrat text-sm"><span>Subtotal</span><span>{formatMoney(cartTotal)}</span></div>
                            <div className="flex justify-between text-slate-500 font-montserrat text-sm"><span>Envío</span><span>{formatMoney(shippingOptions[shippingMethod].cost)}</span></div>
                            {paymentConfig?.mpFee > 0 && (
                                <div className="flex justify-between text-slate-500 text-xs italic">
                                    <span>Recargo Gestión de Pago ({paymentConfig.mpFee}%)</span>
                                    <span>{formatMoney(paymentSurcharge)}</span>
                                </div>
                            )}
                            {appliedCoupon && (
                                <div className="flex justify-between text-emerald-600 font-montserrat text-sm font-bold">
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

                        <div className="flex justify-between items-end pt-6 mt-2 pb-8">
                            <span className="font-cinzel text-xl text-slate-900 dark:text-white">Total</span>
                            <span className="font-montserrat font-bold text-3xl text-slate-900 dark:text-white">{formatMoney(finalTotal)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-cielo-gold hover:bg-[#a38056] text-black hover:text-white py-5 rounded-xl font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-cielo-gold/20 transition-all transform hover:-translate-y-1 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? <span className="animate-pulse">Procesando...</span> : <span>Confirmar Pedido</span>}
                        </button>

                        <div className="mt-6 flex justify-center items-center gap-4 text-slate-400">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Pago 100% Protegido</span>
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};