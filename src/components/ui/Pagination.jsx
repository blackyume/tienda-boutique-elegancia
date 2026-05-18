import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Hook de paginación client-side. Resetea a la página 1 si cambia el dataset
// (ej. al filtrar) para no quedar en una página vacía.
export const usePagination = (items, pageSize = 20) => {
    const [page, setPage] = useState(1);
    const list = items || [];
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    const pageItems = useMemo(
        () => list.slice((page - 1) * pageSize, page * pageSize),
        [list, page, pageSize]
    );

    return { page, setPage, totalPages, pageItems, total: list.length };
};

export const Pagination = ({ page, setPage, totalPages, total, pageSize = 20 }) => {
    if (totalPages <= 1) return null;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    return (
        <div className="flex items-center justify-between gap-4 px-2 py-4 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
                {from}–{to} de {total}
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Página anterior"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                    {page} / {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Página siguiente"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
