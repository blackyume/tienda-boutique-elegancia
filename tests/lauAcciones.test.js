import { describe, it, expect } from 'vitest';
import { interpretarAccion, opcionesDeVariante, opcionesDeProducto, describirRepetidos, accionInversa } from '../src/utils/lauAcciones';

const inventario = [
    { id: 'j1', name: 'JEANS ELASTIZADO OXFORD', price: 46500, active: true, variants: [{ size: '38', color: 'Azul', stock: 2 }, { size: '40', color: 'Azul', stock: 1 }, { size: '38', color: 'Negro', stock: 0 }] },
    { id: 'j2', name: 'JEANS ELASTIZADO CHUPIN', price: 42300, active: true, stock: 2 },
    { id: 's1', name: 'SWEATER LANILLA', price: 48700, active: true, stock: 3 },
    { id: 'c1', name: 'CARTERA CUERO', price: 30000, active: false, stock: 0 },
];

describe('interpretarAccion: precio', () => {
    it('"ponele 48000 al sweater lanilla"', () => {
        const r = interpretarAccion('ponele 48000 al sweater lanilla', inventario);
        expect(r.tipo).toBe('precio');
        expect(r.accion).toEqual({ tool: 'set_price', args: { productId: 's1', nombre: 'SWEATER LANILLA', price: 48000 } });
        expect(r.resumen).toContain('$48.000');
    });
    it('"cambiale el precio al jean chupin a 45.000" y "el sweater lanilla a $50.000"', () => {
        expect(interpretarAccion('cambiale el precio al jean chupin a 45.000', inventario).accion.args).toMatchObject({ productId: 'j2', price: 45000 });
        expect(interpretarAccion('el sweater lanilla a $50.000', inventario).accion.args.price).toBe(50000);
    });
    it('una pregunta de precio no es una acción', () => {
        expect(interpretarAccion('¿cuánto sale el sweater lanilla?', inventario)).toBeNull();
        expect(interpretarAccion('a cuánto está el jean a 46500?', inventario)).toBeNull();
    });
});

describe('interpretarAccion: mostrar / ocultar', () => {
    it('oculta y muestra', () => {
        expect(interpretarAccion('ocultá el sweater lanilla', inventario).accion.args).toMatchObject({ productId: 's1', visible: false });
        expect(interpretarAccion('mostrá la cartera cuero', inventario).accion.args).toMatchObject({ productId: 'c1', visible: true });
        expect(interpretarAccion('publicá la cartera de cuero', inventario).accion.args.visible).toBe(true);
    });
    it('no confunde "mostrame el stock" con publicar', () => {
        expect(interpretarAccion('mostrame el stock del sweater', inventario)).toBeNull();
    });
});

describe('interpretarAccion: llegaron', () => {
    it('sin variantes suma directo', () => {
        const r = interpretarAccion('llegaron 10 sweater lanilla', inventario);
        expect(r.accion.args).toMatchObject({ productId: 's1', delta: 10 });
    });
    it('con variantes pide talle y color, y con talle y color explícitos resuelve', () => {
        const r = interpretarAccion('llegaron 3 jean oxford', inventario);
        expect(r.falta).toBe('variante');
        expect(r.opciones).toHaveLength(3);
        const ops = opcionesDeVariante('llegaron 3 jean oxford', r.opciones);
        expect(ops[0]).toBe('llegaron 3 jean oxford talle 38 color Azul');
        const r2 = interpretarAccion(ops[0], inventario);
        expect(r2.accion.args).toMatchObject({ productId: 'j1', delta: 3, size: '38', color: 'Azul' });
    });
    it('acepta talle y color sueltos', () => {
        const r = interpretarAccion('me llegaron 2 jean oxford 40 azul', inventario);
        expect(r.accion.args).toMatchObject({ productId: 'j1', delta: 2, size: '40', color: 'Azul' });
    });
});

