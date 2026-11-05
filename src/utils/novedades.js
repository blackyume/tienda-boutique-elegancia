import { getTotalStock } from './variants';
import { tituloDeProducto } from './nombres';

// Qué dice el cartel de novedades. Manda el aviso escrito desde el panel; si no
// hay, las prendas cargadas desde la última visita. A quien entra por primera
// vez se le cuentan las de las últimas dos semanas.
const DIA = 24 * 60 * 60 * 1000;
export const DIAS_DE_NOVEDAD = 14;

export const DESTINOS_DE_AVISO = [
    { valor: '/shop?sort=newest', etiqueta: 'Novedades', boton: 'Ver novedades' },
    { valor: '/shop', etiqueta: 'La tienda', boton: 'Ver la tienda' },
    { valor: '/envios', etiqueta: 'Envíos', boton: 'Ver envíos' },
    { valor: '/faq', etiqueta: 'Preguntas frecuentes', boton: 'Ver más' },
    { valor: '', etiqueta: 'Sin botón', boton: '' },
];

const fechaDe = (p) => {
    const t = new Date(p?.createdAt || 0).getTime();
    return Number.isNaN(t) ? 0 : t;
};

export const prendasNuevas = (inventory, desde) => (inventory || [])
    .filter((p) => p.active !== false && fechaDe(p) > desde && getTotalStock(p) > 0)
    .sort((a, b) => fechaDe(b) - fechaDe(a));

const avisoDeLaTienda = (novedad, cerrado) => {
    const titulo = String(novedad?.titulo || '').trim();
    if (!novedad?.activo || !titulo || !novedad.id || String(novedad.id) === String(cerrado)) return null;
    const destino = DESTINOS_DE_AVISO.find((d) => d.valor === novedad.enlace);
    return {
        tipo: 'tienda',
        clave: String(novedad.id),
        etiqueta: 'Novedades',
        titulo,
        texto: String(novedad.texto || '').trim(),
        enlace: destino?.valor || '',
        boton: destino?.boton || '',
        foto: '',
    };
};

const fotoDe = (p) => (Array.isArray(p?.images) && p.images[0]) || p?.image || '';

const avisoDePrendas = (inventory, vista, ahora) => {
    const nuevas = prendasNuevas(inventory, vista || ahora - DIAS_DE_NOVEDAD * DIA);
    if (nuevas.length === 0) return null;
    const una = nuevas.length === 1;
    return {
        tipo: 'prendas',
        clave: 'prendas',
        etiqueta: una ? 'Recién llegada' : 'Recién llegadas',
        titulo: una ? tituloDeProducto(nuevas[0].name) : `${nuevas.length} prendas nuevas`,
        texto: vista ? 'Desde tu última visita' : 'Ya están en la boutique',
        enlace: una ? `/product/${nuevas[0].id}` : '/shop?sort=newest',
        boton: una ? 'Verla' : 'Ver novedades',
        foto: fotoDe(nuevas[0]),
    };
};

export const avisoDeNovedades = ({ inventory, novedad, vista, cerrado, ahora = Date.now() }) =>
    avisoDeLaTienda(novedad, cerrado) || avisoDePrendas(inventory, vista, ahora);
