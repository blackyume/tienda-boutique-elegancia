import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DetallePedido } from '../src/components/admin/DetallePedido';

// El detalle del pedido es lo que lee el dueño para despachar: tiene que
// mostrar todo lo que necesita MiCorreo, y el link de WhatsApp tiene que ir
// al número de la clienta en formato internacional.
const pedido = {
    id: 'ORD-123456', shipping: 'correo_domicilio', shippingName: 'Correo Argentino a domicilio', shippingCost: 10900,
    customer: { nombre: 'Laura', apellido: 'Colleras', dni: '30123456', telefono: '3492 216487', email: 'laura@example.com', calle: 'Belgrano', altura: '1234', piso: '2° B', ciudad: 'Rafaela', provincia: 'Santa Fe', cp: '2300', referencias: 'tocar portón' },
    items: [{ name: 'Jean Oxford', size: '38', color: 'azul', quantity: 2, price: 46500 }],
};

describe('DetallePedido', () => {
    it('muestra contenido, DNI, teléfono con WhatsApp, email, dirección completa y referencias', () => {
        const html = renderToStaticMarkup(React.createElement(DetallePedido, { pedido }));
        for (const s of ['Jean Oxford', '38 · azul', '30123456', 'https://wa.me/5493492216487', 'laura@example.com', 'Belgrano 1234, 2° B — Rafaela, Santa Fe (2300)', 'tocar portón', 'Copiar datos para MiCorreo']) {
            expect(html).toContain(s);
        }
    });

    it('no explota con un pedido viejo sin dirección ni items', () => {
        const html = renderToStaticMarkup(React.createElement(DetallePedido, { pedido: { id: 'X', customer: { nombre: 'Ana' } } }));
        expect(html).toContain('Copiar datos para MiCorreo');
    });
});
