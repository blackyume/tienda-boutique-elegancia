import { AuthModal } from '../auth/AuthModal';
import { User, Menu, ChevronDown, Search, ShieldCheck, ShoppingBag, X, LogOut, ShoppingBasket, Truck, Lock, Star, Sun, Moon, Heart, Package } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useState, useEffect, useRef } from 'react';

export const Navbar = ({ onOpenCart }) => {
    const { cart, toggleTheme, theme, categories, setGlobalFilter, user, logout, isAdmin, siteConfig } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setGlobalFilter({ category: "Todos", search: search });
            navigate('/');
            setIsMobileMenuOpen(false);
            setIsSearchOpen(false);
        }
    };

    const toggleSearch = () => {
        if (isSearchOpen && !search) {
            setIsSearchOpen(false);
        } else {
            setIsSearchOpen(true);
        }
    };

    const handleCategoryClick = (catName) => {
        setGlobalFilter({ category: catName, search: "" });
        navigate('/');
        setIsMobileMenuOpen(false);
        setIsShopMenuOpen(false);
        setTimeout(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
        <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* ANNOUNCEMENT BANNER */}
            {(siteConfig.announcement?.enabled) && (
                <div className={`fixed top-0 left-0 right-0 z-[55] bg-[#0B1120] text-cielo-gold text-[10px] font-bold tracking-[0.2em] uppercase py-2 text-center transition-transform duration-500 overflow-hidden ${scrolled ? '-translate-y-full' : 'translate-y-0'}`}>
                    <div className="flex items-center justify-center gap-8 animate-pulse-slow">
                        {siteConfig.announcement.text || "Compra Segura | Envíos a todo el País"}
                    </div>
                </div>
            )}

            {/* NAV COMPONENT */}
            <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${scrolled ? 'pt-4' : 'pt-12'}`}>
                <div className={`
                    relative flex items-center justify-between px-8 transition-all duration-500
                    ${scrolled
                        ? 'w-[90%] md:w-[85%] lg:w-[1000px] h-14 rounded-full bg-slate-900/60 dark:bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                        : 'w-full h-24 bg-gradient-to-b from-black/80 to-transparent border-none'
                    }
                `}>
                    {/* MOBILE MENU TRIGGER */}
                    <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* LEFT SECTION: Logo Mark + Nav */}
                    <div className="flex items-center gap-8">
                        {/* LBE Monogram - CSS Text Version */}
                        <Link to="/" className="relative group flex items-center justify-center">
                            <div className="absolute inset-0 bg-cielo-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Sparkles Container - Always On (Subtle) */}
                            <div className="absolute inset-0 pointer-events-none">
                                <svg className="absolute top-4 right-4 w-2.5 h-2.5 text-white animate-sparkle-subtle" style={{ animationDelay: '0ms' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                                <svg className="absolute top-5 left-5 w-2 h-2 text-cielo-gold animate-sparkle-subtle" style={{ animationDelay: '500ms' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                                <svg className="absolute bottom-5 right-6 w-1.5 h-1.5 text-white/80 animate-sparkle-subtle" style={{ animationDelay: '1000ms' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                                <svg className="absolute bottom-4 left-5 w-2 h-2 text-cielo-gold animate-sparkle-subtle" style={{ animationDelay: '1500ms' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                                <svg className="absolute top-1/2 right-4 w-1.5 h-1.5 text-cielo-gold/60 animate-sparkle-subtle" style={{ animationDelay: '2000ms' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                            </div>

                            {/* Sparkles Container - Hover Burst (Explosion) */}
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="absolute top-4 right-5 w-3 h-3 text-cielo-gold group-hover:animate-sparkle-burst" style={{ animationDelay: '0ms' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                </svg>
                                <svg className="absolute bottom-4 left-4 w-3 h-3 text-white group-hover:animate-sparkle-burst" style={{ animationDelay: '100ms' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                </svg>
                                <svg className="absolute top-1/2 right-5 w-2 h-2 text-cielo-gold/80 group-hover:animate-sparkle-burst" style={{ animationDelay: '200ms' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                </svg>
                                <svg className="absolute top-4 left-1/2 w-2 h-2 text-white/80 group-hover:animate-sparkle-burst" style={{ animationDelay: '300ms' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                </svg>
                            </div>

                            <img src="/assets/logo-main.png?v=4" alt="LBE Logo" className={`w-24 h-auto transition-all duration-500 group-hover:scale-105 ${scrolled ? 'w-20' : 'w-28'}`} />
                        </Link>

                        {/* NAV LINKS (Desktop) */}
                        <div className={`hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-90'}`}>
                            <div className="relative group" onMouseEnter={() => setIsShopMenuOpen(true)} onMouseLeave={() => setIsShopMenuOpen(false)}>
                                <button className="flex items-center gap-1 text-white hover:text-cielo-gold transition-colors py-4">
                                    Shop <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                                </button>

                                {/* MEGA MENU */}
                                <div className={`absolute top-full left-0 mt-2 min-w-[200px] bg-[#0B1120]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300 origin-top-left ${isShopMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <button onClick={() => handleCategoryClick("Todos")} className="text-left py-2 px-3 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">Ver Todo</button>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => handleCategoryClick(cat.name)} className="text-left py-2 px-3 text-xs text-slate-300 hover:text-cielo-gold hover:bg-white/5 rounded-lg transition-all flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-cielo-gold opacity-0 group-hover:opacity-100"></div>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Link to="/about" className="text-white hover:text-cielo-gold transition-colors">La Empresa</Link>
                        </div>
                    </div>

                    {/* CENTER: WORDMARK TITLE */}
                    <Link to="/" onClick={() => handleCategoryClick("Todos")} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group text-center z-10">
                        <h1 className={`font-cinzel font-bold tracking-widest text-cielo-gold/90 transition-all duration-500 whitespace-nowrap ${scrolled ? 'text-lg' : 'text-2xl lg:text-3xl text-shadow-sm'}`}>
                            LA BOUTIQUE
                        </h1>
                        <span className={`block font-serif italic text-white/60 transition-all duration-500 ${scrolled ? 'text-[8px] tracking-widest' : 'text-[10px] tracking-[0.3em]'} mt-0.5`}>
                            de la Elegancia
                        </span>
                    </Link>

                    {/* ICONS (RIGHT) */}
                    <div className="flex items-center gap-4 pr-2">
                        {/* SEARCH (EXPANDING) */}
                        <div className={`hidden md:flex items-center transition-all duration-300 ease-out border border-transparent ${isSearchOpen ? 'w-48 bg-white/10 px-3 py-1.5 rounded-full border-white/10' : 'w-8 bg-transparent'}`}>
                            <button onClick={toggleSearch} className="text-white hover:text-cielo-gold cursor-pointer transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                            <input
                                ref={searchInputRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                onBlur={() => !search && setIsSearchOpen(false)}
                                placeholder="BUSCAR..."
                                className={`bg-transparent border-none outline-none text-[10px] uppercase font-bold tracking-wider text-white placeholder-slate-400 ml-2 w-full transition-opacity duration-200 ${isSearchOpen ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}`}
                            />
                        </div>

                        {/* THEME TOGGLE */}
                        <button onClick={toggleTheme} className="hidden md:block p-2 text-white hover:text-cielo-gold transition-colors rounded-full hover:bg-white/5">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* USER */}
                        <div className="relative group h-full flex items-center" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
                            <button onClick={() => !user && setIsAuthModalOpen(true)} className="p-2 text-white hover:text-cielo-gold transition-colors rounded-full hover:bg-white/5 relative z-10">
                                <User className="w-5 h-5" />
                            </button>
                            {/* USER DROPDOWN - WITH INVISIBLE BRIDGE */}
                            {user && (
                                <div className={`absolute top-full right-0 pt-4 w-60 transform transition-all duration-300 origin-top-right z-20 ${isUserMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                                    <div className="bg-[#0B1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
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
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-cielo-gold text-black text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(193,154,107,0.5)] animate-bounce border border-[#0B1120]">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU (Full Screen Glass) */}
            <div className={`fixed inset-0 z-[60] bg-[#0B1120]/95 backdrop-blur-2xl transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-4 text-white hover:rotate-90 transition-transform duration-500"><X className="w-8 h-8" /></button>
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    <h2 className="text-3xl font-cinzel text-cielo-gold mb-8">MENÚ</h2>
                    {categories.map((cat, i) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.name)}
                            className="text-2xl font-serif text-white hover:text-cielo-gold hover:scale-110 transition-all duration-300"
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {cat.name}
                        </button>
                    ))}
                    <div className="w-16 h-px bg-white/20 my-4"></div>
                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg uppercase tracking-widest text-slate-400">La Empresa</Link>

                    <button onClick={toggleTheme} className="flex items-center gap-2 text-slate-500 mt-4">
                        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        <span className="text-sm uppercase tracking-widest">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                </div>
            </div>
        </>
    );
};