import React, { useLayoutEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const PrivacyPolicy = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const { siteConfig } = useStore();
    const email = siteConfig?.contact?.email || 'laboutiquedelaeleganciaoficial@gmail.com';

    return (
        <div className="bg-white dark:bg-[#312721] min-h-screen pt-32 pb-20 px-6 font-sans text-slate-700 dark:text-slate-300">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-luxury font-bold text-slate-900 dark:text-white mb-8 tracking-wide">Política de Privacidad</h1>
                <p className="text-sm text-slate-400 mb-12 uppercase tracking-widest">Última actualización: 01 de Enero de 2026</p>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Identidad del Responsable</h2>
                        <p className="leading-relaxed">
                            <strong>La Boutique de la Elegancia</strong>, con domicilio legal en Rafaela, Santa Fe, Argentina, es la responsable del tratamiento de los datos personales. Cumplimos con la Ley Nacional de Protección de Datos Personales N° 25.326 y sus normas complementarias.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Información que Recopilamos</h2>
                        <p className="leading-relaxed mb-4">
                            Recopilamos información únicamente cuando usted interactúa activamente con nuestro sitio, incluyendo pero no limitado a:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#D4AF37]">
                            <li>Datos de contacto (Nombre, Email, Teléfono) al realizar una compra o consulta.</li>
                            <li>Datos de envío y facturación para el procesamiento de pedidos.</li>
                            <li>Preferencias de navegación y datos técnicos a través de cookies propias y de terceros.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. Finalidad del Tratamiento</h2>
                        <p className="leading-relaxed">
                            Sus datos serán utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#D4AF37]">
                            <li>Procesar, confirmar y enviar sus pedidos.</li>
                            <li>Brindar asistencia al cliente y seguimiento de compras.</li>
                            <li>Enviar comunicaciones promocionales (solo si ha dado su consentimiento explícito).</li>
                            <li>Mejorar la experiencia de usuario en nuestra plataforma digital.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">4. Seguridad de los Datos</h2>
                        <p className="leading-relaxed">
                            Implementamos medidas de seguridad técnicas y organizativas de nivel industrial (incluyendo encriptación SSL) para proteger sus datos contra el acceso no autorizado, la pérdida o la alteración. Los pagos son procesados por <strong>Mercado Pago</strong> y los envíos gestionados por <strong>Correo Argentino</strong>, quienes tratan únicamente los datos necesarios para completar la operación. No compartimos ni vendemos sus datos personales a terceros con fines comerciales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Sus Derechos (Derechos ARCO)</h2>
                        <p className="leading-relaxed">
                            Como titular de los datos, usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de su información. Para ejercer estos derechos, por favor contáctenos directamente a través de nuestro canal oficial de soporte.
                        </p>
                    </section>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12">
                        <p className="text-sm italic text-slate-500">
                            Para consultas sobre tus datos: <a href={`mailto:${email}`} className="text-[#D4AF37] hover:underline">{email}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
