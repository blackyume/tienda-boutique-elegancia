import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/firebase', () => ({ db: {} }));

const { limpiarConsulta, consultaCompleta, textoDelAviso } = await import('../src/utils/consultas');

const base = { nombre: 'Sofía', email: 'sofia@ejemplo.com', mensaje: '¿Tienen talle M?' };

describe('limpiarConsulta', () => {
    it('recorta espacios y pasa el correo a minúsculas', () => {
        const c = limpiarConsulta({ nombre: '  Sofía ', email: ' Sofia@Ejemplo.COM ', mensaje: ' Hola ' });
        expect(c).toMatchObject({ nombre: 'Sofía', email: 'sofia@ejemplo.com', mensaje: 'Hola' });
    });

    it('respeta los límites de firestore.rules', () => {
        const c = limpiarConsulta({ nombre: 'n'.repeat(200), mensaje: 'm'.repeat(5000), producto: 'p'.repeat(500) });
        expect(c.nombre).toHaveLength(80);
        expect(c.mensaje).toHaveLength(1500);
        expect(c.producto).toHaveLength(200);
    });

    it('las novedades sólo cuentan si tildó la casilla', () => {
        expect(limpiarConsulta(base).novedades).toBe(false);
        expect(limpiarConsulta({ ...base, novedades: 'true' }).novedades).toBe(false);
        expect(limpiarConsulta({ ...base, novedades: true }).novedades).toBe(true);
    });
});

describe('consultaCompleta', () => {
    it('pide nombre, consulta y un correo válido', () => {
        expect(consultaCompleta(limpiarConsulta(base))).toBe(true);
        expect(consultaCompleta(limpiarConsulta({ ...base, nombre: ' ' }))).toBe(false);
        expect(consultaCompleta(limpiarConsulta({ ...base, mensaje: '' }))).toBe(false);
        expect(consultaCompleta(limpiarConsulta({ ...base, email: 'sofia@' }))).toBe(false);
    });
});

describe('textoDelAviso', () => {
    it('muestra el correo para poder contestarle', () => {
        const t = textoDelAviso(limpiarConsulta({ ...base, producto: 'Campera', novedades: true }));
        expect(t).toContain('Responder a: sofia@ejemplo.com');
        expect(t).toContain('Prenda: Campera');
        expect(t).toContain('sí, aceptó');
    });

    it('sin prenda no deja la línea vacía', () => {
        expect(textoDelAviso(limpiarConsulta(base))).not.toContain('Prenda:');
    });
});

describe('arrepentimiento', () => {
    it('el código entra en el límite de firestore.rules y lleva 8 caracteres', async () => {
        const { codigoDeArrepentimiento } = await import('../src/utils/consultas');
        expect(codigoDeArrepentimiento(1793760000000, 0.123456)).toMatch(/^ARR-[0-9A-Z]{8}$/);
        expect(codigoDeArrepentimiento(1793760000000, 0).length).toBeLessThanOrEqual(20);
    });

    it('el correo le da el código y le aclara que no paga la devolución', async () => {
        const { textoDelArrepentimiento } = await import('../src/utils/consultas');
        const t = textoDelArrepentimiento({ nombre: 'Sofía', pedido: 'ORD-1', codigo: 'ARR-ABCD1234' });
        expect(t).toContain('ARR-ABCD1234');
        expect(t).toContain('ORD-1');
        expect(t).toContain('No tiene costo');
    });
});
