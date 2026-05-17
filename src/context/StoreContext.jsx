import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, increment, query, where } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { storage, auth } from '../lib/firebase';
import imageCompression from 'browser-image-compression';
import { availableAfterCart, getTotalStock, getVariantStock } from '../utils/variants';
import { trackAddToCart, trackRemoveFromCart, trackAddToWishlist } from '../utils/analytics';
import { buildReferralCode } from '../utils/referral';
import { isAdminEmail } from '../utils/admins';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../lib/cloudinaryConfig';
import { useFirestoreSubscriptions } from '../hooks/useFirestoreSubscriptions';
import { useCart } from '../hooks/useCart';

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
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET
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
  const [reviews, setReviews] = useState([]);
  const [visitStatsHourly, setVisitStatsHourly] = useState([]);

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

  // --- FIREBASE SUBSCRIPTIONS (extraídas a hook dedicado) ---
  useFirestoreSubscriptions({
    user,
    setUser, setInventory, setCategories, setSiteConfig, setCloudinaryConfig,
    setAiConfig, setIsMaintenance, setCoupons, setReviews, setShippingProvinces,
    setLoading, setOrders, setSimulations, setSuppliers, setAiHistory,
    setScheduledPromotions, setWishlistEvents, setVisitStatsHourly,
    setAbandonedCarts, setActiveSessions
  });

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

  // --- CART + WISHLIST (extraídos a hook dedicado) ---
  const {
    addToCart, updateCartQty, removeFromCart, clearCart,
    cartTotal, cartCount, toggleWishlist, isInWishlist
  } = useCart({ cart, setCart, wishlist, setWishlist, inventory, addToast });

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
            const patch = {};
            if (remote.length !== merged.length) patch.wishlist = merged;
            if (!data.referralCode) patch.referralCode = buildReferralCode(user.uid);
            if (Object.keys(patch).length > 0) await updateDoc(doc(db, "users", user.uid), patch);
          } else {
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              role: 'customer',
              wishlist: (wishlist || []).map(w => String(w?.id ?? w)),
              referralCode: buildReferralCode(user.uid),
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

  // Admin SOLO por email whitelisteado (utils/admins.js). El role se ignora a propósito.
  const isAdmin = isAdminEmail(user?.email);

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
        await updateDoc(doc(db, "products", String(id)), { views: increment(1) });
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
        addToast("No tenés permisos de administrador", "error");
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

    // --- CLOUDINARY UPLOAD (público, para reviews) ---
    uploadReviewImage: async (file) => {
      if (!file) return null;
      if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
        throw new Error("Cloudinary no configurado");
      }
      // Tamaño más chico para reviews (1200px max, 70% calidad)
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/jpeg', initialQuality: 0.7 };
      let fileToUpload = file;
      try { fileToUpload = await imageCompression(file, options); } catch { }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", cloudinaryConfig.uploadPreset);
      formData.append("folder", "reviews");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      return data.secure_url;
    },

    // --- REVIEWS ---
    addReview: async ({ productId, rating, text, photos = [] }) => {
      if (!user) throw new Error("Tenés que iniciar sesión");
      if (!productId || !rating || !text) throw new Error("Faltan datos");

      // Validar que el user compró el producto (client-side)
      const hasBought = orders.some(o => {
        const orderUserId = o.customer?.userId || o.userId;
        if (orderUserId !== user.uid) return false;
        return (o.items || []).some(it => String(it.id) === String(productId));
      });
      if (!hasBought) throw new Error("Solo quienes compraron este producto pueden dejar reseña");

      // Evitar reviews duplicadas del mismo user al mismo producto
      const existing = reviews.find(r => r.userId === user.uid && String(r.productId) === String(productId));
      if (existing) throw new Error("Ya dejaste una reseña para este producto");

      const review = {
        productId: String(productId),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Cliente',
        rating: Math.min(5, Math.max(1, Number(rating))),
        text: String(text).slice(0, 1000),
        photos: Array.isArray(photos) ? photos.slice(0, 4) : [],
        approved: false,
        createdAt: Date.now()
      };
      await addDoc(collection(db, "reviews"), review);
      return review;
    },

    approveReview: async (id) => {
      if (!isAdmin) return;
      await updateDoc(doc(db, "reviews", String(id)), { approved: true });
      addToast("Reseña aprobada", "success");
    },

    rejectReview: async (id) => {
      if (!isAdmin) return;
      await deleteDoc(doc(db, "reviews", String(id)));
      addToast("Reseña eliminada", "success");
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
      abandonedCarts, activeSessions, reviews, visitStatsHourly,
      shippingProvinces, setShippingProvinces,
      ...dbActions
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

