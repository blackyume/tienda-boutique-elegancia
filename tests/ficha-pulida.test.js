import { describe, it, expect } from 'vitest';
import { detallesSinRepetir } from '../src/utils/ficha';
import { prendasRelacionadas } from '../src/utils/relacionados';
import { ordenarTalles } from '../src/utils/variants';

describe('ordenarTalles', () => {
    it('pone números, letras y lo demás en orden', () => {
        expect(ordenarTalles(['36', '42', '1', 'S', 'XL', '4', 'M', '46', 'Único'])).toEqual(['1', '4', '36', '42', '46', 'S', 'M', 'XL', 'Único']);
    });
    it('acepta un Set y no toca el original', () => {
        const talles = ['L', 'S'];
        expect(ordenarTalles(new Set(talles))).toEqual(['S', 'L']);
        expect(talles).toEqual(['L', 'S']);
    });
});

describe('detallesSinRepetir', () => {
    it('saca lo que ya está arriba en la ficha', () => {
        expect(detallesSinRepetir({ details: 'Color: Azul\nTalles: 36, 38' })).toEqual([]);
        expect(detallesSinRepetir({ details: 'Disponible en Blanco y Verde\nTalle único' })).toEqual([]);
    });
    it('deja las viñetas nuevas', () => {
        expect(detallesSinRepetir({ details: 'Color: Azul\nTiro alto\nMedidas por talle en la guía de talles' })).toEqual(['Tiro alto', 'Medidas por talle en la guía de talles']);
    });
    it('la composición sólo se saca si la ficha ya la muestra', () => {
        expect(detallesSinRepetir({ details: 'Composición: Modal', material: 'Modal' })).toEqual([]);
        expect(detallesSinRepetir({ details: 'Composición: Modal' })).toEqual(['Composición: Modal']);
    });
    it('sin detalles no rompe', () => {
        expect(detallesSinRepetir({})).toEqual([]);
    });
});

describe('prendasRelacionadas', () => {
    const prenda = (id, category, extra = {}) => ({ id, category, stock: 3, ...extra });
    const inventario = [prenda('a', 'JEANS'), prenda('b', 'JEANS'), prenda('c', 'SHORT'), prenda('d', 'SHORT'), prenda('e', 'SWEATER'), prenda('f', 'BODYS')];

    it('primero la misma categoría y completa hasta cuatro', () => {
        const r = prendasRelacionadas(inventario, inventario[0]);
        expect(r).toHaveLength(4);
        expect(r[0].id).toBe('b');
        expect(r.map((p) => p.id)).not.toContain('a');
    });
    it('completa con categorías distintas antes de repetir', () => {
        const r = prendasRelacionadas(inventario, inventario[0]);
        expect(new Set(r.slice(1).map((p) => p.category)).size).toBe(3);
    });
    it('no ofrece prendas ocultas ni agotadas', () => {
        const lista = [prenda('a', 'JEANS'), prenda('b', 'JEANS', { active: false }), prenda('c', 'SHORT', { stock: 0 })];
        expect(prendasRelacionadas(lista, lista[0])).toEqual([]);
    });
});
