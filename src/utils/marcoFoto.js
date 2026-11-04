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
    { min: 0.00, clase: 'aspect-[2/3]' },  // modelo de cuerpo entero
];

const PROPORCIONES = { 'aspect-[4/5]': 4 / 5, 'aspect-[3/4]': 3 / 4, 'aspect-[2/3]': 2 / 3 };

// La misma proporción en número, para calcular el ancho desde el alto de la pantalla.
export const proporcionDelMarco = (clase) => PROPORCIONES[clase] || 2 / 3;

export const marcoParaRatio = (ratio) =>
    (CARRILES.find((c) => ratio >= c.min) || CARRILES[CARRILES.length - 1]).clase;

// Arranca en 2:3 (desde el 1/11/2026 todo el catálogo es foto de modelo de
// cuerpo entero) y se corrige solo cuando la foto informa su proporción.
export const useMarcoFoto = (inicial = 'aspect-[2/3]') => {
    const [marco, setMarco] = useState(inicial);
    const onNaturalSize = useCallback((w, h) => {
        if (w > 0 && h > 0) setMarco(marcoParaRatio(w / h));
    }, []);
    return [marco, onNaturalSize];
};
