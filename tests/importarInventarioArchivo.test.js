import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { filasDesdeHoja, filasDesdeCsv, planearImportacion } from '../src/utils/importarInventario';

const INVENTARIO = [
    { id: 'a1', name: 'Vestido Aurora', category: 'Vestidos', price: 45000, cost: 20000, stock: 3, sizes: ['S', 'M'], colors: ['negro'], active: true, image: 'https://x/1.jpg' },
    { id: 'c3', name: 'Pollera Sol', category: 'Polleras', price: 18000, stock: 5, sizes: ['M'], colors: [], active: true, image: 'https://x/3.jpg' },
];

// Reproduce la planilla que arma "Exportar Excel": mismos encabezados,
// columnas calculadas y la fila TOTAL del final.
const hojaComoElExport = async (filas) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Inventario');
    ws.columns = [
        { header: 'Foto', key: 'foto' },
        { header: 'Producto', key: 'producto' },
        { header: 'Categoría', key: 'categoria' },
        { header: 'Precio venta', key: 'precio' },
        { header: 'Costo', key: 'costo' },
        { header: 'Ganancia x unidad', key: 'ganancia' },
        { header: 'Stock', key: 'stock' },
        { header: 'Valor en stock', key: 'valor' },
        { header: 'Talles', key: 'talles' },
        { header: 'Colores', key: 'colores' },
        { header: 'Estado', key: 'estado' },
    ];
    filas.forEach((f) => ws.addRow(f));
    ws.addRow({ producto: 'TOTAL', valor: 999999, ganancia: 111 });
    const buffer = await wb.xlsx.writeBuffer();
    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.load(buffer);
    return wb2.worksheets[0];
};

describe('el Excel exportado vuelve a entrar', () => {
    it('lee las filas, descarta el TOTAL y detecta sólo lo que cambió', async () => {
        const ws = await hojaComoElExport([
            { foto: '', producto: 'Vestido Aurora', categoria: 'Vestidos', precio: 52000, costo: 20000, ganancia: 32000, stock: 3, valor: 156000, talles: 'S, M', colores: 'negro', estado: 'Publicado' },
            { foto: '', producto: 'Pollera Sol', categoria: 'Polleras', precio: 18000, costo: null, ganancia: null, stock: 5, valor: 90000, talles: 'M', colores: '', estado: 'Publicado' },
            { foto: '', producto: 'Saco Luna', categoria: 'Sacos', precio: 60000, costo: 25000, ganancia: 35000, stock: 2, valor: 120000, talles: 'S, M, L', colores: 'camel', estado: 'Borrador' },
        ]);

        const filas = filasDesdeHoja(ws);
        expect(filas).toHaveLength(3);
        expect(filas.some((f) => String(f.Producto).toUpperCase() === 'TOTAL')).toBe(false);

        const plan = planearImportacion(filas, INVENTARIO);
        expect(plan.altas.map((a) => a.nombre)).toEqual(['Saco Luna']);
        expect(plan.cambios).toHaveLength(1);
        expect(plan.cambios[0].nombre).toBe('Vestido Aurora');
        expect(plan.cambios[0].campos).toEqual({ price: 52000 });
        expect(plan.sinCambios).toBe(1);
        expect(plan.errores).toHaveLength(0);
    });

    it('una planilla sin cambios no genera ni una escritura', async () => {
        const ws = await hojaComoElExport([
            { producto: 'Vestido Aurora', categoria: 'Vestidos', precio: 45000, costo: 20000, stock: 3, talles: 'S, M', colores: 'negro', estado: 'Publicado' },
            { producto: 'Pollera Sol', categoria: 'Polleras', precio: 18000, stock: 5, talles: 'M', colores: '', estado: 'Publicado' },
        ]);
        const plan = planearImportacion(filasDesdeHoja(ws), INVENTARIO);
        expect(plan.altas).toHaveLength(0);
        expect(plan.cambios).toHaveLength(0);
        expect(plan.sinCambios).toBe(2);
    });
});

describe('CSV', () => {
    it('lee comas, punto y coma y comillas', () => {
        const filas = filasDesdeCsv(
            'Producto,Precio venta,Stock,Talles\n"Vestido Aurora, edición","$ 52.000",3,"S, M"\nPollera Sol,18000,5,M'
        );
        expect(filas).toHaveLength(2);
        expect(filas[0]['Producto']).toBe('Vestido Aurora, edición');
        expect(filas[0]['Precio venta']).toBe('$ 52.000');
        expect(filas[1]['Stock']).toBe('5');
    });
});
