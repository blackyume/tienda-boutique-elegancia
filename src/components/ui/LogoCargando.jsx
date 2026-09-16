import React, { useEffect, useState } from 'react';

// El único "cargando" de la tienda: el logo respirando con su anillo dorado,
// el mismo lenguaje que la pantalla de entrada de index.html, en dos tamaños.
// No hay spinners genéricos ni varios estilos: una marca, un gesto.

const LOGO = '/assets/logo-main.png?v=5';

export const LogoCargando = ({ chico = false, texto }) => {
    const caja = chico ? 64 : 120;
    const ancho = chico ? 120 : 220;
    return (
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Cargando">
            <div className="relative flex items-center justify-center" style={{ width: caja, height: caja }}>
                <div className="absolute -inset-2 rounded-full border border-[#E8C65E]/15 animate-respirar" />
                {!chico && <div className="absolute -inset-5 rounded-full border border-[#E8C65E]/[0.06]" />}
                <img src={LOGO} alt="" width={ancho} className="relative z-10 max-w-none animate-respirar" style={{ width: ancho }} />
            </div>
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
        <div className="min-h-[50vh] flex items-center justify-center">
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
