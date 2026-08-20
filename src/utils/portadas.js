// Las portadas del hero.
//
// Cada portada viene en dos archivos y no en uno solo con `srcSet`: la foto de
// modelo es vertical (2:3) y el hero es apaisado, asi que la de escritorio se
// arma extendiendo el dorado a los costados y la del telefono lleva la foto
// casi entera. Con un srcSet por ancho el telefono elegia la apaisada
// (390 px x DPR 3 = 1170 > 760) y se comia a la modelo. Se generan con
// `scripts/armar-portada.py`.

import { PORTADA_PROPIA, resolveHeroImage } from './helpers';

export const PORTADAS_PROPIAS = [
    { escritorio: '/portada-modelo.webp', telefono: '/portada-modelo-sm.webp', respaldo: '/portada-modelo.jpg' },
    { escritorio: '/portada-modelo-2.webp', telefono: '/portada-modelo-2-sm.webp', respaldo: '/portada-modelo-2.jpg' },
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
