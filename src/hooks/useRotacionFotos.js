import { useEffect, useState } from 'react';

// Las publicaciones traen frente y espalda: la foto principal pasa sola de una
// a otra con un fundido lento (pedido del dueño, 1/11/2026). Apenas la clienta
// toca una flecha o una miniatura deja de rotar: manda ella. Se pausa con el
// mouse encima, con la pestaña oculta o si la persona pidió menos movimiento.
export const PASO_FOTOS_MS = 5500;

export const useRotacionFotos = (cantidad, { clave, activa = true } = {}) => {
    const [indice, setIndice] = useState(0);
    const [manual, setManual] = useState(false);
    const [encima, setEncima] = useState(false);
    const [vuelta, setVuelta] = useState(0);

    useEffect(() => {
        setIndice(0);
        setManual(false);
    }, [clave]);

    const reducido = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const rota = activa && cantidad > 1 && !manual && !encima && !reducido;

    useEffect(() => {
        if (!rota) return undefined;
        const id = setTimeout(() => {
            if (!document.hidden) setIndice((i) => (i + 1) % cantidad);
            setVuelta((v) => v + 1);
        }, PASO_FOTOS_MS);
        return () => clearTimeout(id);
    }, [rota, cantidad, vuelta]);

    const elegir = (i) => {
        setManual(true);
        setIndice(i);
    };

    return {
        indice: Math.min(indice, Math.max(cantidad - 1, 0)),
        elegir,
        rota,
        vuelta,
        alEntrar: () => setEncima(true),
        alSalir: () => setEncima(false),
    };
};
