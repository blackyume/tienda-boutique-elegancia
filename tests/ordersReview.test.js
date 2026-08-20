import { describe, it, expect } from 'vitest';
import { sinStockDescontado, conMontoQueNoCoincide } from '../src/components/admin/OrdersNeedingReviewPanel.jsx';

// El webhook marca estas órdenes y antes nadie las veía. Estas pruebas fijan
// QUÉ tiene que salir a la vista, para que un refactor no las vuelva a ocultar.
const ordenes = [
    { id: 'ORD-1', status: 'approved' },
    { id: 'ORD-2', status: 'approved', needsStockReview: true },
    { id: 'ORD-3', status: 'approved', stockError: 'Sin stock de M/negro' },
    { id: 'ORD-4', status: 'review', mpAmountMismatch: true },
    { id: 'ORD-5', status: 'review' },
    { id: 'ORD-6', status: 'pending_wa' },
    null,
];

describe('pedidos que el panel tiene que mostrar', () => {
    it('muestra los que se cobraron y no pudieron descontar stock', () => {
        expect(sinStockDescontado(ordenes).map(o => o.id)).toEqual(['ORD-2', 'ORD-3']);
    });

    it('muestra los que tienen el monto en discusión', () => {
        expect(conMontoQueNoCoincide(ordenes).map(o => o.id)).toEqual(['ORD-4', 'ORD-5']);
    });

    it('no molesta con las órdenes sanas', () => {
        const sanas = [{ id: 'ok', status: 'approved' }];
        expect(sinStockDescontado(sanas)).toHaveLength(0);
        expect(conMontoQueNoCoincide(sanas)).toHaveLength(0);
    });

    it('aguanta una lista vacía o con basura sin romperse', () => {
        expect(sinStockDescontado()).toEqual([]);
        expect(conMontoQueNoCoincide([null, undefined])).toEqual([]);
    });
});
