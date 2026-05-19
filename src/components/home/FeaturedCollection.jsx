import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';
import { formatMoney, getColorHex, optimizeImage } from '../../utils/helpers';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from './SectionHeader';

const Card = ({ item, onQuickView, tall = false }) => (
    <div
        onClick={() => onQuickView?.(item)}
        role="button"
        aria-label={`Vista rápida de ${item.name}`}
        className={`group relative overflow-hidden rounded-sm cursor-pointer ring-1 ring-transparent hover:ring-white/10 transition-[box-shadow] duration-500 ${tall ? 'aspect-[3/4] md:h-full' : 'aspect-[4/5]'}`}
    >
        <img
            src={optimizeImage(item.image, tall ? 900 : 600)}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1.5">{item.category}</p>
            <h3 className="font-serif text-xl md:text-2xl leading-tight line-clamp-2">{item.name}</h3>

            <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-lg md:text-xl text-white/90 font-light">{formatMoney(item.price)}</span>
                {item.colors?.length > 0 && (
                    <div className="flex -space-x-1.5">
                        {item.colors.slice(0, 4).map((c) => (
                            <span key={c} className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: getColorHex(c) }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Visible siempre en mobile (sin hover); hover-reveal en desktop */}
            <div className="mt-4 flex items-center gap-2 transition-all duration-500 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                <Link
                    to={`/product/${item.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-cielo-gold transition-colors"
                >
                    Comprar <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(item); }}
                    className="inline-flex items-center px-4 py-2 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                    Vista rápida
                </button>
            </div>
        </div>
    </div>
);

export const FeaturedCollection = ({ onQuickView }) => {
    const { inventory } = useStore();
    const featured = inventory.slice(0, 3);
    if (featured.length === 0) return null;

    const [hero, ...rest] = featured;

    return (
        <section className="py-24 md:py-32 px-6 bg-[#020617] relative overflow-hidden">
            <Reveal className="max-w-[1400px] mx-auto relative">
                <SectionHeader
                    eyebrow="Selección limitada"
                    title="Highlights"
                    subtitle="Las piezas que definen la temporada — pocas, elegidas a mano."
                    className="mb-16"
                />

                {rest.length >= 2 ? (
                    <div className="grid md:grid-cols-12 gap-5 md:gap-6">
                        <div className="md:col-span-7 md:row-span-2">
                            <Card item={hero} onQuickView={onQuickView} tall />
                        </div>
                        <div className="md:col-span-5 flex flex-col gap-5 md:gap-6">
                            {rest.map((p) => (
                                <Card key={p.id} item={p} onQuickView={onQuickView} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {featured.map((p) => (
                            <Card key={p.id} item={p} onQuickView={onQuickView} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 border border-cielo-gold/40 text-cielo-gold text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-cielo-gold hover:text-black transition-colors rounded-sm"
                    >
                        Ver toda la colección <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </Reveal>
        </section>
    );
};
