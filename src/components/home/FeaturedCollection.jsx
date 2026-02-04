import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';
import { formatMoney, getColorHex } from '../../utils/helpers';

export const FeaturedCollection = ({ onQuickView }) => {
    const { inventory } = useStore();
    // Get top 2 most expensive items as "Featured" or just first 2
    const featured = inventory.slice(0, 2);

    return (
        <div className="py-32 px-4 bg-[#020617] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-cielo-gold/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1800px] mx-auto">
                <div className="text-center mb-24">
                    <span className="text-cielo-gold text-xs uppercase tracking-[0.4em] font-bold">Selección Limitada</span>
                    <h2 className="text-5xl md:text-7xl font-serif text-white mt-6 mb-4">Highlights</h2>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {featured.map((item, index) => (
                        <div key={item.id} className={`group relative ${index === 1 ? 'lg:mt-32' : ''}`}>
                            <div className="aspect-[4/5] relative overflow-hidden rounded-sm">
                                <img
                                    src={item.image}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                {/* Overlay Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                                    <div className="flex justify-between items-start">
                                        <span className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">New In</span>
                                    </div>

                                    <button
                                        onClick={() => onQuickView && onQuickView(item)}
                                        className="self-center bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                                    >
                                        Ver Detalle
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-3xl font-serif text-white mb-2">{item.name}</h3>
                                    <p className="text-sm text-slate-400 uppercase tracking-widest mb-3">{item.category}</p>

                                    {/* Subrle Variants Preview */}
                                    <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {/* Colors */}
                                        {item.colors && item.colors.length > 0 && (
                                            <div className="flex -space-x-2">
                                                {item.colors.slice(0, 3).map(c => (
                                                    <div key={c} className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: getColorHex(c) }} />
                                                ))}
                                                {item.colors.length > 3 && <span className="text-[9px] text-slate-500 pl-3">+{item.colors.length - 3}</span>}
                                            </div>
                                        )}
                                        {/* Sizes */}
                                        {item.sizes && item.sizes.length > 0 && (
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest user-select-none">
                                                {item.sizes.slice(0, 4).join(" · ")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-light text-cielo-gold mb-1">{formatMoney(item.price)}</p>
                                    <span className="flex items-center gap-2 text-[10px] uppercase text-white/50 group-hover:text-white transition-colors cursor-pointer">
                                        Shop Now <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
