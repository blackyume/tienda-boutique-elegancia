// Visión multimodal via NVIDIA NIM (build.nvidia.com).
// Endpoint OpenAI-compatible. Acepta imagen como data: URL (base64) dentro
// de content[].image_url. Sirve de FALLBACK cuando Gemini no está/falla.
import imageCompression from 'browser-image-compression';
import { parseJsonFromResponse } from './gemini';

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Del más capaz al más liviano.
const DEFAULT_MODELS = [
    'meta/llama-3.2-90b-vision-instruct',
    'meta/llama-3.2-11b-vision-instruct',
    'mistralai/pixtral-12b-2409',
];

const parseKeys = (raw) => {
    if (!raw) return [];
    return String(raw).split(/[,\n]+/).map((k) => k.trim()).filter(Boolean);
};

const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// NVIDIA NIM tiene un límite de ~180KB para imágenes inline — comprimimos
// agresivo antes de enviar para no caer en 413.
const compressForNvidia = async (file) => {
    try {
        return await imageCompression(file, {
            maxSizeMB: 0.15,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality: 0.75,
        });
    } catch {
        return file;
    }
};

export const analyzeProductImageWithNvidia = async (file, aiConfig, categories = []) => {
    const keys = parseKeys(aiConfig?.nvidiaKey);
    if (keys.length === 0) throw new Error('Sin API key de NVIDIA configurada en Admin → Configuración → IA.');
    if (!file) throw new Error('Sin imagen');

    const compressed = await compressForNvidia(file);
    const dataUrl = await fileToDataUrl(compressed);

    const catList = categories.length ? categories.join(', ') : 'Vestidos, Blusas, Pantalones, Abrigos, Accesorios';
    const prompt = `
Sos especialista en catálogo de moda femenina premium (Argentina). Mirá la prenda de la foto y devolvé EXCLUSIVAMENTE un JSON válido (sin markdown, sin texto alrededor):
{
  "garmentType": "Tipo de prenda que SE VE en la foto, literal y descriptivo, ej 'Vestido midi floral'. NO inventes un nombre comercial de fantasía.",
  "category": "Una de estas si encaja, sino la más cercana: ${catList}",
  "colors": ["colores visibles, capitalizados"],
  "sizes": ["talles sugeridos típicos para esta prenda, ej S, M, L"],
  "description": "2-3 oraciones elegantes sobre corte y ocasión ideal, SOLO en base a lo que se ve. Sin clichés, sin emojis, NO inventar materiales ni datos que no se vean.",
  "suggestedPrice": número entero en pesos argentinos (ARS) acorde a una boutique premium, sólo el número,
  "badges": { "isNew": true }
}
Reglas: todo en español neutro/rioplatense, sin emojis. El precio es una SUGERENCIA orientativa. No incluyas nada fuera del JSON.`.trim();

    const preferred = (aiConfig?.nvidiaModel || '').trim();
    const modelsToTry = preferred ? [preferred, ...DEFAULT_MODELS] : DEFAULT_MODELS;

    let lastErr = null;
    for (const key of keys) {
        for (const modelName of modelsToTry) {
            try {
                const res = await fetch(NVIDIA_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${key}`,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [{
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { type: 'image_url', image_url: { url: dataUrl } },
                            ],
                        }],
                        max_tokens: 1024,
                        temperature: 0.6,
                        stream: false,
                    }),
                });
                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    if (res.status === 401 || res.status === 403) { lastErr = new Error(`NVIDIA auth ${res.status}`); break; }
                    lastErr = new Error(`NVIDIA ${res.status}: ${txt.slice(0, 200)}`);
                    continue;
                }
                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (!text) { lastErr = new Error('NVIDIA: respuesta vacía'); continue; }
                const parsed = parseJsonFromResponse(text);
                if (!parsed) { lastErr = new Error('Respuesta NVIDIA no parseable'); continue; }
                return {
                    garmentType: String(parsed.garmentType || parsed.name || '').trim(),
                    category: String(parsed.category || '').trim(),
                    colors: Array.isArray(parsed.colors) ? parsed.colors.map(String).filter(Boolean) : [],
                    sizes: Array.isArray(parsed.sizes) ? parsed.sizes.map(String).filter(Boolean) : [],
                    description: String(parsed.description || '').trim(),
                    suggestedPrice: Number(parsed.suggestedPrice) || 0,
                    badges: (parsed.badges && typeof parsed.badges === 'object') ? parsed.badges : { isNew: true },
                };
            } catch (err) {
                lastErr = err;
            }
        }
    }
    throw lastErr || new Error('NVIDIA: ningún modelo respondió');
};
