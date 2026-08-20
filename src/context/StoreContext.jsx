import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, increment } from 'firebase/firestore';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../lib/cloudinaryConfig';
import { useFirestoreSubscriptions } from '../hooks/useFirestoreSubscriptions';
import { useCart } from '../hooks/useCart';
import { useDbActions } from '../hooks/useDbActions';
import { useAuth } from '../hooks/useAuth';

const StoreContext = createContext();

let toastSeq = 0;

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
    showMarquee: true,
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
      instagram: "https://www.instagram.com/laboutiquedelaeleganciaoficial/",
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
    cerebrasKey: "",   // IA principal (Cerebras) — texto
    cerebrasModel: "", // opcional: override de modelo
    adminKeys: "",     // Gemini (fallback admin + VISIÓN primaria)
    customerKeys: "",  // Gemini (fallback clientes)
    nvidiaKey: "",     // NVIDIA NIM — VISIÓN de fallback detrás de Gemini
    nvidiaModel: "",   // opcional: override (meta/llama-3.2-90b-vision-instruct por defecto)
  });

  const [simulations, setSimulations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [scheduledPromotions, setScheduledPromotions] = useState([]);
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
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
    setAbandonedCarts, setActiveSessions, setExpenses, setNewsletterSubscribers
  });

  // --- THEME (dark-only: el diseño de la web es oscuro por decisión) ---
  useEffect(() => {
    if (document.documentElement?.classList) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => { /* tema fijo: dark */ };

  const addToast = (msg, type = 'info') => {
    // ID único: Date.now() colisiona si se crean varios toasts en el mismo
    // ms (ej. al subir imagen) → keys duplicadas en React → toast pegado.
    const id = `${Date.now()}-${++toastSeq}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // --- CART + WISHLIST (extraídos a hook dedicado) ---
  const {
    addToCart, updateCartQty, removeFromCart, clearCart,
    cartTotal, cartCount, toggleWishlist, isInWishlist
  } = useCart({ cart, setCart, wishlist, setWishlist, inventory, addToast });

  // --- AUTH (extraído a hook dedicado) ---
  const { isAdmin, login, loginWithGoogle, register, logout, loginAnonymously, linkGuestWithGoogle } = useAuth({
    user, wishlist, setWishlist, addToast
  });

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

  const dbActions = useDbActions({
    isAdmin, user, addToast, cloudinaryConfig, inventory, orders, reviews,
    coupons, siteConfig, paymentConfig, isMaintenance, setIsMaintenance
  });

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
        // Incremento atómico (evita la race condition del read-modify-write:
        // dos visitantes concurrentes perdían cuentas). merge:true crea el doc
        // si no existe.
        const statsRef = doc(db, "stats", "visits");
        await setDoc(statsRef, { count: increment(1) }, { merge: true });
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
      orders, wishlist, setWishlist, toggleWishlist, isInWishlist, toasts, addToast, isAdmin, user, login, loginWithGoogle, register, logout, loginAnonymously, linkGuestWithGoogle,
      theme, toggleTheme, isSizeGuideOpen, setIsSizeGuideOpen, isCartOpen, setIsCartOpen, isMaintenance, setIsMaintenance,
      categories, siteConfig, cloudinaryConfig, aiConfig, loading, simulations, shippingRates, systemConfig,
      visitCount, incrementVisits, paymentConfig, coupons,
      suppliers, aiHistory, scheduledPromotions, wishlistEvents, trackWishlistEvent,
      abandonedCarts, activeSessions, reviews, visitStatsHourly, expenses, newsletterSubscribers,
      shippingProvinces, setShippingProvinces,
      ...dbActions
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

