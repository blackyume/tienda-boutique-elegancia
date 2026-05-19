// Capa única de IA. Cerebras es el motor PRIMARIO; Gemini queda de
// fallback automático si Cerebras no está configurado o falla.
import { generateWithCerebras } from './cerebras';
import { generateWithGemini, parseJsonFromResponse } from './gemini';

export { parseJsonFromResponse };

// scope: 'admin' (cerebro interno) | 'customer' (asistente de la tienda)
export const generateText = async (prompt, aiConfig, { scope = 'admin' } = {}) => {
    const cerebrasKey = (aiConfig?.cerebrasKey || '').trim();
    if (cerebrasKey) {
        try {
            return await generateWithCerebras(prompt, {
                keys: cerebrasKey,
                model: aiConfig?.cerebrasModel || undefined,
            });
        } catch (err) {
            console.warn('[ai] Cerebras falló, fallback a Gemini:', err?.message);
        }
    }
    const keys = scope === 'customer' ? aiConfig?.customerKeys : aiConfig?.adminKeys;
    return generateWithGemini(prompt, { keys });
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
