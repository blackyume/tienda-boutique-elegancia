// Pricing/stock server-side — espejo CommonJS de src/utils/variants.js.
// El servidor NO confía en precios del cliente: recalcula contra Firestore.

const variantKey = (size, color) => `${size || ''}::${color || ''}`;

const hasVariantMap = (product) => {
    if (!product || !product.variants) return false;
    if (Array.isArray(product.variants)) return product.variants.length > 0;
    return typeof product.variants === 'object';
};

const getVariantStock = (product, size, color) => {
    if (!product) return 0;
    if (!hasVariantMap(product)) {
        return typeof product.stock === 'number' ? product.stock : Number(product.stock) || 0;
    }
    if (Array.isArray(product.variants)) {
        const v = product.variants.find((x) => x.size === size && x.color === color);
        return v && typeof v.stock === 'number' ? v.stock : 0;
    }
    const v = product.variants[variantKey(size, color)];
    return typeof v === 'number' ? v : 0;
};

const getVariantPrice = (product, size, color) => {
    if (!product) return 0;
    if (Array.isArray(product.variants)) {
        const v = product.variants.find((x) => x.size === size && x.color === color);
        if (v && Number(v.price) > 0) return Number(v.price);
    }
    return Number(product.price) || 0;
};

const getTotalStock = (product) => {
    if (!product) return 0;
    if (!hasVariantMap(product)) {
        return typeof product.stock === 'number' ? product.stock : Number(product.stock) || 0;
    }
    if (Array.isArray(product.variants)) {
        return product.variants.reduce((acc, v) => acc + (Number(v.stock) > 0 ? Number(v.stock) : 0), 0);
    }
    return Object.values(product.variants).reduce((acc, n) => acc + (Number(n) > 0 ? Number(n) : 0), 0);
};

// Devuelve un objeto con los campos de stock decrementados para escribir en
// Firestore, o lanza Error si no hay stock suficiente. Idempotencia la maneja
// el caller (flag stockApplied en la orden).
const applyStockDecrement = (product, lines) => {
    // lines: [{ size, color, quantity }] del MISMO producto
    if (!hasVariantMap(product)) {
        const current = Number(product.stock) || 0;
        const need = lines.reduce((a, l) => a + (Number(l.quantity) || 0), 0);
        if (current < need) throw new Error(`Sin stock para ${product.name || product.id}`);
        return { stock: current - need };
    }
    if (Array.isArray(product.variants)) {
        const variants = product.variants.map(v => ({ ...v }));
        for (const l of lines) {
            const v = variants.find(x => x.size === l.size && x.color === l.color);
            if (!v) throw new Error(`Variante inexistente ${l.size}/${l.color} en ${product.name || product.id}`);
            const cur = Number(v.stock) || 0;
            if (cur < Number(l.quantity)) throw new Error(`Sin stock de ${l.size}/${l.color} en ${product.name || product.id}`);
            v.stock = cur - Number(l.quantity);
        }
        return { variants };
    }
    const map = { ...product.variants };
    for (const l of lines) {
        const k = variantKey(l.size, l.color);
        const cur = Number(map[k]) || 0;
        if (cur < Number(l.quantity)) throw new Error(`Sin stock de ${l.size}/${l.color} en ${product.name || product.id}`);
        map[k] = cur - Number(l.quantity);
    }
    return { variants: map };
};

// Devuelve los campos de stock REPUESTOS (para refund/cancel tras aprobar).
const applyStockRestore = (product, lines) => {
    if (!hasVariantMap(product)) {
        const current = Number(product.stock) || 0;
        const back = lines.reduce((a, l) => a + (Number(l.quantity) || 0), 0);
        return { stock: current + back };
    }
    if (Array.isArray(product.variants)) {
        const variants = product.variants.map(v => ({ ...v }));
        for (const l of lines) {
            const v = variants.find(x => x.size === l.size && x.color === l.color);
            if (v) v.stock = (Number(v.stock) || 0) + Number(l.quantity);
        }
        return { variants };
    }
    const map = { ...product.variants };
    for (const l of lines) {
        const k = variantKey(l.size, l.color);
        map[k] = (Number(map[k]) || 0) + Number(l.quantity);
    }
    return { variants: map };
};

module.exports = {
    variantKey, hasVariantMap, getVariantStock, getVariantPrice, getTotalStock,
    applyStockDecrement, applyStockRestore
};
