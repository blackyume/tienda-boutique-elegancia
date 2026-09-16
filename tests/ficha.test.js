import { describe, it, expect } from 'vitest';
import { normalizarCuidados, tablaDeMedidas, interpretarMedidas, detallesPorPlantilla, revisarFicha, mejorBorrador } from '../src/utils/ficha';

const inventario = [
    { id: 'v1', name: 'VESTIDO LINO BLANCO', sizes: ['S', 'M', 'L'], measurements: { M: { busto: 92, largo: 88 }, S: { busto: 88 } } },
    { id: 't1', name: 'TOP RIB', sizes: ['Único'] },
];

describe('cuidados', () => {
    it('acepta ids, etiquetas y frases sueltas', () => {
        expect(normalizarCuidados(['mano', 'No usar secadora', 'lavar con agua fría', 'sin cloro', 'mano'])).toEqual(['mano', 'sin-secadora', 'fria', 'sin-lavandina']);
        expect(normalizarCuidados('lavar a mano, no planchar')).toEqual(['mano', 'sin-plancha']);
        expect(normalizarCuidados(['cualquier cosa'])).toEqual([]);
    });
});

describe('medidas', () => {
    it('tabla ordenada por los talles del producto, sólo columnas usadas', () => {
        const t = tablaDeMedidas(inventario[0]);
        expect(t.columnas.map(([k]) => k)).toEqual(['busto', 'largo']);
        expect(t.filas).toEqual([['S', { busto: 88 }], ['M', { busto: 92, largo: 88 }]]);
        expect(tablaDeMedidas(inventario[1])).toBeNull();
    });
    it('"el vestido lino talle M mide 92 de busto y 88 de largo"', () => {
        const r = interpretarMedidas('el vestido lino talle M mide 92 de busto y 88 de largo', inventario);
        expect(r.productos.map((p) => p.id)).toEqual(['v1']);
        expect(r.talle).toBe('M');
        expect(r.medidas).toEqual({ busto: 92, largo: 88 });
    });
    it('"vestido lino t38: cintura 70, cadera 98 cm"', () => {
        const r = interpretarMedidas('vestido lino t38: cintura 70, cadera 98 cm', inventario);
        expect(r.talle).toBe('38');
        expect(r.medidas).toEqual({ cintura: 70, cadera: 98 });
    });
    it('no se mete con preguntas ni con frases sin medidas', () => {
        expect(interpretarMedidas('¿cuánto mide el vestido?', inventario)).toBeNull();
        expect(interpretarMedidas('vendí el vestido lino talle M', inventario)).toBeNull();
    });
});

describe('detalles por plantilla', () => {
    it('sólo con datos reales, hasta 5 líneas', () => {
        const d = detallesPorPlantilla({ material: 'Lino 100%', colors: ['Blanco', 'Beige'], sizes: ['S', 'M', 'L'], care: ['mano', 'sombra'], measurements: { M: { busto: 92 } } });
        expect(d.split('\n')).toEqual([
            'Composición: Lino 100%',
            'Disponible en Blanco y Beige',
            'Talles: S, M, L',
            'Cuidados: lavar a mano y secar a la sombra',
            'Medidas por talle en la guía de talles',
        ]);
    });
    it('talle único y sin nada', () => {
        expect(detallesPorPlantilla({ sizes: ['Único'], colors: ['Negro'] })).toBe('Color: Negro\nTalle único');
        expect(detallesPorPlantilla({})).toBe('');
    });
});

describe('revisar ficha', () => {
    it('marca lo que falta y sugiere borrador si es grave', () => {
        const a = revisarFicha({ name: 'X', price: 1000, stock: 2, sizes: ['M'], category: 'Tops', description: 'hola', cost: 500, images: ['a', 'b'], material: 'algodón' });
        expect(a).toEqual([]);
        const b = revisarFicha({ name: 'X', price: 1000, stock: 0, sizes: [], images: [] });
        expect(b.map((x) => x.nivel)).toContain('alto');
        expect(mejorBorrador(b)).toBe(true);
        expect(mejorBorrador(revisarFicha({ name: 'X', price: 1, image: 'a', stock: 1, sizes: ['M'] }))).toBe(false);
    });
    it('cuenta el stock por variantes', () => {
        expect(revisarFicha({ name: 'X', price: 1, image: 'a', sizes: ['M'], variants: { 'M::Rojo': 2 } }).some((x) => /Stock 0/.test(x.texto))).toBe(false);
        expect(revisarFicha({ name: 'X', price: 1, image: 'a', sizes: ['M'], variants: [{ size: 'M', color: 'Rojo', stock: 0 }] }).some((x) => /Stock 0/.test(x.texto))).toBe(true);
    });
});
