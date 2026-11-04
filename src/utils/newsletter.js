// Captura de leads del newsletter. Guarda el email en `newsletter_subscribers`
// (doc id = email normalizado, para no duplicar) así el admin no pierde ningún
// suscriptor. Antes los 3 formularios (inline, popup, footer) simulaban el envío
// y no persistían nada.
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const esCorreoValido = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const idDeCorreo = (email) => email.replace(/[^a-z0-9._%+-]/g, '_');

export const subscribeNewsletter = async (rawEmail, source = 'web') => {
    const email = String(rawEmail || '').trim().toLowerCase();
    if (!esCorreoValido(email) || email.length > 256) return false;
    // id seguro: sin caracteres que rompan la ruta del doc.
    const id = idDeCorreo(email);
    try {
        await setDoc(
            doc(db, 'newsletter_subscribers', id),
            { email, source, createdAt: serverTimestamp(), baja: false },
            { merge: true }
        );
        try { localStorage.setItem('lbe_newsletter_subscribed', 'true'); } catch { /* noop */ }
        return true;
    } catch {
        return false;
    }
};

// La baja no borra el correo: queda marcado para no volver a mandarle publicidad
// aunque la lista se exporte de nuevo.
export const darDeBajaNewsletter = async (rawEmail) => {
    const email = String(rawEmail || '').trim().toLowerCase();
    if (!esCorreoValido(email) || email.length > 256) return false;
    try {
        await setDoc(
            doc(db, 'newsletter_subscribers', idDeCorreo(email)),
            { email, baja: true, bajaEn: serverTimestamp() },
            { merge: true }
        );
        try { localStorage.removeItem('lbe_newsletter_subscribed'); } catch { /* noop */ }
        return true;
    } catch {
        return false;
    }
};
