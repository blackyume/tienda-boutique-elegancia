import React from 'react';
import { Truck, CreditCard, ShieldCheck, MessageCircle } from 'lucide-react';

const items = [
    { Icon: Truck, title: 'Envíos a todo el país', desc: 'Con Correo Argentino' },
    { Icon: CreditCard, title: 'Pago en cuotas', desc: 'Con Mercado Pago' },
    { Icon: ShieldCheck, title: 'Compra protegida', desc: 'Pago 100% seguro' },
    { Icon: MessageCircle, title: 'Asesoria personalizada', desc: 'Via WhatsApp' },
];

export const TrustBar = () => (
    <div className="relative bg-cielo-dark border-y border-white/[0.06]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cielo-gold/60 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-8">
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
                {items.map(({ Icon, title, desc }, i) => (
                    <li key={i} className="group flex items-center gap-4 justify-center md:justify-start">
                        <span className="shrink-0 w-10 h-10 flex items-center justify-center text-cielo-gold/70 group-hover:text-cielo-gold transition-colors duration-300">
                            <Icon className="w-5 h-5" strokeWidth={1.2} />
                        </span>
                        <div className="leading-tight">
                            <p className="text-2xs uppercase tracking-[0.22em] text-white/90 font-semibold">{title}</p>
                            <p className="text-2xs text-white/40 mt-0.5">{desc}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cielo-gold/30 to-transparent" />
    </div>
);
