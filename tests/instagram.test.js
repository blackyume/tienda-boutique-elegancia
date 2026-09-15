import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { captionDeProducto, fotoDeProducto } from '../src/utils/instagram';

const require = createRequire(import.meta.url);
const { imagenParaInstagram, firma } = require('../api/_instagram');

const jean = {
    name: 'Jean Oxford Tiro Alto',
    description: 'Denim rígido,   cintura alta,\npierna ancha.',
    price: 45900,
    sizes: ['36', '38', '40'],
    category: 'Jeans & Pantalones',
    image: 'https://res.cloudinary.com/dx/image/upload/v1/prod/jean.webp',
};

describe('captionDeProducto', () => {
    it('arma nombre, descripción, precio, talles, tienda y hashtags', () => {
        const c = captionDeProducto(jean);
        expect(c).toContain('✨ Jean Oxford Tiro Alto');
        expect(c).toContain('Denim rígido, cintura alta, pierna ancha.');
        expect(c).toContain('💰 $45.900');
        expect(c).toContain('📏 Talles: 36 · 38 · 40');
        expect(c).toContain('la-boutique-de-la-elegancia.web.app (link en la bio)');
        expect(c).toContain('#LaBoutiqueDeLaElegancia #Rafaela #ModaFemenina #JeansPantalones');
    });

    it('con el texto del dueño lo usa tal cual y deja precio y hashtags abajo', () => {
        const c = captionDeProducto(jean, { extra: 'Llegó el jean que esperabas 🖤' });
        expect(c.startsWith('Llegó el jean que esperabas 🖤')).toBe(true);
        expect(c).not.toContain('✨');
        expect(c).not.toContain('Denim');
        expect(c).toContain('💰 $45.900');
    });

    it('muestra el precio anterior tachado en texto si hay oferta', () => {
        expect(captionDeProducto({ ...jean, originalPrice: 52000 })).toContain('💰 $45.900 (antes $52.000)');
    });

    it('recorta descripciones largas y nunca pasa los 2200 caracteres', () => {
        const larga = { ...jean, description: 'palabra '.repeat(600) };
        const c = captionDeProducto(larga);
        expect(c.length).toBeLessThanOrEqual(2200);
        expect(c).toContain('…');
    });

    it('sin talles ni precio no deja renglones vacíos', () => {
        const c = captionDeProducto({ name: 'Cartera', category: '' });
        expect(c).toContain('✨ Cartera');
        expect(c).not.toContain('💰');
        expect(c).not.toContain('📏');
        expect(c).not.toMatch(/\n{3,}/);
    });
});

describe('fotoDeProducto', () => {
    it('prefiere image y cae a la primera de images', () => {
        expect(fotoDeProducto(jean)).toBe(jean.image);
        expect(fotoDeProducto({ images: ['a.jpg', 'b.jpg'] })).toBe('a.jpg');
        expect(fotoDeProducto({})).toBe('');
    });
});

describe('imagenParaInstagram (servidor)', () => {
    it('pide a Cloudinary JPEG 4:5 y pisa transformaciones previas', () => {
        expect(imagenParaInstagram('https://res.cloudinary.com/dx/image/upload/v1/prod/a.webp'))
            .toBe('https://res.cloudinary.com/dx/image/upload/c_fill,ar_4:5,g_auto,f_jpg,q_auto:good,w_1080/v1/prod/a.webp');
        expect(imagenParaInstagram('https://res.cloudinary.com/dx/image/upload/f_auto,q_auto,w_600/v1/prod/a.webp'))
            .toBe('https://res.cloudinary.com/dx/image/upload/c_fill,ar_4:5,g_auto,f_jpg,q_auto:good,w_1080/v1/prod/a.webp');
    });

    it('deja igual las fotos que no son de Cloudinary', () => {
        expect(imagenParaInstagram('https://otro.com/foto.png')).toBe('https://otro.com/foto.png');
    });

    it('la firma de una llave son sus últimos 16 caracteres', () => {
        expect(firma('IGAAR7abcdefghijklmnop')).toBe('7abcdefghijklmnop'.slice(-16));
        expect(firma('')).toBe('');
    });
});
