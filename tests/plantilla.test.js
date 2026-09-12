import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { filasDesdeExcel, planearImportacion } from '../src/utils/importarInventario';
it('la plantilla que se entrega al dueño la lee el importador', async () => {
    const filas = await filasDesdeExcel(readFileSync('docs/plantilla-productos.xlsx'));
    expect(filas).toHaveLength(3);
    const plan = planearImportacion(filas, [], ['jean-elastizado-oxford.jpg', 'campera-choco-1.jpg', 'campera-choco-2.jpg']);
    expect(plan.errores).toEqual([]);
    expect(plan.altas.map((a) => [a.nombre, a.fotos.length, a.datos.active])).toEqual([
        ['Jean Elastizado Oxford', 1, true],
        ['Campera Ecocuero Chocolate', 2, true],
        ['Top Cola de Ratón Morley', 0, false],
    ]);
});
