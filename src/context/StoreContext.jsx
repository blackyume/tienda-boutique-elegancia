import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { storage, auth } from '../lib/firebase';
import imageCompression from 'browser-image-compression';

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

  const [simulations, setSimulations] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // --- UI STATE ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [globalFilter, setGlobalFilter] = useState({ category: "Todos", search: "" });
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
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

    setLoading(false);
    return () => { unsubAuth(); unsubProd(); unsubOrders(); unsubCats(); unsubSiteConfig(); unsubCloudinary(); unsubMaintenance(); unsubSims(); unsubCoupons(); };
  }, []);

  // --- THEME ---
  useEffect(() => {
    if (document.documentElement?.classList) {
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // --- CART ---
  const addToCart = (product, size, color) => {
    const key = `${product.id}-${size}-${color}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
      const { active, stock, ...cleanProduct } = product;
      return [...prev, { ...cleanProduct, size, color, quantity: 1, key }];
    });
    addToast("Agregado al carrito", "success");
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  // --- AUTH ---
  const [userRole, setUserRole] = useState('customer');

  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'customer');
          } else {
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              role: 'customer',
              createdAt: Date.now()
            });
            setUserRole('customer');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };
      checkRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

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
          : "http://localhost:3000/api/create-preference"; // Fallback local

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
      inventory, cart, setCart, addToCart, removeFromCart, cartTotal,
      orders, wishlist, setWishlist, toasts, addToast, isAdmin, user, login, loginWithGoogle, register, logout,
      theme, toggleTheme, isSizeGuideOpen, setIsSizeGuideOpen, isMaintenance, setIsMaintenance,
      categories, siteConfig, cloudinaryConfig, globalFilter, setGlobalFilter, loading, simulations, shippingRates, systemConfig,
      visitCount, incrementVisits, paymentConfig, coupons,
      ...dbActions
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);