# Dónde quedamos — 12/09/2026

Nota para retomar el proyecto en otra máquina. Lo técnico de cada decisión
está en `CLAUDE.md`; acá está el **estado** y **qué sigue**.

## Para arrancar en la otra PC

```bash
git clone https://github.com/blackyume/tienda-boutique-elegancia
npm install
npm run dev
```

La tienda está **en modo mantenimiento**, así que en el navegador vas a ver la
pantalla "EN RENOVACIÓN" y no el catálogo. Para ver la tienda sin sacarla de
mantenimiento, entrá con el bypass QA:

```
http://localhost:5173/?qa=lbde-qa-7f3a2c
```

El flag de mantenimiento vive en **Firestore** (`config/store_settings`), no en
el código: se apaga desde Admin → Dashboard y no requiere deploy.

Para los scripts de Python (`scripts/fondo-oro.py`, `scripts/armar-portada.py`):

```bash
pip install pillow numpy scipy rembg
```

⚠️ La primera vez que corras `fondo-oro.py`, **rembg descarga el modelo u2net
(176 MB)**. Tarda y parece colgado, pero es la descarga. Después ya queda.

## Lo que se hizo el 12/09

- **Carga masiva con fotos.** Admin → Inventario → Importar Excel ahora acepta
  el Excel y las fotos juntos; cada foto va a su producto por el nombre del
  archivo y el producto entra publicado. Guía paso a paso en
  `docs/GUIA-CARGA-MASIVA.md` y plantilla en `docs/plantilla-productos.xlsx`.
  Para cargar de a uno hablándole a Lau: `docs/GUIA-CHAT-LAU.md`.
- **Lau con modelos vigentes.** La lista tenía `gemini-2.0-flash` (apagado en
  junio) y arrancaba por `gemini-2.5-flash`, que Google **apaga el 16/10/2026**.
  Ahora arranca por `gemini-3.8-flash`. Una sola lista en `utils/gemini.js`.
- **Envíos con cotización automática: decidido Zipnova.** Envíopack se
  descartó porque exige despachar desde AMBA (textual en su ayuda). Guía
  detallada del trámite, pensada para que la haga otra persona, en
  `docs/GUIA-REGISTRO-ENVIOS.md`. Cuando estén `ZIPNOVA_API_KEY` y
  `ZIPNOVA_SECRET` en Vercel, se programa la integración.

- **🔒 Las API keys ya no son públicas.** `config/ai_settings` (Gemini, Cerebras)
  pasó a admin-only en las reglas y el front sólo se suscribe si sos admin.
  Verificado desde afuera: `PERMISSION_DENIED`. **Falta que vos generes keys
  nuevas** en Google AI Studio y Cerebras y las pegues en Admin → IA: las
  actuales estuvieron expuestas tres semanas.
- **Envíos: la clienta los paga.** El checkout mostraba tres botones sin
  nombre y "Gratis" porque `config/shipping` quedó guardado en blanco desde
  el panel — regalaba el envío por accidente. Ahora una opción sin nombre no
  llega al checkout, y el respaldo cobra tarifa real: **a domicilio $10.900,
  retiro en sucursal $7.900** (MiCorreo sep-2026, 1 kg, zona más cara, +3%).
  El correo aumenta cada 2-3 meses: revisá y ajustá desde Admin → Envíos.
- **WhatsApp conectado:** `5493492216487` como número de la casa. Aparece el
  botón flotante, Contacto y FAQ usan el mismo, y el checkout manda ahí los
  pedidos con el detalle escrito. Lo que cargues en Admin → Configuración
  pisa este valor.
- La tabla de 25 provincias que nadie usaba se borró.

**Publicado:** hosting y reglas, todo al día con `master`.

## Lo que se hizo el 02/09

