import React, { useMemo } from 'react';
import { tituloDeProducto } from '../../utils/nombres';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Minus, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, optimizeImage } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { getVariantStock } from '../../utils/variants';
import { prendasRelacionadas } from '../../utils/relacionados';

export const CartDrawer = ({ isOpen, onClose }) => {
   const { cart, removeFromCart, updateCartQty, cartTotal, cartCount, siteConfig, inventory, shippingRates } = useStore();

   // Sales Config
   const freeShippingConfig = siteConfig.sales?.freeShipping || { enabled: false, threshold: 100000 };
   const threshold = parseInt(freeShippingConfig.threshold) || 100000;

   const navigate = useNavigate();
   const sugeridas = useMemo(() => {
      if (cart.length === 0) return [];
      const fuera = inventory.filter((p) => !cart.some((c) => String(c.id) === String(p.id)));
      return prendasRelacionadas(fuera, { id: null, category: cart[0].category }, 2);
   }, [cart, inventory]);

   // El envío real se elige en el checkout: acá sólo se dice desde cuánto sale.
   const envioDesde = Math.min(...Object.values(shippingRates || {}).map((o) => Number(o?.cost)).filter((c) => c > 0));

   return (
      <div className={`fixed inset-0 z-[100] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
         {/* Backdrop */}
         <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
         />

         {/* Drawer */}
         <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#11100D]/95 backdrop-blur-2xl border-l border-cielo-gold/15 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out-quint flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-cielo-gold/15 flex justify-between items-center">
               <h2 className="text-2xl font-serif text-noche-100">Tu bolsa <span className="text-sm font-sans text-noche-300 font-normal">({cartCount})</span></h2>
               <button onClick={onClose} aria-label="Cerrar la bolsa" className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                  <X className="w-6 h-6 text-noche-300 group-hover:text-cielo-gold transition-colors" />
               </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {cart.length > 0 && freeShippingConfig.enabled && (
               <div className="px-5 sm:px-6 py-4 border-b border-cielo-gold/15">
                  {cartTotal >= threshold ? (
                     <p className="text-xs font-bold text-cielo-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Tenés envío gratis
                     </p>
                  ) : (
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Faltan <span className="text-white">{formatMoney(threshold - cartTotal)}</span> para envío gratis
                     </p>
                  )}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-cielo-gold to-yellow-200 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((cartTotal / threshold) * 100, 100)}%` }}
                     ></div>
                  </div>
               </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                     <span className="relative w-24 h-32 mb-6 flex items-center justify-center">
                        <span aria-hidden="true" className="arco-oro" />
                        <ShoppingBag className="w-8 h-8 text-cielo-gold" />
                     </span>
                     <p className="font-serif text-2xl text-noche-100 mb-2">Tu bolsa está vacía</p>
                     <p className="text-noche-300 text-sm mb-6">Descubrí la nueva colección.</p>
                     <button
                        type="button"
                        onClick={() => { onClose(); navigate('/shop'); }}
                        className="btn-oro px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
                     >
                        Ver la tienda
                     </button>
                  </div>
               ) : (
                  cart.map(item => {
                     const prod = inventory.find(p => String(p.id) === String(item.id));
                     const maxStock = prod ? getVariantStock(prod, item.size, item.color) : Infinity;
                     return (
                     <div key={item.key} className="flex gap-4 pb-5 border-b border-white/5 animate-fadeIn">
                        <div className="w-20 h-[7.5rem] bg-noche-850 rounded-lg overflow-hidden flex-shrink-0">
                           <img src={optimizeImage(item.image, 240)} alt={tituloDeProducto(item.name)} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                 <h3 className="font-serif text-noche-100 text-lg leading-tight">{tituloDeProducto(item.name)}</h3>
                                 <button onClick={() => removeFromCart(item.key)} aria-label={`Quitar ${tituloDeProducto(item.name)}`} className="shrink-0 w-9 h-9 -mt-1.5 -mr-2 flex items-center justify-center text-noche-300 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                              <p className="text-xs text-noche-300">{item.color}{item.color && item.size ? ' · ' : ''}{item.size ? `Talle ${item.size}` : ''}</p>
                           </div>

                           <div className="flex justify-between items-center mt-3">
                              <span className="font-semibold text-base text-noche-100">{formatMoney(item.price * item.quantity)}</span>
                              <div className="flex items-center rounded-full border border-white/10">
                                 <button
                                    onClick={() => updateCartQty(item.key, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-9 h-9 flex items-center justify-center text-white hover:text-cielo-gold disabled:opacity-30"
                                    aria-label="Restar"
                                 >
                                    <Minus className="w-3 h-3" />
                                 </button>
                                 <span className="text-xs font-bold text-cielo-gold w-5 text-center">{item.quantity}</span>
                                 <button
                                    onClick={() => updateCartQty(item.key, item.quantity + 1)}
                                    disabled={item.quantity >= maxStock}
                                    className="w-9 h-9 flex items-center justify-center text-white hover:text-cielo-gold disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Sumar"
                                 >
                                    <Plus className="w-3 h-3" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                     );
                  })
               )}

               {sugeridas.length > 0 && (
                  <div className="pt-1">
                     <h4 className="font-serif text-lg text-noche-100 mb-3">Completá tu look</h4>
                     <div className="space-y-2">
                        {sugeridas.map((sugerida) => (
                           <button
                              key={sugerida.id}
                              type="button"
                              onClick={() => { onClose(); navigate(`/product/${sugerida.id}`); }}
                              className="w-full flex gap-3 items-center text-left p-2 rounded-xl hover:bg-white/5 transition-colors group"
                           >
                              <img src={optimizeImage(sugerida.image, 120)} alt="" loading="lazy" className="w-12 h-[4.5rem] object-cover rounded-t-full flex-shrink-0" />
                              <span className="flex-1 min-w-0">
                                 <span className="block font-serif text-sm leading-tight text-noche-100 group-hover:text-cielo-gold transition-colors">{tituloDeProducto(sugerida.name)}</span>
                                 <span className="block mt-1 text-xs text-noche-300">{formatMoney(sugerida.price)}</span>
                              </span>
                              <ArrowRight className="w-4 h-4 shrink-0 text-cielo-gold/70" />
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
               <div className="px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-noche-900/90 backdrop-blur-xl border-t border-cielo-gold/15">
                  <div className="flex justify-between items-baseline mb-1">
                     <span className="text-noche-300 text-sm">Subtotal</span>
                     <span className="font-light text-2xl text-cielo-gold">{formatMoney(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-noche-300 mb-4">
                     {Number.isFinite(envioDesde) ? `Envío desde ${formatMoney(envioDesde)}. ` : ''}Lo elegís en el próximo paso.
                  </p>

                  <Button
                     className="btn-oro w-full py-4 bg-cielo-gold text-black font-bold tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(193,154,107,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                     onClick={() => { onClose(); navigate('/checkout'); }}
                  >
                     Iniciar compra
                  </Button>
               </div>
            )}
         </div>
      </div>
   );
};