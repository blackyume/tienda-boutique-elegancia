import React, { useEffect, useMemo, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from './SectionHeader';

// Sin testimonios inventados: o son reseñas reales de gente que compró, o la
// sección no se muestra. Poner opiniones falsas bajo el título "Experiencias
// reales" engaña a la clienta y no se sostiene si alguna pregunta.
export const Testimonials = () => {
    const { siteConfig, reviews, inventory } = useStore();

    const list = useMemo(() => {
        // 1) Testimonios cargados a mano por la dueña desde el CMS (reales).
        const configured = siteConfig?.testimonials;
        if (Array.isArray(configured) && configured.length) return configured.slice(0, 3);

        // 2) Reseñas aprobadas de clientas que efectivamente compraron.
        return (reviews || [])
            .filter(r => r.approved && r.text)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 3)
            .map(r => ({
                name: r.userName || 'Cliente',
                location: inventory?.find(p => String(p.id) === String(r.productId))?.name || '',
                text: r.text,
                rating: r.rating || 5,
            }));
    }, [siteConfig, reviews, inventory]);

    const [active, setActive] = useState(0);

    useEffect(() => {
        if (list.length < 2) return;
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (reduced) return;
        const id = setInterval(() => setActive((a) => (a + 1) % list.length), 6500);
        return () => clearInterval(id);
    }, [list.length]);

    // 3) Todavía no hay ninguna reseña real -> no se muestra nada.
    if (!list.length) return null;

    return (
        <section className="relative py-14 md:py-20 px-6 bg-[#050505] border-y border-white/[0.05] overflow-hidden">
            <Reveal className="max-w-5xl mx-auto relative z-10">
                <SectionHeader
                    eyebrow="La voz de nuestras clientas"
                    title="Experiencias reales"
                    className="mb-14"
                />

                <div className={`grid gap-6 ${list.length === 1 ? 'max-w-xl mx-auto' : list.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {list.map((t, i) => (
                        <article
                            key={i}
                            onMouseEnter={() => setActive(i)}
                            className={`relative rounded-2xl p-7 border transition-all duration-700 ${active === i
                                ? 'bg-white/[0.05] border-cielo-gold/40 shadow-[0_20px_60px_-20px_rgba(232,198,94,0.25)] md:scale-[1.03]'
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
                                {t.location && (
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{t.location}</p>
                                )}
                            </div>
                            <div className={`absolute inset-x-6 -bottom-[1px] h-px bg-gradient-to-r from-transparent via-cielo-gold/60 to-transparent transition-opacity duration-700 ${active === i ? 'opacity-100' : 'opacity-0'}`} />
                        </article>
                    ))}
                </div>
            </Reveal>
        </section>
    );
};
