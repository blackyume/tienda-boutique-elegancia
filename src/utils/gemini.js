// Helper para invocar Gemini con rotacion de claves y modelos.
// Centraliza el patron que ya usa ShopAssistant para que el Admin pueda
// reutilizarlo sin duplicar codigo.

import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-pro',
    'gemini-2.0-pro',
    'gemini-1.0-pro',
    'gemini-pro',
];

const parseKeys = (raw) => {
    if (!raw) return [];
    return String(raw)
        .split(/[,\n]+/)
        .map((k) => k.trim())
        .filter(Boolean);
};

export const generateWithGemini = async (prompt, { keys, models = DEFAULT_MODELS } = {}) => {
    const list = Array.isArray(keys) ? keys : parseKeys(keys);
    if (list.length === 0) {
        throw new Error('Sin API keys de Gemini configuradas en el Admin');
    }

    let lastErr = null;
    for (const key of list) {
        for (const modelName of models) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (err) {
                lastErr = err;
                if (err?.message?.includes('API key not valid')) break;
            }
        }
    }
    throw lastErr || new Error('Todas las API keys de Gemini fallaron');
};

// Intenta parsear JSON desde la respuesta del modelo.
// Acepta respuestas con markdown fences ```json ... ```
export const parseJsonFromResponse = (text) => {
    if (!text) return null;
    const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/g, '')
        .trim();
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) return null;
    try {
        return JSON.parse(cleaned.slice(first, last + 1));
    } catch {
        return null;
    }
};

// Genera descripcion + bullets + keywords SEO para un producto.
// Retorna { description, bullets: string[], keywords: string[] }
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

    const raw = await generateWithGemini(prompt, { keys: aiConfig?.adminKeys });
    const parsed = parseJsonFromResponse(raw);
    if (!parsed) throw new Error('Respuesta de IA no parseable');

    return {
        description: String(parsed.description || '').trim(),
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String).filter(Boolean).slice(0, 6) : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).filter(Boolean).slice(0, 8) : [],
    };
};
