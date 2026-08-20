import { describe, it, expect } from 'vitest';
import { aNumero, aLista, aEstado, normalizarFila, planearImportacion } from '../src/utils/importarInventario';

describe('aNumero', () => {
    it('lee el formato argentino', () => {
        expect(aNumero('$ 12.500,50')).toBe(12500.5);
        expect(aNumero('12.500')).toBe(12500);
        expect(aNumero('1.234.567')).toBe(1234567);
        expect(aNumero('12,5')).toBe(12.5);
        expect(aNumero(9800)).toBe(9800);
    });
    it('no confunde un decimal con punto', () => {
        expect(aNumero('12.5')).toBe(12.5);
        expect(aNumero('0.75')).toBe(0.75);
    });
    it('devuelve null cuando no hay número', () => {
        expect(aNumero('')).toBeNull();
        expect(aNumero(null)).toBeNull();
        expect(aNumero('  ')).toBeNull();
    });
});

describe('aLista y aEstado', () => {
    it('parte por coma, barra o pipe', () => {
        expect(aLista('S, M , L')).toEqual(['S', 'M', 'L']);
        expect(aLista('rojo/negro')).toEqual(['rojo', 'negro']);
        expect(aLista('')).toEqual([]);
    });
    it('entiende publicado y borrador', () => {
        expect(aEstado('Publicado')).toBe(true);
        expect(aEstado('SÍ')).toBe(true);
        expect(aEstado('Borrador')).toBe(false);
        expect(aEstado('')).toBeUndefined();
        expect(aEstado('cualquier cosa')).toBeUndefined();
    });
});

describe('normalizarFila', () => {
    it('reconoce los encabezados del export y descarta las columnas calculadas', () => {
        const f = normalizarFila({
            'Foto': '',
            'Producto': 'Vestido Aurora',
            'Categoría': 'Vestidos',
            'Precio venta': 45000,
            'Ganancia x unidad': 20000,
            'Valor en stock': 90000,
            'Stock': 2,
            'Estado': 'Publicado',
        });
        expect(f).toEqual({
            nombre: 'Vestido Aurora',
            categoria: 'Vestidos',
            precio: 45000,
            stock: 2,
            estado: 'Publicado',
        });
    });
});

const INVENTARIO = [
    { id: 'a1', name: 'Vestido Aurora', category: 'Vestidos', price: 45000, stock: 3, sizes: ['S', 'M'], colors: ['negro'], active: true, image: 'https://x/1.jpg' },
    { id: 'b2', name: 'Blusa Perla', category: 'Blusas', price: 22000, variants: { 'S::blanco': 2, 'M::blanco': 1 }, sizes: ['S', 'M'], colors: ['blanco'], active: true, image: 'https://x/2.jpg' },
    { id: 'c3', name: 'Pollera Sol', category: 'Polleras', price: 18000, stock: 0, sizes: ['M'], colors: [], active: false, image: '' },
];

describe('planearImportacion', () => {
    it('da de alta lo que no existe, siempre como borrador', () => {
        const plan = planearImportacion([{ Producto: 'Saco Luna', 'Precio venta': '$ 60.000', Stock: 4, Talles: 'S, M', Estado: 'Publicado' }], INVENTARIO);
        expect(plan.altas).toHaveLength(1);
        expect(plan.cambios).toHaveLength(0);
        expect(plan.altas[0].datos).toMatchObject({ name: 'Saco Luna', price: 60000, stock: 4, sizes: ['S', 'M'], active: false });
        expect(plan.altas[0].avisos.length).toBeGreaterThan(0);
    });

    it('actualiza sólo los campos que realmente cambian', () => {
        const plan = planearImportacion([{ Producto: 'Vestido Aurora', 'Precio venta': 49000, Stock: 3, Categoría: 'Vestidos' }], INVENTARIO);
        expect(plan.altas).toHaveLength(0);
        expect(plan.cambios).toHaveLength(1);
        expect(plan.cambios[0].campos).toEqual({ price: 49000 });
        expect(plan.cambios[0].id).toBe('a1');
    });

    it('una fila idéntica no genera ninguna escritura', () => {
        const plan = planearImportacion([{ Producto: 'Vestido Aurora', 'Precio venta': 45000, Stock: 3, Talles: 'S, M', Colores: 'negro', Estado: 'Publicado' }], INVENTARIO);
        expect(plan.cambios).toHaveLength(0);
        expect(plan.sinCambios).toBe(1);
    });

    it('no pisa el stock de un producto con variantes', () => {
        const plan = planearImportacion([{ Producto: 'Blusa Perla', Stock: 99 }], INVENTARIO);
        expect(plan.cambios).toHaveLength(0);
        expect(plan.sinCambios).toBe(1);
    });

    it('no publica un producto sin foto', () => {
        const plan = planearImportacion([{ Producto: 'Pollera Sol', Estado: 'Publicado' }], INVENTARIO);
        expect(plan.cambios).toHaveLength(0);
        expect(plan.sinCambios).toBe(1);
    });

    it('ignora mayúsculas y acentos al emparejar', () => {
        const plan = planearImportacion([{ Producto: '  vestido aurora ', 'Precio venta': 50000 }], INVENTARIO);
        expect(plan.cambios).toHaveLength(1);
        expect(plan.cambios[0].id).toBe('a1');
    });

    it('rechaza un producto nuevo sin precio', () => {
        const plan = planearImportacion([{ Producto: 'Saco Luna', Stock: 4 }], INVENTARIO);
        expect(plan.altas).toHaveLength(0);
        expect(plan.errores[0].motivo).toMatch(/sin precio/i);
    });

    it('rechaza stock negativo o roto y nombres repetidos', () => {
        const plan = planearImportacion([
            { Producto: 'Vestido Aurora', Stock: -2 },
            { Producto: 'Pollera Sol', Stock: 1 },
            { Producto: 'pollera sol', Stock: 5 },
        ], INVENTARIO);
        expect(plan.errores).toHaveLength(2);
        expect(plan.errores[1].motivo).toMatch(/repetido/i);
    });

    it('salta las filas vacías sin marcarlas como error', () => {
        const plan = planearImportacion([{ Producto: '', 'Precio venta': '' }, {}], INVENTARIO);
        expect(plan.errores).toHaveLength(0);
        expect(plan.altas).toHaveLength(0);
    });

    it('no toca nada cuando dos productos comparten nombre', () => {
        const inv = [...INVENTARIO, { id: 'd4', name: 'Vestido Aurora', price: 1, stock: 1 }];
        const plan = planearImportacion([{ Producto: 'Vestido Aurora', 'Precio venta': 99000 }], inv);
        expect(plan.cambios).toHaveLength(0);
        expect(plan.errores[0].motivo).toMatch(/más de un producto/i);
    });
});
