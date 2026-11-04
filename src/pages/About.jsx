import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { optimizeImage } from '../utils/helpers';
import { tituloDeProducto } from '../utils/nombres';
import { Atelier } from '../components/home/Atelier';
import { Reveal } from '../components/ui/Reveal';
import { Rombo } from '../components/ui/Ornamento';

// Sólo lo que la tienda puede sostener ante una clienta: elige prendas, las
// revisa y las manda desde Rafaela. Las fotos son las del catálogo, no de banco.
const CUIDADOS = [
    'Revisamos cada prenda antes de despacharla.',
    'Embalaje cuidado para que llegue impecable.',
    'Código de seguimiento por correo.',
    'Envíos a todo el país con Correo Argentino.',
];

const Arco = ({ prenda, className = '' }) => (
    <Link to={`/product/${prenda.id}`} aria-label={`Ver ${tituloDeProducto(prenda.name)}`} className={`group relative block aspect-[4/7] ${className}`}>
        <span aria-hidden="true" className="absolute -inset-2.5 rounded-t-full border border-cielo-gold/40 transition-colors duration-700 group-hover:border-cielo-gold/80" />
        <span className="absolute inset-0 rounded-t-full overflow-hidden bg-noche-800">
            <img src={optimizeImage(prenda.image, 800)} alt={tituloDeProducto(prenda.name)} loading="lazy" className="w-full h-full object-cover" />
        </span>
    </Link>
);

export const About = () => {
    const { siteConfig, inventory } = useStore();
    const instagramUrl = siteConfig?.social?.instagram || 'https://www.instagram.com/laboutiquedelaeleganciaoficial/';
    const instagramHandle = '@' + (instagramUrl.replace(/\/+$/, '').split('/').pop() || 'laboutiquedelaeleganciaoficial');
    const activos = (inventory || []).filter((p) => p.active !== false && p.image);
    const [primera, segunda] = [activos[2] || activos[0], activos[6] || activos[1]];

    return (
        <div className="animate-fadeIn bg-[#11100D] font-sans overflow-x-hidden">
            <section className="relative px-6 pt-10 md:pt-16 pb-16 md:pb-24 overflow-hidden">
                <Reveal className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr_auto] items-center gap-12 md:gap-20">
                    <div>
                        <span className="inline-flex items-center gap-4 text-2xs uppercase tracking-[0.4em] font-semibold text-cielo-gold/70">
                            <Rombo /> Nuestra historia
                        </span>
                        <h1 className="mt-6 font-serif text-noche-100 leading-[1.05] text-[clamp(2.6rem,6vw,5.5rem)]">
                            Una tienda chica, <span className="block italic text-cielo-gold">con mucho criterio.</span>
                        </h1>
                        <p className="mt-8 max-w-lg text-noche-300/90 text-base md:text-lg font-light leading-relaxed">
                            Somos de Rafaela, Santa Fe. No hacemos ropa: la elegimos, una por una, para la mujer que se viste con intención. Vendemos sólo online y mandamos a todo el país.
                        </p>
                    </div>
                    {primera && <Arco prenda={primera} className="mx-auto w-[min(70vw,19rem)] md:w-[19rem]" />}
                </Reveal>
            </section>

            <Atelier />

            <section className="px-6 py-16 md:py-24">
                <Reveal className="max-w-6xl mx-auto grid md:grid-cols-[auto_1.1fr] items-center gap-12 md:gap-20">
                    {segunda && <Arco prenda={segunda} className="order-2 md:order-1 mx-auto w-[min(70vw,19rem)] md:w-[19rem]" />}
                    <div className="order-1 md:order-2">
                        <h2 className="font-serif text-noche-100 leading-tight text-4xl md:text-5xl">Del otro lado, una persona</h2>
                        <p className="mt-6 max-w-lg text-noche-300/90 font-light leading-relaxed">
                            Comprar online pide confianza. Por eso cuidamos cada pedido desde que lo preparamos hasta que llega a tus manos, y cada consulta la contesta una persona.
                        </p>
                        <ul className="mt-8 space-y-4">
                            {CUIDADOS.map((c) => (
                                <li key={c} className="flex items-center gap-4 text-noche-100/90 font-light"><Rombo /> {c}</li>
                            ))}
                        </ul>
                        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                            <Link to="/shop" className="btn-oro group inline-flex items-center gap-3 px-9 py-4 bg-cielo-gold text-[#11100D] font-cinzel font-semibold text-2xs uppercase tracking-[0.3em] transition-colors hover:bg-[#F3D985]">
                                Ver la tienda <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-noche-300 hover:text-white transition-colors break-all">
                                <Instagram className="w-4 h-4 text-cielo-gold shrink-0" /> {instagramHandle}
                            </a>
                        </div>
                        <p className="mt-6 inline-flex items-center gap-2 text-sm text-noche-300/80"><MapPin className="w-4 h-4 text-cielo-gold" /> Envíos desde Rafaela, Santa Fe</p>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};
