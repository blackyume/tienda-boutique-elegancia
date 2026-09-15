# La Boutique de la Elegancia — Guía para Claude

E-commerce de moda femenina premium en Argentina. Solo-dev, iteración rápida.

## Stack

- React 18 + Vite 5 + Tailwind (dark mode permanente, clase `dark` en `<html>`)
- Firebase: Firestore (real-time snapshots), Auth, Hosting, Storage; **firebase-admin** server-side
- Vercel: API routes serverless en `api/*.js` (CommonJS, no ESM); cron en `api/cron/*.js`
- Mercado Pago SDK (checkout) + webhook server-side + fallback WhatsApp deep-link
- Gemini API (@google/generative-ai) con rotación de keys y modelos. **La lista de modelos vive en `utils/gemini.js` (`DEFAULT_MODELS`)** y la reusan `geminiVision.js` y `api/ai-proxy.js`. A sep-2026: `gemini-3.8-flash` primero; `gemini-2.5-flash` último como respaldo porque Google lo apaga el **16/10/2026**. Los 2.0 están apagados desde junio 2026. Cuando Google retire uno, se saca de esa única lista.
- Service Worker hand-rolled en `public/sw.js`; FCM en `public/firebase-messaging-sw.js`
- Sentry (`@sentry/react`) error monitoring opt-in vía `VITE_SENTRY_DSN`

## Comandos

