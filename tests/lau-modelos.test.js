import { describe, it, expect } from 'vitest';
import { DEFAULT_MODELS, TIEMPO_POR_MODELO_MS, explicarErrorIA } from '../src/utils/gemini';

describe('modelos de Lau', () => {
    it('arranca por los que contestan y deja los saturados al final', () => {
        expect(DEFAULT_MODELS[0]).toBe('gemini-2.5-flash');
        expect(DEFAULT_MODELS.slice(-2)).toEqual(['gemini-3.8-flash', 'gemini-3.7-flash']);
        expect(TIEMPO_POR_MODELO_MS).toBeLessThanOrEqual(60000);
    });
    it('la saturación de Google no se confunde con falta de internet', () => {
        expect(explicarErrorIA(new Error('[503 Service Unavailable] This model is currently experiencing high demand'))).toMatch(/mucha demanda/);
        expect(explicarErrorIA(new Error('Request aborted when fetching: This operation was aborted'))).toMatch(/mucha demanda/);
    });
});
