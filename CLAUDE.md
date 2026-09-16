# La Boutique de la Elegancia — Guía para Claude

E-commerce de moda femenina premium en Argentina. Solo-dev, iteración rápida.

## Stack

- React 18 + Vite 5 + Tailwind (dark mode permanente, clase `dark` en `<html>`)
- Firebase: Firestore (real-time snapshots), Auth, Hosting, Storage; **firebase-admin** server-side
- Vercel: API routes serverless en `api/*.js` (CommonJS, no ESM); cron en `api/cron/*.js`
- Mercado Pago SDK (checkout) + webhook server-side + fallback WhatsApp deep-link
- Gemini API (@google/generative-ai) con rotación de keys y modelos. **Es el único motor de texto** (Cerebras se sacó el 16/09/2026 a pedido del dueño; `utils/cerebras.js` borrado, la tarjeta de Configuración también; NVIDIA NIM queda sólo como respaldo de visión). OJO 2026: AI Studio entrega llaves `AQ.` y a muchas cuentas les devuelven `401 ACCESS_TOKEN_TYPE_UNSUPPORTED` (bug de Google, foro oficial); `gemini.explicarErrorIA` lo traduce y la guía `ia-keys` sección "aq" da el rodeo por Cloud Console (Credentials → API key, formato AIza). **La lista de modelos vive en `utils/gemini.js` (`DEFAULT_MODELS`)** y la reusan `geminiVision.js` y `api/ai-proxy.js`. A sep-2026: `gemini-3.8-flash` primero; `gemini-2.5-flash` último como respaldo porque Google lo apaga el **16/10/2026**. Los 2.0 están apagados desde junio 2026. Cuando Google retire uno, se saca de esa única lista.
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
- `src/components/admin/guias/` — la sección **Admin → Guías**: manuales de uso para el dueño y quien carga productos, siempre online. `contenido.jsx` es el texto de cada guía (JSX con los bloques de `bloques.jsx` y los SVG de `ilustraciones.jsx`); `GuiasView.jsx` la portada, el buscador y el lector con índice. Guías (16/09/2026): 14, incluidas `inicio` (el Inicio del panel), `ofertas` y `diseno` (Diseño de la tienda), con dibujos en `ilustracionesInicio.jsx`, y `precios` (costos, comisión de MP, ventas en efectivo y hasta dónde bajar) con dibujos en `ilustracionesPrecios.jsx`. Desde el 14/09/2026 cada guía abre con un `Resumen` (tarjetas grandes con emoji: toda la guía de un vistazo) y las pantallas del panel y de MiCorreo están dibujadas en `ilustracionesMas.jsx` (piezas `Pantalla`, `Boton`, `Campo`, `Quien`); los bloques nuevos son `Resumen`, `Numero(s)`, `BienMal`, `Quien`. El pedido del dueño fue "que lo entienda un niño de 5 años": frases cortas, un dibujo por paso, y un badge de quién hace cada cosa (VOS / SE HACE SOLO / EL CORREO). Al cambiar rutas del panel (nombres de pestañas, botones), revisar que las guías sigan diciendo lo mismo: hay un test que renderiza todas y comprueba precios e índices. La plantilla de Excel se sirve desde `public/docs/`.
- `src/utils/importarVentas.js` + `components/admin/ImportarVentasModal.jsx` — **Admin → Ventas → Importar ventas**: lee la planilla de ventas por fuera tal cual la arma el dueño (una columna por clienta, bloques de 4 líneas: prenda / TALLE / color / PRECIO $, y TOTAL + PAGADO al final; también una tabla con cabecera) y crea un pedido manual `MAN-…` por clienta, igual que `record_sale` de Lau. `aPrecio` lee "13,501" como 13501 (en pesos no hay centavos; `aNumero` del importador de inventario lo leería como 13,5). `importKey` evita duplicar si sueltan la misma planilla dos veces. Enlaza prendas al inventario por nombre; el descuento de stock es opcional y sólo para stock numérico.
- **Lau lee planillas sin IA** (`AdminAssistantView.importarPlanilla`): el clip adjunta fotos y `.xlsx`; una planilla con columna Cliente es de ventas (`importarVentas`), sin ella es la plantilla de productos (`planearImportacion` + fotos adjuntas). Muestra resumen, pide confirmación con el mismo cuadro que las acciones sensibles, y aplica con `utils/aplicarImportacion.aplicarPlanDeProductos` (compartida con `ImportarInventarioModal`). Funciona aunque no haya llave de Gemini.
- `src/utils/comision.js` — **la única fuente de la comisión de MP y del precio automático.** `comisionMP` usa la real medida por el webhook (`config/payments.realMpFeePercent`, = cobrado − depositado) o 7,6 % estimado; `paymentConfig.mpFee` NO es esto (es el recargo que paga la clienta). `configPrecios(siteConfig)` lee **Admin → Configuración → Precios** (`site_content.precios`: margen sobre el costo, margen por categoría, packaging y flete por prenda, redondeo) y `precioSugerido(costo, …)` calcula el precio que usan Lau (`quote_price`, `create_product` sin precio, y la respuesta directa "me costó X" sin IA), el `ProductWizard`, el `ProductEditModal` y el importador de Excel (fila con `costo` y sin `precio`). `avisoMargenBajo` es el aviso de Lau cuando sube el costo y el precio ya no cubre el margen. Los productos guardan `cost`, `packagingCost`, `shippingCost`, `feePercent`; los informes de ganancia (Admin metrics/salesLog, informe de Lau) usan `comisionDeProducto`/`comisionDelPedido` (una venta manual no paga MP).
- `src/utils/liquidacion.js` — **liquidación inteligente**: `candidatosLiquidacion` (publicado, con stock, sin oferta, más de `precios.liquidacion.dias` sin venderse desde la última venta / la carga / la apertura `desde`) con `pisoDePrecio` (costo total cubierto después de MP: nunca se vende a pérdida). Lau la corre cuando el dueño escribe "liquidación" / "liquidá con 30%" (`esPedidoDeLiquidacion`, interceptado en `handleSend` antes de la IA, con confirmación) y la anuncia en el parte del día si no hay mantenimiento. Al desactivar mantenimiento por primera vez, `toggleMaintenance` fija `desde` = hoy. Configurar precios por chat: `interpretarConfigPrecios` en `comision.js` ("poné el margen en 110%", "bolsas 650", "camperas 80% de margen", "liquidación a los 60 días con 25%") → `aplicarConfigPrecios` → `updateSiteConfig({ precios })`.
- `src/utils/instagram.js` + `api/instagram-post.js` — **publicar en Instagram**: `captionDeProducto` arma el texto (el dictado por el dueño tal cual, o nombre + descripción + precio + talles + hashtags; sin links porque Instagram no los deja), el endpoint hace los dos pasos de la API de contenido (contenedor → publish) con la foto de Cloudinary convertida a JPEG 4:5 (`api/_instagram.imagenParaInstagram`). Lo usan Lau (`post_instagram`, sensible), el botón rosa de Inventario y "Probar conexión" en Configuración → Notificaciones (guarda `site_content.instagram.conectado`). Vercel gratis permite dos crons: la renovación de la llave va dentro de `cleanup-orders`.
- `src/utils/inicio.js` — los números del **Inicio** del panel (15/09/2026): `pendientesDeHoy` (por enviar / pagos por confirmar / carritos de 24 h / reseñas), `favoritosTop` (lo más guardado en favoritos con stock al lado; no hay tracking de vistas de producto, sólo `wishlist_events`), `visitasPorDia` (14 días, cubos UTC de `visit_stats_hourly` pasados a día local), `resumenStock` y `avisosDeLlaves` (Instagram a los 50/60 días de `instagram.conectado.fecha`, Lau sin llave; Mercado Pago NO va acá porque ya lo pide Primeros pasos). El Inicio no tiene grilla de accesos directos: repetía el menú.
- `src/utils/ventasPorDia.js` — **ventas día por día** (16/09/2026): `soloVentas`/`esVenta` (un pedido `cancelled`/`rejected`/`refunded`/`failure` no es venta: lo filtran el `salesLog` de Admin, las tarjetas del Inicio y el calendario), `mesDeVentas` (el **Calendario de ventas** del Inicio, `components/admin/CalendarioVentas.jsx`: semanas de lunes a domingo en hora local, total y cantidad por día, mejor día, comparación con el mes anterior; tocar un día abre Ventas filtrado en esa fecha vía `Admin.ventasDia` → `SalesView` prop `dia`) y `tendenciaDiaria` (el gráfico de tendencia, antes agrupaba por día UTC y una venta a las 22:00 caía en el día siguiente). Los dibujos de cómo se carga un producto con Lau (`IlusDosCaminos`, `IlusWizard`, `IlusStockGrilla` en `guias/ilustracionesLau.jsx`) los comparten la GUÍA del chat de Lau y la guía "Lau" del panel.
- `src/utils/fotos.js` — **cambiar sólo la foto de un producto desde Lau** (15/09/2026): `interpretarCambioDeFoto` entiende "cambiá la foto del jean oxford" / "agregale esta foto al top rib" (modo reemplazar/agregar + `buscarProductos`); `patchDeFotos` arma `{image, images, media}` conservando los videos. En `AdminAssistantView.cambiarFoto` corre **sin IA** cuando hay foto adjunta y la frase habla de fotos (antes del `aiConfigured`), pide confirmación y hace `updateProduct`; si el nombre es ambiguo ofrece un botón por producto (el botón lleva el nombre entre comillas y resuelve a uno). La IA también tiene la herramienta `set_photo` (sensible) para el mismo caso.
- `src/utils/lauAcciones.js` — **Lau sin IA para las acciones de todos los días** (15/09/2026): `interpretarAccion` entiende precio ("ponele 48000 al…", "… a 45.000"), ocultar/mostrar, "llegaron N …" (adjust_stock) y ventas por fuera ("vendí 2 … a X por whatsapp": "a X" unitario, "por X" total; sin precio usa el de la tienda; no deja vender más del stock). Devuelve `{accion:{tool,args}}` con la MISMA forma que las herramientas de la IA, así `AdminAssistantView.accionDirecta` reusa `exec` + `askConfirm`. Variantes: pregunta con botones (`opcionesDeVariante`, el botón repite la frase + "talle X color Y"); nombres ambiguos: un botón por producto (`opcionesDeProducto`; si dos se llaman igual lleva `#id` y `describirRepetidos` dice cuál es cuál). `accionInversa` arma el **Deshacer** (set_price ↔ precio anterior, toggle_visible, adjust_stock negativo, record_sale → cancel_sale con el MAN-id de la respuesta). Va en `handleSend` después de `responderDirecto` y antes del check de `aiConfigured`. Dictado por voz con `webkitSpeechRecognition` (es-AR), botón junto al clip sólo si el navegador lo tiene. Desde el 16/09/2026 también: ventas "en efectivo"/"por transferencia" sin precio → pregunta lista o **precio efectivo** (`comision.precioEfectivo`: lista sin la comisión de MP, misma ganancia; necesita `{comision}` en el tercer argumento), "con 10% de descuento" (sobre la lista o el precio dicho; `listPrice`/`discountPct`/`payment` van al pedido MAN), `nota` con la ganancia (`gananciaPorFuera`, ⚠ si queda bajo el costo) que `accionDirecta` muestra antes de confirmar, y tipo `costo` ("el sweater me costó 20000 más 500 de flete y 300 de embalaje" → `edit_product` con `cost/shippingCost/packagingCost`; se evalúa ANTES de `responderDirecto` para que no lo agarre la cotización suelta; después de guardar propone el precio con un botón "ponele X al …"). "¿cuánto es el X en efectivo?" lo contesta `lauDirecto.responderDirecto` con la callback `efectivo`. El botón "Cargar producto" (wizard sin IA) vive en la cabecera del chat, al lado de Guía; ya no hay barra dorada sobre el cuadro.
- `src/utils/gastos.js` — **gastos del negocio** (16/09/2026): categorías con su pista (Mercadería avisa que si la prenda tiene costo cargado se contaría dos veces), `gastosDelPeriodo`/`gastosPorCategoria`/`totalGastos` (los usan Gastos, **Ventas y ganancia** —bruta − gastos = neta— y el Inicio —tarjeta Ganancia neta—), `interpretarGasto` ("gasté 20000 en publicidad", "pagué 8000 de bolsas ayer", "… el 12": rubro por palabras, fecha relativa; devuelve null si el concepto es una prenda del inventario, eso es un costo) y `responderGastos` ("¿cuánto gasté este mes?"). En Lau van antes de `responderDirecto`; `gastoDirecto` confirma, anota (`record_expense` acepta `date` y termina la respuesta con `[id]` para el Deshacer → `delete_expense`). El alta manual en Gastos tiene fecha (input date, mediodía local). `gemini.explicarErrorIA` traduce los errores de Google (llave que no es API key, inválida, cuota, modelo retirado) a qué hacer; lo usan todos los catch del chat. "cargá un producto" solo abre el wizard sin IA.
- `src/utils/ficha.js` — **la ficha completa del producto** (16/09/2026): `CUIDADOS` (ids con etiqueta e ícono; `normalizarCuidados` acepta ids, etiquetas o frases), medidas por talle (`product.measurements = { M: { busto, cintura, cadera, largo, manga, tiro } }` en cm; `tablaDeMedidas` para mostrar, `interpretarMedidas` para el chat sin IA: "el vestido lino talle M mide 92 de busto y 88 de largo" → `edit_product` con `measurements` que se MEZCLA con las existentes, y `reemplazar: true` en el Deshacer), `detallesPorPlantilla` (las viñetas de `product.details`, una por línea, sólo con datos reales: tela, colores, talles, cuidados, medidas; la ponen el wizard, el editor, `create_product` de Lau y el importador de Excel cuando no hay viñetas; con llave, `ai.generateGroundedFicha` devuelve descripción + viñetas en una llamada) y `revisarFicha`/`mejorBorrador` (avisos alto/medio/bajo: sin foto, precio, nombre, costo, descripción, categoría, talles, stock; el wizard los muestra antes de publicar y `create_product` los agrega al mensaje). `product.care` guarda ids; la ficha (`ProductDetail`) los muestra como chips y `SizeGuideModal` recibe `producto` (desde ProductDetail y QuickView, `setIsSizeGuideOpen(product)`) y muestra primero “Esta prenda” si tiene medidas. El wizard tiene el paso `ficha` (tela, cuidados, medidas) entre stock y precio, video en el paso de fotos, y `create_product` acepta `variants:[{size,color,stock}]`, `material`, `care`, `measurements`, `details`, `videoUrl`, `launchSalePercent`, `featured`.
- `src/utils/nombres.js` — `tituloDeProducto`: los nombres cargados en MAYÚSCULAS se muestran en la tienda como frase ("Jeans elastizado Oxford"); los escritos con criterio se dejan igual. Se aplica al mostrar (ProductCard, destacados, novedades, detalle, vista rápida, bolsa), nunca al guardar: el admin y el Excel siguen viendo lo original.
- **Textos de la home (15/09/2026):** la tienda **elige** prendas, no las confecciona. Nada de "atelier", "oficio", "edición de autor", "telas seleccionadas" ni "producido en Rafaela": son afirmaciones que no puede sostener ante una clienta. Se habla en castellano y de vos (Tienda, Recién llegado, Tu bolsa, lanzamientos; no Shop/New Arrivals/drops). Los títulos de sección van todos en la serif (`font-serif`, blanco cálido `noche-100`); Cinzel queda para botones, cintillas y etiquetas. Texto secundario en `noche-300` (cálido), no `white/55` ni `slate-400`. "Últimas unidades" sólo con 1 o 2. Los valores viejos del CMS (`EXPLORAR SHOP`, `DE LA ELEGANCIA`) se traducen en `Hero.jsx` (`LEGADO`).
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
- `suppliers`, `scheduled_promotions`, `ai_history` — admin-only (`simulations` quedó sin uso: el Simulador de precios se sacó del panel el 16/09/2026 porque el precio ya sale solo del costo; la regla sigue por los docs viejos)
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