```bash
npm run dev               # Vite dev server
npm run build             # prebuild genera sitemap + shopping-feed → vite build
npm test                  # vitest run (excluye e2e/)
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
- `scripts/` — generadores build-time (sitemap.xml, shopping feed.xml) + `armar-portada.py` (portadas del hero desde una foto vertical de modelo) + `fondo-oro.py` (pone una prenda sobre la placa dorada del catálogo).
- `src/utils/portadas.js` — arma la lista de portadas del hero (CMS `hero.slides` → si no hay, las de la casa). Lógica pura, testeada.
- `src/components/home/PortadaCarrusel.jsx` — `usePortadas` + `CapaPortadas` + `PuntosPortada`. **Va partido a propósito**: ver "Home" abajo.
- `src/utils/importarInventario.js` + `src/components/admin/ImportarInventarioModal.jsx` — importador de Excel/CSV **con fotos**: se sueltan junto al Excel y se emparejan por nombre de archivo (`claveDeArchivo`/`agruparFotos`/`fotosDeFila`, puras y testeadas). Un producto nuevo con foto entra publicado; a uno que ya tiene foto no se le pisa. Guía para el dueño en `docs/GUIA-CARGA-MASIVA.md`, plantilla en `docs/plantilla-productos.xlsx` (hay un test que la lee con el importador real). Para cargar de a uno por chat: `docs/GUIA-CHAT-LAU.md`.
- `src/components/admin/guias/` — la sección **Admin → Guías**: manuales de uso para el dueño y quien carga productos, siempre online. `contenido.jsx` es el texto de cada guía (JSX con los bloques de `bloques.jsx` y los SVG de `ilustraciones.jsx`); `GuiasView.jsx` la portada, el buscador y el lector con índice. Desde el 14/09/2026 cada guía abre con un `Resumen` (tarjetas grandes con emoji: toda la guía de un vistazo) y las pantallas del panel y de MiCorreo están dibujadas en `ilustracionesMas.jsx` (piezas `Pantalla`, `Boton`, `Campo`, `Quien`); los bloques nuevos son `Resumen`, `Numero(s)`, `BienMal`, `Quien`. El pedido del dueño fue "que lo entienda un niño de 5 años": frases cortas, un dibujo por paso, y un badge de quién hace cada cosa (VOS / SE HACE SOLO / EL CORREO). Al cambiar rutas del panel (nombres de pestañas, botones), revisar que las guías sigan diciendo lo mismo: hay un test que renderiza todas y comprueba precios e índices. La plantilla de Excel se sirve desde `public/docs/`.
- `src/utils/importarVentas.js` + `components/admin/ImportarVentasModal.jsx` — **Admin → Ventas → Importar ventas**: lee la planilla de ventas por fuera tal cual la arma el dueño (una columna por clienta, bloques de 4 líneas: prenda / TALLE / color / PRECIO $, y TOTAL + PAGADO al final; también una tabla con cabecera) y crea un pedido manual `MAN-…` por clienta, igual que `record_sale` de Lau. `aPrecio` lee "13,501" como 13501 (en pesos no hay centavos; `aNumero` del importador de inventario lo leería como 13,5). `importKey` evita duplicar si sueltan la misma planilla dos veces. Enlaza prendas al inventario por nombre; el descuento de stock es opcional y sólo para stock numérico.
- **Lau lee planillas sin IA** (`AdminAssistantView.importarPlanilla`): el clip adjunta fotos y `.xlsx`; una planilla con columna Cliente es de ventas (`importarVentas`), sin ella es la plantilla de productos (`planearImportacion` + fotos adjuntas). Muestra resumen, pide confirmación con el mismo cuadro que las acciones sensibles, y aplica con `utils/aplicarImportacion.aplicarPlanDeProductos` (compartida con `ImportarInventarioModal`). Funciona aunque no haya llave de Gemini.
- `src/utils/comision.js` — **la única fuente de la comisión de MP y del precio automático.** `comisionMP` usa la real medida por el webhook (`config/payments.realMpFeePercent`, = cobrado − depositado) o 7,6 % estimado; `paymentConfig.mpFee` NO es esto (es el recargo que paga la clienta). `configPrecios(siteConfig)` lee **Admin → Configuración → Precios** (`site_content.precios`: margen sobre el costo, margen por categoría, packaging y flete por prenda, redondeo) y `precioSugerido(costo, …)` calcula el precio que usan Lau (`quote_price`, `create_product` sin precio, y la respuesta directa "me costó X" sin IA), el `ProductWizard`, el `ProductEditModal` y el importador de Excel (fila con `costo` y sin `precio`). `avisoMargenBajo` es el aviso de Lau cuando sube el costo y el precio ya no cubre el margen. Los productos guardan `cost`, `packagingCost`, `shippingCost`, `feePercent`; los informes de ganancia (Admin metrics/salesLog, informe de Lau) usan `comisionDeProducto`/`comisionDelPedido` (una venta manual no paga MP).
- `src/utils/liquidacion.js` — **liquidación inteligente**: `candidatosLiquidacion` (publicado, con stock, sin oferta, más de `precios.liquidacion.dias` sin venderse desde la última venta / la carga / la apertura `desde`) con `pisoDePrecio` (costo total cubierto después de MP: nunca se vende a pérdida). Lau la corre cuando el dueño escribe "liquidación" / "liquidá con 30%" (`esPedidoDeLiquidacion`, interceptado en `handleSend` antes de la IA, con confirmación) y la anuncia en el parte del día si no hay mantenimiento. Al desactivar mantenimiento por primera vez, `toggleMaintenance` fija `desde` = hoy. Configurar precios por chat: `interpretarConfigPrecios` en `comision.js` ("poné el margen en 110%", "bolsas 650", "camperas 80% de margen", "liquidación a los 60 días con 25%") → `aplicarConfigPrecios` → `updateSiteConfig({ precios })`.
- `src/utils/instagram.js` + `api/instagram-post.js` — **publicar en Instagram**: `captionDeProducto` arma el texto (el dictado por el dueño tal cual, o nombre + descripción + precio + talles + hashtags; sin links porque Instagram no los deja), el endpoint hace los dos pasos de la API de contenido (contenedor → publish) con la foto de Cloudinary convertida a JPEG 4:5 (`api/_instagram.imagenParaInstagram`). Lo usan Lau (`post_instagram`, sensible), el botón rosa de Inventario y "Probar conexión" en Configuración → Notificaciones (guarda `site_content.instagram.conectado`). Vercel gratis permite dos crons: la renovación de la llave va dentro de `cleanup-orders`.
- `src/utils/lauDirecto.js` — respuestas de Lau **sin IA**: stock de un producto / panorama, ventas de hoy-ayer-semana-mes, "me costó X"; y los avisos en vivo (venta nueva, bajó/se agotó el stock, "mientras no estabas"). `responderDirecto` devuelve null para todo lo que sea acción → sigue la IA.
- `src/utils/direccion.js` — datos de la clienta en el checkout: `validarDatosCheckout` (una sola validación para Mercado Pago y WhatsApp; a sucursal no exige calle), `normalizarDatosCheckout`, `direccionEnUnaLinea`, `datosParaCorreo` (el bloque que se pega en MiCorreo desde Admin → Pedidos → "Datos y envío"), `telefonoInternacional` (wa.me), `PROVINCIAS`. Los campos del form están en `components/checkout/CamposCheckout.jsx` (fuera de Checkout.jsx para no perder el foco al tipear). **Comprar no exige cuenta**: Google se ofrece grande pero es opcional, decisión del dueño 12/09/2026.
- `src/utils/contacto.js` — Telegram y WhatsApp de la tienda. `WHATSAPP_DE_LA_CASA` es el número real dado por el dueño; lo que se carga en Admin → Configuración manda sobre él. `canalDePedido` elige por dónde coordinar un pedido (WhatsApp primero porque `wa.me` acepta el mensaje escrito, `t.me` no).
- `src/utils/envios.js` — opciones de envío del checkout, **pagadas por la clienta** (decisión del dueño, 12/09/2026). Tarifa de la casa: Correo Argentino a domicilio $10.900 y retiro en sucursal $7.900 — MiCorreo sep-2026 para 1 kg, zona más cara, +3% de embalaje, así ningún destino deja en pérdida. `COSTO_REAL_CORREO_1KG` es el piso sin margen. El correo aumenta cada 2-3 meses: se ajusta desde Admin → Envíos, sin código.

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
| Instagram (publicar con Lau) | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_ADMIN_SECRET` (opc), `INSTAGRAM_USER_ID` + `INSTAGRAM_GRAPH_HOST=graph.facebook.com` (sólo si la llave salió del flujo con página de Facebook) | Meta for Developers → app → Instagram → "API setup with Instagram business login" → Generar token (cuenta profesional, sin página de Facebook). Guía con dibujos en Admin → Guías → "Publicar en Instagram con Lau". La llave dura 60 días: el cron diario `cleanup-orders` la renueva (`_instagram.renovarLlave`) y guarda la nueva en `secrets/instagram` (Firestore, sin regla = nadie la lee desde el navegador); `instagram-post.js` la prefiere si es hija de la que está en Vercel (`firma`). |
| Cron abandoned cart | `CRON_SECRET`, `EMAILJS_PRIVATE_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` | EmailJS dashboard |
| Rate-limit distribuido (opc) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | upstash.com — sin estos cae a memoria |
| Sentry (opc) | `VITE_SENTRY_DSN` | sentry.io |
| CORS extra | `CORS_EXTRA_ORIGINS` (CSV) | — |
| Envíos cotizados (pendiente) | `ZIPNOVA_API_KEY`, `ZIPNOVA_SECRET` | app.zipnova.com.ar → Configuración → Integraciones. Guía para el trámite en `docs/GUIA-REGISTRO-ENVIOS.md`. Envíopack se descartó: exige despacho desde AMBA. La colecta a domicilio NO depende de esto: la da MiCorreo sin contrato (`docs/GUIA-MICORREO-RETIRO.md`) |

