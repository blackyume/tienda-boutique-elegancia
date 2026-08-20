# La Boutique de la Elegancia — Guía para Claude

E-commerce de moda femenina premium en Argentina. Solo-dev, iteración rápida.

## Stack

- React 18 + Vite 5 + Tailwind (dark mode permanente, clase `dark` en `<html>`)
- Firebase: Firestore (real-time snapshots), Auth, Hosting, Storage; **firebase-admin** server-side
- Vercel: API routes serverless en `api/*.js` (CommonJS, no ESM); cron en `api/cron/*.js`
- Mercado Pago SDK (checkout) + webhook server-side + fallback WhatsApp deep-link
- Gemini API (@google/generative-ai) con rotación de keys
- Service Worker hand-rolled en `public/sw.js`; FCM en `public/firebase-messaging-sw.js`
- Sentry (`@sentry/react`) error monitoring opt-in vía `VITE_SENTRY_DSN`

## Comandos

```bash
npm run dev               # Vite dev server
npm run build             # prebuild genera sitemap + shopping-feed → vite build
npm test                  # vitest run (90 tests, excluye e2e/)
npm run e2e               # playwright (apunta a prod por default)
npm run e2e:install       # bajar Chromium para playwright
npm run lint
npx firebase-tools deploy --only hosting
npx firebase-tools deploy --only firestore:rules
```

## Estructura clave

- `src/context/StoreContext.jsx` — state global (inventory, orders, cart, auth, siteConfig, todas las suscripciones Firestore + dbActions).
- `src/pages/Admin.jsx` — panel admin gigante con tabs.
- `src/components/admin/*` — cada tab es un componente (DashboardView, InventoryView implícito, OrdersView, AbandonedCartsView, ReviewsView, etc.).
- `src/utils/` — helpers puros (variants, lowStock, gemini, presence, abandonedCart, telegram, referral, pushNotifications, analytics).
- `src/lib/` — adapters a libs externas (firebase, sentry).
- `api/*.js` — endpoints serverless Vercel. Helpers compartidos: `_rateLimit.js`, `_firebaseAdmin.js`.
- `api/cron/*.js` — endpoints invocados por Vercel cron (ver `vercel.json`).
- `e2e/` — Playwright smoke tests (apunta a producción).
- `tests/` — Vitest unit tests (utils).
- `firestore.rules` — admin whitelist por email, no por custom claims.
- `scripts/` — generadores build-time (sitemap.xml, shopping feed.xml) + `armar-portada.py` (arma las 3 versiones de una portada de hero desde una foto vertical de modelo).
- `src/utils/portadas.js` — arma la lista de portadas del hero (CMS `hero.slides` → si no hay, las de la casa). Lógica pura, testeada.
- `src/components/home/PortadaCarrusel.jsx` — `usePortadas` + `CapaPortadas` + `PuntosPortada`. **Va partido a propósito**: ver "Home" abajo.
- `src/utils/importarInventario.js` + `src/components/admin/ImportarInventarioModal.jsx` — importador de Excel/CSV.

## Modelo de datos

**Productos (`products`)** — pueden tener `stock` legacy (number) O `variants` (array `[{size, color, stock, price?}]` u objeto `{"S::rojo": 5}`). Siempre usar helpers `getTotalStock()`, `getVariantStock()` de `utils/variants.js` que soportan ambos formatos.

**Orders** — `status`: pending_payment | pending_wa | approved | pending | cancelled | refunded. Identifican por id `ORD-xxxxxx` no por Firestore docId. Webhook MP setea `status`, `mpStatus`, `mpPaymentId`, `mpUpdatedAt`.

**Carrito** — localStorage (`cielo_cart`), key = `${id}-${size}-${color}`.

**Admin whitelist** — hardcoded: `laboutiquedelaeleganciaoficial@gmail.com`, `juampi218@gmail.com`. Mismos emails en `StoreContext.ADMIN_WHITELIST` y `firestore.rules.isAdmin()`.

