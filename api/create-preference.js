const mercadopago = require('mercadopago');

module.exports = async (req, res) => {
    // --- CORS Configuration (Important for Firebase -> Vercel calls) ---
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // SECURITY NOTE: In production, replace '*' with 'https://la-boutique-de-la-elegancia.web.app'
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // --- Mercado Pago Logic ---

    // 1. Get Access Token from Environment Variable (Set in Vercel Dashboard)
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
        return res.status(500).json({ error: 'Server config error: Missing MP_ACCESS_TOKEN' });
    }

    // 2. Configure SDK
    mercadopago.configure({ access_token: ACCESS_TOKEN });

    try {
        const { items, payer, shipping_cost, external_reference } = req.body;

        // Validate basic input
        if (!items || !payer) {
            return res.status(400).json({ error: 'Missing items or payer data' });
        }

        // 3. Build Preference Object
        let preference = {
            items: items.map(item => ({
                title: item.title, // 'title' is required by MP
                unit_price: Number(item.unit_price),
                quantity: Number(item.quantity),
                currency_id: 'ARS' // Or your currency
            })),
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
                    zip_code: payer.zip || "",
                    street_name: payer.street || "",
                    street_number: 0
                }
            },
            external_reference: String(external_reference),
            back_urls: {
                success: "https://la-boutique-de-la-elegancia.web.app/payment-status?status=success",
                failure: "https://la-boutique-de-la-elegancia.web.app/payment-status?status=failure",
                pending: "https://la-boutique-de-la-elegancia.web.app/payment-status?status=pending"
            },
            auto_return: "approved",
            // Add shipping cost if exists
            shipments: {
                cost: Number(shipping_cost) || 0,
                mode: 'not_specified'
            }
        };

        // 4. Create Preference
        const response = await mercadopago.preferences.create(preference);

        // 5. Return Init Point (Checkout URL)
        return res.status(200).json({
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point,
            id: response.body.id
        });

    } catch (error) {
        console.error("MP Error:", error);
        return res.status(500).json({
            error: error.message,
            details: error.response ? error.response.body : null
        });
    }
};
