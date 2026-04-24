import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useProductReviews, addReview } from '../../hooks/useProductReviews';

const StarBar = ({ value = 0, outOf = 5, size = 'md', onClick }) => {
    const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
        <div className="inline-flex items-center gap-0.5" aria-label={`${value} de ${outOf}`}>
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= Math.round(value);
                const Btn = onClick ? 'button' : 'span';
                return (
                    <Btn
                        key={n}
                        type={onClick ? 'button' : undefined}
                        onClick={onClick ? () => onClick(n) : undefined}
                        className={onClick ? 'p-0.5 hover:scale-110 transition-transform' : ''}
                        aria-label={onClick ? `${n} estrellas` : undefined}
                    >
                        <Star
                            className={`${sz} ${filled ? 'fill-cielo-gold text-cielo-gold' : 'text-slate-300 dark:text-slate-700'}`}
                        />
                    </Btn>
                );
            })}
        </div>
    );
};

export const ReviewSummary = ({ productId, onWriteClick }) => {
    const { aggregate } = useProductReviews(productId);
    const { count, average } = aggregate();
    return (
        <div className="flex items-center gap-3 text-sm">
            <StarBar value={average} />
            <span className="text-slate-600 dark:text-slate-300">
                {count > 0 ? average.toFixed(1) : 'Sin reseñas'}
            </span>
            <span className="text-slate-400">·</span>
            <button
                onClick={onWriteClick}
                className="text-cielo-gold text-xs uppercase tracking-widest hover:underline"
            >
                {count > 0 ? `${count} ${count === 1 ? 'reseña' : 'reseñas'}` : 'Escribir una reseña'}
            </button>
        </div>
    );
};

export const ProductReviews = ({ product }) => {
    const { reviews, aggregate } = useProductReviews(product?.id);
    const { user, addToast } = useStore();
    const [writing, setWriting] = useState(false);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [size, setSize] = useState('');
    const [fit, setFit] = useState('regular');
    const [submitting, setSubmitting] = useState(false);

    const { count, average, distribution } = aggregate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            addToast('Iniciá sesión para dejar tu reseña', 'info');
            return;
        }
        if (!body.trim()) {
            addToast('Contanos tu experiencia', 'error');
            return;
        }
        try {
            setSubmitting(true);
            await addReview({
                productId: product.id,
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Cliente',
                rating,
                title,
                body,
                size,
                fit
            });
            addToast('Gracias por tu reseña', 'success');
            setWriting(false);
            setTitle('');
            setBody('');
            setSize('');
            setFit('regular');
            setRating(5);
        } catch (err) {
            console.error(err);
            addToast('No se pudo guardar la reseña', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-16 px-4 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-[280px_1fr] gap-12">
                    {/* Resumen */}
                    <div>
                        <h2 className="text-2xl font-luxury mb-4">Opiniones</h2>
                        {count > 0 ? (
                            <>
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl font-light leading-none">
                                        {average.toFixed(1)}
                                    </span>
                                    <div>
                                        <StarBar value={average} />
                                        <p className="text-xs text-slate-500 mt-1">
                                            {count} {count === 1 ? 'reseña' : 'reseñas'}
                                        </p>
                                    </div>
                                </div>
                                <ul className="mt-6 space-y-1.5">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const n = distribution[star - 1];
                                        const pct = count > 0 ? Math.round((n / count) * 100) : 0;
                                        return (
                                            <li key={star} className="flex items-center gap-2 text-xs">
                                                <span className="w-3 text-slate-500">{star}</span>
                                                <Star className="w-3 h-3 fill-cielo-gold text-cielo-gold" />
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cielo-gold" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="w-6 text-right text-slate-500">{n}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Todavía no hay reseñas. Sé la primera en opinar.
                            </p>
                        )}

                        <button
                            onClick={() => setWriting((v) => !v)}
                            className="mt-6 w-full py-3 text-xs font-bold uppercase tracking-widest border border-slate-900 dark:border-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors"
                        >
                            {writing ? 'Cancelar' : 'Escribir reseña'}
                        </button>
                    </div>

                    {/* Formulario + Lista */}
                    <div className="space-y-8">
                        {writing && (
                            <form
                                onSubmit={handleSubmit}
                                className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4 animate-fadeIn"
                            >
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Tu puntaje
                                    </label>
                                    <StarBar value={rating} onClick={setRating} size="lg" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Título (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={100}
                                        placeholder="Ej: Hermosa prenda"
                                        className="w-full px-3 py-2.5 text-sm rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-cielo-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Tu opinión
                                    </label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        maxLength={800}
                                        rows={4}
                                        placeholder="Contanos cómo te quedó, la calidad de la tela, tu experiencia general..."
                                        className="w-full px-3 py-2.5 text-sm rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-cielo-gold focus:outline-none resize-y"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Talle comprado
                                        </label>
                                        <select
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        >
                                            <option value="">—</option>
                                            {(product?.sizes || []).map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Calce
                                        </label>
                                        <select
                                            value={fit}
                                            onChange={(e) => setFit(e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        >
                                            <option value="small">Chico</option>
                                            <option value="regular">Al talle</option>
                                            <option value="large">Grande</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 text-xs font-bold uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-cielo-gold hover:text-black transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Enviando...' : 'Publicar reseña'}
                                </button>
                            </form>
                        )}

                        <ul className="space-y-6">
                            {reviews
                                .filter((r) => r.status !== 'hidden')
                                .map((r) => (
                                    <li
                                        key={r.id}
                                        className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-none"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <StarBar value={r.rating} size="sm" />
                                                {r.title && (
                                                    <h4 className="font-bold text-sm">{r.title}</h4>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {new Date(r.createdAt).toLocaleDateString('es-AR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                                            {r.body}
                                        </p>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                            <span className="font-bold">{r.userName}</span>
                                            {r.size && <span>· Talle {r.size}</span>}
                                            {r.fit && (
                                                <span>
                                                    · Calce {r.fit === 'small' ? 'chico' : r.fit === 'large' ? 'grande' : 'al talle'}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
