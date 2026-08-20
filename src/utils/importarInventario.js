// Lee un Excel/CSV de inventario y lo convierte en un plan de importación.
//
// La planilla que sale de "Exportar Excel" entra tal cual: se reconocen sus
// encabezados (Producto, Categoría, Precio venta, Costo, Stock, Talles,
// Colores, Estado) y también los nombres sueltos que suele escribir la gente.
//
// Nada se escribe acá. `planearImportacion` sólo devuelve qué se daría de alta,
// qué cambiaría y qué está mal, para poder mostrarlo antes de tocar la base.

import { hasVariantMap, getTotalStock } from './variants';

export const normalizarTexto = (v) =>
    String(v ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

const ALIAS = {
    producto: 'nombre',
    nombre: 'nombre',
    'nombre del producto': 'nombre',
    prenda: 'nombre',
    articulo: 'nombre',
    categoria: 'categoria',
    rubro: 'categoria',
    precio: 'precio',
    'precio venta': 'precio',
    'precio de venta': 'precio',
    'precio final': 'precio',
    costo: 'costo',
    'precio costo': 'costo',
    'costo unitario': 'costo',
    stock: 'stock',
    cantidad: 'stock',
    unidades: 'stock',
    talles: 'talles',
    talle: 'talles',
    tallas: 'talles',
    talla: 'talles',
    colores: 'colores',
    color: 'colores',
    estado: 'estado',
    activo: 'estado',
    publicado: 'estado',
    descripcion: 'descripcion',
    detalle: 'descripcion',
};

// Columnas calculadas del export: se ignoran, no son datos de origen.
const IGNORADAS = new Set(['foto', 'imagen', 'ganancia x unidad', 'ganancia', 'valor en stock', 'valor']);

// "$ 12.500,50" -> 12500.5 · "12.500" -> 12500 · "12,5" -> 12.5
export const aNumero = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    let s = String(v ?? '').replace(/[^\d.,-]/g, '').trim();
    if (!s) return null;
    const tienePunto = s.includes('.');
    const tieneComa = s.includes(',');
    if (tienePunto && tieneComa) {
        s = s.replace(/\./g, '').replace(',', '.');
    } else if (tieneComa) {
        s = s.replace(',', '.');
    } else if (tienePunto) {
        // Un punto seguido de exactamente 3 dígitos es separador de miles.
        s = /^-?\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '') : s;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
};

export const aLista = (v) => {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    return String(v ?? '')
        .split(/[,/|]+/)
        .map((x) => x.trim())
        .filter(Boolean);
};

const PUBLICADO = new Set(['publicado', 'activo', 'si', 'true', '1', 'x', 'visible']);
const BORRADOR = new Set(['borrador', 'inactivo', 'no', 'false', '0', 'oculto', 'pausado']);

export const aEstado = (v) => {
    const t = normalizarTexto(v);
    if (!t) return undefined;
    if (PUBLICADO.has(t)) return true;
    if (BORRADOR.has(t)) return false;
    return undefined;
};

// Renombra las claves de una fila cruda a las llaves internas.
export const normalizarFila = (fila) => {
    const salida = {};
    Object.entries(fila || {}).forEach(([clave, valor]) => {
        const k = normalizarTexto(clave);
        if (!k || IGNORADAS.has(k)) return;
        const destino = ALIAS[k];
        if (destino && salida[destino] === undefined) salida[destino] = valor;
    });
    return salida;
};

const mismaLista = (a, b) =>
    normalizarTexto((a || []).join('|')) === normalizarTexto((b || []).join('|'));

