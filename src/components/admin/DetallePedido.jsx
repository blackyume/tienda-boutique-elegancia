import React, { useState } from 'react';
import { Copy, Check, MapPin, Phone, Mail, MessageCircle, Package, CreditCard, StickyNote } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';
import { direccionEnUnaLinea, datosParaCorreo, telefonoInternacional, esRetiroEnSucursal } from '../../utils/direccion';

// Lo que hay que saber de un pedido para despacharlo: qué va, a quién, a
// dónde. Con un botón que copia el bloque listo para pegar en MiCorreo.

const Dato = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3 min-w-0">
        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[#E8C65E]" />
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <div className="text-sm text-slate-800 dark:text-slate-100 break-words">{children || <span className="text-slate-400">—</span>}</div>
        </div>
    </div>
);

export const DetallePedido = ({ pedido, addToast }) => {
    const [copiado, setCopiado] = useState(false);
    const c = pedido.customer || {};
    const sucursal = esRetiroEnSucursal(pedido.shipping, { name: pedido.shippingName });
    const wa = telefonoInternacional(c.telefono);

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(datosParaCorreo(pedido));
            setCopiado(true);
            addToast?.('Datos copiados: pegalos en MiCorreo → Nuevo envío', 'success');
            setTimeout(() => setCopiado(false), 2500);
        } catch {
            addToast?.('No se pudo copiar', 'error');
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 grid md:grid-cols-[1fr_1.2fr] gap-6">
            {/* Qué va */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Contenido</p>
                <ul className="space-y-1.5">
                    {(pedido.items || []).map((i, k) => (
                        <li key={k} className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-800 dark:text-slate-100">
                                <span className="font-bold">{i.quantity || 1}×</span> {i.name}
                                {(i.size || i.color) && <span className="text-slate-400"> · {[i.size, i.color].filter(Boolean).join(' · ')}</span>}
                            </span>
                            <span className="text-slate-500 shrink-0">{formatMoney((i.price || 0) * (i.quantity || 1))}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-0.5">
                    <p>Envío: <strong className="text-slate-700 dark:text-slate-200">{pedido.shippingName || pedido.shipping || '—'}</strong>{pedido.shippingCost ? ` · ${formatMoney(pedido.shippingCost)}` : ''}</p>
                    {pedido.coupon?.code && <p>Cupón {pedido.coupon.code}: -{formatMoney(pedido.coupon.discount || 0)}</p>}
                    {pedido.paymentMethod === 'whatsapp' && <p>Pedido por WhatsApp: el pago se coordina por chat.</p>}
                </div>
            </div>

            {/* A quién y a dónde */}
            <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                    <Dato icon={CreditCard} label="DNI">{c.dni}</Dato>
                    <Dato icon={Phone} label="Teléfono">
                        {c.telefono && (
                            <span className="flex items-center gap-2 flex-wrap">
                                {c.telefono}
                                {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"><MessageCircle className="w-3 h-3" /> WhatsApp</a>}
                            </span>
                        )}
                    </Dato>
                    <div className="sm:col-span-2">
                        <Dato icon={Mail} label="Email">{c.email && <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>}</Dato>
                    </div>
                    <div className="sm:col-span-2">
                        <Dato icon={MapPin} label={sucursal ? 'Retiro en sucursal · ciudad' : 'Dirección de entrega'}>
                            {direccionEnUnaLinea(c)}
                        </Dato>
                    </div>
                    {c.referencias && (
                        <div className="sm:col-span-2">
                            <Dato icon={StickyNote} label="Referencias para el cartero">{c.referencias}</Dato>
                        </div>
                    )}
                </div>
                <button
                    onClick={copiar}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-black transition-all hover:brightness-105"
                    style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                >
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiado ? 'Copiado' : 'Copiar datos para MiCorreo'}
                </button>
            </div>
        </div>
    );
};
