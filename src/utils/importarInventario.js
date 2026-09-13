// Lee un Excel/CSV de inventario y lo convierte en un plan de importación.
//
// La planilla que sale de "Exportar Excel" entra tal cual: se reconocen sus
// encabezados (Producto, Categoría, Precio venta, Costo, Stock, Talles,
// Colores, Estado) y también los nombres sueltos que suele escribir la gente.
//
// Las fotos van APARTE del Excel, en una carpeta, y se emparejan por nombre de
// archivo: o por la columna "Foto" (jean-oxford.jpg, o varias separadas por
// coma), o si no está, por el nombre del producto. Un Excel no lleva imágenes
// adentro de forma que sirva; así lo hacen todas las plataformas.
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
    foto: 'fotos',
    fotos: 'fotos',
    imagen: 'fotos',
    imagenes: 'fotos',
    archivo: 'fotos',
};

// Columnas calculadas del export: se ignoran, no son datos de origen.
const IGNORADAS = new Set(['ganancia x unidad', 'ganancia', 'valor en stock', 'valor']);

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

// ---------------------------------------------------------------------------
// Fotos. `archivos` es la lista de archivos que el dueño soltó junto al Excel
// (objetos File, o nombres sueltos en los tests). Se agrupan por nombre base:
// "jean-oxford-1.jpg" y "jean_oxford 2.JPG" son las dos fotos de "jean oxford".

const EXT_IMAGEN = /\.(jpe?g|png|webp|avif|gif)$/i;
const SUFIJO_NUMERO = /[\s_-]*\(?(\d{1,2})\)?$/;

export const claveDeArchivo = (nombre) => {
    const sinExt = String(nombre ?? '').replace(/\.[a-z0-9]{2,5}$/i, '');
    const plano = normalizarTexto(sinExt.replace(/[_-]+/g, ' '));
    const m = plano.match(SUFIJO_NUMERO);
    const orden = m ? Number(m[1]) : 0;
    const base = m ? plano.slice(0, m.index).trim() : plano;
    return { base: base || plano, orden };
};

const nombreDe = (a) => (typeof a === 'string' ? a : a?.name ?? '');

export const agruparFotos = (archivos) => {
    const grupos = new Map();
    (archivos || []).forEach((a) => {
        const nombre = nombreDe(a);
        if (!EXT_IMAGEN.test(nombre)) return;
        const { base, orden } = claveDeArchivo(nombre);
        if (!grupos.has(base)) grupos.set(base, []);
        grupos.get(base).push({ archivo: a, nombre, orden });
    });
    grupos.forEach((lista) => lista.sort((x, y) => x.orden - y.orden || x.nombre.localeCompare(y.nombre)));
    return grupos;
};

