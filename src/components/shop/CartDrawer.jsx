import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Minus, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { getVariantStock } from '../../utils/variants';

export const CartDrawer = ({ isOpen, onClose }) => {
   const { cart, removeFromCart, updateCartQty, cartTotal, cartCount, siteConfig, inventory } = useStore();

   // Sales Config
   const freeShippingConfig = siteConfig.sales?.freeShipping || { enabled: false, threshold: 100000 };
   const threshold = parseInt(freeShippingConfig.threshold) || 100000;

   const navigate = useNavigate();
   const [cp, setCp] = useState("");
   const [shippingEstimate, setShippingEstimate] = useState(null);

   const calculateShipping = () => {
      if (cp.length >= 4) setShippingEstimate(3500);
      else setShippingEstimate(null);
   };

   return (
      <div className={`fixed inset-0 z-[100] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
         {/* Backdrop */}
         <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
         />

         {/* Drawer */}
         <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#1C1F25]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out-quint flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
               <h2 className="text-2xl font-cinzel text-cielo-gold">Shopping Bag <span className="text-sm font-sans text-slate-400 font-normal">({cartCount})</span></h2>
               <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                  <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
               </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {cart.length > 0 && freeShippingConfig.enabled && (
               <div className="px-6 py-4 bg-slate-900 border-b border-white/5">
                  {cartTotal >= threshold ? (
                     <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> ¡Felicidades! Tienes Envío Gratis
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                     <ShoppingBag className="w-16 h-16 mb-6 text-white" />
                     <p className="text-white font-cinzel text-xl mb-2">Tu bolsa está vacía</p>
                     <p className="text-slate-400 text-sm">Descubrí nuestra nueva colección.</p>
                  </div>
               ) : (
                  cart.map(item => {
                     const prod = inventory.find(p => String(p.id) === String(item.id));
                     const maxStock = prod ? getVariantStock(prod, item.size, item.color) : Infinity;
                     return (
                     <div key={item.key} className="flex gap-4 group animate-fadeIn">
                        <div className="w-24 h-32 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-white/5">
                           <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                           <div>
                              <div className="flex justify-between items-start mb-1">
                                 <h3 className="font-cinzel text-white text-lg leading-tight pr-4">{item.name}</h3>
                                 <button onClick={() => removeFromCart(item.key)} className="text-slate-500 hover:text-red-400 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.color} | {item.size}</p>
                           </div>

                           <div className="flex justify-between items-end">
                              <span className=" font-bold text-lg text-white">{formatMoney(item.price * item.quantity)}</span>
                              <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10">
                                 <button
                                    onClick={() => updateCartQty(item.key, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="p-2 text-white hover:text-cielo-gold disabled:opacity-30"
                                    aria-label="Restar"
                                 >
                                    <Minus className="w-3 h-3" />
                                 </button>
                                 <span className="text-xs font-bold text-cielo-gold w-6 text-center">{item.quantity}</span>
                                 <button
                                    onClick={() => updateCartQty(item.key, item.quantity + 1)}
                                    disabled={item.quantity >= maxStock}
                                    className="p-2 text-white hover:text-cielo-gold disabled:opacity-30 disabled:cursor-not-allowed"
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

               {/* CROSS SELLING - You May Also Like */}
               {cart.length > 0 && (
                  <div className="pt-8 mt-4 border-t border-white/10">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Completa tu Look</h4>
                     <div className="space-y-4">
                        {inventory
                           .filter(p => !cart.some(c => c.id === p.id))
                           .slice(0, 2)
                           .map(suggested => (
                              <div
                                 key={suggested.id}
                                 className="flex gap-3 items-center group cursor-pointer bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                 onClick={() => { onClose(); navigate(`/product/${suggested.id}`); }}
                              >
                                 <div className="w-12 h-12 bg-slate-800 rounded overflow-hidden">
                                    <img src={suggested.image} className="w-full h-full object-cover" alt={suggested.name} loading="lazy" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-xs font-bold text-white group-hover:text-cielo-gold transition-colors">{suggested.name}</p>
                                    <p className="text-[10px] text-slate-400">{formatMoney(suggested.price)}</p>
                                 </div>
                                 <Button
                                    onClick={(e) => { e.stopPropagation(); onClose(); navigate(`/product/${suggested.id}`); }}
                                    className="w-8 h-8 !p-0 rounded-full flex items-center justify-center bg-transparent border border-white/20 hover:bg-cielo-gold hover:text-black hover:border-cielo-gold text-white"
                                    aria-label={`Ver ${suggested.name}`}
                                 >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                 </Button>
                              </div>
                           ))
                        }
                     </div>
                  </div>
               )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
               <div className="p-8 bg-[#121212]/80 backdrop-blur-xl border-t border-white/10">

                  {/* Shipping Estimator */}
                  <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/5">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                        <Truck className="w-3 h-3" /> Calcular Envío
                     </p>
                     <div className="flex gap-2">
                        <input
                           placeholder="Código Postal"
                           value={cp}
                           onChange={(e) => setCp(e.target.value)}
                           className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cielo-gold/50 transition-colors"
                        />
                        <button
                           onClick={calculateShipping}
                           className="bg-white/10 hover:bg-cielo-gold hover:text-black px-4 rounded-lg text-white transition-all duration-300"
                        >
                           <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                     {shippingEstimate && (
                        <div className="flex justify-between items-center mt-3 text-xs font-bold text-green-400 animate-fadeIn">
                           <span>Envío Estimado:</span>
                           <span>{formatMoney(shippingEstimate)}</span>
                        </div>
                     )}
                  </div>

                  {/* Total & Checkout */}
                  <div className="flex justify-between items-end mb-6">
                     <span className="text-slate-400 text-sm uppercase tracking-widest">Total Estimado</span>
                     <span className="font-cinzel text-3xl text-white">{formatMoney(cartTotal)}</span>
                  </div>

                  <Button
                     className="w-full py-4 bg-cielo-gold text-black font-bold tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(193,154,107,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                     onClick={() => { onClose(); navigate('/checkout'); }}
                  >
                     INICIAR COMPRA
                  </Button>
               </div>
            )}
         </div>
      </div>
   );
};