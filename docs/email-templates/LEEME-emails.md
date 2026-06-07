# 📧 Cómo activar los emails de la tienda (paso a paso)

Tu tienda ya manda emails automáticos. Solo falta conectarlos con **EmailJS** (servicio
gratis, hasta 200 mails por mes). Son 10 minutos, una sola vez.

## Qué emails se mandan solos
| Email | Cuándo se manda | A quién |
|-------|-----------------|---------|
| 🛍️ **Recibimos tu pedido** | Al confirmar un pedido por WhatsApp | Cliente |
| ✅ **Pago aprobado** | Cuando Mercado Pago confirma el pago | Cliente |
| 🚚 **Pedido en camino** | Cuando vos marcás el pedido como *Enviado* | Cliente |
| 🛒 **Carrito abandonado** | A quien dejó cosas sin comprar (1 vez al día) | Cliente |

---

## Paso 1 — Crear cuenta en EmailJS
1. Entrá a **https://www.emailjs.com** y registrate (gratis).
2. **Email Services** → *Add New Service* → elegí **Gmail** → conectá tu casilla.
3. Anotá el **Service ID** (ej: `service_ab12cd`).

## Paso 2 — Crear el template de pedidos
1. **Email Templates** → *Create New Template*.
2. En **Subject** (asunto) escribí exactamente: `{{subject}}`
3. En **To Email** poné `{{to_email}}` y en **To Name** `{{to_name}}`.
4. En el cuerpo, buscá el botón **`</>` (Code editor)** y pegá TODO el contenido del
   archivo **`01-pedido.html`** (está en esta misma carpeta).
5. Guardá. Anotá el **Template ID** (ej: `template_xyz`).
   > 💡 Con este ÚNICO template alcanza para los 3 avisos (recibido, pago, enviado):
   > el texto cambia solo.

## Paso 3 (opcional) — Template de carrito abandonado
Igual que el paso 2 pero con el archivo **`02-carrito-abandonado.html`**.
El asunto poné: `Te guardamos tu carrito 🛍️`. Anotá su Template ID.

## Paso 4 — Pegar las credenciales en tu Admin
1. Entrá a tu tienda → **Admin → Configuración → EmailJS**.
2. Completá:
   - **Service ID** → el del paso 1
   - **Public Key** → está en EmailJS, en *Account → General → Public Key*
   - **Template — Confirmación de pedido** → el Template ID del paso 2
   - **Template — Carrito abandonado** → (opcional) el del paso 3
3. **Guardar credenciales**.
4. Probá con el botón **"Probar envío"** poniendo tu propio email. ✅

---

## ⚠️ Importante para el email de "Pago aprobado" (Mercado Pago)
Ese mail sale desde el **servidor**, y EmailJS por defecto bloquea los envíos que no
vienen del navegador. Tenés que destrabarlo (1 clic):

- En EmailJS → **Account → Security** → **desactivá** la opción
  *"Allow EmailJS API for non-browser applications"* que dice *"Use Private Key"*…
  → en realidad hacé al revés: **activá "Allow"** o pegá tu **Private Key** en Vercel
  como variable `EMAILJS_PRIVATE_KEY`.

👉 Si esto te marea, **avisame y lo configuro/explico con capturas**. Mientras tanto,
los otros 3 emails (recibido, enviado, carrito) funcionan sin tocar nada de esto.

---

## ¿Y si no querés usar EmailJS?
La tienda **sigue funcionando igual** sin emails: los pedidos se registran, te llega
el aviso por **Telegram**, y el cliente coordina por **WhatsApp**. Los emails son un
plus para que se vea más profesional.
