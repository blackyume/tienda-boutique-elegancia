import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';

// Paleta de comandos estilo Linear/Raycast. ⌘K / Ctrl+K para abrir.
export const CommandPalette = ({ commands }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        const openEvt = () => setOpen(true);
        window.addEventListener('keydown', onKey);
        window.addEventListener('admin:open-command-palette', openEvt);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('admin:open-command-palette', openEvt);
        };
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActive(0);
            setTimeout(() => inputRef.current?.focus(), 20);
        }
    }, [open]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return commands;
        return commands.filter((c) =>
            c.label.toLowerCase().includes(q) || (c.group || '').toLowerCase().includes(q)
        );
    }, [query, commands]);

    useEffect(() => { setActive(0); }, [query]);

    const run = (cmd) => {
        if (!cmd) return;
        setOpen(false);
        cmd.action();
    };

    const onInputKey = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        if (e.key === 'Enter') { e.preventDefault(); run(filtered[active]); }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_.12s_ease-out]" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-[scaleIn_.15s_ease-out]">
                <div className="flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onInputKey}
                        placeholder="Buscar sección o acción…"
                        className="flex-1 py-4 bg-transparent outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                    <kbd className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">ESC</kbd>
                </div>
                <div className="max-h-[50vh] overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-8">Sin resultados para “{query}”.</p>
                    ) : (
                        filtered.map((c, i) => (
                            <button
                                key={c.id}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => run(c)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${i === active ? 'bg-[#E8C65E] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                {c.icon && <c.icon className={`w-4 h-4 shrink-0 ${i === active ? 'text-white' : 'text-slate-400'}`} />}
                                <span className="flex-1 text-sm font-medium">{c.label}</span>
                                {c.group && (
                                    <span className={`text-[10px] uppercase tracking-wider font-bold ${i === active ? 'text-white/70' : 'text-slate-400'}`}>{c.group}</span>
                                )}
                                {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-white/80" />}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
