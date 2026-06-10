import { useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, increment } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { deleteProductImages } from '../utils/cloudinaryDelete';

// Email transaccional al cliente vía EmailJS (credenciales en Admin → Configuración).
// type: 'confirmed' (pedido recibido) | 'shipped' (pedido enviado).
// Lanza error si EmailJS no está configurado; el caller decide si lo silencia.
const sendCustomerEmail = async (siteConfig, order, opts = {}) => {
  const type = opts.type || 'confirmed';
  const ej = siteConfig?.emailjs || {};
  const SERVICE_ID = ej.serviceId || '';
  const PUBLIC_KEY = ej.publicKey || '';
  const TEMPLATE_ID = type === 'shipped'
    ? (ej.shippedTemplateId || ej.templateId || '')
    : (ej.templateId || '');

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS no configurado. Completá las credenciales en Admin → Configuración.');
  }

  const c = order.customer || {};
  const toEmail = c.email || order.email;
  if (!toEmail) throw new Error('El pedido no tiene email del cliente.');

  const itemsSummary = (order.items || [])
    .map(i => `${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` · ${i.color}` : ''} x${i.quantity}`)
    .join(', ') || 'Sin items';
  const address = [c.calle, c.altura, c.piso, c.ciudad, c.cp].filter(Boolean).join(' ');
  const subjectMap = {
    confirmed: `Recibimos tu pedido ${order.id || ''} 🛍️`,
    shipped: `¡Tu pedido ${order.id || ''} va en camino! 🚚`,
  };
  const messageMap = {
    confirmed: '¡Gracias por tu compra! Ya estamos preparando tu pedido con todo el cariño. Te avisamos por este medio cuando salga.',
    shipped: 'Tu pedido fue despachado y está en camino. ¡Pronto lo vas a tener en tus manos!',
  };

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_name: c.nombre || 'Cliente',
        to_email: toEmail,
        order_id: order.id || '',
        total: typeof order.total === 'number' ? `$${order.total.toLocaleString('es-AR')}` : (order.total || ''),
        items_summary: itemsSummary,
        shipping_method: order.shippingName || order.shipping || 'No especificado',
        shipping_address: address || 'Retiro en persona',
        tracking: opts.tracking || order.tracking || '',
        email_type: type,
        subject: subjectMap[type] || 'Actualización de tu pedido',
        status_label: type === 'shipped' ? 'Pedido enviado' : 'Pedido recibido',
        message: opts.message || messageMap[type] || '',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`EmailJS ${res.status}: ${text}`);
  }
};

// Todas las acciones de escritura a Firestore (CRUD productos, órdenes,
// cupones, proveedores, integraciones MP/EmailJS, etc.) extraídas de
// StoreContext. Lógica idéntica; recibe estado/closures por parámetro.
export const useDbActions = ({
  isAdmin, user, addToast, cloudinaryConfig, inventory, orders, reviews,
  coupons, siteConfig, paymentConfig, isMaintenance, setIsMaintenance
}) => {
  const dbActions = useMemo(() => ({
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
      // merge: no pisar otras llaves al guardar sólo una parte
      await setDoc(doc(db, "config", "ai_settings"), config, { merge: true });
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
      try {
        await updateDoc(doc(db, "products", String(id)), updates);
        addToast("Producto actualizado", "success");
      } catch (e) {
        console.error(e);
        addToast("Error al actualizar producto", "error");
        throw e;
      }
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
      try {
        await deleteDoc(doc(db, "products", String(id)));
        addToast("Producto eliminado", "success");
        // Limpieza de imágenes en Cloudinary (best-effort; requiere el endpoint
        // server-side con CLOUDINARY_API_SECRET en Vercel — si no está, no pasa nada).
        if (productToDelete) {
          deleteProductImages(productToDelete, cloudinaryConfig?.cloudName).catch(() => {});
        }
      } catch (e) {
        console.error(e);
        addToast("Error al eliminar producto", "error");
        throw e;
      }
    },
    createOrder: async (order) => {
      const orderId = String(order.id || Date.now());
      const orderWithUser = { ...order, userId: user?.uid || 'guest' };
      try {
        await setDoc(doc(db, "orders", orderId), orderWithUser);
      } catch (e) {
        console.error("Error creando orden:", e);
        addToast("No se pudo registrar la orden. Reintentá.", "error");
        throw e;
      }
    },
    updateOrderStatus: async (id, status, extraData = {}) => {
      if (!isAdmin) return;
      const orderId = String(id);
      const PAID = ['approved', 'paid', 'shipped', 'delivered'];
      // Redimir el cupón cuando el admin confirma un pedido (típicamente uno de
      // WhatsApp, que no pasa por el webhook de MP). Idempotente vía la flag
      // couponRedeemed para no contar el uso dos veces.
      const order = (orders || []).find(o => String(o.id) === orderId);
      const couponCode = order?.couponCode || order?.coupon?.code;
      if (PAID.includes(status) && couponCode && !order?.couponRedeemed) {
        const c = coupons.find(cp => cp.code === couponCode);
        if (c?.id) {
          try {
            await updateDoc(doc(db, "coupons", String(c.id)), { usedCount: increment(1) });
            extraData = { ...extraData, couponRedeemed: true };
          } catch (e) {
            console.error("Error redeeming coupon on order confirm:", e);
          }
        }
      }
      await updateDoc(doc(db, "orders", orderId), { status, ...extraData });

      // Email automático al cliente cuando el pedido se marca como ENVIADO.
      // No bloquea ni rompe el cambio de estado si EmailJS no está configurado.
      if (status === 'shipped' && order) {
        sendCustomerEmail(siteConfig, { ...order, ...extraData }, { type: 'shipped', tracking: extraData.tracking })
          .then(() => addToast('📧 Email de envío enviado al cliente', 'success'))
          .catch((e) => console.warn('No se pudo enviar email de envío:', e.message));
      }
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

    // --- GASTOS (compra de mercadería, packaging, publicidad, etc.) ---
    addExpense: async (expense) => {
      if (!isAdmin) return;
      try {
        const ref = await addDoc(collection(db, 'expenses'), {
          amount: Number(expense.amount) || 0,
          concept: String(expense.concept || 'Gasto'),
          category: String(expense.category || 'otros'),
          date: expense.date || Date.now(),
          createdAt: Date.now(),
        });
        addToast('Gasto registrado', 'success');
        return ref.id;
      } catch (e) {
        console.error('Error añadiendo gasto:', e);
        addToast('Error al registrar el gasto', 'error');
      }
    },
    deleteExpense: async (id) => {
      if (!isAdmin) return;
      try {
        await deleteDoc(doc(db, 'expenses', String(id)));
        addToast('Gasto eliminado', 'success');
      } catch (e) {
        console.error('Error eliminando gasto:', e);
        addToast('Error al eliminar el gasto', 'error');
      }
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
            external_reference: orderData.id,
            coupon: orderData.coupon || null,
            referral: orderData.referral || null
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

    sendOrderEmail: async (order, opts = {}) => {
      return sendCustomerEmail(siteConfig, order, { type: 'confirmed', ...opts });
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
    redeemCoupon: async (id) => {
      try {
        // Incremento atómico — evita race condition de read+write.
        await updateDoc(doc(db, "coupons", String(id)), { usedCount: increment(1) });
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
  }), [isAdmin, user, addToast, cloudinaryConfig, inventory, orders, reviews, coupons, siteConfig, paymentConfig, isMaintenance, setIsMaintenance]);

  return dbActions;
};
