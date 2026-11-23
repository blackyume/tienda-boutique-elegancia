// Lau MIRA una foto ya subida y devuelve un control para el dueño: si algo sale
// cortado, borroso u oscuro, y una SUGERENCIA de prenda y color que siempre se
// le pregunta (nunca se carga sola: regla de "no inventar datos").
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_MODELS, TIEMPO_POR_MODELO_MS, parseJsonFromResponse } from './gemini';

const parseKeys = (raw) => String(raw || '').split(/[,\n]+/).map(k => k.trim()).filter(Boolean);

const PEDIDO = `Mirá esta foto de producto de una tienda de ropa femenina y devolvé SOLO un JSON:
{"cortada":{"cabeza":bool,"pies":bool,"prenda":bool},"borrosa":bool,"oscura":bool,"fondo":"<2-4 palabras>","prenda":"<tipo de prenda principal, 1-3 palabras>","color":"<color principal, 1-2 palabras>","nota":"<un problema concreto si lo hay, o vacío>"}
"cortada.cabeza/pies" sólo si hay una modelo y esa parte queda fuera del cuadro. "cortada.prenda" si la prenda principal toca el borde y le falta un pedazo. No inventes nada que no se vea.`;

export const textoDelControl = (j) => {
    if (!j) return 'No pude mirar bien la foto.';
    const problemas = [];
    if (j.cortada?.cabeza) problemas.push('la cabeza queda cortada');
    if (j.cortada?.pies) problemas.push('los pies quedan cortados');
    if (j.cortada?.prenda) problemas.push('a la prenda le falta un pedazo en el borde');
    if (j.borrosa) problemas.push('está borrosa');
    if (j.oscura) problemas.push('está oscura');
    const control = problemas.length ? `OJO: ${problemas.join(', ')}.` : 'La foto está bien: nada cortado, nítida y con buena luz.';
    const sugerencia = (j.prenda || j.color) ? ` Me parece ${[j.prenda, j.color].filter(Boolean).join(' ')} (SUGERENCIA: confirmalo con el dueño antes de usarlo).` : '';
    return `${control}${sugerencia}${j.nota ? ` Nota: ${j.nota}` : ''}`;
};

export const revisarFoto = async (imageUrl, adminKeys, { models = DEFAULT_MODELS, fetcher = fetch } = {}) => {
    const keys = parseKeys(adminKeys);
    if (!keys.length) throw new Error('Para mirar fotos hace falta la llave de Gemini.');
    const resp = await fetcher(imageUrl);
    if (!resp.ok) throw new Error('No pude bajar la foto.');
    const blob = await resp.blob();
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    const data = btoa(bin);
    const mimeType = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
    let ultimo = null;
    for (const key of keys) {
        for (const m of models) {
            try {
                const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: m }, { timeout: TIEMPO_POR_MODELO_MS });
                const r = await model.generateContent([{ inlineData: { mimeType, data } }, { text: PEDIDO }]);
                return textoDelControl(parseJsonFromResponse(r.response.text()));
            } catch (e) {
                ultimo = e;
                if (/API key not valid/i.test(String(e?.message))) break;
            }
        }
    }
    throw ultimo || new Error('No pude mirar la foto.');
};
