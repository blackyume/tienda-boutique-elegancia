import { useEffect, useState, useCallback } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    query,
    where,
    orderBy,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Reviews por producto (Firestore: colección "reviews", doc con productId).
export const useProductReviews = (productId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', String(productId)),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => {
                // Si falta índice en Firestore, hacemos fallback sin orderBy.
                console.warn('reviews listener:', err?.message);
                const fallback = query(
                    collection(db, 'reviews'),
                    where('productId', '==', String(productId))
                );
                onSnapshot(fallback, (snap) => {
                    const docs = snap.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    setReviews(docs);
                    setLoading(false);
                });
            }
        );
        return () => unsub();
    }, [productId]);

    const aggregate = useCallback(() => {
        const published = reviews.filter((r) => r.status !== 'hidden');
        const count = published.length;
        if (count === 0) return { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] };
        const sum = published.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        const distribution = [1, 2, 3, 4, 5].map(
            (star) => published.filter((r) => Number(r.rating) === star).length
        );
        return { count, average: sum / count, distribution };
    }, [reviews]);

    return { reviews, loading, aggregate };
};

export const addReview = async ({
    productId,
    userId,
    userName,
    rating,
    title,
    body,
    size,
    fit
}) => {
    if (!productId || !userId) throw new Error('Faltan datos');
    const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
    await addDoc(collection(db, 'reviews'), {
        productId: String(productId),
        userId,
        userName: (userName || 'Cliente').slice(0, 60),
        rating: r,
        title: (title || '').slice(0, 100),
        body: (body || '').slice(0, 800),
        size: size || '',
        fit: fit || '',
        status: 'published',
        createdAt: Date.now()
    });
};

export const flagReview = async (id) => {
    if (!id) return;
    await updateDoc(doc(db, 'reviews', id), { status: 'hidden' });
};
