import React, { useState } from 'react';
import { optimizeImage } from '../../utils/helpers';

export const LazyImage = ({
    src,
    alt = '',
    width = 800,
    className = '',
    imgClassName = '',
    sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
    fetchPriority = 'auto',
    onClick,
    // Avisa al padre la proporcion REAL del archivo. Lo usa useMarcoFoto para
    // elegir el marco: el catalogo mezcla prendas en plancha (cuadradas) con
    // fotos de modelo de cuerpo entero (verticales) y un marco unico recorta
    // mal a uno de los dos.
    onNaturalSize
}) => {
    const [loaded, setLoaded] = useState(false);

    if (!src) {
        return (
            <div
                className={`bg-slate-100 dark:bg-slate-800 ${className}`}
                aria-label={alt}
                onClick={onClick}
            />
        );
    }

    const optimized = optimizeImage(src, width);
    const srcSet = [320, 480, 640, 800, 1200]
        .map((w) => `${optimizeImage(src, w)} ${w}w`)
        .join(', ');

    return (
        <div
            className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}
            onClick={onClick}
        >
            {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
            )}
            <img
                src={optimized}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={fetchPriority}
                onLoad={(e) => {
                    setLoaded(true);
                    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                    if (w && h) onNaturalSize?.(w, h);
                }}
                className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
            />
        </div>
    );
};
