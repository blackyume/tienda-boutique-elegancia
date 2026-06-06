// Sistema de referidos: cada usuario tiene un código único derivado del uid.
// El referido que ingresa el código en el checkout:
//   1. Obtiene X% de descuento en la compra actual
//   2. El dueño del código recibe un crédito/estadística (referralsCount + referralsEarnings)
//
// No es un cupón Firestore tradicional — se maneja por fuera para simpleza.
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Porcentaje de descuento por default para el referido
export const REFERRAL_DISCOUNT_PERCENT = 10;

export const buildReferralCode = (uid) => {
    if (!uid) return '';
    const slug = String(uid).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
    return `REF-${slug}`;
};

export const getReferralLink = (uid) => {
    if (typeof window === 'undefined') return '';
    const code = buildReferralCode(uid);
    return `${window.location.origin}/shop?ref=${code}`;
};

// Dado un código, encuentra el uid del dueño buscando en users.
// Hace una query `where('referralCode', '==', code)` — requiere que el doc
// tenga ese campo (lo setea el perfil al primer uso). Si no existe, busca
// por tail del uid.
export const findReferralOwner = async (code) => {
    if (!code) return null;
    const normalized = String(code).trim().toUpperCase();
    if (!/^REF-[A-Z0-9]{3,}$/.test(normalized)) return null;

    try {
        const q = query(collection(db, 'users'), where('referralCode', '==', normalized));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const d = snap.docs[0];
            return { uid: d.id, ...d.data() };
        }
        return null;
    } catch (err) {
        console.warn('[referral] findOwner failed:', err?.message);
        return null;
    }
};
