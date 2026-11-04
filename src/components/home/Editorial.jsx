import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { optimizeImage } from '../../utils/helpers';
import { tituloDeProducto } from '../../utils/nombres';
import { Reveal } from '../ui/Reveal';

// La pausa de revista de la home: rompe la grilla con la frase de la campaña
// («Dejá que hable tu …») y una sola prenda en el arco de la marca. El arco es apenas más angosto que la foto
// (4:7 contra 2:3) para dejar afuera sólo fondo: a la modelo no se la recorta.
const ELEGIDA = /campera ecocuero chocolate/i;

export const Editorial = () => {
    const { inventory } = useStore();
    const activos = (inventory || []).filter((p) => p.active !== false && p.image);
    const prenda = activos.find((p) => ELEGIDA.test(p.name)) || activos[0];
    if (!prenda) return null;
    const palabra = ELEGIDA.test(prenda.name) ? 'campera' : 'prenda';

    const grande = 'font-serif leading-[0.95] text-[clamp(3.2rem,15vw,5.5rem)] lg:text-[clamp(3rem,6.2vw,7.5rem)]';

    return (
        <section className="relative py-16 lg:py-24 px-6 bg-noche-950 overflow-hidden">
            <div aria-hidden="true" className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-0 w-[58rem] h-[46rem] rounded-t-full border border-cielo-gold/[0.07]" />
            <div aria-hidden="true" className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-0 w-[78rem] h-[58rem] rounded-t-full border border-cielo-gold/[0.04]" />

            <Reveal className="relative max-w-[1500px] mx-auto grid lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-10">
                <h2 className={`${grande} text-noche-100 text-center lg:text-right`}>Dejá que<br />hable</h2>

                <Link
                    to={`/product/${prenda.id}`}
                    aria-label={`Ver ${tituloDeProducto(prenda.name)}`}
                    className="group relative block mx-auto w-[min(72vw,20rem)] lg:w-auto lg:h-[min(82vh,46rem)] aspect-[4/7]"
                >
                    <span aria-hidden="true" className="absolute -inset-2.5 lg:-inset-3 rounded-t-full border border-cielo-gold/40 transition-colors duration-700 group-hover:border-cielo-gold/80" />
                    <span className="absolute inset-0 rounded-t-full overflow-hidden bg-noche-800">
                        <img
                            src={optimizeImage(prenda.image, 900)}
                            alt={tituloDeProducto(prenda.name)}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
                        />
                    </span>
                </Link>

                <div className="text-center lg:text-left">
                    <p className={`${grande} italic text-cielo-gold lg:whitespace-nowrap`}>tu <br className="hidden lg:block" />{palabra}.</p>
                    <Link
                        to={`/product/${prenda.id}`}
                        className="inline-flex items-center gap-3 mt-7 lg:mt-9 font-cinzel text-2xs uppercase tracking-[0.3em] text-noche-100/85 border-b border-cielo-gold/40 pb-1.5 transition-colors hover:text-white hover:border-cielo-gold"
                    >
                        {tituloDeProducto(prenda.name)} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </Reveal>
        </section>
    );
};
