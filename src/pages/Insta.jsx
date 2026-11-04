import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { SEO } from '../components/seo/SEO';
import { formatMoney, optimizeImage } from '../utils/helpers';
import { tituloDeProducto } from '../utils/nombres';
import { getTotalStock } from '../utils/variants';

// El enlace de la bio de Instagram. Instagram no deja poner enlaces en una
// publicación, así que esta página es el puente: la clienta ve la prenda del
// cartel y de un toque cae en su ficha para comprarla. Las fotos van en 2:3,
// igual que las de modelo: enteras, sin recorte.
export const Insta = () => {
    const { inventory = [] } = useStore();
    const prendas = useMemo(
        () => inventory.filter(p => p.active !== false && getTotalStock(p) > 0 && p.image),
        [inventory]
    );

    return (
        <div className="max-w-3xl mx-auto px-4 pb-16">
            <SEO title="Comprá lo que viste en Instagram" description="Tocá la prenda que viste en Instagram y comprala directo." />
            <header className="text-center pt-6 pb-8">
                <p className="font-cinzel text-2xs uppercase tracking-[0.35em] text-cielo-gold mb-3">Desde Instagram</p>
                <h1 className="font-serif text-3xl md:text-4xl text-noche-100">Tocá la prenda y comprala</h1>
            </header>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6">
                {prendas.map(p => (
                    <li key={p.id}>
                        <Link to={`/product/${p.id}?utm_source=instagram`} className="group block">
                            <div className="aspect-[2/3] overflow-hidden bg-noche-850">
                                <img src={optimizeImage(p.image, 500)} alt={tituloDeProducto(p.name)} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </div>
                            <p className="font-serif text-base text-noche-100 mt-3 leading-snug group-hover:text-cielo-gold transition-colors">{tituloDeProducto(p.name)}</p>
                            <p className="text-sm text-cielo-gold mt-1">{formatMoney(p.price)}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
