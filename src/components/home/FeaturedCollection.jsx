import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Eye } from 'lucide-react';
import { formatMoney, getColorHex, optimizeImage } from '../../utils/helpers';
import { Reveal } from '../ui/Reveal';

const HeroCard = ({ item, onQuickView }) => (
    <div
        onClick={() => onQuickView?.(item)}
        role="button"
        aria-label={`Vista rápida de ${item.name}`}
        className="group relative overflow-hidden cursor-pointer aspect-[4/5]"
        style={{ background: '#080808' }}
    >
        <img
            src={optimizeImage(item.image, 1200)}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-[1.05]"
        />

        {/* Gold border flash on hover */}
        <span className="absolute inset-0 z-10 pointer-events-none border border-cielo-gold/0 group-hover:border-cielo-gold/30 transition-all duration-700" />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Nuevo badge */}
        <div className="absolute top-5 left-5 z-20">
            <span className="inline-block px-3 py-1 text-[9px] uppercase tracking-[0.4em] font-bold border border-cielo-gold/60 text-cielo-gold bg-black/50 backdrop-blur-sm">
                Destacado
            </span>
        </div>

        {/* Quick view */}
        <button
            onClick={(e) => { e.stopPropagation(); onQuickView?.(item); }}
            className="absolute top-5 right-5 z-20 w-9 h-9 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:border-cielo-gold/60 hover:text-cielo-gold transition-all duration-300"
        >
            <Eye className="w-4 h-4" />
        </button>

        {/* Info */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-cielo-gold/70 mb-2 font-semibold">
                {item.category}
            </p>
            <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-3 line-clamp-2">
                {item.name}
            </h3>

            {/* Separator */}
            <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-cielo-gold/50" />
                <span className="text-xl md:text-2xl text-white font-light">
                    {formatMoney(item.price)}
                </span>
                {item.colors?.length > 0 && (
                    <div className="flex -space-x-1.5 ml-auto">
                        {item.colors.slice(0, 5).map(c => (
                            <span key={c} className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm" style={{ background: getColorHex(c, item.colorHex) }} />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <Link
                    to={`/product/${item.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-black text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                >
                    Comprar <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(item); }}
                    className="inline-flex items-center px-5 py-2.5 border border-white/25 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:border-cielo-gold/50 hover:text-cielo-gold transition-colors"
                >
                    Vista rápida
                </button>
            </div>
        </div>
    </div>
);

const SmallCard = ({ item, onQuickView }) => (
    <div
        onClick={() => onQuickView?.(item)}
        role="button"
        aria-label={`Vista rápida de ${item.name}`}
        className="group relative overflow-hidden cursor-pointer aspect-[4/5]"
        style={{ background: '#080808' }}
    >
        <img
            src={optimizeImage(item.image, 700)}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1.8s] ease-out group-hover:scale-[1.06]"
        />

        <span className="absolute inset-0 z-10 pointer-events-none border border-cielo-gold/0 group-hover:border-cielo-gold/25 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <button
            onClick={(e) => { e.stopPropagation(); onQuickView?.(item); }}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:border-cielo-gold/60 hover:text-cielo-gold transition-all duration-300"
        >
            <Eye className="w-3.5 h-3.5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-20 p-3 md:p-5">
            <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.35em] text-cielo-gold/70 mb-1 md:mb-1.5 font-semibold">{item.category}</p>
            <h3 className="font-serif text-sm md:text-lg text-white leading-snug mb-1.5 md:mb-2 line-clamp-2">{item.name}</h3>
            <div className="flex items-center justify-between">
                <span className="text-sm md:text-base text-white/90 font-light">{formatMoney(item.price)}</span>
                {item.colors?.length > 0 && (
                    <div className="flex -space-x-1">
                        {item.colors.slice(0, 4).map(c => (
                            <span key={c} className="w-3 h-3 rounded-full border border-white/30" style={{ background: getColorHex(c, item.colorHex) }} />
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <Link
                    to={`/product/${item.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] px-4 py-2 text-black"
                    style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                >
                    Comprar <ArrowRight className="w-2.5 h-2.5" />
                </Link>
            </div>
        </div>
    </div>
);

export const FeaturedCollection = ({ onQuickView }) => {
    const { inventory } = useStore();

    // El alta de producto tiene un botón "destacar en home" que guarda
    // badges.isFeatured, pero esta sección lo ignoraba y mostraba los primeros
    // cinco del inventario: marcar un producto como destacado no hacía nada.
    // Ahora mandan los marcados, y se completa con el resto para que la sección
    // nunca quede a medio armar.
    const featured = useMemo(() => {
        const activos = (inventory || []).filter(p => p.active !== false);
        const marcados = activos.filter(p => p.badges?.isFeatured);
        const resto = activos.filter(p => !p.badges?.isFeatured);
        return [...marcados, ...resto].slice(0, 5);
    }, [inventory]);

    if (featured.length === 0) return null;

    const [hero, second, third, fourth, fifth] = featured;

    return (
        <section className="py-14 md:py-20 px-4 md:px-6 bg-[#11100D] relative overflow-hidden">

            {/* Faint background texture */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
            />

            <Reveal className="max-w-[1440px] mx-auto relative">

                {/* Header */}
                <div className="flex items-end justify-between mb-10 md:mb-14">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-10 bg-cielo-gold/50" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-cielo-gold/70">
                                Selección limitada
                            </span>
                        </div>
                        <h2 className="font-cinzel font-bold text-white leading-none"
                            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                            Colección Destacada
                        </h2>
                    </div>
                    <Link
                        to="/shop"
                        className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-cielo-gold/70 hover:text-cielo-gold transition-colors group"
                    >
                        Ver todo
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Grid — destacado grande + 2x2 al costado. Todos los marcos en
                    4:5: el catálogo es 100% cuadrado (1280x1280) y este es el
                    recorte más alto que no le come la prenda. */}
                {featured.length >= 3 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 md:items-start">
                        <HeroCard item={hero} onQuickView={onQuickView} />

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {[second, third, fourth, fifth].filter(Boolean).map(p => (
                                <SmallCard key={p.id} item={p} onQuickView={onQuickView} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {featured.map(p => (
                            <SmallCard key={p.id} item={p} onQuickView={onQuickView} />
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-10 flex items-center justify-center gap-6">
                    <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-cielo-gold/30" />
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-3 px-10 py-3.5 text-black text-[11px] font-cinzel font-bold uppercase tracking-[0.3em] hover:shadow-[0_0_30px_rgba(193,154,107,0.4)] transition-shadow"
                        style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                    >
                        Ver toda la colección <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-cielo-gold/30" />
                </div>
            </Reveal>
        </section>
    );
};