EmailJS, Gemini, Cloudinary también se configuran client-side desde Admin → Integraciones/Configuración (se guardan en `config/site_content` en Firestore).

## Firestore collections

- `products`, `categories`, `coupons` — público-read, admin-write
- `config/*` — público-read, admin-write, **salvo `config/ai_settings` que es admin-only**: ahí viven las API keys de Gemini y Cerebras, y hasta el 12/09/2026 cualquiera las leía sin login. El front sólo se suscribe a ese doc si el usuario es admin (`useFirestoreSubscriptions`, bloque `if (admin)`).
- `config/shipping` — las opciones de envío del checkout (se editan en Admin → Envíos). Pasan por `utils/envios.sanearTarifas`: una opción sin nombre o sin costo numérico se descarta, y si no queda ninguna corren las de la casa (`TARIFAS_DE_LA_CASA`). En producción el doc quedó guardado en blanco y el checkout mostraba tres botones sin nombre, todos "Gratis" — o sea que **regalaba el envío por accidente**.
- `shipping_provinces` — **sin uso**. La tabla de 25 provincias que la acompañaba en `StoreContext` no la leía ningún componente y se borró el 12/09/2026; la regla sigue por si se retoma.
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

- **Paleta: NEGRO + ORO** (`#11100D` base, rampa `noche.*`). Es negro de verdad — el blanco encima da **19,03:1** — pero girado a **H40 con S~12** en vez de gris puro. Esa pizca de calor es lo que hace que el oro se lea como **metal sobre la página** y no como un amarillo pegado encima: contra un negro frío (el platino iba a H220) el dorado le pelea el tono. **No mezclar negros fríos ni `#000` plano** en secciones nuevas: usar los escalones de `noche.*`.
- **Las paletas viejas no se borraron, se archivaron.** Tierra `#312721` (medida de una foto del campo del dueño) hasta el 21/08/2026, después platino `#1C1F25` hasta el 02/09/2026. Las dos viven en git y la tierra además en `public/tierra-tile.webp`; volver es revertir el commit de la paleta. El color de prenda `'tierra': '#a0522d'` de `utils/colors.js` es del catálogo y no tiene nada que ver — por eso `scripts/` y `utils/colors.js` + `utils/helpers.js` **quedan afuera** de cualquier reemplazo global de color: ahí `#D4AF37` es el *camel* de una remera, no el acento de la marca.
- **Textura de fondo:** grano de metal en SVG generado (`--grano-metal` en `src/index.css`, 200×200, `feTurbulence` desaturado a 0). No pesa un byte de red y `stitchTiles` cose los bordes solo, así que no tiene el problema de las "mariposas" al repetir. Se usa en dos lugares (`body` y `.bg-cielo-dark`) y el `background-size` tiene que coincidir en ambos. *(La textura anterior era la foto `tierra-tile.webp`, 768×768, cosida sin espejo con ventana coseno sobre un toro: fuera de la tierra queda marrón.)*
- **El `body` lleva tres capas**, en este orden: el grano, un **resplandor dorado** que baja del borde de arriba (`radial-gradient`, alfa .045 — luz de vitrina, no un degradé visible) y el degradé de profundidad. Subirle el alfa al resplandor ensucia el negro enseguida.
- **Contraste:** sobre el negro, blanco al 40% da 3,83:1 y **sigue sin llegar a AA**. El piso para texto chico sigue siendo **50–55%** (5,36 y 6,20:1). El oro pasó a `#E8C65E` (H45 S75 L64): **11,48:1** contra el base, contra los 9,05:1 que daría el `#D4AF37` viejo en el mismo fondo. En el pie viven los links obligatorios (Defensa al Consumidor, Botón de Arrepentimiento) — no bajarlos.
- **El relieve cambia de motor sobre negro.** Una card (`#22201B`) contra el fondo contrasta 1,17:1: la **sombra proyectada ya no separa** (no hay nada más oscuro que la página), así que el trabajo lo hace el **filo de luz de arriba** — por eso subió de .07 a .10 — y el borde, que pasó de marrón (herencia de la tierra, había quedado sin migrar) a un **hilo de oro al 10%**.
- **Carrusel del hero:** fundido cruzado de 1,6 s cada 7 s. Tres cuidados que no son opcionales:
  1. 🔴 **Los puntitos van FUERA de la capa con parallax.** Esa capa lleva `transform`, que abre su propio contexto de apilamiento: un `z-index` alto adentro no sube por encima de los velos oscuros del hero. Por eso el componente está partido en hook + 2 piezas.
  2. **La primera portada es el LCP** — se precarga y va `eager`; las demás entran al DOM recién en `requestIdleCallback`.
  3. No rota con la pestaña oculta ni con `prefers-reduced-motion`.
