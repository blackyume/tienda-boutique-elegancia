import { useMemo } from 'react';
import { availableAfterCart, getVariantStock } from '../utils/variants';
import { trackAddToCart, trackRemoveFromCart, trackAddToWishlist } from '../utils/analytics';

// Lógica de carrito + wishlist extraída de StoreContext (verbatim).
// Recibe el estado y devuelve las acciones; comportamiento idéntico.
export const useCart = ({ cart, setCart, wishlist, setWishlist, inventory, addToast }) => {
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

    return {
        addToCart, updateCartQty, removeFromCart, clearCart,
        cartTotal, cartCount, toggleWishlist, isInWishlist
    };
};
