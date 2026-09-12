// Datos de la clienta en el checkout: qué se pide, cómo se valida y cómo se
// arma la dirección para el Correo. Lógica pura, sin React, testeada.

export const PROVINCIAS = Object.freeze([
    'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
    'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]);

/** Los métodos de envío que entregan en la puerta piden calle y altura; los
 *  de retiro en sucursal sólo necesitan saber a qué ciudad va el paquete. */
export const esRetiroEnSucursal = (clave = '', opcion = {}) =>
    /sucursal/i.test(String(clave)) || /sucursal/i.test(String(opcion?.name || ''));

const soloDigitos = (v) => String(v || '').replace(/\D/g, '');

/** Teléfono argentino en formato internacional para wa.me, sin el 0 de área ni el 15. */
export const telefonoInternacional = (tel) => {
    let d = soloDigitos(tel);
    if (!d) return '';
    if (d.startsWith('549')) return d;
    if (d.startsWith('54') && d.length >= 12) return `549${d.slice(2)}`;
    if (d.startsWith('0')) d = d.slice(1);
    // "3492 15 216487" → sacar el 15 que va después del área (2 a 4 dígitos)
    d = d.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
    return `549${d}`;
};

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Revisa los datos del checkout. Devuelve un objeto {campo: mensaje} vacío si
 * está todo bien. Los mensajes son para la clienta, en su idioma.
 */
export const validarDatosCheckout = (datos = {}, { retiroEnSucursal = false } = {}) => {
    const e = {};
    const t = (k) => String(datos[k] || '').trim();

    if (!t('nombre')) e.nombre = 'Poné tu nombre';
    if (!t('apellido')) e.apellido = 'Poné tu apellido';
    if (!EMAIL_OK.test(t('email'))) e.email = 'Revisá el email: ahí te mandamos la confirmación y el seguimiento';
    const tel = soloDigitos(datos.telefono);
    if (tel.length < 8 || tel.length > 15) e.telefono = 'Poné un teléfono con código de área (ej. 3492 216487)';
    const dni = soloDigitos(datos.dni);
    if (dni.length < 7 || dni.length > 8) e.dni = 'El DNI va sin puntos, 7 u 8 números';

    const cp = soloDigitos(datos.cp);
    if (cp.length !== 4) e.cp = 'Son 4 números';
    if (!t('ciudad')) e.ciudad = 'Poné la localidad';
    if (!PROVINCIAS.includes(t('provincia'))) e.provincia = 'Elegí la provincia';

    if (!retiroEnSucursal) {
        if (!t('calle')) e.calle = 'Poné la calle';
        if (!t('altura')) e.altura = 'Falta la altura';
    }
    return e;
};

/** Deja los datos como los quiere el Correo: sin espacios de más, DNI y CP sólo números. */
export const normalizarDatosCheckout = (datos = {}) => {
    const t = (k) => String(datos[k] || '').trim().replace(/\s+/g, ' ');
    return {
        ...datos,
        nombre: t('nombre'), apellido: t('apellido'),
        email: t('email').toLowerCase(),
        telefono: t('telefono'),
        dni: soloDigitos(datos.dni),
        calle: t('calle'), altura: t('altura'), piso: t('piso'),
        ciudad: t('ciudad'), provincia: t('provincia'),
        cp: soloDigitos(datos.cp),
        referencias: t('referencias'),
    };
};

/** "Belgrano 1234, 2° B — Rafaela, Santa Fe (2300)" para mostrar en una línea. */
export const direccionEnUnaLinea = (c = {}) => {
    const calle = [c.calle, c.altura].filter(Boolean).join(' ');
    const linea1 = [calle, c.piso].filter(Boolean).join(', ');
    const localidad = [c.ciudad, c.provincia].filter(Boolean).join(', ');
    const linea2 = [localidad, c.cp ? `(${c.cp})` : ''].filter(Boolean).join(' ');
    return [linea1, linea2].filter(Boolean).join(' — ');
};

/**
 * El bloque de texto que se pega en MiCorreo (Nuevo envío → Destino), en el
 * orden en que lo pide el formulario. Sirve también para WhatsApp/notas.
 */
export const datosParaCorreo = (pedido = {}) => {
    const c = pedido.customer || {};
    const sucursal = esRetiroEnSucursal(pedido.shipping, { name: pedido.shippingName });
    const lineas = [
        `Pedido ${pedido.id || ''}`.trim(),
        `Destinatario: ${[c.nombre, c.apellido].filter(Boolean).join(' ')}`,
        `DNI: ${c.dni || '-'}`,
        `Teléfono: ${c.telefono || '-'}`,
        `Email: ${c.email || '-'}`,
        sucursal ? 'Entrega: RETIRO EN SUCURSAL (la más cercana al CP)' : 'Entrega: A DOMICILIO',
    ];
    if (!sucursal) {
        lineas.push(`Calle: ${c.calle || '-'}`, `Altura: ${c.altura || '-'}`);
        if (c.piso) lineas.push(`Piso/Depto: ${c.piso}`);
    }
    lineas.push(`Localidad: ${c.ciudad || '-'}`, `Provincia: ${c.provincia || '-'}`, `CP: ${c.cp || '-'}`);
    if (c.referencias) lineas.push(`Referencias: ${c.referencias}`);
    const items = (pedido.items || []).map(i => `- ${i.name}${i.size ? ` · ${i.size}` : ''}${i.color ? ` · ${i.color}` : ''} x${i.quantity || 1}`);
    if (items.length) lineas.push('', 'Contenido:', ...items);
    return lineas.join('\n');
};

/** Separa "Laura Colleras" en nombre y apellido para prellenar desde Google. */
export const partirNombreCompleto = (completo = '') => {
    const partes = String(completo || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return { nombre: '', apellido: '' };
    if (partes.length === 1) return { nombre: partes[0], apellido: '' };
    return { nombre: partes[0], apellido: partes.slice(1).join(' ') };
};
