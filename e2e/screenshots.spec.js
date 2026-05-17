import { test } from '@playwright/test';

// Screenshots automáticos para revisión visual (no son asserts).
// Corré:  npm run shots          → apunta a producción (web.app)
//         BASE_URL=http://localhost:4173 npm run shots  → local (preview)
// Los PNG quedan en ./screenshots/ y se revisan a mano.

const OUT = 'screenshots';

// Debe coincidir con QA_BYPASS_KEY de src/App.jsx (saltea mantenimiento).
const QA_KEY = process.env.QA_BYPASS || 'lbde-qa-7f3a2c';

// Inyecta el flag en localStorage antes de que arranque la app, en cada
// navegación, para que el gate de mantenimiento no lo bloquee.
test.beforeEach(async ({ page }) => {
    await page.addInitScript((k) => {
        try { localStorage.setItem('qa_bypass', k); } catch { /* noop */ }
    }, QA_KEY);
});

// La app mantiene sockets de Firestore abiertos → nunca llega a
// 'networkidle'. Hay 2 capas de loader: el splash estático
// (#loadingScreen en index.html, se va ~1.3s post-load) y el gate
// React (texto "Cargando..." mientras resuelve Firestore). Esperamos
// a que ambos desaparezcan antes de capturar, + scroll acotado para
// las secciones lazy/IntersectionObserver + parallax (difiere ~800ms).
async function settle(page) {
    await page.waitForLoadState('load').catch(() => {});
    await page.locator('#loadingScreen').waitFor({ state: 'detached', timeout: 25_000 }).catch(() => {});
    await page.getByText('Cargando...', { exact: true }).waitFor({ state: 'detached', timeout: 25_000 }).catch(() => {});
    // Ancla positiva: el footer sólo existe cuando la app real montó
    // (no está ni en el splash ni en el gate "Cargando..." ni en Maintenance).
    await page.locator('footer').first().waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
    // El splash de index.html se quita sólo en window 'load'; si una
    // imagen cuelga, queda pegado. Para la captura lo forzamos a irse.
    await page.evaluate(() => document.getElementById('loadingScreen')?.remove());
    await page.waitForTimeout(1500);
    await page.evaluate(async () => {
        await new Promise((res) => {
            let y = 0;
            let guard = 0;
            const step = () => {
                window.scrollTo(0, y);
                y += window.innerHeight;
                guard += 1;
                if (y < document.body.scrollHeight && guard < 40) setTimeout(step, 80);
                else { window.scrollTo(0, 0); setTimeout(res, 300); }
            };
            step();
        });
    }).catch(() => {});
    await page.waitForTimeout(1800);
}

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

for (const [device, viewport] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
    test.describe(`Screenshots — ${device}`, () => {
        test.use({ viewport });
        test.describe.configure({ timeout: 90_000 });

        test(`home (${device})`, async ({ page }) => {
            await page.goto('/', { waitUntil: 'domcontentloaded' });
            await settle(page);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
            await page.screenshot({ path: `${OUT}/home-${device}-fold.png` });
            await page.screenshot({ path: `${OUT}/home-${device}.png`, fullPage: true });
        });

        test(`shop (${device})`, async ({ page }) => {
            await page.goto('/shop', { waitUntil: 'domcontentloaded' });
            await settle(page);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
            await page.screenshot({ path: `${OUT}/shop-${device}-fold.png` });
            await page.screenshot({ path: `${OUT}/shop-${device}.png`, fullPage: true });
        });

        test(`product detail (${device})`, async ({ page }) => {
            await page.goto('/shop', { waitUntil: 'domcontentloaded' });
            await settle(page);
            // ProductCard es <article role="link" aria-label="Ver ...">,
            // no un <a href>. Navega por onClick.
            const card = page.locator('article[role="link"]').first();
            await card.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
            const hasProduct = await card.count().then(c => c > 0);
            if (!hasProduct) {
                test.info().annotations.push({ type: 'note', description: 'Sin productos cargados — se omite product detail' });
                test.skip(true, 'No hay productos publicados todavía');
                return;
            }
            await card.click();
            await page.waitForURL('**/product/**', { timeout: 15_000 }).catch(() => {});
            await settle(page);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
            await page.screenshot({ path: `${OUT}/product-${device}-fold.png` });
            await page.screenshot({ path: `${OUT}/product-${device}.png`, fullPage: true });
        });

        test(`quick view modal (${device})`, async ({ page }) => {
            await page.goto('/shop', { waitUntil: 'domcontentloaded' });
            await settle(page);
            const card = page.locator('article[role="button"]').first();
            await card.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
            if (await card.count() === 0) { test.skip(true, 'Sin productos'); return; }
            await card.click();
            await page.locator('[role="dialog"]').first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
            await page.waitForTimeout(1500);
            await page.screenshot({ path: `${OUT}/quickview-${device}.png` });
        });
    });
}