- **Fotos de producto nuevas:** `python scripts/fondo-oro.py "C:/ruta/foto.jpg"` (o pasarle una carpeta entera). Recorta la prenda con rembg y la compone sobre la placa dorada del catálogo, con la sombra y el reflejo del piso. Los números no son a ojo: la placa es una campana por canal ajustada sobre las 12 fotos publicadas (error medio 4,5/255) y el encuadre está medido — la prenda ocupa el 81% del ancho, centrada en x=50% e y=52%, y las verticales topean en 88% de alto. El centro de la placa está extrapolado, porque en las 12 fotos la prenda tapa el medio: sólo se nota con prendas chicas.
- **Portadas nuevas:** `python scripts/armar-portada.py "C:/ruta/foto.jpeg" portada-modelo-3`, y después sumarlas desde Admin → Contenido → Hero (editor de portadas: agregar, ordenar, quitar).
- ⚠️ **Medir un antes/después en el navegador exige bloquear el service worker** (`newContext({ serviceWorkers: 'block' })`), si no la PWA sirve la copia cacheada y las dos capturas salen idénticas.

### Pendiente acordado con el dueño

- **La transición del carrusel puede ser más natural** — hoy es fundido cruzado + ken-burns por portada. Queda para otro día; el dueño lo aprobó como está.
- ~~Normalizar las fotos de producto al subir (los fondos amarillos no son el mismo amarillo entre foto y foto).~~ **Falso, medido el 21/08/2026:** las 12 fotos publicadas comparten la MISMA placa de fondo — 40% de sus píxeles son idénticos entre foto y foto y las cuatro esquinas dan `#A07829` en todas, con dispersión cero en H, S y L. No había nada que normalizar. Lo que faltaba era poder **reproducir esa placa** para las fotos nuevas: eso lo hace `scripts/fondo-oro.py`.
- **La tira de Instagram repite las mismas 6 fotos del catálogo** que ya se ven más arriba.
- Las fichas de categoría siguen con prenda apoyada; el salto es pasarlas a prenda **puesta**, cuando estén las modelos.

