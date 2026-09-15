import { describe, it, expect } from 'vitest';
import { interpretarCambioDeFoto, patchDeFotos } from '../src/utils/fotos';

const inventario = [
    { id: 'j1', name: 'JEANS ELASTIZADO OXFORD', image: 'a.jpg' },
    { id: 'j2', name: 'JEANS ELASTIZADO CHUPIN', image: 'b.jpg' },
    { id: 't1', name: 'TOP COLA RATON MORLEY RIB VERANO', image: 'c.jpg', images: ['c.jpg', 'c2.jpg'], media: [{ type: 'image', url: 'c.jpg' }, { type: 'image', url: 'c2.jpg' }, { type: 'video', url: 'v.mp4' }] },
];

describe('interpretarCambioDeFoto', () => {
    it('entiende "cambiá la foto del ..." y encuentra el producto', () => {
        const r = interpretarCambioDeFoto('Cambiá la foto del jean oxford', inventario);
        expect(r.modo).toBe('reemplazar');
        expect(r.productos.map(p => p.id)).toEqual(['j1']);
    });

    it('distingue agregar de reemplazar', () => {
        expect(interpretarCambioDeFoto('agregale esta foto al top rib', inventario)).toMatchObject({ modo: 'agregar', productos: [{ id: 't1' }] });
        expect(interpretarCambioDeFoto('sumale otra foto al top rib verano', inventario).modo).toBe('agregar');
        expect(interpretarCambioDeFoto('reemplazá la foto del chupin por esta', inventario)).toMatchObject({ modo: 'reemplazar', productos: [{ id: 'j2' }] });
        expect(interpretarCambioDeFoto('esta es la foto nueva del jean chupin', inventario).productos[0].id).toBe('j2');
    });

    it('devuelve varios candidatos si el nombre es ambiguo, y el botón con comillas resuelve uno', () => {
        const r = interpretarCambioDeFoto('cambiale la foto al jean', inventario);
        expect(r.productos).toHaveLength(2);
        expect(interpretarCambioDeFoto('Cambiá la foto de "JEANS ELASTIZADO CHUPIN"', inventario).productos.map(p => p.id)).toEqual(['j2']);
        expect(interpretarCambioDeFoto('Agregale la foto a "JEANS ELASTIZADO OXFORD"', inventario)).toMatchObject({ modo: 'agregar', productos: [{ id: 'j1' }] });
    });

    it('ignora frases que no hablan de fotos', () => {
        expect(interpretarCambioDeFoto('cambiale el precio al jean oxford a 48000', inventario)).toBeNull();
        expect(interpretarCambioDeFoto('cuánto queda del jean oxford', inventario)).toBeNull();
        expect(interpretarCambioDeFoto('', inventario)).toBeNull();
    });
});

describe('patchDeFotos', () => {
    it('reemplazar: las nuevas quedan como únicas fotos, los videos se conservan', () => {
        const p = patchDeFotos(inventario[2], ['n1.jpg', 'n2.jpg', 'n1.jpg'], 'reemplazar');
        expect(p.image).toBe('n1.jpg');
        expect(p.images).toEqual(['n1.jpg', 'n2.jpg']);
        expect(p.media).toEqual([{ type: 'image', url: 'n1.jpg' }, { type: 'image', url: 'n2.jpg' }, { type: 'video', url: 'v.mp4' }]);
    });

    it('agregar: suma al final sin tocar la principal', () => {
        const p = patchDeFotos(inventario[2], ['n1.jpg', 'c2.jpg'], 'agregar');
        expect(p.image).toBe('c.jpg');
        expect(p.images).toEqual(['c.jpg', 'c2.jpg', 'n1.jpg']);
    });

    it('agregar a un producto con una sola foto legacy (sin images)', () => {
        const p = patchDeFotos(inventario[0], ['n1.jpg'], 'agregar');
        expect(p.images).toEqual(['a.jpg', 'n1.jpg']);
        expect(p.image).toBe('a.jpg');
    });

    it('sin urls no hay parche', () => {
        expect(patchDeFotos(inventario[0], [], 'reemplazar')).toBeNull();
    });
});
