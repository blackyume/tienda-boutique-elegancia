import { lazy } from 'react';

const MARCA = 'lbe_recarga_por_chunk';

/**
 * lazy() que sobrevive a un deploy hecho mientras la clienta navegaba.
 *
 * El problema: cada build genera nombres nuevos (Shop-CPYPw54A.js ->
 * Shop-BLMrzAs8.js). Quien ya tenía la página abierta conserva el index.html
 * viejo, y al entrar a una sección pide un archivo que ya no está. Firebase
 * reescribe TODO lo que falta al index.html, así que el navegador recibe HTML
 * donde esperaba JavaScript y muestra "Ha ocurrido un error crítico".
 *
 * La cura es recargar una sola vez: el index.html se sirve con no-cache, así
 * que al volver ya trae los nombres nuevos. La marca en sessionStorage evita
 * el bucle infinito si la falla fuera de verdad (sin internet, por ejemplo).
 */
export const lazyConReintento = (importar) =>
    lazy(() =>
        importar().catch((error) => {
            const yaRecargamos = sessionStorage.getItem(MARCA);
            if (!yaRecargamos) {
                sessionStorage.setItem(MARCA, '1');
                window.location.reload();
                // Promesa que nunca resuelve: la página se está recargando y no
                // queremos que React pinte el error en el parpadeo previo.
                return new Promise(() => { });
            }
            throw error;
        })
    );

// Al cargar bien una sección, la marca se limpia: si más adelante hay otro
// deploy en la misma pestaña, el reintento vuelve a estar disponible.
export const limpiarMarcaDeRecarga = () => {
    try { sessionStorage.removeItem(MARCA); } catch { /* noop */ }
};
