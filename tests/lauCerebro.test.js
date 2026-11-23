import { describe, it, expect, vi } from 'vitest';
import { TOOLS } from '../src/utils/aiCopilot';
import {
    ESQUEMAS, HERRAMIENTAS_NUEVAS, declaraciones, correrAgente, historialParaGemini,
    separarOpciones, agregarRecuerdo, quitarRecuerdo, memoriaComoTexto, instantanea,
    esSensible, sistemaCompleto, MAX_PASOS,
} from '../src/utils/lauCerebro';
import { textoDelControl } from '../src/utils/lauFoto';

const TIPOS = new Set(['STRING', 'NUMBER', 'INTEGER', 'BOOLEAN', 'ARRAY', 'OBJECT']);
const validar = (sch, ruta) => {
    expect(TIPOS.has(sch.type), `${ruta}: tipo ${sch.type}`).toBe(true);
    if (sch.type === 'ARRAY') { expect(sch.items, `${ruta}: array sin items`).toBeTruthy(); validar(sch.items, `${ruta}[]`); }
    if (sch.type === 'OBJECT') {
        for (const [k, v] of Object.entries(sch.properties || {})) validar(v, `${ruta}.${k}`);
        for (const r of sch.required || []) expect(sch.properties[r], `${ruta}: requerido ${r} no existe`).toBeTruthy();
    }
};

describe('esquemas de herramientas', () => {
    it('cada herramienta tiene su esquema y es válido para Gemini', () => {
        for (const t of [...TOOLS, ...HERRAMIENTAS_NUEVAS]) {
            expect(ESQUEMAS[t.name], t.name).toBeTruthy();
            validar(ESQUEMAS[t.name], t.name);
        }
    });
    it('no sobra ningún esquema', () => {
        const nombres = new Set([...TOOLS, ...HERRAMIENTAS_NUEVAS].map(t => t.name));
        for (const k of Object.keys(ESQUEMAS)) expect(nombres.has(k), k).toBe(true);
    });
    it('las declaraciones marcan las que piden confirmación', () => {
        const d = declaraciones();
        expect(d.length).toBe(TOOLS.length + HERRAMIENTAS_NUEVAS.length);
        expect(d.find(x => x.name === 'delete_product').description).toMatch(/^\[PIDE CONFIRMACIÓN\]/);
        expect(d.find(x => x.name === 'query_sales').description).not.toMatch(/CONFIRMACIÓN/);
        expect(d.find(x => x.name === 'query_coupons').parameters).toBeUndefined();
        expect(esSensible('remember')).toBe(false);
        expect(esSensible('set_price')).toBe(true);
    });
});

const llamada = (name, args = {}) => ({ content: { role: 'model', parts: [{ functionCall: { name, args } }] } });
const texto = (t) => ({ content: { role: 'model', parts: [{ text: t }] } });

describe('ciclo del agente', () => {
    it('consulta, cambia y controla en un mismo turno', async () => {
        const guion = [
            llamada('get_product', { idOrName: 'jean' }),
            llamada('set_price', { productId: 'p1', price: 50000 }),
            llamada('get_product', { idOrName: 'p1' }),
            texto('Listo: el jean quedó a $50.000.'),
        ];
        const llamar = vi.fn(async () => guion.shift());
        const ejecutar = vi.fn(async (ps) => ps.map(p => ({ name: p.tool, resultado: 'ok' })));
        const dichos = [];
        const r = await correrAgente({ contents: [{ role: 'user', parts: [{ text: 'subí el jean a 50000' }] }], llamar, ejecutar, avisar: (t) => dichos.push(t) });
        expect(ejecutar).toHaveBeenCalledTimes(3);
        expect(r.llamadas).toBe(3);
        expect(dichos).toEqual(['Listo: el jean quedó a $50.000.']);
        // Los resultados vuelven a Gemini como functionResponse.
        expect(r.contents.filter(c => c.role === 'function')).toHaveLength(3);
    });

    it('si el dueño cancela, no sigue por su cuenta', async () => {
        const guion = [llamada('delete_product', { productId: 'p1' }), texto('Ok, no lo borro.'), llamada('delete_product', { productId: 'p1' })];
        const llamar = vi.fn(async () => guion.shift());
        const ejecutar = async (ps) => ps.map(p => ({ name: p.tool, resultado: 'CANCELADO por el dueño. No se hizo.' }));
        const dichos = [];
        const r = await correrAgente({ contents: [], llamar, ejecutar, avisar: (t) => dichos.push(t) });
        expect(r.cortado).toBe('cancelado');
        expect(llamar).toHaveBeenCalledTimes(2);
        expect(dichos).toEqual(['Ok, no lo borro.']);
    });

    it('frena si repite la misma llamada', async () => {
        const llamar = async () => llamada('query_sales', { range: '7d' });
        const ejecutar = async (ps) => ps.map(p => ({ name: p.tool, resultado: 'ok' }));
        const dichos = [];
        const r = await correrAgente({ contents: [], llamar, ejecutar, avisar: (t) => dichos.push(t) });
        expect(r.cortado).toBe('repeticion');
        expect(r.pasos).toBe(3);
    });

    it('tiene tope de pasos', async () => {
        let i = 0;
        const llamar = async () => llamada('query_sales', { range: String(i++) });
        const ejecutar = async (ps) => ps.map(p => ({ name: p.tool, resultado: 'ok' }));
        const r = await correrAgente({ contents: [], llamar, ejecutar, avisar: () => {} });
        expect(r.cortado).toBe('limite');
        expect(r.pasos).toBe(MAX_PASOS);
    });

    it('no muestra el texto de "pensamiento"', async () => {
        const llamar = async () => ({ content: { role: 'model', parts: [{ text: 'pienso…', thought: true }, { text: 'Hola' }] } });
        const dichos = [];
        await correrAgente({ contents: [], llamar, ejecutar: async () => [], avisar: (t) => dichos.push(t) });
        expect(dichos).toEqual(['Hola']);
    });
});

