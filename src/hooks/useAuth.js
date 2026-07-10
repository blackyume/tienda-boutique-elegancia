import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously, linkWithPopup } from 'firebase/auth';
import { buildReferralCode } from '../utils/referral';
import { isAdminEmail } from '../utils/admins';

// Auth + sync de user doc / wishlist, extraído de StoreContext (verbatim).
// Recibe el `user` (de la suscripción onAuthStateChanged) y el estado de
// wishlist; devuelve isAdmin/role + acciones de sesión.
export const useAuth = ({ user, wishlist, setWishlist, addToast }) => {
  const [userRole, setUserRole] = useState('customer');
  const [wishlistSyncedForUid, setWishlistSyncedForUid] = useState(null);

  useEffect(() => {
    // Invitados (login anónimo) no crean doc de usuario ni sincronizan wishlist:
    // compran sin registrarse y no ensucian la colección `users`.
    if (user && !user.isAnonymous) {
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

  // Crea el doc del usuario si no existe (lo usan tanto popup como redirect).
  const ensureUserDoc = async (user) => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        role: 'customer',
        createdAt: Date.now()
      });
    }
  };

  // Al volver de un login por redirección (fallback cuando el popup está
  // bloqueado), retomamos la sesión y creamos el doc si hace falta.
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await ensureUserDoc(result.user);
        addToast("Sesión iniciada con Google", "success");
      }
    }).catch((err) => {
      if (err?.code && err.code !== 'auth/no-current-user') console.warn('[auth] redirect result:', err.code);
    });
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
      addToast("Sesión iniciada con Google", "success");
      return true;
    } catch (error) {
      // Si el navegador bloquea el popup (preview, algunos celulares, etc.),
      // caemos a login por redirección, que siempre funciona.
      if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/operation-not-supported-in-this-environment'].includes(error?.code)) {
        try {
          await signInWithRedirect(auth, provider);
          return true; // navega afuera; el resultado lo toma el useEffect al volver
        } catch (redirErr) {
          console.error("Google Redirect Error:", redirErr);
          addToast(`Error Google: ${redirErr.code || redirErr.message}`, "error");
          return false;
        }
      }
      console.error("Google Login Error:", error);
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

  // Sesión de INVITADO: da un uid interno sin pedir registro (compra sin fricción).
  // Devuelve el user, o null si Anonymous Auth no está habilitado en Firebase
  // (ahí el checkout cae al modal de login como respaldo).
  const loginAnonymously = async () => {
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (error) {
      console.warn('[auth] login anónimo falló:', error?.code || error?.message);
      return null;
    }
  };

  // Convierte una sesión de INVITADO en cuenta real con Google, CONSERVANDO el
  // mismo uid (así los pedidos hechos como invitado siguen siendo suyos).
  const linkGuestWithGoogle = async () => {
    const u = auth.currentUser;
    if (!u || !u.isAnonymous) return false;
    try {
      const result = await linkWithPopup(u, new GoogleAuthProvider());
      await ensureUserDoc(result.user);
      addToast("¡Cuenta creada! Ya podés seguir tus pedidos.", "success");
      return true;
    } catch (error) {
      if (error?.code === 'auth/credential-already-in-use') {
        addToast("Ese Google ya tiene una cuenta. Iniciá sesión con él.", "info");
      } else if (!['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error?.code)) {
        console.error("Link guest error:", error);
        addToast("No se pudo crear la cuenta ahora.", "error");
      }
      return false;
    }
  };

  return { isAdmin, userRole, login, loginWithGoogle, register, logout, loginAnonymously, linkGuestWithGoogle };
};