export const planearImportacion = (filas, inventario = []) => {
    const altas = [];
    const cambios = [];
    const errores = [];
    let sinCambios = 0;

    // Un mismo nombre repetido en el inventario no se puede resolver solo.
    const porNombre = new Map();
    const ambiguos = new Set();
    (inventario || []).forEach((p) => {
        const k = normalizarTexto(p?.name);
        if (!k) return;
        if (porNombre.has(k)) ambiguos.add(k);
        else porNombre.set(k, p);
    });

    const vistosEnArchivo = new Set();

    (filas || []).forEach((cruda, i) => {
        const nro = i + 2; // fila 1 = encabezado
        const f = normalizarFila(cruda);
        const nombre = String(f.nombre ?? '').trim();
        const clave = normalizarTexto(nombre);

        if (!clave) {
            const vacia = Object.values(f).every((v) => String(v ?? '').trim() === '');
            if (!vacia) errores.push({ fila: nro, nombre: '', motivo: 'La fila no tiene nombre de producto' });
            return;
        }
        if (vistosEnArchivo.has(clave)) {
            errores.push({ fila: nro, nombre, motivo: 'El nombre está repetido en el archivo' });
            return;
        }
        vistosEnArchivo.add(clave);

        if (ambiguos.has(clave)) {
            errores.push({ fila: nro, nombre, motivo: 'Hay más de un producto con ese nombre en la tienda' });
            return;
        }

        const precio = aNumero(f.precio);
        const costo = aNumero(f.costo);
        const stock = aNumero(f.stock);
        const talles = f.talles === undefined ? undefined : aLista(f.talles);
        const colores = f.colores === undefined ? undefined : aLista(f.colores);
        const estado = aEstado(f.estado);
        const categoria = f.categoria === undefined ? undefined : String(f.categoria).trim();
        const descripcion = f.descripcion === undefined ? undefined : String(f.descripcion).trim();

        if (precio !== null && precio < 0) {
            errores.push({ fila: nro, nombre, motivo: 'El precio es negativo' });
            return;
        }
        if (stock !== null && (stock < 0 || !Number.isInteger(stock))) {
            errores.push({ fila: nro, nombre, motivo: 'El stock tiene que ser un número entero de 0 para arriba' });
            return;
        }

        const existente = porNombre.get(clave);

        if (!existente) {
            if (precio === null || precio <= 0) {
                errores.push({ fila: nro, nombre, motivo: 'Producto nuevo sin precio: no se puede crear' });
                return;
            }
            const avisos = ['Sin foto: entra como borrador y hay que subirle la imagen'];
            if (estado === true) avisos.push('La planilla lo marca Publicado, pero sin foto no se publica');
            altas.push({
                fila: nro,
                nombre,
                avisos,
                datos: {
                    name: nombre,
                    category: categoria || '',
                    price: precio,
                    ...(costo !== null ? { cost: costo } : {}),
                    stock: stock === null ? 0 : stock,
                    sizes: talles && talles.length ? talles : ['S', 'M'],
                    colors: colores || [],
                    description: descripcion || '',
                    image: '',
                    media: [],
                    active: false,
                },
            });
            return;
        }

        const campos = {};
        const detalle = [];
        const avisos = [];
        const anotar = (campo, etiqueta, de, a) => {
            campos[campo] = a;
            detalle.push({ campo: etiqueta, de, a });
        };

        if (precio !== null && precio > 0 && precio !== Number(existente.price)) {
            anotar('price', 'Precio', Number(existente.price) || 0, precio);
        }
        if (costo !== null && costo !== Number(existente.cost ?? NaN)) {
            anotar('cost', 'Costo', existente.cost ?? null, costo);
        }
        if (categoria && categoria !== (existente.category || '')) {
            anotar('category', 'Categoría', existente.category || '—', categoria);
        }
        if (descripcion && descripcion !== (existente.description || '')) {
            anotar('description', 'Descripción', existente.description || '—', descripcion);
        }
        if (talles && talles.length && !mismaLista(talles, existente.sizes)) {
            anotar('sizes', 'Talles', (existente.sizes || []).join(', ') || '—', talles.join(', '));
        }
        if (colores && colores.length && !mismaLista(colores, existente.colors)) {
            anotar('colors', 'Colores', (existente.colors || []).join(', ') || '—', colores.join(', '));
        }
        if (estado !== undefined && estado !== (existente.active !== false)) {
            if (estado === true && !existente.image) {
                avisos.push('No se publica: el producto no tiene foto');
            } else {
                anotar('active', 'Estado', existente.active === false ? 'Borrador' : 'Publicado', estado ? 'Publicado' : 'Borrador');
            }
        }
        if (stock !== null) {
            if (hasVariantMap(existente)) {
                avisos.push(`Stock no tocado: se maneja por talle y color (hoy ${getTotalStock(existente)})`);
            } else if (stock !== (Number(existente.stock) || 0)) {
                anotar('stock', 'Stock', Number(existente.stock) || 0, stock);
            }
        }

        if (!detalle.length) {
            sinCambios += 1;
            return;
        }
        cambios.push({ fila: nro, id: existente.id, nombre, campos, detalle, avisos });
    });

    return { altas, cambios, errores, sinCambios };
};

// ---------------------------------------------------------------------------
// Lectura del archivo. Vive acá y no en el modal para poder probarla sin
// navegador: es la parte que más se rompe (encabezados, celdas con fórmula).

const leerCelda = (v) => {
    if (v === null || v === undefined) return '';
    if (v instanceof Date) return v;
    if (typeof v === 'object') {
        if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join('');
        if (v.result !== undefined) return v.result;
        if (v.text !== undefined) return v.text;
        return '';
    }
    return v;
};

const partirCsv = (linea) => {
    const celdas = [];
    let actual = '';
    let entreComillas = false;
    for (let i = 0; i < linea.length; i += 1) {
        const c = linea[i];
        if (c === '"') {
            if (entreComillas && linea[i + 1] === '"') { actual += '"'; i += 1; }
            else entreComillas = !entreComillas;
        } else if ((c === ',' || c === ';') && !entreComillas) {
            celdas.push(actual); actual = '';
        } else actual += c;
    }
    celdas.push(actual);
    return celdas.map((x) => x.trim());
};

export const filasDesdeCsv = (texto) => {
    const lineas = String(texto || '').split(/\r?\n/).filter((l) => l.trim() !== '');
    if (!lineas.length) return [];
    const cabecera = partirCsv(lineas[0]);
    return lineas.slice(1).map((l) => {
        const celdas = partirCsv(l);
        const fila = {};
        cabecera.forEach((h, i) => { if (h) fila[h] = celdas[i] ?? ''; });
        return fila;
    });
};

// La fila TOTAL del export no es un producto.
const esFilaTotal = (fila) =>
    normalizarTexto(fila.Producto ?? fila.producto ?? '') === 'total';

export const filasDesdeHoja = (ws) => {
    if (!ws) return [];
    const cabecera = [];
    ws.getRow(1).eachCell({ includeEmpty: true }, (celda, col) => {
        cabecera[col] = String(leerCelda(celda.value) ?? '').trim();
    });
    const filas = [];
    ws.eachRow({ includeEmpty: false }, (row, nro) => {
        if (nro === 1) return;
        const fila = {};
        let algo = false;
        row.eachCell({ includeEmpty: true }, (celda, col) => {
            const h = cabecera[col];
            if (!h) return;
            const v = leerCelda(celda.value);
            fila[h] = v;
            if (String(v ?? '').trim() !== '') algo = true;
        });
        if (algo && !esFilaTotal(fila)) filas.push(fila);
    });
    return filas;
};

// exceljs pesa ~900 kB: se carga recién cuando el dueño elige un archivo.
export const filasDesdeExcel = async (buffer) => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    return filasDesdeHoja(wb.worksheets[0]);
};
