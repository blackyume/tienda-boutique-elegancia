import React, { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from './SectionHeader';

export const NewsletterInline = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const submit = (e) => {
        e.preventDefault();
        if (!email || status === 'loading') return;
        setStatus('loading');
        setTimeout(() => {
            localStorage.setItem('lbe_newsletter_subscribed', 'true');
            setStatus('success');
        }, 1000);
    };

    return (
        <section className="relative py-24 md:py-32 px-6 bg-[#020617] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
            <Reveal className="relative max-w-3xl mx-auto text-center">
                <SectionHeader
                    eyebrow="Lista de espera"
                    title={<>Acceso a drops <span className="italic text-cielo-gold">48 horas antes</span></>}
                    subtitle="Suscribite y recibí cupones privados, editoriales exclusivos y el aviso anticipado de cada nueva colección."
                />

                {status === 'success' ? (
                    <div className="mt-10 inline-flex items-center gap-3 px-6 py-4 rounded-full border border-cielo-gold/40 bg-cielo-gold/10 text-cielo-gold">
                        <Check className="w-5 h-5" />
                        <span className="text-sm">¡Listo! Te avisamos antes que a nadie.</span>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-10 max-w-xl mx-auto">
                        <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cielo-gold/40 focus-within:border-cielo-gold/60 rounded-full transition-colors">
                            <Mail className="absolute left-5 w-4 h-4 text-cielo-gold pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                aria-label="Correo electrónico"
                                className="flex-1 bg-transparent pl-12 pr-2 py-4 text-sm text-white placeholder-slate-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="m-1 inline-flex items-center gap-1.5 px-5 md:px-6 py-3 rounded-full bg-cielo-gold text-black text-[11px] font-bold uppercase tracking-widest hover:bg-white disabled:opacity-60 transition-colors"
                            >
                                {status === 'loading' ? 'Enviando…' : (<>Suscribirme <ArrowRight className="w-3.5 h-3.5" /></>)}
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-500">Sin spam. Podés darte de baja cuando quieras.</p>
                    </form>
                )}
            </Reveal>
        </section>
    );
};