**Users** — incluyen `referralCode` (REF-XXXXXXXX), `referralsCount`, `referralsEarnings`, `referralsRevenue`. Wishlist sincronizada.

## Convenciones

- **Moneda: siempre ARS.** No introducir multi-currency ni USD.
- **Variantes:** toda lógica de stock visible al cliente debe pasar por `utils/variants.js`.
- **Dark mode:** el diseño es solo-dark. Al hacer UI nueva usar variantes `dark:` de Tailwind aunque no se ve en light.
- **Dynamic imports** para bundles pesados: `xlsx`, `jsPDF`, `jspdf-autotable` se importan con `await import('xlsx')`. Home sections below-the-fold también van lazy con `Suspense`.
- **Firestore rules** son authoritative. Al agregar colección nueva, sumar regla y deployar.
- **Env vars en Vercel** requieren **redeploy** para tomar efecto — avisar al usuario.
- **No proponer features que ya estén en mi recomendación** sin re-explicitar al usuario primero (ver `feedback_scope_confirmation.md` en memoria).

## Integraciones y env vars (Vercel)

| Servicio | Env vars | Dónde se obtiene |
|----------|----------|------------------|
| Mercado Pago | `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` (opc) | MP Dashboard. Webhook auto-registrado vía `notification_url` en cada preference, no requiere alta manual |
| Firebase Admin (cron, mp-webhook, send-push) | `FIREBASE_SERVICE_ACCOUNT` (JSON completo) | Firebase Console → Service accounts → Generate new private key |
| Telegram bot | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ADMIN_SECRET` (opc) | @BotFather + agregar bot al canal como admin |
| Push (FCM) | `PUSH_ADMIN_SECRET` | Inventarlo. Pegarlo en Vercel y en Admin → Settings |
| Cron abandoned cart | `CRON_SECRET`, `EMAILJS_PRIVATE_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` | EmailJS dashboard |
| Rate-limit distribuido (opc) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | upstash.com — sin estos cae a memoria |
| Sentry (opc) | `VITE_SENTRY_DSN` | sentry.io |
| CORS extra | `CORS_EXTRA_ORIGINS` (CSV) | — |

EmailJS, Gemini, Cloudinary también se configuran client-side desde Admin → Integraciones/Configuración (se guardan en `config/site_content` en Firestore).

## Firestore collections

- `products`, `categories`, `config`, `shipping_provinces`, `coupons` — público-read, admin-write
- `suppliers`, `simulations`, `scheduled_promotions`, `ai_history` — admin-only
- `orders` — user crea, lee propias; admin lee/actualiza todas
- `users` — self-managed + admin read-all
- `reviews` — público read; auth create con `approved=false`; sólo admin update (aprobar)
- `wishlist_events`, `stats`, `visit_stats_hourly` — público create (analytics), admin read
- `abandoned_carts` — público create/update; admin read/delete (cron también escribe vía Admin SDK)
- `active_sessions` — público CRUD (presence tracking, ping cada 30s)
- `push_subscriptions` — público create/update (registrar token FCM); admin read

## Vercel cron

- `0 */2 * * *` → `/api/cron/abandoned-reminder` (cada 2h, escanea abandoned_carts y manda recordatorio)

## Home — identidad visual (lo que no se toca sin leer)

- **Paleta:** la tierra sale medida de una foto del campo del dueño (`#312721`) mezclada con el dorado y el negro de la marca. **No usar `#050505` ni negros puros** en secciones de la home: entre bloques de tierra se lee como parche.
- **Textura de fondo:** `public/tierra-tile.webp`, 768×768, **cosida sin espejo** (mosaico de parches con ventana coseno sobre un toro). Espejar es lo que dibuja "mariposas" al repetirse. Si se regenera, el tamaño de la baldosa está fijado en dos lugares de `src/index.css` (`background-size`) y tiene que coincidir.
- **Contraste:** sobre la tierra, blanco al 40% da 3,61:1 y **no llega a AA**. El piso para texto chico es **50–55%**. En el pie viven los links obligatorios (Defensa al Consumidor, Botón de Arrepentimiento) — no bajarlos.
- **Carrusel del hero:** fundido cruzado de 1,6 s cada 7 s. Tres cuidados que no son opcionales:
  1. 🔴 **Los puntitos van FUERA de la capa con parallax.** Esa capa lleva `transform`, que abre su propio contexto de apilamiento: un `z-index` alto adentro no sube por encima de los velos oscuros del hero. Por eso el componente está partido en hook + 2 piezas.
  2. **La primera portada es el LCP** — se precarga y va `eager`; las demás entran al DOM recién en `requestIdleCallback`.
  3. No rota con la pestaña oculta ni con `prefers-reduced-motion`.
