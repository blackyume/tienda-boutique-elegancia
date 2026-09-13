import { describe, it, expect } from 'vitest';
import { aPrecio, leerVentasDeCeldas, planearVentas, fechaDesdeNombre, notaDesdeNombre, claveDeVenta, interpretarMensajeDePlanilla, resumirPlanDeVentas } from '../src/utils/importarVentas';

// La planilla del dueño, tal cual la arma: una columna por clienta, bloques
// de cuatro líneas por prenda, TOTAL y PAGADO al final. Los nombres son de
// fantasía; el formato es el de "WAKANDA 09-26.xlsx".
const PLANILLA = [
    ['CLIENTA UNO', 'CLIENTA DOS'],
    [],
    ['SHORT SASTRERO CIERRE INVISIBLE', 'REMERA ALGODÓN MANGA JAPONESA'],
    ['TALLE 5 ', 'TALLE M '],
    ['CHOCOLATE', 'NEGRO'],
    ['PRECIO $ 13,501', 'PRECIO $ 12,400'],
    [],
    ['BODY MUSCULOSA CUELLO AMERICANO MODAL', 'SHORT SASTRERO WKND CIERRE INVISIBLE'],
    ['TALLE XL ', 'TALLE 2 '],
    ['BEIGE LINEAS BLANCAS', 'BEIGE'],
    ['PRECIO $ 10,501', 'PRECIO $ 13,501'],
    [],
    ['TOTAL $ 24,002', 'TOTAL $ 25,901'],
    [],
    ['PAGADO', 'DEBE'],
];

describe('aPrecio', () => {
    it('"13,501" y "13.501" son trece mil quinientos uno, no trece con decimales', () => {
        expect(aPrecio('PRECIO $ 13,501')).toBe(13501);
        expect(aPrecio('$ 13.501')).toBe(13501);
        expect(aPrecio('1,250,000')).toBe(1250000);
        expect(aPrecio(46500)).toBe(46500);
        expect(aPrecio('')).toBeNull();
    });
});

describe('leerVentasDeCeldas · columnas por clienta', () => {
    const { ventas, avisos } = leerVentasDeCeldas(PLANILLA);

    it('encuentra una venta por columna, con sus prendas', () => {
        expect(ventas).toHaveLength(2);
        expect(ventas[0].cliente).toBe('CLIENTA UNO');
        expect(ventas[0].items).toEqual([
            { name: 'SHORT SASTRERO CIERRE INVISIBLE', size: '5', color: 'CHOCOLATE', price: 13501, quantity: 1 },
            { name: 'BODY MUSCULOSA CUELLO AMERICANO MODAL', size: 'XL', color: 'BEIGE LINEAS BLANCAS', price: 10501, quantity: 1 },
        ]);
        expect(ventas[0].total).toBe(24002);
        expect(avisos).toEqual([]);
    });

    it('PAGADO y DEBE se leen', () => {
        expect(ventas[0].pagado).toBe(true);
        expect(ventas[1].pagado).toBe(false);
    });

    it('si el TOTAL de la planilla no cierra con las prendas, avisa y usa la suma', () => {
        const r = leerVentasDeCeldas([['ANA'], ['REMERA'], ['TALLE M'], ['NEGRO'], ['PRECIO $ 10,000'], ['TOTAL $ 12,000']]);
        expect(r.ventas[0].total).toBe(10000);
        expect(r.avisos[0]).toMatch(/12\.000.*10\.000/);
    });

    it('una prenda sin precio no entra, y lo dice', () => {
        const r = leerVentasDeCeldas([['ANA'], ['REMERA'], ['TALLE M'], ['NEGRO'], [], ['SHORT'], ['TALLE 2'], ['PRECIO $ 9,000']]);
        expect(r.ventas[0].items.map(i => i.name)).toEqual(['SHORT']);
        expect(r.avisos.join(' ')).toContain('"REMERA"');
    });

    it('"CANTIDAD 2" multiplica', () => {
        const r = leerVentasDeCeldas([['ANA'], ['REMERA'], ['TALLE M'], ['CANTIDAD 2'], ['PRECIO $ 10,000']]);
        expect(r.ventas[0].items[0].quantity).toBe(2);
        expect(r.ventas[0].total).toBe(20000);
    });

    it('con la planilla vacía no explota', () => {
        expect(leerVentasDeCeldas([]).ventas).toEqual([]);
        expect(leerVentasDeCeldas([[null, ''], []]).ventas).toEqual([]);
    });
});

describe('leerVentasDeCeldas · tabla con cabecera', () => {
    it('agrupa filas por clienta', () => {
        const r = leerVentasDeCeldas([
            ['Cliente', 'Producto', 'Talle', 'Color', 'Precio', 'Cantidad'],
            ['Ana', 'Remera', 'M', 'negro', '12.400', 1],
            ['Ana', 'Short', '2', 'beige', 13501, 2],
            ['Beti', 'Body', 'XL', '', '$ 10.501', ''],
        ]);
        expect(r.ventas.map(v => [v.cliente, v.items.length, v.total])).toEqual([['Ana', 2, 12400 + 27002], ['Beti', 1, 10501]]);
    });
});

