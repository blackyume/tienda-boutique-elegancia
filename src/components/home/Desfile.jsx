import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DESFILE } from '../../utils/portadas';

// El desfile de la portada en escritorio (pedido del dueño, 24/11/2026): la
// puerta art déco del fondo se abre, la modelo sale caminando hasta su lugar,
// la puerta se cierra; posa; la puerta se vuelve a abrir, ella entra y sale la
// siguiente con otra prenda. Cada tramo es un video de Flow cuyo primer y
// último cuadro coinciden con el del tramo vecino (la escena vacía o la pose),
// así que se empalman sin corte.
//
// Dos cuidados:
//  1. Arranca en la POSE de la primera modelo, que es la misma foto del LCP:
//     la primera pintura no espera a ningún video.
//  2. El tramo siguiente se monta oculto mientras corre el actual, para que
//     ya esté descargado cuando le toque.

const PAUSA_FOTO_MS = 8000;

const armarTramos = (modelos) => modelos.flatMap((m, i) => [
    { clave: `pose-${i}`, video: m.pose, foto: m.foto },
    { clave: `entra-${i}`, video: m.entra },
    { clave: `sale-${(i + 1) % modelos.length}`, video: modelos[(i + 1) % modelos.length].sale },
]);

const CLASE = 'absolute inset-0 h-full object-cover object-center portada-propia lg:left-auto lg:w-auto lg:max-w-none';

const Tramo = ({ tramo, visible, alTerminar }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!visible) return undefined;
        const v = ref.current;
        if (tramo.video && v) {
            v.currentTime = 0;
            v.play?.().catch(() => alTerminar());
            return undefined;
        }
        const id = setTimeout(alTerminar, PAUSA_FOTO_MS);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const estilo = { aspectRatio: '16 / 9', zIndex: visible ? 3 : 2, opacity: visible ? 1 : 0 };
    if (!tramo.video) {
        return <img src={tramo.foto} alt="" aria-hidden="true" className={CLASE} style={estilo} />;
    }
    return (
        <video
            ref={ref}
            src={tramo.video}
            poster={tramo.foto}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onEnded={alTerminar}
            className={CLASE}
            style={estilo}
        />
    );
};

export const Desfile = ({ alCambiar }) => {
    const tramos = useMemo(() => armarTramos(DESFILE.modelos), []);
    const [paso, setPaso] = useState(0);
    const actual = tramos[paso % tramos.length];
    const siguiente = tramos[(paso + 1) % tramos.length];
    useEffect(() => { alCambiar?.(actual.clave); }, [actual.clave, alCambiar]);

    const avanzar = () => setPaso((p) => p + 1);

    return (
        <>
            {/* La foto de la primera pose queda siempre debajo: es el LCP y tapa
                cualquier cuadro en negro mientras carga un video. */}
            <img
                src={DESFILE.modelos[0].foto}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                className={CLASE}
                style={{ aspectRatio: '16 / 9', zIndex: 1 }}
            />
            <Tramo key={`${paso}-${actual.clave}`} tramo={actual} visible alTerminar={avanzar} />
            {siguiente.clave !== actual.clave && (
                <Tramo key={`${paso + 1}-${siguiente.clave}`} tramo={siguiente} visible={false} alTerminar={() => {}} />
            )}
            {actual.clave.startsWith('pose') && (
                <span key={`luz-${paso}`} aria-hidden="true" className="portada-luz tras-puertas" style={{ zIndex: 4 }} />
            )}
        </>
    );
};

export default Desfile;