describe('historial y opciones', () => {
    it('arranca por el dueño y junta mensajes seguidos', () => {
        const h = historialParaGemini([
            { role: 'ai', text: 'Bienvenida' },
            { role: 'user', text: 'hola' },
            { role: 'user', text: 'otra cosa' },
            { role: 'system', text: 'Confirmado' },
            { role: 'ai', text: 'Dale' },
        ]);
        expect(h.map(x => x.role)).toEqual(['user', 'model']);
        expect(h[0].parts[0].text).toBe('hola\notra cosa');
    });
    it('separa los botones', () => {
        expect(separarOpciones('¿Qué hago?\nOPCIONES: Publicar | Borrador')).toEqual({ texto: '¿Qué hago?', opciones: ['Publicar', 'Borrador'] });
        expect(separarOpciones('Nada').opciones).toBeUndefined();
        expect(separarOpciones('Tenés:\n* **Jean**: 1\n\nOPCIONES: Reponer')).toEqual({ texto: 'Tenés:\n• Jean: 1', opciones: ['Reponer'] });
    });
    it('el sistema nuevo saca la regla del JSON viejo y suma memoria', () => {
        const s = sistemaCompleto({ sistemaViejo: 'A\n- Respondé SIEMPRE y SOLO con un objeto JSON válido\n{"reply":""}\n- "actions" puede estar vacío si solo respondés.\n- B', snapshot: 'SNAP', memoria: [{ texto: 'precios en ARS', fecha: 0 }] });
        expect(s).not.toMatch(/SOLO con un objeto JSON/);
        expect(s).toMatch(/1\. precios en ARS/);
        expect(s).toMatch(/SNAP/);
    });
});

describe('memoria', () => {
    it('anota, no repite y no guarda llaves', () => {
        let r = agregarRecuerdo([], 'Los precios van sin centavos', 1);
        expect(r.lista).toHaveLength(1);
        expect(agregarRecuerdo(r.lista, 'los precios van sin centavos').error).toMatch(/ya lo tenía/);
        expect(agregarRecuerdo(r.lista, 'mi llave es AIzaSyXXXX').error).toMatch(/privado/);
        r = quitarRecuerdo(r.lista, 1);
        expect(r.lista).toHaveLength(0);
        expect(quitarRecuerdo([], 3).error).toBeTruthy();
        expect(memoriaComoTexto([])).toBe('(vacía)');
    });
});

describe('deshacer todo', () => {
    const inv = [
        { id: 'a', name: 'Jean', category: 'JEANS', price: 100, stock: 2 },
        { id: 'b', name: 'Chupín', category: 'JEANS', price: 90, variants: [{ size: '38', stock: 1 }] },
        { id: 'c', name: 'Top', category: 'TOPS', price: 50 },
    ];
    const buscar = (q) => inv.find(p => p.id === q);
    it('guarda los productos que toca un cambio masivo', () => {
        const f = instantanea([{ tool: 'bulk_price', args: { category: 'JEANS', percent: 10, direction: 'up' } }], inv, buscar);
        expect(Object.keys(f).sort()).toEqual(['a', 'b']);
        expect(f.b.variants).toEqual([{ size: '38', stock: 1 }]);
        expect(f.a.__nombre).toBe('Jean');
    });
    it('ignora lo que no se puede volver atrás así', () => {
        expect(instantanea([{ tool: 'record_sale', args: { productId: 'a' } }], inv, buscar)).toEqual({});
    });
    it('copia, no referencia', () => {
        const f = instantanea([{ tool: 'set_stock', args: { productId: 'b', stock: 0 } }], inv, buscar);
        f.b.variants[0].stock = 99;
        expect(inv[1].variants[0].stock).toBe(1);
    });
});

describe('control de fotos', () => {
    it('avisa lo cortado y marca la sugerencia', () => {
        const t = textoDelControl({ cortada: { pies: true }, prenda: 'sweater', color: 'gris' });
        expect(t).toMatch(/pies quedan cortados/);
        expect(t).toMatch(/SUGERENCIA/);
        expect(textoDelControl({ cortada: {} })).toMatch(/está bien/);
    });
});
