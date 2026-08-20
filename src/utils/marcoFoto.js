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

export const marcoParaRatio = (ratio) =>
    (CARRILES.find((c) => ratio >= c.min) || CARRILES[CARRILES.length - 1]).clase;

// Arranca en 4:5 (el más conservador: es lo que hay cargado hoy) y se corrige
// solo cuando la foto informa que es vertical.
export const useMarcoFoto = (inicial = 'aspect-[4/5]') => {
    const [marco, setMarco] = useState(inicial);
    const onNaturalSize = useCallback((w, h) => {
        if (w > 0 && h > 0) setMarco(marcoParaRatio(w / h));
    }, []);
    return [marco, onNaturalSize];
};
