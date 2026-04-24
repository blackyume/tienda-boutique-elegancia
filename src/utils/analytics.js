// GA4 conversion tracking helpers. gtag is loaded from index.html.
const hasGtag = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

const safeGtag = (...args) => {
    try {
        if (hasGtag()) window.gtag(...args);
    } catch (_) { /* no-op */ }
};

const toItem = (p, opts = {}) => ({
    item_id: String(p.id ?? ''),
    item_name: p.name ?? '',
    item_category: p.category ?? '',
    item_variant: [opts.size, opts.color].filter(Boolean).join(' / ') || undefined,
    price: Number(p.price) || 0,
    quantity: opts.quantity || 1,
});

export const trackViewItem = (product) => {
    if (!product) return;
    safeGtag('event', 'view_item', {
        currency: 'ARS',
        value: Number(product.price) || 0,
        items: [toItem(product)],
    });
};

export const trackAddToCart = (product, size, color, quantity = 1) => {
    if (!product) return;
    safeGtag('event', 'add_to_cart', {
        currency: 'ARS',
        value: (Number(product.price) || 0) * quantity,
        items: [toItem(product, { size, color, quantity })],
    });
};

export const trackRemoveFromCart = (item) => {
    if (!item) return;
    safeGtag('event', 'remove_from_cart', {
        currency: 'ARS',
        value: (Number(item.price) || 0) * (item.quantity || 1),
        items: [toItem(item, { size: item.size, color: item.color, quantity: item.quantity })],
    });
};

export const trackBeginCheckout = (cart, total) => {
    if (!cart || cart.length === 0) return;
    safeGtag('event', 'begin_checkout', {
        currency: 'ARS',
        value: Number(total) || cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0),
        items: cart.map(i => toItem(i, { size: i.size, color: i.color, quantity: i.quantity })),
    });
};

export const trackPurchase = ({ id, total, cart, coupon, shipping, tax }) => {
    if (!cart || cart.length === 0) return;
    safeGtag('event', 'purchase', {
        transaction_id: String(id || `ORD-${Date.now()}`),
        currency: 'ARS',
        value: Number(total) || 0,
        coupon: coupon || undefined,
        shipping: Number(shipping) || 0,
        tax: Number(tax) || 0,
        items: cart.map(i => toItem(i, { size: i.size, color: i.color, quantity: i.quantity })),
    });
};

export const trackSearch = (term) => {
    if (!term) return;
    safeGtag('event', 'search', { search_term: String(term) });
};

export const trackAddToWishlist = (product) => {
    if (!product) return;
    safeGtag('event', 'add_to_wishlist', {
        currency: 'ARS',
        value: Number(product.price) || 0,
        items: [toItem(product)],
    });
};
