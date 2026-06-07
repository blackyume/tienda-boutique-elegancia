import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Store, Clock, PackageSearch, RotateCcw, ShieldCheck } from 'lucide-react';

const Card = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
);

export const Shipping = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen pt-32 pb-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-[#D4AF37] font-bold tracking-[0.25em] uppercase text-xs">Información</span>
                    <h1 className="text-4xl font-luxury font-bold text-slate-900 dark:text-white mt-2 tracking-wide">Envíos y Devoluciones</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">Enviamos a todo el país con Correo Argentino.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                    <Card icon={Truck} title="Envío a domicilio">
                        <p>Te llega directamente a tu casa con Correo Argentino. Al finalizar la compra ves el costo según tu zona.</p>
                        <p className="text-slate-400">Demora estimada: 3 a 7 días hábiles.</p>
                    </Card>
                    <Card icon={Store} title="Retiro en sucursal">
                        <p>Enviamos el paquete a la sucursal de Correo Argentino más cercana a tu domicilio para que lo retires. Suele ser más económico.</p>
                        <p className="text-slate-400">Demora estimada: 3 a 5 días hábiles.</p>
                    </Card>
                    <Card icon={Clock} title="Preparación del pedido">
                        <p>Preparamos y despachamos tu pedido dentro de 1 a 3 días hábiles desde que se confirma el pago.</p>
                    </Card>
                    <Card icon={PackageSearch} title="Seguimiento">
                        <p>Cuando despachamos, te enviamos el código de seguimiento por mail. Podés rastrearlo en la sección <Link to="/tracking" className="text-[#D4AF37] hover:underline">Seguimiento</Link>.</p>
                    </Card>
                </div>

                <div className="space-y-6 text-slate-700 dark:text-slate-300">
                    <section className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-[#D4AF37]" /> Cambios y devoluciones
                        </h2>
                        <p className="text-sm leading-relaxed mb-3">
                            Por la naturaleza de nuestros productos (indumentaria y ediciones limitadas) y por higiene, no realizamos cambios por gusto o talle fuera del plazo legal. Te recomendamos revisar bien la <strong>Tabla de Talles</strong> antes de comprar o consultarnos.
                        </p>
                        <ul className="text-sm leading-relaxed space-y-2 list-disc pl-5 marker:text-[#D4AF37]">
                            <li><strong>Falla de fábrica o error en el envío:</strong> escribinos apenas recibas el paquete y lo resolvemos.</li>
                            <li><strong>Derecho de arrepentimiento:</strong> tenés 10 días corridos desde la entrega para arrepentirte (producto sin uso, con etiquetas y empaque original), según la Resolución 424/2020.</li>
                        </ul>
                        <p className="text-xs text-slate-400 mt-4">Más detalle en los <Link to="/terms" className="text-[#D4AF37] hover:underline">Términos y Condiciones</Link>.</p>
                    </section>

                    <section className="flex items-start gap-3 bg-[#D4AF37]/[0.06] border border-[#D4AF37]/20 rounded-2xl p-5">
                        <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed">
                            <strong>Compra protegida:</strong> revisamos cada prenda manualmente antes de despacharla y embalamos todo con cuidado para que llegue impecable.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
