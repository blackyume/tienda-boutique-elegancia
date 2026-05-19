import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, ChevronDown, Package, Edit2, EyeOff, Eye } from 'lucide-react';

export const LowStockPanel = ({ items, threshold, onNavigateInventory, onEditProduct, onToggleVisible, compact = false }) => {
    const [expanded, setExpanded] = useState(null);

    if (!items || items.length === 0) {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Stock saludable</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400/80">Nada por debajo de {threshold} u.</p>
                    </div>
                </div>
            </div>
        );
    }

    const critical = items.filter(i => i.critical);
    const shown = compact ? items.slice(0, 5) : items;

    return (
        <div className="bg-white dark:bg-[#1e293b] border border-amber-200 dark:border-amber-900/40 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white">Stock bajo</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {items.length} producto{items.length > 1 ? 's' : ''}
                            {critical.length > 0 && <> · <span className="text-red-500 font-bold">{critical.length} crítico{critical.length > 1 ? 's' : ''}</span></>}
                            {' '}· umbral {threshold} u.
                        </p>
                    </div>
                </div>
                {onNavigateInventory && (
                    <button
                        onClick={onNavigateInventory}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#C19A6B] hover:text-[#a87f4f] flex items-center gap-1 transition-colors"
                    >
                        Ver inventario <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {shown.map(({ product, total, critical: isCritical, variants, isAggregate }) => {
                    const isOpen = expanded === product.id;
                    const canExpand = !isAggregate && variants.length > 0;
                    return (
                        <div key={product.id}>
                            <div className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${canExpand ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''}`}>
                                <button
                                    onClick={() => canExpand && setExpanded(isOpen ? null : product.id)}
                                    disabled={!canExpand}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left disabled:cursor-default"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                        {product.image
                                            ? <img src={product.image} className="w-full h-full object-cover" alt="" />
                                            : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-4 h-4" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{product.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                            {isAggregate ? 'Sin variantes' : `${variants.length} variante${variants.length > 1 ? 's' : ''} baja${variants.length > 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-black ${isCritical ? 'text-red-500' : total === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                                            {total}<span className="text-[10px] ml-0.5 opacity-70">u.</span>
                                        </p>
                                        {canExpand && (
                                            <ChevronDown className={`w-3 h-3 text-slate-400 ml-auto mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </button>
                                {(onEditProduct || onToggleVisible) && (
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        {onEditProduct && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditProduct(product); }}
                                                title="Reponer / editar"
                                                className="p-2 rounded-lg text-slate-500 hover:text-[#C19A6B] hover:bg-[#C19A6B]/10 transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {onToggleVisible && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleVisible(product); }}
                                                title={product.active === false ? 'Mostrar' : 'Ocultar'}
                                                className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                            >
                                                {product.active === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {canExpand && isOpen && (
                                <div className="px-4 pb-4 pl-[4.5rem] bg-slate-50/50 dark:bg-slate-900/30">
                                    <div className="flex flex-wrap gap-2">
                                        {variants.map((v, i) => (
                                            <span
                                                key={i}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${v.stock === 0
                                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50'}`}
                                            >
                                                {v.size && <strong>{v.size}</strong>}
                                                {v.color && <span className="opacity-70">· {v.color}</span>}
                                                <span className="ml-1 font-bold">{v.stock}u.</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {compact && items.length > shown.length && onNavigateInventory && (
                <button
                    onClick={onNavigateInventory}
                    className="w-full py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#C19A6B] bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                    Ver {items.length - shown.length} más
                </button>
            )}
        </div>
    );
};
