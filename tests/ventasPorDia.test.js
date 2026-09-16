import { describe, it, expect } from 'vitest';
import { soloVentas, totalesPorDia, mesDeVentas, tendenciaDiaria, plataCorta, claveDia } from '../src/utils/ventasPorDia';

// Fechas en hora local: el calendario es en la hora de la dueña, no en UTC.
const local = (a, m, d, h = 12) => new Date(a, m, d, h).toISOString();
const HOY = new Date(2026, 8, 16, 10); // 16/09/2026 10:00

const orders = [
    { id: 'A', date: local(2026, 8, 12, 22, 30), total: 48000, status: 'approved' },
    { id: 'B', date: local(2026, 8, 12, 9), total: 30000, status: 'pending_wa' },
    { id: 'C', date: local(2026, 8, 15), total: 20000, status: 'approved', manual: true },
    { id: 'D', date: local(2026, 8, 15), total: 99000, status: 'cancelled' },
    { id: 'E', date: local(2026, 7, 30), total: 50000, status: 'approved' },
    { id: 'F', date: local(2026, 7, 2), total: 50000, status: 'refunded' },
];

describe('qué cuenta como venta', () => {
    it('deja afuera anulados, rechazados y devueltos', () => {
        expect(soloVentas(orders).map(o => o.id)).toEqual(['A', 'B', 'C', 'E']);
    });
    it('suma por día en hora local (una venta a las 22:30 es de ese día)', () => {
        const m = totalesPorDia(orders);
        expect(m.get('2026-09-12')).toEqual({ total: 78000, cantidad: 2 });
        expect(m.get('2026-09-15')).toEqual({ total: 20000, cantidad: 1 });
        expect(m.get('2026-09-13')).toBeUndefined();
    });
});

describe('calendario del mes', () => {
    it('septiembre 2026: empieza martes, 30 días, totales y mejor día', () => {
        const c = mesDeVentas(orders, { anio: 2026, mes: 8, hoy: HOY });
        expect(c.titulo).toBe('Septiembre 2026');
        expect(c.semanas[0][0]).toBeNull();          // lunes 31/8 no es del mes
        expect(c.semanas[0][1].dia).toBe(1);          // martes 1
        expect(c.semanas.every(s => s.length === 7)).toBe(true);
        expect(c.dias).toBe(30);
        expect(c.total).toBe(98000);
        expect(c.cantidad).toBe(3);
        expect(c.diasConVenta).toBe(2);
        expect(c.mejorDia).toMatchObject({ dia: 12, total: 78000, cantidad: 2, nombre: 'sábado 12' });
        expect(c.promedioPorDiaConVenta).toBe(49000);
        const d16 = c.semanas.flat().find(x => x?.dia === 16);
        expect(d16.esHoy).toBe(true);
        expect(c.semanas.flat().find(x => x?.dia === 17).futuro).toBe(true);
        expect(c.esMesActual).toBe(true);
    });
    it('compara con el mes anterior sin contar lo devuelto', () => {
        const c = mesDeVentas(orders, { anio: 2026, mes: 8, hoy: HOY });
        expect(c.anterior).toMatchObject({ total: 50000, cantidad: 1, nombreMes: 'agosto', variacion: 96 });
        const sinAnterior = mesDeVentas(orders, { anio: 2026, mes: 7, hoy: HOY });
        expect(sinAnterior.anterior.variacion).toBeNull();
        expect(sinAnterior.esMesActual).toBe(false);
    });
    it('sin argumentos usa el mes de hoy', () => {
        const c = mesDeVentas([], { hoy: HOY });
        expect(c.mes).toBe(8);
        expect(c.total).toBe(0);
        expect(c.mejorDia).toBeNull();
    });
});

describe('tendencia diaria', () => {
    it('un punto por día, el último es hoy', () => {
        const t = tendenciaDiaria(orders, 7, HOY);
        expect(t).toHaveLength(7);
        expect(t[6].fecha).toBe(claveDia(HOY));
        expect(t.find(p => p.fecha === '2026-09-12')).toEqual({ fecha: '2026-09-12', label: '12/09', ventas: 78000, pedidos: 2 });
        expect(t.find(p => p.fecha === '2026-09-15').ventas).toBe(20000);
    });
});

describe('plata corta', () => {
    it('para una celda chica', () => {
        expect(plataCorta(800)).toBe('$800');
        expect(plataCorta(48000)).toBe('$48 mil');
        expect(plataCorta(1_250_000)).toBe('$1,3 M');
    });
});
