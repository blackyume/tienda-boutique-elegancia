import { describe, it, expect } from 'vitest';
import { interpretarConfigPrecios, aplicarConfigPrecios, describirConfigPrecios } from '../src/utils/comision';
import { candidatosLiquidacion, diasSinVender, pisoDePrecio, resumirLiquidacion, esPedidoDeLiquidacion, descuentoPedido, configLiquidacion } from '../src/utils/liquidacion';

const DIA = 24 * 3600 * 1000;
const AHORA = new Date('2026-09-13T12:00:00').getTime();
const hace = (d) => AHORA - d * DIA;

describe('configurar precios por chat', () => {
    const cats = ['Camperas', 'Jeans'];
    it('margen general, packaging, flete y redondeo', () => {
        expect(interpretarConfigPrecios('poné el margen en 110%')).toEqual({ margen: 110 });
        expect(interpretarConfigPrecios('quiero 120 de margen')).toEqual({ margen: 120 });
        expect(interpretarConfigPrecios('el packaging sale $800 por prenda y el flete 1.200')).toEqual({ packaging: 800, flete: 1200 });
        expect(interpretarConfigPrecios('las bolsas me cuestan 650')).toEqual({ packaging: 650 });
        expect(interpretarConfigPrecios('redondeá a 500')).toEqual({ redondeo: 500 });
        expect(interpretarConfigPrecios('que los precios terminen redondeados en 99')).toEqual({ redondeo: 99 });
    });
    it('margen por categoría', () => {
        expect(interpretarConfigPrecios('camperas 80% de margen', cats)).toEqual({ margenPorCategoria: { camperas: 80 } });
        expect(interpretarConfigPrecios('poné margen 120% para los jeans', cats)).toEqual({ margenPorCategoria: { jeans: 120 } });
    });
    it('liquidación', () => {
        expect(interpretarConfigPrecios('liquidación a los 60 días con 25%')).toEqual({ liquidacion: { dias: 60, descuento: 25 } });
        expect(interpretarConfigPrecios('liquidá a los 30 dias')).toEqual({ liquidacion: { dias: 30 } });
    });
    it('no confunde una pregunta de precio ni charla con configuración', () => {
        expect(interpretarConfigPrecios('me costó 24000 con packaging 800')).toBeNull();
        expect(interpretarConfigPrecios('cuánto vendí hoy')).toBeNull();
        expect(interpretarConfigPrecios('hola lau')).toBeNull();
    });
    it('aplica sobre lo guardado sin pisar el resto', () => {
        const siteConfig = { precios: { margen: 100, packaging: 300, margenPorCategoria: { jeans: 90 }, liquidacion: { dias: 45, descuento: 20 } } };
        const r = aplicarConfigPrecios(siteConfig, { flete: 500, margenPorCategoria: { camperas: 80 }, liquidacion: { descuento: 30 } });
        expect(r).toEqual({ margen: 100, packaging: 300, flete: 500, redondeo: 100, margenPorCategoria: { jeans: 90, camperas: 80 }, liquidacion: { dias: 45, descuento: 30 } });
        expect(describirConfigPrecios({ margen: 110, packaging: 800, liquidacion: { dias: 60, descuento: 25 } })).toBe('margen 110% sobre el costo · packaging $800 por prenda · liquidación a los 60 días con 25%');
    });
});

describe('liquidación inteligente', () => {
    const siteConfig = { precios: { margen: 100, redondeo: 100, liquidacion: { dias: 45, descuento: 20 } } };
    const pay = { realMpFeePercent: 7.6 };
    const INV = [
        { id: 'p1', name: 'Jean Oxford', price: 46500, cost: 21000, stock: 3, createdAt: hace(90) },          // viejo, sin ventas
        { id: 'p2', name: 'Top Rib', price: 14800, cost: 6500, stock: 4, createdAt: hace(90) },               // vendido hace poco
        { id: 'p3', name: 'Campera', price: 82700, cost: 38000, stock: 2, createdAt: hace(20) },              // nuevo
        { id: 'p4', name: 'Sweater', price: 48700, cost: 22000, stock: 0, createdAt: hace(90) },              // sin stock
        { id: 'p5', name: 'Short', price: 16500, cost: 7300, stock: 3, createdAt: hace(90), badges: { isOnSale: true } }, // ya en oferta
        { id: 'p6', name: 'Body', price: 7600, cost: 7000, stock: 3, createdAt: hace(90) },                   // sin margen para bajar
    ];
    const PED = [{ id: 'A1', date: new Date(hace(5)).toISOString(), status: 'approved', items: [{ id: 'p2', name: 'Top Rib', quantity: 1 }] }];

    it('cuenta los días desde la última venta, la carga o la apertura', () => {
        expect(diasSinVender(INV[0], PED, { ahora: AHORA })).toBe(90);
        expect(diasSinVender(INV[1], PED, { ahora: AHORA })).toBe(5);
        expect(diasSinVender(INV[0], PED, { ahora: AHORA, desde: hace(10) })).toBe(10);
    });
    it('el piso cubre costo y comisión', () => {
        expect(pisoDePrecio({ cost: 21000 }, pay)).toBe(22800); // 21000 / 0.924 = 22727 → 22800
    });
    it('propone solo lo que corresponde, nunca bajo el costo', () => {
        const c = candidatosLiquidacion(INV, PED, { siteConfig, paymentConfig: pay, ahora: AHORA });
        expect(c.map((x) => x.producto.id)).toEqual(['p1']);
        expect(c[0]).toMatchObject({ dias: 90, precio: 46500, nuevo: 37200, descuentoReal: 20 });
        const fuerte = candidatosLiquidacion(INV, PED, { siteConfig, paymentConfig: pay, ahora: AHORA, descuento: 60 });
        expect(fuerte[0].nuevo).toBe(22800); // se frena en el piso
        expect(fuerte[0].nuevo).toBe(fuerte[0].piso);
    });
    it('resumen y frases', () => {
        const cfg = configLiquidacion(siteConfig);
        expect(resumirLiquidacion([], cfg)).toContain('Nada para liquidar');
        const c = candidatosLiquidacion(INV, PED, { siteConfig, paymentConfig: pay, ahora: AHORA });
        expect(resumirLiquidacion(c, cfg)).toContain('Jean Oxford (90 días, 3 en stock): $46.500 → $37.200 (−20%)');
        expect(esPedidoDeLiquidacion('liquidación')).toBe(true);
        expect(esPedidoDeLiquidacion('liquidá lo que no se vende')).toBe(true);
        expect(esPedidoDeLiquidacion('¿qué no se está vendiendo?')).toBe(true);
        expect(esPedidoDeLiquidacion('cuánto vendí hoy')).toBe(false);
        expect(descuentoPedido('liquidá con 30%')).toBe(30);
        expect(descuentoPedido('liquidación')).toBeNull();
    });
});
