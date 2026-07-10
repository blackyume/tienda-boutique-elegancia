// Utilidades de variantes (talla × color).
//
// Modelo soportado (backcompat):
//   product.stock (number)                -> stock global (legacy)
//   product.variants ({ [key]: number })  -> stock por variante (nuevo)
//
// `key` = `${size}::${color}`. Si el producto no tiene `variants`, se asume
// que todas las combinaciones talla/color comparten `product.stock`.

export const variantKey = (size, color) => `${size || ''}::${color || ''}`;

export const hasVariantMap = (product) => {
    if (!product || !product.variants) return false;
    if (Array.isArray(product.variants)) return product.variants.length > 0;
    return typeof product.variants === 'object';
};

export const getVariantStock = (product, size, color) => {
    if (!product) return 0;
    if (!hasVariantMap(product)) {
        return typeof product.stock === 'number' ? product.stock : 0;
    }
    if (Array.isArray(product.variants)) {
        const v = product.variants.find((x) => x.size === size && x.color === color);
        return v && typeof v.stock === 'number' ? v.stock : 0;
    }
    const v = product.variants[variantKey(size, color)];
    return typeof v === 'number' ? v : 0;
};

export const getVariantPrice = (product, size, color) => {
    if (!product) return 0;
    if (Array.isArray(product?.variants)) {
        const v = product.variants.find((x) => x.size === size && x.color === color);
        if (v && typeof v.price === 'number' && v.price > 0) return v.price;
    }
    return typeof product.price === 'number' ? product.price : Number(product.price) || 0;
};

export const getTotalStock = (product) => {
    if (!product) return 0;
    if (!hasVariantMap(product)) {
        return typeof product.stock === 'number' ? product.stock : 0;
    }
    if (Array.isArray(product.variants)) {
        return product.variants.reduce(
            (acc, v) => acc + (typeof v.stock === 'number' && v.stock > 0 ? v.stock : 0),
            0
        );
    }
    return Object.values(product.variants).reduce(
        (acc, n) => acc + (typeof n === 'number' && n > 0 ? n : 0),
        0
    );
};

export const isVariantInStock = (product, size, color) =>
    getVariantStock(product, size, color) > 0;

// ¿Una talla está disponible en al menos un color?
export const isSizeAvailable = (product, size) => {
    if (!product) return false;
    if (!hasVariantMap(product)) return getTotalStock(product) > 0;
    const colors = product.colors || [];
    // Producto con variantes por talle pero SIN colores: chequear la clave `size::`.
    if (!colors.length) return getVariantStock(product, size, '') > 0;
    return colors.some((c) => getVariantStock(product, size, c) > 0);
};

// ¿Un color está disponible en al menos una talla?
export const isColorAvailable = (product, color) => {
    if (!product) return false;
    if (!hasVariantMap(product)) return getTotalStock(product) > 0;
    const sizes = product.sizes || [];
    if (!sizes.length) return getVariantStock(product, '', color) > 0;
    return sizes.some((s) => getVariantStock(product, s, color) > 0);
};

// Stock disponible luego de restar lo que el usuario ya tiene en el carrito.
export const availableAfterCart = (product, size, color, cart) => {
    const stock = getVariantStock(product, size, color);
    const inCart = (cart || [])
        .filter((i) => String(i.id) === String(product.id) && i.size === size && i.color === color)
        .reduce((acc, i) => acc + i.quantity, 0);
    return Math.max(0, stock - inCart);
};