describe('planearVentas', () => {
    const { ventas } = leerVentasDeCeldas(PLANILLA);
    const inventario = [{ id: 7, name: 'Short Sastrero Cierre Invisible', price: 13501, cost: 6000, image: 'x.jpg', category: 'Shorts' }];

    it('arma un pedido manual por clienta, como los de Lau, con la fecha y el canal elegidos', () => {
        const plan = planearVentas(ventas, { inventario, fecha: '2026-09-01', canal: 'WhatsApp', nota: 'WAKANDA 09-26' });
        expect(plan.nuevos).toHaveLength(2);
        const p = plan.nuevos[0];
        expect(p.id).toMatch(/^MAN-\d{6}$/);
        expect(p.manual).toBe(true);
        expect(p.channel).toBe('WhatsApp');
        expect(p.status).toBe('approved');
        expect(plan.nuevos[1].status).toBe('pending');
        expect(p.date.startsWith('2026-09-01')).toBe(true);
        expect(p.customer.nombre).toBe('Clienta Uno'); // la planilla venía en mayúsculas
        expect(p.total).toBe(24002);
        expect(p.note).toBe('WAKANDA 09-26');
        expect(plan.totalNuevos).toBe(24002 + 25901);
        expect(plan.prendas).toBe(4);
    });

    it('una prenda que está en el inventario se enlaza por nombre (sin importar mayúsculas) y trae costo e imagen', () => {
        const plan = planearVentas(ventas, { inventario, fecha: '2026-09-01' });
        const i = plan.nuevos[0].items[0];
        expect(i.id).toBe(7);
        expect(i.enInventario).toBe(true);
        expect(i.cost).toBe(6000);
        expect(i.image).toBe('x.jpg');
        expect(plan.nuevos[0].items[1].enInventario).toBe(false);
        expect(plan.enInventario).toBe(1);
    });

    it('la misma planilla dos veces no duplica: la segunda vez van a "repetidas"', () => {
        const primera = planearVentas(ventas, { fecha: '2026-09-01' });
        const segunda = planearVentas(ventas, { fecha: '2026-09-01', pedidos: primera.nuevos });
        expect(segunda.nuevos).toHaveLength(0);
        expect(segunda.repetidas).toHaveLength(2);
        // Con otra fecha es otra venta.
        expect(planearVentas(ventas, { fecha: '2026-10-01', pedidos: primera.nuevos }).nuevos).toHaveLength(2);
    });

    it('la clave no depende del orden de las prendas', () => {
        const v = ventas[0];
        const alReves = { ...v, items: [...v.items].reverse() };
        expect(claveDeVenta(v, '2026-09-01')).toBe(claveDeVenta(alReves, '2026-09-01'));
    });
});

describe('fecha y nota desde el nombre del archivo', () => {
    it('"WAKANDA 09-26.xlsx" es septiembre de 2026', () => {
        expect(fechaDesdeNombre('WAKANDA 09-26.xlsx')).toBe('2026-09-01');
        expect(fechaDesdeNombre('ventas 3-2027.xlsx')).toBe('2027-03-01');
        expect(fechaDesdeNombre('ventas.xlsx', new Date('2026-09-12T15:00:00Z'))).toBe('2026-09-12');
        expect(notaDesdeNombre('WAKANDA 09-26.xlsx')).toBe('WAKANDA 09-26');
    });
});

describe('interpretarMensajeDePlanilla · lo que le escribís a Lau junto al archivo', () => {
    it('sin texto: fecha del nombre del archivo y WhatsApp', () => {
        expect(interpretarMensajeDePlanilla('', 'WAKANDA 09-26.xlsx')).toEqual({ fecha: '2026-09-01', canal: 'WhatsApp', descontarStock: false });
    });
    it('con fecha y canal en el mensaje, manda el mensaje', () => {
        expect(interpretarMensajeDePlanilla('son ventas del 5/9/2026 por instagram', 'x.xlsx')).toMatchObject({ fecha: '2026-09-05', canal: 'Instagram' });
        expect(interpretarMensajeDePlanilla('vendidas en el local el 12/9', 'x.xlsx', new Date('2026-09-12'))).toMatchObject({ fecha: '2026-09-12', canal: 'Local' });
    });
    it('"descontá el stock" activa el descuento', () => {
        expect(interpretarMensajeDePlanilla('cargalas y descontá el stock', 'x.xlsx').descontarStock).toBe(true);
    });
});

describe('resumirPlanDeVentas', () => {
    it('lista clientas, prendas, total y la fecha; y avisa lo repetido', () => {
        const { ventas } = leerVentasDeCeldas(PLANILLA);
        const plan = planearVentas(ventas, { fecha: '2026-09-01', canal: 'WhatsApp' });
        const txt = resumirPlanDeVentas(plan, { fecha: '2026-09-01', canal: 'WhatsApp' });
        expect(txt).toContain('2 clientas, 4 prendas, $49.903');
        expect(txt).toContain('• Clienta Uno — $24.002');
        expect(txt).toContain('• Clienta Dos — $25.901 (pendiente de pago)');
        expect(txt).toContain('Fecha 01/09/2026 · canal WhatsApp');
        const vacio = resumirPlanDeVentas(planearVentas([], {}), {});
        expect(vacio).toContain('No encontré ventas');
    });
});
