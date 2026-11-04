import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export const PrivacyPolicy = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const { siteConfig } = useStore();
    const email = siteConfig?.contact?.email || 'laboutiquedelaeleganciaoficial@gmail.com';

    return (
        <div className="bg-white dark:bg-[#11100D] min-h-screen pt-32 pb-20 px-6 font-sans text-slate-700 dark:text-slate-300">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-noche-100 mb-6">Política de Privacidad</h1>
                <p className="text-sm text-slate-400 mb-12 uppercase tracking-widest">Última actualización: 4 de Noviembre de 2026</p>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">1. Identidad del Responsable</h2>
                        <p className="leading-relaxed">
                            <strong>La Boutique de la Elegancia</strong>, con domicilio legal en Rafaela, Santa Fe, Argentina, es la responsable del tratamiento de los datos personales. Cumplimos con la Ley Nacional de Protección de Datos Personales N° 25.326 y sus normas complementarias.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">2. Información que Recopilamos</h2>
                        <p className="leading-relaxed mb-4">
                            Recopilamos información únicamente cuando usted interactúa activamente con nuestro sitio, incluyendo pero no limitado a:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#E8C65E]">
                            <li>Datos de contacto (Nombre, Email, Teléfono) al realizar una compra, dejar una consulta en el chat o suscribirse a las novedades.</li>
                            <li>Datos de envío y facturación para el procesamiento de pedidos.</li>
                            <li>Preferencias de navegación y datos técnicos a través de cookies propias y de terceros.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">3. Finalidad del Tratamiento</h2>
                        <p className="leading-relaxed">
                            Sus datos serán utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#E8C65E]">
                            <li>Procesar, confirmar y enviar sus pedidos.</li>
                            <li>Brindar asistencia al cliente, responder sus consultas y dar seguimiento a sus compras.</li>
                            <li>Enviar comunicaciones promocionales (solo si ha dado su consentimiento explícito).</li>
                            <li>Mejorar la experiencia de usuario en nuestra plataforma digital.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">4. Seguridad de los Datos</h2>
                        <p className="leading-relaxed">
                            Implementamos medidas de seguridad técnicas y organizativas de nivel industrial (incluyendo encriptación SSL) para proteger sus datos contra el acceso no autorizado, la pérdida o la alteración. Los pagos son procesados por <strong>Mercado Pago</strong> y los envíos gestionados por <strong>Correo Argentino</strong>, quienes tratan únicamente los datos necesarios para completar la operación. No compartimos ni vendemos sus datos personales a terceros con fines comerciales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">5. Servicios que Utilizamos</h2>
                        <p className="leading-relaxed">
                            Para que la tienda funcione, sus datos pasan por proveedores que los tratan por cuenta nuestra: Mercado Pago (pagos), Correo Argentino (envíos), Google Firebase (base de datos y sitio), Vercel (procesos del sitio), Cloudinary (imágenes) y EmailJS junto con Gmail (correos). Algunos de ellos guardan la información en servidores fuera de la Argentina. No vendemos sus datos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">6. Novedades y Promociones</h2>
                        <p className="leading-relaxed">
                            El correo que deja en una consulta se usa para responderle. Solo le enviamos publicidad si tildó la casilla de novedades o se suscribió. Para dejar de recibirla en cualquier momento, ingrese a <Link to="/baja" className="text-[#E8C65E] hover:underline">Darse de baja</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-slate-900 dark:text-noche-100 mb-4">7. Sus Derechos (Derechos ARCO)</h2>
                        <p className="leading-relaxed">
                            Como titular de los datos, usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de su información. Para ejercer estos derechos, escríbanos al correo que figura abajo. Si no queda conforme con la respuesta, puede reclamar ante la Agencia de Acceso a la Información Pública, autoridad de control de la Ley 25.326.
                        </p>
                    </section>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12">
                        <p className="text-sm italic text-slate-500">
                            Para consultas sobre tus datos: <a href={`mailto:${email}`} className="text-[#E8C65E] hover:underline">{email}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
