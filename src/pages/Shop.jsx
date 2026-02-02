import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney, getColorHex, optimizeImage } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { Filter, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

import { SEO } from '../components/seo/SEO';

export const Shop = () => {
    const { inventory } = useStore();
    const navigate = useNavigate();

    const [filteredProducts, setFilteredProducts] = useState(inventory);
    const [sortOption, setSortOption] = useState('relevant'); // relevant, low-high, high-low
    const [filters, setFilters] = useState({
        category: 'all',
        priceRange: 'all', // all, 0-50000, 50000-100000, 100000+
        color: 'all',
        size: 'all'
    });
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Categories
    const categories = ['all', ...new Set(inventory.map(p => p.category))];
    const colors = ['all', ...new Set(inventory.flatMap(p => p.colors || []))];
    const sizes = ['all', ...new Set(inventory.flatMap(p => p.sizes || []))];

    useEffect(() => {
        let result = [...inventory];

        // Filter
        if (filters.category !== 'all') result = result.filter(p => p.category === filters.category);
        if (filters.color !== 'all') result = result.filter(p => p.colors?.includes(filters.color));
        if (filters.size !== 'all') result = result.filter(p => p.sizes?.includes(filters.size));

        if (filters.priceRange !== 'all') {
            if (filters.priceRange === '0-50000') result = result.filter(p => p.price <= 50000);
            if (filters.priceRange === '50000-100000') result = result.filter(p => p.price > 50000 && p.price <= 100000);
            if (filters.priceRange === '100000+') result = result.filter(p => p.price > 100000);
        }

        // Sort
        if (sortOption === 'low-high') result.sort((a, b) => a.price - b.price);
        if (sortOption === 'high-low') result.sort((a, b) => b.price - a.price);

        setFilteredProducts(result);
    }, [inventory, filters, sortOption]);

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white pt-24 transition-colors duration-500">
            <SEO title="Shop Online" description="Explora nuestra colección exclusiva de prendas de alta costura." />
            {/* Header Banner */}
            <div className="w-full bg-slate-900 dark:bg-black/40 text-white py-16 md:py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="relative z-10 animate-fadeIn">
                    <h1 className="text-4xl md:text-6xl font-cinzel mb-4 tracking-wider">Colección 2026</h1>
                    <p className="font-serif italic text-lg text-slate-300 max-w-2xl mx-auto">Descubrí la esencia del lujo moderno. Piezas únicas diseñadas para destacar.</p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8">

                {/* --- SIDEBAR FILTERS (Desktop) --- */}
                <aside className="hidden md:block w-64 flex-shrink-0 space-y-10 sticky top-32 h-fit">
                    <div>
                        <h3 className="font-cinzel text-lg mb-6 border-b border-slate-200 dark:border-white/10 pb-2">Filtros</h3>

                        {/* Categories */}
                        <div className="mb-8">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Categoría</h4>
                            <ul className="space-y-3">
                                {categories.map(cat => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => handleFilterChange('category', cat)}
                                            className={`text-sm transition-colors ${filters.category === cat ? 'font-bold text-cielo-gold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            {cat === 'all' ? 'Ver Todo' : cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Prices */}
                        <div className="mb-8">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Precio</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Todos', value: 'all' },
                                    { label: 'Hasta $50.000', value: '0-50000' },
                                    { label: '$50.000 - $100.000', value: '50000-100000' },
                                    { label: 'Más de $100.000', value: '100000+' },
                                ].map(opt => (
                                    <li key={opt.value}>
                                        <button
                                            onClick={() => handleFilterChange('priceRange', opt.value)}
                                            className={`text-sm transition-colors ${filters.priceRange === opt.value ? 'font-bold text-cielo-gold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Colors */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Color</h4>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleFilterChange('color', c)}
                                        className={`w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all ${filters.color === c ? 'ring-2 ring-cielo-gold scale-110' : 'hover:scale-105'}`}
                                        title={c}
                                    >
                                        <div className="w-full h-full rounded-full" style={{ backgroundColor: c === 'all' ? 'transparent' : getColorHex(c) }}>
                                            {c === 'all' && <span className="text-[8px] text-slate-500">X</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-white/5 pb-4">
                        <p className="text-sm font-serif text-slate-500">{filteredProducts.length} Productos</p>

                        <div className="flex gap-4">
                            <button className="md:hidden flex items-center gap-2 text-sm font-bold uppercase" onClick={() => setIsMobileFilterOpen(true)}>
                                <SlidersHorizontal className="w-4 h-4" /> Filtros
                            </button>

                            <div className="relative group">
                                <button className="flex items-center gap-2 text-sm font-bold uppercase hover:text-cielo-gold transition-colors">
                                    Orden <ChevronDown className="w-4 h-4" />
                                </button>
                                <div className="absolute right-0 top-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-lg py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                    <button onClick={() => setSortOption('relevant')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Más Relevantes</button>
                                    <button onClick={() => setSortOption('low-high')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Precio: Menor a Mayor</button>
                                    <button onClick={() => setSortOption('high-low')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Precio: Mayor a Menor</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="group cursor-pointer flex flex-col"
                                    onClick={() => { navigate(`/product/${product.id}`); window.scrollTo(0, 0); }}
                                >
                                    <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={optimizeImage(product.image, 500)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Quick Add Button */}
                                        <button className="absolute bottom-4 right-4 bg-white dark:bg-slate-900 text-black dark:text-white p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cielo-gold hover:text-black">
                                            <span className="sr-only">Ver Producto</span>
                                            <ChevronDown className="w-4 h-4 -rotate-90" />
                                        </button>
                                    </div>
                                    <h3 className="font-serif text-lg text-slate-900 dark:text-white group-hover:text-cielo-gold transition-colors text-center">{product.name}</h3>
                                    <p className="font-bold font-montserrat text-slate-500 text-sm text-center mt-1">{formatMoney(product.price)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <h3 className="text-xl font-cinzel mb-2">No se encontraron productos</h3>
                            <p className="text-slate-500">Prueba con otros filtros.</p>
                            <button onClick={() => setFilters({ category: 'all', priceRange: 'all', color: 'all', size: 'all' })} className="mt-6 text-cielo-gold underline hover:no-underline">Limpiar Filtros</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MOBILE FILTER MODAL --- */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-[#0B1120] p-6 animate-slideUp overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-cinzel">Filtros</h2>
                        <button onClick={() => setIsMobileFilterOpen(false)}><X className="w-6 h-6" /></button>
                    </div>

                    <div className="space-y-8">
                        {/* Categories Mobile */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Categoría</h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleFilterChange('category', cat)}
                                        className={`px-4 py-2 rounded-full border text-sm ${filters.category === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        {cat === 'all' ? 'Todos' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prices Mobile */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Precio</h4>
                            <div className="space-y-3">
                                {[
                                    { label: 'Todos', value: 'all' },
                                    { label: 'Hasta $50.000', value: '0-50000' },
                                    { label: '$50.000 - $100.000', value: '50000-100000' },
                                    { label: 'Más de $100.000', value: '100000+' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleFilterChange('priceRange', opt.value)}
                                        className={`block w-full text-left p-3 rounded-lg border ${filters.priceRange === opt.value ? 'bg-slate-50 dark:bg-white/10 border-cielo-gold' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8">
                            <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 font-bold uppercase tracking-widest rounded-xl">
                                Ver {filteredProducts.length} Resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
