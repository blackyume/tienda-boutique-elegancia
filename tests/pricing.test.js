import { describe, it, expect } from 'vitest';
import pricing from '../api/_pricing.js';

const {
    getVariantPrice,
    getVariantStock,
    getTotalStock,
    applyStockDecrement,
    applyStockRestore,
} = pricing;

// Este es el motor que decide CUÁNTO se cobra y CUÁNTO stock queda. Es el
// código con más consecuencia de la tienda y era el único sin ninguna prueba.
// Los productos vienen en tres formas distintas (stock plano, variants como
// array, variants como objeto) y las tres tienen que dar el mismo resultado.

const plano = { name: 'Sweater', price: 48700, stock: 5 };

const enArray = {
    name: 'Jean',
    price: 46500,
    variants: [
        { size: '38', color: 'azul', stock: 2 },
        { size: '40', color: 'azul', stock: 1, price: 49900 },
        { size: '40', color: 'negro', stock: 0 },
    ],
};

const enObjeto = {
    name: 'Top',
    price: 14800,
    variants: { '1::blanco': 3, '2::blanco': 0 },
};

describe('precio', () => {
    it('usa el precio del producto cuando la variante no tiene uno propio', () => {
        expect(getVariantPrice(enArray, '38', 'azul')).toBe(46500);
    });

    it('la variante con precio propio le gana al precio general', () => {
        expect(getVariantPrice(enArray, '40', 'azul')).toBe(49900);
    });

    it('un talle que no existe cae al precio del producto, nunca a cero', () => {
        expect(getVariantPrice(enArray, '99', 'rosa')).toBe(46500);
    });

    it('nunca devuelve NaN aunque el producto venga incompleto', () => {
        expect(getVariantPrice({}, 'M', 'rojo')).toBe(0);
        expect(getVariantPrice(null, 'M', 'rojo')).toBe(0);
    });
});

describe('stock disponible', () => {
    it('lee el stock plano', () => {
        expect(getTotalStock(plano)).toBe(5);
    });

    it('suma las variantes del array', () => {
        expect(getTotalStock(enArray)).toBe(3);
    });

    it('suma las variantes del objeto', () => {
        expect(getTotalStock(enObjeto)).toBe(3);
    });

    it('una variante agotada da 0, no undefined', () => {
        expect(getVariantStock(enArray, '40', 'negro')).toBe(0);
        expect(getVariantStock(enObjeto, '2', 'blanco')).toBe(0);
    });
});

describe('descuento de stock al aprobarse el pago', () => {
    it('descuenta del stock plano', () => {
        expect(applyStockDecrement(plano, [{ quantity: 2 }])).toEqual({ stock: 3 });
    });

    it('descuenta sólo la variante comprada y no toca las otras', () => {
        const { variants } = applyStockDecrement(enArray, [{ size: '38', color: 'azul', quantity: 2 }]);
        expect(variants.find(v => v.size === '38').stock).toBe(0);
        expect(variants.find(v => v.size === '40' && v.color === 'azul').stock).toBe(1);
    });

    it('suma varias líneas del mismo producto en una sola pasada', () => {
        const { stock } = applyStockDecrement({ ...plano }, [{ quantity: 2 }, { quantity: 1 }]);
        expect(stock).toBe(2);
    });

    // Lo que impide vender lo que no hay: si dos clientas pagan la última
    // unidad, la segunda tiene que reventar acá y quedar marcada para revisión,
    // en vez de dejar el stock en negativo.
    it('se niega a dejar el stock en negativo (stock plano)', () => {
        expect(() => applyStockDecrement(plano, [{ quantity: 6 }])).toThrow(/Sin stock/);
    });

    it('se niega a dejar el stock en negativo (variante)', () => {
        expect(() => applyStockDecrement(enArray, [{ size: '38', color: 'azul', quantity: 3 }]))
            .toThrow(/Sin stock/);
    });

    it('se niega a vender una variante agotada', () => {
        expect(() => applyStockDecrement(enArray, [{ size: '40', color: 'negro', quantity: 1 }]))
            .toThrow(/Sin stock/);
    });

    it('se niega a vender una variante que no existe', () => {
        expect(() => applyStockDecrement(enArray, [{ size: '99', color: 'rosa', quantity: 1 }]))
            .toThrow(/inexistente/);
    });

    it('no modifica el producto original (trabaja sobre una copia)', () => {
        const original = JSON.parse(JSON.stringify(enArray));
        applyStockDecrement(enArray, [{ size: '38', color: 'azul', quantity: 1 }]);
        expect(enArray).toEqual(original);
    });
});

describe('reposición de stock al cancelar o reembolsar', () => {
    it('devuelve la unidad al stock plano', () => {
        expect(applyStockRestore(plano, [{ quantity: 2 }])).toEqual({ stock: 7 });
    });

    it('devolver lo que se descontó deja el stock igual que al principio', () => {
        const linea = [{ size: '38', color: 'azul', quantity: 2 }];
        const bajado = applyStockDecrement(enArray, linea);
        const repuesto = applyStockRestore({ ...enArray, ...bajado }, linea);
        expect(repuesto.variants.find(v => v.size === '38').stock)
            .toBe(enArray.variants.find(v => v.size === '38').stock);
    });
});
