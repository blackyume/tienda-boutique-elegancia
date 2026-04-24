import { describe, it, expect } from 'vitest';
import { getLowStockItems, DEFAULT_LOW_STOCK_THRESHOLD } from '../src/utils/lowStock.js';

describe('getLowStockItems', () => {
    it('retorna [] para inventario vacío o inválido', () => {
        expect(getLowStockItems([])).toEqual([]);
        expect(getLowStockItems(null)).toEqual([]);
        expect(getLowStockItems(undefined)).toEqual([]);
    });

    it('ignora productos inactivos', () => {
        const inv = [
            { id: 1, name: 'A', active: false, stock: 0 },
            { id: 2, name: 'B', active: true, stock: 0 }
        ];
        const alerts = getLowStockItems(inv, 5);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].product.id).toBe(2);
    });

    it('marca producto legacy como isAggregate', () => {
        const inv = [{ id: 1, name: 'A', stock: 2 }];
        const alerts = getLowStockItems(inv, 5);
        expect(alerts[0].isAggregate).toBe(true);
        expect(alerts[0].total).toBe(2);
        expect(alerts[0].critical).toBe(false);
    });

    it('marca total=0 como crítico', () => {
        const inv = [{ id: 1, name: 'A', stock: 0 }];
        const alerts = getLowStockItems(inv, 5);
        expect(alerts[0].critical).toBe(true);
    });

    it('extrae sólo variantes bajas (no las altas)', () => {
        const inv = [{
            id: 1, name: 'A',
            variants: [
                { size: 'S', color: 'rojo', stock: 2 },
                { size: 'M', color: 'rojo', stock: 10 },
                { size: 'L', color: 'rojo', stock: 0 }
            ]
        }];
        const alerts = getLowStockItems(inv, 3);
        expect(alerts[0].variants).toHaveLength(2);
        expect(alerts[0].variants.map(v => v.size)).toEqual(['L', 'S']); // ordena por stock asc
    });

    it('no agrega producto si todas las variantes están sobre el umbral', () => {
        const inv = [{
            id: 1, name: 'A',
            variants: [
                { size: 'S', color: 'rojo', stock: 10 },
                { size: 'M', color: 'rojo', stock: 8 }
            ]
        }];
        expect(getLowStockItems(inv, 3)).toHaveLength(0);
    });

    it('soporta map variants', () => {
        const inv = [{
            id: 1, name: 'A',
            variants: { 'S::rojo': 1, 'M::rojo': 99 }
        }];
        const alerts = getLowStockItems(inv, 5);
        expect(alerts[0].variants).toHaveLength(1);
        expect(alerts[0].variants[0].stock).toBe(1);
    });

    it('ordena críticos primero, luego por stock total asc', () => {
        const inv = [
            { id: 'a', name: 'A', stock: 3 },
            { id: 'b', name: 'B', stock: 0 },
            { id: 'c', name: 'C', stock: 1 }
        ];
        const alerts = getLowStockItems(inv, 5);
        expect(alerts.map(a => a.product.id)).toEqual(['b', 'c', 'a']);
    });

    it('usa umbral por defecto si no se pasa', () => {
        const inv = [{ id: 1, name: 'A', stock: 4 }];
        const alerts = getLowStockItems(inv);
        expect(alerts).toHaveLength(1);
        expect(DEFAULT_LOW_STOCK_THRESHOLD).toBe(5);
    });
});
