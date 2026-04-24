// Abandoned cart tracking — escribe/actualiza un documento por email en
// firestore (colección `abandoned_carts`) con un snapshot del carrito.
// Se marca como "recovered" cuando el pedido se completa.
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const sanitizeEmail = (email) =>
    String(email || '').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '');

// ID estable derivado del email (evita crear múltiples docs por cliente).
// Firestore no acepta '/' ni '.' como primer char — lo normalizamos.
const idFromEmail = (email) => {
    const s = sanitizeEmail(email);
    return s.replace(/[@.]/g, '_');
};

export const trackAbandonedCart = async ({ email, cart, customer, total }) => {
    const safeEmail = sanitizeEmail(email);
    if (!safeEmail || !Array.isArray(cart) || cart.length === 0) return;

    const id = idFromEmail(safeEmail);
    try {
        await setDoc(doc(db, 'abandoned_carts', id), {
            email: safeEmail,
            customer: customer || {},
            items: cart.map(i => ({
                id: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                size: i.size || null,
                color: i.color || null,
                image: i.image || null
            })),
            total: Number(total) || 0,
            recovered: false,
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('[abandoned] track failed:', err?.message);
    }
};

export const markAbandonedCartRecovered = async (email, orderId) => {
    const safeEmail = sanitizeEmail(email);
    if (!safeEmail) return;
    const id = idFromEmail(safeEmail);
    try {
        await updateDoc(doc(db, 'abandoned_carts', id), {
            recovered: true,
            recoveredAt: serverTimestamp(),
            orderId: orderId || null
        });
    } catch (err) {
        // Si no existe el doc, no pasa nada
    }
};

export const deleteAbandonedCart = async (id) => {
    try {
        await deleteDoc(doc(db, 'abandoned_carts', id));
    } catch (err) {
        console.warn('[abandoned] delete failed:', err?.message);
    }
};
