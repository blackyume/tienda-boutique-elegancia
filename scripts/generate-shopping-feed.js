// Genera public/feed.xml compatible con Google Merchant Center / Shopping.
// Se corre en el prebuild. Si Firestore no responde, escribe un feed mínimo
// vacío (válido) para no romper el build.
//
// Schema: https://support.google.com/merchants/answer/7052112
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'la-boutique-de-la-elegancia';
const SITE_URL = 'https://la-boutique-de-la-elegancia.web.app';
const OUTPUT = resolve(__dirname, '..', 'public', 'feed.xml');

const escapeXml = (s) =>
    String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const extractValue = (fieldValue) => {
    if (!fieldValue) return null;
    if ('stringValue' in fieldValue) return fieldValue.stringValue;
    if ('integerValue' in fieldValue) return Number(fieldValue.integerValue);
    if ('doubleValue' in fieldValue) return fieldValue.doubleValue;
    if ('booleanValue' in fieldValue) return fieldValue.booleanValue;
    if ('arrayValue' in fieldValue) {
        return (fieldValue.arrayValue.values || []).map(extractValue);
    }
    if ('mapValue' in fieldValue) {
        const out = {};
        for (const [k, v] of Object.entries(fieldValue.mapValue.fields || {})) {
            out[k] = extractValue(v);
        }
        return out;
    }
    return null;
};

const fetchProducts = async () => {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=300`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Firestore REST returned ${res.status}`);
    const data = await res.json();
    const docs = Array.isArray(data.documents) ? data.documents : [];
    const products = [];
    for (const d of docs) {
        const id = d.name.split('/').pop();
        const f = d.fields || {};
        if (f.active?.booleanValue === false) continue;
        const product = {};
        for (const [k, v] of Object.entries(f)) product[k] = extractValue(v);
        product.id = id;
        products.push(product);
    }
    return products;
};

const totalStockOf = (p) => {
    if (Array.isArray(p.variants)) {
        return p.variants.reduce((acc, v) => acc + (typeof v?.stock === 'number' ? Math.max(0, v.stock) : 0), 0);
    }
    if (p.variants && typeof p.variants === 'object') {
        return Object.values(p.variants).reduce((acc, n) => acc + (typeof n === 'number' ? Math.max(0, n) : 0), 0);
    }
    return typeof p.stock === 'number' ? p.stock : 0;
};

const itemTag = (p) => {
    const id = p.id;
    const title = p.name || 'Producto';
    const description = p.description || p.name || 'La Boutique de la Elegancia';
    const link = `${SITE_URL}/product/${id}`;
    const imageLink = p.image || '';
    const price = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
    const availability = totalStockOf(p) > 0 ? 'in stock' : 'out of stock';
    const category = p.category || 'Apparel & Accessories';
    const brand = 'La Boutique de la Elegancia';
    const condition = 'new';

    return [
        '    <item>',
        `      <g:id>${escapeXml(id)}</g:id>`,
        `      <g:title>${escapeXml(title)}</g:title>`,
        `      <g:description>${escapeXml(description)}</g:description>`,
        `      <g:link>${escapeXml(link)}</g:link>`,
        imageLink ? `      <g:image_link>${escapeXml(imageLink)}</g:image_link>` : null,
        `      <g:availability>${availability}</g:availability>`,
        `      <g:price>${price.toFixed(2)} ARS</g:price>`,
        `      <g:brand>${escapeXml(brand)}</g:brand>`,
        `      <g:condition>${condition}</g:condition>`,
        `      <g:product_type>${escapeXml(category)}</g:product_type>`,
        `      <g:identifier_exists>no</g:identifier_exists>`,
        '    </item>'
    ].filter(Boolean).join('\n');
};

const build = async () => {
    let products = [];
    try {
        products = await fetchProducts();
        console.log(`[shopping-feed] ${products.length} productos incluidos`);
    } catch (err) {
        console.warn(`[shopping-feed] Firestore no respondió (${err.message}); feed vacío`);
    }

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
        '  <channel>',
        '    <title>La Boutique de la Elegancia</title>',
        `    <link>${SITE_URL}</link>`,
        '    <description>Moda femenina premium — Argentina</description>',
        ...products.map(itemTag),
        '  </channel>',
        '</rss>',
        ''
    ].join('\n');

    await writeFile(OUTPUT, xml, 'utf8');
    console.log(`[shopping-feed] escrito en ${OUTPUT}`);
};

build().catch((err) => {
    console.error('[shopping-feed] fallo inesperado:', err);
    process.exit(0);
});
