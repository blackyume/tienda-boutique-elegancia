// Taxonomía ÚNICA de estados de pedido. Antes estaba duplicada y desalineada
// entre el checkout (pending_payment / pending_wa), el webhook de MP
// (approved / pending / cancelled / refunded / review) y los badges del admin
// y del cliente (sólo mapeaban pending/shipped/delivered/cancelled), por lo que
// un pedido pagado le aparecía al cliente como texto crudo "approved".
//
// Acá centralizamos label + estilo + helpers para todo el ciclo de vida.

export const ORDER_STATUS = {
    pending_payment: { label: 'Esperando pago', tone: 'amber' },
    pending_wa: { label: 'A coordinar por WhatsApp', tone: 'sky' },
    pending: { label: 'Pago en proceso', tone: 'amber' },
    approved: { label: 'Pagado', tone: 'green' },
    paid: { label: 'Pagado', tone: 'green' },
    shipped: { label: 'Enviado', tone: 'blue' },
    delivered: { label: 'Entregado', tone: 'green' },
    cancelled: { label: 'Cancelado', tone: 'red' },
    refunded: { label: 'Reembolsado', tone: 'slate' },
    review: { label: 'En revisión', tone: 'orange' },
};

// Clases Tailwind por tono (con variantes dark:).
const TONE_CLASSES = {
    amber: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    sky: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
    green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

export const getStatusLabel = (status) => ORDER_STATUS[status]?.label || status || '—';

export const getStatusClasses = (status) => {
    const tone = ORDER_STATUS[status]?.tone || 'slate';
    return TONE_CLASSES[tone];
};

// Estados en los que el pago ya está confirmado (cobrado o por coordinar offline).
export const PAID_STATUSES = ['approved', 'paid', 'shipped', 'delivered'];
export const isPaidStatus = (status) => PAID_STATUSES.includes(status);

// ¿El pedido ya se puede despachar? (pagado y todavía no enviado/entregado/cancelado)
export const isFulfillable = (status) =>
    ['approved', 'paid', 'pending', 'pending_wa'].includes(status);
