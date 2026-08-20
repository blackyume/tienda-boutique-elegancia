import React, { useLayoutEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const TermsConditions = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const { siteConfig } = useStore();
    const email = siteConfig?.contact?.email || 'laboutiquedelaeleganciaoficial@gmail.com';
    const whatsapp = siteConfig?.contact?.whatsapp;

    return (
        <div className="bg-white dark:bg-[#312721] min-h-screen pt-32 pb-20 px-6 font-sans text-slate-700 dark:text-slate-300">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-luxury font-bold text-slate-900 dark:text-white mb-8 tracking-wide">Términos y Condiciones</h1>
                <p className="text-sm text-slate-400 mb-12 uppercase tracking-widest">Vigencia: Desde Enero 2026</p>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Ámbito de Aplicación</h2>
                        <p className="leading-relaxed">
                            Los presentes Términos y Condiciones regulan el uso del sitio web <strong>La Boutique de la Elegancia</strong> y la compra de productos a través del mismo. Al acceder y utilizar este sitio, el usuario acepta someterse a estas condiciones sin reservas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Productos y Disponibilidad</h2>
                        <p className="leading-relaxed">
                            Nos esforzamos por mostrar los colores y texturas de nuestros productos con la mayor precisión posible. Sin embargo, no podemos garantizar que la visualización en su monitor sea exacta. Todas las compras están sujetas a disponibilidad de stock. En caso de falta de existencias, nos comprometemos a reembolsar el importe abonado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. Precios y Pagos</h2>
                        <p className="leading-relaxed">
                            Los precios están expresados en Pesos Argentinos (ARS). Nos reservamos el derecho de modificar los precios en cualquier momento, respetando siempre las compras ya confirmadas. Los pagos se procesan de forma segura a través de <strong>Mercado Pago</strong>; no almacenamos los datos completos de tu tarjeta en nuestros servidores.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">4. Envíos y Entregas</h2>
                        <p className="leading-relaxed">
                            Realizamos envíos a todo el país a través de <strong>Correo Argentino</strong>, en la modalidad a domicilio o retiro en sucursal según elija el cliente al finalizar la compra. Los plazos de entrega indicados son estimativos y comienzan a contar desde el despacho del paquete. La Boutique de la Elegancia no se hace responsable por demoras imputables a la empresa de logística. El riesgo de los productos se transfiere al cliente en el momento de la entrega.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Política de Cambios y Devoluciones</h2>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <p className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-amber-900 dark:text-amber-100">
                                <strong>IMPORTANTE - LEER CON ATENCIÓN:</strong><br />
                                Dada la naturaleza de nuestros productos (indumentaria de alta costura y ediciones limitadas) y para garantizar la higiene y exclusividad de cada pieza entregada, <strong>NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES</strong> por gusto, talle o arrepentimiento fuera del plazo legal obligatorio.
                            </p>
                            <p>
                                <strong>5.1. Excepciones:</strong> Únicamente se admitirán reclamos en caso de defectos de fabricación comprobables o error en el envío del artículo, los cuales deberán ser notificados dentro de las 48hs de recibido el paquete.
                            </p>
                            <p>
                                <strong>5.2. Derecho de Revocación (Botón de Arrepentimiento):</strong> Conforme a la Resolución 424/2020 de la Secretaría de Comercio Interior, el consumidor tiene derecho a revocar la aceptación del servicio o compra dentro de los <strong>DIEZ (10) días corridos</strong> computados a partir de la entrega del bien. Para ejercer este derecho, el producto debe encontrarse <strong>sin uso, con etiquetas y en su empaque original inalterado</strong>. El costo de devolución corre por cuenta del vendedor únicamente en este supuesto legal. Pasado este plazo, la venta se considera firme y definitiva sin excepción.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">6. Jurisdicción y Ley Aplicable</h2>
                        <p className="leading-relaxed">
                            Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a la jurisdicción de los Tribunales Ordinarios de la ciudad de <strong>Rafaela, Provincia de Santa Fe</strong>, renunciando a cualquier otro fuero o jurisdicción.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">7. Propiedad Intelectual</h2>
                        <p className="leading-relaxed">
                            Todo el contenido de este sitio (imágenes, textos, logotipos, diseño) es propiedad exclusiva de La Boutique de la Elegancia y está protegido por las leyes de propiedad intelectual internacionales. Queda prohibida su reproducción sin autorización expresa.
                        </p>
                    </section>

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 mt-12 text-center">
                        <p className="text-sm font-medium mb-2">¿Dudas? Escribinos y te ayudamos:</p>
                        <p className="text-sm">
                            <a href={`mailto:${email}`} className="text-[#D4AF37] hover:underline">{email}</a>
                            {whatsapp && <> &nbsp;·&nbsp; <a href={`https://wa.me/${String(whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">WhatsApp</a></>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
