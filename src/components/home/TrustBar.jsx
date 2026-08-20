import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, CreditCard, ShieldCheck, Instagram } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// Cada garantía lleva a donde se explica o se usa. Antes eran cuatro rótulos
// muertos: prometían "asesoría personalizada por Instagram" sin manera de
// escribir, y "envíos a todo el país" sin decir cuánto tarda ni cuánto sale.
const items = [
    { Icon: Truck, title: 'Envíos a todo el país', desc: 'Con Correo Argentino', to: '/envios' },
    { Icon: CreditCard, title: 'Pago en cuotas', desc: 'Con Mercado Pago', to: '/faq' },
    { Icon: ShieldCheck, title: 'Compra protegida', desc: 'Pago 100% seguro', to: '/faq' },
    { Icon: Instagram, title: 'Asesoría personalizada', desc: 'Escribinos por Instagram', externa: true },
];

const claseItem =
    'group flex items-center gap-4 justify-center md:justify-start rounded-xl px-3 py-2 -mx-3 ' +
    'transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cielo-gold/40';

export const TrustBar = () => {
    const { siteConfig } = useStore();
    const instagram = siteConfig?.social?.instagram || 'https://www.instagram.com/laboutiquedelaeleganciaoficial/';

    return (
        <div className="relative bg-cielo-dark border-y border-white/[0.06]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cielo-gold/60 to-transparent" />
            <div className="max-w-6xl mx-auto px-6 py-8">
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
                    {items.map(({ Icon, title, desc, to, externa }, i) => {
                        const contenido = (
                            <>
                                <span className="shrink-0 w-10 h-10 flex items-center justify-center text-cielo-gold/70 group-hover:text-cielo-gold transition-colors duration-300">
                                    <Icon className="w-5 h-5" strokeWidth={1.2} />
                                </span>
                                <div className="leading-tight">
                                    <p className="text-2xs uppercase tracking-[0.22em] text-white/90 font-semibold">{title}</p>
                                    <p className="text-2xs text-white/40 mt-0.5 group-hover:text-cielo-gold/70 transition-colors">{desc}</p>
                                </div>
                            </>
                        );
                        return (
                            <li key={i}>
                                {externa ? (
                                    <a href={instagram} target="_blank" rel="noopener noreferrer" className={claseItem}>
                                        {contenido}
                                    </a>
                                ) : (
                                    <Link to={to} className={claseItem}>{contenido}</Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cielo-gold/30 to-transparent" />
        </div>
    );
};
