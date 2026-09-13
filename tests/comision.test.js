import { describe, it, expect } from 'vitest';
import { comisionMP, comisionDeProducto, costoUnitario, precioConMargen, comisionDelPedido, COMISION_MP_ESTIMADA } from '../src/utils/comision';

describe('comisión de Mercado Pago', () => {
    it('usa la real medida; si no hay, el estimado (6,29% + IVA); el recargo a la clienta no cuenta', () => {
        expect(comisionMP({ realMpFeePercent: 7.4 })).toBe(7.4);
        expect(comisionMP({ mpFee: 6 })).toBe(COMISION_MP_ESTIMADA);
        expect(comisionMP(null)).toBe(7.6);
    });
    it('el producto puede tener la suya; vacío o 0 hereda la de la tienda', () => {
        expect(comisionDeProducto({ feePercent: 5 }, {})).toBe(5);
        expect(comisionDeProducto({ feePercent: '' }, { realMpFeePercent: 7.4 })).toBe(7.4);
        expect(comisionDeProducto({ feePercent: 0 }, {})).toBe(7.6);
    });
    it('costo unitario suma todo', () => {
        expect(costoUnitario({ cost: 21000, shippingCost: 500, packagingCost: 300, fixedFee: 0 })).toBe(21800);
        expect(costoUnitario({ cost: '21000' })).toBe(21000);
    });
    it('precio con margen sobre el costo, limpio después de MP, redondeado a 100', () => {
        const r = precioConMargen(21000, 100, 7.6);
        expect(r.precio).toBe(45500); // 42000 / 0.924 = 45454 → 45500
        expect(r.neto).toBeGreaterThanOrEqual(21000); // el margen pedido queda limpio
        expect(precioConMargen(0, 50, 7.6)).toBeNull();
        expect(precioConMargen(1000, 50, 100)).toBeNull();
    });
    it('comisión de un pedido: la real si MP la informó, cero si fue por fuera, estimada si no', () => {
        expect(comisionDelPedido({ total: 10000, mpFeeAmount: 761 }, {})).toBe(761);
        expect(comisionDelPedido({ total: 10000, manual: true }, {})).toBe(0);
        expect(comisionDelPedido({ total: 10000 }, { realMpFeePercent: 7.4 })).toBe(740);
    });
});
