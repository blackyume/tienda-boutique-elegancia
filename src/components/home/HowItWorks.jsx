import React from 'react';
import { Search, CreditCard, Package } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: Search,
        title: 'Elegís',
        desc: 'Explorá nuestra colección y seleccioná las prendas que más te gusten. Podés filtrar por categoría, talla y color.',
    },
    {
        number: '02',
        icon: CreditCard,
        title: 'Pagás',
        desc: 'Completá tu compra de forma segura con tarjeta, débito o Mercado Pago. Cuotas sin interés disponibles.',
    },
    {
        number: '03',
        icon: Package,
        title: 'Lo recibís',
        desc: 'Tu pedido llega a tu puerta en todo el país. Seguí el estado de tu envío en tiempo real desde la tienda.',
    },
];

export const HowItWorks = () => {
    return (
        <section className="relative py-28 px-4 bg-[#020617] overflow-hidden">
            {/* Gold top separator line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-cielo-gold/60" />

            {/* Background subtle texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-block text-cielo-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                        Simple y rápido
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                        Cómo funciona
                    </h2>
                    <p className="mt-4 text-slate-400 text-sm font-light max-w-md mx-auto leading-relaxed">
                        Comprar en La Boutique es fácil, seguro y elegante — en tres pasos.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector line (desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-transparent via-cielo-gold/30 to-transparent" />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className="group relative flex flex-col items-center text-center">
                                {/* Number badge */}
                                <div className="relative mb-6">
                                    {/* Outer ring */}
                                    <div className="absolute inset-0 rounded-full border border-cielo-gold/20 scale-125 group-hover:scale-150 group-hover:border-cielo-gold/40 transition-all duration-700" />
                                    {/* Icon circle */}
                                    <div className="relative w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cielo-gold/10 group-hover:border-cielo-gold/40 transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.05)] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                                        <Icon className="w-8 h-8 text-cielo-gold group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                                    </div>
                                    {/* Step number */}
                                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cielo-gold text-black text-[10px] font-bold flex items-center justify-center shadow-lg">
                                        {idx + 1}
                                    </span>
                                </div>

                                {/* Text */}
                                <h3 className="text-2xl font-cinzel text-white mb-3 group-hover:text-cielo-gold transition-colors duration-300">
                                    {step.title}
                                </h3>
                                <div className="w-8 h-px bg-cielo-gold/40 mx-auto mb-4 group-hover:w-16 transition-all duration-500" />
                                <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs mx-auto">
                                    {step.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Gold bottom separator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent to-cielo-gold/60" />
        </section>
    );
};
