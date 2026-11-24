// Las portadas del hero.
//
// Cada portada viene en dos archivos y no en uno solo con `srcSet`: la foto de
// modelo es vertical (2:3) y el hero es apaisado, asi que la de escritorio se
// arma extendiendo el dorado a los costados y la del telefono lleva la foto
// casi entera. Con un srcSet por ancho el telefono elegia la apaisada
// (390 px x DPR 3 = 1170 > 760) y se comia a la modelo. Se generan con
// `scripts/armar-portada.py`.

import { PORTADA_PROPIA, resolveHeroImage } from './helpers';

// Desde el 23/11/2026: la brasilera de Flow sobre paneles art déco. Escritorio
// 16:9 con la modelo en el tercio derecho (la izquierda en penumbra, ahí va el
// texto); teléfono 9:16 con la cabeza al ~21 % para que el menú no la tape.
// Al cambiar una portada, cambiar el NOMBRE del archivo: el service worker y la
// CDN siguen sirviendo la vieja si el nombre es el mismo.
export const PORTADAS_PROPIAS = [
    { escritorio: '/portada-deco-1.webp', telefono: '/portada-deco-1-sm.webp', respaldo: '/portada-deco-1.jpg' },
    { escritorio: '/portada-deco-2.webp', telefono: '/portada-deco-2-sm.webp', respaldo: '/portada-deco-2.jpg' },
    { escritorio: '/portada-deco-3.webp', telefono: '/portada-deco-3-sm.webp', respaldo: '/portada-deco-3.jpg' },
];

// El desfile de escritorio (Desfile.jsx): cada modelo con su pose (foto y, si hay,
// video en el lugar), el video en que entra por la puerta y en el que sale.
// Los cuadros de los extremos coinciden: escena vacía o la pose.
export const DESFILE = {
    modelos: [
        { foto: '/portada-deco-1.webp', pose: '/desfile/gamulan-pose.mp4', entra: '/desfile/gamulan-entra.mp4', sale: '/desfile/gamulan-sale.mp4' },
        { foto: '/desfile/chocolate-pose.webp', entra: '/desfile/chocolate-entra.mp4', sale: '/desfile/chocolate-sale.mp4' },
    ],
};

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
