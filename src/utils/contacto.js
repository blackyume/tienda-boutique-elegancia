// Canales de contacto de la tienda: Telegram y WhatsApp.
//
// Antes cada pantalla resolvía esto por su cuenta con un `|| "549114444..."`
// hardcodeado. Como el número real nunca se cargó, ese fallback se activaba y
// los pedidos del checkout se iban a un número que no es de la tienda. Acá no
// hay números inventados: si el dato no está cargado, el canal no existe.

// Acepta "@usuario", "usuario", "t.me/usuario" o una URL completa.
// OJO: `siteConfig.telegram` es un OBJETO ({secret}) que usa el panel para
// publicar al canal. No es el contacto y por eso sólo se aceptan strings.
export const linkTelegram = (valor) => {
    if (typeof valor !== 'string') return null;
    const limpio = valor.trim();
    if (!limpio) return null;
    if (/^https?:\/\//i.test(limpio)) return limpio;
    const usuario = limpio.replace(/^@/, '').replace(/^t\.me\//i, '').trim();
    return usuario ? `https://t.me/${usuario}` : null;
};

// Un número argentino con código de país tiene 12-13 dígitos. Menos que eso
// es un campo a medio cargar y preferimos no ofrecer el canal.
export const linkWhatsApp = (valor, mensaje = '') => {
    if (typeof valor !== 'string' && typeof valor !== 'number') return null;
    const digitos = String(valor).replace(/\D/g, '');
    if (digitos.length < 10) return null;
    const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
    return `https://wa.me/${digitos}${texto}`;
};

export const telegramDeConfig = (siteConfig) => linkTelegram(siteConfig?.social?.telegram);

export const whatsappDeConfig = (siteConfig, mensaje = '') => linkWhatsApp(
    siteConfig?.whatsappNumber || siteConfig?.contact?.whatsapp || siteConfig?.social?.whatsapp,
    mensaje
);

// Para coordinar un pedido. WhatsApp va primero a propósito: es el único de
// los dos que deja mandar el detalle del pedido ya escrito (t.me no tiene un
// ?text= para chats privados), así que el pedido llega completo sin que la
// clienta tenga que copiar nada. Telegram queda de respaldo.
export const canalDePedido = (siteConfig, mensaje) => {
    const wa = whatsappDeConfig(siteConfig, mensaje);
    if (wa) return { url: wa, canal: 'whatsapp', llevaMensaje: true };

    const tg = telegramDeConfig(siteConfig);
    if (tg) return { url: tg, canal: 'telegram', llevaMensaje: false };

    return null;
};
