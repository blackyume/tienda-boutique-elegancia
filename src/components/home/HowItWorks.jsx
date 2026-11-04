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
        title: 'Elegís',
        desc: 'Filtrá por tipo de prenda, talle y color. Si dudás con el talle, escribinos: te ayudamos a elegir.',
        to: '/shop',
        cta: 'Ver la tienda',
    },
    {
        icon: CreditCard,
        title: 'Pagás protegida',
        desc: 'Tarjeta, débito o Mercado Pago en cuotas. Tus datos viajan cifrados y nosotros nunca los vemos.',
        to: '/faq',
        cta: 'Cómo se paga',
    },
    {
        icon: Package,
        title: 'Te llega',
        desc: 'Correo Argentino a tu casa o a la sucursal, con el número de seguimiento por email. Empaque cuidado, como un regalo.',
        to: '/envios',
        cta: 'Envíos y tiempos',
    },
];

export const HowItWorks = () => {
    return (
        <section className="relative py-14 md:py-20 px-6 bg-[#11100D] overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <SectionHeader
                    eyebrow="Comprar en La Boutique"
                    title="Así funciona"
                    subtitle="Elegís, pagás protegida y te llega a tu casa. Del resto nos ocupamos nosotros."
                    className="mb-10 md:mb-20"
                />

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-8 relative">
                    {/* Connector line (desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-transparent via-cielo-gold/30 to-transparent" />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <Link
                                key={idx}
                                to={step.to}
                                className="group relative flex md:flex-col items-center gap-5 md:gap-0 text-left md:text-center rounded-2xl p-4 -m-4 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cielo-gold/50"
                            >
                                {/* Number badge */}
                                <div className="relative shrink-0 md:mb-6">
                                    <span aria-hidden="true" className="absolute -inset-1.5 rounded-t-full border border-cielo-gold/25 transition-colors duration-700 group-hover:border-cielo-gold/60" />
                                    {/* Icon circle */}
                                    <div className="relative w-14 h-[4.5rem] md:w-20 md:h-28 rounded-t-full bg-white/[0.04] border border-cielo-gold/50 flex items-center justify-center group-hover:bg-cielo-gold/10 group-hover:border-cielo-gold/40 transition-all duration-500 shadow-[0_0_40px_rgba(232,198,94,0.05)] group-hover:shadow-[0_0_40px_rgba(232,198,94,0.2)]">
                                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-cielo-gold group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                                    </div>
                                    {/* Step number */}
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-cielo-gold text-black text-[10px] font-bold flex items-center justify-center shadow-lg">
                                        <span className="-rotate-45">{idx + 1}</span>
                                    </span>
                                </div>

                                {/* Text */}
                                <div>
                                <h3 className="text-xl md:text-2xl font-serif text-noche-100 mb-1.5 md:mb-3 group-hover:text-cielo-gold transition-colors duration-300">
                                    {step.title}
                                </h3>
                                <div className="hidden md:block w-8 h-px bg-cielo-gold/40 mx-auto mb-4 group-hover:w-16 transition-all duration-500" />
                                <p className="text-noche-300/75 text-sm font-light leading-relaxed max-w-xs mx-auto">
                                    {step.desc}
                                </p>
                                <span className="hidden md:inline-flex mt-5 items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-cielo-gold/80 group-hover:text-cielo-gold transition-colors">
                                    {step.cta}
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
