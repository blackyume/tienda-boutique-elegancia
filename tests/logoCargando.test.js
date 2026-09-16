import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LogoCargando, CargandoRuta } from '../src/components/ui/LogoCargando';

describe('el "cargando" de la marca', () => {
    it('es el logo respirando, en dos tamaños, con el texto opcional', () => {
        const chico = renderToStaticMarkup(React.createElement(LogoCargando, { chico: true }));
        const grande = renderToStaticMarkup(React.createElement(LogoCargando, { texto: 'Moda femenina · Argentina' }));
        expect(chico).toContain('/assets/logo-main.png');
        expect(chico).toContain('animate-respirar');
        expect(chico).toContain('role="status"');
        expect(chico).not.toContain('Moda femenina');
        expect(grande).toContain('Moda femenina · Argentina');
        expect(grande).toContain('width="220"');
        expect(chico).toContain('width="120"');
    });
    it('entre páginas no muestra nada durante los primeros 200 ms', () => {
        expect(renderToStaticMarkup(React.createElement(CargandoRuta))).not.toContain('logo-main');
    });
});
