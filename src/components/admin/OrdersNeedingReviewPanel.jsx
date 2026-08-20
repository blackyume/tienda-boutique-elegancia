import React from 'react';
import { AlertTriangle, PackageX, CircleDollarSign } from 'lucide-react';

/**
 * Órdenes que el servidor marcó y que necesitan que alguien las mire.
 *
 * El webhook de Mercado Pago ya venía escribiendo estas banderas, pero no se
 * mostraban en ninguna pantalla: quedaban en la base y nadie se enteraba.
 *
 * - needsStockReview / stockError: el pago entró pero no se pudo descontar el
 *   stock. Pasa cuando dos clientas pagan la última unidad: la segunda pagó y
 *   no hay prenda para mandarle.
 * - mpAmountMismatch (status 'review'): lo pagado no coincide con lo esperado.
 */
// Exportadas aparte para poder probarlas: son las que deciden si una venta
// cobrada queda o no a la vista de la dueña.
export const sinStockDescontado = (orders = []) =>
    orders.filter(o => o && (o.needsStockReview || o.stockError));

export const conMontoQueNoCoincide = (orders = []) =>
    orders.filter(o => o && (o.mpAmountMismatch || o.status === 'review'));

export const OrdersNeedingReviewPanel = ({ orders = [], onNavigateOrders }) => {
    const sinStock = sinStockDescontado(orders);
    const montoRaro = conMontoQueNoCoincide(orders);

    if (!sinStock.length && !montoRaro.length) return null;

    const fecha = (o) => {
        const t = o.createdAt || o.mpUpdatedAt;
        return t ? new Date(t).toLocaleDateString('es-AR') : '';
    };

    const Fila = ({ o, motivo }) => (
        <li className="flex items-start justify-between gap-3 py-2.5 border-b border-red-500/10 last:border-0">
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {o.id || o.orderId || 'Sin número'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {motivo}
                </p>
            </div>
            <div className="text-right shrink-0">
                {typeof o.total === 'number' && (
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                        ${o.total.toLocaleString('es-AR')}
                    </p>
                )}
                <p className="text-[11px] text-slate-400">{fecha(o)}</p>
            </div>
        </li>
    );

    return (
        <section className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-6">
            <header className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                </span>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pedidos que necesitan tu atención</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        El sistema los marcó solo. Conviene resolverlos antes de despachar.
                    </p>
                </div>
            </header>

            {sinStock.length > 0 && (
                <div className="mb-5">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 mb-1">
                        <PackageX className="w-3.5 h-3.5" />
                        Pagaron pero no había stock ({sinStock.length})
                    </p>
                    <ul>
                        {sinStock.slice(0, 5).map((o, i) => (
                            <Fila key={o.id || i} o={o} motivo={o.stockError || 'No se pudo descontar el stock'} />
                        ))}
                    </ul>
                </div>
            )}

            {montoRaro.length > 0 && (
                <div className="mb-5">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        El monto pagado no coincide ({montoRaro.length})
                    </p>
                    <ul>
                        {montoRaro.slice(0, 5).map((o, i) => (
                            <Fila key={o.id || i} o={o} motivo="Revisar contra el pago en Mercado Pago antes de enviar" />
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={onNavigateOrders}
                className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
            >
                Ver todos los pedidos →
            </button>
        </section>
    );
};
