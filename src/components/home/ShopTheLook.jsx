import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, optimizeImage } from '../../utils/helpers';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from './SectionHeader';

export const ShopTheLook = () => {
    const { inventory, siteConfig, addToCart } = useStore();
    const [activeId, setActiveId] = useState(null);

    const editorial = siteConfig?.editorial?.image;
    const fallback = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600';
    const image = siteConfig?.shopTheLook?.image || editorial || fallback;

    const hotspots = useMemo(() => {
        const configured = siteConfig?.shopTheLook?.hotspots;
        if (Array.isArray(configured) && configured.length) return configured;
        const picks = inventory.slice(0, 3);
        const defaults = [
            { x: 32, y: 28 },
            { x: 58, y: 52 },
            { x: 44, y: 78 },
        ];
        return picks.map((p, i) => ({ productId: p.id, x: defaults[i].x, y: defaults[i].y }));
    }, [inventory, siteConfig]);

    const byId = useMemo(() => {
        const map = new Map();
        inventory.forEach(p => map.set(p.id, p));
        return map;
    }, [inventory]);

    if (!hotspots.length) return null;

    return (
        <section className="relative py-24 md:py-32 px-6 bg-[#020617] overflow-hidden">
            <Reveal className="max-w-[1400px] mx-auto">
                <SectionHeader
                    eyebrow="Shop The Look"
                    title="Vestí el editorial"
                    subtitle="Tocá los puntos y descubrí cada prenda del look."
                    className="mb-14"
                />

                <div className="relative mx-auto max-w-5xl aspect-[4/5] md:aspect-[16/10] rounded-sm overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] border border-white/5">
                    <img
                        src={optimizeImage(image, 1600)}
                        alt="Editorial Shop The Look"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

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
                                    className="group relative w-9 h-9 flex items-center justify-center"
                                >
                                    <span className="absolute inset-0 rounded-full bg-cielo-gold/20 animate-ping" />
                                    <span className="relative w-7 h-7 rounded-full bg-cielo-gold/90 backdrop-blur border border-white/50 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.6)] group-hover:scale-110 transition-transform">
                                        {isActive ? <X className="w-3 h-3 text-black" /> : <Plus className="w-3 h-3 text-black" strokeWidth={3} />}
                                    </span>
                                </button>

                                {isActive && (
                                    <div className={`absolute ${h.y > 60 ? 'bottom-10' : 'top-10'} ${h.x > 60 ? 'right-0' : 'left-0'} w-56 bg-slate-900/95 backdrop-blur-xl border border-cielo-gold/30 rounded-xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-10`}>
                                        <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()} className="block">
                                            <img src={optimizeImage(product.image, 400)} alt={product.name} className="w-full h-28 object-cover rounded-md mb-2" loading="lazy" />
                                            <p className="text-[10px] uppercase tracking-widest text-cielo-gold/80">{product.category}</p>
                                            <p className="text-sm text-white font-serif leading-tight mt-0.5 line-clamp-1">{product.name}</p>
                                            <p className="text-sm text-cielo-gold mt-1">{formatMoney(product.price)}</p>
                                        </Link>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart?.(product); }}
                                            className="mt-2 w-full flex items-center justify-center gap-1.5 bg-cielo-gold text-black text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm hover:bg-white transition-colors"
                                        >
                                            <ShoppingBag className="w-3 h-3" /> Agregar
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Reveal>
        </section>
    );
};