- **Paleta NEGRO + ORO BRILLANTE** (`#11100D` + `#E8C65E`), pedida por el dueño.
  El negro es cálido (H40 S12): sobre un negro frío el oro se lee como amarillo
  pegado encima en vez de como metal. El oro subió de `#D4AF37` a `#E8C65E`
  (11,48:1 contra el fondo, contra 9,05:1). La rampa `plata.*` de Tailwind se
  llama ahora `noche.*`. Detalle y números en `CLAUDE.md`.
- De paso salieron a la luz los **bordes marrones** que habían quedado sin
  migrar de la época de la tierra en `.relieve` — ahora son un hilo de oro.

## Lo que se hizo el 21/08

- **Paleta platino + oro** (`#1C1F25`). Reemplazó al fondo de tierra. Duró hasta
  el 02/09; volver a cualquiera de las dos es revertir el commit de la paleta
  (`f844712` para el platino), y el tile de tierra sigue en `public/`.
- **`scripts/fondo-oro.py`**: pone una prenda sobre la placa dorada del
  catálogo. Es la herramienta para las fotos de ropa nuevas.
- **Fix del email de seguimiento**: la plantilla usaba sintaxis de Handlebars
  (`{{#if}}`) y EmailJS es Mustache, así que el número de tracking no salía nunca.
- **Telegram + WhatsApp** como canales de contacto, y se sacó un número de
  ejemplo (`549114444...`) que estaba activo en el checkout y mandaba los
  pedidos a un contacto ajeno.

**Publicado en Firebase Hosting:** todo menos el último commit de contacto.
Para publicar: `npm run build && npx firebase-tools deploy --only hosting`.

## Lo primero al retomar

1. **Keys nuevas de Gemini y Cerebras** (ver arriba) — 5 minutos.
2. **Telegram**, si lo querés: Admin → Contenido → Redes, `@tu_usuario`. Hasta
   que no esté, sólo aparece WhatsApp, que ya anda.

## Pendientes, en orden de lo que más cuesta

1. **Integrar Zipnova** cuando lleguen las credenciales (ver arriba):
   peso por categoría (son 8), `api/cotizar-envio.js`, checkout con precio
   real por CP y la tabla fija de respaldo, creación del envío al confirmar
   el pago. Mientras tanto: revisar la tarifa fija en Admin → Envíos cada vez
   que aumente el correo; el piso está en `utils/envios.js`.
2. **Google Analytics** — `gaMeasurementId` vacío. Sin esto no se sabe cuánta
   gente entra ni dónde abandona el checkout.
3. **Fotos de Unsplash** en `editorial.image` y `promoPopup.image`: son de stock
   ajenas, en la sección que habla de la marca.
4. **La tira de Instagram** repite las 6 fotos del catálogo que ya se ven arriba.
5. ~~`config/shipping` no lo lee ningún código.~~ **Falso**: es justo lo que
   lee el checkout. Ya está saneado en código; si querés, desde Admin → Envíos
   borrá los tres métodos vacíos y cargá los dos de Correo Argentino para que
   Firestore y el código digan lo mismo.

## Antes de sacar el mantenimiento

Hacer **una compra real de punta a punta** con un producto barato: que llegue el
email, que el pedido aparezca en el panel y que el webhook de Mercado Pago lo
marque pagado. Es la única forma de saber que la cadena completa funciona.

## Cosas que muerden

- El repo está en **CRLF**. Si editás con scripts (`sed`, Python), normalizá los
  finales de línea o el diff sale con miles de líneas cambiadas por dos hex.
- **Medir un antes/después en el navegador exige bloquear el service worker**
  (`newContext({ serviceWorkers: 'block' })`), o la PWA sirve la copia cacheada
  y las dos capturas salen idénticas.
- Al deployar, usar **`--only hosting`**: no tocar `firestore:rules` sin querer.
- `npm run build` bumpea `SW_VERSION` en `public/sw.js`. Ese cambio **va en el
  commit**: sin él, quien tenga la PWA instalada sigue viendo la versión vieja.
