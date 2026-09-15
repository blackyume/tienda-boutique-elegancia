import { describe, it, expect } from 'vitest';
import { pendientesDeHoy, favoritosTop, visitasPorDia, resumenStock, avisosDeLlaves } from '../src/utils/inicio';

const DIA = 86_400_000;
const AHORA = Date.UTC(2026, 8, 15, 15); // 15/09/2026 15:00 UTC

describe('pendientesDeHoy', () => {
    it('cuenta lo que hay que atender', () => {
        const r = pendientesDeHoy({
            orders: [
                { status: 'approved' }, { status: 'paid' }, { status: 'shipped' },
                { status: 'pending_payment' }, { status: 'pending_wa' }, { status: 'delivered', mpAmountMismatch: true },
            ],
            abandonedCarts: [
                { lastUpdated: AHORA - 2 * 3600_000 },
                { lastUpdated: AHORA - 3 * DIA },
                { lastUpdated: AHORA - 1000, recovered: true },
            ],
            reviews: [{ approved: false }, { approved: true }, {}],
        }, AHORA);
        expect(r).toEqual({ porEnviar: 2, porConfirmar: 3, carritos: 1, resenas: 2 });
    });

    it('con todo vacío da ceros', () => {
        expect(pendientesDeHoy({})).toEqual({ porEnviar: 0, porConfirmar: 0, carritos: 0, resenas: 0 });
    });
});

describe('favoritosTop', () => {
    const inventory = [
        { id: 'a', name: 'JEANS OXFORD', stock: 4 },
        { id: 'b', name: 'TOP RIB', variants: [{ size: 'S', color: 'negro', stock: 1 }] },
    ];
    const eventos = [
        { productId: 'a', productName: 'Jeans', action: 'add', timestamp: AHORA - DIA },
        { productId: 'a', productName: 'Jeans', action: 'add', timestamp: AHORA - 2 * DIA },
        { productId: 'a', productName: 'Jeans', action: 'remove', timestamp: AHORA - DIA },
        { productId: 'b', productName: 'Top', action: 'add', timestamp: AHORA - DIA },
        { productId: 'b', productName: 'Top', action: 'add', timestamp: AHORA - 45 * DIA },
        { productId: 'zzz', productName: 'Borrado', action: 'add', timestamp: AHORA },
    ];

    it('ordena por cantidad de "agregar" en el período y suma el stock actual', () => {
        const r = favoritosTop(eventos, inventory, { ahora: AHORA });
        expect(r.map(f => [f.productId, f.count, f.stock])).toEqual([['a', 2, 4], ['b', 1, 1], ['zzz', 1, null]]);
        expect(r[0].name).toBe('JEANS OXFORD');
    });

    it('respeta el tope', () => {
        expect(favoritosTop(eventos, inventory, { ahora: AHORA, n: 1 })).toHaveLength(1);
    });
});

describe('visitasPorDia', () => {
    it('agrupa los cubos horarios por día local y rellena con ceros', () => {
        const ahora = new Date(2026, 8, 15, 12); // local
        // El id del cubo es la hora en UTC; se arma desde la fecha local para que el test no dependa del huso.
        const idDe = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}${String(d.getUTCHours()).padStart(2, '0')}`;
        const cubos = [
            { id: idDe(ahora), count: 3 },
            { id: idDe(new Date(2026, 8, 14, 15)), count: 2 },
            { id: idDe(new Date(2026, 8, 14, 16)), count: 5 },
            { id: 'basura', count: 99 },
        ];
        const r = visitasPorDia(cubos, 3, ahora);
        expect(r).toHaveLength(3);
        expect(r[0].fecha).toBe('2026-09-13');
        expect(r[0].visitas).toBe(0);
        expect(r[1].visitas).toBe(7);
        expect(r[2].visitas).toBe(3);
        expect(r[2].label).toBe('15/09');
    });
});

describe('resumenStock', () => {
    it('clasifica con stock / últimas / agotados y cuenta ocultos', () => {
        const r = resumenStock([
            { stock: 5 }, { stock: 2 }, { stock: 1, active: false }, { stock: 0 },
            { variants: [{ stock: 0 }, { stock: 0 }] },
        ]);
        expect(r).toEqual({ conStock: 1, ultimas: 2, agotados: 2, ocultos: 1, total: 5 });
    });
});

describe('avisosDeLlaves', () => {
    const ok = { aiConfig: { adminKeys: 'k' } };

    it('sin nada raro no avisa', () => {
        expect(avisosDeLlaves({ ...ok, siteConfig: { instagram: { conectado: { username: 'lb', fecha: new Date(AHORA - 5 * DIA).toISOString() } } } }, AHORA)).toEqual([]);
    });

    it('avisa 10 días antes de los 60 de Instagram, y más fuerte pasado el plazo', () => {
        const a = avisosDeLlaves({ ...ok, siteConfig: { instagram: { conectado: { username: 'lb', fecha: new Date(AHORA - 52 * DIA).toISOString() } } } }, AHORA);
        expect(a).toHaveLength(1);
        expect(a[0].nivel).toBe('medio');
        const b = avisosDeLlaves({ ...ok, siteConfig: { instagram: { conectado: { username: 'lb', fecha: new Date(AHORA - 61 * DIA).toISOString() } } } }, AHORA);
        expect(b[0].nivel).toBe('alto');
        expect(b[0].detalle).toContain('61 días');
    });

    it('avisa si Lau no tiene ninguna llave de IA', () => {
        expect(avisosDeLlaves({ siteConfig: {}, aiConfig: {} }, AHORA).map(x => x.id)).toEqual(['ia']);
        expect(avisosDeLlaves({ siteConfig: {}, aiConfig: { cerebrasKey: 'c' } }, AHORA)).toEqual([]);
    });
});
