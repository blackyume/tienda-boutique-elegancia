import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, optimizeImage } from '../../utils/helpers';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from './SectionHeader';

// Sección opt-in: sólo se muestra si configuraste IMAGEN editorial + HOTSPOTS
// reales desde CMS. Sin esa configuración no rinde — antes caía a una foto de
// Unsplash random con 3 puntos en coordenadas inventadas (no tenía sentido).
export const ShopTheLook = () => {
    const { inventory, siteConfig, addToCart } = useStore();
    const [activeId, setActiveId] = useState(null);
    const [imgError, setImgError] = useState(false);

    const image = siteConfig?.shopTheLook?.image;
    const hotspots = useMemo(() => {
        const configured = siteConfig?.shopTheLook?.hotspots;
        return Array.isArray(configured) ? configured : [];
    }, [siteConfig]);

    const byId = useMemo(() => {
        const map = new Map();
        inventory.forEach(p => map.set(p.id, p));
        return map;
    }, [inventory]);

    if (!image || imgError || !hotspots.length) return null;

    return (
        <section className="relative py-24 md:py-32 bg-cielo-dark overflow-hidden">
            {/* Fondo con textura sutil */}
            <div className="absolute inset-0 opacity-[0.015]"
                style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M0 0h60v60H0z' fill='none'/><path d='M30 0v60M0 30h60' stroke='white' stroke-width='0.5' opacity='0.5'/></svg>\")" }}
            />

            <Reveal className="max-w-[1400px] mx-auto px-6">
                <SectionHeader
                    eyebrow="Shop The Look"
                    title="Vest&iacute; el editorial"
                    subtitle="Toc&aacute; los puntos y descubr&iacute; cada pieza del look."
                    className="mb-14"
                />

                <div className="relative mx-auto max-w-5xl">
                    {/* Sombra decorativa exterior */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-cielo-gold/5 to-transparent rounded-sm blur-2xl pointer-events-none" />

                    <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden border border-white/[0.06] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                        <img
                            src={optimizeImage(image, 1600) || image}
                            alt="Editorial Shop The Look"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />

                        {/* Gradiente sobre la imagen */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 pointer-events-none" />

                        {/* Hotspots */}
                        {hotspots.map((h, i) => {
                            const product = byId.get(h.productId);
                            if (!product) return null;
                            const isActive = activeId === product.id;

                            return (
                                <div
                                    key={`${product.id}-${i}`}
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                                >
                                    <button
                                        onClick={() => setActiveId(isActive ? null : product.id)}
                                        aria-label={`Ver ${product.name}`}
                                        className="group relative w-10 h-10 flex items-center justify-center"
                                    >
                                        {/* Ping animado */}
                                        {!isActive && (
                                            <span className="absolute inset-0 rounded-full bg-cielo-gold/25 animate-ping" />
                                        )}
                                        {/* Botón */}
                                        <span
                                            className={`relative w-7 h-7 rounded-full flex items-center justify-center border shadow-[0_0_20px_rgba(193,154,107,0.5)] transition-all duration-300 group-hover:scale-110 ${isActive
                                                ? 'bg-white border-white/80 scale-110'
                                                : 'bg-cielo-gold/90 border-white/40 backdrop-blur'
                                                }`}
                                        >
                                            {isActive
                                                ? <X className="w-3 h-3 text-black" strokeWidth={2.5} />
                                                : <Plus className="w-3 h-3 text-black" strokeWidth={3} />
                                            }
                                        </span>
                                    </button>

                                    {/* Card de producto */}
                                    {isActive && (
                                        <div
                                            className={`absolute z-20 w-52 bg-[#08101f]/98 backdrop-blur-2xl border border-cielo-gold/25 shadow-[0_16px_60px_rgba(0,0,0,0.7)]
                                                ${h.y > 55 ? 'bottom-12' : 'top-12'}
                                                ${h.x > 55 ? 'right-0' : 'left-0'}
                                            `}
                                        >
                                            <div className="h-px bg-gradient-to-r from-transparent via-cielo-gold/50 to-transparent" />
                                            <Link
                                                to={`/product/${product.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="block p-3"
                                            >
                                                <div className="w-full aspect-[3/2] overflow-hidden mb-3 bg-[#080808]">
                                                    <img
                                                        src={optimizeImage(product.image, 400) || product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <p className="text-2xs uppercase tracking-[0.25em] text-cielo-gold/70 mb-1">{product.category}</p>
                                                <p className="text-sm text-white font-serif leading-tight line-clamp-1">{product.name}</p>
                                                <p className="text-sm font-semibold text-cielo-gold mt-1">{formatMoney(product.price)}</p>
                                            </Link>
                                            <div className="px-3 pb-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart?.(product); }}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-90"
                                                    style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                                                >
                                                    <ShoppingBag className="w-3 h-3" />
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Label de instrucción */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
                            <span className="text-2xs uppercase tracking-[0.3em] text-white/50 bg-black/40 backdrop-blur px-4 py-1.5 rounded-full border border-white/10">
                                Toc&aacute; los puntos dorados
                            </span>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
};
