import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { formatMoney } from '../utils/helpers';
import {
    LayoutDashboard, Package, Tag, LogOut, Edit2, Trash2, X,
    TrendingUp, DollarSign, Calculator, Search, Users,
    Image as ImageIcon, UploadCloud, Monitor, Link as LinkIcon,
    Eye, EyeOff, ChevronDown, ChevronUp, Wallet, Filter, SlidersHorizontal, ArrowUpDown,
    Check as CheckIcon, Lock, Settings, Blocks, Clock, Bot, Ticket, Building2
} from 'lucide-react';
// import { CostCalculator } from '../components/admin/CostCalculator'; // REMOVE LEGACY
import { SimulationsView } from '../components/admin/SimulationsView';
import { IntegrationsView } from '../components/admin/IntegrationsView';
import { CMSView } from '../components/admin/CMSView';
import { ShippingSettings } from '../components/admin/ShippingSettings';
import { StatusSelector } from '../components/admin/StatusSelector';
import { DashboardView } from '../components/admin/DashboardView';
import { SettingsView } from '../components/admin/SettingsView';
import { OrdersView } from '../components/admin/OrdersView';
import { CustomersView } from '../components/admin/CustomersView';
import { AdminAssistantView } from '../components/admin/AdminAssistantView';
import { CouponsView } from '../components/admin/CouponsView';

import { SalesView } from '../components/admin/SalesView';
import { SuppliersView } from '../components/admin/SuppliersView';

const COLOR_MAP = {
    'blanco': '#ffffff', 'negro': '#000000', 'gris': '#808080', 'gris claro': '#d3d3d3', 'gris oscuro': '#a9a9a9', 'plata': '#c0c0c0', 'humo': '#848884', 'carbon': '#36454f', 'blanco tiza': '#f5f5f5', 'hueso': '#e3dac9', 'marfil': '#fffff0', 'crema': '#fffdd0', 'vainilla': '#f3e5ab', 'nude': '#f5d0b5', 'piel': '#f5d0b5', 'natural': '#faebd7', 'champagne': '#fad6a5', 'vison': '#9e9e9e', 'taupe': '#483c32', 'camel': '#c19a6b', 'beige': '#f5f5dc', 'arena': '#f4a460', 'crudo': '#dbd7d2', 'tiza': '#f5f5f5',

    // Rojos / Rosas / Naranjas
    'rojo': '#ff0000', 'bordo': '#800000', 'bordó': '#800000', 'vino': '#722f37', 'terracota': '#e2725b', 'ladrillo': '#b22222', 'cereza': '#de3163', 'carmesi': '#dc143c', 'granate': '#800000', 'rubi': '#e0115f', 'coral': '#ff7f50', 'salmon': '#fa8072', 'durazno': '#ffe5b4', 'naranja': '#ffa500', 'calabaza': '#ff7518', 'oxido': '#b7410e', 'mandarina': '#f28500',
    'rosa': '#ffc0cb', 'rosa viejo': '#eed0d6', 'rosa pastel': '#ffd1dc', 'rosa chicle': '#ff69b4', 'chicle': '#ff69b4', 'fucsia': '#ff00ff', 'magenta': '#ff00ff', 'frambuesa': '#e30b5d', 'uva': '#6f2da8', 'ciclamen': '#ff00ff',

    // Azules / Celestes / Turquesas
    'azul': '#0000ff', 'azul marino': '#000080', 'marino': '#000080', 'azul francia': '#318ce7', 'azul electrico': '#7df9ff', 'azul noche': '#191970', 'petroleo': '#005f6b', 'azul acero': '#4682b4', 'cobalto': '#0047ab', 'indigo': '#4b0082', 'ultramar': '#120a8f', 'jean': '#5d76cb',
    'celeste': '#87ceeb', 'celeste pastel': '#b0e0e6', 'cielo': '#87ceeb', 'turquesa': '#40e0d0', 'aqua': '#00ffff', 'cian': '#00ffff', 'aguamarina': '#7fffd4', 'menta': '#98ff98', 'petroleo claro': '#5f9ea0',

    // Verdes
    'verde': '#008000', 'verde oscuro': '#006400', 'verde militar': '#4b5320', 'militar': '#4b5320', 'oliva': '#808000', 'musgo': '#8a9a5b', 'seco': '#8a9a5b', 'verde botella': '#006a4e', 'botella': '#006a4e', 'esmeralda': '#50c878', 'verde agua': '#20b2aa', 'verde manzana': '#8db600', 'manzana': '#8db600', 'lima': '#32cd32', 'verde lima': '#32cd32', 'pistacho': '#93c572', 'jade': '#00a86b', 'benetton': '#00994e', 'fluor': '#ccff00', 'neon': '#39ff14', 'palta': '#568203',

    // Amarillos / Dorados
    'amarillo': '#ffff00', 'amarillo patito': '#fcf655', 'mostaza': '#ffdb58', 'maiz': '#fbec5d', 'limon': '#fff700', 'dorado': '#ffd700', 'oro': '#ffd700', 'ambar': '#ffbf00',

    // Marrones / Tierras / Maderas
    'marron': '#8b4513', 'chocolate': '#d2691e', 'cafe': '#6f4e37', 'tierra': '#a0522d', 'suela': '#b87333', 'moka': '#4e3629', 'tabaco': '#6f4c3e', 'canela': '#d2691e', 'cobre': '#b87333', 'bronce': '#cd7f32', 'roble': '#4d372d',

    // Violetas / Lilas
    'violeta': '#ee82ee', 'purpura': '#800080', 'lila': '#c8a2c8', 'morado': '#a020f0', 'lavanda': '#e6e6fa', 'ciruela': '#8e4585', 'berenjena': '#614051', 'obispo': '#663399',

    // Estampados / Especiales (Simulados)
    'multicolor': 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
    'estampado': 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)',
    'animal print': 'repeating-radial-gradient(#8b4513, #f5deb3 5px, #8b4513 10px)',
    'floreado': 'radial-gradient(circle, #ff69b4 20%, #00ff00 20%, #fff 50%)',
    'rayado': 'repeating-linear-gradient(90deg, #000, #000 5px, #fff 5px, #fff 10px)'
};
const getColorHex = (name) => COLOR_MAP[name.toLowerCase()] || '#cbd5e1';

