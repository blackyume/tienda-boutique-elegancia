// Las acciones de todos los días, entendidas sin IA: cambiar un precio,
// ocultar o mostrar, anotar que llegó mercadería y anotar una venta por fuera.
// Devuelve una acción lista para confirmar (misma forma que las herramientas
// de Lau) o lo que falta para poder hacerla. Todo lo demás sigue a la IA.
import { normalizarTexto } from './importarInventario';
import { buscarProductos, variantesDe } from './lauDirecto';
import { precioEfectivo, gananciaPorFuera } from './comision';

const limpiar = (texto) => normalizarTexto(texto).replace(/[¿?¡!,;:"'“”«»()]+/g, ' ').replace(/\s+/g, ' ').trim();

const VERBO_PRECIO = /\b(precio|ponele|pon[eé]|cobr[aá]\w*|subi(le)?|baja(le)?|cambi\w* el precio|vale|sale|actualiz\w* el precio)\b/;
const VENDI = /\b(vend[ií]|vendimos|vendio|se vendio|vendida|vendidas|vendido|vendidos|compr[oó])\b/;
const LLEGO = /\b(lleg[oó]|llegaron|me llegaron|entr[oó]|entraron|repuse|repon[eé]|sum[aá]le?|agreg[aá]le?|mas unidades|me trajeron|compre)\b/;
const OCULTAR = /\b(ocult[aá]\w*|escond[eé]\w*|sac[aá]\w* de la tienda|despublic\w*|pausa\w*|dar de baja|baj[aá]\w* de la tienda)\b/;
const MOSTRAR = /\b(mostr[aá]\w*|public[aá]\w*|volv[eé]\w* a (mostrar|publicar)|activ[aá]\w*|reactiv\w*|pon[eé]\w* visible|visible)\b/;
const PREGUNTA = /\b(cuant\w*|que|cual\w*|como|hay|\?)\b/;
// "el sweater me costó 20000", "la campera me salió 18.500 más 500 de flete".
const COSTO = /\b(me cost[oó]|cost[oó]|costaron|me sali[oó]|sali[oó]|salieron|pagu[eé]|pague|de costo)\b/;
// Cómo cobró: en efectivo o transferencia no hay comisión de MP.
const PAGO = /\b(en efectivo|efectivo|cash|contado|por transferencia|transferencia|transfer|sin mp|sin mercado ?pago|sin comision)\b/;
const HABLA_DE_FOTO = /\b(foto|fotos|imagen|imagenes)\b/;

const CANALES = [
    ['whatsapp', /\b(whatsapp|wpp|wsp|wathsapp|guasap|wasap)\b/],
    ['instagram', /\b(instagram|insta|ig)\b/],
    ['local', /\b(local|negocio|en persona|en mano|mano)\b/],
];

const RELLENO = new Set([
    'vendi', 'vendimos', 'vendio', 'vendida', 'vendidas', 'vendido', 'vendidos', 'se', 'compro', 'llego', 'llegaron', 'entro', 'entraron', 'repuse', 'repone', 'sumale', 'suma', 'agregale', 'agrega', 'trajeron', 'compre',
    'oculta', 'ocultá', 'ocultalo', 'ocultala', 'esconde', 'escondelo', 'despublica', 'despublicalo', 'pausa', 'pausalo', 'muestra', 'mostra', 'mostralo', 'mostrala', 'publica', 'publicalo', 'publicala', 'activa', 'activalo', 'reactiva', 'visible',
    'precio', 'ponele', 'pone', 'poné', 'cobra', 'cobrale', 'subi', 'subile', 'baja', 'bajale', 'cambia', 'cambiale', 'actualiza', 'vale', 'sale', 'nuevo', 'nueva',
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a', 'en', 'por', 'con', 'y', 'que', 'le', 'lo', 'me', 'te', 'ya', 'hoy', 'ayer', 'recien', 'ahora',
    'unidad', 'unidades', 'u', 'pesos', 'mas', 'otro', 'otra', 'otros', 'otras', 'ese', 'esa', 'este', 'esta', 'producto', 'prenda', 'stock', 'tienda',
    'lau', 'hola', 'che', 'porfa', 'porfas', 'favor', 'gracias', 'total', 'cada', 'c/u', 'talle', 'color', 'canal', 'para', 'clienta', 'cliente',
    'whatsapp', 'wpp', 'wsp', 'instagram', 'insta', 'ig', 'local', 'negocio', 'persona', 'mano', 'efectivo', 'transferencia', 'transfer', 'cash', 'contado', 'sin', 'mp', 'mercado', 'pago', 'mercadopago', 'comision',
    'costo', 'costaron', 'salio', 'salieron', 'pague', 'flete', 'envio', 'embalaje', 'packaging', 'bolsa', 'bolsas', 'empaque', 'descuento', 'desc', 'off', 'menos', 'rebaja', 'lista',
]);

// Números con puntos de miles ("46.500", "46500", "$ 46.500").
const numeros = (t) => [...t.matchAll(/\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)\b/g)].map((m) => ({ n: Number(m[1].replace(/\./g, '')), i: m.index, raw: m[0] }));

const sacar = (t, ...trozos) => trozos.filter(Boolean).reduce((s, x) => s.replace(x, ' '), t).replace(/\s+/g, ' ').trim();

const nombreDe = (t) => t.split(' ').filter((w) => w && !RELLENO.has(w) && !/^\$?\d/.test(w)).join(' ').trim();

const eq = (a, b) => normalizarTexto(a) === normalizarTexto(b);

/** Talle y color dichos explícitamente: "talle 38", "t38", "color azul". */
const talleYColor = (t, producto) => {
    let talle = (t.match(/\btalle (\S+)/) || t.match(/\bt(\d{2})\b/) || [])[1] || '';
    let color = (t.match(/\bcolor (.+?)(?= talle| por| a \$?\d| en | x |$)/) || [])[1] || '';
    let resto = sacar(t, talle && `talle ${talle}`, color && `color ${color}`);
    // Si el producto tiene variantes, también se aceptan sueltos ("38", "azul").
    const vars = producto ? variantesDe(producto) : [];
    if (vars.length) {
        const talles = [...new Set(vars.map((v) => v.size).filter(Boolean))];
        const colores = [...new Set(vars.map((v) => v.color).filter(Boolean))].sort((a, b) => b.length - a.length);
        if (!talle) { const hit = talles.find((s) => new RegExp(`(^| )${normalizarTexto(s)}( |$)`).test(resto)); if (hit) { talle = hit; resto = sacar(resto, new RegExp(`(^| )${normalizarTexto(hit)}( |$)`)); } }
        if (!color) { const hit = colores.find((c) => resto.includes(normalizarTexto(c))); if (hit) { color = hit; resto = sacar(resto, normalizarTexto(hit)); } }
        if (talle) talle = talles.find((s) => eq(s, talle)) || talle;
        if (color) color = colores.find((c) => eq(c, color)) || color;
    }
    return { talle, color, resto: resto.trim() };
};

/** La variante exacta del producto, o las que faltan elegir. */
const variante = (producto, talle, color) => {
    const vars = variantesDe(producto);
    if (!vars.length) return { ok: true };
    const candidatas = vars.filter((v) => (!talle || eq(v.size, talle)) && (!color || eq(v.color, color)));
    if (candidatas.length === 1) return { ok: true, size: candidatas[0].size, color: candidatas[0].color, stock: candidatas[0].stock };
    if (!candidatas.length) return { ok: false, falta: 'variante', opciones: vars, motivo: `No encontré ${[talle && `talle ${talle}`, color].filter(Boolean).join(' ')} en "${producto.name}".` };
    return { ok: false, falta: 'variante', opciones: candidatas };
};

/**
 * Lee un pedido de acción. Devuelve null si no es una de las cuatro cosas que
 * sabe hacer sola, o:
 *  { tipo, accion:{tool,args}, producto, resumen }           listo para confirmar
 *  { tipo, producto, falta:'variante', opciones:[...] }      hay que elegir talle/color
 *  { tipo, productos:[...] }                                  nombre ambiguo (varios)
 *  { tipo, nombre, productos:[] }                             no se encontró
 */
export const interpretarAccion = (texto, inventario = [], { comision = 0 } = {}) => {
    let t = limpiar(texto);
    if (!t || t.length > 160 || HABLA_DE_FOTO.test(t) || /\b(todos|todas|todo el|toda la|masivo|categoria)\b/.test(t)) return null;

    // "con 10% de descuento", "10% off", "10% menos": se saca antes de leer
    // cantidades, para que el 10 no se confunda con "10 unidades".
    const pctM = t.match(/(\d{1,2}(?:[.,]\d+)?)\s*%/);
    const descuento = pctM ? Number(pctM[1].replace(',', '.')) : 0;
    if (pctM) t = sacar(t, pctM[0], /\b(de )?(descuento|desc|off|menos|rebaja)\b/);
    const pagoM = t.match(PAGO);
    const pago = pagoM ? (/transfer/.test(pagoM[0]) ? 'transferencia' : 'efectivo') : '';
    if (pagoM) t = sacar(t, pagoM[0]);

    let tipo = null;
    if (VENDI.test(t) && !PREGUNTA.test(t)) tipo = 'venta';
    else if (COSTO.test(t) && !PREGUNTA.test(t) && !VERBO_PRECIO.test(t) && numeros(t).some((x) => x.n >= 100)) tipo = 'costo';
    else if (OCULTAR.test(t)) tipo = 'ocultar';
    else if (MOSTRAR.test(t) && !/\b(precio|stock)\b/.test(t)) tipo = 'mostrar';
    else if (LLEGO.test(t) && /\d/.test(t)) tipo = 'llegaron';
    else if (VERBO_PRECIO.test(t) && numeros(t).some((x) => x.n >= 500)) tipo = 'precio';
    else if (numeros(t).some((x) => x.n >= 500) && /\b(a|en) \$?\d/.test(t) && !PREGUNTA.test(t)) tipo = 'precio';
    if (!tipo) return null;

    // "más 500 de flete" / "flete 500", "300 de embalaje" / "packaging 300".
    const extra = (re1, re2) => { const m = t.match(re1) || t.match(re2); if (!m) return null; t = sacar(t, m[0]); return Number(m[1].replace(/\./g, '')); };
    const flete = tipo === 'costo' ? extra(/\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:de|del|por|en)?\s*(?:flete|envio|transporte)\b/, /\b(?:flete|envio|transporte)\s*(?:de|del)?\s*\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)\b/) : null;
    const embalaje = tipo === 'costo' ? extra(/\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:de|del|por|en)?\s*(?:embalaje|packaging|bolsas?|empaque)\b/, /\b(?:embalaje|packaging|bolsas?|empaque)\s*(?:de|del)?\s*\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)\b/) : null;
    const costo = tipo === 'costo' ? (numeros(t).filter((x) => x.n >= 100)[0] || {}).n ?? null : null;

    // Números: el precio es el grande (>= 500). La cantidad se lee después,
    // cuando ya se sacó el talle (un "38" puede ser talle, no cantidad).
    const grande = numeros(t).filter((x) => x.n >= 500);
    const precio = grande.length ? grande[grande.length - 1].n : null;
    const canal = (CANALES.find(([, re]) => re.test(t)) || ['otro'])[0];
    // "por 93.000" / "total 93000" es el monto total; "a 46.500" es por unidad.
    const ultimo = grande[grande.length - 1];
    const porTotal = !!ultimo && /\b(por|total|en total)\s*$/.test(t.slice(0, ultimo.i));

    // "#abc123" al final: el botón de desempate cuando dos productos se llaman igual.
    const hash = (t.match(/#([a-z0-9]{4,})\b/) || [])[1];
    const porHash = hash ? inventario.filter((p) => String(p.id).toLowerCase().startsWith(hash)) : [];
    // Nombre del producto: lo que queda sacando verbos, números, canal, talle y color.
    const sinTalle = talleYColor(t.replace(/#[a-z0-9]+\b/g, ' '));
    let nombre = nombreDe(sinTalle.resto.replace(/\bx\b/g, ' '));
    let productos = porHash.length === 1 ? porHash : (nombre ? buscarProductos(inventario, nombre) : []);
    if (!productos.length && nombre) {
        // Quizás el color quedó pegado al nombre ("jean azul"): probar sacando la última palabra.
        const corto = nombre.split(' ').slice(0, -1).join(' ');
        if (corto) { productos = buscarProductos(inventario, corto); if (productos.length) nombre = corto; }
    }
    // Un costo sin producto conocido lo contesta la cotización genérica ("me costó X").
    if (tipo === 'costo' && (!nombre || !productos.length)) return null;
    if (!productos.length) return { tipo, nombre, productos: [] };
    if (productos.length > 1) return { tipo, nombre, productos };
    const producto = productos[0];
    const { talle, color, resto } = talleYColor(t, producto);
    const chicos = numeros(resto).filter((x) => x.n < 500);
    const cantidad = chicos.length ? chicos[0].n : 1;

    if (tipo === 'precio') {
        if (!precio) return null;
        return { tipo, producto, accion: { tool: 'set_price', args: { productId: producto.id, nombre: producto.name, price: precio } }, resumen: `Precio de "${producto.name}": $${precio.toLocaleString('es-AR')} (antes $${Number(producto.price || 0).toLocaleString('es-AR')})` };
    }
    if (tipo === 'costo') {
        if (!(costo > 0)) return null;
        const fields = { cost: costo };
        if (flete != null) fields.shippingCost = flete;
        if (embalaje != null) fields.packagingCost = embalaje;
        const partes = [`costo $${costo.toLocaleString('es-AR')}`, flete != null && `flete $${flete.toLocaleString('es-AR')}`, embalaje != null && `embalaje $${embalaje.toLocaleString('es-AR')}`].filter(Boolean).join(' + ');
        return { tipo, producto, accion: { tool: 'edit_product', args: { productId: producto.id, nombre: producto.name, fields } }, resumen: `Costo de "${producto.name}": ${partes}` };
    }
    if (tipo === 'ocultar' || tipo === 'mostrar') {
        const visible = tipo === 'mostrar';
        return { tipo, producto, accion: { tool: 'toggle_visible', args: { productId: producto.id, nombre: producto.name, visible } }, resumen: `${visible ? 'Mostrar' : 'Ocultar'} "${producto.name}" en la tienda` };
    }
    const v = variante(producto, talle, color);
    if (!v.ok) return { tipo, producto, cantidad, precio, canal, ...v };
    const etiqueta = [v.size && `talle ${v.size}`, v.color].filter(Boolean).join(' · ');
    if (tipo === 'llegaron') {
        return { tipo, producto, accion: { tool: 'adjust_stock', args: { productId: producto.id, nombre: producto.name, delta: cantidad, size: v.size, color: v.color } }, resumen: `Sumar ${cantidad} a "${producto.name}"${etiqueta ? ` (${etiqueta})` : ''}` };
    }
    if (v.stock != null && v.stock < cantidad) return { tipo, producto, sinStock: true, motivo: `De "${producto.name}"${etiqueta ? ` ${etiqueta}` : ''} quedan ${v.stock}, no ${cantidad}. Si la venta fue igual, primero anotá que llegaron: "llegaron ${cantidad - v.stock} ${producto.name}".` };
    const lista = Number(producto.price) || 0;
    const $ = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
    // En efectivo o transferencia sin decir precio: ¿lista o precio efectivo
    // (sin la comisión de MP, misma ganancia)? Se elige con botones.
    if (pago && precio == null && !descuento && lista > 0 && comision > 0) {
        const efectivo = precioEfectivo(lista, comision);
        const base = texto.trim().replace(/\s+/g, ' ');
        return {
            tipo, producto, cantidad, pago, falta: 'precio',
            lista, efectivo, comision,
            opciones: [`${base} a ${lista}`, `${base} a ${efectivo}`],
            motivo: `"${producto.name}" está a ${$(lista)} en la tienda. Como ${pago === 'transferencia' ? 'por transferencia' : 'en efectivo'} no pagás la comisión de MP (${comision}%), podés cobrarlo ${$(efectivo)} y ganás lo mismo que por la web. ¿A cuánto lo vendiste?`,
        };
    }
    const args = { productId: producto.id, nombre: producto.name, quantity: cantidad, size: v.size, color: v.color, channel: canal };
    if (pago) args.payment = pago;
    if (precio != null) { if (porTotal || cantidad === 1) args.amount = precio; else args.unitPrice = precio; }
    if (descuento > 0) {
        // El descuento va sobre lo dicho ("a 40000 con 10%") o sobre el precio de lista.
        const baseUnit = args.unitPrice ?? (args.amount != null ? args.amount / cantidad : lista);
        const final = Math.round(baseUnit * cantidad * (1 - descuento / 100));
        args.listPrice = Math.round(baseUnit); args.discountPct = descuento; args.amount = final; delete args.unitPrice;
    }
    const total = args.amount ?? (args.unitPrice != null ? args.unitPrice * cantidad : lista * cantidad);
    // Lo que te queda: sin comisión porque es por fuera. Aviso si regalás demasiado.
    const g = gananciaPorFuera(producto, total, cantidad);
    let nota = '';
    if (g) {
        if (g.bajoCosto) nota = `⚠️ A ${$(total / cantidad)} por unidad estás por debajo del costo (${$(g.costo)}): perdés ${$(-g.neto)} por prenda.`;
        else nota = `Te quedan ${$(g.total)} limpios (${g.margen}% sobre el costo${comision > 0 && total < lista * cantidad ? `; por la web, a precio de lista, te quedaban ${$(Math.round(lista * (1 - comision / 100) - g.costo) * cantidad)}` : ''}).`;
    }
    return {
        tipo, producto, nota,
        accion: { tool: 'record_sale', args },
        resumen: `Venta por fuera: ${cantidad} × "${producto.name}"${etiqueta ? ` (${etiqueta})` : ''} por ${$(total)}${descuento ? ` (−${descuento}%)` : ''}${canal !== 'otro' ? ` · ${canal}` : ''}${pago ? ` · ${pago}` : ''} — descuenta el stock`,
    };
};

/** Botones para elegir la variante: cada uno repite el pedido con talle y color explícitos. */
export const opcionesDeVariante = (texto, opciones = []) =>
    opciones.slice(0, 8).map((v) => `${texto.trim()} talle ${v.size} color ${v.color}`.replace(/\s+/g, ' '));

/** Botones para elegir el producto cuando el nombre es ambiguo. */
export const opcionesDeProducto = (texto, nombre, productos = []) => {
    // Si dos se llaman igual, cada botón lleva "#id" para distinguirlos.
    const nombres = productos.map((p) => normalizarTexto(p.name));
    const repetidos = new Set(nombres.filter((n, i) => nombres.indexOf(n) !== i));
    const re = new RegExp(nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return productos.slice(0, 6).map((p) => {
        const base = re.test(texto) ? texto.replace(re, `"${p.name}"`) : `${texto} "${p.name}"`;
        return repetidos.has(normalizarTexto(p.name)) ? `${base} #${String(p.id).slice(0, 6)}` : base;
    });
};

/** Para el mensaje: qué es cada uno cuando hay nombres repetidos. */
export const describirRepetidos = (productos = []) => {
    const nombres = productos.map((p) => normalizarTexto(p.name));
    const repetidos = productos.filter((p) => nombres.filter((n) => n === normalizarTexto(p.name)).length > 1);
    if (!repetidos.length) return '';
    return ' Hay nombres repetidos: ' + repetidos.map((p) => `#${String(p.id).slice(0, 6)} es el de $${Number(p.price || 0).toLocaleString('es-AR')}${p.active === false ? ', oculto' : ''}`).join('; ') + '.';
};

/** Cómo deshacer una acción ya hecha (para el botón "Deshacer"). */
export const accionInversa = (accion, producto, resultado) => {
    if (!accion || !producto) return null;
    const A = accion.args || {};
    switch (accion.tool) {
        case 'set_price': return { tool: 'set_price', args: { productId: producto.id, price: Number(producto.price) || 0 }, resumen: `Volver el precio de "${producto.name}" a $${Number(producto.price || 0).toLocaleString('es-AR')}` };
        case 'toggle_visible': return { tool: 'toggle_visible', args: { productId: producto.id, visible: producto.active !== false }, resumen: `${producto.active !== false ? 'Volver a mostrar' : 'Volver a ocultar'} "${producto.name}"` };
        case 'adjust_stock': return { tool: 'adjust_stock', args: { productId: producto.id, delta: -Number(A.delta || 0), size: A.size, color: A.color }, resumen: `Restar de nuevo ${A.delta} a "${producto.name}"` };
        case 'edit_product': {
            const fields = {};
            for (const k of Object.keys(A.fields || {})) fields[k] = producto[k] ?? 0;
            return { tool: 'edit_product', args: { productId: producto.id, nombre: producto.name, fields }, resumen: `Volver el costo de "${producto.name}" a como estaba` };
        }
        case 'record_sale': {
            const id = (String(resultado || '').match(/\b(MAN-\d+|ORD-\w+)\b/) || [])[1];
            return id ? { tool: 'cancel_sale', args: { orderId: id }, resumen: `Anular la venta ${id} y reponer el stock` } : null;
        }
        default: return null;
    }
};
