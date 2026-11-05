import { describe, it, expect } from 'vitest';
import { avisoDeNovedades, prendasNuevas } from '../src/utils/novedades';

const AHORA = Date.UTC(2026, 10, 4);
const DIA = 24 * 60 * 60 * 1000;
const prenda = (id, diasAtras, extra = {}) => ({ id, name: `PRENDA ${id}`, stock: 2, image: `${id}.jpg`, createdAt: AHORA - diasAtras * DIA, ...extra });

describe('prendasNuevas', () => {
    it('trae sólo lo cargado después de la fecha, lo último primero', () => {
        const lista = [prenda('vieja', 30), prenda('a', 5), prenda('b', 1)];
        expect(prendasNuevas(lista, AHORA - 10 * DIA).map((p) => p.id)).toEqual(['b', 'a']);
    });
    it('no avisa de prendas ocultas ni agotadas', () => {
        const lista = [prenda('oculta', 1, { active: false }), prenda('agotada', 1, { stock: 0 })];
        expect(prendasNuevas(lista, 0)).toEqual([]);
    });
    it('una prenda sin fecha no cuenta como nueva', () => {
        expect(prendasNuevas([{ id: 'x', stock: 1 }], 0)).toEqual([]);
    });
});

describe('avisoDeNovedades', () => {
    it('sin novedades no hay cartel', () => {
        expect(avisoDeNovedades({ inventory: [prenda('a', 60)], ahora: AHORA })).toBeNull();
    });
    it('quien entra por primera vez ve lo de las últimas dos semanas', () => {
        const a = avisoDeNovedades({ inventory: [prenda('a', 3), prenda('b', 20)], ahora: AHORA });
        expect(a.enlace).toBe('/product/a');
        expect(a.boton).toBe('Verla');
    });
    it('quien volvió ve lo cargado desde su última visita', () => {
        const a = avisoDeNovedades({ inventory: [prenda('a', 40), prenda('b', 35), prenda('c', 90)], vista: AHORA - 50 * DIA, ahora: AHORA });
        expect(a.titulo).toBe('2 prendas nuevas');
        expect(a.texto).toBe('Desde tu última visita');
        expect(a.enlace).toBe('/shop?sort=newest');
    });
    it('el aviso del panel manda sobre las prendas', () => {
        const novedad = { activo: true, id: '7', titulo: 'Cambian los envíos', enlace: '/envios' };
        const a = avisoDeNovedades({ inventory: [prenda('a', 1)], novedad, ahora: AHORA });
        expect(a.tipo).toBe('tienda');
        expect(a.boton).toBe('Ver envíos');
    });
    it('el aviso cerrado deja pasar a las prendas', () => {
        const novedad = { activo: true, id: '7', titulo: 'Hola' };
        expect(avisoDeNovedades({ inventory: [prenda('a', 1)], novedad, cerrado: '7', ahora: AHORA }).tipo).toBe('prendas');
    });
    it('un aviso apagado o sin título no se muestra', () => {
        expect(avisoDeNovedades({ inventory: [], novedad: { activo: false, id: '1', titulo: 'x' }, ahora: AHORA })).toBeNull();
        expect(avisoDeNovedades({ inventory: [], novedad: { activo: true, id: '1', titulo: '  ' }, ahora: AHORA })).toBeNull();
    });
    it('un destino desconocido queda sin botón', () => {
        const a = avisoDeNovedades({ inventory: [], novedad: { activo: true, id: '1', titulo: 'x', enlace: 'https://otro.sitio' }, ahora: AHORA });
        expect(a.boton).toBe('');
        expect(a.enlace).toBe('');
    });
});
