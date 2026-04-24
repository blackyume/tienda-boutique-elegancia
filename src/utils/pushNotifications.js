// FCM Web Push client helper.
// Requiere que siteConfig.push.vapidKey esté seteado (desde Firebase Console → Cloud Messaging → Web Push certs).
//
// Flujo:
//   1. requestAndRegister(user, siteConfig) → pide permiso, obtiene FCM token
//   2. Guarda {uid, email, token, createdAt} en `push_subscriptions`
//   3. Admin puede enviar notificaciones desde `api/send-push.js`
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseApp, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

let messagingInstance = null;

const getMessagingSafe = async () => {
    if (messagingInstance) return messagingInstance;
    if (!(await isSupported())) return null;
    try {
        messagingInstance = getMessaging(firebaseApp);
        return messagingInstance;
    } catch {
        return null;
    }
};

export const isPushSupported = async () => {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window)) return false;
    if (!('serviceWorker' in navigator)) return false;
    return await isSupported();
};

export const getCurrentPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
    return Notification.permission;
};

export const requestAndRegister = async (user, vapidKey) => {
    if (!vapidKey) throw new Error('Falta VAPID key en configuración');
    const supported = await isPushSupported();
    if (!supported) throw new Error('Tu navegador no soporta notificaciones push');

    // Registrar el SW de FCM (se sirve en /firebase-messaging-sw.js)
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-messaging-sw' })
        .catch(() => navigator.serviceWorker.register('/firebase-messaging-sw.js'));

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado');

    const messaging = await getMessagingSafe();
    if (!messaging) throw new Error('Messaging no soportado');

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
    if (!token) throw new Error('No se obtuvo token');

    // Guardar en Firestore (id = token para dedupe)
    await setDoc(doc(db, 'push_subscriptions', token), {
        token,
        uid: user?.uid || null,
        email: user?.email || null,
        userAgent: navigator.userAgent?.slice(0, 120) || null,
        createdAt: serverTimestamp(),
        active: true
    }, { merge: true });

    return token;
};

export const listenForegroundMessages = async (onNotif) => {
    const messaging = await getMessagingSafe();
    if (!messaging) return () => { };
    return onMessage(messaging, (payload) => {
        if (typeof onNotif === 'function') onNotif(payload);
    });
};
