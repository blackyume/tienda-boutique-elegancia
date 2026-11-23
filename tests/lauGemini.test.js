import { describe, it, expect, vi, beforeEach } from 'vitest';

const llamadas = [];
let comportamiento = {};
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        constructor(key) { this.key = key; }
        getGenerativeModel(cfg) {
            return {
                generateContent: async () => {
                    llamadas.push({ modelo: cfg.model, pensar: Boolean(cfg.generationConfig?.thinkingConfig) });
                    const c = comportamiento[cfg.model];
                    if (c === '503') throw new Error('[503 Service Unavailable] high demand');
                    if (c === 'sin-pensar' && cfg.generationConfig?.thinkingConfig) throw new Error('thinkingConfig is not supported');
                    return { response: { candidates: [{ content: { parts: [{ text: `hola desde ${cfg.model}` }] } }] } };
                },
            };
        }
    },
}));

const { crearLlamador, __reiniciar } = await import('../src/utils/lauGemini');

describe('rotación de modelos del cerebro nuevo', () => {
    beforeEach(() => { llamadas.length = 0; comportamiento = {}; __reiniciar(); });

    it('pasa al siguiente si uno está saturado y lo deja descansar', async () => {
        comportamiento = { a: '503' };
        const llamar = crearLlamador({ adminKeys: 'k1', system: 's', tools: [], models: ['a', 'b'] });
        const r = await llamar([]);
        expect(r.modelo).toBe('b');
        llamadas.length = 0;
        await llamar([]);
        expect(llamadas.map(l => l.modelo)).toEqual(['b']);
    });

    it('el descanso queda guardado sin la llave', async () => {
        const guardado = {};
        globalThis.localStorage = { getItem: (k) => guardado[k] ?? null, setItem: (k, v) => { guardado[k] = v; } };
        comportamiento = { a: '503' };
        const llamar = crearLlamador({ adminKeys: 'AQ.llave-secreta', system: 's', tools: [], models: ['a', 'b'] });
        await llamar([]);
        expect(guardado.lau_modelos_descansando).toMatch(/\|a"/);
        expect(guardado.lau_modelos_descansando).not.toMatch(/llave-secreta/);
        delete globalThis.localStorage;
    });

    it('si el modelo no acepta "pensar", reintenta sin eso', async () => {
        comportamiento = { a: 'sin-pensar' };
        const llamar = crearLlamador({ adminKeys: 'k1', system: 's', tools: [], models: ['a'] });
        const r = await llamar([]);
        expect(r.modelo).toBe('a');
        expect(llamadas.map(l => l.pensar)).toEqual([true, false]);
    });

    it('sin llaves avisa', () => {
        expect(() => crearLlamador({ adminKeys: '', system: 's', tools: [] })).toThrow(/Sin API keys/);
    });
});
