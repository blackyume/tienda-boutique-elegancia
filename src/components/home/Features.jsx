import React from 'react';
import { Truck, CreditCard, ShieldCheck, Star, Heart, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const ICON_MAP = {
    Truck, CreditCard, ShieldCheck, Star, Heart, Clock
};

export const Features = () => {
    const { siteConfig } = useStore();
    const items = siteConfig?.features || [
        { icon: "Truck", title: "Global Shipping", desc: "Envíos asegurados a todo el país." },
        { icon: "CreditCard", title: "Secure Payment", desc: "Todas las tarjetas y Mercado Pago." },
        { icon: "ShieldCheck", title: "Premium Quality", desc: "Garantía de excelencia en cada prenda." }
    ];

    return (
        <div className="bg-[#1C1F25] py-20 relative z-10 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, idx) => {
                        const Icon = ICON_MAP[item.icon] || Truck;
                        return (
                            <div key={idx} className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cielo-gold/30 transition-all duration-500 hover:-translate-y-2 cursor-default">
                                <div className="p-4 rounded-full bg-white/5 text-cielo-gold mb-6 group-hover:scale-110 group-hover:bg-cielo-gold group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-serif text-lg text-white mb-2 tracking-wide group-hover:text-cielo-gold transition-colors">{item.title}</h4>
                                <p className="text-sm text-slate-400 font-light leading-relaxed">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};