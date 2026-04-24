// Generate public/sitemap.xml at build time.
// Lee productos activos desde la API REST pública de Firestore (las reglas
// permiten read en /products). Si falla la red, conserva las rutas estáticas
// y el build no se rompe.

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'la-boutique-de-la-elegancia';
const SITE_URL = 'https://la-boutique-de-la-elegancia.web.app';
const OUTPUT = resolve(__dirname, '..', 'public', 'sitemap.xml');

const STATIC_ROUTES = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/shop', changefreq: 'daily', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.5' },
    { loc: '/wishlist', changefreq: 'weekly', priority: '0.4' },
    { loc: '/tracking', changefreq: 'monthly', priority: '0.3' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.2' },
];

const urlTag = ({ loc, changefreq, priority, lastmod }) => {
    const absolute = loc.startsWith('http') ? loc : `${SITE_URL}${loc}`;
    return [
        '  <url>',
        `    <loc>${absolute}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        '  </url>',
    ].filter(Boolean).join('\n');
};

const fetchActiveProducts = async () => {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=300`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Firestore REST returned ${res.status}`);
    const data = await res.json();
    const docs = Array.isArray(data.documents) ? data.documents : [];
    const products = [];
    for (const d of docs) {
        const id = d.name.split('/').pop();
        const fields = d.fields || {};
        const active = fields.active?.booleanValue;
        if (active === false) continue;
        const updateTime = d.updateTime || d.createTime || null;
        products.push({ id, updatedAt: updateTime });
    }
    return products;
};

const build = async () => {
    let productUrls = [];
    try {
        const products = await fetchActiveProducts();
        productUrls = products.map((p) => ({
            loc: `/product/${p.id}`,
            changefreq: 'weekly',
            priority: '0.7',
            lastmod: p.updatedAt ? p.updatedAt.slice(0, 10) : undefined,
        }));
        console.log(`[sitemap] ${productUrls.length} productos agregados desde Firestore`);
    } catch (err) {
        console.warn(`[sitemap] No pude leer productos (${err.message}); generando solo rutas estáticas`);
    }

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...[...STATIC_ROUTES, ...productUrls].map(urlTag),
        '</urlset>',
        '',
    ].join('\n');

    await writeFile(OUTPUT, xml, 'utf8');
    console.log(`[sitemap] escrito en ${OUTPUT}`);
};

build().catch((err) => {
    console.error('[sitemap] fallo inesperado:', err);
    // No romper el build; la versión estática previa queda en public/
    process.exit(0);
});
