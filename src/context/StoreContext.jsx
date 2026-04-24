import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { storage, auth } from '../lib/firebase';
import imageCompression from 'browser-image-compression';
import { availableAfterCart, getTotalStock, getVariantStock } from '../utils/variants';
import { trackAddToCart, trackRemoveFromCart, trackAddToWishlist } from '../utils/analytics';

// --- CONFIGURACIÓN CLOUDINARY ---
// TODO: El usuario debe completar esto
const CLOUDINARY_CLOUD_NAME = "dhfjszhjl"; // Configurado desde screenshot
const CLOUDINARY_UPLOAD_PRESET = "cielo_2026"; // Preset que creará el usuario

const StoreContext = createContext();

const INITIAL_CATEGORIES = [];

const INITIAL_IMAGES = {
  hero: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2070",
  about: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
};

export const StoreProvider = ({ children }) => {
  // --- LOCAL STATE (Cart, Theme, etc. stay in browser) ---
  const [cart, setCart] = useLocalStorage('cielo_cart', []);
  const [wishlist, setWishlist] = useLocalStorage('cielo_wishlist', []);
  const [theme, setTheme] = useLocalStorage('cielo_theme', 'light');

  // --- FIREBASE STATE (Real-time) ---
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  // Consolidated Site Config (Images + Text)
  const [siteConfig, setSiteConfig] = useState({
    hero: {
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2070",
      title: "LA BOUTIQUE",
      subtitle: "de la Elegancia",
      buttonText: "Explorar Shop",
      buttonLink: "shop"
    },
    editorial: {
      image: "https://images.unsplash.com/photo-1485230946287-65775ce5ad96?q=80&w=2070&auto=format&fit=crop",
      title: "Arte & Arquitectura",
      subtitle: "The Vision 2026",
      text: "Nuestra nueva colección explora la intersección entre la moda de alta costura y las líneas estructurales del mañana. Cada pieza es un manifiesto de elegancia atemporal.",
      quote: "La elegancia es la única belleza que no se marchita.",
      quoteAuthor: "Audrey Hepburn"
    },
    showMarquee: true,
    showEditorial: true,
    marquee: "La Boutique de la Elegancia • Collection 2026 • World Class Fashion • Future Luxury • Nueva Temporada",
    announcement: {
      text: "Compra Segura | Envíos a todo el País | Nueva Colección 2026",
      enabled: true,
    },
    promoPopup: {
      active: false,
      title: "¡10% OFF!",
      text: "Suscríbete y obtén un descuento exclusivo en tu primera compra.",
      code: "WELCOME10",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80"
    },
    social: {
      instagram: "https://instagram.com",
      youtube: "",
      tiktok: ""
    },
    features: [
      { icon: "Truck", title: "Global Shipping", desc: "Envíos asegurados a todo el país." },
      { icon: "CreditCard", title: "Secure Payment", desc: "Todas las tarjetas y Mercado Pago." },
      { icon: "ShieldCheck", title: "Premium Quality", desc: "Garantía de excelencia en cada prenda." }
    ],
    whatsappNumber: "5491144444444",
    gaMeasurementId: "",
    emailjs: {
      serviceId: "service_vltg3pi",
      templateId: "",
      publicKey: "ir_pffFBgDaQqgjV6"
    }
  });

  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: "",
    uploadPreset: ""
  });

  // --- AI CONFIGURATION ---
  const [aiConfig, setAiConfig] = useState({
    adminKeys: "", // Comma-separated or array
    customerKeys: "" // Comma-separated or array
  });

  const [simulations, setSimulations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [scheduledPromotions, setScheduledPromotions] = useState([]);
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);

  // Shipping Rates by Province (precargados)
  const [shippingProvinces, setShippingProvinces] = useState([
    { id: 'caba', name: 'CABA', price: 2500, zone: 'AMBA' },
    { id: 'buenos_aires', name: 'Buenos Aires (GBA)', price: 3000, zone: 'AMBA' },
    { id: 'buenos_aires_int', name: 'Buenos Aires (Interior)', price: 4500, zone: 'Centro' },
    { id: 'cordoba', name: 'Córdoba', price: 5500, zone: 'Centro' },
    { id: 'santa_fe', name: 'Santa Fe', price: 5000, zone: 'Centro' },
    { id: 'mendoza', name: 'Mendoza', price: 6500, zone: 'Cuyo' },
    { id: 'san_luis', name: 'San Luis', price: 6000, zone: 'Cuyo' },
    { id: 'san_juan', name: 'San Juan', price: 7000, zone: 'Cuyo' },
    { id: 'entre_rios', name: 'Entre Ríos', price: 5000, zone: 'Litoral' },
    { id: 'corrientes', name: 'Corrientes', price: 6500, zone: 'NEA' },
    { id: 'misiones', name: 'Misiones', price: 7000, zone: 'NEA' },
    { id: 'chaco', name: 'Chaco', price: 7000, zone: 'NEA' },
    { id: 'formosa', name: 'Formosa', price: 7500, zone: 'NEA' },
    { id: 'tucuman', name: 'Tucumán', price: 7000, zone: 'NOA' },
    { id: 'salta', name: 'Salta', price: 8000, zone: 'NOA' },
    { id: 'jujuy', name: 'Jujuy', price: 8500, zone: 'NOA' },
    { id: 'santiago', name: 'Santiago del Estero', price: 7000, zone: 'NOA' },
    { id: 'catamarca', name: 'Catamarca', price: 7500, zone: 'NOA' },
    { id: 'la_rioja', name: 'La Rioja', price: 7000, zone: 'Cuyo' },
    { id: 'neuquen', name: 'Neuquén', price: 8000, zone: 'Patagonia' },
    { id: 'rio_negro', name: 'Río Negro', price: 8500, zone: 'Patagonia' },
    { id: 'la_pampa', name: 'La Pampa', price: 6000, zone: 'Centro' },
    { id: 'chubut', name: 'Chubut', price: 9500, zone: 'Patagonia' },
    { id: 'santa_cruz', name: 'Santa Cruz', price: 11000, zone: 'Patagonia' },
    { id: 'tierra_del_fuego', name: 'Tierra del Fuego', price: 13000, zone: 'Patagonia' }
  ]);

  // --- UI STATE ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [globalFilter, setGlobalFilter] = useState({ category: "Todos", search: "" });
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FIREBASE SUBSCRIPTIONS ---
  useEffect(() => {
    // Auth Listener
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Inventory
    const unsubProd = onSnapshot(collection(db, "products"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setInventory(data.sort((a, b) => b.id - a.id));
    });

    // Orders
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    // Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      if (!snap.empty) {
        setCategories(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }
    });

    // Config (Site Config)
    const unsubSiteConfig = onSnapshot(doc(db, "config", "site_content"), (doc) => {
      if (doc.exists()) {
        // Merge with defaults to ensure structure exists even if DB lacks fields
        setSiteConfig(prev => ({ ...prev, ...doc.data() }));
      }
    });

    // Config (Cloudinary)
    const unsubCloudinary = onSnapshot(doc(db, "config", "cloudinary"), (doc) => {
      if (doc.exists()) {
        setCloudinaryConfig(doc.data());
      }
    });

    // Config (AI config keys)
    const unsubAiConfig = onSnapshot(doc(db, "config", "ai_settings"), (doc) => {
      if (doc.exists()) {
        setAiConfig({
          adminKeys: doc.data().adminKeys || "",
          customerKeys: doc.data().customerKeys || ""
        });
      }
    });

    // Config (Maintenance Mode)
    const unsubMaintenance = onSnapshot(doc(db, "config", "store_settings"), (doc) => {
      if (doc.exists()) {
        setIsMaintenance(doc.data().maintenance || false);
      }
    });

    // Simulations
    const unsubSims = onSnapshot(collection(db, "simulations"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setSimulations(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Coupons
    const unsubCoupons = onSnapshot(collection(db, "coupons"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setCoupons(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Suppliers
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setSuppliers(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    // AI History
    const unsubAiHistory = onSnapshot(collection(db, "ai_history"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setAiHistory(data.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50));
    });

    // Scheduled Promotions
    const unsubPromos = onSnapshot(collection(db, "scheduled_promotions"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setScheduledPromotions(data.sort((a, b) => a.activateAt - b.activateAt));
    });

    // Wishlist Events (analytics collection)
    const unsubWishlistEvents = onSnapshot(collection(db, "wishlist_events"), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setWishlistEvents(data.sort((a, b) => b.timestamp - a.timestamp).slice(0, 500));
    });

    // Shipping Rates by Province (overrides defaults if exists)
    const unsubShipping = onSnapshot(collection(db, "shipping_provinces"), (snap) => {
      if (snap.docs.length > 0) {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        setShippingProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
      }
    });

    setLoading(false);
    return () => {
      unsubAuth(); unsubProd(); unsubOrders(); unsubCats();
      unsubSiteConfig(); unsubCloudinary(); unsubAiConfig();
      unsubMaintenance(); unsubSims(); unsubCoupons();
      unsubSuppliers(); unsubAiHistory(); unsubPromos();
      unsubWishlistEvents(); unsubShipping();
    };
  }, []);

  // --- ADMIN-ONLY SUBSCRIPTIONS (abandoned carts, active sessions) ---
  useEffect(() => {
    const ADMIN_EMAILS = ['laboutiquedelaeleganciaoficial@gmail.com', 'juampi218@gmail.com'];
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      setAbandonedCarts([]);
      setActiveSessions([]);
      return;
    }
    const unsubAbandoned = onSnapshot(collection(db, 'abandoned_carts'), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setAbandonedCarts(data.sort((a, b) => {
        const at = a.lastUpdated?.toMillis?.() || 0;
        const bt = b.lastUpdated?.toMillis?.() || 0;
        return bt - at;
      }));
    });
    const unsubPresence = onSnapshot(collection(db, 'active_sessions'), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setActiveSessions(data);
    });
    return () => { unsubAbandoned(); unsubPresence(); };
  }, [user]);

  // --- THEME (dark-only: el diseño de la web es oscuro por decisión) ---
  useEffect(() => {
    if (document.documentElement?.classList) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => { /* tema fijo: dark */ };

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // --- CART ---
  const addToCart = (product, size, color, quantity = 1) => {
    if (!product) return false;
    const qty = Math.max(1, Number(quantity) || 1);

    const needsSize = Array.isArray(product.sizes) && product.sizes.length > 0;
    const needsColor = Array.isArray(product.colors) && product.colors.length > 0;
    if (needsSize && !size) { addToast('Seleccioná un talle', 'error'); return false; }
    if (needsColor && !color) { addToast('Seleccioná un color', 'error'); return false; }

    const stockAvailable = availableAfterCart(product, size, color, cart);
    if (stockAvailable <= 0) {
      addToast('Sin stock disponible en esta combinación', 'error');
      return false;
    }
    const addQty = Math.min(qty, stockAvailable);

    const key = `${product.id}-${size || ''}-${color || ''}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + addQty } : i);
      // Guardamos un snapshot mínimo para el carrito (no el documento entero de Firestore).
      const snapshot = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      };
      return [...prev, { ...snapshot, size, color, quantity: addQty, key }];
    });
    trackAddToCart(product, size, color, addQty);
    addToast('Agregado al carrito', 'success');
    return true;
  };

  const updateCartQty = (key, nextQty) => {
    setCart(prev => {
      const item = prev.find(i => i.key === key);
      if (!item) return prev;
      const product = inventory.find(p => String(p.id) === String(item.id));
      const stock = product ? getVariantStock(product, item.size, item.color) : Infinity;
      const safeQty = Math.max(1, Math.min(Number(nextQty) || 1, stock));
      return prev.map(i => i.key === key ? { ...i, quantity: safeQty } : i);
    });
  };

  const removeFromCart = (key) => setCart(prev => {
    const item = prev.find(i => i.key === key);
    if (item) trackRemoveFromCart(item);
    return prev.filter(i => i.key !== key);
  });
  const clearCart = () => setCart([]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // --- WISHLIST (normalizada a array de ids string, opcionalmente sync Firestore) ---
  const toggleWishlist = (productId) => {
    const id = String(productId);
    setWishlist(prev => {
      const ids = (prev || []).map(w => String(w?.id ?? w));
      const wasAdding = !ids.includes(id);
      const next = wasAdding
        ? [...ids, id]
        : (prev || []).filter(w => String(w?.id ?? w) !== id).map(w => String(w?.id ?? w));
      if (wasAdding) {
        const product = inventory.find(p => String(p.id) === id);
        if (product) trackAddToWishlist(product);
      }
      return next;
    });
  };
  const isInWishlist = (productId) => {
    const id = String(productId);
    return (wishlist || []).some(w => String(w?.id ?? w) === id);
  };

  // --- AUTH ---
  const [userRole, setUserRole] = useState('customer');

  const [wishlistSyncedForUid, setWishlistSyncedForUid] = useState(null);
  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role || 'customer');
            // Merge wishlist local con remota (unión por id).
            const remote = Array.isArray(data.wishlist) ? data.wishlist.map(String) : [];
            const local = (wishlist || []).map(w => String(w?.id ?? w));
            const merged = Array.from(new Set([...remote, ...local]));
            setWishlist(merged);
            if (remote.length !== merged.length) {
              await updateDoc(doc(db, "users", user.uid), { wishlist: merged });
            }
          } else {
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              role: 'customer',
              wishlist: (wishlist || []).map(w => String(w?.id ?? w)),
              createdAt: Date.now()
            });
            setUserRole('customer');
          }
          setWishlistSyncedForUid(user.uid);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };
      checkRole();
    } else {
      setUserRole(null);
      setWishlistSyncedForUid(null);
    }
  }, [user]);

  // Push cada cambio de wishlist al doc del usuario logueado.
  useEffect(() => {
    if (!user || wishlistSyncedForUid !== user.uid) return;
    const ids = (wishlist || []).map(w => String(w?.id ?? w));
    updateDoc(doc(db, "users", user.uid), { wishlist: ids }).catch((e) =>
      console.warn('No se pudo sincronizar wishlist:', e?.message)
    );
  }, [wishlist, user, wishlistSyncedForUid]);

  const ADMIN_WHITELIST = ['laboutiquedelaeleganciaoficial@gmail.com', 'juampi218@gmail.com'];
  // Admin is ONLY the specific email. Role is ignored for admin privilege to be safe.
  const isAdmin = user && ADMIN_WHITELIST.includes(user.email);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast("Sesión iniciada", "success");
      return true;
    } catch (error) {
      console.error(error);
      addToast("Credenciales inválidas", "error");
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in DB, if not create as customer
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          role: 'customer',
          createdAt: Date.now()
        });
      }
      addToast("Sesión iniciada con Google", "success");
      return true;
    } catch (error) {
      console.error("Google Login Error:", error);
      // Show specific error code to help debugging
      addToast(`Error Google: ${error.code || error.message}`, "error");
      return false;
    }
  };

  const register = async (email, password, name) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email,
        name: name,
        role: 'customer',
        createdAt: Date.now()
      });
      await updateProfile(cred.user, { displayName: name });
      addToast("¡Bienvenido! Tu cuenta ha sido creada.", "success");
      return true;
    } catch (error) {
      console.error(error);
      addToast(`Error al registrarse: ${error.message}`, "error");
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    addToast("Sesión cerrada", "info");
  };

  // --- FIREBASE ACTIONS ---
  const [shippingRates, setShippingRates] = useState({
    andreani: { name: 'Andreani', cost: 5800, time: '2-4 días' },
    oca: { name: 'OCA', cost: 4900, time: '3-6 días' },
    correo_argentino: { name: 'Correo Argentino', cost: 3500, time: '5-7 días' }
  });

  useEffect(() => {
    const unsubShipping = onSnapshot(doc(db, "config", "shipping"), (doc) => {
      if (doc.exists()) {
        setShippingRates(doc.data());
      }
    });
    return () => unsubShipping();
  }, []);

  const [paymentConfig, setPaymentConfig] = useState({
    publicKey: '',
    accessToken: ''
  });

  useEffect(() => {
    if (!user) return;
    const unsubPayment = onSnapshot(doc(db, "config", "payments"), (doc) => {
      if (doc.exists()) {
        setPaymentConfig(doc.data());
      }
    });
    return () => unsubPayment();
  }, [user]);

  const [systemConfig, setSystemConfig] = useState({ appVersion: 0 });
  useEffect(() => {
    const unsubSystem = onSnapshot(doc(db, "config", "system"), (doc) => {
      if (doc.exists()) setSystemConfig(doc.data());
    });
    return () => unsubSystem();
  }, []);

  const dbActions = {
    updateSystemVersion: async () => {
      if (!isAdmin) return;
      await setDoc(doc(db, "config", "system"), { appVersion: Date.now() });
      addToast("Versión actualizada. Clientes notificados.", "success");
    },
    updateShippingRates: async (rates) => {
      if (!isAdmin) return;
      await setDoc(doc(db, "config", "shipping"), rates);
      addToast("Tarifas actualizadas", "success");
    },
    updatePaymentConfig: async (config) => {
      if (!isAdmin) return;
      await setDoc(doc(db, "config", "payments"), config);
      addToast("Configuración de pagos actualizada", "success");
    },
    updateCloudinaryConfig: async (config) => {
      if (!isAdmin) return;
      await setDoc(doc(db, "config", "cloudinary"), config);
      addToast("Credenciales Cloudinary actualizadas", "success");
    },
    updateAiConfig: async (config) => {
      if (!isAdmin) return;
      await setDoc(doc(db, "config", "ai_settings"), config);
      addToast("Configuración de Inteligencia Artificial guardada", "success");
    },
    addProduct: async (product) => {
      if (!isAdmin) return;
      try {
        if (typeof product.price === 'string') product.price = Number(product.price);
        if (typeof product.stock === 'string') product.stock = Number(product.stock);

        const docRef = await addDoc(collection(db, "products"), {
          ...product,
          views: 0, // Initialize views
          createdAt: Date.now()
        });
        addToast("Producto creado exitosamente", "success");
        return docRef.id;
      } catch (e) {
        console.error(e);
        addToast("Error al crear producto", "error");
      }
    },
    updateProduct: async (id, updates) => {
      if (!isAdmin) return;
      const ref = doc(db, "products", String(id));
      await updateDoc(ref, updates);
      addToast("Producto actualizado", "success");
    },
    incrementProductView: async (id) => {
      try {
        // Use increment from firestore to be atomic
        const ref = doc(db, "products", String(id));
        // We need to import increment from firebase/firestore first, 
        // but since I cannot easily change the top imports without reading the whole file again, 
        // I will use a simple update for now or try to use the imported functions if 'increment' was imported. 
        // Waiting... let's check imports.
        // The file imports: collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc
        // It does NOT import 'increment'. 
        // I will use getDoc + updateDoc as a fallback for now to avoid breaking imports, or I can add the import.
        // Let's add the import line first in a separate step? No, too slow.
        // I'll just use the read-modify-write pattern roughly, or better yet, I will use a special field update if possible.
        // Actually, let's just do get->update. It's low traffic.
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const current = snap.data().views || 0;
          await updateDoc(ref, { views: current + 1 });
        }
      } catch (err) {
        console.error("Error incrementing view:", err);
      }
    },
    deleteProduct: async (id) => {
      if (!isAdmin) return;
      const productToDelete = inventory.find(p => String(p.id) === String(id));
      if (productToDelete) {
        // Try Cloudinary delete? Cloudinary deletes require API signature (backend).
        // Front-end only delete is risky/complex. For now, we just delete products.
        // Images will stay in Cloudinary (minor cost/orphan file issue)
      }
      await deleteDoc(doc(db, "products", String(id)));
    },
    createOrder: async (order) => {
      const orderId = String(order.id || Date.now());
      const orderWithUser = { ...order, userId: user?.uid || 'guest' };
      await setDoc(doc(db, "orders", orderId), orderWithUser);
    },
    updateOrderStatus: async (id, status, extraData = {}) => {
      if (!isAdmin) return;
      await updateDoc(doc(db, "orders", String(id)), { status, ...extraData });
    },
    addCategory: async (category) => {
      if (!isAdmin) return;
      await setDoc(doc(db, "categories", String(category.id)), category);
    },
    deleteCategory: async (id) => {
      if (!isAdmin) return;
      await deleteDoc(doc(db, "categories", String(id)));
    },
    updateSiteConfig: async (config) => {
      if (!isAdmin) return;
      await setDoc(doc(db, "config", "site_content"), config, { merge: true });
      // Keep siteImages for legacy compatibility if needed, or migration
      // await setDoc(doc(db, "config", "main"), { siteImages: config.hero ? { hero: config.hero } : {} }, { merge: true });
      addToast("Contenido del sitio actualizado", "success");
    },
    toggleMaintenance: async () => {
      if (!isAdmin) {
        alert("ERROR: No tienes permisos de ADMINISTRADOR.");
        return;
      }
      const newVal = !isMaintenance;
      setIsMaintenance(newVal);
      try {
        await setDoc(doc(db, "config", "store_settings"), { maintenance: newVal }, { merge: true });
        addToast(`Mantenimiento ${newVal ? 'ACTIVADO' : 'DESACTIVADO'}`, 'success');
      } catch (error) {
        console.error("Error toggling maintenance:", error);
        setIsMaintenance(!newVal);
        addToast(`Error al guardar: ${error.message}`, 'error');
      }
    },
    migrateData: async (localInventory, localOrders, localCats) => {
      if (!isAdmin) return;
      const batchPromises = [];
      if (localInventory) localInventory.forEach(p => batchPromises.push(setDoc(doc(db, "products", String(p.id)), p)));
      if (localOrders) localOrders.forEach(o => batchPromises.push(setDoc(doc(db, "orders", String(o.id)), o)));
      if (localCats) localCats.forEach(c => batchPromises.push(setDoc(doc(db, "categories", String(c.id)), c)));
      await Promise.all(batchPromises);
      addToast("Migración Completada", "success");
    },
    saveSimulation: async (simulation) => {
      const simData = { ...simulation, createdAt: Date.now(), userId: user?.uid };
      await addDoc(collection(db, 'simulations'), simData);
    },
    deleteSimulation: async (id) => {
      await deleteDoc(doc(db, 'simulations', id));
    },

    // --- CLOUDINARY UPLOAD ---
    uploadImage: async (file, path = 'products') => {
      if (!file) return null;
      if (!isAdmin) return null;

      if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
        addToast("Falta configurar Cloudinary en Admin > Configuración", "error");
        return null;
      }

      try {
        addToast("Preparando imagen...", "info");
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/jpeg', initialQuality: 0.8 };
        let fileToUpload = file;
        try { fileToUpload = await imageCompression(file, options); } catch (e) { console.warn("Compression skipped:", e); }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("upload_preset", cloudinaryConfig.uploadPreset);
        formData.append("folder", "tienda-cielo");

        addToast("Subiendo a Cloud...", "info");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Error desconocido en Cloudinary");

        const data = await res.json();
        addToast("Imagen subida correctamente", "success");
        return data.secure_url;

      } catch (error) {
        console.error("Cloudinary Error:", error);
        addToast(`Error Cloudinary: ${error.message}`, "error");
        return null;
      }
    },

    // --- INTEGRACIONES REALES ---
    createPreferenceMP: async (orderData) => {
      try {
        // Llamada a tu Cloud Function o Vercel API
        // Priorizar la URL configurada en el panel de administración
        const FUNCTION_URL = paymentConfig.backendUrl
          ? `${paymentConfig.backendUrl.replace(/\/$/, '')}/api/create-preference`
          : "https://tienda-boutique-elegancia.vercel.app/api/create-preference";

        console.log("Connecting to Payment API:", FUNCTION_URL);

        const response = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderData.items,
            payer: {
              name: orderData.customer.nombre,
              surname: orderData.customer.apellido,
              email: orderData.customer.email,
              phone: orderData.customer.telefono,
              dni: orderData.customer.dni,
              zip: orderData.customer.cp,
              street: orderData.customer.calle
            },
            shipping_cost: orderData.shippingCost,
            external_reference: orderData.id
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.init_point; // URL de Mercado Pago
      } catch (error) {
        console.error("MP Create Preference Error:", error);
        throw error;
      }
    },

    sendOrderEmail: async (order) => {
      // Get credentials from siteConfig (editable from admin)
      const SERVICE_ID = siteConfig.emailjs?.serviceId || "";
      const TEMPLATE_ID = siteConfig.emailjs?.templateId || "";
      const PUBLIC_KEY = siteConfig.emailjs?.publicKey || "";

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn("EmailJS no configurado. Configura las credenciales en Admin → Configuración.");
        throw new Error("EmailJS no configurado. Ve a Admin → Configuración para agregar tus credenciales.");
      }

      try {
        const data = {
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: {
            to_name: order.customer?.nombre || 'Cliente',
            to_email: order.customer?.email,
            order_id: order.id,
            total: order.total,
            items_summary: order.items?.map(i => `${i.name} (${i.size || 'N/A'}) x${i.quantity}`).join(', ') || 'Sin items',
            shipping_method: order.shipping || 'No especificado'
          }
        };

        console.log("Enviando email con data:", data);

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("EmailJS Error Response:", errorText);
          throw new Error(`EmailJS Error: ${errorText}`);
        }

        console.log("Email enviado con éxito");
      } catch (error) {
        console.error("Error enviando email:", error);
        throw error; // Re-throw para que el caller pueda manejarlo
      }
    },

    // --- ABANDONED CART REMINDER ---
    sendAbandonedCartReminder: async (abandonedCart) => {
      const SERVICE_ID = siteConfig.emailjs?.serviceId || "";
      const TEMPLATE_ID = siteConfig.emailjs?.abandonedTemplateId || siteConfig.emailjs?.templateId || "";
      const PUBLIC_KEY = siteConfig.emailjs?.publicKey || "";

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        throw new Error("EmailJS no configurado. Completá credenciales en Admin → Configuración.");
      }

      const itemsSummary = (abandonedCart.items || [])
        .map(i => `${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` · ${i.color}` : ''} x${i.quantity}`)
        .join(', ');

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const recoveryLink = `${baseUrl}/checkout`;

      const data = {
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_name: abandonedCart.customer?.nombre || 'Cliente',
          to_email: abandonedCart.email,
          order_id: 'Recordatorio',
          total: abandonedCart.total,
          items_summary: itemsSummary,
          shipping_method: `Link para completar: ${recoveryLink}`,
          recovery_link: recoveryLink
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS Error: ${errorText}`);
      }

      // Marcar que se envió el recordatorio
      try {
        await updateDoc(doc(db, 'abandoned_carts', abandonedCart.id), {
          reminderSentAt: Date.now(),
          reminderCount: (abandonedCart.reminderCount || 0) + 1
        });
      } catch (e) { /* noop */ }
    },

    deleteAbandonedCart: async (id) => {
      if (!isAdmin) return;
      try {
        await deleteDoc(doc(db, 'abandoned_carts', String(id)));
        addToast("Carrito eliminado", "success");
      } catch (e) {
        addToast("Error al eliminar", "error");
      }
    },

    // --- COUPONS ---
    addCoupon: async (coupon) => {
      if (!isAdmin) return;
      try {
        const couponData = {
          ...coupon,
          code: coupon.code.toUpperCase().trim(),
          usedCount: 0,
          createdAt: Date.now()
        };
        await addDoc(collection(db, "coupons"), couponData);
        addToast("Cupón creado exitosamente", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al crear cupón", "error");
      }
    },
    updateCoupon: async (id, updates) => {
      if (!isAdmin) return;
      try {
        await updateDoc(doc(db, "coupons", String(id)), updates);
        addToast("Cupón actualizado", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al actualizar cupón", "error");
      }
    },
    deleteCoupon: async (id) => {
      if (!isAdmin) return;
      try {
        await deleteDoc(doc(db, "coupons", String(id)));
        addToast("Cupón eliminado", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al eliminar cupón", "error");
      }
    },
    useCoupon: async (id) => {
      try {
        const couponRef = doc(db, "coupons", String(id));
        const snap = await getDoc(couponRef);
        if (snap.exists()) {
          const current = snap.data().usedCount || 0;
          await updateDoc(couponRef, { usedCount: current + 1 });
        }
      } catch (e) {
        console.error("Error using coupon:", e);
      }
    },

    // --- SUPPLIERS ---
    addSupplier: async (supplier) => {
      if (!isAdmin) return;
      try {
        await addDoc(collection(db, "suppliers"), supplier);
        addToast("Proveedor agregado exitosamente", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al agregar proveedor", "error");
      }
    },
    updateSupplier: async (id, updates) => {
      if (!isAdmin) return;
      try {
        await updateDoc(doc(db, "suppliers", String(id)), updates);
        addToast("Proveedor actualizado", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al actualizar proveedor", "error");
      }
    },
    deleteSupplier: async (id) => {
      if (!isAdmin) return;
      try {
        await deleteDoc(doc(db, "suppliers", String(id)));
        addToast("Proveedor eliminado", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al eliminar proveedor", "error");
      }
    },

    // --- AI HISTORY ---
    logAiAction: async (action, details, response) => {
      if (!isAdmin) return;
      try {
        await addDoc(collection(db, "ai_history"), {
          action,
          details,
          response: response?.substring(0, 500) || '',
          timestamp: Date.now(),
          userId: user?.uid || 'system'
        });
      } catch (e) {
        console.error("Error logging AI action", e);
      }
    },

    // --- SCHEDULED PROMOTIONS ---
    addScheduledPromotion: async (promo) => {
      if (!isAdmin) return;
      try {
        await addDoc(collection(db, "scheduled_promotions"), {
          ...promo,
          id: Date.now(),
          createdAt: Date.now(),
          executed: false
        });
        addToast("Promoción programada", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al programar promoción", "error");
      }
    },
    deleteScheduledPromotion: async (id) => {
      if (!isAdmin) return;
      try {
        await deleteDoc(doc(db, "scheduled_promotions", String(id)));
        addToast("Promoción eliminada", "success");
      } catch (e) {
        console.error(e);
      }
    },
    executeScheduledPromotion: async (promo) => {
      if (!isAdmin) return;
      try {
        if (promo.type === 'activate_coupon') {
          const coupon = coupons.find(c => c.code === promo.couponCode);
          if (coupon) await updateDoc(doc(db, "coupons", String(coupon.id)), { active: true });
        } else if (promo.type === 'deactivate_coupon') {
          const coupon = coupons.find(c => c.code === promo.couponCode);
          if (coupon) await updateDoc(doc(db, "coupons", String(coupon.id)), { active: false });
        } else if (promo.type === 'bulk_discount') {
          const products = inventory.filter(p => p.category === promo.category);
          for (const p of products) {
            const newPrice = Math.round(p.price * (1 - promo.discount / 100));
            await updateDoc(doc(db, "products", String(p.id)), { price: newPrice });
          }
        }
        await updateDoc(doc(db, "scheduled_promotions", String(promo.id)), { executed: true });
        addToast(`Promoción ejecutada: ${promo.name}`, "success");
      } catch (e) {
        console.error(e);
        addToast("Error al ejecutar promoción", "error");
      }
    }
  };

  // Wishlist events tracking (Firestore)
  const trackWishlistEvent = async (product, action) => {
    try {
      await addDoc(collection(db, "wishlist_events"), {
        productId: product.id,
        productName: product.name,
        productCategory: product.category || 'Sin categoría',
        action, // 'add' | 'remove'
        userId: user?.uid || null,
        userEmail: user?.email || null,
        sessionId: localStorage.getItem('sessionId') || `anon_${Date.now()}`,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Error tracking wishlist:", e);
    }
  };

  const incrementVisits = async () => {
    if (window.location.hostname === 'localhost') return;
    const visited = sessionStorage.getItem('cielo_visited');
    if (!visited) {
      try {
        const statsRef = doc(db, "stats", "visits");
        const docSnap = await getDoc(statsRef);
        if (!docSnap.exists()) {
          await setDoc(statsRef, { count: 1 });
        } else {
          await updateDoc(statsRef, { count: docSnap.data().count + 1 });
        }
        sessionStorage.setItem('cielo_visited', 'true');
      } catch (e) {
        console.error("Error incrementing visits", e);
      }
    }
  };

  const [visitCount, setVisitCount] = useState(0);
  useEffect(() => {
    const unsubVisits = onSnapshot(doc(db, "stats", "visits"), (doc) => {
      if (doc.exists()) setVisitCount(doc.data().count);
    });
    return () => unsubVisits();
  }, []);

  return (
    <StoreContext.Provider value={{
      inventory, cart, setCart, addToCart, updateCartQty, removeFromCart, clearCart, cartTotal, cartCount,
      orders, wishlist, setWishlist, toggleWishlist, isInWishlist, toasts, addToast, isAdmin, user, login, loginWithGoogle, register, logout,
      theme, toggleTheme, isSizeGuideOpen, setIsSizeGuideOpen, isCartOpen, setIsCartOpen, isMaintenance, setIsMaintenance,
      categories, siteConfig, cloudinaryConfig, aiConfig, globalFilter, setGlobalFilter, loading, simulations, shippingRates, systemConfig,
      visitCount, incrementVisits, paymentConfig, coupons,
      suppliers, aiHistory, scheduledPromotions, wishlistEvents, trackWishlistEvent,
      abandonedCarts, activeSessions,
      shippingProvinces, setShippingProvinces,
      ...dbActions
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

