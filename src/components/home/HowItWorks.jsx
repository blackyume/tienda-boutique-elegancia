import React from 'react';
import { Link } from 'react-router-dom';
import { Search, CreditCard, Package, ArrowRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

// Cada paso lleva a donde se hace lo que promete. Antes eran tres tarjetas
// lindas y muertas: decían "filtrá por categoría, talle y color" o "seguimiento
// desde tu cuenta" y no se podía ir a ningún lado desde ahí.
const steps = [
    {
        icon: Search,
        title: 'Curaduría',
        desc: 'Cada pieza está elegida a mano, no por catálogo. Filtrá por categoría, talle y color y encontrá lo tuyo.',
        to: '/shop',
        cta: 'Explorar el shop',
    },
    {
        icon: CreditCard,
        title: 'Pago protegido',
        desc: 'Tarjeta, débito o Mercado Pago con cuotas. Datos siempre cifrados, compra sin sobresaltos.',
        to: '/faq',
        cta: 'Cómo se paga',
    },
    {
        icon: Package,
        title: 'En tu puerta',
        desc: 'Envíos a todo el país con seguimiento en tiempo real desde tu cuenta. Empaque cuidado, como un regalo.',
        to: '/envios',
        cta: 'Envíos y tiempos',
    },
];

export const HowItWorks = () => {
    return (
        <section className="relative py-14 md:py-20 px-6 bg-[#1C1F25] overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <SectionHeader
                    eyebrow="La experiencia LBE"
                    title="Comprar, sin fricción"
                    subtitle="Curaduría, pago protegido y entrega en todo el país. Vos elegís — del resto nos ocupamos nosotros."
                    className="mb-20"
                />

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector line (desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-transparent via-cielo-gold/30 to-transparent" />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <Link
                                key={idx}
                                to={step.to}
                                className="group relative flex flex-col items-center text-center rounded-2xl p-4 -m-4 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cielo-gold/50"
                            >
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
                                <span className="mt-5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-cielo-gold/80 group-hover:text-cielo-gold transition-colors">
                                    {step.cta}
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
