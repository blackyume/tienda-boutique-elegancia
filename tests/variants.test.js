import { describe, it, expect } from 'vitest';
import {
    getTotalStock,
    getVariantStock,
    getVariantPrice,
    hasVariantMap,
    isVariantInStock,
    isSizeAvailable,
    isColorAvailable,
    availableAfterCart,
    variantKey
} from '../src/utils/variants.js';

describe('variantKey', () => {
    it('joins size and color with "::"', () => {
        expect(variantKey('M', 'negro')).toBe('M::negro');
    });

    it('tolerates empty values', () => {
        expect(variantKey(null, 'rojo')).toBe('::rojo');
        expect(variantKey('S', undefined)).toBe('S::');
    });
});

describe('hasVariantMap', () => {
    it('false for null/empty', () => {
        expect(hasVariantMap(null)).toBe(false);
        expect(hasVariantMap({})).toBe(false);
        expect(hasVariantMap({ variants: [] })).toBe(false);
    });

    it('true for non-empty array', () => {
        expect(hasVariantMap({ variants: [{ size: 'M', color: 'negro', stock: 3 }] })).toBe(true);
    });

    it('true for non-empty map', () => {
        expect(hasVariantMap({ variants: { 'M::negro': 3 } })).toBe(true);
    });
});

describe('getTotalStock', () => {
    it('falls back to legacy stock when no variants', () => {
        expect(getTotalStock({ stock: 10 })).toBe(10);
        expect(getTotalStock({ stock: 0 })).toBe(0);
        expect(getTotalStock({})).toBe(0);
    });

    it('sums array variants', () => {
        const product = {
            variants: [
                { size: 'S', color: 'rojo', stock: 3 },
                { size: 'M', color: 'rojo', stock: 5 },
                { size: 'L', color: 'negro', stock: 0 }
            ]
        };
        expect(getTotalStock(product)).toBe(8);
    });

    it('sums map variants', () => {
        const product = { variants: { 'S::rojo': 3, 'M::rojo': 5, 'L::negro': 0 } };
        expect(getTotalStock(product)).toBe(8);
    });

    it('ignores negative stock', () => {
        const product = { variants: [{ size: 'S', color: 'rojo', stock: -1 }] };
        expect(getTotalStock(product)).toBe(0);
    });
});

describe('getVariantStock', () => {
    it('returns stock of matching variant (array)', () => {
        const product = { variants: [{ size: 'M', color: 'rojo', stock: 4 }] };
        expect(getVariantStock(product, 'M', 'rojo')).toBe(4);
        expect(getVariantStock(product, 'M', 'negro')).toBe(0);
    });

    it('returns stock of matching variant (map)', () => {
        const product = { variants: { 'M::rojo': 4 } };
        expect(getVariantStock(product, 'M', 'rojo')).toBe(4);
    });

    it('falls back to legacy stock when no variants', () => {
        expect(getVariantStock({ stock: 7 }, 'M', 'rojo')).toBe(7);
    });
});

describe('getVariantPrice', () => {
    it('returns variant price if set', () => {
        const product = {
            price: 100,
            variants: [{ size: 'M', color: 'rojo', stock: 4, price: 150 }]
        };
        expect(getVariantPrice(product, 'M', 'rojo')).toBe(150);
    });

    it('falls back to product price if variant price missing', () => {
        const product = {
            price: 100,
            variants: [{ size: 'M', color: 'rojo', stock: 4 }]
        };
        expect(getVariantPrice(product, 'M', 'rojo')).toBe(100);
    });

    it('coerces string prices', () => {
        expect(getVariantPrice({ price: '250' }, 'M', 'rojo')).toBe(250);
    });
});

describe('isVariantInStock', () => {
    it('true when stock > 0', () => {
        const p = { variants: [{ size: 'M', color: 'rojo', stock: 2 }] };
        expect(isVariantInStock(p, 'M', 'rojo')).toBe(true);
    });
    it('false when stock = 0', () => {
        const p = { variants: [{ size: 'M', color: 'rojo', stock: 0 }] };
        expect(isVariantInStock(p, 'M', 'rojo')).toBe(false);
    });
});

describe('isSizeAvailable', () => {
    it('true if any color has stock for that size', () => {
        const p = {
            sizes: ['M'], colors: ['rojo', 'negro'],
            variants: [
                { size: 'M', color: 'rojo', stock: 0 },
                { size: 'M', color: 'negro', stock: 2 }
            ]
        };
        expect(isSizeAvailable(p, 'M')).toBe(true);
    });

    it('false if all colors zero for that size', () => {
        const p = {
            sizes: ['M'], colors: ['rojo', 'negro'],
            variants: [
                { size: 'M', color: 'rojo', stock: 0 },
                { size: 'M', color: 'negro', stock: 0 }
            ]
        };
        expect(isSizeAvailable(p, 'M')).toBe(false);
    });
});

describe('isColorAvailable', () => {
    it('true if any size has stock for that color', () => {
        const p = {
            sizes: ['S', 'M'], colors: ['rojo'],
            variants: [
                { size: 'S', color: 'rojo', stock: 0 },
                { size: 'M', color: 'rojo', stock: 1 }
            ]
        };
        expect(isColorAvailable(p, 'rojo')).toBe(true);
    });
});

describe('availableAfterCart', () => {
    it('resta cantidad en carrito al stock', () => {
        const p = { id: '42', variants: [{ size: 'M', color: 'rojo', stock: 5 }] };
        const cart = [{ id: '42', size: 'M', color: 'rojo', quantity: 2 }];
        expect(availableAfterCart(p, 'M', 'rojo', cart)).toBe(3);
    });

    it('nunca negativo', () => {
        const p = { id: '42', variants: [{ size: 'M', color: 'rojo', stock: 1 }] };
        const cart = [{ id: '42', size: 'M', color: 'rojo', quantity: 5 }];
        expect(availableAfterCart(p, 'M', 'rojo', cart)).toBe(0);
    });
});
