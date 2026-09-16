import { describe, it, expect } from 'vitest';
import { interpretarAccion, accionInversa } from '../src/utils/lauAcciones';
import { precioEfectivo, gananciaPorFuera } from '../src/utils/comision';
import { responderDirecto } from '../src/utils/lauDirecto';

const inventario = [
    { id: 's1', name: 'SWEATER LANILLA', price: 45100, cost: 20000, shippingCost: 500, packagingCost: 300, active: true, stock: 3 },
    { id: 't1', name: 'TOP RIB', price: 15000, active: true, stock: 5 },
    { id: 'j1', name: 'JEANS OXFORD', price: 46500, cost: 22000, active: true, variants: [{ size: '38', color: 'Azul', stock: 2 }, { size: '40', color: 'Azul', stock: 1 }] },
];
const ctx = { comision: 7.6 };

describe('precio efectivo y ganancia por fuera', () => {
    it('sin la comisión de MP, redondeado a 100 para arriba', () => {
        expect(precioEfectivo(45100, 7.6)).toBe(41700);
        expect(precioEfectivo(0, 7.6)).toBe(0);
        expect(precioEfectivo(45100, 0)).toBe(45100);
    });
    it('ganancia con costo cargado (prenda + flete + embalaje)', () => {
        const g = gananciaPorFuera(inventario[0], 41700, 1);
        expect(g).toMatchObject({ costo: 20800, neto: 20900, total: 20900, margen: 100, bajoCosto: false });
        expect(gananciaPorFuera(inventario[0], 15000, 1).bajoCosto).toBe(true);
        expect(gananciaPorFuera(inventario[1], 15000, 1)).toBeNull();
    });
});

describe('venta con descuento en porcentaje', () => {
    it('"vendí el sweater lanilla con 10% de descuento en efectivo"', () => {
        const r = interpretarAccion('vendí el sweater lanilla con 10% de descuento en efectivo', inventario, ctx);
        expect(r.accion.tool).toBe('record_sale');
        expect(r.accion.args).toMatchObject({ productId: 's1', quantity: 1, amount: 40590, listPrice: 45100, discountPct: 10, payment: 'efectivo' });
        expect(r.nota).toContain('limpios');
        expect(r.resumen).toContain('−10%');
    });
    it('el 10 del "10%" no es una cantidad; con 2 unidades el descuento va sobre el total', () => {
        const r = interpretarAccion('vendí 2 top rib 15% off por transferencia', inventario, ctx);
        expect(r.accion.args).toMatchObject({ productId: 't1', quantity: 2, amount: 25500, discountPct: 15, payment: 'transferencia' });
        expect(r.nota).toBe(''); // sin costo cargado no hay ganancia para contar
    });
    it('descuento sobre el precio dicho', () => {
        const r = interpretarAccion('vendí el top rib a 14000 con 10%', inventario, ctx);
        expect(r.accion.args).toMatchObject({ amount: 12600, listPrice: 14000, discountPct: 10 });
    });
    it('avisa cuando queda por debajo del costo', () => {
        const r = interpretarAccion('vendí el sweater lanilla a 18000 en efectivo', inventario, ctx);
        expect(r.accion.args.amount).toBe(18000);
        expect(r.nota).toContain('por debajo del costo');
    });
});

describe('venta en efectivo sin precio: lista o efectivo', () => {
    it('pregunta con dos botones re-parseables', () => {
        const r = interpretarAccion('vendí el sweater lanilla en efectivo', inventario, ctx);
        expect(r.falta).toBe('precio');
        expect(r.lista).toBe(45100);
        expect(r.efectivo).toBe(41700);
        expect(r.opciones).toEqual(['vendí el sweater lanilla en efectivo a 45100', 'vendí el sweater lanilla en efectivo a 41700']);
        const r2 = interpretarAccion(r.opciones[1], inventario, ctx);
        expect(r2.accion.args).toMatchObject({ productId: 's1', amount: 41700, payment: 'efectivo' });
    });
    it('con variantes primero elige talle y color', () => {
        const r = interpretarAccion('vendí el jeans oxford en efectivo', inventario, ctx);
        expect(r.falta).toBe('variante');
    });
    it('sin comisión conocida no pregunta (precio de lista)', () => {
        const r = interpretarAccion('vendí el sweater lanilla en efectivo', inventario);
        expect(r.accion.args).toMatchObject({ productId: 's1', payment: 'efectivo' });
        expect(r.accion.args.amount).toBeUndefined();
    });
    it('por whatsapp sin precio sigue directo', () => {
        expect(interpretarAccion('vendí el sweater lanilla por whatsapp', inventario, ctx).accion.tool).toBe('record_sale');
    });
});

describe('cargar el costo de un producto', () => {
    it('"el sweater lanilla me costó 21000 más 600 de flete y 300 de embalaje"', () => {
        const r = interpretarAccion('el sweater lanilla me costó 21000 más 600 de flete y 300 de embalaje', inventario, ctx);
        expect(r.tipo).toBe('costo');
        expect(r.accion).toEqual({ tool: 'edit_product', args: { productId: 's1', nombre: 'SWEATER LANILLA', fields: { cost: 21000, shippingCost: 600, packagingCost: 300 } } });
        expect(r.resumen).toContain('$21.000');
    });
    it('"me salió 18.500 el top rib, flete 400"', () => {
        const r = interpretarAccion('me salió 18.500 el top rib, flete 400', inventario, ctx);
        expect(r.accion.args.fields).toEqual({ cost: 18500, shippingCost: 400 });
    });
    it('sin producto conocido lo deja a la cotización genérica', () => {
        expect(interpretarAccion('me costó 24000', inventario, ctx)).toBeNull();
        expect(interpretarAccion('la campera de cuero me costó 24000', inventario, ctx)).toBeNull();
    });
    it('una pregunta de costo no carga nada', () => {
        expect(interpretarAccion('¿cuánto me costó el sweater lanilla?', inventario, ctx)).toBeNull();
    });
    it('se deshace volviendo a los valores de antes', () => {
        const r = interpretarAccion('el sweater lanilla me costó 21000', inventario, ctx);
        const inv = accionInversa(r.accion, inventario[0]);
        expect(inv).toMatchObject({ tool: 'edit_product', args: { productId: 's1', fields: { cost: 20000 } } });
    });
});

describe('pregunta: ¿cuánto es en efectivo?', () => {
    const efectivo = (p) => `${p.name} efectivo`;
    it('responde con el producto', () => {
        expect(responderDirecto('¿cuánto es el sweater lanilla en efectivo?', { inventario, efectivo })).toBe('SWEATER LANILLA efectivo');
        expect(responderDirecto('precio efectivo del top rib', { inventario, efectivo })).toBe('TOP RIB efectivo');
        expect(responderDirecto('el top rib sin mp', { inventario, efectivo })).toBe('TOP RIB efectivo');
    });
    it('no se mete con ventas ni acciones', () => {
        expect(responderDirecto('vendí el top rib en efectivo', { inventario, efectivo })).toBeNull();
        expect(responderDirecto('ponele 14000 al top rib en efectivo', { inventario, efectivo })).toBeNull();
    });
});