describe('interpretarAccion: venta por fuera', () => {
    it('"vendí 2 sweater lanilla a 46500 por whatsapp" → precio por unidad y canal', () => {
        const r = interpretarAccion('vendí 2 sweater lanilla a 46500 por whatsapp', inventario);
        expect(r.accion.tool).toBe('record_sale');
        expect(r.accion.args).toMatchObject({ productId: 's1', quantity: 2, channel: 'whatsapp', unitPrice: 46500 });
        expect(r.resumen).toContain('$93.000');
    });
    it('"vendí 2 sweater lanilla por 90.000" → monto total', () => {
        expect(interpretarAccion('vendí 2 sweater lanilla por 90.000', inventario).accion.args.amount).toBe(90000);
    });
    it('sin precio usa el de la tienda', () => {
        const r = interpretarAccion('vendí un sweater lanilla en el local', inventario);
        expect(r.accion.args).toMatchObject({ quantity: 1, channel: 'local' });
        expect(r.accion.args.amount).toBeUndefined();
        expect(r.resumen).toContain('$48.700');
    });
    it('con variantes pide la variante, y no deja vender más de lo que hay', () => {
        const r = interpretarAccion('vendí el jean oxford', inventario);
        expect(r.falta).toBe('variante');
        const r2 = interpretarAccion('vendí el jean oxford talle 38 color Negro', inventario);
        expect(r2.sinStock).toBe(true);
        const r3 = interpretarAccion('vendí el jean oxford talle 38 azul', inventario);
        expect(r3.accion.args).toMatchObject({ productId: 'j1', quantity: 1, size: '38', color: 'Azul' });
        expect(r3.accion.args.amount).toBeUndefined();
    });
    it('"vendí 2 jeans" es ambiguo: dos productos', () => {
        const r = interpretarAccion('vendí 2 jeans', inventario);
        expect(r.productos.map(p => p.id)).toEqual(['j1', 'j2']);
        const ops = opcionesDeProducto('vendí 2 jeans', r.nombre, r.productos);
        expect(ops[1]).toBe('vendí 2 "JEANS ELASTIZADO CHUPIN"');
        expect(interpretarAccion(ops[1], inventario).accion.args.productId).toBe('j2');
    });
    it('una pregunta de ventas no es una acción', () => {
        expect(interpretarAccion('¿cuánto vendí hoy?', inventario)).toBeNull();
        expect(interpretarAccion('qué se vendió ayer', inventario)).toBeNull();
    });
});

describe('interpretarAccion: lo que no le toca', () => {
    it('fotos, masivos y frases sueltas van a la IA', () => {
        expect(interpretarAccion('cambiá la foto del jean oxford', inventario)).toBeNull();
        expect(interpretarAccion('subí 10% todos los precios', inventario)).toBeNull();
        expect(interpretarAccion('hola lau', inventario)).toBeNull();
    });
    it('dos productos con el mismo nombre se desempatan con #id', () => {
        const inv = [...inventario, { id: 'zz9999', name: 'SWEATER LANILLA', price: 51000, stock: 1 }];
        const r = interpretarAccion('ocultá el sweater lanilla', inv);
        expect(r.productos).toHaveLength(2);
        const ops = opcionesDeProducto('ocultá el sweater lanilla', r.nombre, r.productos);
        expect(ops).toEqual(['ocultá el "SWEATER LANILLA" #s1', 'ocultá el "SWEATER LANILLA" #zz9999']);
        expect(interpretarAccion(ops[1], inv).accion.args.productId).toBe('zz9999');
        expect(describirRepetidos(r.productos)).toContain('#zz9999 es el de $51.000');
    });
    it('producto inexistente', () => {
        expect(interpretarAccion('ocultá el vestido rojo', inventario)).toMatchObject({ tipo: 'ocultar', productos: [] });
    });
});

describe('accionInversa', () => {
    it('sabe deshacer precio, visibilidad, stock y venta', () => {
        const p = inventario[2];
        expect(accionInversa({ tool: 'set_price', args: { productId: 's1', price: 1 } }, p).args).toEqual({ productId: 's1', price: 48700 });
        expect(accionInversa({ tool: 'toggle_visible', args: { visible: false } }, p).args.visible).toBe(true);
        expect(accionInversa({ tool: 'adjust_stock', args: { delta: 10 } }, p).args.delta).toBe(-10);
        expect(accionInversa({ tool: 'record_sale', args: {} }, p, 'Venta registrada (MAN-123456) …').args).toEqual({ orderId: 'MAN-123456' });
        expect(accionInversa({ tool: 'record_sale', args: {} }, p, 'sin id')).toBeNull();
    });
});
