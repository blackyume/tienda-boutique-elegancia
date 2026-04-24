import { describe, it, expect } from 'vitest';
import { parseJsonFromResponse } from '../src/utils/gemini.js';

describe('parseJsonFromResponse', () => {
    it('retorna null con texto vacio', () => {
        expect(parseJsonFromResponse('')).toBe(null);
        expect(parseJsonFromResponse(null)).toBe(null);
    });

    it('parsea JSON puro', () => {
        const r = parseJsonFromResponse('{"description":"hola","bullets":["a","b"],"keywords":["x"]}');
        expect(r.description).toBe('hola');
        expect(r.bullets).toEqual(['a', 'b']);
    });

    it('strippea markdown fences ```json', () => {
        const input = '```json\n{"description":"hola"}\n```';
        expect(parseJsonFromResponse(input)).toEqual({ description: 'hola' });
    });

    it('strippea fences genéricos ```', () => {
        const input = '```\n{"description":"hola"}\n```';
        expect(parseJsonFromResponse(input)).toEqual({ description: 'hola' });
    });

    it('ignora texto antes y después del JSON', () => {
        const input = 'Aquí tenés tu respuesta:\n{"description":"ok"}\nGracias!';
        expect(parseJsonFromResponse(input)).toEqual({ description: 'ok' });
    });

    it('retorna null para JSON inválido', () => {
        expect(parseJsonFromResponse('{not json}')).toBe(null);
    });

    it('retorna null si no hay llaves', () => {
        expect(parseJsonFromResponse('sin llaves aquí')).toBe(null);
    });
});
