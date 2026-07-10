// Capa única de IA. Cerebras es el motor PRIMARIO; Gemini queda de
// fallback automático si Cerebras no está configurado o falla.
import { generateWithCerebras } from './cerebras';
import { generateWithGemini, parseJsonFromResponse } from './gemini';

export { parseJsonFromResponse };

// Proxy server-side: si está configurado (env vars en Vercel), las API keys NO
// se exponen al cliente. Mientras no lo esté, caemos al método client-side de
// abajo y nada se rompe. Se cachea "no disponible" por sesión para no reintentar
// en cada mensaje.
const AI_PROXY_URL = 'https://tienda-boutique-elegancia.vercel.app/api/ai-proxy';
let proxyUnavailable = false;

const tryProxy = async (prompt, scope) => {
    if (proxyUnavailable) return null;
    try {
        const r = await fetch(AI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, scope }),
        });
        if (!r.ok) {
            if (r.status === 404) proxyUnavailable = true; // todavía no deployado en Vercel
            return null;
        }
        const data = await r.json();
        if (data?.configured === false) { proxyUnavailable = true; return null; }
        return data?.text || null;
    } catch {
        proxyUnavailable = true; // sin red al proxy → no reintentar esta sesión
        return null;
    }
};

// scope: 'admin' (cerebro interno) | 'customer' (asistente de la tienda)
// system: prompt de sistema separado (mejora el seguimiento de instrucciones)
// temperature: 0 = determinista (acciones/JSON), alto = creativo (texto)
export const generateText = async (prompt, aiConfig, { scope = 'admin', system, temperature } = {}) => {
    // Para el proxy y Gemini combinamos system + prompt en un solo texto.
    const combined = system ? `${system}\n\n${prompt}` : prompt;

    // 1. Proxy server-side (camino seguro: las keys viven sólo en Vercel).
    const viaProxy = await tryProxy(combined, scope);
    if (viaProxy) return viaProxy;

    // 2. Fallback client-side (modo actual, hasta configurar las env vars).
    const cerebrasKey = (aiConfig?.cerebrasKey || '').trim();
    if (cerebrasKey) {
        try {
            return await generateWithCerebras(prompt, {
                keys: cerebrasKey,
                model: aiConfig?.cerebrasModel || undefined,
                system,
                temperature,
            });
        } catch (err) {
            console.warn('[ai] Cerebras falló, fallback a Gemini:', err?.message);
        }
    }
    const keys = scope === 'customer' ? aiConfig?.customerKeys : aiConfig?.adminKeys;
    return generateWithGemini(combined, { keys });
};

// ¿Hay algún proveedor de IA configurado para uso admin?
export const hasAdminAI = (aiConfig) =>
    Boolean((aiConfig?.cerebrasKey || '').trim() || (aiConfig?.adminKeys || '').trim());

// Genera descripción + bullets + keywords SEO para un producto.
export const generateProductCopy = async (product, aiConfig) => {
    const { name, category, colors, sizes, price } = product || {};
    const prompt = `
Eres copywriter de moda femenina premium. Para la tienda "La Boutique de la Elegancia" (Argentina).

Producto:
- Nombre: ${name || '(sin nombre)'}
- Categoria: ${category || '(sin categoria)'}
- Colores disponibles: ${(colors || []).join(', ') || 'sin especificar'}
- Talles disponibles: ${(sizes || []).join(', ') || 'sin especificar'}
- Precio: ${price ? '$' + price : 'sin definir'}

Devuelve EXCLUSIVAMENTE un JSON valido con esta forma (sin texto alrededor, sin markdown):
{
  "description": "Texto descriptivo de 2 a 3 oraciones breves, tono elegante, espanol rioplatense, sin clichés de marketing agresivo. Enfocarse en corte, tela y ocasion ideal. No inventar materiales especificos si no fueron provistos.",
  "bullets": ["Bullet 1 corto (max 60 chars)", "Bullet 2", "Bullet 3", "Bullet 4"],
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
}

Reglas:
- Todo el texto en espanol neutro/rioplatense, sin emojis.
- No uses "exclusivo", "unico" ni "lujo" mas de una vez.
- Los bullets son atributos practicos (tela sugerida acorde a categoria, ocasion, cuidado).
- Las keywords son para SEO, minusculas, separadas.
- NO incluyas nada fuera del JSON.
`.trim();

    const raw = await generateText(prompt, aiConfig, { scope: 'admin' });
    const parsed = parseJsonFromResponse(raw);
    if (!parsed) throw new Error('Respuesta de IA no parseable');

    return {
        description: String(parsed.description || '').trim(),
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String).filter(Boolean).slice(0, 6) : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).filter(Boolean).slice(0, 8) : [],
    };
};

// Descripción CORTA con grounding: usa solo los datos reales (nombre, categoría,
// colores, talles) + lo que el dueño contó de la prenda. No inventa telas ni
// detalles que no le hayan dicho. Devuelve texto plano listo para usar.
export const generateGroundedDescription = async ({ name, category, colors = [], sizes = [], details = '' }, aiConfig) => {
    const facts = [
        name && `Nombre: ${name}`,
        category && `Categoría: ${category}`,
        colors.length && `Colores: ${colors.join(', ')}`,
        sizes.length && `Talles: ${sizes.join(', ')}`,
        details && `Lo que contó el dueño sobre la prenda: ${details}`,
    ].filter(Boolean).join('\n');

    const system = 'Sos redactor de e-commerce de moda femenina premium en Argentina. Escribís descripciones cortas, elegantes y cálidas en español rioplatense neutro, sin emojis ni marketing exagerado.';
    const prompt = `Escribí una descripción de producto de 2 a 3 oraciones, elegante y atractiva, usando ÚNICAMENTE los datos reales de abajo.
REGLA CLAVE (estricta): NO inventes telas, materiales, medidas ni composición. Si en los datos NO aparece la tela/composición, está PROHIBIDO mencionar de qué material es — ni siquiera adivinarlo o sugerirlo. Hablá del corte, el color y la ocasión/estilo de forma general, sin afirmar nada sobre el material.

DATOS REALES:
${facts}

Devolvé SOLO el texto de la descripción (sin comillas, sin título, sin markdown).`;

    const raw = await generateText(prompt, aiConfig, { scope: 'admin', system, temperature: 0.6 });
    return String(raw || '').trim().replace(/^["'`]+|["'`]+$/g, '').slice(0, 600);
};
