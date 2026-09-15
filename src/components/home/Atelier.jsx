import React from 'react';
import { Reveal } from '../ui/Reveal';

// La tienda ELIGE prendas, no las confecciona: acá no se promete taller,
// telas ni oficio. Se promete criterio, revisión y una persona del otro lado.
const PILLARS = [
    { k: 'Elegidas', d: 'Pocas prendas y bien elegidas. Cada una entra al catálogo por decisión, no por volumen.' },
    { k: 'Revisadas', d: 'Antes de publicarla, cada prenda pasa por nuestras manos: costuras, tela, y el talle real, no el de la etiqueta.' },
    { k: 'Rafaela', d: 'Una tienda chica de Rafaela, Santa Fe, que trata cada pedido como único. Envíos a todo el país.' },
];

export const Atelier = () => (
    <section className="relative py-14 md:py-20 px-6 bg-noche-950 border-y border-white/[0.05] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(193,154,107,0.05),transparent_60%)] pointer-events-none" />

        <Reveal className="relative max-w-5xl mx-auto text-center">
            <span className="text-[10px] uppercase tracking-[0.45em] font-bold text-cielo-gold/70">La Boutique</span>
            <h2 className="mt-6 font-serif text-3xl md:text-5xl lg:text-6xl text-noche-100 leading-[1.15] max-w-3xl mx-auto">
                Elegimos cada prenda una por una.
                <span className="block text-cielo-gold/80 italic mt-2">Lo que no nos pondríamos, no lo vendemos.</span>
            </h2>
            <p className="mt-8 text-noche-300/85 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
                La Boutique de la Elegancia es una tienda chica de Rafaela. No hacemos ropa: la elegimos.
                Prendas que revisamos antes de publicar, y una persona de verdad del otro lado del WhatsApp.
            </p>
        </Reveal>

        <Reveal className="relative max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden">
            {PILLARS.map((p) => (
                <div key={p.k} className="bg-[#11100D] p-8 md:p-10 text-center md:text-left">
                    <h3 className="font-cinzel text-lg tracking-[0.15em] text-cielo-gold mb-3">{p.k}</h3>
                    <p className="text-noche-300/85 text-sm font-light leading-relaxed">{p.d}</p>
                </div>
            ))}
        </Reveal>
    </section>
);
