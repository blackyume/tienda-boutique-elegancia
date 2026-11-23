// Examen de Lau: 30 pedidos reales del dueño y la herramienta que debería usar.
// Mide el cerebro VIEJO (JSON en texto) y el NUEVO (herramientas nativas) con la
// misma llave y los mismos modelos, y muestra cuántos acierta cada uno.
// No ejecuta nada en la tienda: sólo mira qué herramienta elige.
//
// Uso (la llave la pone el dueño en su terminal; no se guarda en ningún lado):
//   $env:GEMINI_API_KEY = "<tu llave>"; npx vite-node scripts/evaluar-lau.mjs
//   npx vite-node scripts/evaluar-lau.mjs --solo-nuevo
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM, buildSnapshot, parsePlan } from '../src/utils/aiCopilot.js';
import { declaraciones, sistemaCompleto } from '../src/utils/lauCerebro.js';
import { DEFAULT_MODELS } from '../src/utils/gemini.js';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Falta GEMINI_API_KEY en el entorno.'); process.exit(1); }

const inventory = [
    ['2NerznqBKxIHWO5qjYyp', 'JEANS ELASTIZADO OXFORD', 46500, 'JEANS'],
    ['e16xdT8V94ioTARWesFk', 'JEANS ELASTIZADO CHUPIN', 42300, 'JEANS'],
    ['ZJlNjS4UhPLyke457TCz', 'GAMULAN FORRADO CON CORDERITO', 125300, 'GAMULAN'],
    ['gxhrPSlnJN4vDrLvZQyP', 'CAMPERA ECOCUERO NEGRA', 82700, 'CAMPERAS'],
    ['ZbZ90zIq0gOgm51ivZuR', 'SWEATER LANILLA', 48700, 'SWEATER'],
    ['hPZe0kKNLsDozX5JFR41', 'MUSCULOSA MODAL TIRITA', 8700, 'MUSCULOSAS'],
    ['uY7rvGoIazpMDpaHKm4q', 'BODY MUSCULOSA CUELLO AMERICANO MODAL', 14800, 'BODYS'],
    ['rjIa7XnBeMU8WV9BjFzE', 'SHORT SASTRERO CIERRE INVISIBLE', 19100, 'SHORT'],
].map(([id, name, price, category]) => ({ id, name, price, category, stock: 4 }));
const snapshot = buildSnapshot({ inventory, categories: [...new Set(inventory.map(p => p.category))].map(name => ({ name })) });

// [pedido, herramienta esperada (o "texto" si lo correcto es preguntar/contestar sin herramienta)]
const EXAMEN = [
    ['cuanto vendi esta semana', 'query_sales'],
    ['que gane limpio este mes', 'query_profit'],
    ['subile el precio al oxford a 49000', 'set_price'],
    ['poneme el chupin a 45 lucas', 'set_price'],
    ['ocultá el gamulan', 'toggle_visible'],
    ['llegaron 6 musculosas', 'adjust_stock'],
    ['vendi un body por whatsapp a 15000', 'record_sale'],
    ['gaste 20000 en publicidad de insta', 'record_expense'],
    ['que tengo con poco stock', 'query_inventory'],
    ['dame un resumen de como va la tienda', 'business_summary'],
    ['subi 10% todos los jeans', 'bulk_price'],
    ['poné 20 off el finde en toda la tienda', 'schedule_promotion'],
    ['crea el cupon VERANO15 de 15%', 'create_coupon'],
    ['destaca en la home el gamulan y la campera', 'feature_products'],
    ['que reseñas tengo para aprobar', 'query_reviews'],
    ['que pedidos tengo para mandar', 'query_orders'],
    ['cuanto le cobro a algo que me costo 20000', 'quote_price'],
    ['pone en oferta la campera negra con 15%', 'set_sale'],
    ['el short sastrero talle M mide 70 de cintura', 'edit_product'],
    ['cambiá la categoria SHORT a SHORTS', 'rename_category'],
    ['publica el oxford en instagram', 'post_instagram'],
    ['acordate que los precios los redondeo a la centena', 'remember'],
    ['cuanto me cobra mercado pago', 'query_mp_fee'],
    ['quienes son mis mejores clientas', 'query_customers'],
    ['cuanto gaste este mes', 'query_expenses'],
    ['cambiá el titulo de la portada por Nueva temporada', 'update_home'],
    ['hace la descripcion del sweater', 'generate_copy'],
    ['borra todos los productos', 'texto'],
    ['hola', 'texto'],
    ['cargá una prenda nueva', 'texto'],
];

const viejo = async (model, pedido) => {
    const r = await model.generateContent(`${SYSTEM}\n\n=== ESTADO ACTUAL DE LA TIENDA ===\n${snapshot}\n\n=== CONVERSACIÓN ===\nUSUARIO: ${pedido}\n\nRespondé ahora SOLO con el JSON (reply/actions/done).`);
    const plan = parsePlan(r.response.text());
    return plan.actions[0]?.tool || 'texto';
};

const nuevo = async (model, pedido) => {
    const r = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: pedido }] }] });
    const parts = r.response.candidates?.[0]?.content?.parts || [];
    return parts.find(p => p.functionCall)?.functionCall.name || 'texto';
};

const correr = async (nombre, fn, crearModelo) => {
    let bien = 0;
    const fallas = [];
    for (const [pedido, esperada] of EXAMEN) {
        let obtenida = 'ERROR';
        for (const m of DEFAULT_MODELS) {
            try { obtenida = await fn(crearModelo(m), pedido); break; } catch { /* siguiente modelo */ }
        }
        // Buscar el producto primero (get_product / query_inventory) y recién después
        // cambiarlo también es correcto: el examen sólo mira la primera llamada.
        const buscaPrimero = ['get_product', 'query_inventory'].includes(obtenida) && !esperada.startsWith('query_') && esperada !== 'texto';
        if (obtenida === esperada || buscaPrimero) bien++; else fallas.push(`  «${pedido}» → ${obtenida} (esperaba ${esperada})`);
        await new Promise(r => setTimeout(r, 1500)); // no pasarse del límite por minuto
    }
    console.log(`\n${nombre}: ${bien}/${EXAMEN.length} bien`);
    if (fallas.length) console.log(fallas.join('\n'));
    return bien;
};

const genAI = new GoogleGenerativeAI(KEY);
if (!process.argv.includes('--solo-nuevo')) {
    await correr('CEREBRO VIEJO', viejo, (m) => genAI.getGenerativeModel({ model: m, generationConfig: { temperature: 0.3 } }));
}
const system = sistemaCompleto({ sistemaViejo: SYSTEM, snapshot, memoria: [] });
await correr('CEREBRO NUEVO', nuevo, (m) => genAI.getGenerativeModel({
    model: m,
    systemInstruction: system,
    tools: [{ functionDeclarations: declaraciones() }],
    generationConfig: { temperature: 0.3, thinkingConfig: { thinkingBudget: 1024 } },
}));
