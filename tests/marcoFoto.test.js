import { describe, it, expect } from 'vitest';
import { marcoParaRatio } from '../src/utils/marcoFoto';

// Los ratios son MEDIDOS sobre archivos reales del dueño, no inventados:
//  · prenda en plancha  -> 1280x1280 (1,0000)
//  · modelo cuerpo entero -> 841x1264 (0,6653)
describe('marcoParaRatio', () => {
    it('manda la prenda cuadrada a 4:5 (el maximo que aguanta sin comerse la prenda)', () => {
        expect(marcoParaRatio(1280 / 1280)).toBe('aspect-[4/5]');
    });

    it('manda la foto de modelo 841x1264 a 2:3 y NO a 4:5 (4:5 le cortaria 16,8% del alto)', () => {
        expect(marcoParaRatio(841 / 1264)).toBe('aspect-[2/3]');
    });

    it('una vertical suave (3:4) cae en su propio carril', () => {
        expect(marcoParaRatio(3 / 4)).toBe('aspect-[3/4]');
    });

    it('una foto apaisada no rompe: cae en el carril mas ancho', () => {
        expect(marcoParaRatio(16 / 9)).toBe('aspect-[4/5]');
    });

    it('un ratio invalido no revienta', () => {
        expect(marcoParaRatio(0)).toBe('aspect-[2/3]');
    });
});
