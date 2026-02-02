import React from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../utils/helpers';

export const Wishlist = () => {
    const { wishlist, setWishlist, addToCart } = useStore();
    const navigate = useNavigate();

    const removeFromWishlist = (id) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    };

    const handleAddToCart = (item) => {
        // Default to first size/color if not specified (wishlist usually stores just product)
        // Check if item has sizes/colors selected. If not, maybe redirect to product page?
        // For simplicity, let's redirect to product page
        navigate(`/product/${item.id}`);
    };

    if (wishlist.length === 0) {
        return (
            <div className="pt-32 pb-20 min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-4">Tu Wishlist está vacía</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                    Guarda tus prendas favoritas para no perderlas de vista.
                </p>
                <Button onClick={() => navigate('/shop')} className="bg-[#C19A6B] hover:bg-[#a38056] text-white px-8 py-3 rounded-none font-bold tracking-widest uppercase">
                    Explorar Colección
                </Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto bg-white dark:bg-slate-950 min-h-screen">
            <h1 className="text-3xl font-serif text-slate-900 dark:text-white mb-8 text-center md:text-left border-b border-slate-100 dark:border-slate-800 pb-4">
                Mis Favoritos <span className="text-sm font-sans text-slate-400 font-normal ml-2">({wishlist.length})</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map(product => (
                    <div key={product.id} className="group relative border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[3/4] overflow-hidden relative">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>

                            <button
                                onClick={() => removeFromWishlist(product.id)}
                                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => handleAddToCart(product)}
                                className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-3 font-bold uppercase text-xs tracking-widest shadow-lg translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-3 h-3" /> Ver Producto
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{product.name}</h3>
                            <p className="text-[#C19A6B] font-bold">{formatMoney(product.price)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
