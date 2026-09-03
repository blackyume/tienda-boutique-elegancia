import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/shop/ProductCard';
import { SEO } from '../components/seo/SEO';

export const Wishlist = () => {
    const { wishlist, inventory } = useStore();
    const navigate = useNavigate();

    const items = useMemo(() => {
        const ids = (wishlist || []).map((w) => String(w?.id ?? w));
        return inventory.filter((p) => ids.includes(String(p.id)));
    }, [wishlist, inventory]);

    if (items.length === 0) {
        return (
            <div className="pt-32 pb-20 min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 text-center animate-fadeIn">
                <SEO title="Mis Favoritos" description="Tu lista de favoritos de La Boutique de la Elegancia." />
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-4">
                    Tu Wishlist está vacía
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                    Guardá tus prendas favoritas para no perderlas de vista.
                </p>
                <Button
                    onClick={() => navigate('/shop')}
                    className="bg-[#E8C65E] hover:bg-[#B8932E] text-white px-8 py-3 font-bold tracking-widest uppercase"
                >
                    Explorar Colección
                </Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto bg-white dark:bg-slate-950 min-h-screen">
            <SEO title="Mis Favoritos" description="Tu lista de favoritos de La Boutique de la Elegancia." />
            <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-8 text-center md:text-left border-b border-slate-100 dark:border-slate-800 pb-4">
                Mis Favoritos{' '}
                <span className="text-sm font-sans text-slate-400 font-normal ml-2">({items.length})</span>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};
