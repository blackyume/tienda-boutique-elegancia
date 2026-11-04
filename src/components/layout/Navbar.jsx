import { LogoSVG } from './LogoSVG';
import { AuthModal } from '../auth/AuthModal';
import { User, Menu, ChevronDown, Search, ShieldCheck, ShoppingBag, X, LogOut, Heart, Package, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { optimizeImage } from '../../utils/helpers';
import { tituloDeProducto } from '../../utils/nombres';

export const Navbar = ({ onOpenCart }) => {
    const { cart, categories, user, logout, isAdmin, siteConfig, inventory } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // En el celular la franja no entra en un renglón: va una frase por vez.
    const textoAnuncio = siteConfig.announcement?.text || 'Compra Segura · Envíos a todo el País · Nueva Colección 2027';
    const frasesAnuncio = textoAnuncio.split(/\s*[|·•]\s*/).filter(Boolean);
    const [fraseAnuncio, setFraseAnuncio] = useState(0);
    useEffect(() => {
        if (frasesAnuncio.length < 2) return undefined;
        const id = setInterval(() => setFraseAnuncio((i) => i + 1), 4000);
        return () => clearInterval(id);
    }, [frasesAnuncio.length]);

    // Search State
    const [search, setSearch] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef(null);

    const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';

    // Scroll Effect for Floating Pill
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Sugerencias: top-6 productos que matchean el query
    const suggestions = (() => {
        const q = search.trim().toLowerCase();
        if (q.length < 2 || !Array.isArray(inventory)) return [];
        return inventory
            .filter(p => p.active !== false)
            .filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            )
            .slice(0, 6);
    })();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
            setIsMobileMenuOpen(false);
            setIsSearchOpen(false);
            setSearch("");
        }
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setSearch("");
        }
    };

    const goToProduct = (id) => {
        navigate(`/product/${id}`);
        setIsSearchOpen(false);
        setSearch("");
        setIsMobileMenuOpen(false);
    };

    const toggleSearch = () => {
        if (isSearchOpen && !search) {
            setIsSearchOpen(false);
        } else {
            setIsSearchOpen(true);
        }
    };

    // Categorías del menú con su foto: la propia o, si no tiene, la de una
    // prenda de esa categoría (mismo criterio que las fichas de la home).
    const categoriasMenu = useMemo(() => (categories || [])
        .filter(c => c && c.name)
        .map(c => {
            if (c.image) return c;
            const prod = (inventory || []).find(p =>
                p.active !== false &&
                (p.category || '').toLowerCase() === c.name.toLowerCase() &&
                (p.image || p.media?.[0]?.url)
            );
            return { ...c, image: prod ? (prod.image || prod.media?.[0]?.url) : null };
        }), [categories, inventory]);
    const fotosMenu = categoriasMenu.filter(c => c.image).slice(0, 3);

    // Shop lee la categoría del parámetro ?category= de la URL. Antes esto
    // escribía un estado global que no leía nadie y mandaba a la home a buscar
    // un #shop que no existe, así que elegir una categoría no filtraba nada.
    const handleCategoryClick = (catName) => {
        const esTodo = !catName || catName === 'Todos';
        navigate(esTodo ? '/shop' : `/shop?category=${encodeURIComponent(catName)}`);
        setIsMobileMenuOpen(false);
        setIsShopMenuOpen(false);
    };

    return (
        <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* ANNOUNCEMENT BANNER — barra dorada premium */}
            {(siteConfig.announcement?.enabled) && (
                <div className={`fixed top-0 left-0 right-0 z-[55] overflow-hidden transition-transform duration-500 ${scrolled ? '-translate-y-full' : 'translate-y-0'}`}>
                    <div
                        className="relative py-2 text-center"
                        style={{ background: 'linear-gradient(90deg, #9A781D, #BF953F 16%, #FBF1B0 50%, #BF953F 84%, #9A781D)' }}
                    >
                        {/* brillo que recorre */}
                        <div className="banner-shine pointer-events-none absolute inset-0 opacity-70" />
                        {/* línea de luz superior */}
                        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-white/40" />
                        <p className="relative flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#211705]">
                            <span className="text-[#5c4410]/60 text-[8px]">◆</span>
                            <span className="hidden md:inline drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]">
                                {textoAnuncio}
                            </span>
                            <span key={fraseAnuncio} className="md:hidden whitespace-nowrap animate-fadeIn drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]">
                                {frasesAnuncio[fraseAnuncio % frasesAnuncio.length]}
                            </span>
                            <span className="text-[#5c4410]/60 text-[8px]">◆</span>
                        </p>
                    </div>
                </div>
            )}

            {/* NAV COMPONENT */}
            <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${scrolled ? 'pt-4' : 'pt-10'}`}>
                <div className={`
                    relative flex items-center justify-between px-8 transition-all duration-500
                    ${scrolled
                        ? 'w-[90%] md:w-[85%] lg:w-[1100px] xl:w-[1180px] h-14 rounded-full bg-slate-900/60 dark:bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                        : 'w-full h-20 px-10 lg:px-14 bg-gradient-to-b from-black/80 to-transparent border-none'
                    }
                `}>
                    {/* LEFT: hamburguesa (mobile) + navegación (desktop) */}
                    <div className="flex items-center gap-6 z-10">
                        <button aria-label="Abrir menú" className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden md:flex items-center gap-9 text-[11px] font-medium uppercase tracking-[0.24em]">
                            <button
                                onMouseEnter={() => setIsShopMenuOpen(true)}
                                onMouseLeave={() => setIsShopMenuOpen(false)}
                                onClick={() => setIsShopMenuOpen(v => !v)}
                                aria-expanded={isShopMenuOpen}
                                className={`flex items-center gap-1.5 py-4 uppercase tracking-[0.24em] font-medium transition-colors ${isShopMenuOpen ? 'text-cielo-gold' : 'text-white hover:text-cielo-gold'}`}
                            >
                                Tienda <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isShopMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <Link to="/shop?sort=newest" className="hidden lg:inline text-white hover:text-cielo-gold transition-colors">Novedades</Link>
                        </div>

                        {/* MENÚ DE LA TIENDA — panel a lo ancho de la barra (pedido del dueño,
                            1/11/2026: la columna angosta dejaba vacío todo el espacio de arriba).
                            Va fuera del botón para tomar el ancho de la barra; el pt-2 es el
                            puente para que no se cierre al bajar el mouse. Las fotos van en 2:3,
                            igual que las fotos de modelo: se ven enteras, sin recorte. */}
                        <div
                            onMouseEnter={() => setIsShopMenuOpen(true)}
                            onMouseLeave={() => setIsShopMenuOpen(false)}
                            className={`hidden md:block absolute top-full inset-x-0 pt-2 transition-all duration-300 ${isShopMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
                        >
                            <div className={`bg-noche-900 border-cielo-gold/15 shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${scrolled ? 'border rounded-3xl' : 'border-y'}`}>
                                <div className="max-w-6xl mx-auto px-10 py-9 grid grid-cols-[minmax(0,1fr)_auto] gap-14">
                                    <div>
                                        <p className="text-2xs uppercase tracking-[0.4em] font-medium text-cielo-gold/90 mb-6">Categorías</p>
                                        <ul className="grid grid-cols-2 gap-x-10 gap-y-3">
                                            {categoriasMenu.map(cat => (
                                                <li key={cat.id}>
                                                    <button onClick={() => handleCategoryClick(cat.name)} className="group/cat flex items-center gap-3 font-serif text-lg lg:text-xl text-noche-100 hover:text-cielo-gold transition-colors text-left">
                                                        <span className="h-px w-0 bg-cielo-gold transition-all duration-300 group-hover/cat:w-5" />
                                                        {tituloDeProducto(cat.name)}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-9 font-cinzel text-2xs uppercase tracking-[0.3em]">
                                            <button onClick={() => handleCategoryClick('Todos')} className="text-white border-b border-cielo-gold/40 pb-1.5 hover:border-cielo-gold transition-colors">Ver todo</button>
                                            <button onClick={() => { navigate('/shop?sort=newest'); setIsShopMenuOpen(false); }} className="text-noche-300 hover:text-white transition-colors">Novedades</button>
                                        </div>
                                    </div>
                                    {fotosMenu.length > 0 && (
                                        <div className="flex gap-4">
                                            {fotosMenu.map(cat => (
                                                <button key={cat.id} onClick={() => handleCategoryClick(cat.name)} className="group/foto w-32 lg:w-40 text-left">
                                                    <div className="aspect-[2/3] overflow-hidden bg-noche-850">
                                                        <img src={optimizeImage(cat.image, 400)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90 transition-opacity duration-500 group-hover/foto:opacity-100" />
                                                    </div>
                                                    <span className="block mt-3 font-serif italic text-sm text-noche-100 transition-colors group-hover/foto:text-cielo-gold">{tituloDeProducto(cat.name)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: LOGO (centrado, layout de lujo) */}
                    <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group flex items-center justify-center">
                        {/* Sin estrellitas alrededor (pedido del dueño, 1/11/2026: más fino).
                            El brillo pasa una sola vez al entrar (LogoSVG) y el rombo respira. */}
                        <div className="absolute inset-0 bg-cielo-gold/15 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* En el celular el logo va más chico: a 200px pisaba el ícono de la cuenta. */}
                        {/* Al bajar se achica con una escala animada; cambiar el ancho del SVG
                            lo hacía de golpe. */}
                        <LogoSVG to="/" width={240} className={`max-w-[30vw] sm:max-w-none [&>svg]:max-w-full [&>svg]:h-auto transition-transform duration-500 ease-out ${scrolled ? 'scale-75' : 'scale-100'}`} />
                    </Link>


                    {/* ICONS (RIGHT) — con «Nuestra historia» delante, así la barra queda
                        pareja: dos textos a cada lado del logo. */}
                    <div className="flex items-center gap-4 pr-2">
                        <Link to="/about" className="hidden lg:block mr-5 text-[11px] font-medium uppercase tracking-[0.24em] text-white hover:text-cielo-gold transition-colors">Nuestra historia</Link>
                        {/* SEARCH (EXPANDING + AUTOCOMPLETE) */}
                        <div className="hidden md:block relative">
                            <div className={`flex items-center transition-all duration-300 ease-out border border-transparent ${isSearchOpen ? 'w-56 bg-white/10 px-3 py-1.5 rounded-full border-white/10' : 'w-8 bg-transparent'}`}>
                                <button onClick={toggleSearch} className="text-white hover:text-cielo-gold cursor-pointer transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <input
                                    ref={searchInputRef}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearch}
                                    onBlur={() => setTimeout(() => { if (!search) setIsSearchOpen(false); }, 150)}
                                    placeholder="BUSCAR..."
                                    className={`bg-transparent border-none outline-none text-[10px] uppercase font-bold tracking-wider text-white placeholder-slate-400 ml-2 w-full transition-opacity duration-200 ${isSearchOpen ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}`}
                                />
                            </div>
                            {isSearchOpen && suggestions.length > 0 && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-[#11100D]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-40">
                                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">
                                        Sugerencias
                                    </div>
                                    <ul className="max-h-80 overflow-y-auto">
                                        {suggestions.map(p => (
                                            <li key={p.id}>
                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); goToProduct(p.id); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden shrink-0">
                                                        {p.image && <img src={p.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{p.category}</p>
                                                    </div>
                                                    <span className="text-xs text-cielo-gold font-bold shrink-0">
                                                        {typeof p.price === 'number' ? `$${p.price.toLocaleString('es-AR')}` : ''}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
                                            setIsSearchOpen(false);
                                            setSearch("");
                                        }}
                                        className="w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-cielo-gold hover:bg-white/5 border-t border-white/5 transition-colors"
                                    >
                                        Ver todos los resultados →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* USER */}
                        <div className="relative group h-full flex items-center" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
                            <button onClick={() => !user && setIsAuthModalOpen(true)} className="p-2 text-white hover:text-cielo-gold transition-colors rounded-full hover:bg-white/5 relative z-10">
                                <User className="w-5 h-5" />
                            </button>
                            {/* USER DROPDOWN - WITH INVISIBLE BRIDGE */}
                            {user && (
                                <div className={`absolute top-full right-0 pt-4 w-60 transform transition-all duration-300 origin-top-right z-20 ${isUserMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                                    <div className="bg-[#11100D]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                                            <p className="text-xs font-bold text-white truncate font-cinzel">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <p className="text-[9px] text-cielo-gold uppercase tracking-wider">{isAdmin ? 'Administrador' : 'Cliente'}</p>
                                            </div>
                                        </div>
                                        <div className="p-1.5 space-y-0.5">
                                            {isAdmin && (
                                                <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-cielo-gold hover:text-black rounded-xl transition-all flex items-center gap-3 group/item">
                                                    <ShieldCheck className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                                                    Panel Admin
                                                </Link>
                                            )}
                                            <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-3">
                                                <Package className="w-4 h-4" />
                                                Mis Pedidos
                                            </Link>
                                            <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)} className="block text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-3 md:hidden">
                                                <Heart className="w-4 h-4" />
                                                Wishlist
                                            </Link>
                                            <button onClick={logout} className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all flex items-center gap-3">
                                                <LogOut className="w-4 h-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* WISHLIST (Desktop) */}
                        <Link to="/wishlist" className="hidden md:block p-2 text-white hover:text-cielo-gold transition-colors rounded-full hover:bg-white/5 relative group">
                            <Heart className="w-5 h-5" />
                        </Link>

                        {/* CART (MODERN) */}
                        <button onClick={onOpenCart} className="relative p-2 text-white hover:text-cielo-gold transition-colors magnetic-btn group">
                            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {cart.length > 0 && (
                                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-cielo-gold text-black text-[9px] font-bold rounded-full flex items-center justify-center shadow-md border border-[#11100D] animate-bounce-slow leading-none pt-[1px]">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ MOBILE (pantalla completa)
                Va con scroll propio y alineado arriba: con 8 categorías el
                contenido pasa el alto de un teléfono y antes, al estar centrado
                y sin overflow, se comía el título y los links del pie quedaban
                fuera de la pantalla sin manera de llegar. */}
            <div className={`fixed inset-0 z-[60] bg-[#11100D]/95 backdrop-blur-2xl transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'}`}>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Cerrar menú"
                    className="fixed top-5 right-5 z-[61] p-3 text-white bg-black/40 rounded-full backdrop-blur-sm hover:rotate-90 transition-transform duration-500"
                >
                    <X className="w-7 h-7" />
                </button>

                <div className="h-full overflow-y-auto overscroll-contain">
                    <div className="min-h-full flex flex-col items-center justify-center gap-6 px-6 py-20">
                        <h2 className="text-2xl font-cinzel text-cielo-gold">MENÚ</h2>

                        {/* BUSCADOR MOBILE */}
                        <form
                            onSubmit={(e) => { e.preventDefault(); const q = search.trim(); if (q) { navigate(`/shop?q=${encodeURIComponent(q)}`); setIsMobileMenuOpen(false); setSearch(''); } }}
                            className="w-full max-w-xs"
                        >
                            <div className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-3 bg-white/5 focus-within:border-cielo-gold/50 transition-colors">
                                <Search className="w-4 h-4 text-white/40 shrink-0" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar prendas..."
                                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-white placeholder-white/30"
                                />
                                <button type="submit" className="text-cielo-gold shrink-0 hover:scale-110 transition-transform" aria-label="Buscar"><ArrowRight className="w-5 h-5" /></button>
                            </div>
                        </form>

                        <button
                            onClick={() => handleCategoryClick('Todos')}
                            className="text-[11px] uppercase tracking-[0.3em] font-bold text-cielo-gold hover:text-white transition-colors"
                        >
                            Ver todo el shop
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="text-xl font-serif text-white hover:text-cielo-gold transition-colors duration-300 text-center leading-tight"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="w-16 h-px bg-white/20" />

                        {/* Accesos de cuenta: en el teléfono el desplegable del
                            usuario depende del hover, así que sin esto no había
                            forma de llegar a pedidos ni a favoritos. */}
                        <div className="flex items-center justify-center gap-6 text-[11px] uppercase tracking-widest text-white/80">
                            {user ? (
                                <>
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 hover:text-cielo-gold transition-colors">
                                        <Package className="w-5 h-5" /> Pedidos
                                    </Link>
                                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 hover:text-cielo-gold transition-colors">
                                        <Heart className="w-5 h-5" /> Favoritos
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 hover:text-cielo-gold transition-colors">
                                            <ShieldCheck className="w-5 h-5" /> Admin
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                                        className="flex flex-col items-center gap-1.5 hover:text-cielo-gold transition-colors"
                                    >
                                        <User className="w-5 h-5" /> Mi cuenta
                                    </button>
                                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1.5 hover:text-cielo-gold transition-colors">
                                        <Heart className="w-5 h-5" /> Favoritos
                                    </Link>
                                </>
                            )}
                        </div>

                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-white/80 hover:text-cielo-gold transition-colors">Nuestra historia</Link>
                        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs uppercase tracking-widest text-slate-400">
                            <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-cielo-gold transition-colors">Preguntas</Link>
                            <Link to="/envios" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-cielo-gold transition-colors">Envíos</Link>
                            <Link to="/tracking" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-cielo-gold transition-colors">Seguimiento</Link>
                            <Link to="/contacto" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-cielo-gold transition-colors">Contacto</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};