import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney, getColorHex } from '../utils/helpers';
import { getTotalStock } from '../utils/variants';
import { ChevronDown, SlidersHorizontal, X, Search } from 'lucide-react';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductGridSkeleton } from '../components/shop/ProductSkeleton';
import { SEO } from '../components/seo/SEO';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 12;

const parseSet = (raw) => new Set((raw || '').split(',').map((s) => s.trim()).filter(Boolean));

export const Shop = () => {
    const { inventory, loading } = useStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [sizes, setSizes] = useState(parseSet(searchParams.get('sizes')));
    const [colors, setColors] = useState(parseSet(searchParams.get('colors')));
    const [priceMax, setPriceMax] = useState(Number(searchParams.get('priceMax')) || 0);
    const [inStockOnly, setInStockOnly] = useState(searchParams.get('stock') === '1');
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'relevant');
    const [page, setPage] = useState(1);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Catálogo derivado
    const categories = useMemo(
        () => ['all', ...Array.from(new Set(inventory.map((p) => p.category).filter(Boolean)))],
        [inventory]
    );
    const allSizes = useMemo(
        () => Array.from(new Set(inventory.flatMap((p) => p.sizes || []))),
        [inventory]
    );
    const allColors = useMemo(
        () => Array.from(new Set(inventory.flatMap((p) => p.colors || []))),
        [inventory]
    );
    const maxPrice = useMemo(
        () => Math.max(0, ...inventory.map((p) => Number(p.price) || 0)),
        [inventory]
    );

    useEffect(() => {
        if (priceMax === 0 && maxPrice > 0) setPriceMax(maxPrice);
    }, [maxPrice, priceMax]);

    // Sincronizar URL
    useEffect(() => {
        const params = {};
        if (category !== 'all') params.category = category;
        if (search) params.q = search;
        if (sizes.size) params.sizes = [...sizes].join(',');
        if (colors.size) params.colors = [...colors].join(',');
        if (priceMax && priceMax !== maxPrice) params.priceMax = String(priceMax);
        if (inStockOnly) params.stock = '1';
        if (sortOption !== 'relevant') params.sort = sortOption;
        setSearchParams(params, { replace: true });
    }, [category, search, sizes, colors, priceMax, inStockOnly, sortOption, maxPrice, setSearchParams]);

    const filtered = useMemo(() => {
        let list = inventory.filter((p) => p.active !== false);
        if (category !== 'all') list = list.filter((p) => p.category === category);
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q)
            );
        }
        if (sizes.size > 0) list = list.filter((p) => (p.sizes || []).some((s) => sizes.has(s)));
        if (colors.size > 0) list = list.filter((p) => (p.colors || []).some((c) => colors.has(c)));
        if (priceMax > 0) list = list.filter((p) => Number(p.price) <= priceMax);
        if (inStockOnly) list = list.filter((p) => getTotalStock(p) > 0);

        if (sortOption === 'low-high') list = [...list].sort((a, b) => a.price - b.price);
        else if (sortOption === 'high-low') list = [...list].sort((a, b) => b.price - a.price);
        else if (sortOption === 'newest')
            list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        else if (sortOption === 'popular')
            list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
        return list;
    }, [inventory, category, search, sizes, colors, priceMax, inStockOnly, sortOption]);

    useEffect(() => { setPage(1); }, [category, search, sizes, colors, priceMax, inStockOnly, sortOption]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice(0, page * PAGE_SIZE);

    const toggleIn = (set, value, setter) => {
        const next = new Set(set);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        setter(next);
    };

    const clearAll = () => {
        setCategory('all');
        setSearch('');
        setSizes(new Set());
        setColors(new Set());
        setPriceMax(maxPrice);
        setInStockOnly(false);
        setSortOption('relevant');
    };

    const activeChips = [
        category !== 'all' && { label: category, onClear: () => setCategory('all') },
        search && { label: `"${search}"`, onClear: () => setSearch('') },
        ...[...sizes].map((s) => ({ label: `Talle ${s}`, onClear: () => toggleIn(sizes, s, setSizes) })),
        ...[...colors].map((c) => ({ label: c, onClear: () => toggleIn(colors, c, setColors) })),
        priceMax > 0 && priceMax < maxPrice && {
            label: `Hasta ${formatMoney(priceMax)}`,
            onClear: () => setPriceMax(maxPrice)
        },
        inStockOnly && { label: 'Solo con stock', onClear: () => setInStockOnly(false) }
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white pt-24 transition-colors">
            <SEO
                title="Shop Online — La Boutique de la Elegancia"
                description="Explora nuestra colección exclusiva de ropa de mujer. Filtrá por talle, color y precio. Envíos a todo el país."
            />

            {/* Hero */}
            <div className="w-full bg-slate-900 dark:bg-black/40 text-white py-16 md:py-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="relative z-10 animate-fadeIn">
                    <h1 className="text-4xl md:text-6xl font-luxury mb-4 tracking-wider">Colección 2026</h1>
                    <p className="font-serif italic text-lg text-slate-300 max-w-2xl mx-auto">
                        Descubrí la esencia del lujo moderno. Piezas únicas diseñadas para destacar.
                    </p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row gap-8">
                {/* Sidebar desktop */}
                <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 sticky top-32 h-fit">
                    <div>
                        <h3 className="font-luxury text-lg mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
                            Filtros
                        </h3>

                        {/* Buscar */}
                        <label className="relative block mb-6">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar prendas..."
                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-cielo-gold focus:outline-none"
                            />
                        </label>

                        <FilterGroup title="Categoría">
                            <ul className="space-y-2">
                                {categories.map((cat) => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => setCategory(cat)}
                                            className={`text-sm transition-colors ${category === cat ? 'font-bold text-cielo-gold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            {cat === 'all' ? 'Ver Todo' : cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </FilterGroup>

                        {allSizes.length > 0 && (
                            <FilterGroup title="Talle">
                                <div className="flex flex-wrap gap-2">
                                    {allSizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => toggleIn(sizes, s, setSizes)}
                                            className={`px-3 h-9 min-w-[36px] text-xs font-bold border rounded-md transition ${sizes.has(s) ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </FilterGroup>
                        )}

                        {allColors.length > 0 && (
                            <FilterGroup title="Color">
                                <div className="flex flex-wrap gap-2">
                                    {allColors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => toggleIn(colors, c, setColors)}
                                            title={c}
                                            className={`w-7 h-7 rounded-full border transition-all ${colors.has(c) ? 'ring-2 ring-cielo-gold ring-offset-2 dark:ring-offset-[#0B1120] scale-110' : 'border-slate-200 dark:border-slate-700 hover:scale-105'}`}
                                            style={{ backgroundColor: getColorHex(c) }}
                                            aria-label={c}
                                            aria-pressed={colors.has(c)}
                                        />
                                    ))}
                                </div>
                            </FilterGroup>
                        )}

                        <FilterGroup title={`Precio hasta ${formatMoney(priceMax || maxPrice)}`}>
                            <input
                                type="range"
                                min={0}
                                max={maxPrice}
                                step={Math.max(1000, Math.round(maxPrice / 50))}
                                value={priceMax || maxPrice}
                                onChange={(e) => setPriceMax(Number(e.target.value))}
                                className="w-full accent-cielo-gold"
                            />
                        </FilterGroup>

                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                                className="accent-cielo-gold"
                            />
                            <span className="text-sm">Solo con stock</span>
                        </label>

                        <button
                            onClick={clearAll}
                            className="mt-6 text-xs uppercase tracking-widest text-slate-500 hover:text-cielo-gold"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
                        <p className="text-sm font-serif text-slate-500">{filtered.length} Productos</p>

                        <div className="flex gap-3 items-center">
                            <button
                                className="md:hidden flex items-center gap-2 text-sm font-bold uppercase"
                                onClick={() => setIsMobileFilterOpen(true)}
                            >
                                <SlidersHorizontal className="w-4 h-4" /> Filtros
                            </button>

                            <div className="relative">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="appearance-none bg-transparent border border-slate-200 dark:border-slate-700 rounded-md pl-3 pr-8 py-2 text-sm font-bold uppercase tracking-widest hover:border-cielo-gold cursor-pointer"
                                >
                                    <option value="relevant">Más relevantes</option>
                                    <option value="newest">Novedades</option>
                                    <option value="popular">Más vistos</option>
                                    <option value="low-high">Precio: menor a mayor</option>
                                    <option value="high-low">Precio: mayor a menor</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {activeChips.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {activeChips.map((chip, i) => (
                                <button
                                    key={i}
                                    onClick={chip.onClear}
                                    className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs uppercase tracking-widest px-3 py-1.5 rounded-full"
                                >
                                    {chip.label} <X className="w-3 h-3" />
                                </button>
                            ))}
                            <button
                                onClick={clearAll}
                                className="text-xs uppercase tracking-widest text-cielo-gold hover:underline px-2"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    )}

                    {loading && inventory.length === 0 ? (
                        <ProductGridSkeleton count={9} />
                    ) : paged.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10">
                                {paged.map((p, idx) => (
                                    <ProductCard key={p.id} product={p} priority={idx < 3} />
                                ))}
                            </div>
                            {page < totalPages && (
                                <div className="flex justify-center mt-12">
                                    <button
                                        onClick={() => setPage((p) => p + 1)}
                                        className="px-8 py-3 border border-slate-900 dark:border-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors"
                                    >
                                        Ver más
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center">
                            <h3 className="text-xl font-luxury mb-2">No se encontraron productos</h3>
                            <p className="text-slate-500">Probá con otros filtros.</p>
                            <button onClick={clearAll} className="mt-6 text-cielo-gold underline hover:no-underline">
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal mobile */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-[#0B1120] p-6 animate-slideUp overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-luxury">Filtros</h2>
                        <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Cerrar filtros">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <label className="relative block mb-6">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar prendas..."
                            className="w-full pl-9 pr-3 py-3 text-sm rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                        />
                    </label>

                    <FilterGroup title="Categoría">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full border text-sm ${category === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    {cat === 'all' ? 'Todos' : cat}
                                </button>
                            ))}
                        </div>
                    </FilterGroup>

                    {allSizes.length > 0 && (
                        <FilterGroup title="Talle">
                            <div className="flex flex-wrap gap-2">
                                {allSizes.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleIn(sizes, s, setSizes)}
                                        className={`px-3 h-10 min-w-[40px] text-xs font-bold border rounded-md ${sizes.has(s) ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </FilterGroup>
                    )}

                    {allColors.length > 0 && (
                        <FilterGroup title="Color">
                            <div className="flex flex-wrap gap-2">
                                {allColors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => toggleIn(colors, c, setColors)}
                                        title={c}
                                        className={`w-8 h-8 rounded-full border ${colors.has(c) ? 'ring-2 ring-cielo-gold ring-offset-2 dark:ring-offset-[#0B1120]' : 'border-slate-200 dark:border-slate-700'}`}
                                        style={{ backgroundColor: getColorHex(c) }}
                                        aria-label={c}
                                    />
                                ))}
                            </div>
                        </FilterGroup>
                    )}

                    <FilterGroup title={`Precio hasta ${formatMoney(priceMax || maxPrice)}`}>
                        <input
                            type="range"
                            min={0}
                            max={maxPrice}
                            step={Math.max(1000, Math.round(maxPrice / 50))}
                            value={priceMax || maxPrice}
                            onChange={(e) => setPriceMax(Number(e.target.value))}
                            className="w-full accent-cielo-gold"
                        />
                    </FilterGroup>

                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="accent-cielo-gold"
                        />
                        <span className="text-sm">Solo con stock</span>
                    </label>

                    <div className="pt-8 flex gap-2">
                        <button
                            onClick={clearAll}
                            className="flex-1 border border-slate-300 dark:border-slate-700 py-4 font-bold uppercase tracking-widest rounded-xl"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="flex-[2] bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 font-bold uppercase tracking-widest rounded-xl"
                        >
                            Ver {filtered.length} resultados
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const FilterGroup = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{title}</h4>
        {children}
    </div>
);
