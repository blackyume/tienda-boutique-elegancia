# 🛍️ Guía de La Boutique de la Elegancia

Manual para manejar la tienda **hablándole a Lau** (la copiloto de IA del panel admin) y para dejarla lista para vender.

> **Idea central:** casi todo lo administrás escribiéndole a Lau en lenguaje natural, como si le hablaras a una empleada. Ella ejecuta de verdad. Lo delicado te pide un "OK" antes.

---

## 1. Dónde está Lau
Panel Admin → menú lateral → **"Asistente Lau"**.
Necesitás estar logueada como admin. Lo sensible (borrar, precios, publicar, etc.) te lo confirma antes de hacerlo.

---

## 2. Todo lo que Lau puede hacer (con ejemplos)

### 📸 Cargar y publicar productos
- *"Cargá este vestido"* (adjuntando la foto) → detecta la prenda, sugiere descripción y precio.
- *"Cargá este producto, me costó $8000, quiero 50% de margen"* → **calcula el precio cubriendo la comisión de Mercado Pago + tu margen** y te dice cuánto ganás neto. (ver sección 3)
- *"Guardalo como borrador"* / *"publicalo"*.

### 💰 Precios, ofertas, stock
- *"Cambiá el precio del vestido rojo a $25000"*
- *"Poné 20% de descuento al vestido negro"* (muestra el precio anterior tachado)
- *"Subí 10% el precio de todos los vestidos"*
- *"Cambiá el stock de la blusa a 12"* (si tiene variantes talle/color te avisa que se edita en el editor)

### 🎟️ Cupones
- *"Creá un cupón VERANO15 de 15%"*
- *"Eliminá el cupón VIEJO"*

### 📦 Pedidos
- *"¿Qué pedidos tengo pendientes de enviar?"*
- *"Marcá el pedido ORD-123 como enviado con el tracking AR456789"*
- *"Marcá ese pedido como entregado"*

### ⭐ Reseñas
- *"Mostrame las reseñas pendientes"*
- *"Aprobá la reseña #x"* / *"Rechazá la reseña #x"*

### 🏠 Home (vidriera)
- *"Destacá en la home los 4 productos más nuevos"*
- *"Cambiá el título del hero a ..."*

### 🔧 Tienda
- *"Activá / sacá el modo mantenimiento"*

### 📊 Consultas
- *"¿Cuánto vendí esta semana?"*
- *"¿Qué productos tienen poco stock?"*
- *"¿Quiénes son mis mejores clientes?"*

---

## 3. Cómo calcula el precio (comisión MP + margen)
Fórmula (la misma que el Simulador de Costos):

> **precio = costo ÷ (1 − (margen% + comisión%)/100)**

Así, después de pagar el costo y la comisión de Mercado Pago, te queda **limpio** el margen que pediste.

- **Comisión de MP por defecto: 6%.** ⚠️ Confirmá tu % real (depende de tu cuenta y de cuándo cobrás: al instante es más caro, a 30 días más barato). Si es otro, decíselo a Lau: *"la comisión es 5%"*.
- **Margen por defecto: 50%.**
- Si le pasás packaging o envío, también los suma: *"me costó $8000, packaging $500"*.

**Ejemplo:** costo $8000, margen 50%, comisión 6% → precio **$18.182**, ganás **$9.091** netos por venta.

---

## 4. Para lanzar la tienda — checklist
1. ☐ **Subir productos** (con nombre, precio, foto y **stock mayor a 0**). Lo más fácil: pedíselo a Lau con la foto.
2. ☐ **(Opcional) Crear categorías** para ordenar: *"creá las categorías Vestidos, Blusas, Pantalones"*. Sin categorías igual se venden (aparecen en "Ver Todo").
3. ☐ **Hacer una compra de prueba** vos misma, de punta a punta, para confirmar que Mercado Pago cobra.
4. ☐ **Sacar el modo mantenimiento.**

---

## 5. Cosas que dependen de vos (la IA no las puede hacer)
- **Confirmar tu comisión real de Mercado Pago** (para que los precios queden exactos).
- **Generar/rotar credenciales** (claves de servicio, tokens) — por seguridad las cargás vos.
- **Variables de entorno en Vercel** (opcional, para el proxy de IA seguro): `CEREBRAS_KEY`, `GEMINI_CUSTOMER_KEYS`, `GEMINI_ADMIN_KEYS`.
- **Decidir el recargo al cliente** por usar MP (Admin → Configuración → Pagos), distinto de la comisión del precio.

---

## 6. Datos técnicos útiles
- **Web:** https://la-boutique-de-la-elegancia.web.app
- **Ver la tienda con mantenimiento activo (solo vos):** agregá `?qa=lbde-qa-7f3a2c` a la URL.
- **Stack:** React + Vite + Firebase (Hosting/Firestore/Auth) + Vercel (API serverless) + Mercado Pago + IA (Cerebras principal, Gemini fallback + visión, NVIDIA respaldo de visión).
- **Dos deploys distintos:**
  - Frontend (lo visual) → Firebase Hosting: `npx firebase-tools deploy --only hosting`
  - Backend (`api/`, pagos, proxy IA) → Vercel: `npx vercel deploy --prod` (o conectar git para auto-deploy)
- **IA recomendada:** Cerebras + Gemini. Cloudflare NO está integrado y sus modelos rinden peor para este caso.

---

## 7. Estado / qué se dejó listo (jun 2026)
- 🖤💛 Tema **negro + oro brillante** + tipografía Bodoni Moda.
- ⚡ Performance (fuentes no-bloqueantes, bundle más liviano) + pulido mobile.
- 🐛 Bugs arreglados: pago no falsificable, cupón se redime al aprobar el pago, estados de pedido unificados, botón del login admin visible, zoom de fotos en producto.
- 🔒 Proxy de IA server-side (no expone claves), comparaciones timing-safe.
- 💳 **Pagos arreglados** (eran 4 bugs encadenados: cron de Vercel, routing, service account y el SDK viejo de Mercado Pago). Backend de Vercel revivido y andando.
- 🤖 **Lau** ampliada: pedidos, reseñas, ofertas, y **cálculo de precio con comisión MP + margen**.

---

*Cualquier cosa rara que veas, sacá una captura y se arregla. La tienda está lista para cargar productos y vender.* 💛
