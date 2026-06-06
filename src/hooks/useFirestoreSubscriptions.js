import { useEffect } from 'react';
import { collection, onSnapshot, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { isAdminEmail } from '../utils/admins';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../lib/cloudinaryConfig';

// Handler silencioso para onSnapshot: permission-denied es esperado para
// no-admins en colecciones protegidas; no spamear consola en prod.
export const quietSnap = (label) => (err) => {
    if (err?.code !== 'permission-denied') console.warn('[firestore]', label, err?.code || err);
};

// Toda la lógica de suscripciones real-time de la tienda, extraída de
// StoreContext. Recibe los setters y `user`; no cambia comportamiento.
export const useFirestoreSubscriptions = ({
    user,
    setUser, setInventory, setCategories, setSiteConfig, setCloudinaryConfig,
    setAiConfig, setIsMaintenance, setCoupons, setReviews, setShippingProvinces,
    setLoading, setOrders, setSimulations, setSuppliers, setAiHistory,
    setScheduledPromotions, setWishlistEvents, setVisitStatsHourly,
    setAbandonedCarts, setActiveSessions
}) => {
    // --- Suscripciones públicas / globales ---
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        const unsubProd = onSnapshot(collection(db, "products"), (snap) => {
            const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setInventory(data.sort((a, b) => b.id - a.id));
        });

        // Orders → suscripción por rol en el effect [user] (regla Firestore:
        // admin lee todas; cliente solo las propias). No suscribir acá.

        const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
            if (!snap.empty) {
                setCategories(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            }
        });

        const unsubSiteConfig = onSnapshot(doc(db, "config", "site_content"), (docSnap) => {
            if (docSnap.exists()) {
                setSiteConfig(prev => ({ ...prev, ...docSnap.data() }));
            }
        });

        const unsubCloudinary = onSnapshot(doc(db, "config", "cloudinary"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() || {};
                setCloudinaryConfig({
                    cloudName: data.cloudName || CLOUDINARY_CLOUD_NAME,
                    uploadPreset: data.uploadPreset || CLOUDINARY_UPLOAD_PRESET
                });
            }
        });

        const unsubAiConfig = onSnapshot(doc(db, "config", "ai_settings"), (docSnap) => {
            if (docSnap.exists()) {
                setAiConfig({
                    cerebrasKey: docSnap.data().cerebrasKey || "",
                    cerebrasModel: docSnap.data().cerebrasModel || "",
                    adminKeys: docSnap.data().adminKeys || "",
                    customerKeys: docSnap.data().customerKeys || "",
                    nvidiaKey: docSnap.data().nvidiaKey || "",
                    nvidiaModel: docSnap.data().nvidiaModel || "",
                });
            }
        });

        const unsubMaintenance = onSnapshot(doc(db, "config", "store_settings"), (docSnap) => {
            if (docSnap.exists()) {
                setIsMaintenance(docSnap.data().maintenance || false);
            }
        });

        // Coupons (público-read; se usa al validar cupón en checkout)
        const unsubCoupons = onSnapshot(collection(db, "coupons"), (snap) => {
            const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setCoupons(data.sort((a, b) => b.createdAt - a.createdAt));
        }, quietSnap('coupons'));

        // Reviews (público; filtro approved=true en UI del cliente)
        const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
            const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setReviews(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        });

        const unsubShipping = onSnapshot(collection(db, "shipping_provinces"), (snap) => {
            if (snap.docs.length > 0) {
                const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
                setShippingProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
            }
        });

        setLoading(false);
        return () => {
            unsubAuth(); unsubProd(); unsubCats();
            unsubSiteConfig(); unsubCloudinary(); unsubAiConfig();
            unsubMaintenance(); unsubCoupons();
            unsubShipping(); unsubReviews();
        };
         
    }, []);

    // --- Suscripciones según rol ---
    // orders → admin todas, cliente solo las propias (userId == uid).
    useEffect(() => {
        const admin = isAdminEmail(user?.email);
        const subs = [];

        if (admin) {
            subs.push(onSnapshot(collection(db, 'orders'), (snap) => {
                const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
                setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
            }, quietSnap('orders')));

            subs.push(onSnapshot(collection(db, 'simulations'), (snap) => {
                setSimulations(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => b.createdAt - a.createdAt));
            }, quietSnap('simulations')));

            subs.push(onSnapshot(collection(db, 'suppliers'), (snap) => {
                setSuppliers(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => b.createdAt - a.createdAt));
            }, quietSnap('suppliers')));

            // limit server-side (antes traía toda la colección y cortaba en cliente:
            // Firestore facturaba todas las lecturas igual).
            subs.push(onSnapshot(query(collection(db, 'ai_history'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
                setAiHistory(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            }, quietSnap('ai_history')));

            subs.push(onSnapshot(collection(db, 'scheduled_promotions'), (snap) => {
                setScheduledPromotions(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => a.activateAt - b.activateAt));
            }, quietSnap('scheduled_promotions')));

            subs.push(onSnapshot(query(collection(db, 'wishlist_events'), orderBy('timestamp', 'desc'), limit(500)), (snap) => {
                setWishlistEvents(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            }, quietSnap('wishlist_events')));

            subs.push(onSnapshot(collection(db, 'visit_stats_hourly'), (snap) => {
                setVisitStatsHourly(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.id > b.id ? 1 : -1)));
            }, quietSnap('visit_stats_hourly')));

            subs.push(onSnapshot(collection(db, 'abandoned_carts'), (snap) => {
                setAbandonedCarts(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => {
                    const at = a.lastUpdated?.toMillis?.() || 0;
                    const bt = b.lastUpdated?.toMillis?.() || 0;
                    return bt - at;
                }));
            }, quietSnap('abandoned_carts')));

            subs.push(onSnapshot(collection(db, 'active_sessions'), (snap) => {
                setActiveSessions(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            }, quietSnap('active_sessions')));
        } else {
            setSimulations([]); setSuppliers([]); setAiHistory([]);
            setScheduledPromotions([]); setWishlistEvents([]);
            setVisitStatsHourly([]); setAbandonedCarts([]); setActiveSessions([]);

            if (user) {
                subs.push(onSnapshot(
                    query(collection(db, 'orders'), where('userId', '==', user.uid)),
                    (snap) => {
                        const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
                        setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
                    },
                    quietSnap('orders(own)')
                ));
            } else {
                setOrders([]);
            }
        }

        return () => subs.forEach(u => u());
         
    }, [user]);
};
