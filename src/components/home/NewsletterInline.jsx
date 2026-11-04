import React, { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from './SectionHeader';
import { subscribeNewsletter } from '../../utils/newsletter';

export const NewsletterInline = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const submit = async (e) => {
        e.preventDefault();
        if (!email || status === 'loading') return;
        setStatus('loading');
        const ok = await subscribeNewsletter(email, 'home_inline');
        setStatus(ok ? 'success' : 'idle');
    };

    return (
        <section className="relative py-14 md:py-20 px-6 bg-marfil overflow-hidden">
            <Reveal className="relative max-w-3xl mx-auto text-center">
                <SectionHeader
                    marfil
                    eyebrow="Novedades por email"
                    title={<>Enterate <span className="italic text-marfil-oro">antes</span> de cada lanzamiento</>}
                    subtitle="Dejá tu email y recibí el aviso de cada colección nueva antes que nadie, y cupones sólo para suscriptas."
                />

                {status === 'success' ? (
                    <div className="mt-10 inline-flex items-center gap-3 px-6 py-4 rounded-full border border-marfil-oro/50 bg-marfil-200 text-marfil-oro">
                        <Check className="w-5 h-5" />
                        <span className="text-sm">¡Listo! Te avisamos antes que a nadie.</span>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-10 max-w-xl mx-auto">
                        <div className="relative flex items-center bg-white/70 border border-marfil-oro/30 hover:border-marfil-oro/60 focus-within:border-marfil-oro rounded-full transition-colors">
                            <Mail className="absolute left-5 w-4 h-4 text-marfil-oro pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                aria-label="Correo electrónico"
                                className="flex-1 min-w-0 bg-transparent pl-12 pr-2 py-4 text-sm text-marfil-tinta placeholder-marfil-tinta/50 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="m-1 inline-flex items-center gap-1.5 px-5 md:px-6 py-3 rounded-full btn-oro text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-black disabled:opacity-60"
                            >
                                {status === 'loading' ? 'Enviando…' : (<>Suscribirme <ArrowRight className="w-3.5 h-3.5" /></>)}
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] uppercase tracking-widest text-marfil-tinta/60">Sin spam. Podés darte de baja cuando quieras.</p>
                    </form>
                )}
            </Reveal>
        </section>
    );
};
