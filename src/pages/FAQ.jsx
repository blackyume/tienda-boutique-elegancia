import React, { useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const FAQS = [
    {
        q: '¿Cómo compro en la tienda?',
        a: 'Elegí tu producto, seleccioná talle y color, agregalo al carrito y tocá "Finalizar compra". Completás tus datos, elegís el envío y pagás con Mercado Pago. ¡Listo! Te llega un mail de confirmación.',
    },
    {
        q: '¿Qué medios de pago aceptan?',
        a: 'Pagás de forma segura con Mercado Pago: tarjeta de crédito (en cuotas), débito, dinero en cuenta o efectivo (Pago Fácil / Rapipago). También podés coordinar por WhatsApp si preferís.',
    },
    {
        q: '¿Hacen envíos a todo el país?',
        a: 'Sí, enviamos a toda la Argentina con Correo Argentino. Podés elegir envío a domicilio (te llega a tu casa) o retiro en sucursal (lo retirás en la sucursal de correo más cercana, suele ser más barato).',
    },
    {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: 'Los tiempos son estimativos y empiezan a contar desde que despachamos el paquete: a domicilio suele tardar 3 a 7 días hábiles, y a sucursal 3 a 5 días hábiles, según tu zona.',
    },
    {
        q: '¿Cómo sigo mi pedido?',
        a: 'Cuando despachamos tu pedido te enviamos el número de seguimiento por mail. Con ese código podés rastrearlo en la sección Seguimiento o en la web de Correo Argentino.',
    },
    {
        q: '¿Puedo cambiar o devolver un producto?',
        a: 'Por higiene y exclusividad no aceptamos cambios por gusto o talle fuera del plazo legal. Sí tenés derecho a arrepentirte dentro de los 10 días corridos de recibido el producto (sin uso, con etiquetas y empaque original), según la Resolución 424/2020. En caso de falla de fábrica o error en el envío, escribinos dentro de las 48 hs.',
    },
    {
        q: '¿Cómo sé qué talle elegir?',
        a: 'Tenés la Tabla de Talles disponible en cada producto y en el pie de la página. Si tenés dudas, escribinos por WhatsApp y te asesoramos sin problema.',
    },
    {
        q: '¿Los productos son los de las fotos?',
        a: 'Sí. Revisamos manualmente cada prenda antes de enviarla. Hacemos lo posible por mostrar los colores con precisión, aunque pueden variar levemente según la pantalla.',
    },
];

const FaqItem = ({ q, a, open, onToggle }) => (
    <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/[0.03]">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
        >
            <span className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">{q}</span>
            <ChevronDown className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
                <p className="px-5 pb-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{a}</p>
            </div>
        </div>
    </div>
);

export const FAQ = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const { siteConfig } = useStore();
    const [openIdx, setOpenIdx] = useState(0);
    const whatsapp = String(siteConfig?.contact?.whatsapp || '5493492216487').replace(/\D/g, '');

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen pt-32 pb-20 px-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-[#D4AF37] font-bold tracking-[0.25em] uppercase text-xs">Ayuda</span>
                    <h1 className="text-4xl font-luxury font-bold text-slate-900 dark:text-white mt-2 tracking-wide">Preguntas Frecuentes</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">Todo lo que necesitás saber antes de comprar.</p>
                </div>

                <div className="space-y-3">
                    {FAQS.map((f, i) => (
                        <FaqItem key={i} q={f.q} a={f.a} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
                    ))}
                </div>

                <div className="mt-12 text-center bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-2xl p-8">
                    <p className="text-slate-700 dark:text-white font-semibold mb-1">¿No encontraste tu respuesta?</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Escribinos y te ayudamos al toque.</p>
                    <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:brightness-110 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                    >
                        <MessageCircle className="w-4 h-4" /> Escribinos por WhatsApp
                    </a>
                    <p className="text-xs text-slate-400 mt-4">
                        También podés ver nuestra <Link to="/envios" className="text-[#D4AF37] hover:underline">política de envíos</Link> o los <Link to="/terms" className="text-[#D4AF37] hover:underline">términos y condiciones</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};
