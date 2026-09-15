import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GUIAS, buscarGuias } from '../src/components/admin/guias/contenido';
import { TARIFAS_DE_LA_CASA } from '../src/utils/envios';

// Las guías del panel son texto que lee una persona que no programa. Lo que
// se testea acá es que no se rompan sin que nadie lo note: que cada una
// renderice, que el índice lateral apunte a secciones que existen, y que los
// precios que dicen sean los que cobra el checkout.

const render = (g) => renderToStaticMarkup(React.createElement(g.Contenido, { abrir: () => { } }));

describe('guías del panel', () => {
    it('hay diez y los ids no se repiten', () => {
        expect(GUIAS.length).toBe(13);
        expect(new Set(GUIAS.map(g => g.id)).size).toBe(GUIAS.length);
    });

    it('cada guía tiene lo que la portada necesita', () => {
        for (const g of GUIAS) {
            expect(g.titulo, g.id).toBeTruthy();
            expect(g.resumen, g.id).toBeTruthy();
            expect(g.icono, g.id).toBeTruthy(); // lucide: forwardRef, es objeto
            expect(g.duracion, g.id).toMatch(/\d+ min/);
            expect(['Dueño', 'Quien carga productos', 'Los dos'], g.id).toContain(g.para);
            expect(g.palabras.length, g.id).toBeGreaterThan(2);
            expect(g.secciones.length, g.id).toBeGreaterThan(1);
        }
    });

    it('todas renderizan y cada sección del índice existe en el contenido', () => {
        for (const g of GUIAS) {
            const html = render(g);
            expect(html.length, g.id).toBeGreaterThan(2000);
            for (const [id] of g.secciones) {
                expect(html, `${g.id} → #${id}`).toContain(`id="${id}"`);
            }
        }
    });

    it('los enlaces entre guías apuntan a guías que existen', () => {
        // Cada botón "abrir" recibe un id; se capturan llamándolo de verdad.
        const ids = new Set(GUIAS.map(g => g.id));
        for (const g of GUIAS) {
            const pedidos = [];
            const html = renderToStaticMarkup(React.createElement(g.Contenido, { abrir: (id) => pedidos.push(id) }));
            // Los onClick no se ejecutan en SSR: se buscan los ids en el código fuente del componente.
            const fuente = g.Contenido.toString();
            const enlaces = [...fuente.matchAll(/abrir\(['"]([a-z-]+)['"]\)/g)].map(m => m[1]);
            for (const e of enlaces) expect(ids.has(e), `${g.id} → ${e}`).toBe(true);
            expect(html).toBeTruthy();
            expect(pedidos).toEqual([]);
        }
    });

    it('la guía de envíos dice los mismos precios que cobra el checkout', () => {
        const html = render(GUIAS.find(g => g.id === 'pedido-envio'));
        const fmt = (n) => `$${n.toLocaleString('es-AR')}`;
        expect(html).toContain(fmt(TARIFAS_DE_LA_CASA.correo_domicilio.cost));
        expect(html).toContain(fmt(TARIFAS_DE_LA_CASA.sucursal.cost));
    });

    it('ninguna guía manda a "Admin → Categorías", que no existe: las categorías están en CMS / Diseño', () => {
        for (const g of GUIAS) {
            const html = render(g);
            expect(html, g.id).not.toMatch(/Admin<[^>]*>[^<]*<[^>]*>[^<]*Categorías/);
        }
    });

    it('la plantilla que enlaza la guía existe en public/', async () => {
        const { existsSync } = await import('node:fs');
        expect(existsSync('public/docs/plantilla-productos.xlsx')).toBe(true);
    });
});

describe('buscarGuias', () => {
    it('sin término devuelve todas', () => {
        expect(buscarGuias('')).toHaveLength(GUIAS.length);
        expect(buscarGuias('   ')).toHaveLength(GUIAS.length);
    });

    it('ignora acentos y mayúsculas', () => {
        const a = buscarGuias('ETIQUETA').map(g => g.id);
        expect(a).toContain('pedido-envio');
        expect(buscarGuias('cotización').map(g => g.id)).toContain('zipnova');
    });

    it('busca también por palabras clave, no sólo por título', () => {
        expect(buscarGuias('impresora').map(g => g.id)).toEqual(['pedido-envio']);
        expect(buscarGuias('gemini').map(g => g.id)).toContain('ia-keys');
    });

    it('con algo que no está, devuelve vacío', () => {
        expect(buscarGuias('zapatillas nike')).toEqual([]);
    });
});
