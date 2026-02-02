import React, { useMemo, useState } from 'react';
import { Package, Users, Wallet, TrendingUp, ShoppingCart, Plus, Search, MessageSquare, Settings, Lock, Calendar, Download, Activity, Trophy, Percent } from 'lucide-react';
import { formatMoney } from '../../utils/helpers';
import { RealTimeClock, StatCard, ActionButton } from './AdminShared';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from 'xlsx';

export const DashboardView = ({ metrics, visitCount, salesMetrics, orders, isMaintenance, toggleMaintenance, onNavigate, onCreateProduct }) => {

    const [dateRange, setDateRange] = useState('30'); // 7, 30, all

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

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

        // Best Selling Category
        const bestCategory = categoryData.length > 0 ? categoryData[0].name : "N/A";

        return { chartData, topProducts, totalRevenue, count, categoryData, COLORS, bestCategory };
    }, [filteredOrders, dateRange]);

    const handleExport = () => {
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
        <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-24 space-y-8 animate-fadeIn">
            {/* HEADER & STATUS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-wider">Centro de Comando</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">Visión general del negocio.</p>
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

                    <div className="flex items-center gap-4">
                        <RealTimeClock />
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${isMaintenance ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {isMaintenance ? 'MANTENIMIENTO' : 'ONLINE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard label="Ingresos (Periodo)" value={formatMoney(salesInteractions.totalRevenue)} sub={`${salesInteractions.count} pedidos en rango`} icon={Wallet} theme="emerald" />
                <StatCard label="Tasa de Conversión" value={`${visitCount > 0 ? ((salesInteractions.count / visitCount) * 100).toFixed(1) : 0}%`} sub="Visitas vs Pedidos" icon={Activity} theme="blue" />
                <StatCard label="Valor en Stock" value={formatMoney(metrics.totalValue)} sub={`${metrics.totalStock} Prendas disponibles`} icon={Package} theme="purple" />
                <StatCard label="Ticket Promedio" value={formatMoney(salesInteractions.count > 0 ? salesInteractions.totalRevenue / salesInteractions.count : 0)} sub="En periodo seleccionado" icon={TrendingUp} theme="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CHARTS COLUMN */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ACCESOS DIRECTOS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <ActionButton icon={Plus} label="Nuevo Producto" onClick={onCreateProduct} color="bg-slate-800 text-white hover:bg-black border-transparent" />
                        <ActionButton icon={Search} label="Ver Pedidos" onClick={() => onNavigate('orders')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />
                        <ActionButton icon={Users} label="Clientes" onClick={() => onNavigate('customers')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />
                        <ActionButton icon={Package} label="Inventario" onClick={() => onNavigate('inventory')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />

                        <ActionButton icon={Settings} label="CMS / Diseño" onClick={() => onNavigate('cms')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />
                        <ActionButton icon={Percent} label="Cupones" onClick={() => onNavigate('coupons')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />
                        <ActionButton icon={MessageSquare} label="Asistente IA" onClick={() => onNavigate('ai-assistant')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />
                        <ActionButton icon={Settings} label="Configuración" onClick={() => onNavigate('settings')} color="bg-white dark:bg-[#1e293b] text-slate-600 dark:text-white hover:text-[#C19A6B] hover:border-[#C19A6B]" />
                    </div>

                    {/* CHART: VENTAS SEMANALES */}
                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#C19A6B]" /> Tendencia de Ventas</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesInteractions.chartData}>
                                    <defs>
                                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C19A6B" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#C19A6B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis hide={true} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(value) => [formatMoney(value), 'Ventas']} />
                                    <Area type="monotone" dataKey="ventas" stroke="#C19A6B" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* CHART: VENTAS POR CATEGORIA */}
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Package className="w-4 h-4 text-[#C19A6B]" /> Ventas por Categoría</h3>
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
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Trophy className="w-4 h-4 text-[#C19A6B]" /> Top Productos</h3>
                            <div className="space-y-4">
                                {salesInteractions.topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-[#C19A6B] text-white' : 'bg-slate-200 text-slate-600'}`}>
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
                    {/* STOCK LEVEL */}
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Estado del Stock</h3>
                            <p className="text-slate-400 text-xs mb-6">Resumen de inventario actual</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-black">{metrics.totalStock}</span>
                                <span className="text-sm font-medium opacity-70 mb-1">/ Prendas Totales</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#C19A6B]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY LOG (EXPANDED) */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#C19A6B]" /> Actividad Reciente
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {filteredOrders.slice(0, 8).map(order => (
                                <div key={order.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-l-2 border-transparent hover:border-[#C19A6B]">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                            <span className="text-xs font-bold dark:text-white">Pedido #{order.id.slice(-4)}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{new Date(order.date).toLocaleDateString()}</span>
                                    </div>

                                    <div className="pl-4">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{order.customer.email}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {order.items.length} items • <span className="text-slate-600 dark:text-slate-300 font-bold">{formatMoney(order.total)}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Sin actividad reciente.</p>}
                        </div>
                    </div>

                    {/* CATEGORY LEADER (NEW) */}
                    <div className="bg-[#C19A6B] text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase opacity-80 mb-1">Categoría Líder</p>
                            <h3 className="text-2xl font-black">{salesInteractions.bestCategory}</h3>
                        </div>
                        <Trophy className="w-8 h-8 opacity-50" />
                    </div>
                </div>
            </div>
        </div>
    );
};
