import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { CommandPalette } from '../components/admin/CommandPalette';
import { formatMoney } from '../utils/helpers';
import {
    LayoutDashboard, Package, Tag, LogOut, Edit2, Trash2, X,
    TrendingUp, DollarSign, Calculator, Search, Users,
    Image as ImageIcon, Link as LinkIcon,
    Eye, EyeOff, ChevronDown, ChevronUp, Wallet, Filter, SlidersHorizontal, ArrowUpDown,
    Check as CheckIcon, Lock, Settings, Blocks, Bot, Ticket, Building2,
    ShoppingCart as ShoppingCartIcon, Send as SendIcon, Menu, PackageOpen
} from 'lucide-react';
import { StatusSelector } from '../components/admin/StatusSelector';
import { usePagination, Pagination } from '../components/ui/Pagination';
import { getTotalStock } from '../utils/variants';
import { getLowStockItems, DEFAULT_LOW_STOCK_THRESHOLD } from '../utils/lowStock';

// Cada tab se carga bajo demanda (code-splitting) — el bundle inicial del
// Admin baja fuerte y cada vista pesada (IA, CMS, Dashboard) no se descarga
// hasta que se entra.
const lazyNamed = (factory, name) => lazy(() => factory().then(m => ({ default: m[name] })));
const SimulationsView = lazyNamed(() => import('../components/admin/SimulationsView'), 'SimulationsView');
const CMSView = lazyNamed(() => import('../components/admin/CMSView'), 'CMSView');
const ProductEditModal = lazyNamed(() => import('../components/admin/ProductEditModal'), 'ProductEditModal');
const DashboardView = lazyNamed(() => import('../components/admin/DashboardView'), 'DashboardView');
const SettingsView = lazyNamed(() => import('../components/admin/SettingsView'), 'SettingsView');
const OrdersView = lazyNamed(() => import('../components/admin/OrdersView'), 'OrdersView');
const CustomersView = lazyNamed(() => import('../components/admin/CustomersView'), 'CustomersView');
const AdminAssistantView = lazyNamed(() => import('../components/admin/AdminAssistantView'), 'AdminAssistantView');
const CouponsView = lazyNamed(() => import('../components/admin/CouponsView'), 'CouponsView');
const SalesView = lazyNamed(() => import('../components/admin/SalesView'), 'SalesView');
const SuppliersView = lazyNamed(() => import('../components/admin/SuppliersView'), 'SuppliersView');
const ExpensesView = lazyNamed(() => import('../components/admin/ExpensesView'), 'ExpensesView');
const AbandonedCartsView = lazyNamed(() => import('../components/admin/AbandonedCartsView'), 'AbandonedCartsView');
const ReviewsView = lazyNamed(() => import('../components/admin/ReviewsView'), 'ReviewsView');

const TabLoader = () => (
    <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
);


const TAB_LABELS = {
    dashboard: 'Dashboard', inventory: 'Inventario', orders: 'Pedidos', customers: 'Clientes',
    sales: 'Ventas', assistant: 'Asistente Lau', cms: 'CMS / Diseño', coupons: 'Cupones',
    suppliers: 'Proveedores', abandoned: 'Carritos Abandonados', reviews: 'Reseñas',
    calculator: 'Historial de Costos', expenses: 'Gastos', settings: 'Configuración'
};

