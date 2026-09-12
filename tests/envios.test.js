import { describe, it, expect } from 'vitest';
import { esOpcionValida, sanearTarifas, TARIFAS_DE_LA_CASA, COSTO_REAL_CORREO_1KG } from '../src/utils/envios';

describe('esOpcionValida', () => {
    it('acepta una opción con nombre y costo numérico', () => {
        expect(esOpcionValida({ name: 'Correo', cost: 9900 })).toBe(true);
        expect(esOpcionValida({ name: 'Correo', cost: '9900' })).toBe(true);
    });

    it('acepta costo 0 si tiene nombre (envío gratis a propósito)', () => {
        expect(esOpcionValida({ name: 'Retiro en el local', cost: 0 })).toBe(true);
    });

    it('rechaza lo que quedó guardado en blanco desde el panel', () => {
        expect(esOpcionValida({ name: '', cost: 0, time: '' })).toBe(false);
        expect(esOpcionValida({ name: '   ', cost: 5000 })).toBe(false);
        expect(esOpcionValida({ name: 'Andreani' })).toBe(false);
        expect(esOpcionValida({ name: 'Andreani', cost: 'gratis' })).toBe(false);
        expect(esOpcionValida({ name: 'Andreani', cost: -1 })).toBe(false);
        expect(esOpcionValida(null)).toBe(false);
    });
});

describe('sanearTarifas', () => {
    it('con el doc roto de producción cae a las tarifas de la casa', () => {
        const roto = {
            andreani: { name: '', cost: 0, time: '' },
            oca: { name: '', cost: 0, time: '' },
            correo_argentino: { name: '', cost: 0, time: '' },
        };
        expect(sanearTarifas(roto)).toBe(TARIFAS_DE_LA_CASA);
    });

    it('sin doc, o con cualquier cosa que no sea un objeto, cae a las de la casa', () => {
        expect(sanearTarifas(undefined)).toBe(TARIFAS_DE_LA_CASA);
        expect(sanearTarifas(null)).toBe(TARIFAS_DE_LA_CASA);
        expect(sanearTarifas('x')).toBe(TARIFAS_DE_LA_CASA);
        expect(sanearTarifas({})).toBe(TARIFAS_DE_LA_CASA);
    });

    it('conserva las opciones válidas y tira las vacías', () => {
        const mezcla = {
            correo_domicilio: { name: 'Correo a domicilio', cost: 9900 },
            oca: { name: '', cost: 0 },
        };
        expect(sanearTarifas(mezcla)).toEqual({
            correo_domicilio: { name: 'Correo a domicilio', cost: 9900 },
        });
    });

    it('lo que carga el dueño en el panel manda sobre las de la casa', () => {
        const propias = { retiro: { name: 'Retiro en el local', cost: 0 } };
        expect(sanearTarifas(propias)).toEqual(propias);
    });

    it('las tarifas de la casa se cobran: con nombre, nunca gratis ni en blanco', () => {
        const opciones = Object.values(TARIFAS_DE_LA_CASA);
        expect(opciones.length).toBeGreaterThan(0);
        for (const opcion of opciones) {
            expect(esOpcionValida(opcion)).toBe(true);
            expect(opcion.cost).toBeGreaterThan(0);
        }
    });

    it('ninguna tarifa de la casa queda por debajo de lo que cobra el correo', () => {
        expect(TARIFAS_DE_LA_CASA.correo_domicilio.cost).toBeGreaterThanOrEqual(COSTO_REAL_CORREO_1KG.domicilio);
        expect(TARIFAS_DE_LA_CASA.sucursal.cost).toBeGreaterThanOrEqual(COSTO_REAL_CORREO_1KG.sucursal);
    });
});