## Estilo de código

- **Español en código y comentarios** cuando aplica (funciones en inglés, comentarios y strings UI en español).
- **Sin comentarios innecesarios** — el usuario prefiere código limpio.
- **Componentes funcionales con hooks** — nada de clases salvo `GlobalErrorBoundary`.
- **No modales custom con Portal** — todo inline con `fixed inset-0` + `z-[50]+`.
- **Tailwind con palette gold `#C19A6B` + gradient `linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)`** como acento principal.

## Testing

- **Vitest unit tests** en `tests/`. Tests sobre `variants`, `lowStock`, `pricing`, `ordersReview`, `gemini.parseJsonFromResponse`, `marcoFoto`, `contacto`, `envios`, `importarInventario` (con round-trip real de `.xlsx`), `portadas`, `guias` (renderiza todas las guías del panel), `direccion`, `detallePedido` e `importarVentas`. Excluye `e2e/`.
- **Playwright e2e** en `e2e/`. 6 smoke tests apuntando a prod (override con `BASE_URL=http://localhost:4173`).
- **GitHub Actions** corre tests + build en push/PR a master (`.github/workflows/ci.yml`).

## Features clave (qué viene listo)

- **PWA + offline.html** + UpdatePrompt con SW versioning.
- **Hero + parallax + carrusel de portadas** con LCP optimizado (parallax difere 800ms, noise SVG vía rIC).
- **Importar inventario desde Excel/CSV + fotos** (Admin → Inventario → ⤴ Importar Excel) — planifica antes de escribir; las fotos se emparejan por nombre de archivo y suben a Cloudinary al confirmar.
- **Reviews con fotos + moderación** — solo usuarios que compraron + admin aprueba.
- **Filtros Shop** — categoría, talle, color, rango precio (min+max), stock.
- **Búsqueda autocompletada** en Navbar (top-6 productos).
- **Programa de referidos** — código auto por user + 10% OFF + tracking de earnings.
- **Cupones** + abandoned-cart manual + abandoned-cart auto (cron).
- **Carritos abandonados** — captura email en checkout debounced.
- **Stock alerts** — Dashboard low-stock panel + threshold configurable.
- **Visitantes en vivo + chart 48h** en Admin Dashboard.
- **Telegram bot** — publicar producto/promo al canal.
- **Instagram** — Lau publica la foto de un producto con texto ("publicá el jean en insta"); requiere cuenta profesional + llave de Meta en Vercel.
- **FCM push** — popup opt-in 10s post-landing + admin sender.
- **MP Webhook** — `notification_url` en preference auto-registra; actualiza order status.
- **Sticky cart mobile** en `/product/:id`.
- **Sitemap + Google Shopping feed** auto build-time.
- **Sentry** error monitoring (opt-in).
