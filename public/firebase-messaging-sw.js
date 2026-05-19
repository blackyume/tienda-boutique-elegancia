// Service worker específico de Firebase Messaging (FCM Web Push).
// Se registra en /firebase-messaging-sw.js por convención de Firebase.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC8pSsJ7pedjQ12s77_rwWSDWyYDMJwgAk",
    authDomain: "la-boutique-de-la-elegancia.firebaseapp.com",
    projectId: "la-boutique-de-la-elegancia",
    storageBucket: "la-boutique-de-la-elegancia.firebasestorage.app",
    messagingSenderId: "1037411928146",
    appId: "1:1037411928146:web:5fced4145039b5e5a8f78b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { notification, data } = payload;
    const title = notification?.title || 'La Boutique de la Elegancia';
    const options = {
        body: notification?.body || '',
        icon: '/assets/logo-seal.png',
        badge: '/assets/logo-seal.png',
        data: data || {}
    };
    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
