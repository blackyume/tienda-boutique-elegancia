import React, { useEffect, useMemo, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const pad = (n) => String(n).padStart(2, '0');

const getTargetDate = (promo) => {
    const raw = promo?.scheduledAt || promo?.runAt || promo?.startAt || promo?.date || promo?.when;
    if (!raw) return null;
    if (typeof raw?.toDate === 'function') return raw.toDate();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
};

export const CountdownBanner = () => {
    const { scheduledPromotions, siteConfig } = useStore();

    const next = useMemo(() => {
        const now = Date.now();
        const list = Array.isArray(scheduledPromotions) ? scheduledPromotions : [];
        const withDates = list
            .map((p) => ({ p, target: getTargetDate(p) }))
            .filter((x) => x.target && x.target.getTime() > now)
            .sort((a, b) => a.target.getTime() - b.target.getTime());
        if (withDates.length) return withDates[0];

        const fallback = siteConfig?.drop?.nextAt ? new Date(siteConfig.drop.nextAt) : null;
        if (fallback && fallback.getTime() > now) {
            return { p: { title: siteConfig?.drop?.title || 'Próximo Drop', description: siteConfig?.drop?.description }, target: fallback };
        }
        return null;
    }, [scheduledPromotions, siteConfig]);

    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (!next) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [next]);

    if (!next) return null;

    const diff = Math.max(0, next.target.getTime() - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const title = next.p?.title || next.p?.name || 'Próxima promoción';
    const desc = next.p?.description || 'Acceso anticipado para subscriptoras. No te lo pierdas.';

    return (
        <section className="relative py-16 px-4 bg-[#020617] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.07),transparent_60%)] pointer-events-none" />
            <div className="max-w-5xl mx-auto relative">
                <div className="relative rounded-2xl border border-cielo-gold/30 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-8 md:p-12 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]">
                    <div className="flex items-center gap-2 text-cielo-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-3">
                        <Clock className="w-3.5 h-3.5" /> Cuenta regresiva
                    </div>
                    <h3 className="text-3xl md:text-4xl font-serif text-white leading-tight">{title}</h3>
                    <p className="mt-2 text-slate-400 text-sm max-w-xl font-light">{desc}</p>

                    <div className="mt-8 flex flex-wrap gap-3 md:gap-5">
                        {[
                            { label: 'Días', v: pad(days) },
                            { label: 'Horas', v: pad(hours) },
                            { label: 'Min', v: pad(mins) },
                            { label: 'Seg', v: pad(secs) },
                        ].map((c) => (
                            <div key={c.label} className="flex-1 min-w-[70px] text-center rounded-xl border border-white/10 bg-black/40 py-4 px-2">
                                <div className="font-cinzel text-3xl md:text-4xl text-cielo-gold tabular-nums tracking-wide">{c.v}</div>
                                <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1">{c.label}</div>
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/shop"
                        className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-cielo-gold text-black text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-white transition-colors"
                    >
                        Ver tienda <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
