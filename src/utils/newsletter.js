// Captura de leads del newsletter. Guarda el email en `newsletter_subscribers`
// (doc id = email normalizado, para no duplicar) así el admin no pierde ningún
// suscriptor. Antes los 3 formularios (inline, popup, footer) simulaban el envío
// y no persistían nada.
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const subscribeNewsletter = async (rawEmail, source = 'web') => {
    const email = String(rawEmail || '').trim().toLowerCase();
    if (!isEmail(email) || email.length > 256) return false;
    // id seguro: sin caracteres que rompan la ruta del doc.
    const id = email.replace(/[^a-z0-9._%+-]/g, '_');
    try {
        await setDoc(
            doc(db, 'newsletter_subscribers', id),
            { email, source, createdAt: serverTimestamp() },
            { merge: true }
        );
        try { localStorage.setItem('lbe_newsletter_subscribed', 'true'); } catch { /* noop */ }
        return true;
    } catch {
        return false;
    }
};
