import { normalizarTexto } from './importarInventario';

// Importar ventas hechas por fuera de la tienda (WhatsApp, local, ferias)
// desde la planilla que el dueño ya arma a mano. Entiende dos formatos:
//
//  A) "Bloques por clienta": cada columna es una clienta. Arriba el nombre,
//     y debajo bloques de 4 líneas por prenda:
//         SHORT SASTRERO CIERRE INVISIBLE
//         TALLE 5
//         CHOCOLATE
//         PRECIO $ 13,501
//     Al final "TOTAL $ 47,403" y "PAGADO". Es el formato de WAKANDA 09-26.
//
//  B) Tabla con cabecera (Cliente, Producto, Talle, Color, Precio, Cantidad…),
//     por si alguna vez lo pasan a filas. Sin columna Cliente no es una
//     planilla de ventas: es la plantilla de productos, que va por otro lado.
//
// Cada clienta se convierte en UN pedido manual (como los que crea Lau con
// "vendí 2 jeans por WhatsApp"), con sus prendas adentro.

// "13,501" y "13.501" son trece mil quinientos uno: en pesos no hay centavos.
export const aPrecio = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const s = String(v ?? '').replace(/[^\d.,-]/g, '').trim();
    if (!s) return null;
    if (/^-?\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ''));
    const n = Number(s.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
};

const texto = (v) => (v instanceof Date ? v.toISOString() : String(v ?? '')).trim();
const esVacia = (v) => texto(v) === '';

const RE_TALLE = /^talle\s*:?\s*(.+)$/i;
const RE_PRECIO = /^precio\b/i;
const RE_TOTAL = /^total\b/i;
const RE_PAGADO = /^(pagad[oa]|pag[oó]|abonad[oa]|cancelad[oa])\b/i;
const RE_PENDIENTE = /^(debe|pendiente|falta|se[ñn]a)\b/i;
const RE_CANTIDAD = /^(cantidad|cant|unidades)\s*:?\s*(\d+)/i;

/** Formato A: una columna = una clienta. Devuelve null si la columna está vacía. */
const leerColumnaClienta = (celdas, col) => {
    let cliente = '';
    const items = [];
    let actual = null;
    let total = null;
    let pagado = null;
    const avisos = [];

    const cerrar = () => {
        if (!actual) return;
        if (actual.name && actual.price != null) items.push(actual);
        else if (actual.name) avisos.push(`"${actual.name}": sin precio, no se importa.`);
        actual = null;
    };

    for (let r = 0; r < celdas.length; r++) {
        const v = texto(celdas[r]?.[col]);
        // Una línea en blanco separa prendas: cierra la que estaba abierta.
        if (!v) { cerrar(); continue; }
        if (!cliente) { cliente = v; continue; }

        if (RE_TOTAL.test(v)) { cerrar(); total = aPrecio(v.replace(RE_TOTAL, '')); continue; }
        if (RE_PAGADO.test(v)) { cerrar(); pagado = true; continue; }
        if (RE_PENDIENTE.test(v)) { cerrar(); pagado = false; continue; }

        const mTalle = v.match(RE_TALLE);
        if (mTalle && actual) { actual.size = mTalle[1].trim(); continue; }
        const mCant = v.match(RE_CANTIDAD);
        if (mCant && actual) { actual.quantity = Math.max(1, parseInt(mCant[2], 10)); continue; }
        if (RE_PRECIO.test(v)) {
            if (!actual) { avisos.push(`Un precio sin prenda arriba (${v}).`); continue; }
            actual.price = aPrecio(v.replace(RE_PRECIO, ''));
            cerrar();
            continue;
        }
        // Texto suelto: si no hay prenda abierta, es el nombre; si ya hay
        // nombre, es el color (o una segunda línea del color).
        if (!actual) actual = { name: v, size: '', color: '', price: null, quantity: 1 };
        else actual.color = actual.color ? `${actual.color} ${v}` : v;
    }
    cerrar();

    if (!cliente && !items.length) return null;
    const suma = items.reduce((a, i) => a + i.price * (i.quantity || 1), 0);
    if (total != null && Math.abs(total - suma) > 1) {
        avisos.push(`${cliente}: la planilla dice total $${total.toLocaleString('es-AR')} y las prendas suman $${suma.toLocaleString('es-AR')}. Se usa la suma de las prendas.`);
    }
    return { cliente, items, total: suma, pagado: pagado ?? true, avisos };
};

