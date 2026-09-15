import React, { useMemo, useState, useEffect } from 'react';
import { Package, Wallet, TrendingUp, ShoppingCart, Calendar, Download, Activity, Trophy, Heart, Truck, CreditCard, MessageSquare, AlertTriangle, ChevronRight, BarChart3 } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';
import { StatCard } from './AdminShared';
import { LowStockPanel } from './LowStockPanel';
import { OnboardingPanel } from './OnboardingPanel';
import { getLiveVisitors } from '../../utils/presence';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { pendientesDeHoy, favoritosTop, visitasPorDia, resumenStock, avisosDeLlaves } from '../../utils/inicio';
import { tituloDeProducto } from '../../utils/nombres';
import { OrdersNeedingReviewPanel } from './OrdersNeedingReviewPanel';
// xlsx se importa dinámico para no cargar 700kB en el bundle del admin.

export const DashboardView = ({ metrics, visitCount, salesMetrics, orders, isMaintenance, toggleMaintenance, onNavigate, onCreateProduct, onEditProduct, onToggleVisible, wishlistData = [], lowStockItems = [], lowStockThreshold = 5, activeSessions = [], visitStatsHourly = [], abandonedCarts = [], reviews = [], inventory = [], siteConfig, aiConfig }) => {

    // Re-render cada 15s para actualizar el corte de sesiones "vivas"
    const [, tick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => tick(n => n + 1), 15_000);
        return () => clearInterval(t);
    }, []);

    const liveVisitors = useMemo(() => getLiveVisitors(activeSessions), [activeSessions]);

    // Visitas por día de las últimas dos semanas: alcanza para ver si un posteo movió gente.
    const visitasDiarias = useMemo(() => visitasPorDia(visitStatsHourly, 14), [visitStatsHourly]);
    const visitas14 = visitasDiarias.reduce((acc, p) => acc + p.visitas, 0);
    const picoVisitas = visitasDiarias.reduce((m, p) => (p.visitas > m.visitas ? p : m), visitasDiarias[0] || { visitas: 0 });

    const hoy = useMemo(() => pendientesDeHoy({ orders, abandonedCarts, reviews }), [orders, abandonedCarts, reviews]);
    const favoritos = useMemo(() => favoritosTop(wishlistData, inventory), [wishlistData, inventory]);
    const stock = useMemo(() => resumenStock(inventory), [inventory]);
    const avisos = useMemo(() => avisosDeLlaves({ siteConfig, aiConfig }), [siteConfig, aiConfig]);

    const [dateRange, setDateRange] = useState('30'); // 7, 30, all
    const [showComparison, setShowComparison] = useState(true); // Toggle comparación temporal

    // --- BI DATA PROCESSING ---
    const filteredOrders = useMemo(() => {
        if (dateRange === 'all') return orders;
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - parseInt(dateRange));
        return orders.filter(o => new Date(o.date) >= past);
    }, [orders, dateRange]);

    const salesInteractions = useMemo(() => {
        // Recalculate based on filtered orders
        const targetOrders = filteredOrders;

        // Group by Date for Chart
        // Generate last N days labels based on range (or just data points if 'all')
        // For simplicity, if 'all', we group by month or just list last 30?
        // Let's stick to the previous chart logic but using targetOrders
        // If range is 7 or 30, show that many days.

        const days = parseInt(dateRange) || 30; // default 30 for 'all' visual
        const labels = [...Array(days)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return d.toISOString().split('T')[0];
        });

        const chartData = labels.map(date => {
            const dayOrders = targetOrders.filter(o => o.date.startsWith(date));
            const total = dayOrders.reduce((sum, o) => sum + o.total, 0);
            return {
                date: new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
                ventas: total
            };
        });

        // Top Products (from filtered orders)
        const productMap = {};
        targetOrders.forEach(o => {
            o.items.forEach(item => {
                if (!productMap[item.name]) productMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
                productMap[item.name].quantity += item.quantity;
                productMap[item.name].revenue += item.price * item.quantity;
            });
        });
        const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        // Recalculate Totals for cards
        const totalRevenue = targetOrders.reduce((sum, o) => sum + o.total, 0);
        const count = targetOrders.length;

        // Category Split for Pie Chart
        const categoryMap = {};
        targetOrders.forEach(o => {
            o.items.forEach(item => {
                const cat = item.category || 'Otros';
                if (!categoryMap[cat]) categoryMap[cat] = 0;
                categoryMap[cat] += item.price * item.quantity;
            });
        });
        const categoryData = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const COLORS = ['#E8C65E', '#334155', '#94a3b8', '#475569', '#1a1a1a'];

        // Best Selling Category
        const bestCategory = categoryData.length > 0 ? categoryData[0].name : "N/A";

        return { chartData, topProducts, totalRevenue, count, categoryData, COLORS, bestCategory };
    }, [filteredOrders, dateRange]);

    // --- TEMPORAL COMPARISON (Current Period vs Previous Period) ---
    const periodComparison = useMemo(() => {
        const days = dateRange === 'all' ? 30 : parseInt(dateRange);
        const now = new Date();

        // Current period
        const currentStart = new Date();
        currentStart.setDate(now.getDate() - days);
        const currentOrders = orders.filter(o => new Date(o.date) >= currentStart);
        const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
        const currentCount = currentOrders.length;

        // Previous period (same duration, before current)
        const prevEnd = new Date(currentStart);
        const prevStart = new Date();
        prevStart.setDate(prevEnd.getDate() - days);
        const prevOrders = orders.filter(o => {
            const d = new Date(o.date);
            return d >= prevStart && d < prevEnd;
        });
        const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);
        const prevCount = prevOrders.length;

        // Calculate changes
        const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : currentRevenue > 0 ? 100 : 0;
        const ordersChange = prevCount > 0 ? ((currentCount - prevCount) / prevCount * 100).toFixed(1) : currentCount > 0 ? 100 : 0;
        const avgTicketCurrent = currentCount > 0 ? currentRevenue / currentCount : 0;
        const avgTicketPrev = prevCount > 0 ? prevRevenue / prevCount : 0;
        const ticketChange = avgTicketPrev > 0 ? ((avgTicketCurrent - avgTicketPrev) / avgTicketPrev * 100).toFixed(1) : 0;

        // Series diarias para sparklines (máx 30 días)
        const seriesDays = Math.min(days, 30);
        const revenueSeries = Array(seriesDays).fill(0);
        const ordersSeries = Array(seriesDays).fill(0);
        currentOrders.forEach(o => {
            const idx = seriesDays - 1 - Math.floor((now - new Date(o.date)) / 86400000);
            if (idx >= 0 && idx < seriesDays) {
                revenueSeries[idx] += o.total;
                ordersSeries[idx] += 1;
            }
        });

        return {
            revenueSeries,
            ordersSeries,
            currentRevenue,
            currentCount,
            prevRevenue,
            prevCount,
            revenueChange: parseFloat(revenueChange),
            ordersChange: parseFloat(ordersChange),
            ticketChange: parseFloat(ticketChange),
            avgTicketCurrent
        };
    }, [orders, dateRange]);

    const handleExport = async () => {
        const XLSX = await import('xlsx');
        const data = filteredOrders.map(o => ({
            ID: o.id,
            Fecha: new Date(o.date).toLocaleDateString(),
            Cliente: o.customer?.email || 'Guest',
            Monto: o.total,
            Estado: o.status
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, "Reporte_Ventas.xlsx");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#121212] relative overflow-hidden font-sans text-slate-900 dark:text-slate-100">
            {/* Premium Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:invert"></div>

            <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10 space-y-12 animate-fadeIn">
                <OrdersNeedingReviewPanel
                    orders={orders}
                    onNavigateOrders={() => onNavigate('orders')}
                />

                {avisos.length > 0 && (
                    <div className="space-y-2">
                        {avisos.map(a => (
                            <button
                                key={a.id}
                                type="button"
                                onClick={() => onNavigate(a.goto)}
                                className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-colors ${a.nivel === 'alto'
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/40 hover:bg-red-100/60 dark:hover:bg-red-900/20'
                                    : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/40 hover:bg-amber-100/60 dark:hover:bg-amber-900/20'}`}
                            >
                                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${a.nivel === 'alto' ? 'text-red-500' : 'text-amber-500'}`} />
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-bold text-slate-800 dark:text-white">{a.titulo}</span>
                                    <span className="block text-xs text-slate-600 dark:text-slate-300 mt-0.5">{a.detalle}</span>
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            </button>
                        ))}
                    </div>
                )}

                {/* HEADER & STATUS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-wider">Inicio</h1>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isMaintenance ? 'border-red-500/40 text-red-500 bg-red-500/10' : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {isMaintenance ? 'En mantenimiento' : 'Abierta'}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">Cómo va la tienda hoy.</p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 px-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-white cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white"
                                >
                                    <option value="7">Últimos 7 días</option>
                                    <option value="30">Últimos 30 días</option>
                                    <option value="all">Todo el Histórico</option>
                                </select>
                            </div>
                            <button onClick={handleExport} className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity">
                                <Download className="w-3 h-3" /> Exportar
                            </button>
                        </div>
                    </div>
                </div>

                {/* PRIMEROS PASOS (puesta en marcha) */}
                <OnboardingPanel
                    onCreateProduct={onCreateProduct}
                    onNavigate={onNavigate}
                    toggleMaintenance={toggleMaintenance}
                    isMaintenance={isMaintenance}
                />

                {/* KPI GRID */}
                {orders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
                        <span className="w-14 h-14 rounded-full bg-[#E8C65E]/15 flex items-center justify-center shrink-0">
                            <Wallet className="w-7 h-7 text-[#E8C65E]" />
                        </span>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900 dark:text-white text-lg">Todavía no hubo ventas</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Cuando entre la primera, acá vas a ver los ingresos, los pedidos, el ticket promedio y cuántas visitas terminan en compra. Mientras tanto: {visitCount > 0 ? <strong className="text-slate-700 dark:text-slate-200">{visitCount} visitas</strong> : 'sin visitas'} en el período.
                            </p>
                        </div>
                        {isMaintenance && (
                            <button onClick={toggleMaintenance} className="shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg bg-[#E8C65E] text-black hover:opacity-90 transition-opacity">Abrir la tienda</button>
                        )}
                    </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <StatCard
                        label="Ingresos (Periodo)"
                        value={formatMoney(salesInteractions.totalRevenue)}
                        sub={periodComparison.revenueChange !== 0 && (
                            <span className="flex items-center gap-1">
                                <span className={periodComparison.revenueChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                    {periodComparison.revenueChange > 0 ? '↑' : '↓'} {Math.abs(periodComparison.revenueChange)}%
                                </span>
                                <span className="text-slate-400">vs período anterior</span>
                            </span>
                        )}
                        icon={Wallet}
                        theme="emerald"
                        spark={periodComparison.revenueSeries}
                    />
                    <StatCard
                        label="Pedidos"
                        value={salesInteractions.count}
                        sub={periodComparison.ordersChange !== 0 && (
                            <span className="flex items-center gap-1">
                                <span className={periodComparison.ordersChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                    {periodComparison.ordersChange > 0 ? '↑' : '↓'} {Math.abs(periodComparison.ordersChange)}%
                                </span>
                                <span className="text-slate-400">vs anterior</span>
                            </span>
                        )}
                        icon={ShoppingCart}
                        theme="blue"
                        spark={periodComparison.ordersSeries}
                    />
                    <StatCard
                        label="Ticket Promedio"
                        value={formatMoney(periodComparison.avgTicketCurrent)}
                        sub={periodComparison.ticketChange !== 0 && (
                            <span className="flex items-center gap-1">
                                <span className={periodComparison.ticketChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                    {periodComparison.ticketChange > 0 ? '↑' : '↓'} {Math.abs(periodComparison.ticketChange)}%
                                </span>
                                <span className="text-slate-400">vs anterior</span>
                            </span>
                        )}
                        icon={TrendingUp}
                        theme="orange"
                    />
                    <StatCard
                        label="Tasa Conversión"
                        value={`${visitCount > 0 ? ((salesInteractions.count / visitCount) * 100).toFixed(1) : 0}%`}
                        sub={`${visitCount} visitas totales`}
                        icon={Activity}
                        theme="purple"
                    />
                </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CHARTS COLUMN */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HOY: lo que hay que atender */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#E8C65E]" /> Hoy
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {hoy.porEnviar + hoy.porConfirmar + hoy.carritos + hoy.resenas === 0 ? 'Nada pendiente' : 'Lo que espera una respuesta tuya'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    { n: hoy.porEnviar, label: 'Por enviar', hint: 'Pagados, sin despachar', icon: Truck, tab: 'orders' },
                                    { n: hoy.porConfirmar, label: 'Pagos por confirmar', hint: 'Esperando pago o coordinación', icon: CreditCard, tab: 'orders' },
                                    { n: hoy.carritos, label: 'Carritos de hoy', hint: 'Sin terminar en las últimas 24 h', icon: ShoppingCart, tab: 'abandoned' },
                                    { n: hoy.resenas, label: 'Reseñas por aprobar', hint: 'No se ven hasta que las apruebes', icon: MessageSquare, tab: 'reviews' },
                                ].map(({ n, label, hint, icon: Icon, tab }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => onNavigate(tab)}
                                        className={`text-left p-4 rounded-xl border transition-all group ${n > 0
                                            ? 'border-[#E8C65E]/50 bg-[#E8C65E]/5 hover:bg-[#E8C65E]/10'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Icon className={`w-4 h-4 ${n > 0 ? 'text-[#E8C65E]' : 'text-slate-400'}`} />
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#E8C65E] transition-colors" />
                                        </div>
                                        <p className={`text-3xl font-black leading-none ${n > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{n}</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">{label}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{hint}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FAVORITOS: lo que más guardan las clientas */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-[#E8C65E]" /> Lo más guardado en favoritos
                                </h3>
                                <span className="text-xs text-slate-400">Últimos 30 días</span>
                            </div>
                            {favoritos.length === 0 ? (
                                <p className="text-sm text-slate-400 py-4 text-center">Cuando las clientas empiecen a guardar prendas con el corazón, acá vas a ver cuáles, y cuánto stock te queda de cada una.</p>
                            ) : (
                                <div className="space-y-2">
                                    {favoritos.map((f, i) => (
                                        <div key={f.productId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-[#E8C65E] text-black' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</span>
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                {f.product?.image && <img src={f.product.image} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{tituloDeProducto(f.name)}</p>
                                                <p className="text-[11px] text-slate-400">{f.count} {f.count === 1 ? 'vez guardado' : 'veces guardado'}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {f.stock === null
                                                    ? <span className="text-[11px] text-slate-400">ya no está</span>
                                                    : <span className={`text-sm font-black ${f.stock === 0 ? 'text-red-500' : f.stock <= 2 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'}`}>{f.stock}<span className="text-[10px] ml-0.5 opacity-70">u.</span></span>}
                                                {f.product && onEditProduct && (
                                                    <button onClick={() => onEditProduct(f.product)} className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-[#E8C65E] transition-colors">Editar</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* VISITAS POR DÍA (14 días) */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-[#E8C65E]" /> Visitas por día
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {visitas14} en 14 días{picoVisitas.visitas > 0 && <> · pico el {picoVisitas.label} ({picoVisitas.visitas})</>}
                                </span>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={visitasDiarias} barCategoryGap="30%">
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={1} />
                                        <YAxis hide={true} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'rgba(232,198,94,0.08)' }} contentStyle={{ borderRadius: '12px', border: 'none', background: '#1a1a1a', color: '#fff' }} formatter={(v) => [`${v} visitas`, '']} labelFormatter={(l) => `Día ${l}`} />
                                        <Bar dataKey="visitas" radius={[4, 4, 0, 0]}>
                                            {visitasDiarias.map((p) => (
                                                <Cell key={p.fecha} fill={p.fecha === picoVisitas.fecha && p.visitas > 0 ? '#E8C65E' : 'rgba(232,198,94,0.45)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {visitas14 === 0 && <p className="text-xs text-slate-400 text-center mt-3">Todavía no hay visitas medidas. Las tuyas no cuentan.</p>}
                        </div>

                        {/* CHART: VENTAS SEMANALES */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#E8C65E]" /> Tendencia de Ventas</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesInteractions.chartData}>
                                        <defs>
                                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#E8C65E" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#E8C65E" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <YAxis hide={true} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(value) => [formatMoney(value), 'Ventas']} />
                                        <Area type="monotone" dataKey="ventas" stroke="#E8C65E" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* CHART: VENTAS POR CATEGORIA */}
                            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Package className="w-4 h-4 text-[#E8C65E]" /> Ventas por Categoría</h3>
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={salesInteractions.categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {salesInteractions.categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={salesInteractions.COLORS[index % salesInteractions.COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatMoney(value)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {salesInteractions.categoryData.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
                                    )}
                                </div>
                            </div>

                            {/* TOP PRODUCTS */}
                            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Trophy className="w-4 h-4 text-[#E8C65E]" /> Top Productos</h3>
                                <div className="space-y-4">
                                    {salesInteractions.topProducts.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-[#E8C65E] text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{p.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-bold text-slate-900 dark:text-white">{formatMoney(p.revenue)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {salesInteractions.topProducts.length === 0 && <p className="text-center text-slate-400 text-sm">Aún no hay datos suficientes.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR INFO */}
                    <div className="space-y-6">
                        {/* LIVE VISITORS */}
                        <div className="bg-white dark:bg-[#1a1a1a] border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full opacity-60" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">En vivo</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-slate-900 dark:text-white">{liveVisitors.length}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-2">visitante{liveVisitors.length !== 1 ? 's' : ''} ahora</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Actualizado cada 15s · excluye admin.</p>
                            </div>
                        </div>

                        {/* ESTADO DEL STOCK */}
                        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Package className="w-4 h-4 text-[#E8C65E]" /> Stock</h3>
                                <span className="text-xs text-slate-400">{metrics.totalStock} prendas · {stock.total} productos</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 py-3">
                                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stock.conStock}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Con stock</p>
                                </div>
                                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 py-3">
                                    <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{stock.ultimas}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80 mt-0.5">Últimas u.</p>
                                </div>
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 py-3">
                                    <p className="text-2xl font-black text-red-600 dark:text-red-400">{stock.agotados}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600/80 dark:text-red-400/80 mt-0.5">Agotados</p>
                                </div>
                            </div>
                            {stock.ocultos > 0 && (
                                <button onClick={() => onNavigate('inventory')} className="mt-3 w-full text-left text-[11px] text-slate-400 hover:text-[#E8C65E] transition-colors">
                                    {stock.ocultos} {stock.ocultos === 1 ? 'producto oculto que las clientas no ven' : 'productos ocultos que las clientas no ven'} →
                                </button>
                            )}
                        </div>

                        {/* LOW STOCK ALERTS */}
                        <LowStockPanel
                            items={lowStockItems}
                            threshold={lowStockThreshold}
                            onNavigateInventory={() => onNavigate('inventory')}
                            onEditProduct={onEditProduct}
                            onToggleVisible={onToggleVisible}
                            compact
                        />

                        {/* RECENT ACTIVITY LOG (EXPANDED) */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#E8C65E]" /> Actividad Reciente
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {filteredOrders.slice(0, 8).map(order => (
                                    <div key={order.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-l-2 border-transparent hover:border-[#E8C65E]">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                                <span className="text-xs font-bold dark:text-white">Pedido #{order.id.slice(-4)}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>

                                        <div className="pl-4">
                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{order.customer?.email || 'Cliente'}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {(order.items?.length || 0)} items • <span className="text-slate-600 dark:text-slate-300 font-bold">{formatMoney(order.total)}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {filteredOrders.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Sin actividad reciente.</p>}
                            </div>
                        </div>

                        {/* CATEGORÍA LÍDER — sólo con ventas */}
                        {salesInteractions.categoryData.length > 0 && (
                        <div className="bg-[#E8C65E] text-black p-6 rounded-2xl shadow-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase opacity-80 mb-1">Categoría Líder</p>
                                <h3 className="text-2xl font-black">{salesInteractions.bestCategory}</h3>
                            </div>
                            <Trophy className="w-8 h-8 opacity-50" />
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
