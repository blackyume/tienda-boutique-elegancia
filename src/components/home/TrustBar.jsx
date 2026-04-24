import React from 'react';
import { Truck, CreditCard, RefreshCw, MessageCircle } from 'lucide-react';

const items = [
    { Icon: Truck, title: 'Envíos a todo el país', desc: 'En 24/72h hábiles' },
    { Icon: CreditCard, title: '6 cuotas sin interés', desc: 'Con Mercado Pago' },
    { Icon: RefreshCw, title: 'Cambios garantizados', desc: 'Hasta 15 días' },
    { Icon: MessageCircle, title: 'Asesoría personalizada', desc: 'Vía WhatsApp' },
];

export const TrustBar = () => (
    <div className="relative bg-[#020617] border-y border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-6">
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                {items.map(({ Icon, title, desc }, i) => (
                    <li key={i} className="flex items-center gap-3 justify-center md:justify-start">
                        <span className="shrink-0 w-10 h-10 rounded-full border border-cielo-gold/30 flex items-center justify-center text-cielo-gold bg-white/[0.02]">
                            <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </span>
                        <div className="leading-tight">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white font-semibold">{title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);
