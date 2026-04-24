// Utilidades de variantes (talla × color).
//
// Modelo soportado (backcompat):
//   product.stock (number)                -> stock global (legacy)
//   product.variants ({ [key]: number })  -> stock por variante (nuevo)
//
// `key` = `${size}::${color}`. Si el producto no tiene `variants`, se asume
// que todas las combinaciones talla/color comparten `product.stock`.

export const variantKey = (size, color) => `${size || ''}::${color || ''}`;

export const hasVariantMap = (product) =>
    product && product.variants && typeof product.variants === 'object';

export const getVariantStock = (product, size, color) => {
    if (!product) return 0;
    if (hasVariantMap(product)) {
        const v = product.variants[variantKey(size, color)];
        return typeof v === 'number' ? v : 0;
    }
    return typeof product.stock === 'number' ? product.stock : 0;
};

export const getTotalStock = (product) => {
    if (!product) return 0;
    if (hasVariantMap(product)) {
        return Object.values(product.variants).reduce(
            (acc, n) => acc + (typeof n === 'number' && n > 0 ? n : 0),
            0
        );
    }
    return typeof product.stock === 'number' ? product.stock : 0;
};

export const isVariantInStock = (product, size, color) =>
    getVariantStock(product, size, color) > 0;

// ¿Una talla está disponible en al menos un color?
export const isSizeAvailable = (product, size) => {
    if (!product) return false;
    if (!hasVariantMap(product)) return getTotalStock(product) > 0;
    return (product.colors || []).some((c) => getVariantStock(product, size, c) > 0);
};

// ¿Un color está disponible en al menos una talla?
export const isColorAvailable = (product, color) => {
    if (!product) return false;
    if (!hasVariantMap(product)) return getTotalStock(product) > 0;
    return (product.sizes || []).some((s) => getVariantStock(product, s, color) > 0);
};

// Stock disponible luego de restar lo que el usuario ya tiene en el carrito.
export const availableAfterCart = (product, size, color, cart) => {
    const stock = getVariantStock(product, size, color);
    const inCart = (cart || [])
        .filter((i) => String(i.id) === String(product.id) && i.size === size && i.color === color)
        .reduce((acc, i) => acc + i.quantity, 0);
    return Math.max(0, stock - inCart);
};
