import { describe, it, expect } from 'vitest';
import { responderDirecto, buscarProductos, describirStock, avisoNuevaVenta, avisoCambiosDeStock, fotoDeStock, ventasDesde, resumirVentas } from '../src/utils/lauDirecto';
import { renombrarClientas, nombrePropio } from '../src/utils/importarVentas';

const INVENTARIO = [
    { id: 'p1', name: 'Vestido Negro Largo', price: 45000, stock: 3 },
    { id: 'p2', name: 'Jean Oxford', price: 48000, variants: [{ size: '38', color: 'Azul', stock: 2 }, { size: '40', color: 'Azul', stock: 0 }] },
    { id: 'p3', name: 'Top Rib', price: 12000, variants: { 'S::Blanco': 4, 'M::Blanco': 6 } },
    { id: 'p4', name: 'Campera Puffer', price: 90000, stock: 0 },
    { id: 'p5', name: 'Vestido Rojo Corto', price: 39000, stock: 12, active: false },
];

const AHORA = new Date('2026-09-12T18:00:00');
const hace = (min) => new Date(AHORA.getTime() - min * 60000).toISOString();
const PEDIDOS = [
    { id: 'A1', date: hace(30), status: 'approved', total: 45000, customer: { name: 'Carla Pérez' }, items: [{ id: 'p1', name: 'Vestido Negro Largo', quantity: 1, size: 'M' }] },
    { id: 'A2', date: hace(60 * 5), status: 'pending', total: 12000, customer: { nombre: 'Ana', apellido: 'Mena' }, channel: 'WhatsApp', manual: true, items: [{ id: 'p3', name: 'Top Rib', quantity: 1, size: 'S', color: 'Blanco' }] },
    { id: 'A3', date: hace(60 * 30), status: 'approved', total: 48000, customer: { name: 'Vale' }, items: [{ id: 'p2', name: 'Jean Oxford', quantity: 1 }] },
    { id: 'A4', date: hace(60 * 24 * 20), status: 'approved', total: 90000, customer: { name: 'Vieja' }, items: [] },
    { id: 'A5', date: hace(10), status: 'cancelled', total: 999999, customer: { name: 'Cancelada' }, items: [] },
];
const opts = { inventario: INVENTARIO, pedidos: PEDIDOS, ahora: AHORA };

describe('buscarProductos', () => {
    it('encuentra por parte del nombre, sin acentos ni mayúsculas', () => {
        expect(buscarProductos(INVENTARIO, 'jean').map(p => p.id)).toEqual(['p2']);
        expect(buscarProductos(INVENTARIO, 'VESTIDO NEGRO').map(p => p.id)).toEqual(['p1']);
    });
    it('junta palabras aunque estén en otro orden y en plural', () => {
        expect(buscarProductos(INVENTARIO, 'negro vestido').map(p => p.id)).toEqual(['p1']);
        expect(buscarProductos(INVENTARIO, 'vestidos').map(p => p.id).sort()).toEqual(['p1', 'p5']);
    });
});

describe('describirStock', () => {
    it('stock simple', () => {
        expect(describirStock(INVENTARIO[0])).toBe('⚠️ Vestido Negro Largo: quedan 3 unidades · $45.000');
        expect(describirStock(INVENTARIO[3])).toBe('⛔ Campera Puffer: sin stock · $90.000');
    });
    it('variantes en lista y en mapa, con el detalle por talle y color', () => {
        const jean = describirStock(INVENTARIO[1]);
        expect(jean).toContain('Jean Oxford: quedan 2 unidades');
        expect(jean).toContain('• talle 38 · Azul: 2');
        expect(jean).toContain('○ talle 40 · Azul: 0');
        const top = describirStock(INVENTARIO[2]);
        expect(top).toContain('✅ Top Rib: quedan 10 unidades');
        expect(top).toContain('talle M · Blanco: 6');
    });
    it('avisa si está en borrador', () => {
        expect(describirStock(INVENTARIO[4])).toContain('en borrador');
    });
});

describe('responderDirecto: stock', () => {
    it('contesta la pregunta de stock de un producto', () => {
        expect(responderDirecto('¿cuánto stock queda del jean oxford?', opts)).toContain('Jean Oxford: quedan 2');
        expect(responderDirecto('cuanto keda de vestido negro', opts)).toContain('Vestido Negro Largo: quedan 3');
        expect(responderDirecto('hay top rib?', opts)).toContain('Top Rib: quedan 10');
        expect(responderDirecto('stock campera puffer', opts)).toContain('sin stock');
    });
    it('si hay varios que coinciden, los lista', () => {
        const r = responderDirecto('¿cuántos vestidos quedan?', opts);
        expect(r).toContain('2 productos');
        expect(r).toContain('Vestido Negro Largo');
        expect(r).toContain('Vestido Rojo Corto');
    });
    it('panorama general', () => {
        const r = responderDirecto('¿cómo está el stock?', opts);
        expect(r).toContain('4 productos publicados');
        expect(r).toContain('Sin stock (1): Campera Puffer');
        expect(r).toContain('Poco stock');
        expect(responderDirecto('qué está agotado', opts)).toContain('Campera Puffer');
    });
    it('producto que no existe, cuando claramente pregunta stock', () => {
        expect(responderDirecto('stock de zapatillas', opts)).toContain('No encontré');
    });
    it('los pedidos de cambio van a la IA (null)', () => {
        expect(responderDirecto('subile el stock al jean oxford a 5', opts)).toBeNull();
        expect(responderDirecto('ponele stock 3 al top rib talle M', opts)).toBeNull();
        expect(responderDirecto('vendí 2 jeans por whatsapp a 46500', opts)).toBeNull();
        expect(responderDirecto('cambiale el precio al jean a 50000', opts)).toBeNull();
        expect(responderDirecto('generá una descripción para el vestido', opts)).toBeNull();
        expect(responderDirecto('hola lau', opts)).toBeNull();
        expect(responderDirecto('cómo va el negocio', opts)).toBeNull();
    });
});

