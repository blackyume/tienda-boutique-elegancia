import { describe, it, expect } from 'vitest';
import { tituloDeProducto } from '../src/utils/nombres';

describe('tituloDeProducto', () => {
    it('pasa los nombres en mayúsculas a frase con mayúscula inicial', () => {
        expect(tituloDeProducto('JEANS ELASTIZADO OXFORD')).toBe('Jeans elastizado Oxford');
        expect(tituloDeProducto('GAMULAN FORRADO CON CORDERITO')).toBe('Gamulan forrado con corderito');
        expect(tituloDeProducto('TOP COLA RATON MORLEY RIB VERANO')).toBe('Top cola raton Morley rib verano');
    });

    it('respeta talles y siglas', () => {
        expect(tituloDeProducto('REMERA BÁSICA XL')).toBe('Remera básica XL');
    });

    it('deja igual un nombre escrito con criterio', () => {
        expect(tituloDeProducto('Top Rib Verano')).toBe('Top Rib Verano');
        expect(tituloDeProducto('Camisa Oxford celeste')).toBe('Camisa Oxford celeste');
    });

    it('limpia espacios y aguanta vacío', () => {
        expect(tituloDeProducto('  SWEATER   LANILLA ')).toBe('Sweater lanilla');
        expect(tituloDeProducto('')).toBe('');
        expect(tituloDeProducto(null)).toBe('');
    });
});
