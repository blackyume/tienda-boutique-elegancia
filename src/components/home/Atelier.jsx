import React from 'react';
import { Reveal } from '../ui/Reveal';
import { Rombo } from '../ui/Ornamento';

// La tienda ELIGE prendas, no las confecciona: acá no se promete taller,
// telas ni oficio. Se promete criterio, revisión y una persona del otro lado.
const PILLARS = [
    { k: 'Elegidas', d: 'Pocas prendas y bien elegidas. Cada una entra al catálogo por decisión, no por volumen.' },
    { k: 'Revisadas', d: 'Antes de publicarla, cada prenda pasa por nuestras manos: costuras, tela, y el talle real, no el de la etiqueta.' },
    { k: 'Rafaela', d: 'Una tienda chica de Rafaela, Santa Fe, que trata cada pedido como único. Envíos a todo el país.' },
];

export const Atelier = () => (
    <section className="relative py-16 md:py-24 px-6 bg-marfil text-marfil-tinta overflow-hidden">
        <Reveal className="relative max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.45em] font-bold text-marfil-oro">
                <Rombo className="bg-marfil-oro" /> La Boutique <Rombo className="bg-marfil-oro" />
            </span>
            <h2 className="mt-6 font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.15] max-w-3xl mx-auto">
                Elegimos cada prenda una por una.
                <span className="block text-marfil-oro italic mt-2">Lo que no nos pondríamos, no lo vendemos.</span>
            </h2>
            <p className="mt-8 text-marfil-tinta/75 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
                La Boutique de la Elegancia es una tienda chica de Rafaela. No hacemos ropa: la elegimos.
                Prendas que revisamos antes de publicar, y una persona de verdad del otro lado de cada consulta.
            </p>
        </Reveal>

        <Reveal className="relative max-w-5xl mx-auto mt-12 md:mt-20 flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-auto md:px-0">
            {PILLARS.map((p) => (
                <div key={p.k} className="flex-none w-[74vw] md:w-full max-w-xs mx-auto snap-center rounded-t-full border border-marfil-oro/40 bg-marfil-200/50 px-8 pt-24 pb-10 text-center">
                    <h3 className="font-cinzel text-lg tracking-[0.15em] text-marfil-oro mb-3">{p.k}</h3>
                    <p className="text-marfil-tinta/75 text-sm font-light leading-relaxed">{p.d}</p>
                </div>
            ))}
        </Reveal>
    </section>
);
