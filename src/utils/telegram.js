// Cliente para el endpoint api/telegram-post.js
// La URL base sigue la misma convención que Mercado Pago (mpApiUrl en siteConfig).
// Si hay admin secret configurado en el server, el user debe pegar el mismo
// en siteConfig.telegram.secret (opcional, recomendado).

const getApiBase = (siteConfig) => {
    const base = siteConfig?.mpApiUrl || siteConfig?.apiBaseUrl || '';
    if (base && typeof base === 'string') {
        // mpApiUrl suele ser ".../api/create-preference" -> tomamos la raíz api/
        return base.replace(/\/api\/[^/]+$/, '/api');
    }
    // Fallback: same-origin /api
    if (typeof window !== 'undefined') return `${window.location.origin}/api`;
    return '/api';
};

export const publishProductToTelegram = async (product, siteConfig) => {
    const apiBase = getApiBase(siteConfig);
    const url = `${apiBase}/telegram-post`;
    const secret = siteConfig?.telegram?.secret || '';
    const storeUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const payload = {
        type: 'product',
        product: {
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            url: product.id ? `${storeUrl}/product/${product.id}` : storeUrl
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(secret ? { 'X-Admin-Secret': secret } : {})
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
};

export const publishMessageToTelegram = async ({ message, imageUrl }, siteConfig) => {
    const apiBase = getApiBase(siteConfig);
    const url = `${apiBase}/telegram-post`;
    const secret = siteConfig?.telegram?.secret || '';

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(secret ? { 'X-Admin-Secret': secret } : {})
        },
        body: JSON.stringify({ type: 'message', message, imageUrl })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
};
