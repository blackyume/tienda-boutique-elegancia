// Helper para invocar Gemini con rotacion de claves y modelos.
// Centraliza el patron que ya usa ShopAssistant para que el Admin pueda
// reutilizarlo sin duplicar codigo.

import { GoogleGenerativeAI } from '@google/generative-ai';

// Modelos vigentes a septiembre 2026 (ai.google.dev/gemini-api/docs/models).
// Se prueban en orden: flash alcanza para la tienda y es el más barato.
// gemini-2.5-flash queda último como respaldo: Google lo apaga el 16/10/2026.
// Los 2.0 ya están apagados (junio 2026) y 1.0-pro / gemini-pro hace rato:
// cada uno que quedaba en la lista era un intento perdido antes de responder.
export const DEFAULT_MODELS = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
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

// generateProductCopy se movió a utils/ai.js (Cerebras primario + fallback).
