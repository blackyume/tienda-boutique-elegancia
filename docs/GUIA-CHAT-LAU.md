# Cargar productos hablándole a Lau

Lau es el asistente del panel. Le adjuntás la foto, le dictás los datos, y
crea el producto. Para 1 a 10 productos es lo más rápido que hay. Para cargar
una colección entera conviene el Excel (`GUIA-CARGA-MASIVA.md`).

## Antes que nada: entrar al panel

1. Abrí **https://la-boutique-de-la-elegancia.web.app/admin**
2. Tocá **Continuar con Google** y elegí la cuenta de Google que el dueño
   registró como administradora. **Tiene que ser exactamente esa cuenta**: con
   otra, la página se ve como clienta y no aparece el panel.
3. Si la tienda está "EN RENOVACIÓN", es normal: el panel funciona igual y a
   vos te deja pasar.

Si entrás y no ves el menú de la izquierda (Inventario, Pedidos…), la cuenta
no está autorizada: avisale al dueño.

---

## La key de Gemini (la carga el dueño, una sola vez)

Lau funciona con Gemini y necesita una key **nueva**: la anterior estuvo
expuesta y hay que descartarla. Esto lo hace el dueño; si Lau no responde,
probablemente falte este paso.

1. Entrá a [Google AI Studio](https://aistudio.google.com/apikey) con la cuenta
   de Google de la tienda → **Create API key**.
2. Copiala y pegala en la tienda: **Admin → Configuración → Inteligencia
   Artificial → "Llaves Administrador (Lau, copy, visión)"**. Guardar.
3. Volvé a AI Studio y **borrá la key vieja**.

Listo, no se toca más.

## Dónde está Lau

- En el panel: menú de la izquierda → **Lau**.
- Navegando la tienda como admin: el botón dorado flotante **abajo a la
  izquierda**. Las clientas no lo ven.

## Cargar un producto

1. Tocá el clip 📎 y elegí la foto (o varias, si son del mismo producto).
   Arriba del cuadro de texto hay un botón dorado **"Cargar producto (paso a
   paso)"**: hace lo mismo pero te lleva de la mano pregunta por pregunta.
   Usá el que te resulte cómodo.

   Con el mismo clip podés adjuntar un **Excel**: la plantilla de productos
   (con las fotos en el mismo mensaje) o tu planilla de ventas por fuera. Lau
   la lee sola, te muestra qué entendió y te pide confirmar. Para eso no hace
   falta la llave de Gemini.
2. Escribí lo que sabés. Puede ser desprolijo, Lau lo entiende:

   > jean oxford azul, talles 36 38 40 42, tengo 5, sale 46500, publicalo

3. Lo que falte te lo pregunta **de a uno, con botones**: categoría, color,
   talle, stock, precio. Tocás y seguís.
4. Al final te muestra un resumen —*Publicar producto "Jean Oxford" — $46.500
   · Jeans · stock 5*— y un botón de **confirmar**. Nada se guarda hasta que
   lo tocás.

Si adjuntás varias fotos, primero te pregunta: **¿mismo producto o productos
distintos?** Mismo producto = una galería. Distintos = te guía uno por uno.

## Frases que entiende

| Decís | Hace |
|---|---|
| "publicalo" / "subilo" / "ponelo" | Lo crea visible en la tienda |
| "guardalo" / "borrador" | Lo crea oculto |
| "tengo 5" / "hay 5" / "quedan 5" | Stock 5 |
| "me costó 24000" | Te da el precio al instante con el margen, packaging, flete y comisión de MP configurados en Configuración → Precios ("con 60%" si esa prenda lleva otro margen) |
| "generá una descripción" | Escribe él la descripción |
| "todos negros" / "es negro" | Color negro |

Y en un solo mensaje podés mandar todo junto: *"publicalo, stock 5, y
generá la descripción"*.

## Lo que Lau NO hace, a propósito

**No adivina nada de la foto.** No deduce qué prenda es, ni el color, ni
nada. Vos se lo decís. Está hecho así para que nunca publique un "jean azul"
que era una campera negra. Si te parece que "debería darse cuenta", no: es
una decisión, no una falla.

## Otras cosas que le podés pedir

- **Editar**: "cambiale el precio al jean oxford a 48000", "ponele stock 3 al
  top rib talle M".
- **Ventas por fuera**: "vendí 2 jeans por WhatsApp a 46500" → descuenta stock
  y lo suma a las estadísticas. Te pregunta el canal con botones.
- **Gastos**: "gasté 20000 en packaging" → lo resta de la ganancia.
- **Ofertas**: "poné 15% off en camperas el finde".
- **Resumen**: "cómo va el negocio", "qué repongo".
- **Stock y ventas en vivo** (sin IA, al instante): "¿cuánto queda del
  vestido negro?", "stock jean oxford", "¿cómo está el stock?", "¿qué se
  vendió hoy?", "¿cuánto vendí ayer?", "ventas de la semana", "últimas ventas".
  Y mientras está abierta avisa sola cada venta que entra ("¡Venta nueva!…
  → quedan 2") y cada prenda que se agota; al volver a abrirla cuenta lo que
  entró mientras no estabas.
- **Planilla de ventas con nombres corregidos**: junto con el archivo,
  "Ana Mena y Lorena Petroli" → empareja por el primer nombre y guarda el
  nombre completo.

Todo lo que cambia algo en la tienda **te pide confirmación** antes. Y no
borra en masa: si le decís "borrá todo", te va a pedir que confirmes uno por
uno. También es a propósito.

## Si no responde

- Revisá la key (arriba). Es la causa el 90% de las veces.
- Si dice que falló "todos los modelos", puede ser la cuota gratis de Google
  del día. Esperá o activá facturación en AI Studio (es barato: centavos por
  producto).

## Publicar en Instagram

- `publicá el jean oxford en instagram` → Lau muestra qué va a publicar (foto principal + nombre, precio, talles y hashtags) y pide confirmación.
- `subí el vestido negro a insta con este texto: ...` → usa tu texto tal cual y agrega abajo el precio y los hashtags.
- Antes hay un trámite de una sola vez en Meta (cuenta profesional + llave): está en Admin → Guías → "Publicar en Instagram con Lau".
