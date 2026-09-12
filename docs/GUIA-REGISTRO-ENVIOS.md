# Cómo registrar la tienda en Zipnova para los envíos

Guía para la persona que va a hacer el trámite. No hace falta saber nada del
sistema de la tienda: es abrir una cuenta en una página, cargar unos datos y
pasar dos claves al final.

---

## Qué es esto y para qué sirve

**La Boutique de la Elegancia** es una tienda online de ropa femenina que
despacha desde **Rafaela, Santa Fe**. Hoy el envío se cobra con un precio fijo
para todo el país. Queremos que el precio se calcule **solo, según a dónde va
el paquete**, y que el correo se encargue de la logística.

Para eso se usa **Zipnova** (antes se llamaba Zippin): una plataforma que
junta más de 40 transportes (Correo Argentino, Andreani, OCA y más) en una
sola cuenta. La tienda le pregunta "¿cuánto sale mandar 1 kg al código postal
X?" y Zipnova contesta con el precio real. La clienta paga eso, y cuando la
compra se confirma, el envío se genera solo.

**Por qué Zipnova y no otro:** se evaluó Envíopack, que es parecido, pero
exige que la dirección de despacho esté en Buenos Aires (textual: *"La
dirección de despacho tiene que ser en AMBA"*). Rafaela queda afuera. La API
de Correo Argentino directo no cotiza y pide acuerdo comercial. Zipnova tiene
**plan gratis**, cobertura nacional y API.

---

## Qué tener a mano antes de empezar

| Dato | Para qué |
|---|---|
| **CUIT o CUIL** del titular de la tienda | La cuenta va a nombre de quien factura |
| **DNI** del titular | Pueden pedir foto o número |
| **Email** de la tienda (el que use el dueño para el negocio) | Es el usuario de la cuenta |
| **Teléfono** de contacto | Para coordinar retiros |
| **Dirección completa en Rafaela** desde donde salen los paquetes | Calle, número, piso, código postal 2300 |
| **Nombre del negocio**: La Boutique de la Elegancia | |

Tiempo estimado: **20 a 30 minutos**, más lo que tarde Zipnova en aprobar la
cuenta si pide validación.

---

## Paso 1 — Crear la cuenta

1. Entrá a **https://app.zipnova.com.ar/register**
2. Completá email, contraseña y los datos del negocio que te pida.
3. Si ofrece elegir plan, elegí **Starter (gratis)**. No hace falta pagar
   ningún plan para arrancar. Si aparece una prueba gratis del plan Pro, se
   puede aceptar, pero **no cargar tarjeta** para eso.
4. Confirmá el email si te manda un correo de verificación.

---

## Paso 2 — Configurar la cuenta

Al entrar por primera vez suele aparecer una guía de configuración inicial.
Si no aparece, está en **Configuración**. Hay que completar:

**a) Dirección de origen / punto de despacho**
La dirección de Rafaela desde donde salen los paquetes. Ponela completa y
exacta, con código postal **2300**. De acá sale el cálculo del precio.

**b) Cómo se despachan los paquetes**
Van a aparecer dos modalidades:

- **Despacho en sucursal**: el dueño lleva el paquete a la sucursal del
  transporte (Correo Argentino, Andreani u OCA) en Rafaela. **Elegí ésta para
  empezar.** Funciona desde el día uno y no tiene requisitos.
- **Colecta**: el transporte pasa a buscar el paquete por el domicilio. Es lo
  ideal, pero Zipnova la habilita **con un mínimo de envíos mensuales** y hay
  que pedirla. Ver el Paso 5.

**c) Servicios a ofrecer a las clientas**
Tildá al menos **Envío a domicilio** y **Envío a sucursal**. Son las dos
opciones que ya muestra el checkout de la tienda.

---

## Paso 3 — Cargar saldo

Zipnova funciona con **saldo prepago**: se carga plata y de ahí se descuenta
cada envío. **No es un costo extra**: la clienta paga el envío en la tienda,
y ese dinero cubre lo que Zipnova descuenta.

1. Menú **Crédito** (o "Saldo").
2. Elegí el monto. Para arrancar, con **$50.000** alcanza para unos 5 envíos
   y ver que todo funcione. Después se recarga.
