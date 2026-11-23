// La llamada a Google para el cerebro nuevo de Lau: herramientas nativas,
// "pensar antes de contestar" y la misma rotación de llaves y modelos que el
// resto de la tienda (DEFAULT_MODELS de gemini.js). Si un modelo no acepta el
// modo de pensar, se reintenta sin él antes de pasar al siguiente.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_MODELS, TIEMPO_POR_MODELO_MS } from './gemini';

const parseKeys = (raw) => String(raw || '').split(/[,\n]+/).map(k => k.trim()).filter(Boolean);

// Cuánto "piensa" antes de contestar (tokens). Alcanza para planear un pedido
// de varias partes sin demorar de más.
export const PRESUPUESTO_DE_PENSAR = 1024;

const llavesQueNoAndan = new Set();
let ultimoQueAnduvo = null;
// Un modelo saturado (503), sin cupo (429), colgado o que ya no existe (404) se
// deja descansar un rato: así el pedido siguiente no pierde tiempo con él.
export const DESCANSO_MS = 3 * 60 * 1000;
const descansando = new Map();
// Cada vuelta del agente es corta: si un modelo no contesta en 25 s, al siguiente.
export const TIEMPO_POR_VUELTA_MS = Math.min(TIEMPO_POR_MODELO_MS, 25000);

const orden = (keys, models) => {
    const ahora = Date.now();
    const pares = [];
    for (const k of keys) for (const m of models) if (!(descansando.get(`${k}|${m}`) > ahora)) pares.push([k, m]);
    // Si todos descansan, se prueban igual (mejor intentar que no contestar).
    if (!pares.length) for (const k of keys) for (const m of models) pares.push([k, m]);
    if (ultimoQueAnduvo) {
        const i = pares.findIndex(([k, m]) => k === ultimoQueAnduvo[0] && m === ultimoQueAnduvo[1]);
        if (i > 0) pares.unshift(...pares.splice(i, 1));
    }
    return pares;
};

const llamarUna = async (key, modelName, { contents, system, tools, pensar }) => {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: system,
        tools: [{ functionDeclarations: tools }],
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        generationConfig: {
            temperature: 0.3,
            ...(pensar ? { thinkingConfig: { thinkingBudget: PRESUPUESTO_DE_PENSAR } } : {}),
        },
    }, { timeout: TIEMPO_POR_VUELTA_MS });
    const r = await model.generateContent({ contents });
    const content = r?.response?.candidates?.[0]?.content;
    if (!content) {
        const motivo = r?.response?.promptFeedback?.blockReason || r?.response?.candidates?.[0]?.finishReason || 'sin respuesta';
        throw new Error(`Gemini no devolvió contenido (${motivo})`);
    }
    return { content: { role: 'model', parts: content.parts || [] }, modelo: modelName };
};

/**
 * Devuelve una función llamar(contents) para correrAgente, atada a las llaves
 * y a la lista de herramientas de este turno.
 */
export const crearLlamador = ({ adminKeys, system, tools, models = DEFAULT_MODELS, onModelo }) => {
    const keys = parseKeys(adminKeys);
    if (!keys.length) throw new Error('Sin API keys de Gemini configuradas en el Admin');
    return async (contents) => {
        let ultimoError = null;
        for (const [key, modelName] of orden(keys, models)) {
            if (llavesQueNoAndan.has(key)) continue;
            for (const pensar of [true, false]) {
                try {
                    const r = await llamarUna(key, modelName, { contents, system, tools, pensar });
                    ultimoQueAnduvo = [key, modelName];
                    onModelo?.(modelName);
                    return r;
                } catch (e) {
                    ultimoError = e;
                    const m = String(e?.message || '');
                    if (/API key not valid|API_KEY_INVALID|ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(m)) { llavesQueNoAndan.add(key); break; }
                    if (/503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|quota|404|not found|no longer available|abort|timeout/i.test(m)) {
                        descansando.set(`${key}|${modelName}`, Date.now() + DESCANSO_MS);
                        break;
                    }
                    // Sólo vale la pena reintentar sin "pensar" si el error fue por eso.
                    if (!(pensar && /thinking|thinkingConfig|thinking_config|budget/i.test(m))) break;
                }
            }
        }
        throw ultimoError || new Error('Todas las llaves de Gemini fallaron');
    };
};

// Para los tests.
export const __reiniciar = () => { llavesQueNoAndan.clear(); descansando.clear(); ultimoQueAnduvo = null; };
