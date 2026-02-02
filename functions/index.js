const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// --- 1. CONFIGURACIÓN DE MERCADO PAGO ---
// Se recomienda usar Variables de Entorno en Prod: 
// firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN"

exports.createPreference = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).send({ error: 'Method Not Allowed' });
            }

            // 1. Obtener datos del Request
            const { items, payer, external_reference, shipping_cost } = req.body;
            const paymentConfigDoc = await db.collection('config').doc('payments').get();
            const paymentConfig = paymentConfigDoc.exists ? paymentConfigDoc.data() : {};

            const accessToken = paymentConfig.accessToken || process.env.MP_ACCESS_TOKEN;

            if (!accessToken) {
                return res.status(500).send({ error: 'Server: Missing MP Access Token in Config' });
            }

            // 2. Configurar Mercado Pago
            const client = new mercadopago.MercadoPagoConfig({ accessToken: accessToken });
            const preference = new mercadopago.Preference(client);

            // 3. Mapear Items
            // MP requiere: { title, quantity, unit_price, currency_id: 'ARS' }
            let mpItems = items.map(item => ({
                title: `${item.name} (${item.size})`,
                quantity: Number(item.quantity),
                unit_price: Number(item.price),
                currency_id: 'ARS'
            }));

            // Agregar Envío como Item (Truco común para evitar complejidad en shipments)
            if (shipping_cost > 0) {
                mpItems.push({
                    title: "Costo de Envío",
                    quantity: 1,
                    unit_price: Number(shipping_cost),
                    currency_id: 'ARS'
                });
            }

            // Agregar Recargo (si aplica y fue enviado en el precio o separado? 
            // Por simplicidad asumo que el precio en el cart ya tiene recargo O agregamos item)
            // Ajuste: Mejor agregar item "Recargo" si viene explícito o ajustar precios.
            // Por ahora asumo que el front manda los precios netos. Calculamos recargo en back?
            // Mejor: el front manda todo listo.

            // 4. Crear Preferencia
            const response = await preference.create({
                body: {
                    items: mpItems,
                    payer: {
                        name: payer.name,
                        surname: payer.surname,
                        email: payer.email,
                        phone: {
                            area_code: "",
                            number: payer.phone
                        },
                        identification: {
                            type: "DNI",
                            number: payer.dni
                        },
                        address: {
                            zip_code: payer.zip,
                            street_name: payer.street,
                            street_number: ""
                        }
                    },
                    back_urls: {
                        success: `https://la-boutique-de-la-elegancia.web.app/payment-status?status=success`,
                        failure: `https://la-boutique-de-la-elegancia.web.app/payment-status?status=failure`,
                        pending: `https://la-boutique-de-la-elegancia.web.app/payment-status?status=pending`
                    },
                    auto_return: "approved",
                    external_reference: external_reference, // ID de la Orden en Firebase
                    statement_descriptor: "TIENDA CIELO",
                }
            });

            // 5. Responder con el ID
            return res.status(200).json({
                preferenceId: response.id,
                init_point: response.init_point,
                sandbox_init_point: response.sandbox_init_point
            });

        } catch (error) {
            console.error("MP Error:", error);
            return res.status(500).json({ error: error.message });
        }
    });
});

// --- 2. WEBHOOK (Opcional por ahora, usamos Auto-Return) ---
// Para actualizaciones asíncronas de estado (si el usuario cierra la ventana)
