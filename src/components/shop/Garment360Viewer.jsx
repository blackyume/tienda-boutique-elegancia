import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, MoveHorizontal } from 'lucide-react';

// Visor de prenda híbrido:
//  - mode 'spin'  → set de N fotos girando: arrastrar para rotar 360°.
//  - mode 'flip'  → frente/dorso (2 fotos): gira sobre su eje (rotateY).
//  - mode 'static'→ una sola imagen.
// `mode` se deduce con getViewerMode(product, images).
export const getViewerMode = (product, images) => {
    const n = images?.length || 0;
    if (product?.spin360 && n >= 8) return 'spin';
    if (n >= 2) return 'flip';
    return 'static';
};

export const Garment360Viewer = ({ images = [], mode = 'static', alt = '', className = '' }) => {
    const frames = images.filter(Boolean);

    // --- preload (clave para que el giro sea fluido) ---
    useEffect(() => {
        frames.forEach((src) => { const i = new Image(); i.src = src; });
    }, [frames]);

    if (frames.length === 0) {
        return (
            <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 text-xs uppercase tracking-widest ${className}`}>
                Sin imagen
            </div>
        );
    }

    if (mode === 'static' || frames.length < 2) {
        return <img src={frames[0]} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
    }

    if (mode === 'spin') return <Spin360 frames={frames} alt={alt} className={className} />;
    return <FlipViewer front={frames[0]} back={frames[1]} alt={alt} className={className} />;
};

// ---------- FLIP frente / dorso con AUTO-GIRO en el eje Y ----------
const FlipViewer = ({ front, back, alt, className }) => {
    // Gira solo en loop; el usuario puede pausar (tocar) para mirar.
    const [paused, setPaused] = useState(false);

    return (
        <div
            className={`relative group select-none cursor-pointer overflow-hidden ${className}`}
            style={{ perspective: '1500px' }}
            onClick={() => setPaused((p) => !p)}
            title={paused ? 'Tocar para reanudar el giro' : 'Tocar para pausar'}
        >
            {/* Sombra de contacto en el piso (se estira/encoge con el giro) */}
            <div
                aria-hidden
                className={`pointer-events-none absolute bottom-3 left-1/2 w-2/3 h-5 rounded-[50%] blur-xl bg-black/70 animate-ground-shadow motion-reduce:animate-none ${paused ? '[animation-play-state:paused]' : ''} group-hover:[animation-play-state:paused]`}
            />

            <div
                className={`relative w-full h-full animate-spin-y motion-reduce:animate-none group-hover:[animation-play-state:paused] ${paused ? '[animation-play-state:paused]' : ''}`}
                style={{ transformStyle: 'preserve-3d', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.55))' }}
            >
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                    <img
                        src={front}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Sheen de satén que barre la tela */}
                    <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-sheen motion-reduce:hidden ${paused ? '[animation-play-state:paused]' : ''} group-hover:[animation-play-state:paused]`}
                        style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.5), rgba(252,246,186,0.35), transparent)' }}
                    />
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <img
                        src={back}
                        alt={`${alt} (dorso)`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-sheen motion-reduce:hidden ${paused ? '[animation-play-state:paused]' : ''} group-hover:[animation-play-state:paused]`}
                        style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.5), rgba(252,246,186,0.35), transparent)' }}
                    />
                </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur pointer-events-none">
                <RotateCcw className="w-3.5 h-3.5" />
                {paused ? 'Giro en pausa' : 'Girando — tocá para pausar'}
            </div>
        </div>
    );
};

// ---------- SPIN 360° (arrastrar para girar) ----------
const Spin360 = ({ frames, alt, className }) => {
    const [idx, setIdx] = useState(0);
    const drag = useRef(null);
    const [hintOn, setHintOn] = useState(true);

    const moveTo = useCallback((clientX) => {
        if (!drag.current) return;
        const { startX, startIdx, width } = drag.current;
        const delta = clientX - startX;
        const step = width / frames.length;
        let next = (startIdx + Math.round(delta / step)) % frames.length;
        if (next < 0) next += frames.length;
        setIdx(next);
    }, [frames.length]);

    const onDown = (e) => {
        setHintOn(false);
        const clientX = e.touches?.[0]?.clientX ?? e.clientX;
        drag.current = { startX: clientX, startIdx: idx, width: e.currentTarget.offsetWidth || 1 };
    };
    const onMove = (e) => {
        if (!drag.current) return;
        if (e.cancelable) e.preventDefault();
        moveTo(e.touches?.[0]?.clientX ?? e.clientX);
    };
    const onUp = () => { drag.current = null; };

    return (
        <div
            className={`relative select-none touch-none cursor-ew-resize ${className}`}
            onMouseDown={onDown}
            onMouseMove={(e) => drag.current && onMove(e)}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
        >
            {frames.map((src, i) => (
                <img
                    key={i}
                    src={src}
                    alt={i === 0 ? alt : ''}
                    draggable={false}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: i === idx ? 1 : 0 }}
                />
            ))}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur transition-opacity ${hintOn ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                <MoveHorizontal className="w-3.5 h-3.5" /> Arrastrá para girar
            </div>
        </div>
    );
};