const ALIAS_COL = {
    cliente: ['cliente', 'clienta', 'nombre', 'comprador', 'compradora'],
    name: ['producto', 'prenda', 'articulo', 'artículo', 'item', 'descripcion', 'descripción'],
    size: ['talle', 'talla', 'size'],
    color: ['color', 'colores'],
    price: ['precio', 'precio venta', 'precio unitario', 'importe', 'valor'],
    quantity: ['cantidad', 'cant', 'unidades', 'qty'],
    pagado: ['pagado', 'estado', 'pago'],
    fecha: ['fecha', 'dia', 'día'],
};

/** Formato B: la primera fila tiene cabeceras conocidas. */
const detectarCabecera = (fila) => {
    const mapa = {};
    fila.forEach((c, i) => {
        const n = normalizarTexto(c);
        if (!n) return;
        for (const [campo, alias] of Object.entries(ALIAS_COL)) if (alias.includes(n) && mapa[campo] == null) mapa[campo] = i;
    });
    return mapa.name != null && mapa.price != null && mapa.cliente != null ? mapa : null;
};

const leerTabla = (celdas, mapa) => {
    const porCliente = new Map();
    for (let r = 1; r < celdas.length; r++) {
        const f = celdas[r] || [];
        const name = texto(f[mapa.name]);
        if (!name) continue;
        const cliente = mapa.cliente != null ? texto(f[mapa.cliente]) : '';
        const clave = cliente || `fila-${r}`;
        if (!porCliente.has(clave)) porCliente.set(clave, { cliente: cliente || 'Venta externa', items: [], total: 0, pagado: true, avisos: [], fecha: mapa.fecha != null ? f[mapa.fecha] : null });
        const v = porCliente.get(clave);
        const price = aPrecio(f[mapa.price]);
        if (price == null) { v.avisos.push(`"${name}": sin precio, no se importa.`); continue; }
        const quantity = mapa.quantity != null ? Math.max(1, parseInt(f[mapa.quantity], 10) || 1) : 1;
        v.items.push({ name, size: mapa.size != null ? texto(f[mapa.size]) : '', color: mapa.color != null ? texto(f[mapa.color]) : '', price, quantity });
        v.total += price * quantity;
        if (mapa.pagado != null) {
            const p = texto(f[mapa.pagado]);
            if (RE_PENDIENTE.test(p) || /^no\b/i.test(p)) v.pagado = false;
        }
    }
    return [...porCliente.values()];
};

/**
 * Lee la grilla (array de filas, cada fila array de celdas) y devuelve las
 * ventas encontradas: [{cliente, items:[{name,size,color,price,quantity}], total, pagado, avisos}].
 */
export const leerVentasDeCeldas = (celdas = []) => {
    const grilla = celdas.map(f => Array.isArray(f) ? f : []);
    if (!grilla.some(f => f.some(c => !esVacia(c)))) return { ventas: [], avisos: ['La planilla está vacía.'] };

    const mapa = detectarCabecera(grilla[0] || []);
    if (mapa) {
        const ventas = leerTabla(grilla, mapa);
        return { ventas, avisos: ventas.flatMap(v => v.avisos) };
    }

    const ancho = Math.max(...grilla.map(f => f.length));
    const ventas = [];
    for (let c = 0; c < ancho; c++) {
        const v = leerColumnaClienta(grilla, c);
        if (v && (v.items.length || v.cliente)) ventas.push(v);
    }
    const conItems = ventas.filter(v => v.items.length);
    const avisos = ventas.flatMap(v => v.avisos);
    for (const v of ventas) if (!v.items.length) avisos.push(`La columna de "${v.cliente}" no tiene prendas con precio.`);
    return { ventas: conItems, avisos };
};

/** "WAKANDA 09-26.xlsx" → 2026-09-01; si no hay mes/año en el nombre, hoy. */
export const fechaDesdeNombre = (nombre = '', hoy = new Date()) => {
    const m = String(nombre).match(/(\d{1,2})[-/.](\d{2,4})/);
    if (m) {
        const mes = parseInt(m[1], 10);
        let anio = parseInt(m[2], 10);
        if (anio < 100) anio += 2000;
        if (mes >= 1 && mes <= 12) return `${anio}-${String(mes).padStart(2, '0')}-01`;
    }
    return hoy.toISOString().slice(0, 10);
};

/** Nota para el pedido: el nombre del archivo sin extensión ("WAKANDA 09-26"). */
export const notaDesdeNombre = (nombre = '') => String(nombre).replace(/\.[^.]+$/, '').trim();

/**
 * Clave estable de una venta para no importarla dos veces si vuelven a
 * soltar la misma planilla.
 */
export const claveDeVenta = (venta, fecha) => {
    const items = venta.items.map(i => `${normalizarTexto(i.name)}|${normalizarTexto(i.size)}|${normalizarTexto(i.color)}|${i.price}|${i.quantity || 1}`).sort().join(';');
    return `${normalizarTexto(venta.cliente)}@${fecha}#${items}`;
};

