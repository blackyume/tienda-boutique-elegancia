// Helper para invocar Gemini con rotacion de claves y modelos.
// Centraliza el patron que ya usa ShopAssistant para que el Admin pueda
// reutilizarlo sin duplicar codigo.

import { GoogleGenerativeAI } from '@google/generative-ai';

// Modelos vigentes (ai.google.dev/gemini-api/docs/models), en el orden en que
// se prueban. Medido el 9/11/2026 con el pedido real de Lau: 3.8 y 3.7 daban
// 503 por saturación o no contestaban en 3 minutos; 3.5 y 3.6 tardaban 3-30 s;
// 3.5-lite y 2.5 contestaban bien en 1-3 s. Por eso 2.5 va primero aunque
// Google avisó que lo apaga: cuando lo haga devuelve 404 al instante y se pasa
// al siguiente. Cada intento tiene tiempo máximo (TIEMPO_POR_MODELO_MS).
export const DEFAULT_MODELS = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
];

// Un modelo saturado puede quedarse colgado sin contestar: pasado este tiempo
// se corta y se prueba el siguiente.
export const TIEMPO_POR_MODELO_MS = 40000;

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
                const model = genAI.getGenerativeModel({ model: modelName }, { timeout: TIEMPO_POR_MODELO_MS });
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
        .replace(/```/g, '')
        .trim();
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) return null;
    const body = cleaned.slice(first, last + 1);
    // 1) Intento directo
    try {
        return JSON.parse(body);
    } catch { /* probamos reparar */ }
    // 2) Reparaciones tolerantes (comillas tipográficas y comas finales) — el
    // modelo a veces devuelve JSON casi-válido y no queremos morir por una coma.
    try {
        const repaired = body
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(repaired);
    } catch {
        return null;
    }
};

// generateProductCopy se movió a utils/ai.js.

/**
 * El error que devuelve Google, traducido a qué está mal y qué
 * hacer. Para mostrárselo al dueño en vez del JSON.
 */
export const explicarErrorIA = (e) => {
    const m = String(e?.message || e || '');
    const donde = 'Revisala en Admin → Configuración → IA.';
    if (/ACCESS_TOKEN_TYPE_UNSUPPORTED|Expected OAuth|invalid authentication credentials/i.test(m)) {
        return `La llave de Gemini que está cargada no es una API key: Google esperaba otra cosa. La correcta es la que muestra aistudio.google.com/apikey al tocar Create API key: empieza con "AQ." (las nuevas) o "AIzaSy" (las viejas), sola, sin espacios ni texto adelante. Una "Client ID" de Google Cloud (termina en .apps.googleusercontent.com) NO sirve. ${donde}`;
    }
    if (/API_KEY_INVALID|API key not valid|api key.*invalid/i.test(m)) return `La llave de Gemini no es válida (está mal copiada o se borró). Generá una nueva en aistudio.google.com/apikey (empieza con "AQ." o "AIzaSy") y pegala entera. ${donde}`;
    if (/PERMISSION_DENIED|403/.test(m)) return `Google rechazó la llave (permiso denegado). Puede estar restringida a otro sitio o deshabilitada. Generá una nueva en aistudio.google.com/apikey. ${donde}`;
    if (/RESOURCE_EXHAUSTED|429|quota|rate limit/i.test(m)) return 'Gemini está saturado o se pasó el límite gratuito de hoy. Esperá un minuto y volvé a intentar; si sigue, mañana se renueva.';
    if (/not found|404|is not supported|deprecated/i.test(m)) return 'El modelo de Gemini que se intentó usar ya no existe. Avisale a quien te mantiene la tienda que actualice la lista de modelos.';
    if (/503|UNAVAILABLE|high demand|overloaded|abort/i.test(m)) return 'Google tiene mucha demanda ahora y ningún modelo contestó a tiempo. Esperá un minuto y probá de nuevo: no es la llave ni tu internet.';
    if (/Failed to fetch|NetworkError|network|ECONN|timeout/i.test(m)) return 'No pude conectar con Google. Revisá tu internet y probá de nuevo.';
    return `Error: ${m}`;
};
