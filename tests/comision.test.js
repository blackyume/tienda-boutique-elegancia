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

import { configPrecios, margenPara, redondear, precioSugerido, explicarPrecio, margenActual, avisoMargenBajo, fotoDeCostos } from '../src/utils/comision';
import { responderPrecio, responderDirecto } from '../src/utils/lauDirecto';
import { planearImportacion } from '../src/utils/importarInventario';

describe('precio automático (Configuración → Precios)', () => {
    const siteConfig = { precios: { margen: 100, packaging: 300, flete: 500, redondeo: 100, margenPorCategoria: { Camperas: 80, remeras: '' } } };

    it('lee la configuración con valores por defecto y categorías en minúsculas', () => {
        expect(configPrecios(null)).toEqual({ margen: 100, margenPorCategoria: {}, packaging: 0, flete: 0, redondeo: 100 });
        const c = configPrecios(siteConfig);
        expect(c.margenPorCategoria).toEqual({ camperas: 80 });
        expect(margenPara('CAMPERAS', c)).toBe(80);
        expect(margenPara('jeans', c)).toBe(100);
    });
    it('redondea siempre para arriba', () => {
        expect(redondear(45454, 100)).toBe(45500);
        expect(redondear(45454, 500)).toBe(45500);
        expect(redondear(45501, 500)).toBe(46000);
        expect(redondear(45454, 1000)).toBe(46000);
        expect(redondear(45454, 99)).toBe(45499);
        expect(redondear(45400, 99)).toBe(45399);
    });
    it('"me costó 21000" → precio con margen, packaging, flete y MP configurados', () => {
        const r = precioSugerido(21000, { siteConfig, paymentConfig: { realMpFeePercent: 7.6 } });
        expect(r.costoTotal).toBe(21800);
        expect(r.precio).toBe(47200); // 43600 / 0.924 = 47186 → 47200
        expect(r.neto).toBeGreaterThanOrEqual(21800);
        expect(precioSugerido(21000, { siteConfig, categoria: 'Camperas', paymentConfig: {} }).margen).toBe(80);
        expect(precioSugerido(21000, { siteConfig, margen: 50, packaging: 0, flete: 0, paymentConfig: {} }).costoTotal).toBe(21000);
        expect(precioSugerido(0, { siteConfig })).toBeNull();
        expect(explicarPrecio(r)).toContain('Precio sugerido: $47.200');
        expect(explicarPrecio(r)).toContain('packaging $300 + flete $500');
    });
    it('Lau contesta "me costó X" sin IA, y no se mete si es una carga', () => {
        const cotizar = (costo, cat) => `precio para ${costo}${cat ? ' en ' + cat : ''}`;
        expect(responderPrecio('me costó 24.000', { cotizar })).toBe('precio para 24000');
        expect(responderPrecio('a cuanto vendo algo que me salió $18500 en camperas?', { cotizar, categorias: ['Camperas', 'Jeans'] })).toBe('precio para 18500 en Camperas');
        expect(responderPrecio('cargá un jean que me costó 24000', { cotizar })).toBeNull();
        expect(responderPrecio('me costó caro', { cotizar })).toBeNull();
        expect(responderDirecto('me costó 24000', { cotizar })).toBe('precio para 24000');
    });
    it('margen actual y aviso cuando sube el costo', () => {
        const p = { id: 'p1', name: 'Jean Oxford', price: 46500, cost: 21000, category: 'Jeans' };
        expect(margenActual(p, { realMpFeePercent: 7.6 })).toBe(105);
        const antes = fotoDeCostos([p]);
        expect(avisoMargenBajo(antes, [p], { siteConfig, paymentConfig: {} })).toBeNull();
        const aviso = avisoMargenBajo(antes, [{ ...p, cost: 30000 }], { siteConfig, paymentConfig: { realMpFeePercent: 7.6 } });
        expect(aviso).toContain('Jean Oxford: subió el costo ($21.000 → $30.000)');
        expect(aviso).toContain('tu margen es 100%');
        expect(aviso).toContain('precio $');
        // una baja de costo no molesta
        expect(avisoMargenBajo(antes, [{ ...p, cost: 15000 }], { siteConfig, paymentConfig: {} })).toBeNull();
    });
    it('Excel solo con costo: el precio se calcula al importar', () => {
        const filas = [{ producto: 'Remera Nueva', costo: 8000, stock: 3 }, { producto: 'Sin nada', stock: 1 }];
        const plan = planearImportacion(filas, [], [], { cotizar: (costo) => precioSugerido(costo, { siteConfig, paymentConfig: {} }) });
        expect(plan.altas).toHaveLength(1);
        expect(plan.altas[0].datos.price).toBeGreaterThan(8000);
        expect(plan.altas[0].avisos.join(' ')).toContain('Precio calculado desde el costo');
        expect(plan.errores[0].motivo).toContain('sin precio ni costo');
    });
});
