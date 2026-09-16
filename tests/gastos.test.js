import { describe, it, expect } from 'vitest';
import { interpretarGasto, responderGastos, gastosDelPeriodo, gastosPorCategoria, totalGastos } from '../src/utils/gastos';

const ahora = new Date('2026-09-16T15:00:00');
const dia = 864e5;
const gastos = [
    { id: 'a', amount: 20000, concept: 'Publicidad Instagram', category: 'publicidad', date: ahora.getTime() - 1 * dia },
    { id: 'b', amount: 8000, concept: 'Bolsas', category: 'packaging', date: ahora.getTime() - 10 * dia },
    { id: 'c', amount: 5000, concept: 'Bolsas', category: 'packaging', date: ahora.getTime() - 40 * dia },
    { id: 'd', amount: 3000, concept: 'Cadete', category: 'envios', date: ahora.getTime() },
];

describe('gastos por período y rubro', () => {
    it('filtra por días, hoy y todo', () => {
        expect(gastosDelPeriodo(gastos, '7', ahora).map((g) => g.id)).toEqual(['a', 'd']);
        expect(gastosDelPeriodo(gastos, '30', ahora).map((g) => g.id)).toEqual(['a', 'b', 'd']);
        expect(gastosDelPeriodo(gastos, 'hoy', ahora).map((g) => g.id)).toEqual(['d']);
        expect(gastosDelPeriodo(gastos, 'all', ahora)).toHaveLength(4);
    });
    it('suma por categoría de mayor a menor', () => {
        const r = gastosPorCategoria(gastos);
        expect(r[0]).toMatchObject({ categoria: 'publicidad', total: 20000, n: 1 });
        expect(r[1]).toMatchObject({ categoria: 'packaging', label: 'Packaging', total: 13000, n: 2 });
        expect(totalGastos(gastos)).toBe(36000);
    });
});

describe('interpretarGasto', () => {
    it('"gasté 20000 en publicidad"', () => {
        const r = interpretarGasto('gasté 20000 en publicidad', { ahora });
        expect(r).toMatchObject({ amount: 20000, category: 'publicidad', concept: 'Publicidad', date: ahora.getTime() });
    });
    it('"pagué 8.000 de bolsas ayer" → packaging, fecha de ayer', () => {
        const r = interpretarGasto('pagué $8.000 de bolsas ayer', { ahora });
        expect(r).toMatchObject({ amount: 8000, category: 'packaging', concept: 'Bolsas', date: ahora.getTime() - dia });
    });
    it('"invertí 15000 en un sorteo de instagram el 12"', () => {
        const r = interpretarGasto('invertí 15000 en un sorteo de instagram el 12', { ahora });
        expect(r.category).toBe('publicidad');
        expect(new Date(r.date).getDate()).toBe(12);
        expect(new Date(r.date).getMonth()).toBe(8);
    });
    it('"el 20" cuando todavía no llegó es del mes pasado', () => {
        const r = interpretarGasto('pagué 30000 de alquiler el 20', { ahora });
        expect(r.category).toBe('servicios');
        expect(new Date(r.date).getMonth()).toBe(7);
    });
    it('no es gasto si es una prenda del inventario, una pregunta o no hay monto', () => {
        expect(interpretarGasto('pagué 20000 por el sweater lanilla', { esProducto: () => true })).toBeNull();
        expect(interpretarGasto('¿cuánto gasté este mes?')).toBeNull();
        expect(interpretarGasto('gasté mucho en bolsas')).toBeNull();
        expect(interpretarGasto('vendí el top rib a 14000')).toBeNull();
    });
});

describe('responderGastos', () => {
    it('resume el mes por rubro con los últimos', () => {
        const r = responderGastos('¿cuánto gasté este mes?', gastos, ahora);
        expect(r).toContain('$31.000');
        expect(r).toContain('Publicidad: $20.000');
        expect(r).toContain('Cadete');
    });
    it('semana, hoy y sin gastos', () => {
        expect(responderGastos('gastos de la semana', gastos, ahora)).toContain('$23.000');
        expect(responderGastos('qué gasté hoy', gastos, ahora)).toContain('$3.000');
        expect(responderGastos('cuánto gasté hoy', [], ahora)).toContain('No hay gastos');
    });
    it('no responde a lo que no es pregunta de gastos', () => {
        expect(responderGastos('gasté 20000 en publicidad', gastos, ahora)).toBeNull();
        expect(responderGastos('¿cuánto vendí hoy?', gastos, ahora)).toBeNull();
    });
});
