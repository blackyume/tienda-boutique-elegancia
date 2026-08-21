# Dónde quedamos — 21/08/2026

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

## Lo que se hizo el 21/08

- **Paleta platino + oro** (`#1C1F25`). Reemplaza el fondo de tierra, que quedó
  archivado — volver es revertir `f844712`, el tile sigue en `public/`.
- **`scripts/fondo-oro.py`**: pone una prenda sobre la placa dorada del
  catálogo. Es la herramienta para las fotos de ropa nuevas.
- **Fix del email de seguimiento**: la plantilla usaba sintaxis de Handlebars
  (`{{#if}}`) y EmailJS es Mustache, así que el número de tracking no salía nunca.
- **Telegram + WhatsApp** como canales de contacto, y se sacó un número de
  ejemplo (`549114444...`) que estaba activo en el checkout y mandaba los
  pedidos a un contacto ajeno.

**Publicado en Firebase Hosting:** todo menos el último commit de contacto.
Para publicar: `npm run build && npx firebase-tools deploy --only hosting`.

## Lo primero al retomar: cargar dos datos

Están vacíos y por eso **no se ve ningún botón de contacto** en la tienda:

| Dato | Dónde se carga |
|---|---|
| Usuario de Telegram (ej. `@laboutique`) | Admin → Contenido → Redes |
| Número de WhatsApp con código de país | Admin → Configuración |

No se cargaron desde el código a propósito: no hay que inventar un número de
contacto, porque si está mal los pedidos se van a un desconocido.

## Pendientes, en orden de lo que más cuesta

1. **Precios de envío.** `shipping_provinces` está vacío en Firestore, así que
   corren 25 provincias hardcodeadas en `StoreContext.jsx` que nadie calibró.
   Si no coinciden con lo que cobra el correo, se pierde plata en cada venta.
   Se evaluó cotización en tiempo real (Envíopack/Zippin): es posible y el
   checkout ya pide código postal, pero **los productos no tienen peso** y toda
   API lo exige. El atajo sería un peso por categoría (son 8) en vez de por
   producto.
2. **Google Analytics** — `gaMeasurementId` vacío. Sin esto no se sabe cuánta
   gente entra ni dónde abandona el checkout.
3. **Fotos de Unsplash** en `editorial.image` y `promoPopup.image`: son de stock
   ajenas, en la sección que habla de la marca.
4. **La tira de Instagram** repite las 6 fotos del catálogo que ya se ven arriba.
5. **`config/shipping`** en Firestore (Andreani/OCA/Correo, todo vacío): no lo
   lee ningún código. Conviene borrarlo para que no confunda.

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
