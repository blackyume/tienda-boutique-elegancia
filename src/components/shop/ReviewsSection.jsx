import React, { useMemo, useState } from 'react';
import { Star, Camera, X, ShieldCheck, Lock, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const Stars = ({ value, onSet, size = 'md' }) => {
    const cls = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    return (
        <div className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={onSet ? () => onSet(n) : undefined}
                    className={onSet ? 'transition-transform hover:scale-110' : 'pointer-events-none'}
                    aria-label={`${n} estrellas`}
                >
                    <Star className={`${cls} ${n <= value ? 'text-[#C19A6B] fill-[#C19A6B]' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
            ))}
        </div>
    );
};

export const ReviewsSection = ({ productId }) => {
    const { reviews, user, orders, addReview, uploadReviewImage, addToast } = useStore();

    const productReviews = useMemo(
        () => reviews.filter(r => r.approved && String(r.productId) === String(productId)),
        [reviews, productId]
    );

    const hasBought = useMemo(() => {
        if (!user) return false;
        return orders.some(o => {
            const uid = o.customer?.userId || o.userId;
            if (uid !== user.uid) return false;
            return (o.items || []).some(it => String(it.id) === String(productId));
        });
    }, [orders, user, productId]);

    const hasReviewed = useMemo(
        () => !!user && reviews.some(r => r.userId === user.uid && String(r.productId) === String(productId)),
        [reviews, user, productId]
    );

    const avg = productReviews.length
        ? productReviews.reduce((a, r) => a + (r.rating || 0), 0) / productReviews.length
        : 0;

    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (photos.length + files.length > 4) return addToast("Máximo 4 fotos", "error");
        setUploading(true);
        try {
            const urls = await Promise.all(files.map(f => uploadReviewImage(f)));
            setPhotos(prev => [...prev, ...urls.filter(Boolean)]);
        } catch (err) {
            addToast(err.message || "Error al subir foto", "error");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return addToast("Contanos tu experiencia", "error");
        setSubmitting(true);
        try {
            await addReview({ productId, rating, text, photos });
            addToast("¡Gracias! Tu reseña será revisada y publicada pronto", "success");
            setShowForm(false);
            setText('');
            setRating(5);
            setPhotos([]);
        } catch (err) {
            addToast(err.message || "No se pudo enviar", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mt-12">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-cinzel text-slate-900 dark:text-white mb-1">Reseñas verificadas</h2>
                    {productReviews.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Stars value={Math.round(avg)} size="sm" />
                            <span className="font-bold text-slate-800 dark:text-white">{avg.toFixed(1)}</span>
                            <span>· {productReviews.length} reseña{productReviews.length !== 1 ? 's' : ''}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Sé la primera persona en comentar.</p>
                    )}
                </div>

                {user && hasBought && !hasReviewed && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C19A6B] hover:bg-[#a87f4f] text-white transition-colors"
                    >
                        Dejar mi reseña
                    </button>
                )}
            </div>

            {/* Eligibility hint */}
            {!showForm && (
                <>
                    {!user && (
                        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-3">
                            <Lock className="w-4 h-4 text-[#C19A6B]" />
                            Iniciá sesión para ver si podés dejar reseña.
                        </div>
                    )}
                    {user && !hasBought && (
                        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-[#C19A6B]" />
                            Solo clientes que compraron este producto pueden dejar reseña.
                        </div>
                    )}
                    {user && hasReviewed && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4" />
                            Ya dejaste tu reseña para este producto. ¡Gracias!
                        </div>
                    )}
                </>
            )}

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Tu calificación</label>
                        <Stars value={rating} onSet={setRating} size="lg" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Tu experiencia</label>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder="Contanos cómo te quedó, cómo fue la entrega, la calidad..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C19A6B] resize-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 text-right">{text.length} / 1000</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Fotos (opcional, hasta 4)</label>
                        <div className="flex flex-wrap gap-2">
                            {photos.map((url, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <img src={url} loading="lazy" decoding="async" alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Quitar foto"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {photos.length < 4 && (
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-[#C19A6B] hover:border-[#C19A6B] cursor-pointer transition-colors">
                                    {uploading
                                        ? <Upload className="w-5 h-5 animate-pulse" />
                                        : <Camera className="w-5 h-5" />}
                                    <span className="text-[10px] mt-1">{uploading ? 'Subiendo…' : 'Agregar'}</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C19A6B] hover:bg-[#a87f4f] text-white disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Enviando…' : 'Enviar reseña'}
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews list */}
            {productReviews.length > 0 && (
                <div className="space-y-5">
                    {productReviews.map(r => (
                        <article key={r.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#C19A6B]/20 flex items-center justify-center text-[#C19A6B] font-bold text-sm">
                                        {(r.userName || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{r.userName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Stars value={r.rating || 0} size="sm" />
                                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                                                <ShieldCheck className="w-3 h-3" /> Compra verificada
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400">{new Date(r.createdAt || 0).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 whitespace-pre-wrap">{r.text}</p>
                            {Array.isArray(r.photos) && r.photos.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {r.photos.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                            <img src={url} loading="lazy" decoding="async" alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};