export const Admin = () => {

    const { isAdmin, user, login, logout, orders, updateOrderStatus, inventory, addProduct, updateProduct, deleteProduct, addToast, categories, addCategory, deleteCategory, siteImages, updateSiteImages, migrateData, uploadImage, isMaintenance, visitCount, toggleMaintenance, updateSystemVersion, cleanStorage, siteConfig, updateSiteConfig, wishlistEvents, aiConfig, abandonedCarts, activeSessions, reviews, visitStatsHourly } = useStore();
    const confirm = useConfirm();
    const [adminTab, setAdminTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    // --- FILTERS & SEARCH STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [sortOrder, setSortOrder] = useState("newest"); // newest, price-asc, price-desc, stock-asc, stock-desc

    const [expandedRow, setExpandedRow] = useState(null);

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

    const lowStockThreshold = Number(siteConfig?.lowStockThreshold) > 0
        ? Number(siteConfig.lowStockThreshold)
        : DEFAULT_LOW_STOCK_THRESHOLD;

    // --- FILTER LOGIC ---
    const filteredInventory = useMemo(() => {
        let result = inventory.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
            const matchesStock = filterLowStock ? getTotalStock(p) <= lowStockThreshold : true;
            return matchesSearch && matchesCategory && matchesStock;
        });

        return result.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'stock-asc': return getTotalStock(a) - getTotalStock(b);
                case 'stock-desc': return getTotalStock(b) - getTotalStock(a);
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'newest': default: return b.id - a.id;
            }
        });
    }, [inventory, searchTerm, selectedCategory, filterLowStock, sortOrder, lowStockThreshold]);

    const invPage = usePagination(filteredInventory, 20);

    const lowStockItems = useMemo(
        () => getLowStockItems(inventory, lowStockThreshold),
        [inventory, lowStockThreshold]
    );

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
        const product = inventory.find(p => String(p.id) === String(item.id))
            || inventory.find(p => (p.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase())
            || item;
        const cost = (Number(product.cost) || 0) + (Number(product.shippingCost) || 0) + (Number(product.packagingCost) || 0);
        const fee = item.price * ((Number(product.feePercent) || 0) / 100);
        const profit = item.price - cost - fee;
        return {
            date: order.date,
            orderId: order.id,
            productName: item.name,
            size: item.size || (Array.isArray(product.sizes) && product.sizes.length === 1 ? product.sizes[0] : ''),
            color: item.color || (Array.isArray(product.colors) && product.colors.length === 1 ? product.colors[0] : ''),
            channel: order.manual ? (order.channel || 'Venta externa') : 'Tienda',
            stockLeft: getTotalStock(product),
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            profit: profit * item.quantity,
            image: product.image || product.media?.[0]?.url || item.image || ''
        };
    })).reverse(), [orders, inventory]);

    // --- HANDLERS ---
    const handleDeleteProduct = async (id) => {
        if (await confirm({ title: 'Eliminar producto', message: 'Esta acción no se puede deshacer. ¿Eliminar este producto del catálogo?', confirmText: 'Eliminar', danger: true })) {
            await deleteProduct(id);
        }
    };

    const toggleVisibility = async (p, e) => {
        e.stopPropagation();
        const newStatus = !p.active;
        await updateProduct(p.id, { active: newStatus });
    };

    const handleUpdateOrder = async (orderId, newStatus) => {
        await updateOrderStatus(orderId, newStatus);
        addToast("Estado del pedido actualizado", "success");
    };

    const copyProductLink = (id) => {
        const url = `${window.location.origin}/product/${id}`;
        navigator.clipboard.writeText(url);
        addToast("Link copiado al portapapeles", "success");
    };

    const [publishingTgId, setPublishingTgId] = useState(null);
    const handlePublishTelegram = async (product) => {
        if (!(await confirm({ title: 'Publicar en Telegram', message: `Se publicará "${product.name}" en el canal de Telegram.`, confirmText: 'Publicar' }))) return;
        setPublishingTgId(product.id);
        try {
            const { publishProductToTelegram } = await import('../utils/telegram');
            await publishProductToTelegram(product, siteConfig);
            addToast("Publicado en Telegram", "success");
        } catch (err) {
            addToast(err.message || "Error al publicar", "error");
        } finally {
            setPublishingTgId(null);
        }
    };

    const toggleRow = (id) => { setExpandedRow(expandedRow === id ? null : id); };

    const openNewProduct = () => {
        setCurrentProduct({
            name: '', price: "", cost: "", shippingCost: "", packagingCost: "", feePercent: "", stock: "",
            category: '', image: '', media: [], sizes: ['S', 'M'], colors: [], active: false, description: ''
        });
        setIsProductModalOpen(true);
    };

    // Exportar todo el inventario a Excel (stock, precios, costos, ganancia…)
    const exportInventory = async () => {
        if (!inventory || inventory.length === 0) return addToast('No hay productos para exportar', 'error');
        addToast('Generando Excel con fotos…', 'info');
        try {
            const ExcelJS = (await import('exceljs')).default;

            // Genera un thumbnail chico en JPG para que pese poco y entre prolijo en la celda
            const thumbUrl = (url) => {
                if (!url || typeof url !== 'string') return null;
                if (url.includes('/upload/')) return url.replace('/upload/', '/upload/c_fill,w_160,h_180,f_jpg,q_auto/');
                return url;
            };
            const fetchImg = async (url) => {
                try {
                    const u = thumbUrl(url);
                    if (!u) return null;
                    const res = await fetch(u);
                    if (!res.ok) return null;
                    return await res.arrayBuffer();
                } catch { return null; }
            };

            const wb = new ExcelJS.Workbook();
            wb.creator = 'La Boutique de la Elegancia';
            const ws = wb.addWorksheet('Inventario', {
                views: [{ state: 'frozen', ySplit: 1 }],
                pageSetup: { fitToPage: true, fitToWidth: 1 },
            });

            ws.columns = [
                { header: 'Foto', key: 'foto', width: 12 },
                { header: 'Producto', key: 'producto', width: 34 },
                { header: 'Categoría', key: 'categoria', width: 16 },
                { header: 'Precio venta', key: 'precio', width: 14 },
                { header: 'Costo', key: 'costo', width: 12 },
                { header: 'Ganancia x unidad', key: 'ganancia', width: 16 },
                { header: 'Stock', key: 'stock', width: 9 },
                { header: 'Valor en stock', key: 'valor', width: 15 },
                { header: 'Talles', key: 'talles', width: 16 },
                { header: 'Colores', key: 'colores', width: 16 },
                { header: 'Estado', key: 'estado', width: 12 },
            ];

            // Encabezado dorado
            const head = ws.getRow(1);
            head.height = 30;
            head.eachCell((c) => {
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4AF37' } };
                c.font = { bold: true, color: { argb: 'FF1A1308' }, size: 11, name: 'Calibri' };
                c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                c.border = { bottom: { style: 'medium', color: { argb: 'FFB8932E' } } };
            });

            const imgs = await Promise.all(inventory.map(p => fetchImg(p.image)));

            inventory.forEach((p, i) => {
                const stock = getTotalStock(p);
                const price = Number(p.price) || 0;
                const cost = Number(p.cost) || 0;
                const row = ws.addRow({
                    foto: '',
                    producto: p.name || '',
                    categoria: p.category || '',
                    precio: price,
                    costo: cost || null,
                    ganancia: cost ? price - cost : null,
                    stock,
                    valor: price * stock,
                    talles: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
                    colores: Array.isArray(p.colors) ? p.colors.join(', ') : '',
                    estado: p.active === false ? 'Borrador' : 'Publicado',
                });
                row.height = 75;
                row.eachCell({ includeEmpty: true }, (c) => {
                    c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                    c.border = { bottom: { style: 'thin', color: { argb: 'FFE8E0CC' } } };
                });
                // Filas alternadas (zebra) en crema suave
                if (i % 2 === 1) {
                    row.eachCell({ includeEmpty: true }, (c) => {
                        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF8F0' } };
                    });
                }
                // Formato moneda
                ['precio', 'costo', 'ganancia', 'valor'].forEach((k) => {
                    const c = row.getCell(k);
                    c.numFmt = '"$"#,##0';
                    c.alignment = { vertical: 'middle', horizontal: 'right' };
                });
                row.getCell('stock').alignment = { vertical: 'middle', horizontal: 'center' };
                // Estado con color
                const est = row.getCell('estado');
                est.alignment = { vertical: 'middle', horizontal: 'center' };
                est.font = { bold: true, color: { argb: p.active === false ? 'FF9A6B00' : 'FF1E7A3D' } };

                // Foto embebida
                const buf = imgs[i];
                if (buf) {
                    const imgId = wb.addImage({ buffer: buf, extension: 'jpeg' });
                    ws.addImage(imgId, {
                        tl: { col: 0.15, row: row.number - 1 + 0.08 },
                        ext: { width: 66, height: 73 },
                        editAs: 'oneCell',
                    });
                }
            });

            // Fila total
            const totalStockVal = inventory.reduce((a, p) => a + (Number(p.price) || 0) * getTotalStock(p), 0);
            const totalCostVal = inventory.reduce((a, p) => a + (Number(p.cost) || 0) * getTotalStock(p), 0);
            const tot = ws.addRow({ producto: 'TOTAL', valor: totalStockVal, ganancia: totalStockVal - totalCostVal });
            tot.height = 24;
            tot.eachCell({ includeEmpty: true }, (c) => {
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1308' } };
                c.font = { bold: true, color: { argb: 'FFD4AF37' } };
                c.alignment = { vertical: 'middle' };
            });
            tot.getCell('valor').numFmt = '"$"#,##0';
            tot.getCell('ganancia').numFmt = '"$"#,##0';
            tot.getCell('valor').alignment = { vertical: 'middle', horizontal: 'right' };
            tot.getCell('ganancia').alignment = { vertical: 'middle', horizontal: 'right' };

            const out = await wb.xlsx.writeBuffer();
            const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Inventario_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            addToast('Excel con fotos descargado ✓', 'success');
        } catch (e) {
            console.error(e);
            addToast('Error al exportar el inventario', 'error');
        }
    };

    const paletteCommands = useMemo(() => {
        const cmds = [
            { id: 'act-new-product', label: 'Nuevo producto', group: 'Acción', icon: Tag, action: () => { setAdminTab('inventory'); openNewProduct(); } },
            { id: 'act-assistant', label: 'Abrir Lau (copiloto IA)', group: 'Acción', icon: Bot, action: () => setAdminTab('assistant') },
            { id: 'act-store', label: 'Ir a la tienda', group: 'Acción', icon: LinkIcon, action: () => { window.location.href = '/'; } },
            ...Object.entries(TAB_LABELS).map(([k, label]) => ({ id: `nav-${k}`, label, group: 'Sección', action: () => setAdminTab(k) })),
            ...inventory.slice(0, 80).map(p => ({
                id: `prod-${p.id}`,
                label: `${p.name} — $${Number(p.price || 0).toLocaleString('es-AR')}${p.active === false ? ' · borrador' : ''}`,
                group: 'Producto',
                icon: Tag,
                action: () => { setAdminTab('inventory'); setCurrentProduct(p); setIsProductModalOpen(true); },
            })),
            ...orders.slice(0, 20).map(o => ({
                id: `ord-${o.id}`,
                label: `${o.id} · ${o.customer?.email || 's/email'} · $${Number(o.total || 0).toLocaleString('es-AR')} · ${o.status}`,
                group: 'Pedido',
                icon: Package,
                action: () => setAdminTab('orders'),
            })),
        ];
        return cmds;
    }, [inventory, orders]);

    // --- RENDER HELPERS ---

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-luxury font-bold mb-2">Acceso Restringido</h1>
                <p className="text-slate-400 mb-8">Esta área es exclusiva para personal autorizado.</p>
                <Button variant="secondary" onClick={() => window.location.href = '/'} className="!bg-white !text-black px-8 py-3 rounded-full font-bold hover:!bg-slate-200 transition-colors">
                    Volver a la Tienda
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F5F2EB] dark:bg-[#0A0A0A] font-sans text-slate-800 dark:text-slate-200 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <CommandPalette commands={paletteCommands} />
            {/* BACKDROP MOBILE */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-[fadeIn_.15s_ease-out]"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            {/* SIDEBAR / DRAWER */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1a1a1a] border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl lg:shadow-sm shrink-0 transform transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center">
                        <img src="/assets/logo-seal.png?v=5" alt="La Boutique Logo" className="w-10 h-10 object-contain" />
                        <span className="block ml-3 font-cinzel font-bold text-lg text-slate-800 dark:text-white tracking-widest uppercase">La Boutique</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto" onClick={() => setSidebarOpen(false)}>
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={adminTab === 'dashboard'} onClick={() => setAdminTab('dashboard')} />
                    <SidebarItem icon={Tag} label="Inventario" active={adminTab === 'inventory'} onClick={() => setAdminTab('inventory')} />
                    <SidebarItem icon={Package} label="Pedidos" active={adminTab === 'orders'} onClick={() => setAdminTab('orders')} count={orders.filter(o => o.status === 'pending').length} />
                    <SidebarItem icon={Users} label="Clientes" active={adminTab === 'customers'} onClick={() => setAdminTab('customers')} />
                    <SidebarItem icon={TrendingUp} label="Ventas" active={adminTab === 'sales'} onClick={() => setAdminTab('sales')} />

                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                    <SidebarItem icon={Bot} label="Asistente Lau" active={adminTab === 'assistant'} onClick={() => setAdminTab('assistant')} />
                    <SidebarItem icon={Blocks} label="CMS / Diseño" active={adminTab === 'cms'} onClick={() => setAdminTab('cms')} />
                    <SidebarItem icon={Ticket} label="Cupones" active={adminTab === 'coupons'} onClick={() => setAdminTab('coupons')} />
                    <SidebarItem icon={Building2} label="Proveedores" active={adminTab === 'suppliers'} onClick={() => setAdminTab('suppliers')} />
                    <SidebarItem icon={ShoppingCartIcon} label="Carritos Abandonados" active={adminTab === 'abandoned'} onClick={() => setAdminTab('abandoned')} count={(abandonedCarts || []).filter(c => !c.recovered).length} />
                    <SidebarItem icon={CheckIcon} label="Reseñas" active={adminTab === 'reviews'} onClick={() => setAdminTab('reviews')} count={(reviews || []).filter(r => !r.approved).length} />
                    <p className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Herramientas</p>
                    <SidebarItem icon={Wallet} label="Gastos" active={adminTab === 'expenses'} onClick={() => setAdminTab('expenses')} />
                    <SidebarItem icon={Calculator} label="Historial de Costos" active={adminTab === 'calculator'} onClick={() => setAdminTab('calculator')} />

                    <div className="my-6 border-t border-slate-100 dark:border-slate-800"></div>
                    <p className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Sistema</p>
                    <SidebarItem icon={Settings} label="Configuración" active={adminTab === 'settings'} onClick={() => setAdminTab('settings')} />
                </nav>
                <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-[#161616] space-y-2">
                    <button
                        onClick={() => window.dispatchEvent(new Event('admin:open-command-palette'))}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#D4AF37] w-full justify-start p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#D4AF37]/40 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        <span className="inline flex-1 text-left">Buscar</span>
                        <kbd className="text-[9px] font-bold text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5">⌘K</kbd>
                    </button>
                    <a href="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#D4AF37] w-full justify-start p-2 transition-colors">
                        <LinkIcon className="w-4 h-4" /> <span className="inline">Ir a la Tienda</span>
                    </a>
                    <button onClick={logout} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 w-full justify-start p-2 transition-colors">
                        <LogOut className="w-4 h-4" /> <span className="inline">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
                {/* TOPBAR MOBILE */}
                <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                    <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-cinzel font-bold text-sm uppercase tracking-widest text-slate-800 dark:text-white">{TAB_LABELS[adminTab] || 'Admin'}</span>
                </header>
                {/* INVENTARIO */}
                {adminTab === 'inventory' && (
                    <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-24">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-luxury font-bold dark:text-white text-slate-900 tracking-wider">Inventario Exclusivo</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">Gestiona tu colección premium.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={exportInventory} className="!bg-white dark:!bg-[#1a1a1a] !text-slate-700 dark:!text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-none text-xs uppercase tracking-[0.2em] hover:!border-[#D4AF37] hover:!text-[#D4AF37] transition-all">
                                    ⤓ Exportar Excel
                                </Button>
                                <Button onClick={openNewProduct} className="bg-black hover:bg-[#D4AF37] text-white shadow-xl shadow-black/10 px-6 py-3 rounded-none border border-[#D4AF37] text-xs uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1">
                                    + Nuevo Diseño
                                </Button>
                            </div>
                        </div>

                        {/* STATS RAPIDAS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatSmall label="Valor Inventario" value={formatMoney(metrics.totalValue)} icon={DollarSign} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
                            <StatSmall label="Inversión" value={formatMoney(metrics.invested)} icon={Wallet} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
                            <StatSmall label="Ganancia Potencial" value={formatMoney(metrics.potentialProfit)} icon={TrendingUp} color="text-[#D4AF37] bg-orange-50 dark:bg-orange-900/20" />
                            <StatSmall label="Total Prendas" value={metrics.totalStock} icon={Tag} color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
                        </div>

                        {/* FILTERS TOOLBAR */}
                        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-0 z-30">
                            {/* SEARCH */}
                            <div className="relative w-full lg:w-96 group">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full text-sm border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
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
                                        className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#D4AF37] appearance-none cursor-pointer font-medium hover:bg-slate-50 transition-colors min-w-[140px]"
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
                                        className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#D4AF37] appearance-none cursor-pointer font-medium hover:bg-slate-50 transition-colors min-w-[160px]"
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
                        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 dark:bg-[#161616] text-slate-500 font-luxury uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
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
                                        <tr><td colSpan="6"><EmptyState icon={PackageOpen} title="Sin productos" subtitle={searchTerm || selectedCategory !== 'Todos' || filterLowStock ? 'Ningún producto coincide con los filtros aplicados.' : 'Empezá agregando tu primer diseño con el botón “+ Nuevo Diseño”.'} /></td></tr>
                                    ) : (
                                        invPage.pageItems.map(p => {
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
                                                                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-[#D4AF37] transition-colors">{p.name}</span>
                                                                        {isExpanded ? <ChevronUp className="w-3 h-3 text-[#D4AF37]" /> : <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-[#D4AF37]" />}
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
                                                            {(() => {
                                                                const total = getTotalStock(p);
                                                                const isOut = total === 0;
                                                                const isLow = total > 0 && total <= lowStockThreshold;
                                                                const lowVariantsCount = Array.isArray(p.variants)
                                                                    ? p.variants.filter(v => (v.stock || 0) <= lowStockThreshold).length
                                                                    : 0;
                                                                return (
                                                                    <div className="inline-flex flex-col items-center gap-1">
                                                                        <span className={`font-bold ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                                            {total} u.
                                                                        </span>
                                                                        {lowVariantsCount > 0 && (
                                                                            <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40">
                                                                                {lowVariantsCount} variante{lowVariantsCount > 1 ? 's' : ''} baja{lowVariantsCount > 1 ? 's' : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>

                                                        {/* PRECIO */}
                                                        <td className="p-4 text-right font-bold text-slate-800 dark:text-white">{formatMoney(p.price)}</td>

                                                        {/* ACCIONES */}
                                                        <td className="p-4 text-right pr-6">
                                                            <div className="flex justify-end gap-1">
                                                                <ActionBtn onClick={() => copyProductLink(p.id)} icon={LinkIcon} color="text-blue-500 hover:bg-blue-50" title="Copiar Link" />
                                                                <ActionBtn
                                                                    onClick={() => handlePublishTelegram(p)}
                                                                    icon={SendIcon}
                                                                    color={`text-sky-500 hover:bg-sky-50 ${publishingTgId === p.id ? 'animate-pulse' : ''}`}
                                                                    title="Publicar en Telegram"
                                                                />
                                                                <ActionBtn onClick={() => { setCurrentProduct({ ...p, active: p.active !== false }); setIsProductModalOpen(true); }} icon={Edit2} color="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar" />
                                                                <ActionBtn onClick={() => handleDeleteProduct(p.id)} icon={Trash2} color="text-red-500 hover:bg-red-50" title="Eliminar" />
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* DETALLE EXPANDIDO */}
                                                    {
                                                        isExpanded && (
                                                            <tr className="bg-slate-50 dark:bg-slate-900/30">
                                                                <td colSpan="6" className="p-0">
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
                                                                        <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
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
                        <Pagination page={invPage.page} setPage={invPage.setPage} totalPages={invPage.totalPages} total={invPage.total} pageSize={20} />
                    </div>
                )
                }

                {/* OTHER TABS — carga lazy con Suspense */}
                <Suspense fallback={<TabLoader />}>
                {adminTab === 'dashboard' && <DashboardView
                    metrics={metrics}
                    visitCount={visitCount}
                    salesMetrics={salesMetrics}
                    orders={orders}
                    isMaintenance={isMaintenance}
                    toggleMaintenance={toggleMaintenance}
                    onNavigate={setAdminTab}
                    wishlistData={wishlistEvents}
                    lowStockItems={lowStockItems}
                    lowStockThreshold={lowStockThreshold}
                    activeSessions={activeSessions}
                    visitStatsHourly={visitStatsHourly}
                    onCreateProduct={() => {
                        setCurrentProduct({
                            name: '', price: "", cost: "", shippingCost: "", packagingCost: "", feePercent: "", stock: "",
                            category: '', image: '', media: [], sizes: ['S', 'M'], colors: [], active: false, description: '', badges: {}
                        });
                        setIsProductModalOpen(true);
                    }}
                    onEditProduct={(p) => { setCurrentProduct(p); setIsProductModalOpen(true); }}
                    onToggleVisible={(p) => updateProduct(p.id, { active: p.active === false ? true : false })}
                />}
                {adminTab === 'assistant' && <AdminAssistantView orders={orders} inventory={inventory} onClose={() => setAdminTab('dashboard')} />}
                {adminTab === 'orders' && <OrdersView orders={orders} updateOrderStatus={updateOrderStatus} />}
                {adminTab === 'customers' && <CustomersView orders={orders} />}
                {adminTab === 'sales' && <SalesView salesLog={salesLog} />}
                {
                    adminTab === 'calculator' && <SimulationsView
                        onSaveToProduct={(data) => {
                            setCurrentProduct({
                                ...currentProduct,
                                name: data.name,
                                price: data.price,
                                cost: data.cost,
                                category: '',
                                image: '', media: [], sizes: ['S', 'M'], colors: [], active: false, description: ''
                            });
                            setAdminTab('inventory');
                            setIsProductModalOpen(true);
                        }}
                        onEditProduct={(p) => {
                            setCurrentProduct({ ...p, active: p.active !== false });
                            setIsProductModalOpen(true);
                        }}
                        onDeleteProduct={handleDeleteProduct}
                    />
                }
                {adminTab === 'cms' && <CMSView />}
                {adminTab === 'coupons' && <CouponsView />}
                {adminTab === 'suppliers' && <SuppliersView />}
                {adminTab === 'expenses' && <ExpensesView />}
                {adminTab === 'abandoned' && <AbandonedCartsView />}
                {adminTab === 'reviews' && <ReviewsView />}
                {adminTab === 'settings' && <SettingsView isMaintenance={isMaintenance} toggleMaintenance={toggleMaintenance} migrateData={migrateData} updateSystemVersion={updateSystemVersion} cleanStorage={cleanStorage} siteConfig={siteConfig} updateSiteConfig={updateSiteConfig} />}
                </Suspense>
            </main >

            {/* PRODUCT MODAL */}
            {isProductModalOpen && currentProduct && (
                <Suspense fallback={null}>
                    <ProductEditModal initialProduct={currentProduct} onClose={() => setIsProductModalOpen(false)} />
                </Suspense>
            )}

                        <style>{`
                .input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; outline: none; transition: all 0.2s; font-size: 0.875rem; }
                .input:focus { border-color: #D4AF37; box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
                .dark .input { background: #121212; border-color: #334155; color: white; }
                .dark .input:focus { border-color: #D4AF37; }
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
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-[#D4AF37] transition-colors'}`} />
            <span className="inline">{label}</span>
        </div>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center inline-block shadow-sm">{count}</span>}
    </button>
);

const StatSmall = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">{label}</p><p className="text-xl font-bold dark:text-white">{value}</p></div>
    </div>
);

const ActionBtn = ({ onClick, icon: Icon, color, title }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`p-2 rounded-lg transition-colors ${color}`} title={title}><Icon className="w-4 h-4" /></button>
);
