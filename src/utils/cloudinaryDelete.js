// Borra imágenes de Cloudinary vía el endpoint server-side (la API Secret vive
// sólo en Vercel). Si el endpoint no está configurado, no pasa nada (no rompe).
import { auth } from '../lib/firebase';

const ENDPOINT = 'https://tienda-boutique-elegancia.vercel.app/api/cloudinary-delete';

// Extrae el public_id de una URL de Cloudinary (saca la versión vNNN, posibles
// transformaciones iniciales y la extensión del archivo).
export const publicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const after = url.split('/upload/')[1];
    if (!after) return null;
    const segments = after.split('/').filter((seg, i) => {
        if (/^v\d+$/.test(seg)) return false;                        // versión
        if (i === 0 && /[,]/.test(seg)) return false;                // transformación (c_fill,w_160…)
        return true;
    });
    const path = segments.join('/');
    return path.replace(/\.[a-zA-Z0-9]+$/, '') || null;
};

// Borra UNA imagen. Silencioso: cualquier fallo no debe frenar el borrado del producto.
export const deleteCloudinaryImage = async (url, cloudName) => {
    try {
        const publicId = publicIdFromUrl(url);
        if (!publicId || !cloudName) return;
        const user = auth.currentUser;
        if (!user) return;
        const idToken = await user.getIdToken();
        await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, cloudName, publicId }),
        });
    } catch {
        /* no-op: la limpieza de imágenes es best-effort */
    }
};

// Borra todas las imágenes de un producto (image + media).
export const deleteProductImages = async (product, cloudName) => {
    if (!product || !cloudName) return;
    const urls = new Set();
    if (product.image) urls.add(product.image);
    (product.media || []).forEach(m => { if (m?.url) urls.add(m.url); });
    (product.images || []).forEach(u => { if (typeof u === 'string') urls.add(u); });
    for (const u of urls) { await deleteCloudinaryImage(u, cloudName); }
};