// Resuelve las fotos de UNA fila: { fotos: [File|url], faltan: [nombre pedido] }.
export const fotosDeFila = (f, nombreProducto, grupos) => {
    // No va por aLista: esa parte por "/" y rompería una URL.
    const pedidas = f.fotos === undefined ? [] : String(f.fotos).split(/[,;|]+/).map((x) => x.trim()).filter(Boolean);
    if (!pedidas.length) {
        const propias = grupos.get(claveDeArchivo(nombreProducto).base) || [];
        return { fotos: propias.map((x) => x.archivo), faltan: [] };
    }
    const porNombre = new Map();
    grupos.forEach((lista) => lista.forEach((x) => porNombre.set(normalizarTexto(x.nombre), x.archivo)));
    const fotos = [];
    const faltan = [];
    pedidas.forEach((pedida) => {
        if (/^https?:\/\//i.test(pedida)) { fotos.push(pedida); return; }
        const exacta = porNombre.get(normalizarTexto(pedida));
        if (exacta) { fotos.push(exacta); return; }
        // Sin extensión ("jean-oxford") trae el grupo entero, en orden.
        const grupo = grupos.get(claveDeArchivo(pedida).base);
        if (grupo && grupo.length) { grupo.forEach((x) => fotos.push(x.archivo)); return; }
        faltan.push(pedida);
    });
    return { fotos: [...new Set(fotos)], faltan };
};

const mismaLista = (a, b) =>
    normalizarTexto((a || []).join('|')) === normalizarTexto((b || []).join('|'));

// `cotizar(costo, categoria)` → { precio } | null: si la planilla trae costo y
// no precio, el precio se calcula con lo configurado (Configuración → Precios).
export const planearImportacion = (filas, inventario = [], archivosFotos = [], { cotizar } = {}) => {
    const grupos = agruparFotos(archivosFotos);
    const usados = new Set();
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
        const { fotos, faltan } = fotosDeFila(f, nombre, grupos);
        fotos.forEach((x) => usados.add(nombreDe(x)));

        if (!existente) {
            const avisos = faltan.map((x) => `No encontré la foto "${x}" entre los archivos`);
            let precioFinal = precio;
            if ((precioFinal === null || precioFinal <= 0) && costo !== null && costo > 0 && typeof cotizar === 'function') {
                const r = cotizar(costo, categoria);
                if (r?.precio > 0) {
                    precioFinal = r.precio;
                    avisos.push(`Precio calculado desde el costo ($${costo.toLocaleString('es-AR')}): $${r.precio.toLocaleString('es-AR')}`);
                }
            }
            if (precioFinal === null || precioFinal <= 0) {
                errores.push({ fila: nro, nombre, motivo: 'Producto nuevo sin precio ni costo: no se puede crear' });
                return;
            }
            // Con foto se publica salvo que la planilla diga Borrador. Sin foto
            // no hay forma de publicarlo: entra como borrador.
            const publicar = fotos.length > 0 && estado !== false;
            if (!fotos.length) {
                avisos.push('Sin foto: entra como borrador y hay que subirle la imagen');
                if (estado === true) avisos.push('La planilla lo marca Publicado, pero sin foto no se publica');
            }
            altas.push({
                fila: nro,
                nombre,
                avisos,
                fotos,
                datos: {
                    name: nombre,
                    category: categoria || '',
                    price: precioFinal,
                    ...(costo !== null ? { cost: costo } : {}),
                    stock: stock === null ? 0 : stock,
                    sizes: talles && talles.length ? talles : ['S', 'M'],
                    colors: colores || [],
                    description: descripcion || '',
                    image: '',
                    media: [],
                    active: publicar,
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
        // A un producto que ya tiene foto no se le pisa: reemplazar fotos por
        // accidente es peor que no tocarlas.
        let fotosNuevas = [];
        if (fotos.length) {
            if (existente.image) {
                avisos.push(`Ya tiene foto: las ${fotos.length} del archivo no se tocan (borrásela al producto si querés reemplazarla)`);
            } else {
                fotosNuevas = fotos;
                detalle.push({ campo: 'Foto', de: '—', a: `${fotos.length} foto${fotos.length === 1 ? '' : 's'}` });
                if (estado !== false && existente.active === false) {
                    campos.active = true;
                    detalle.push({ campo: 'Estado', de: 'Borrador', a: 'Publicado' });
                }
            }
        }
        faltan.forEach((x) => avisos.push(`No encontré la foto "${x}" entre los archivos`));

        if (estado !== undefined && estado !== (existente.active !== false) && campos.active === undefined) {
            if (estado === true && !existente.image && !fotosNuevas.length) {
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
        cambios.push({ fila: nro, id: existente.id, nombre, campos, detalle, avisos, fotos: fotosNuevas });
    });

    // Fotos que no matchearon con ninguna fila: casi siempre un nombre mal escrito.
    const fotosSueltas = [];
    grupos.forEach((lista) => lista.forEach((x) => { if (!usados.has(x.nombre)) fotosSueltas.push(x.nombre); }));
    fotosSueltas.sort();

    return { altas, cambios, errores, sinCambios, fotosSueltas };
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
