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

// generateProductCopy se movió a utils/ai.js (Cerebras primario + fallback).
