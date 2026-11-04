// Las portadas del hero.
//
// Cada portada viene en dos archivos y no en uno solo con `srcSet`: la foto de
// modelo es vertical (2:3) y el hero es apaisado, asi que la de escritorio se
// arma extendiendo el dorado a los costados y la del telefono lleva la foto
// casi entera. Con un srcSet por ancho el telefono elegia la apaisada
// (390 px x DPR 3 = 1170 > 760) y se comia a la modelo. Se generan con
// `scripts/armar-portada.py`.

import { PORTADA_PROPIA, resolveHeroImage } from './helpers';

// Desde el 1/11/2026: collages del productor, tres modelos recortadas sobre un
// mismo fondo de estudio (una sola en el teléfono), siempre de cuerpo entero y
// con aire en los bordes, porque el zoom lento del hero come lo que toca el borde.
// Al cambiar una portada, cambiar el NOMBRE del archivo: el service worker y la
// CDN siguen sirviendo la vieja si el nombre es el mismo.
export const PORTADAS_PROPIAS = [
    { escritorio: '/portada-estudio-b1.webp', telefono: '/portada-estudio-b1-sm.webp', respaldo: '/portada-estudio-b1.jpg' },
    { escritorio: '/portada-estudio-b2.webp', telefono: '/portada-estudio-b2-sm.webp', respaldo: '/portada-estudio-b2.jpg' },
    { escritorio: '/portada-estudio-b3.webp', telefono: '/portada-estudio-b3-sm.webp', respaldo: '/portada-estudio-b3.jpg' },
];

const normalizar = (slide) => {
    if (typeof slide === 'string') {
        const url = slide.trim();
        return url ? { escritorio: url, telefono: url, respaldo: url } : null;
    }
    if (!slide || typeof slide !== 'object') return null;
    const escritorio = String(slide.escritorio || slide.image || slide.url || '').trim();
    if (!escritorio) return null;
    return {
        escritorio,
        telefono: String(slide.telefono || escritorio).trim(),
        respaldo: String(slide.respaldo || escritorio).trim(),
    };
};

// Devuelve SIEMPRE al menos una portada: el hero sin imagen no existe.
export const armarSlides = (siteConfig) => {
    const delCms = siteConfig?.hero?.slides;
    if (Array.isArray(delCms)) {
        const limpias = delCms.map(normalizar).filter(Boolean);
        if (limpias.length) return limpias;
    }
    // Compatibilidad: si alguien dejo una sola imagen cargada a mano, manda esa.
    const unica = resolveHeroImage(siteConfig);
    if (unica && unica !== PORTADA_PROPIA) return [normalizar(unica)];
    return PORTADAS_PROPIAS;
};

// El carrusel sólo tiene sentido con más de una foto.
export const rota = (slides) => Array.isArray(slides) && slides.length > 1;
