// Cliente de Cerebras (API OpenAI-compatible). Inferencia muy rápida.
// La key la carga el admin en Admin → Configuración (Firestore), nunca en código.

const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions';

// Modelos reales disponibles en la cuenta (verificado vía /v1/models),
// del más capaz al más liviano como fallback.
const DEFAULT_MODELS = [
    'qwen-3-235b-a22b-instruct-2507',
    'zai-glm-4.7',
    'gpt-oss-120b',
    'llama3.1-8b',
];

const parseKeys = (raw) => {
    if (!raw) return [];
    return String(raw).split(/[,\n]+/).map((k) => k.trim()).filter(Boolean);
};

export const generateWithCerebras = async (prompt, { keys, model, models } = {}) => {
    const list = Array.isArray(keys) ? keys : parseKeys(keys);
    if (list.length === 0) throw new Error('Sin API key de Cerebras configurada en el Admin');

    const modelsToTry = model ? [model, ...DEFAULT_MODELS] : (models || DEFAULT_MODELS);

    let lastErr = null;
    for (const key of list) {
        for (const modelName of modelsToTry) {
            try {
                const res = await fetch(CEREBRAS_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${key}`,
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.6,
                        max_tokens: 2500,
                    }),
                });
                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    // 401/403 => key inválida: no tiene sentido seguir con esta key
                    if (res.status === 401 || res.status === 403) {
                        lastErr = new Error(`Cerebras auth ${res.status}`);
                        break;
                    }
                    lastErr = new Error(`Cerebras ${res.status}: ${txt.slice(0, 200)}`);
                    continue;
                }
                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text) return text;
                lastErr = new Error('Cerebras: respuesta vacía');
            } catch (err) {
                lastErr = err;
            }
        }
    }
    throw lastErr || new Error('Cerebras: todas las llaves/modelos fallaron');
};
