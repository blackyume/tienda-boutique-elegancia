// Ejecuta un plan de importación de productos (el que arma
// `planearImportacion`): sube las fotos y crea/actualiza. Lo usan el modal
// de Inventario y Lau, así los dos hacen exactamente lo mismo.

import { detallesPorPlantilla } from './ficha';
const subirFotos = async (lista, etiqueta, { uploadImage, onAvance }) => {
    const urls = [];
    for (let i = 0; i < lista.length; i += 1) {
        const f = lista[i];
        onAvance?.(`${etiqueta} · foto ${i + 1} de ${lista.length}`);
        const url = typeof f === 'string' ? f : await uploadImage(f, 'products', { silencioso: true });
        if (url) urls.push(url);
    }
    if (!urls.length) return null;
    return { image: urls[0], media: urls.map((u) => ({ type: 'image', url: u })) };
};

/**
 * Devuelve { hechos, fallados, sinSubir }. Un producto nuevo cuya foto no
 * llegó a subir entra como borrador: no se publica nada sin imagen.
 */
export const aplicarPlanDeProductos = async (plan, { uploadImage, addProduct, updateProduct, onAvance }) => {
    const total = plan.altas.length + plan.cambios.length;
    let hechos = 0, fallados = 0, sinSubir = 0;

    for (const alta of plan.altas) {
        try {
            const imagenes = alta.fotos.length ? await subirFotos(alta.fotos, alta.nombre, { uploadImage, onAvance }) : null;
            if (alta.fotos.length && !imagenes) sinSubir += 1;
            const datos = imagenes ? { ...alta.datos, ...imagenes } : { ...alta.datos, active: false };
            // Las viñetas de "Detalles" salen de los datos reales de la fila (colores, talles).
            if (!datos.details) datos.details = detallesPorPlantilla(datos);
            await addProduct(datos, { silencioso: true });
        } catch { fallados += 1; }
        hechos += 1;
        onAvance?.(`${hechos} de ${total}`);
    }
    for (const cambio of plan.cambios) {
        try {
            const imagenes = cambio.fotos?.length ? await subirFotos(cambio.fotos, cambio.nombre, { uploadImage, onAvance }) : null;
            if (cambio.fotos?.length && !imagenes) sinSubir += 1;
            const campos = imagenes ? { ...cambio.campos, ...imagenes } : { ...cambio.campos };
            if (cambio.fotos?.length && !imagenes) delete campos.active;
            await updateProduct(cambio.id, campos, { silencioso: true });
        } catch { fallados += 1; }
        hechos += 1;
        onAvance?.(`${hechos} de ${total}`);
    }
    return { hechos, fallados, sinSubir, total };
};

/** Resumen en texto de un plan de productos, para que Lau lo muestre antes de confirmar. */
export const resumirPlanDeProductos = (plan) => {
    const conFoto = plan.altas.filter((a) => a.fotos.length).length;
    const lineas = [];
    if (plan.altas.length) lineas.push(`• ${plan.altas.length} producto${plan.altas.length === 1 ? '' : 's'} nuevo${plan.altas.length === 1 ? '' : 's'} (${conFoto} con foto → entran publicados; el resto queda en borrador).`);
    for (const a of plan.altas.slice(0, 15)) lineas.push(`   ${a.nombre}${a.datos?.price != null ? ` — $${Number(a.datos.price).toLocaleString('es-AR')}` : ''}${a.fotos.length ? ` · ${a.fotos.length} foto${a.fotos.length === 1 ? '' : 's'}` : ' · sin foto'}`);
    if (plan.altas.length > 15) lineas.push(`   … y ${plan.altas.length - 15} más.`);
    if (plan.cambios.length) lineas.push(`• ${plan.cambios.length} producto${plan.cambios.length === 1 ? '' : 's'} que ya existían y cambian (precio, stock…).`);
    if (plan.sinCambios?.length) lineas.push(`• ${plan.sinCambios.length} sin cambios.`);
    if (plan.fotosSueltas?.length) lineas.push(`⚠️ Fotos que no van a ningún producto (el nombre no coincide): ${plan.fotosSueltas.slice(0, 8).join(', ')}${plan.fotosSueltas.length > 8 ? '…' : ''}.`);
    for (const e of (plan.errores || []).slice(0, 8)) lineas.push(`⚠️ ${typeof e === 'string' ? e : `${e.nombre || 'fila'}: ${e.motivo || e.error || ''}`}`);
    if (!plan.altas.length && !plan.cambios.length) lineas.push('No hay nada para crear ni actualizar en esa planilla.');
    return lineas.join('\n');
};
