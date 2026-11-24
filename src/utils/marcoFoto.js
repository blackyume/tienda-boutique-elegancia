import { useCallback, useState } from 'react';

// El catálogo mezcla dos tipos de foto y un marco único le pega mal a uno:
//
//   · prendas en plancha  -> cuadradas 1280x1280 (ratio 1,00). Un marco más
//     alto que 4:5 les come la prenda: el fondo sobra a los COSTADOS, no
//     arriba y abajo.
//   · modelo de cuerpo entero -> verticales (~2:3). Un marco 4:5 les corta
//     la cabeza o los pies.
//
// Se elige el carril por la proporción real del archivo, medida en el onLoad
// de la imagen. Los carriles son los que ya usa el diseño, no valores sueltos.
const CARRILES = [
    { min: 0.90, clase: 'aspect-[4/5]' },  // cuadrada o casi
    { min: 0.72, clase: 'aspect-[3/4]' },  // vertical suave
    { min: 0.62, clase: 'aspect-[2/3]' },  // modelo de cuerpo entero
    { min: 0.00, clase: 'aspect-[9/16]' }, // fondo oro de Flow (768x1376): en 2:3 perdía los pies
];

const PROPORCIONES = { 'aspect-[4/5]': 4 / 5, 'aspect-[3/4]': 3 / 4, 'aspect-[2/3]': 2 / 3, 'aspect-[9/16]': 9 / 16 };

// La misma proporción en número, para calcular el ancho desde el alto de la pantalla.
export const proporcionDelMarco = (clase) => PROPORCIONES[clase] || 2 / 3;

export const marcoParaRatio = (ratio) =>
    ratio > 0 ? CARRILES.find((c) => ratio >= c.min).clase : 'aspect-[2/3]';

// Arranca en 9:16 (desde el 23/11/2026 todo el catálogo es la modelo sobre
// fondo oro de Flow) y se corrige solo cuando la foto informa su proporción.
export const useMarcoFoto = (inicial = 'aspect-[9/16]') => {
    const [marco, setMarco] = useState(inicial);
    const onNaturalSize = useCallback((w, h) => {
        if (w > 0 && h > 0) setMarco(marcoParaRatio(w / h));
    }, []);
    return [marco, onNaturalSize];
};