/**
 * Cruza las ventas con el inventario (por nombre) y con los pedidos que ya
 * existen (por clave), y arma los pedidos manuales listos para guardar.
 */
export const planearVentas = (ventas, { inventario = [], pedidos = [], fecha, canal = 'Venta externa', nota = '', descontarStock = false } = {}) => {
    const fechaIso = fecha || new Date().toISOString().slice(0, 10);
    const yaImportadas = new Set(pedidos.map(p => p.importKey).filter(Boolean));
    const porNombre = new Map(inventario.map(p => [normalizarTexto(p.name), p]));
    const base = Date.now();

    const nuevos = [];
    const repetidas = [];
    ventas.forEach((v, n) => {
        const importKey = claveDeVenta(v, fechaIso);
        const items = v.items.map(i => {
            const p = porNombre.get(normalizarTexto(i.name));
            return {
                id: p ? p.id : null,
                name: p ? p.name : i.name,
                price: Math.round(i.price),
                quantity: i.quantity || 1,
                size: i.size || '',
                color: i.color || '',
                category: p?.category || '',
                image: p?.image || p?.media?.[0]?.url || '',
                cost: Number(p?.cost) || 0,
                enInventario: !!p,
            };
        });
        const pedido = {
            id: `MAN-${String(base + n).slice(-6)}`,
            date: new Date(`${fechaIso}T12:00:00`).toISOString(),
            status: v.pagado ? 'approved' : 'pending',
            total: Math.round(items.reduce((a, i) => a + i.price * i.quantity, 0)),
            manual: true,
            channel: canal,
            paymentMethod: canal,
            stockApplied: descontarStock,
            importKey,
            note: nota,
            customer: { nombre: nombrePropio(v.cliente) || 'Venta externa', email: '' },
            items,
        };
        (yaImportadas.has(importKey) ? repetidas : nuevos).push(pedido);
    });

    return {
        nuevos,
        repetidas,
        totalNuevos: nuevos.reduce((a, p) => a + p.total, 0),
        prendas: nuevos.reduce((a, p) => a + p.items.reduce((b, i) => b + i.quantity, 0), 0),
        enInventario: nuevos.flatMap(p => p.items).filter(i => i.enInventario).length,
    };
};

/** La grilla de la primera hoja de un .xlsx, como array de arrays. */
export const celdasDesdeExcel = async (buffer) => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.worksheets[0];
    if (!ws) return [];
    const celdas = [];
    ws.eachRow({ includeEmpty: true }, (row, nro) => {
        const fila = [];
        row.eachCell({ includeEmpty: true }, (celda, col) => {
            const v = celda.value;
            let t = '';
            if (v === null || v === undefined) t = '';
            else if (v instanceof Date) t = v;
            else if (typeof v === 'object') t = Array.isArray(v.richText) ? v.richText.map(x => x.text).join('') : (v.result ?? v.text ?? '');
            else t = v;
            fila[col - 1] = t;
        });
        celdas[nro - 1] = fila;
    });
    for (let i = 0; i < celdas.length; i++) if (!celdas[i]) celdas[i] = [];
    return celdas;
};

/**
 * Lo que el dueño escribe junto a la planilla cuando se la manda a Lau:
 * "fecha 5/9/2026, por instagram" → {fecha:'2026-09-05', canal:'Instagram'}.
 * Lo que no diga sale del nombre del archivo (fecha) o es WhatsApp (canal).
 */
export const interpretarMensajeDePlanilla = (texto = '', nombreArchivo = '', hoy = new Date()) => {
    const s = String(texto || '');
    let fecha = null;
    const m = s.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/);
    if (m) {
        const d = parseInt(m[1], 10), mes = parseInt(m[2], 10);
        let anio = m[3] ? parseInt(m[3], 10) : hoy.getFullYear();
        if (anio < 100) anio += 2000;
        if (d >= 1 && d <= 31 && mes >= 1 && mes <= 12) fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (!fecha) fecha = fechaDesdeNombre(nombreArchivo, hoy);
    const canales = [['instagram', 'Instagram'], ['feria', 'Feria'], ['local', 'Local'], ['whatsapp', 'WhatsApp'], ['wasap', 'WhatsApp'], ['wsp', 'WhatsApp']];
    const bajo = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const canal = (canales.find(([k]) => bajo.includes(k)) || [null, 'WhatsApp'])[1];
    const descontarStock = /descont|resta|baj[aá] (el )?stock/.test(bajo);
    return { fecha, canal, descontarStock };
};