describe('responderDirecto: ventas', () => {
    it('hoy: cuenta solo las de hoy y no las canceladas', () => {
        const r = responderDirecto('¿cuánto vendí hoy?', opts);
        expect(r).toContain('Hoy (12/9): 2 ventas por $57.000');
        expect(r).toContain('Carla Pérez · $45.000 · Tienda web · pagado');
        expect(r).toContain('Ana Mena · $12.000 · WhatsApp · pendiente de pago');
        expect(r).toContain('Top Rib (talle S, Blanco)');
        expect(r).not.toContain('Cancelada');
    });
    it('ayer, semana, mes, últimas', () => {
        expect(responderDirecto('qué se vendió ayer', opts)).toContain('Ayer (11/9): 1 venta por $48.000');
        expect(responderDirecto('ventas de la semana', opts)).toContain('3 ventas por $105.000');
        expect(responderDirecto('cuánto vendimos este mes', opts)).toContain('3 ventas');
        expect(responderDirecto('últimas ventas', opts)).toContain('Últimas 4 ventas');
    });
    it('sin ventas en el período', () => {
        expect(resumirVentas([], 'hoy', AHORA)).toBe('📊 Hoy (12/9): todavía ninguna venta.');
    });
    it('lo que es de envíos va a la IA', () => {
        expect(responderDirecto('qué pedidos tengo que enviar', opts)).toBeNull();
    });
});

describe('avisos en vivo', () => {
    it('venta nueva con lo que queda de cada prenda', () => {
        const r = avisoNuevaVenta(PEDIDOS[0], INVENTARIO);
        expect(r).toContain('🛍️ ¡Venta nueva! Carla Pérez · $45.000 · Tienda web · pagado');
        expect(r).toContain('Vestido Negro Largo (talle M) → ⚠️ quedan 3');
        expect(r).toContain('MiCorreo');
    });
    it('cambios de stock: bajó, se agotó, o nada', () => {
        const antes = fotoDeStock(INVENTARIO);
        const despues = INVENTARIO.map(p => p.id === 'p1' ? { ...p, stock: 0 } : p.id === 'p3' ? { ...p, variants: { 'S::Blanco': 3, 'M::Blanco': 6 } } : p);
        const r = avisoCambiosDeStock(antes, despues);
        expect(r).toContain('⛔ Vestido Negro Largo se agotó (tenías 3)');
        expect(r).toContain('📉 Top Rib: 10 → 9');
        expect(avisoCambiosDeStock(antes, INVENTARIO)).toBeNull();
        expect(avisoCambiosDeStock(antes, INVENTARIO.map(p => ({ ...p, stock: (p.stock || 0) + 5 })))).toBeNull();
    });
    it('ventasDesde: lo que entró desde la última visita, sin canceladas', () => {
        expect(ventasDesde(PEDIDOS, hace(60 * 6)).map(o => o.id)).toEqual(['A1', 'A2']);
    });
});

describe('renombrarClientas', () => {
    const ventas = [{ cliente: 'LORENA CAMPO', items: [] }, { cliente: 'ANA CAMPO', items: [] }];
    it('empareja por el primer nombre y toma el nombre completo del mensaje', () => {
        const { ventas: v, cambios } = renombrarClientas(ventas, 'ponele de nombre Ana Mena y Lorena Vivas');
        expect(v.map(x => x.cliente)).toEqual(['Lorena Vivas', 'Ana Mena']);
        expect(cambios).toHaveLength(2);
    });
    it('corta el nombre antes de "en el local", fechas y demás', () => {
        const { ventas: v } = renombrarClientas(ventas, 'ana mena en el local, fecha 5/9');
        expect(v[1].cliente).toBe('Ana Mena');
        expect(v[0].cliente).toBe('LORENA CAMPO');
    });
    it('sin nombres en el mensaje no cambia nada', () => {
        expect(renombrarClientas(ventas, 'descontá el stock').cambios).toEqual([]);
        expect(renombrarClientas(ventas, 'ana').cambios).toEqual([]);
    });
    it('nombrePropio', () => {
        expect(nombrePropio('LORENA CAMPO')).toBe('Lorena Campo');
        expect(nombrePropio('maría belén')).toBe('María Belén');
    });
});
