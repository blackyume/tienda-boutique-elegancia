import React, { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Reveal } from '../ui/Reveal';

const FALLBACK = [
    {
        name: 'Sofía G.',
        location: 'Buenos Aires',
        text: 'La calidad es impresionante. Los colores y el corte son idénticos a las fotos, y la atención por WhatsApp fue excelente.',
        rating: 5,
    },
    {
        name: 'Martina P.',
        location: 'Córdoba',
        text: 'Llegó en 48 hs perfectamente embalado. Ya me compré tres vestidos y siempre una experiencia premium.',
        rating: 5,
    },
    {
        name: 'Camila R.',
        location: 'Rosario',
        text: 'Los talles son reales y la tela se siente de primera. El proceso de cambio fue muy simple. Repetiré sin dudas.',
        rating: 5,
    },
];

export const Testimonials = () => {
    const { siteConfig } = useStore();
    const configured = siteConfig?.testimonials;
    const list = Array.isArray(configured) && configured.length ? configured.slice(0, 3) : FALLBACK;

    const [active, setActive] = useState(0);

    useEffect(() => {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (reduced) return;
        const id = setInterval(() => setActive((a) => (a + 1) % list.length), 6500);
        return () => clearInterval(id);
    }, [list.length]);

    return (
        <section className="relative py-28 px-4 bg-[#020617] overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cielo-gold/[0.04] rounded-full blur-[120px] pointer-events-none" />
            <Reveal className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-14">
                    <span className="inline-block text-cielo-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-3">La voz de nuestras clientas</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-white">Experiencias reales</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {list.map((t, i) => (
                        <article
                            key={i}
                            onMouseEnter={() => setActive(i)}
                            className={`relative rounded-2xl p-7 border transition-all duration-700 ${active === i
                                ? 'bg-white/[0.05] border-cielo-gold/40 shadow-[0_20px_60px_-20px_rgba(212,175,55,0.25)] md:scale-[1.03]'
                                : 'bg-white/[0.02] border-white/10'}`}
                        >
                            <Quote className="w-8 h-8 text-cielo-gold/40 mb-3" strokeWidth={1.2} />
                            <div className="flex gap-0.5 mb-3">
                                {Array.from({ length: t.rating || 5 }).map((_, s) => (
                                    <Star key={s} className="w-3.5 h-3.5 fill-cielo-gold text-cielo-gold" />
                                ))}
                            </div>
                            <p className="text-sm text-slate-300 font-light leading-relaxed mb-5 italic">"{t.text}"</p>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-sm text-white font-serif">{t.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{t.location}</p>
                            </div>
                            <div className={`absolute inset-x-6 -bottom-[1px] h-px bg-gradient-to-r from-transparent via-cielo-gold/60 to-transparent transition-opacity duration-700 ${active === i ? 'opacity-100' : 'opacity-0'}`} />
                        </article>
                    ))}
                </div>
            </Reveal>
        </section>
    );
};
