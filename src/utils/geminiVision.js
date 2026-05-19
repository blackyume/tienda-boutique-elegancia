// Visión por imagen. Cerebras es solo-texto: para "mirar" la foto de una
// prenda usamos Gemini multimodal. Devuelve un borrador de producto que
// el copiloto propone (con precio editable) antes de publicar.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseJsonFromResponse } from './gemini';

const VISION_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];

const parseKeys = (raw) => {
    if (!raw) return [];
    return String(raw).split(/[,\n]+/).map((k) => k.trim()).filter(Boolean);
};

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// file: File | Blob (la foto de la prenda). aiConfig: { adminKeys }.
// categories: lista de nombres para que la IA elija una existente si aplica.
export const analyzeProductImage = async (file, aiConfig, categories = []) => {
    const keys = parseKeys(aiConfig?.adminKeys);
    if (keys.length === 0) {
        throw new Error('Para analizar fotos necesitás una API key de Gemini en Admin → Configuración (Cerebras no procesa imágenes).');
    }
    if (!file) throw new Error('Sin imagen');

    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const catList = categories.length ? categories.join(', ') : 'Vestidos, Blusas, Pantalones, Abrigos, Accesorios';
    const prompt = `
Sos especialista en catálogo de moda femenina premium (Argentina). Mirá la prenda de la foto y devolvé EXCLUSIVAMENTE un JSON válido (sin markdown, sin texto alrededor):
{
  "name": "Nombre comercial atractivo y corto (max 6 palabras), español rioplatense",
  "category": "Una de estas si encaja, sino la más cercana: ${catList}",
  "colors": ["colores visibles, capitalizados"],
  "sizes": ["talles sugeridos típicos para esta prenda, ej S, M, L"],
  "description": "2-3 oraciones elegantes sobre corte, tela aparente y ocasión ideal. Sin clichés, sin emojis, no inventar materiales exactos.",
  "suggestedPrice": número entero en pesos argentinos (ARS) acorde a una boutique premium, sólo el número,
  "badges": { "isNew": true }
}
Reglas: todo en español neutro/rioplatense, sin emojis. El precio es una SUGERENCIA orientativa. No incluyas nada fuera del JSON.`.trim();

    let lastErr = null;
    for (const key of keys) {
        for (const modelName of VISION_MODELS) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent([
                    { text: prompt },
                    { inlineData: { mimeType, data: base64 } },
                ]);
                const text = result.response.text();
                const parsed = parseJsonFromResponse(text);
                if (!parsed) { lastErr = new Error('Respuesta de visión no parseable'); continue; }
                return {
                    name: String(parsed.name || '').trim(),
                    category: String(parsed.category || '').trim(),
                    colors: Array.isArray(parsed.colors) ? parsed.colors.map(String).filter(Boolean) : [],
                    sizes: Array.isArray(parsed.sizes) ? parsed.sizes.map(String).filter(Boolean) : [],
                    description: String(parsed.description || '').trim(),
                    suggestedPrice: Number(parsed.suggestedPrice) || 0,
                    badges: (parsed.badges && typeof parsed.badges === 'object') ? parsed.badges : { isNew: true },
                };
            } catch (err) {
                lastErr = err;
                if (err?.message?.includes('API key not valid')) break;
            }
        }
    }
    throw lastErr || new Error('No se pudo analizar la imagen');
};
