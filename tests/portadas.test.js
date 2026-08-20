import { describe, it, expect } from 'vitest';
import { armarSlides, rota, PORTADAS_PROPIAS } from '../src/utils/portadas';

describe('armarSlides', () => {
    it('sin configuración devuelve las portadas propias', () => {
        expect(armarSlides(undefined)).toEqual(PORTADAS_PROPIAS);
        expect(armarSlides({})).toEqual(PORTADAS_PROPIAS);
    });

    it('una foto de Unsplash no cuenta como portada configurada', () => {
        const cfg = { hero: { image: 'https://images.unsplash.com/photo-123' } };
        expect(armarSlides(cfg)).toEqual(PORTADAS_PROPIAS);
    });

    it('respeta una sola imagen cargada a mano en el CMS', () => {
        const cfg = { hero: { image: 'https://res.cloudinary.com/x/hero.jpg' } };
        const s = armarSlides(cfg);
        expect(s).toHaveLength(1);
        expect(s[0].escritorio).toBe('https://res.cloudinary.com/x/hero.jpg');
        expect(s[0].telefono).toBe('https://res.cloudinary.com/x/hero.jpg');
    });

    it('toma la lista del CMS, sea de textos o de objetos', () => {
        const cfg = {
            hero: {
                image: 'https://res.cloudinary.com/x/vieja.jpg',
                slides: [
                    'https://res.cloudinary.com/x/a.jpg',
                    { escritorio: '/b.webp', telefono: '/b-sm.webp' },
                ],
            },
        };
        const s = armarSlides(cfg);
        expect(s).toHaveLength(2);
        expect(s[0]).toEqual({
            escritorio: 'https://res.cloudinary.com/x/a.jpg',
            telefono: 'https://res.cloudinary.com/x/a.jpg',
            respaldo: 'https://res.cloudinary.com/x/a.jpg',
        });
        expect(s[1].telefono).toBe('/b-sm.webp');
        expect(s[1].respaldo).toBe('/b.webp');
    });

    it('descarta entradas vacías y no se queda sin portada', () => {
        expect(armarSlides({ hero: { slides: ['', '   ', null, {}] } })).toEqual(PORTADAS_PROPIAS);
    });

    it('rota sólo con más de una', () => {
        expect(rota(PORTADAS_PROPIAS)).toBe(true);
        expect(rota([PORTADAS_PROPIAS[0]])).toBe(false);
        expect(rota(undefined)).toBe(false);
    });
});
