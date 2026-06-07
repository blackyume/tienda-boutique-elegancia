
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { StatusSelector } from './StatusSelector';
import { Calculator, Save, Trash2, ArrowRight, DollarSign, FileDown, Sheet, History, Plus } from 'lucide-react';
import { formatMoney, getColorHex } from '../../utils/helpers';
// jsPDF, jspdf-autotable y xlsx se importan dinámicamente al usarse.

export const SimulationsView = ({ onSaveToProduct, onEditProduct, onDeleteProduct }) => {
    const { simulations, saveSimulation, deleteSimulation, addToast, inventory } = useStore();
    const [viewMode, setViewMode] = useState('history'); // Default to showing the list

    // Form State
    const [form, setForm] = useState({
        name: '',
        costPr: '',
        costPack: '',
        shipUnit: '',
        comision: '',
        marginDesired: 50, // %
    });

    const totalCost = Number(form.costPr) + Number(form.costPack) + Number(form.shipUnit);
    // Formula: Price = Cost / (1 - (Margin + Comision)/100)
    // Actually simplicity: Price = Cost * (1 + Margin/100) usually, but user often wants "Clean Margin".
    // Let's stick to a simpler Markup logic for now or the one from the image if apparent.
    // Standard Retail: Price = Cost / (1 - Margin/100).
    // Let's use Markup for simplicity if not specified otherwise: Cost * (1 + Margin/100).
    // Wait, the user image showed "Ganancion Neta".
    // Let's implement a robust calculation.

    // Let's try: Price = (TotalCost) / (1 - (MarginDesired/100) - (Comision/100))
    // This ensures that after paying costs and commission, the remaining % is the Margin.
    // Validator: if margin + comision >= 100, infinite price.
    const denominator = 1 - ((Number(form.marginDesired) + Number(form.comision)) / 100);
    const suggestedPrice = denominator > 0 ? totalCost / denominator : 0;

    const comisionAmount = suggestedPrice * (Number(form.comision) / 100);
    const netProfit = suggestedPrice - totalCost - comisionAmount;

    const handleSave = async () => {
        if (!form.name) return addToast("Ingresá un nombre para la simulación", "error");

        await saveSimulation({
            ...form,
            suggestedPrice,
            netProfit,
            totalCost
        });
        addToast("Simulación guardada en el historial", "success");
        setViewMode('history');
    };

    const exportToPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Historial de Simulaciones", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString()} `, 14, 28);

        const tableColumn = ["Fecha", "Producto", "Costo", "Precio Sugerido", "Margen", "Ganancia"];
        const tableRows = simulations.map(sim => [
            new Date(sim.createdAt).toLocaleDateString(),
            sim.name,
            formatMoney(sim.totalCost),
            formatMoney(sim.suggestedPrice),
            `${sim.marginDesired}% `, // Changed from sim.margin to sim.marginDesired
            formatMoney(sim.netProfit) // Changed from sim.profit to sim.netProfit
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [212, 175, 55], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 242, 235] },
            styles: { fontSize: 9 }
        });

        doc.save(`simulaciones_costos_${new Date().toISOString().slice(0, 10)}.pdf`);
        addToast("PDF descargado correctamente", "success");
    };

    const exportToExcel = async () => {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(simulations.map(sim => ({
            Fecha: new Date(sim.createdAt).toLocaleDateString(),
            Producto: sim.name,
            "Costo Total ($)": sim.totalCost,
            "Flete Unitario ($)": sim.shipUnit || sim.shippingCost, // handle both keys if legacy
            "Packaging ($)": sim.costPack || sim.packagingCost,
            "Comisión MP (%)": sim.comision || sim.feePercent,
            "Precio Sugerido ($)": sim.suggestedPrice,
            "Margen Deseado (%)": sim.marginDesired,
            "Ganancia Neta ($)": sim.netProfit
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Simulaciones");

        // Auto-width
        const max_width = simulations.reduce((w, r) => Math.max(w, r.name.length), 10);
        worksheet["!cols"] = [{ wch: 12 }, { wch: max_width + 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];

        XLSX.writeFile(workbook, `Reporte_Simulaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
        addToast("Excel descargado correctamente", "success");
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <Calculator className="w-8 h-8 text-[#D4AF37]" /> Simulador de Costos
                </h1>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-2">
                    <button
                        onClick={() => setViewMode('new')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'new' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#D4AF37]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Calculadora Rápida
                    </button>
                    <button
                        onClick={() => setViewMode('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#D4AF37]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Inventario y Costos
                    </button>
                </div>
            </div>

            {viewMode === 'new' ? (
                <div className="animate-fadeIn">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative mb-8">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">

                            {/* RESULTS DISPLAY - LEFT/TOP (Hero Section) */}
                            <div className="lg:col-span-5 text-center lg:text-left space-y-6">
                                <div>
                                    <h2 className="text-[#D4AF37] font-bold text-sm tracking-[0.2em] uppercase mb-2">Precio Sugerido de Venta</h2>
                                    <div className="text-6xl md:text-7xl font-black tracking-tighter text-white drop-shadow-lg">
                                        {formatMoney(suggestedPrice)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                    <div className="text-center lg:text-left">
                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Costo Total</p>
                                        <p className="font-mono text-xl">{formatMoney(totalCost)}</p>
                                    </div>
                                    <div className="text-center lg:text-left border-l border-white/10 pl-4">
                                        <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider mb-1">Tu Ganancia Neta</p>
                                        <p className="font-mono text-xl text-emerald-400 font-bold">+{formatMoney(netProfit)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button onClick={handleSave} className="flex-1 !bg-white !text-slate-900 hover:!bg-slate-200 font-bold">
                                        <Save className="w-4 h-4 mr-2" /> Guardar en Historial
                                    </Button>
                                    {onSaveToProduct && (
                                        <Button onClick={() => onSaveToProduct({ name: form.name, price: suggestedPrice, cost: totalCost })} className="flex-1 bg-[#D4AF37] text-white hover:bg-[#B8932E] font-bold">
                                            <Plus className="w-4 h-4 mr-2" /> Crear Producto
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* INPUTS - RIGHT (Control Panel) */}
                            <div className="lg:col-span-7 bg-white dark:bg-[#121212] p-6 md:p-8 rounded-2xl text-slate-900 dark:text-white shadow-lg border border-slate-100 dark:border-slate-800">
                                <div className="space-y-6">
                                    {/* ID */}
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Referencia / Nombre</label>
                                        <input
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Ej: Campera Cuero Invierno"
                                            className="w-full text-lg font-bold border-b-2 border-slate-200 dark:border-slate-700 bg-transparent px-2 py-3 outline-none focus:border-[#D4AF37] transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        />
                                    </div>

                                    {/* COST GRID */}
                                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="group">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block group-focus-within:text-[#D4AF37] transition-colors">Costo Prenda ($)</label>
                                            <div className="relative">
                                                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37]" />
                                                <input
                                                    type="number"
                                                    value={form.costPr}
                                                    onChange={e => setForm({ ...form, costPr: Math.max(0, e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block group-focus-within:text-[#D4AF37] transition-colors">Packaging ($)</label>
                                            <div className="relative">
                                                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37]" />
                                                <input
                                                    type="number"
                                                    value={form.costPack}
                                                    onChange={e => setForm({ ...form, costPack: Math.max(0, e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block group-focus-within:text-[#D4AF37] transition-colors">Flete Unitario ($)</label>
                                            <div className="relative">
                                                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37]" />
                                                <input
                                                    type="number"
                                                    value={form.shipUnit}
                                                    onChange={e => setForm({ ...form, shipUnit: Math.max(0, e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block group-focus-within:text-[#D4AF37] transition-colors">Comisión Plataforma (%)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                                                <input
                                                    type="number"
                                                    value={form.comision}
                                                    onChange={e => setForm({ ...form, comision: Math.max(0, e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* MARGIN SLIDER */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-bold uppercase text-slate-500">Margen de Ganancia Deseado</label>
                                            <span className="text-2xl font-black text-[#D4AF37]">{form.marginDesired}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            step="5"
                                            value={form.marginDesired}
                                            onChange={e => setForm({ ...form, marginDesired: Number(e.target.value) })}
                                            className="w-full accent-[#D4AF37] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden animate-fadeIn">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs uppercase font-bold text-slate-500">Mostrando Inventario Activo</p>
                        <div className="flex">
                            <Button onClick={exportToPDF} className="text-xs bg-red-600 text-white hover:bg-red-700 mr-2">
                                <FileDown className="w-4 h-4 mr-2" /> PDF
                            </Button>
                            <Button onClick={exportToExcel} className="text-xs bg-green-600 text-white hover:bg-green-700">
                                <Sheet className="w-4 h-4 mr-2" /> Excel
                            </Button>
                        </div>
                    </div>
                    {inventory.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hay productos en el inventario.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                                        <th className="p-4 whitespace-nowrap">Producto</th>
                                        <th className="p-4 text-center whitespace-nowrap">Disponibilidad</th>
                                        <th className="p-4 text-right whitespace-nowrap">Costo Total</th>
                                        <th className="p-4 text-right whitespace-nowrap">Precio Venta</th>
                                        <th className="p-4 text-right whitespace-nowrap">Neto</th>
                                        <th className="p-4 text-right whitespace-nowrap">Margen</th>
                                        <th className="p-4 text-right whitespace-nowrap">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(p => {
                                        // Calculate metrics on the fly for inventory items
                                        const prodTotalCost = (Number(p.cost) || 0) + (Number(p.shippingCost) || 0) + (Number(p.packagingCost) || 0) + (Number(p.fixedFee) || 0);
                                        const prodComision = p.price * ((p.feePercent || 0) / 100);
                                        const prodNet = p.price - prodTotalCost - prodComision;
                                        const prodMargin = p.price > 0 ? (prodNet / p.price) * 100 : 0;

                                        return (
                                            <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                                            {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px]">IMG</div>}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                                {p.colors && p.colors.length > 0 && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(p.colors[0]) }} />}
                                                                {p.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 uppercase">{p.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <StatusSelector product={p} />
                                                </td>
                                                <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(prodTotalCost)}</td>
                                                <td className="p-4 text-right font-mono font-bold text-slate-800 dark:text-white">{formatMoney(p.price)}</td>
                                                <td className="p-4 text-right font-mono text-green-600 dark:text-green-400 font-bold">+{formatMoney(prodNet)}</td>
                                                <td className="p-4 text-right font-bold text-xs">
                                                    <span className={`px-2 py-1 rounded-lg ${prodMargin < 30 ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'}`}>
                                                        {prodMargin.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => onEditProduct && onEditProduct(p)}
                                                            className="p-2 text-slate-400 hover:text-[#D4AF37] transition-colors"
                                                            title="Editar Costos"
                                                        >
                                                            <Calculator className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteProduct && onDeleteProduct(p.id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Eliminar del Inventario"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