/** "LORENA CAMPO" → "Lorena Campo". Las planillas suelen venir en mayúsculas. */
export const nombrePropio = (s = '') => String(s).trim().split(/\s+/).filter(Boolean)
    .map(w => w.length <= 2 && !/^[a-záéíóúñ]/i.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

// Palabras que cortan un nombre dentro del mensaje ("Ana Mena en el local" →
// el nombre termina antes de "en").
const CORTA_NOMBRE = new Set(['y', 'e', 'en', 'el', 'la', 'por', 'para', 'con', 'del', 'de', 'fecha', 'canal', 'local', 'whatsapp', 'wasap', 'wsp', 'instagram', 'feria', 'descont', 'descontá', 'desconta', 'stock', 'hoy', 'ayer', 'es', 'se', 'llama', 'ponele', 'nombre', 'clienta', 'clientas', 'cliente', 'clientes', 'son', 'las', 'los', 'a', 'que', 'ke', 'q', 'porfa', 'porfas', 'favor']);

/**
 * El dueño puede corregir los nombres de las clientas en el mismo mensaje en
 * que manda la planilla: "Ana Mena y Lorena Vivas". Se emparejan por el
 * primer nombre (la planilla dice "ANA CAMPO", el mensaje "Ana Mena" → queda
 * "Ana Mena"). Devuelve las ventas con los nombres nuevos y la lista de cambios.
 */
export const renombrarClientas = (ventas = [], texto = '') => {
    const crudas = String(texto || '').replace(/[¿?¡!.,;:"'()]+/g, ' ').split(/\s+/).filter(Boolean);
    const palabras = crudas.map(normalizarTexto);
    const cambios = [];
    const nuevas = ventas.map(v => {
        const primero = normalizarTexto(v.cliente).split(' ')[0];
        if (!primero || primero.length < 2) return v;
        const i = palabras.indexOf(primero);
        if (i < 0) return v;
        const tomadas = [crudas[i]];
        for (let j = i + 1; j < palabras.length && tomadas.length < 4; j += 1) {
            if (CORTA_NOMBRE.has(palabras[j]) || /\d/.test(palabras[j])) break;
            tomadas.push(crudas[j]);
        }
        if (tomadas.length < 2) return v; // solo el primer nombre: no hay nada nuevo
        const nuevo = nombrePropio(tomadas.join(' '));
        if (normalizarTexto(nuevo) === normalizarTexto(v.cliente)) return v;
        cambios.push({ de: nombrePropio(v.cliente), a: nuevo });
        return { ...v, cliente: nuevo };
    });
    return { ventas: nuevas, cambios };
};

/** Resumen en texto de un plan, para que Lau lo muestre antes de confirmar. */
export const resumirPlanDeVentas = (plan, { fecha, canal, avisos = [] } = {}) => {
    const $ = (n) => `$${Number(n).toLocaleString('es-AR')}`;
    const f = fecha ? fecha.split('-').reverse().join('/') : '';
    const lineas = [];
    if (plan.nuevos.length) {
        lineas.push(`Leí la planilla: ${plan.nuevos.length} ${plan.nuevos.length === 1 ? 'clienta' : 'clientas'}, ${plan.prendas} ${plan.prendas === 1 ? 'prenda' : 'prendas'}, ${$(plan.totalNuevos)} en total.`);
        for (const p of plan.nuevos) {
            lineas.push(`• ${p.customer.nombre} — ${$(p.total)}${p.status === 'approved' ? '' : ' (pendiente de pago)'}`);
            for (const i of p.items) lineas.push(`   ${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}${[i.size && `talle ${i.size}`, i.color].filter(Boolean).length ? ` · ${[i.size && `talle ${i.size}`, i.color].filter(Boolean).join(' · ')}` : ''} — ${$(i.price * i.quantity)}${i.enInventario ? ' ✓ en inventario' : ''}`);
        }
        lineas.push(`Fecha ${f} · canal ${canal}. Si querés otra fecha, otro canal o corregir un nombre, escribilo junto con el archivo: "fecha 5/9, en el local, Ana Mena y Lorena Vivas".`);
    }
    if (plan.repetidas.length) lineas.push(`Ya estaban registradas con esta fecha: ${plan.repetidas.map(p => p.customer.nombre).join(', ')}. No las repito.`);
    for (const a of avisos) lineas.push(`⚠️ ${a}`);
    if (!plan.nuevos.length && !plan.repetidas.length) lineas.push('No encontré ventas en esa planilla. Si es una lista de productos para cargar, va por Inventario → Importar Excel.');
    return lineas.join('\n');
};