export const Admin = () => {

    const { isAdmin, user, login, logout, orders, updateOrderStatus, inventory, addProduct, updateProduct, deleteProduct, addToast, categories, addCategory, deleteCategory, siteImages, updateSiteImages, migrateData, uploadImage, isMaintenance, visitCount, toggleMaintenance, updateSystemVersion, cleanStorage, siteConfig, updateSiteConfig, wishlistEvents } = useStore();
    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [adminTab, setAdminTab] = useState("dashboard");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [tempColor, setTempColor] = useState("");
    const [tempSize, setTempSize] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // --- FILTERS & SEARCH STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [sortOrder, setSortOrder] = useState("newest"); // newest, price-asc, price-desc, stock-asc, stock-desc

    const [expandedRow, setExpandedRow] = useState(null);

    // CMS & Calc State
    const [calcEnvioTotal, setCalcEnvioTotal] = useState('');
    const [calcEnvioCant, setCalcEnvioCant] = useState('');
    const [targetMargin, setTargetMargin] = useState("");
    const [targetProfit, setTargetProfit] = useState("");

    // --- PUSH NOTIFICATIONS FOR NEW ORDERS ---
    const [lastOrderCount, setLastOrderCount] = useState(orders.length);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                setNotificationsEnabled(true);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    setNotificationsEnabled(permission === 'granted');
                });
            }
        }
    }, []);

    // Notify when new order arrives
    useEffect(() => {
        if (orders.length > lastOrderCount && lastOrderCount > 0) {
            const newOrder = orders[0]; // Most recent order

            // Show browser notification
            if (notificationsEnabled && 'Notification' in window) {
                new Notification('🛒 ¡Nuevo Pedido!', {
                    body: `${newOrder.customer?.name || 'Cliente'} - ${formatMoney(newOrder.total)}`,
                    icon: '/icons/icon-192x192.png',
                    tag: 'new-order',
                    requireInteraction: true
                });
            }

            // Show toast
            addToast(`¡Nuevo pedido de ${newOrder.customer?.name || 'Cliente'}!`, 'success');

            // Play sound (optional)
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Dg4N/fYOHioqIhH97AAA=');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) { }
        }
        setLastOrderCount(orders.length);
    }, [orders.length]);

    // --- FILTER LOGIC ---
    const filteredInventory = useMemo(() => {
        let result = inventory.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
            const matchesStock = filterLowStock ? p.stock < 5 : true;
            return matchesSearch && matchesCategory && matchesStock;
        });

        return result.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'stock-asc': return a.stock - b.stock;
                case 'stock-desc': return b.stock - a.stock;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'newest': default: return b.id - a.id;
            }
        });
    }, [inventory, searchTerm, selectedCategory, filterLowStock, sortOrder]);

    // --- METRICAS ---
    const metrics = useMemo(() => {
        return inventory.reduce((acc, p) => {
            const cost = (Number(p.cost) || 0) + (Number(p.shippingCost) || 0) + (Number(p.packagingCost) || 0);
            const price = Number(p.price) || 0;
            const stock = Number(p.stock) || 0;
            const feePercent = Number(p.feePercent) || 0;

            const profit = price - cost - (price * (feePercent / 100));

            acc.invested += cost * stock;
            acc.potentialProfit += profit * stock;
            acc.totalStock += stock;
            acc.totalValue += price * stock;
            return acc;
        }, { invested: 0, potentialProfit: 0, totalStock: 0, totalValue: 0 });
    }, [inventory]);

    const salesMetrics = orders.reduce((acc, o) => { acc.totalRevenue += o.total; acc.count += 1; return acc; }, { totalRevenue: 0, count: 0 });

    const salesLog = useMemo(() => orders.flatMap(order => order.items.map(item => {
        const product = inventory.find(p => p.id === item.id) || item;
        const cost = (Number(product.cost) || 0) + (Number(product.shippingCost) || 0) + (Number(product.packagingCost) || 0);
        const fee = item.price * ((Number(product.feePercent) || 0) / 100);
        const profit = item.price - cost - fee;
        return {
            date: order.date,
            orderId: order.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            profit: profit * item.quantity,
            image: item.image
        };
    })).reverse(), [orders, inventory]);

    useEffect(() => {
        if (isProductModalOpen && currentProduct) {
            setCalcEnvioTotal('');
            setCalcEnvioCant('');
            setTargetMargin("");
            setTargetProfit("");
        }
    }, [isProductModalOpen]);

    // --- MEDIA HANDLERS ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Previsualización Local Inmediata
        const tempId = Date.now();
        const localPreview = URL.createObjectURL(file);

        // Agregar item temporal
        const tempMediaItem = { type: 'image', url: localPreview, isUploading: true, tempId };

        setCurrentProduct(prev => ({
            ...prev,
            media: [...(prev.media || []), tempMediaItem]
        }));

        addToast("Subiendo imagen...", "info");

        try {
            const url = await uploadImage(file);

            if (url) {
                // ÉXITO: Reemplazar item temporal con URL real
                setCurrentProduct(curr => {
                    const updatedMedia = (curr.media || []).map(item =>
                        item.tempId === tempId ? { type: 'image', url: url } : item
                    );
                    return {
                        ...curr,
                        media: updatedMedia,
                        image: updatedMedia.find(m => m.type === 'image')?.url || ''
                    };
                });
                addToast("Imagen subida correctamente", "success");
            } else {
                // FALLO (uploadImage devolvió null): Marcar como error
                console.warn("Upload returned null");
                setCurrentProduct(curr => ({
                    ...curr,
                    media: (curr.media || []).map(item =>
                        item.tempId === tempId ? { ...item, isUploading: false, status: 'error', errorMessage: "Respuesta vacía del servidor" } : item
                    )
                }));
                addToast("Error al subir imagen (Null)", "error");
            }
        } catch (error) {
            console.error("Error en handleImageUpload:", error);
            const msg = error.message || "Error de conexión";
            addToast("Error al subir: " + msg, "error");

            // Marcar item con error
            setCurrentProduct(curr => ({
                ...curr,
                media: (curr.media || []).map(item =>
                    item.tempId === tempId ? { ...item, isUploading: false, status: 'error', errorMessage: msg } : item
                )
            }));
        }
    };

    const handleAddVideo = (url) => {
        if (!url.trim()) return;
        const newMedia = [...(currentProduct.media || []), { type: 'video', url }];
        setCurrentProduct({ ...currentProduct, media: newMedia });
        addToast("Video agregado", "success");
    };

    const removeMedia = (index) => {
        const newMedia = [...(currentProduct.media || [])];
        newMedia.splice(index, 1);
        setCurrentProduct({
            ...currentProduct,
            media: newMedia,
            image: newMedia.find(m => m.type === 'image')?.url || ''
        });
    };

    // --- HANDLERS ---
    const handleSaveProduct = async () => {
        if (!currentProduct.name) return addToast("Falta el nombre del producto", "error");
        if (!currentProduct.price || Number(currentProduct.price) <= 0) return addToast("El precio debe ser mayor a 0", "error");

        setIsSaving(true);
        const productToSave = {
            ...currentProduct,
            price: Number(currentProduct.price),
            stock: Number(currentProduct.stock),
            cost: Number(currentProduct.cost || 0),
            shippingCost: Number(currentProduct.shippingCost || 0),
            packagingCost: Number(currentProduct.packagingCost || 0),
            feePercent: Number(currentProduct.feePercent || 0),
            fixedFee: Number(currentProduct.fixedFee || 0),
            active: currentProduct.active !== undefined ? currentProduct.active : true
        };

        try {
            if (productToSave.id && inventory.find(p => p.id === productToSave.id)) {
                await updateProduct(productToSave.id, productToSave);
            } else {
                await addProduct({ ...productToSave, id: Date.now() }); // Ensure numeric ID for sort if new
            }
            setIsProductModalOpen(false);
            addToast("Producto guardado correctamente", "success");
        } catch (error) {
            console.error(error);
            addToast("Error al guardar: " + error.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (id) => { if (confirm("¿Estás seguro de eliminar este producto?")) await deleteProduct(id); };

    const toggleVisibility = async (p, e) => {
        e.stopPropagation();
        const newStatus = !p.active;
        await updateProduct(p.id, { active: newStatus });
    };

    const updateShippingFromCalc = (t, c) => {
        setCalcEnvioTotal(t);
        setCalcEnvioCant(c);
        if (c > 0) setCurrentProduct(prev => ({ ...prev, shippingCost: (t / c).toFixed(0) }));
    };

    const handleUpdateOrder = async (orderId, newStatus) => {
        await updateOrderStatus(orderId, newStatus);
        addToast("Estado del pedido actualizado", "success");
    };

    const copyProductLink = (id) => {
        const url = `${window.location.origin}/product/${id}`;
        navigator.clipboard.writeText(url);
        addToast("Link copiado al portapapeles", "success");
        addToast("Link copiado al portapapeles", "success");
    };

    const handleAddColor = () => {
        if (!tempColor) return;
        const newColors = [...(currentProduct.colors || []), tempColor];
        setCurrentProduct({ ...currentProduct, colors: newColors });
        setTempColor("");
    };

    const removeColor = (index) => {
        const newColors = currentProduct.colors.filter((_, i) => i !== index);
        setCurrentProduct({ ...currentProduct, colors: newColors });
    };

    const handleAddSize = () => {
        if (!tempSize) return;
        const newSizes = [...(currentProduct.sizes || []), tempSize];
        setCurrentProduct({ ...currentProduct, sizes: newSizes });
        setTempSize("");
    };

    const removeSize = (index) => {
        const newSizes = currentProduct.sizes.filter((_, i) => i !== index);
        setCurrentProduct({ ...currentProduct, sizes: newSizes });
    };

    const applyTargetMargin = () => {
        if (!targetMargin) return;
        const t = Number(currentProduct.cost || 0) + Number(currentProduct.shippingCost || 0) + Number(currentProduct.packagingCost || 0) + Number(currentProduct.fixedFee || 0);
        if (t === 0) return;

        const feeDecimal = (Number(currentProduct.feePercent || 0) / 100);
        const markupDecimal = (Number(targetMargin) / 100);

        if (feeDecimal >= 1) {
            addToast("La comisión no puede ser 100% o más", "error");
            return;
        }

        // Formula: Markup sobre Costo (Rentabilidad)
        // Precio = (Costo * (1 + Markup)) / (1 - Comisión)
        let p = (t * (1 + markupDecimal)) / (1 - feeDecimal);

        p = Math.ceil(p / 100) * 100; // Redondeo a centena
        setCurrentProduct(prev => ({ ...prev, price: p }));
        setTargetProfit(""); // Clear the other input
    };

    const applyTargetProfit = () => {
        if (!targetProfit) return;
        const t = Number(currentProduct.cost || 0) + Number(currentProduct.shippingCost || 0) + Number(currentProduct.packagingCost || 0) + Number(currentProduct.fixedFee || 0);
        const feeDecimal = (Number(currentProduct.feePercent || 0) / 100); // e.g. 0.06

        if (feeDecimal >= 1) return;

        // Price = (Cost + Profit) / (1 - Fee)
        // Check: Price - (Price*Fee) - Cost = Profit
        let p = (t + Number(targetProfit)) / (1 - feeDecimal);
        p = Math.ceil(p / 100) * 100;
        setCurrentProduct(prev => ({ ...prev, price: p }));
        setTargetMargin(""); // Clear the other input
    };

    const toggleRow = (id) => { setExpandedRow(expandedRow === id ? null : id); };

    // --- RENDER HELPERS ---

    const navigate = React.useRouter?.useNavigate?.() || (() => { }); // Hooks must be top level, but Admin is a component. I need to make sure I import useNavigate properly or use <Navigate>.
    // Better to use <Navigate> from react-router-dom if I import it, or just use `window.location.href = '/'` or just return null and useEffect to navigate.
    // Let's check imports in Admin.jsx. It doesn't import Navigate or useNavigate. I should add it.
    // For now I will return a clear "Acceso Denegado" or use window.location for simplicity if I can't easily add imports without context switch.
    // Actually I can add imports. But let's look at the existing code: `import React, { useState, useEffect, useMemo } from 'react';`
    // I can modify the imports in another call. For now, let's render a "Return Home" content.

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <div className="w-16 h-16 bg-[#C19A6B] rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-luxury font-bold mb-2">Acceso Restringido</h1>
                <p className="text-slate-400 mb-8">Esta área es exclusiva para personal autorizado.</p>
                <Button onClick={() => window.location.href = '/'} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
                    Volver a la Tienda
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F5F2EB] dark:bg-[#0B1120] font-sans text-slate-800 dark:text-slate-200 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {/* SIDEBAR */}
            <aside className="w-20 lg:w-64 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-sm relative shrink-0">
                <div className="h-20 flex items-center justify-center lg:justify-start px-6 border-b border-slate-100 dark:border-slate-800">
                    <img src="/assets/logo-main.png" alt="La Boutique Logo" className="w-10 h-10 object-contain" />
                    <span className="hidden lg:block ml-3 font-cinzel font-bold text-lg text-slate-800 dark:text-white tracking-widest uppercase">La Boutique</span>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={adminTab === 'dashboard'} onClick={() => setAdminTab('dashboard')} />
                    <SidebarItem icon={Tag} label="Inventario" active={adminTab === 'inventory'} onClick={() => setAdminTab('inventory')} />
                    <SidebarItem icon={Package} label="Pedidos" active={adminTab === 'orders'} onClick={() => setAdminTab('orders')} count={orders.filter(o => o.status === 'pending').length} />
                    <SidebarItem icon={Users} label="Clientes" active={adminTab === 'customers'} onClick={() => setAdminTab('customers')} />
                    <SidebarItem icon={TrendingUp} label="Ventas" active={adminTab === 'sales'} onClick={() => setAdminTab('sales')} />

                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                    <SidebarItem icon={Bot} label="Asistente IA" active={adminTab === 'assistant'} onClick={() => setAdminTab('assistant')} />
                    <SidebarItem icon={Blocks} label="CMS / Diseño" active={adminTab === 'cms'} onClick={() => setAdminTab('cms')} />
                    <SidebarItem icon={Ticket} label="Cupones" active={adminTab === 'coupons'} onClick={() => setAdminTab('coupons')} />
                    <SidebarItem icon={Building2} label="Proveedores" active={adminTab === 'suppliers'} onClick={() => setAdminTab('suppliers')} />
                    <p className="hidden lg:block px-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Herramientas</p>
                    <SidebarItem icon={Calculator} label="Historial de Costos" active={adminTab === 'calculator'} onClick={() => setAdminTab('calculator')} />
                    <SidebarItem icon={Monitor} label="Imágenes de la Web" active={adminTab === 'cms'} onClick={() => setAdminTab('cms')} />

                    <div className="my-6 border-t border-slate-100 dark:border-slate-800"></div>
                    <p className="hidden lg:block px-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Sistema</p>
                    <SidebarItem icon={Blocks} label="Integraciones" active={adminTab === 'integrations'} onClick={() => setAdminTab('integrations')} />
                    <SidebarItem icon={Settings} label="Configuración" active={adminTab === 'settings'} onClick={() => setAdminTab('settings')} />
                </nav>
                <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-[#111827] space-y-2">
                    <a href="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#C19A6B] w-full justify-center lg:justify-start p-2 transition-colors">
                        <LinkIcon className="w-4 h-4" /> <span className="hidden lg:inline">Ir a la Tienda</span>
                    </a>
                    <button onClick={logout} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 w-full justify-center lg:justify-start p-2 transition-colors">
                        <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
                {/* INVENTARIO */}
                {adminTab === 'inventory' && (
                    <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-24">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-luxury font-bold dark:text-white text-slate-900 tracking-wider">Inventario Exclusivo</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">Gestiona tu colección premium.</p>
                            </div>
                            <Button onClick={() => {
                                setCurrentProduct({
                                    id: Date.now(), name: '', price: "", cost: "", shippingCost: "", packagingCost: "", feePercent: "", stock: "",
                                    category: '', image: '', sizes: ['S', 'M'], colors: [], active: true, description: ''
                                });
                                setIsProductModalOpen(true);
                            }} className="bg-black hover:bg-[#C19A6B] text-white shadow-xl shadow-black/10 px-6 py-3 rounded-none border border-[#C19A6B] text-xs uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1">
                                + Nuevo Diseño
                            </Button>
                        </div>

                        {/* STATS RAPIDAS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatSmall label="Valor Inventario" value={formatMoney(metrics.totalValue)} icon={DollarSign} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
                            <StatSmall label="Inversión" value={formatMoney(metrics.invested)} icon={Wallet} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
                            <StatSmall label="Ganancia Potencial" value={formatMoney(metrics.potentialProfit)} icon={TrendingUp} color="text-[#C19A6B] bg-orange-50 dark:bg-orange-900/20" />
                            <StatSmall label="Total Prendas" value={metrics.totalStock} icon={Tag} color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
                        </div>

                        {/* FILTERS TOOLBAR */}
                        <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-0 z-30">
                            {/* SEARCH */}
                            <div className="relative w-full lg:w-96 group">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C19A6B] transition-colors" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full text-sm border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B]/20 transition-all"
                                    placeholder="Buscar producto..."
                                />
                            </div>

                            {/* FILTERS */}
                            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Filter className="h-3.5 w-3.5" />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#C19A6B] appearance-none cursor-pointer font-medium hover:bg-slate-50 transition-colors min-w-[140px]"
                                    >
                                        <option value="Todos">Todas las Cats</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                    </div>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#C19A6B] appearance-none cursor-pointer font-medium hover:bg-slate-50 transition-colors min-w-[160px]"
                                    >
                                        <option value="newest">Más Recientes</option>
                                        <option value="price-asc">Menor Precio</option>
                                        <option value="price-desc">Mayor Precio</option>
                                        <option value="stock-asc">Menor Stock</option>
                                        <option value="stock-desc">Mayor Stock</option>
                                        <option value="name-asc">Nombre A-Z</option>
                                    </select>
                                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                </div>

                                <button
                                    onClick={() => setFilterLowStock(!filterLowStock)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase border transition-all whitespace-nowrap ${filterLowStock ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${filterLowStock ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                    {filterLowStock ? "Ocultar Faltantes" : "Ver Faltantes"}
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 dark:bg-[#111827] text-slate-500 font-luxury uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4 pl-6 w-1/3">Producto</th>
                                        <th className="p-4 text-center">Disponibilidad</th>
                                        <th className="p-4 text-center">Visibilidad</th>
                                        <th className="p-4 text-center">Stock</th>
                                        <th className="p-4 text-right">Precio</th>
                                        <th className="p-4 text-right pr-6">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredInventory.length === 0 ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-slate-400">No hay productos que coincidan con la búsqueda.</td></tr>
                                    ) : (
                                        filteredInventory.map(p => {
                                            const totalDirectCost = (Number(p.cost) || 0) + (Number(p.shippingCost) || 0) + (Number(p.packagingCost) || 0);
                                            const fee = p.price * ((Number(p.feePercent) || 0) / 100);
                                            const netProfit = p.price - totalDirectCost - fee;
                                            const margin = p.price > 0 ? ((netProfit / p.price) * 100).toFixed(1) : 0;
                                            const isExpanded = expandedRow === p.id;

                                            return (
                                                <React.Fragment key={p.id}>
                                                    <tr className={`transition-colors border-l-4 ${p.active === false ? 'border-l-slate-300 bg-slate-50/50 opacity-70' : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                                        {/* INFO PRODUCTO */}
                                                        <td className="p-4 pl-6 cursor-pointer group" onClick={() => toggleRow(p.id)}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 relative">
                                                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-5 h-5" /></div>}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-[#C19A6B] transition-colors">{p.name}</span>
                                                                        {isExpanded ? <ChevronUp className="w-3 h-3 text-[#C19A6B]" /> : <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-[#C19A6B]" />}
                                                                    </div>
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mt-1">{p.category}</span>
                                                                </div>
                                                            </div>
                                                        </td>



                                                        {/* STATUS SELECTOR */}
                                                        <td className="p-4 text-center">
                                                            <StatusSelector product={p} />
                                                        </td>

                                                        {/* VISIBILIDAD */}
                                                        <td className="p-4 text-center">
                                                            <button
                                                                onClick={(e) => toggleVisibility(p, e)}
                                                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${p.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
                                                            >
                                                                {p.active !== false ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Oculto</>}
                                                            </button>
                                                        </td>

                                                        {/* STOCK */}
                                                        <td className="p-4 text-center">
                                                            <span className={`font-bold ${p.stock < 5 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                                {p.stock} u.
                                                            </span>
                                                        </td>

                                                        {/* PRECIO */}
                                                        <td className="p-4 text-right font-bold text-slate-800 dark:text-white">{formatMoney(p.price)}</td>

                                                        {/* ACCIONES */}
                                                        <td className="p-4 text-right pr-6">
                                                            <div className="flex justify-end gap-1">
                                                                <ActionBtn onClick={() => copyProductLink(p.id)} icon={LinkIcon} color="text-blue-500 hover:bg-blue-50" title="Copiar Link" />
                                                                <ActionBtn onClick={() => { setCurrentProduct(p); setIsProductModalOpen(true); }} icon={Edit2} color="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar" />
                                                                <ActionBtn onClick={() => handleDeleteProduct(p.id)} icon={Trash2} color="text-red-500 hover:bg-red-50" title="Eliminar" />
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* DETALLE EXPANDIDO */}
                                                    {
                                                        isExpanded && (
                                                            <tr className="bg-slate-50 dark:bg-slate-900/30">
                                                                <td colSpan="5" className="p-0">
                                                                    <div className="p-6 pl-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-100 dark:border-slate-800 shadow-inner">
                                                                        <div className="space-y-3">
                                                                            <p className="uppercase font-bold text-[10px] tracking-wider text-slate-400">Estructura de Costos</p>
                                                                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                                                                <div className="flex justify-between"><span>Costo Producto:</span> <span>{formatMoney(p.cost || 0)}</span></div>
                                                                                <div className="flex justify-between"><span>Envío (In):</span> <span>{formatMoney(p.shippingCost || 0)}</span></div>
                                                                                <div className="flex justify-between"><span>Packaging:</span> <span>{formatMoney(p.packagingCost || 0)}</span></div>
                                                                                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"><span>Costo Directo:</span> <span>{formatMoney(totalDirectCost)}</span></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <p className="uppercase font-bold text-[10px] tracking-wider text-slate-400">Plataforma</p>
                                                                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                                                                <div className="flex justify-between"><span>Comisión Cobro ({p.feePercent}%):</span> <span className="text-red-500 line-through decoration-red-200">-{formatMoney(fee)}</span></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                                                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400"><Wallet className="w-5 h-5" /></div>
                                                                            <div>
                                                                                <p className="text-[10px] uppercase font-bold text-slate-400">Ganancia Real</p>
                                                                                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatMoney(netProfit)}</p>
                                                                                <p className="text-[10px] font-bold text-emerald-600/70">Margen: {margin}%</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
                }

                {/* OTHER TABS (SIMPLIFIED FOR LENGTH - KEEPING KEY FUNCTIONALITY) */}
                {adminTab === 'dashboard' && <DashboardView
                    metrics={metrics}
                    visitCount={visitCount}
                    salesMetrics={salesMetrics}
                    orders={orders}
                    isMaintenance={isMaintenance}
                    toggleMaintenance={toggleMaintenance}
                    onNavigate={setAdminTab}
                    wishlistData={wishlistEvents}
                    onCreateProduct={() => {
                        setCurrentProduct({
                            id: Date.now(), name: '', price: "", cost: "", shippingCost: "", packagingCost: "", feePercent: "", stock: "",
                            category: '', image: '', sizes: ['S', 'M'], colors: [], active: true, description: '', badges: {}
                        });
                        setIsProductModalOpen(true);
                    }}
                />}
                {adminTab === 'assistant' && <AdminAssistantView orders={orders} inventory={inventory} onClose={() => setAdminTab('dashboard')} />}
                {adminTab === 'orders' && <OrdersView orders={orders} updateOrderStatus={updateOrderStatus} />}
                {adminTab === 'customers' && <CustomersView orders={orders} />}
                {adminTab === 'sales' && <SalesView salesLog={salesLog} />}
                {adminTab === 'sales' && <SalesView salesLog={salesLog} />}
                {
                    adminTab === 'calculator' && <SimulationsView
                        onSaveToProduct={(data) => {
                            setCurrentProduct({
                                ...currentProduct,
                                id: Date.now(),
                                name: data.name,
                                price: data.price,
                                cost: data.cost,
                                category: '',
                                image: '', sizes: ['S', 'M'], colors: [], active: true, description: ''
                            });
                            setAdminTab('inventory');
                            setIsProductModalOpen(true);
                        }}
                        onEditProduct={(p) => {
                            setCurrentProduct(p);
                            setIsProductModalOpen(true);
                        }}
                        onDeleteProduct={handleDeleteProduct}
                    />
                }
                {adminTab === 'cms' && <CMSView />}
                {adminTab === 'coupons' && <CouponsView />}
                {adminTab === 'suppliers' && <SuppliersView />}
                {adminTab === 'integrations' && <IntegrationsView />}
                {adminTab === 'settings' && <SettingsView isMaintenance={isMaintenance} toggleMaintenance={toggleMaintenance} migrateData={migrateData} updateSystemVersion={updateSystemVersion} cleanStorage={cleanStorage} siteConfig={siteConfig} updateSiteConfig={updateSiteConfig} />}
            </main >

            {/* PRODUCT MODAL */}
            {
                isProductModalOpen && currentProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-[#F8FAFC] dark:bg-[#0f172a] w-full max-w-[95vw] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl">
                            {/* Modal Header */}
                            <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1e293b] shrink-0">
                                <h3 className="font-bold text-base sm:text-lg dark:text-white flex items-center gap-2"><Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" /> {currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>

                            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                                {/* FORM SCROLLABLE */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white dark:bg-[#1e293b]">
                                    {/* MAIN INFO */}
                                    <section className="flex flex-col gap-6">
                                        {/* MEDIA GALLERY REPLACEMENT */}
                                        <div className="w-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-widest"><UploadCloud className="w-4 h-4 text-[#C19A6B]" /> Galería Multimedia</h4>
                                                <span className="text-[10px] text-slate-400">Arrastra para ordenar (Próximamente)</span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                                                {/* Existing Media Items */}
                                                {(currentProduct.media || []).map((item, index) => (
                                                    <div key={index} className={`aspect-square rounded-xl overflow-hidden relative group border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${item.isUploading ? 'opacity-70' : ''}`}>
                                                        {item.type === 'image' ? (
                                                            <>
                                                                <img src={item.url} className={`w-full h-full object-cover ${item.status === 'error' ? 'grayscale opacity-50' : ''}`} alt="Media" />

                                                                {/* UPLOADING STATE */}
                                                                {item.isUploading && (
                                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                                                                        <div className="w-8 h-8 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin mb-2"></div>
                                                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Subiendo...</span>
                                                                    </div>
                                                                )}

                                                                {/* ERROR STATE */}
                                                                {item.status === 'error' && (
                                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/95 z-20 p-2 text-center fade-in">
                                                                        <div className="text-white font-bold text-[10px] mb-1">¡FALLÓ!</div>
                                                                        <div className="text-red-200 text-[9px] leading-tight mb-2 px-1 max-h-[40px] overflow-hidden text-ellipsis" title={item.errorMessage || "Error desconocido"}>
                                                                            {item.errorMessage || "Error desconocido"}
                                                                        </div>
                                                                        <button onClick={() => removeMedia(index)} className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors">
                                                                            Eliminar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white relative">
                                                                {/* Video Thumbnail Preview (Basic) */}
                                                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                                                <div className="text-center z-10">
                                                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1 backdrop-blur-sm border border-white/10"><div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5"></div></div>
                                                                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Video</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Actions Overlay */}
                                                        <div className="absolute inset-x-0 top-0 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/50 to-transparent">
                                                            <button onClick={() => removeMedia(index)} className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transform hover:scale-110 transition-all">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Status Badges */}
                                                        {index === 0 && <span className="absolute bottom-2 left-2 bg-[#C19A6B] text-white text-[9px] px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider backdrop-blur-md">Principal</span>}
                                                    </div>
                                                ))}

                                                {/* Upload Button */}
                                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#C19A6B] dark:hover:border-[#C19A6B] cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-[#C19A6B] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all bg-transparent group">
                                                    <UploadCloud className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-bold uppercase text-center px-1">Subir Foto</span>
                                                    <input type="file" className="hidden" accept=".jpg, .jpeg, .png, .webp" onChange={handleImageUpload} />
                                                </label>
                                            </div>

                                            {/* Video Input */}
                                            <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-[#C19A6B] transition-colors">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400"><Monitor className="w-4 h-4" /></div>
                                                <input
                                                    type="text"
                                                    placeholder="Pegar URL de video (YouTube, MP4...)"
                                                    className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white placeholder:text-slate-400/70"
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideo(e.target.value); e.target.value = ''; } }}
                                                />
                                                <Button onClick={(e) => { const input = e.target.previousSibling; handleAddVideo(input.value); input.value = ''; }} className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider h-auto py-2">
                                                    Agregar
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <InputGroup label="Nombre del Producto">
                                                <input value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="input font-bold text-lg" placeholder="Ej: Remera Básica" />
                                            </InputGroup>
                                            <InputGroup label="Descripción Detallada">
                                                <textarea
                                                    value={currentProduct.description || ''}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                                    className="input min-h-[80px] text-sm resize-none"
                                                    placeholder="Describe las características de la prenda (tela, corte, cuidados...)"
                                                />
                                            </InputGroup>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="Categoría">
                                                    <input list="categories-list" value={currentProduct.category} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="input" placeholder="Ej: Vestidos" />
                                                    <datalist id="categories-list">
                                                        {categories.map(c => <option key={c.id} value={c.name} />)}
                                                    </datalist>
                                                </InputGroup>
                                                <InputGroup label="Stock Actual">
                                                    <input type="number" placeholder="0" value={currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value })} className="input font-bold" />
                                                </InputGroup>
                                            </div>
                                            <InputGroup label="Variantes de Talle">
                                                <div className="flex gap-2 mb-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            value={tempSize}
                                                            onChange={e => setTempSize(e.target.value.toUpperCase())}
                                                            onKeyDown={e => e.key === 'Enter' && handleAddSize()}
                                                            className="input"
                                                            placeholder="Ej: S, M, L, XL, 38, 40..."
                                                        />
                                                        <button onClick={handleAddSize} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-[#C19A6B] transition-colors"><CheckIcon className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(currentProduct.sizes || []).map((size, index) => (
                                                        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm">
                                                            {size}
                                                            <button onClick={() => removeSize(index)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                        </span>
                                                    ))}
                                                    {(currentProduct.sizes || []).length === 0 && <span className="text-xs text-slate-400 italic">Sin talles definidos</span>}
                                                </div>
                                            </InputGroup>
                                            <InputGroup label="Variantes de Color">
                                                <div className="flex gap-2 mb-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            value={tempColor}
                                                            onChange={e => setTempColor(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handleAddColor()}
                                                            className="input"
                                                            placeholder="Ej: Rojo, Negro, Nude..."
                                                        />
                                                        {tempColor && (
                                                            <div
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-colors duration-300"
                                                                style={{ backgroundColor: getColorHex(tempColor) }}
                                                            />
                                                        )}
                                                    </div>
                                                    <Button onClick={handleAddColor} className="bg-slate-800 text-white px-3 py-0 rounded-lg h-[42px]">+</Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(currentProduct.colors || []).map((c, i) => (
                                                        <div key={i} className="relative group/color">
                                                            <div
                                                                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm cursor-help relative"
                                                                style={{ backgroundColor: getColorHex(c) }}
                                                                title={c} // Native Tooltip
                                                            >
                                                                {/* Cross Remove Button overlay */}
                                                                <button
                                                                    onClick={() => removeColor(i)}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/color:opacity-100 transition-opacity shadow-sm"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                            {/* Custom Tooltip on Hover */}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                                {c}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </InputGroup>

                                            {/* BADGES / ETIQUETAS */}
                                            <InputGroup label="Etiquetas / Badges">
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { key: 'isNew', label: 'NUEVO', color: 'bg-emerald-500' },
                                                        { key: 'isOnSale', label: 'OFERTA', color: 'bg-red-500' },
                                                        { key: 'isSeason', label: 'TEMPORADA', color: 'bg-amber-500' },
                                                        { key: 'isFeatured', label: 'DESTACADO', color: 'bg-purple-500' },
                                                        { key: 'isExclusive', label: 'EXCLUSIVO', color: 'bg-slate-900' }
                                                    ].map(badge => (
                                                        <button
                                                            key={badge.key}
                                                            type="button"
                                                            onClick={() => setCurrentProduct({
                                                                ...currentProduct,
                                                                badges: {
                                                                    ...currentProduct.badges,
                                                                    [badge.key]: !currentProduct.badges?.[badge.key]
                                                                }
                                                            })}
                                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${currentProduct.badges?.[badge.key]
                                                                ? `${badge.color} text-white shadow-lg scale-105`
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            {currentProduct.badges?.[badge.key] ? '✓ ' : ''}{badge.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2">Las etiquetas se muestran como badges en la tienda.</p>
                                            </InputGroup>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100 dark:border-slate-800" />

                                    {/* VARIANTS - Price/Stock per Size/Color */}
                                    <section>
                                        <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4">
                                            <SlidersHorizontal className="w-4 h-4 text-[#C19A6B]" /> Variantes (Precio por Talle/Color)
                                        </h4>

                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                                            <p className="text-xs text-slate-500 mb-3">Opcional: Define precios y stock diferentes para cada combinación de talle y color.</p>

                                            {/* Auto-generate button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const sizes = currentProduct.sizes || [];
                                                    const colors = currentProduct.colors || [];
                                                    if (sizes.length === 0 || colors.length === 0) {
                                                        return addToast("Primero agregá talles y colores", "error");
                                                    }
                                                    const newVariants = [];
                                                    sizes.forEach(size => {
                                                        colors.forEach(color => {
                                                            const exists = (currentProduct.variants || []).find(v => v.size === size && v.color === color);
                                                            if (!exists) {
                                                                newVariants.push({
                                                                    size,
                                                                    color,
                                                                    price: currentProduct.price || 0,
                                                                    stock: 0
                                                                });
                                                            }
                                                        });
                                                    });
                                                    setCurrentProduct({
                                                        ...currentProduct,
                                                        variants: [...(currentProduct.variants || []), ...newVariants]
                                                    });
                                                    addToast(`${newVariants.length} variantes generadas`, "success");
                                                }}
                                                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-[#C19A6B] transition-colors"
                                            >
                                                Generar Variantes Automáticas
                                            </button>
                                        </div>

                                        {/* Variants Table */}
                                        {(currentProduct.variants || []).length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                                            <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Talle</th>
                                                            <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Color</th>
                                                            <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Precio</th>
                                                            <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Stock</th>
                                                            <th className="py-2"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(currentProduct.variants || []).map((variant, idx) => (
                                                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                                                                <td className="py-2">
                                                                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold">{variant.size}</span>
                                                                </td>
                                                                <td className="py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: getColorHex(variant.color) }}></div>
                                                                        <span className="text-xs">{variant.color}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-2">
                                                                    <input
                                                                        type="number"
                                                                        value={variant.price}
                                                                        onChange={(e) => {
                                                                            const updated = [...currentProduct.variants];
                                                                            updated[idx].price = Number(e.target.value);
                                                                            setCurrentProduct({ ...currentProduct, variants: updated });
                                                                        }}
                                                                        className="w-24 p-1 border rounded text-center font-bold dark:bg-slate-800 dark:border-slate-700"
                                                                    />
                                                                </td>
                                                                <td className="py-2">
                                                                    <input
                                                                        type="number"
                                                                        value={variant.stock}
                                                                        onChange={(e) => {
                                                                            const updated = [...currentProduct.variants];
                                                                            updated[idx].stock = Number(e.target.value);
                                                                            setCurrentProduct({ ...currentProduct, variants: updated });
                                                                        }}
                                                                        className="w-20 p-1 border rounded text-center font-bold dark:bg-slate-800 dark:border-slate-700"
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updated = currentProduct.variants.filter((_, i) => i !== idx);
                                                                            setCurrentProduct({ ...currentProduct, variants: updated });
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </section>

                                    <hr className="border-slate-100 dark:border-slate-800" />

                                    {/* COSTS */}
                                    <section>
                                        <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4"><DollarSign className="w-4 h-4 text-[#C19A6B]" /> Estructura de Costos</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <InputGroup label="Costo Prenda ($)" help="Fabricación/Compra">
                                                <input type="number" placeholder="0" value={currentProduct.cost} onChange={e => setCurrentProduct({ ...currentProduct, cost: e.target.value })} className="input" />
                                            </InputGroup>
                                            <InputGroup label="Packaging ($)" help="Bolsa, etiquetas">
                                                <input type="number" placeholder="0" value={currentProduct.packagingCost} onChange={e => setCurrentProduct({ ...currentProduct, packagingCost: e.target.value })} className="input" />
                                            </InputGroup>
                                            <InputGroup label="Comisión MP (%)" help="Ej: 6%">
                                                <input type="number" placeholder="0" value={currentProduct.feePercent} onChange={e => setCurrentProduct({ ...currentProduct, feePercent: e.target.value })} className="input" />
                                            </InputGroup>
                                            <InputGroup label="Costo Fijo MP ($)" help="Ej: 1500 (Opcional)">
                                                <input type="number" placeholder="0" value={currentProduct.fixedFee} onChange={e => setCurrentProduct({ ...currentProduct, fixedFee: e.target.value })} className="input" />
                                            </InputGroup>
                                        </div>

                                        {/* Shipping Calculator */}
                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-sm mt-4">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700 pb-2">
                                                <TruckIcon className="w-4 h-4 text-[#C19A6B]" />
                                                <span className="text-xs uppercase font-bold tracking-wider">Asistente de Flete (Calculadora Unitaria)</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-slate-400 block mb-1">Costo Total del Bulto</label>
                                                    <input type="number" placeholder="0" value={calcEnvioTotal} onChange={(e) => updateShippingFromCalc(e.target.value, calcEnvioCant)} className="w-full p-2 border rounded-lg bg-white dark:bg-black outline-none focus:border-[#C19A6B] text-center font-bold" />
                                                </div>
                                                <span className="text-slate-300 text-xl font-light">/</span>
                                                <div className="w-24">
                                                    <label className="text-[10px] text-slate-400 block mb-1">Unidades</label>
                                                    <input type="number" placeholder="0" value={calcEnvioCant} onChange={(e) => updateShippingFromCalc(calcEnvioTotal, e.target.value)} className="w-full p-2 border rounded-lg bg-white dark:bg-black outline-none focus:border-[#C19A6B] text-center font-bold" />
                                                </div>
                                                <span className="text-slate-300 text-xl font-light">=</span>
                                                <div className="flex-1 bg-white dark:bg-black border border-emerald-100 dark:border-emerald-900/30 p-2 rounded-lg text-center">
                                                    <span className="block text-emerald-600 dark:text-emerald-400 font-black text-lg">{formatMoney(currentProduct.shippingCost)}</span>
                                                    <span className="block text-[9px] text-emerald-600/60 uppercase font-bold">Costo x Prenda</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <hr className="border-slate-100 dark:border-slate-800" />

                                    {/* PRICING STRATEGY */}
                                    {/* PRICING STRATEGY */}
                                    <section className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                        <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4" /> Estrategia de Precio</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {/* Target Margin % */}
                                            <div className="flex gap-2 items-center justify-between bg-white dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider">Margen Deseado %</span>
                                                    <input type="number" placeholder="50" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} className="w-full text-lg border-none outline-none bg-transparent text-emerald-900 dark:text-emerald-100 placeholder-emerald-300/50 font-bold p-0 mt-1" />
                                                </div>
                                                <Button onClick={applyTargetMargin} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 h-auto rounded-lg shadow-emerald-200 dark:shadow-none">Aplicar</Button>
                                            </div>

                                            {/* Target Profit $ */}
                                            <div className="flex gap-2 items-center justify-between bg-white dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider">Ganancia Deseada $</span>
                                                    <input type="number" placeholder="5000" value={targetProfit} onChange={(e) => setTargetProfit(e.target.value)} className="w-full text-lg border-none outline-none bg-transparent text-emerald-900 dark:text-emerald-100 placeholder-emerald-300/50 font-bold p-0 mt-1" />
                                                </div>
                                                <Button onClick={applyTargetProfit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 h-auto rounded-lg shadow-emerald-200 dark:shadow-none">Aplicar</Button>
                                            </div>
                                        </div>
                                        <InputGroup label="PRECIO DE VENTA PÚBLICO">
                                            <input type="number" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="w-full p-4 text-3xl font-black text-right bg-white dark:bg-[#111827] border-2 border-emerald-100 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-white focus:border-emerald-400 outline-none shadow-sm placeholder:text-slate-200 dark:placeholder:text-slate-700" placeholder="0.00" />
                                            <p className="text-right text-xs text-slate-400 mt-2 font-medium">Este es el precio final que verá el cliente</p>
                                        </InputGroup>
                                    </section>
                                </div>

                                {/* PREVIEW SIDEBAR */}
                                <div className="w-full lg:w-80 bg-slate-50 dark:bg-[#020617] border-l border-slate-200 dark:border-slate-800 p-8 flex flex-col">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 text-center flex items-center justify-center gap-2"><Calculator className="w-4 h-4" /> Simulación Real</h4>
                                    <div className="space-y-3 text-sm flex-1">
                                        <Row label="Costo Prenda" value={currentProduct.cost} />
                                        <Row label="Flete Unitario" value={currentProduct.shippingCost} />
                                        <Row label="Packaging" value={currentProduct.packagingCost} />
                                        <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
                                        <Row label="Subtotal Costos" value={(Number(currentProduct.cost) || 0) + (Number(currentProduct.shippingCost) || 0) + (Number(currentProduct.packagingCost) || 0)} bold />

                                        <div className="py-4"></div>
                                        <Row label={`Comisión Variable (${currentProduct.feePercent || 0}%)`} value={currentProduct.price * ((currentProduct.feePercent || 0) / 100)} isNegative />
                                        {Number(currentProduct.fixedFee) > 0 && <Row label="Comisión Fija MP" value={currentProduct.fixedFee} isNegative />}
                                        <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>

                                        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 text-center">Tu Ganancia Neta</p>
                                            <p className="text-3xl font-black text-center text-emerald-600 dark:text-emerald-400 mb-2">
                                                {formatMoney(currentProduct.price - ((Number(currentProduct.cost) || 0) + (Number(currentProduct.shippingCost) || 0) + (Number(currentProduct.packagingCost) || 0) + (Number(currentProduct.fixedFee) || 0) + (currentProduct.price * ((currentProduct.feePercent || 0) / 100))))}
                                            </p>
                                            <div className="text-center">
                                                <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-bold uppercase">
                                                    Margen: {currentProduct.price > 0 ? (((currentProduct.price - ((Number(currentProduct.cost) || 0) + (Number(currentProduct.shippingCost) || 0) + (Number(currentProduct.packagingCost) || 0) + (Number(currentProduct.fixedFee) || 0) + (currentProduct.price * ((currentProduct.feePercent || 0) / 100)))) / currentProduct.price) * 100).toFixed(1) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={handleSaveProduct} isLoading={isSaving} className="w-full bg-[#C19A6B] hover:bg-[#a38056] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#C19A6B]/20 text-lg mt-6 transition-transform active:scale-95">
                                        GUARDAR CAMBIOS
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; outline: none; transition: all 0.2s; font-size: 0.875rem; }
                .input:focus { border-color: #C19A6B; box-shadow: 0 0 0 2px rgba(193,154,107,0.1); }
                .dark .input { background: #0f172a; border-color: #334155; color: white; }
                .dark .input:focus { border-color: #C19A6B; }
                /* Hide spin buttons */
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                input[type=number] { -moz-appearance: textfield; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div >
    );
};

// --- SUBCOMPONENTS (Clean & extracted) ---

const SidebarItem = ({ icon: Icon, label, active, onClick, count }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active ? 'bg-[#C19A6B] text-white shadow-lg shadow-[#C19A6B]/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-[#C19A6B] transition-colors'}`} />
            <span className="hidden lg:inline">{label}</span>
        </div>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center hidden lg:inline-block shadow-sm">{count}</span>}
    </button>
);

const StatSmall = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">{label}</p><p className="text-xl font-bold dark:text-white">{value}</p></div>
    </div>
);

const ActionBtn = ({ onClick, icon: Icon, color, title }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`p-2 rounded-lg transition-colors ${color}`} title={title}><Icon className="w-4 h-4" /></button>
);

const InputGroup = ({ label, help, children }) => (
    <div className="mb-1">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-500">{label}</label>
        {children}
        {help && <p className="text-[10px] text-slate-400 mt-1 italic">{help}</p>}
    </div>
);

const Row = ({ label, value, isNegative, bold }) => (
    <div className={`flex justify-between items-center py-1 ${bold ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
        <span>{label}</span>
        <span className={`font-mono ${isNegative ? 'text-red-500' : ''}`}>{isNegative ? '-' : ''}{formatMoney(value)}</span>
    </div>
);

const TruckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" /><circle cx="7" cy="18" r="2" /><circle cx="15" cy="18" r="2" /></svg>
);

const SettingsIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.35a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.56a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.35a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.35a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.56a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);


