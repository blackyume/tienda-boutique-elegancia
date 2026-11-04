import React, { useEffect, useState } from 'react';

// El único "cargando" de la tienda: el logo respirando y un hilo dorado que
// corre debajo, el mismo lenguaje que la pantalla de entrada de index.html, en
// dos tamaños. No hay spinners genéricos ni varios estilos: una marca, un gesto.

const LOGO = '/assets/logo-main.png?v=5';

export const LogoCargando = ({ chico = false, texto }) => {
    const ancho = chico ? 150 : 240;
    return (
        <div className="flex flex-col items-center gap-5" role="status" aria-label="Cargando">
            <img src={LOGO} alt="" width={ancho} className="max-w-none animate-respirar" style={{ width: ancho }} />
            <div className="hilo-cargando" style={{ width: chico ? 72 : 110 }} />
            {texto && <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-[#E8C65E]/70">{texto}</span>}
        </div>
    );
};

/**
 * Lo que se ve mientras baja el código de una sección la primera vez. Espera
 * 200 ms antes de aparecer: si el trozo ya estaba en caché no parpadea nada.
 */
export const CargandoRuta = () => {
    const [ver, setVer] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVer(true), 200);
        return () => clearTimeout(t);
    }, []);
    return (
        // min-h-screen, no 50vh: con media pantalla el pie de pagina quedaba a la
        // vista mientras bajaba el trozo JS de la ruta, y al llegar la pagina lo
        // empujaba (CLS 0,5 en la tienda). A pantalla entera el pie arranca abajo.
        <div className="min-h-screen flex items-center justify-center">
            {ver && <div className="animate-pagina-entra"><LogoCargando chico /></div>}
        </div>
    );
};

/** Saca la pantalla de entrada de index.html con un fundido. Idempotente. */
export const ocultarPantallaDeEntrada = () => {
    const el = document.getElementById('loadingScreen');
    if (!el || el.dataset.saliendo) return;
    el.dataset.saliendo = '1';
    requestAnimationFrame(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    });
};
