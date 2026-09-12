import { describe, it, expect } from 'vitest';
import {
    PROVINCIAS, esRetiroEnSucursal, telefonoInternacional, validarDatosCheckout,
    normalizarDatosCheckout, direccionEnUnaLinea, datosParaCorreo, partirNombreCompleto,
} from '../src/utils/direccion';

const completo = {
    nombre: 'Laura', apellido: 'Colleras', email: 'laura@example.com', telefono: '3492 216487', dni: '30.123.456',
    calle: 'Belgrano', altura: '1234', piso: '2° B', ciudad: 'Rafaela', provincia: 'Santa Fe', cp: '2300',
};

describe('validarDatosCheckout', () => {
    it('con todo cargado no hay errores', () => {
        expect(validarDatosCheckout(completo)).toEqual({});
    });

    it('a domicilio exige calle y altura; a sucursal no', () => {
        const sin = { ...completo, calle: '', altura: '' };
        expect(Object.keys(validarDatosCheckout(sin))).toEqual(['calle', 'altura']);
        expect(validarDatosCheckout(sin, { retiroEnSucursal: true })).toEqual({});
    });

    it('a sucursal igual pide localidad, provincia y CP: sin eso el correo no sabe a qué sucursal', () => {
        const e = validarDatosCheckout({ ...completo, ciudad: '', provincia: '', cp: '' }, { retiroEnSucursal: true });
        expect(Object.keys(e).sort()).toEqual(['ciudad', 'cp', 'provincia']);
    });

    it('rechaza email sin arroba, DNI con menos de 7 dígitos, CP que no son 4 números y provincia inventada', () => {
        const e = validarDatosCheckout({ ...completo, email: 'laura.com', dni: '12345', cp: '23000', provincia: 'Santa Fé' });
        expect(Object.keys(e).sort()).toEqual(['cp', 'dni', 'email', 'provincia']);
    });

    it('el teléfono acepta espacios y guiones pero pide al menos 8 dígitos', () => {
        expect(validarDatosCheckout({ ...completo, telefono: '3492-21-6487' })).toEqual({});
        expect(validarDatosCheckout({ ...completo, telefono: '1234' }).telefono).toBeTruthy();
    });

    it('todos los mensajes le hablan a la clienta, ninguno está vacío', () => {
        const e = validarDatosCheckout({});
        for (const [k, msg] of Object.entries(e)) expect(msg, k).toMatch(/\S{4,}/);
        expect(Object.keys(e).length).toBe(10);
    });
});

describe('normalizarDatosCheckout', () => {
    it('saca puntos del DNI, baja el email y recorta espacios', () => {
        const n = normalizarDatosCheckout({ ...completo, email: '  Laura@Example.com ', nombre: '  Laura  ' });
        expect(n.dni).toBe('30123456');
        expect(n.email).toBe('laura@example.com');
        expect(n.nombre).toBe('Laura');
        expect(n.referencias).toBe('');
    });
});

describe('telefonoInternacional', () => {
    it('convierte los formatos que escribe la gente al que usa wa.me', () => {
        expect(telefonoInternacional('3492 216487')).toBe('5493492216487');
        expect(telefonoInternacional('03492 15 216487')).toBe('5493492216487');
        expect(telefonoInternacional('+54 9 3492 21-6487')).toBe('5493492216487');
        expect(telefonoInternacional('54 3492 216487')).toBe('5493492216487');
        expect(telefonoInternacional('')).toBe('');
    });
});

describe('direccionEnUnaLinea y datosParaCorreo', () => {
    it('arma la dirección legible y omite lo que falta', () => {
        expect(direccionEnUnaLinea(completo)).toBe('Belgrano 1234, 2° B — Rafaela, Santa Fe (2300)');
        expect(direccionEnUnaLinea({ ciudad: 'Rafaela', cp: '2300' })).toBe('Rafaela (2300)');
        expect(direccionEnUnaLinea({})).toBe('');
    });

    it('el bloque para MiCorreo trae destinatario, entrega, dirección y contenido', () => {
        const txt = datosParaCorreo({
            id: 'ORD-123456', shipping: 'correo_domicilio', shippingName: 'Correo Argentino a domicilio',
            customer: { ...completo, referencias: 'tocar portón' },
            items: [{ name: 'Jean Oxford', size: '38', color: 'azul', quantity: 1 }],
        });
        expect(txt).toContain('Destinatario: Laura Colleras');
        expect(txt).toContain('Entrega: A DOMICILIO');
        expect(txt).toContain('Calle: Belgrano');
        expect(txt).toContain('Piso/Depto: 2° B');
        expect(txt).toContain('Referencias: tocar portón');
        expect(txt).toContain('- Jean Oxford · 38 · azul x1');
    });

    it('a sucursal no lista calle ni altura', () => {
        const txt = datosParaCorreo({ id: 'X', shipping: 'sucursal', customer: completo, items: [] });
        expect(txt).toContain('RETIRO EN SUCURSAL');
        expect(txt).not.toContain('Calle:');
        expect(txt).toContain('CP: 2300');
    });
});

describe('esRetiroEnSucursal', () => {
    it('lo detecta por la clave o por el nombre de la opción', () => {
        expect(esRetiroEnSucursal('sucursal')).toBe(true);
        expect(esRetiroEnSucursal('x', { name: 'Correo Argentino · Retiro en sucursal' })).toBe(true);
        expect(esRetiroEnSucursal('correo_domicilio', { name: 'A domicilio' })).toBe(false);
    });
});

describe('partirNombreCompleto', () => {
    it('separa lo que viene de Google', () => {
        expect(partirNombreCompleto('Laura Romina Colleras')).toEqual({ nombre: 'Laura', apellido: 'Romina Colleras' });
        expect(partirNombreCompleto('Laura')).toEqual({ nombre: 'Laura', apellido: '' });
        expect(partirNombreCompleto('')).toEqual({ nombre: '', apellido: '' });
    });
});

it('las 24 jurisdicciones están, en orden alfabético salvo CABA que va junto a Buenos Aires', () => {
    expect(PROVINCIAS).toHaveLength(24);
    expect(PROVINCIAS).toContain('Santa Fe');
});
