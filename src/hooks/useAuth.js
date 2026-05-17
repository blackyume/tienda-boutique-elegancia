import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { buildReferralCode } from '../utils/referral';
import { isAdminEmail } from '../utils/admins';

// Auth + sync de user doc / wishlist, extraído de StoreContext (verbatim).
// Recibe el `user` (de la suscripción onAuthStateChanged) y el estado de
// wishlist; devuelve isAdmin/role + acciones de sesión.
export const useAuth = ({ user, wishlist, setWishlist, addToast }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return { isAdmin, userRole, login, loginWithGoogle, register, logout };
};
