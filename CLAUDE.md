# La Boutique de la Elegancia — Guía para Claude

E-commerce de moda femenina premium en Argentina. Solo-dev, iteración rápida.

## Stack

- React 18 + Vite 5 + Tailwind (dark mode permanente, clase `dark` en `<html>`)
- Firebase: Firestore (real-time snapshots), Auth, Hosting, Storage
- Vercel: API routes serverless en `api/*.js` (CommonJS, no ESM)
- Mercado Pago SDK (checkout) + fallback WhatsApp deep-link
- Gemini API (@google/generative-ai) con rotación de keys
- Service Worker hand-rolled en `public/sw.js`

## Comandos

```bash
npm run dev          # Vite dev server
npm run build        # prebuild genera sitemap → vite build
npm test             # vitest run (38 tests)
npm run lint
npx firebase-tools deploy --only hosting
npx firebase-tools deploy --only firestore:rules
```

## Estructura clave

- `src/context/StoreContext.jsx` — state global (inventory, orders, cart, auth, siteConfig, suscripciones Firestore). Todas las `dbActions` viven acá.
- `src/pages/Admin.jsx` — panel admin gigante con tabs (dashboard/inventory/orders/customers/sales/cms/coupons/suppliers/abandoned/calculator/integrations/settings).
- `src/components/admin/*` — cada tab es un componente.
- `src/utils/` — helpers puros (variants, lowStock, gemini, presence, abandonedCart, telegram, analytics).
- `api/*.js` — endpoints serverless Vercel. `_rateLimit.js` es helper compartido.
- `firestore.rules` — admin whitelist por email, no por custom claims.

## Modelo de datos

**Productos (`products`)** — pueden tener `stock` legacy (number) O `variants` (array `[{size, color, stock, price?}]` u objeto `{"S::rojo": 5}`). Siempre usar helpers `getTotalStock()`, `getVariantStock()` de `utils/variants.js` que soportan ambos formatos.

**Orders** — `status`: pending_payment | pending_wa | approved | pending | cancelled. Identifican por id `ORD-xxxxxx` no por Firestore docId.

**Carrito** — localStorage (`cielo_cart`), key = `${id}-${size}-${color}`.

**Admin whitelist** — hardcoded: `laboutiquedelaeleganciaoficial@gmail.com`, `juampi218@gmail.com`. Mismos emails en `StoreContext.ADMIN_WHITELIST` y `firestore.rules.isAdmin()`.

## Convenciones

- **Moneda: siempre ARS.** No introducir multi-currency ni USD.
- **Variantes:** toda lógica de stock visible al cliente debe pasar por `utils/variants.js`. Campo legacy `product.stock` todavía existe para backcompat.
- **Dark mode:** el diseño es solo-dark. Tema claro se setea pero no hay toggle visible. Al hacer UI nueva usar variantes `dark:` de Tailwind aunque no se ve en light.
- **Dynamic imports para bundles pesados:** `xlsx`, `jsPDF`, `jspdf-autotable` se importan dinámicos (`await import('xlsx')`) para no inflar el grafo inicial.
- **Firestore rules:** son authoritative. Al agregar colección nueva, sumar regla (create/read/update/delete) y deployar.
- **Env vars en Vercel** requieren **redeploy** para tomar efecto — avisar al usuario siempre.

## Integraciones y env vars

| Servicio | Env var (Vercel) | Dónde |
|----------|------------------|-------|
| Mercado Pago | `MP_ACCESS_TOKEN` | MP dashboard |
| Telegram bot | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ADMIN_SECRET` (opc) | @BotFather |
| Rate-limit distrib. | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | upstash.com (fallback a memoria si faltan) |
| CORS extra | `CORS_EXTRA_ORIGINS` | — |

EmailJS, Gemini, Cloudinary se configuran desde Admin → Integraciones/Configuración (se guardan en `config/site_content` en Firestore).

## Firestore collections

- `products`, `categories`, `config`, `shipping_provinces`, `coupons` — público-read, admin-write
- `suppliers`, `simulations`, `scheduled_promotions`, `ai_history` — admin-only
- `orders` — user crea, lee propias; admin lee todas
- `users` — self-managed + admin read-all
- `reviews` — público read, auth create, admin moderate
- `wishlist_events`, `stats` — público create (analytics), admin read
- `abandoned_carts` — público create/update (para tracking), admin read
- `active_sessions` — público CRUD (presence tracking)

## Estilo de código

- **Español en código y comentarios** cuando aplica (nombres de funciones en inglés, comentarios y strings UI en español).
- **Sin comentarios innecesarios** — el usuario prefiere código limpio.
- **Componentes funcionales con hooks** — nada de clases salvo `GlobalErrorBoundary`.
- **No modales custom con Portal** — todo inline con `fixed inset-0` + `z-[50]+`.
- **Tailwind con palette gold `#C19A6B` + gradient `linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)`** como acento principal.

## Testing

- Vitest unit tests en `tests/`. Solo utils puros (variants, lowStock, gemini parser).
- No hay e2e (Playwright) ni component tests (React Testing Library).
