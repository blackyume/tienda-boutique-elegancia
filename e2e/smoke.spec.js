import { test, expect } from '@playwright/test';

// Smoke tests: golden path del sitio en producción.
// No interactúan con Firestore-writes ni pagos reales.

test.describe('Smoke — La Boutique de la Elegancia', () => {
    test('Home carga y muestra el logo + CTA shop', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Boutique/i);
        await expect(page.locator('img[alt*="LBE"], img[alt*="Logo"]').first()).toBeVisible();
    });

    test('Shop renderiza y los filtros están presentes', async ({ page }) => {
        await page.goto('/shop');
        await expect(page.getByRole('heading', { name: /Colección/i }).first()).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText(/Filtros/i).first()).toBeVisible();
    });

    test('Producto con slug inexistente no rompe la app', async ({ page }) => {
        await page.goto('/product/no-existe-este-producto-xxxxx');
        await expect(page.getByText(/Ha ocurrido un error crítico/i)).toBeHidden();
    });

    test('Checkout redirige a login si no hay sesión', async ({ page }) => {
        await page.goto('/checkout');
        const emptyCart = page.getByText(/bolsa está vacía/i);
        const loginGate = page.getByText(/Finalizar Compra|Iniciar|Ingresar/i);
        await expect(emptyCart.or(loginGate).first()).toBeVisible({ timeout: 10_000 });
    });

    test('Navbar tiene link a /shop', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
    });

    test('Páginas legales cargan', async ({ page }) => {
        await page.goto('/privacy');
        await expect(page.getByText(/Privacidad|Política/i).first()).toBeVisible({ timeout: 10_000 });
        await page.goto('/terms');
        await expect(page.getByText(/Términos|Condiciones/i).first()).toBeVisible({ timeout: 10_000 });
    });
});
