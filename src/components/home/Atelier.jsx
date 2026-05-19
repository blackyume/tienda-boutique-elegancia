import React from 'react';
import { Reveal } from '../ui/Reveal';

const PILLARS = [
    { k: 'Curaduría', d: 'Cada pieza entra a la colección por decisión, no por volumen. Pocas prendas, bien elegidas.' },
    { k: 'Oficio', d: 'Confección cuidada, telas seleccionadas y terminaciones pensadas para durar temporadas, no semanas.' },
    { k: 'Rafaela', d: 'Diseñado y producido en Rafaela, Argentina. Una marca chica que trata cada pedido como único.' },
];

export const Atelier = () => (
    <section className="relative py-24 md:py-32 px-6 bg-[#020617] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(193,154,107,0.05),transparent_60%)] pointer-events-none" />

        <Reveal className="relative max-w-5xl mx-auto text-center">
            <span className="text-[10px] uppercase tracking-[0.45em] font-bold text-white/40">El Atelier</span>
            <h2 className="mt-6 font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-[1.15] max-w-3xl mx-auto">
                No hacemos temporada tras temporada.
                <span className="block text-white/50 italic mt-2">Hacemos prendas que se quedan.</span>
            </h2>
            <p className="mt-8 text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
                La Boutique de la Elegancia nace de una idea simple: vestir bien no debería ser
                ruidoso. Trabajamos con tiempo, con criterio y con manos que conocen el oficio.
            </p>
        </Reveal>

        <Reveal className="relative max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden">
            {PILLARS.map((p) => (
                <div key={p.k} className="bg-[#020617] p-8 md:p-10 text-center md:text-left">
                    <h3 className="font-cinzel text-lg tracking-[0.15em] text-white mb-3">{p.k}</h3>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">{p.d}</p>
                </div>
            ))}
        </Reveal>
    </section>
);