3. Medio de pago: **Mercado Pago** (se acredita al momento, cobra una comisión
   chica que se ve en el detalle) o **transferencia bancaria** (sin comisión,
   pero hay que mandar el comprobante y esperar que lo acrediten).

---

## Paso 4 — Sacar las credenciales de la API (lo más importante)

Esto es lo que conecta la tienda con Zipnova. Son dos claves.

1. En el panel, buscá **Configuración → Integraciones** (puede llamarse
   "API", "Integraciones personalizadas" o "Credenciales").
2. Buscá la opción de **integración propia / API** (no Shopify ni Tiendanube:
   la tienda es propia).
3. Va a mostrar dos valores, con nombres tipo **API Key** y **Secret** (o
   "usuario y contraseña de API"). **Copiá los dos.**
4. Si el panel dice que la API no está incluida en el plan gratis, **frená y
   avisá** antes de contratar nada: se evalúa el plan o una alternativa.

> ⚠️ **Estas claves son como la contraseña de la cuenta.** No las mandes por
> un grupo de WhatsApp ni las dejes en un mensaje a la vista. Pasáselas al
> dueño por un canal privado, o mejor: pegalas directo donde van (abajo).

---

## Paso 5 — Pedir la colecta (opcional, se puede hacer después)

Cuando la tienda ya mueva volumen, se pide que pasen a buscar los paquetes:

1. **Configuración → Modalidad de despacho → Colecta → Solicitar.**
2. Zipnova responde en 24-48 h hábiles y confirma si llega a la dirección de
   Rafaela y con qué transporte. Hay que confirmar que **cubran Rafaela**:
   la ayuda de Zipnova no lo detalla por ciudad.
3. Si lo aprueban, se eligen los días y horarios en que pasan.

Mientras tanto, despacho en sucursal funciona igual.

---

## Paso 6 — Entregar las claves para conectar la tienda

Las dos claves del Paso 4 van al servidor de la tienda, **no al código**:

1. Entrá a **https://vercel.com** con la cuenta del proyecto
   (*tienda-boutique-elegancia*).
2. **Settings → Environment Variables → Add**:
   - `ZIPNOVA_API_KEY` → la API Key
   - `ZIPNOVA_SECRET` → el Secret
3. Guardar y **Redeploy** (Deployments → los tres puntos del último → Redeploy).
   Sin el redeploy las variables no se aplican.

Si no tenés acceso a Vercel, pasáselas al dueño por un canal privado y él las
carga (o se las da a quien programa la tienda).

---

## Checklist final

- [ ] Cuenta creada en app.zipnova.com.ar, plan Starter
- [ ] Dirección de origen en Rafaela cargada, CP 2300
- [ ] Modalidad: despacho en sucursal
- [ ] Servicios: a domicilio y a sucursal
- [ ] Saldo cargado
- [ ] API Key y Secret copiadas
- [ ] Claves cargadas en Vercel y redeploy hecho (o entregadas al dueño)
- [ ] (Opcional) Colecta solicitada

---

## Qué pasa después, del lado de la tienda

Con las claves cargadas, quien programa la tienda hace el resto: la
cotización automática por código postal en el checkout (con el precio fijo de
hoy como respaldo si Zipnova no responde), y la creación automática del envío
cuando se confirma el pago. El dueño no toca nada de eso.

Lo único que queda del lado del dueño, por ahora, es **llevar el paquete a la
sucursal** cuando entra un pedido. Cuando se active la colecta, ni eso.

---

## Fuentes

- Zipnova, planes y registro: https://www.zipnova.com/zipnova-envios/precios-zipnova-envios-ar/
- Zipnova, documentación de la API: https://docs.zipnova.com/
- Zipnova, integraciones vía API: https://ayuda-envios.zipnova.com/hc/es-419/articles/45276943102099-como-integrar-zipnova-via-api
- Envíopack, por qué se descartó ("La dirección de despacho tiene que ser en AMBA"): https://ayuda.enviopack.com/hc/es-419/articles/360054122951-Configura-tu-cuenta
- Correo Argentino, manual de la API (sin cotización, requiere acuerdo comercial): https://www.correoargentino.com.ar/MiCorreo/public/img/pag/apiPaqAr-v2.pdf