- **Portadas nuevas:** `python scripts/armar-portada.py "C:/ruta/foto.jpeg" portada-modelo-3`, y después sumarlas desde Admin → Contenido → Hero (editor de portadas: agregar, ordenar, quitar).
- ⚠️ **Medir un antes/después en el navegador exige bloquear el service worker** (`newContext({ serviceWorkers: 'block' })`), si no la PWA sirve la copia cacheada y las dos capturas salen idénticas.

### Pendiente acordado con el dueño

- **La transición del carrusel puede ser más natural** — hoy es fundido cruzado + ken-burns por portada. Queda para otro día; el dueño lo aprobó como está.
- **Normalizar las fotos de producto al subir** (los fondos amarillos no son el mismo amarillo entre foto y foto).
- **La tira de Instagram repite las mismas 6 fotos del catálogo** que ya se ven más arriba.
- Las fichas de categoría siguen con prenda apoyada; el salto es pasarlas a prenda **puesta**, cuando estén las modelos.

## Estilo de código

- **Español en código y comentarios** cuando aplica (funciones en inglés, comentarios y strings UI en español).
- **Sin comentarios innecesarios** — el usuario prefiere código limpio.
- **Componentes funcionales con hooks** — nada de clases salvo `GlobalErrorBoundary`.
- **No modales custom con Portal** — todo inline con `fixed inset-0` + `z-[50]+`.
- **Tailwind con palette gold `#C19A6B` + gradient `linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)`** como acento principal.

## Testing

- **Vitest unit tests** en `tests/`. 90 tests sobre `variants`, `lowStock`, `pricing`, `ordersReview`, `gemini.parseJsonFromResponse`, `marcoFoto`, `importarInventario` (con round-trip real de `.xlsx`) y `portadas`. Excluye `e2e/`.
- **Playwright e2e** en `e2e/`. 6 smoke tests apuntando a prod (override con `BASE_URL=http://localhost:4173`).
- **GitHub Actions** corre tests + build en push/PR a master (`.github/workflows/ci.yml`).

## Features clave (qué viene listo)

- **PWA + offline.html** + UpdatePrompt con SW versioning.
- **Hero + parallax + carrusel de portadas** con LCP optimizado (parallax difere 800ms, noise SVG vía rIC).
- **Importar inventario desde Excel/CSV** (Admin → ⤴ Importar Excel) — planifica antes de escribir.
- **Reviews con fotos + moderación** — solo usuarios que compraron + admin aprueba.
- **Filtros Shop** — categoría, talle, color, rango precio (min+max), stock.
- **Búsqueda autocompletada** en Navbar (top-6 productos).
- **Programa de referidos** — código auto por user + 10% OFF + tracking de earnings.
- **Cupones** + abandoned-cart manual + abandoned-cart auto (cron).
- **Carritos abandonados** — captura email en checkout debounced.
- **Stock alerts** — Dashboard low-stock panel + threshold configurable.
- **Visitantes en vivo + chart 48h** en Admin Dashboard.
- **Telegram bot** — publicar producto/promo al canal.
- **FCM push** — popup opt-in 10s post-landing + admin sender.
- **MP Webhook** — `notification_url` en preference auto-registra; actualiza order status.
- **Sticky cart mobile** en `/product/:id`.
- **Sitemap + Google Shopping feed** auto build-time.
- **Sentry** error monitoring (opt-in).
