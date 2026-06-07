// Genera una etiqueta de envío imprimible (10x15 cm) en PDF para pegar al paquete.
// Incluye REMITENTE (la tienda) y DESTINATARIO (el cliente) + datos del pedido y
// un espacio para el N° de seguimiento (que sale de Correo Argentino al despachar).
//
// No es la etiqueta "oficial" con el código de barras de Correo (eso lo genera
// MiCorreo cuando despachás), pero deja el paquete listo y prolijo con todos los datos.

const GOLD = [180, 145, 45];
const DARK = [20, 20, 20];

const line = (doc, x, y, text, opts = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size || 9);
    doc.setTextColor(...(opts.color || DARK));
    doc.text(String(text ?? ''), x, y, { maxWidth: opts.maxWidth || 88 });
};

export const generateShippingLabel = async (order, remitente = {}) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: [100, 150] });

    const c = order.customer || {};
    const W = 100;
    const M = 6;

    // Marco
    doc.setDrawColor(...DARK);
    doc.setLineWidth(0.5);
    doc.rect(M - 2, M - 2, W - 2 * (M - 2), 150 - 2 * (M - 2));

    // Header
    doc.setFillColor(...DARK);
    doc.rect(M - 2, M - 2, W - 2 * (M - 2), 16, 'F');
    line(doc, M + 1, M + 5, 'LA BOUTIQUE DE LA ELEGANCIA', { bold: true, size: 11, color: GOLD });
    line(doc, M + 1, M + 10, 'Etiqueta de envío · Correo Argentino', { size: 8, color: [235, 225, 200] });

    let y = M + 22;

    // REMITENTE (DE)
    line(doc, M, y, 'REMITENTE (DE):', { bold: true, size: 8, color: GOLD });
    y += 5;
    line(doc, M, y, remitente.name || 'La Boutique de la Elegancia', { bold: true, size: 10 }); y += 5;
    if (remitente.address) { line(doc, M, y, remitente.address); y += 4.5; }
    const remLoc = [remitente.cp && `CP ${remitente.cp}`, remitente.city, remitente.province].filter(Boolean).join(' · ');
    if (remLoc) { line(doc, M, y, remLoc); y += 4.5; }
    if (remitente.phone) { line(doc, M, y, `Tel: ${remitente.phone}`); y += 4.5; }

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 6;

    // DESTINATARIO (PARA)
    line(doc, M, y, 'DESTINATARIO (PARA):', { bold: true, size: 9, color: GOLD });
    y += 6;
    const fullName = [c.nombre, c.apellido].filter(Boolean).join(' ') || c.nombre || 'Cliente';
    line(doc, M, y, fullName, { bold: true, size: 12 }); y += 6;
    const dir = [c.calle, c.altura, c.piso && `Piso ${c.piso}`].filter(Boolean).join(' ');
    if (dir) { line(doc, M, y, dir, { size: 10 }); y += 5; }
    const loc = [c.ciudad, c.cp && `CP ${c.cp}`].filter(Boolean).join(' · ');
    if (loc) { line(doc, M, y, loc, { size: 10 }); y += 5; }
    if (c.telefono) { line(doc, M, y, `Tel: ${c.telefono}`, { size: 10 }); y += 5; }
    if (c.dni) { line(doc, M, y, `DNI: ${c.dni}`, { size: 9, color: [90, 90, 90] }); y += 5; }

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(M, y, W - M, y);
    y += 6;

    // PEDIDO
    const cantItems = (order.items || []).reduce((a, i) => a + (Number(i.quantity) || 1), 0);
    line(doc, M, y, `Pedido: ${order.id || '-'}`, { bold: true, size: 9 }); y += 5;
    line(doc, M, y, `Envío: ${order.shippingName || order.shipping || '-'}`, { size: 9 }); y += 5;
    line(doc, M, y, `Bultos/prendas: ${cantItems}`, { size: 9 }); y += 7;

    // Caja para el N° de seguimiento
    doc.setDrawColor(...DARK);
    doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 14);
    line(doc, M + 2, y + 5, 'N° DE SEGUIMIENTO:', { bold: true, size: 7, color: [90, 90, 90] });
    line(doc, M + 2, y + 11, order.trackingNumber || order.tracking || '________________________', { bold: true, size: 11 });

    doc.save(`Etiqueta_${order.id || 'envio'}.pdf`);
};
