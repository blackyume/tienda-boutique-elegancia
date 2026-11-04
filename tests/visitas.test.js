import { describe, it, expect } from 'vitest';
import { origenDeVisita, dispositivoDe, registroPorDia, totalesDeVisitas, claveDiaLocal } from '../src/utils/visitas';

describe('registro de visitas por día', () => {
    it('reconoce de dónde llega la visita', () => {
        expect(origenDeVisita({ search: '?utm_source=instagram' })).toBe('instagram');
        expect(origenDeVisita({ userAgent: 'Mozilla ... Instagram 300.0' })).toBe('instagram');
        expect(origenDeVisita({ referrer: 'https://www.google.com/' })).toBe('google');
        expect(origenDeVisita({ referrer: 'https://l.facebook.com/x' })).toBe('facebook');
        expect(origenDeVisita({ referrer: '' })).toBe('directo');
        expect(origenDeVisita({ referrer: 'https://tienda.app/shop', host: 'tienda.app' })).toBe('directo');
        expect(origenDeVisita({ referrer: 'https://blog.ejemplo.com' })).toBe('otro');
    });
    it('distingue celular de computadora', () => {
        expect(dispositivoDe('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)')).toBe('celular');
        expect(dispositivoDe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('computadora');
    });
    it('arma una fila por día y usa el conteo por hora antes del registro diario', () => {
        const ahora = new Date(2026, 10, 2, 15);
        const hoy = claveDiaLocal(ahora);
        const diarios = [{ id: hoy, visitantes: 3, visitas: 4, origen: { instagram: 2, directo: 1 }, dispositivo: { celular: 3 } }];
        const filas = registroPorDia(diarios, [{ id: '2026110112', count: 5 }], 3, ahora);
        expect(filas[0]).toMatchObject({ fecha: hoy, visitantes: 3, visitas: 4, aprox: false });
        expect(filas[1]).toMatchObject({ visitantes: null, visitas: 5, aprox: true });
        const t = totalesDeVisitas(filas);
        expect(t.visitantes).toBe(3);
        expect(t.origen.instagram).toBe(2);
        expect(t.mejor.fecha).toBe(hoy);
    });
});
