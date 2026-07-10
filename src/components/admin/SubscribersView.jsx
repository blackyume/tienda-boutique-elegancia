import React, { useMemo, useState } from 'react';
import { Mail, Download, Copy, Check, Search, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { EmptyState } from '../ui/EmptyState';

// Etiquetas legibles según de qué formulario vino el suscriptor.
const SOURCE_LABEL = {
    home_inline: 'Home',
    popup: 'Popup',
    footer: 'Footer',
    maintenance: 'Mantenimiento',
    web: 'Web',
};

const fmtDate = (ts) => {
    const d = ts?.toDate?.() || (ts ? new Date(ts) : null);
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const SubscribersView = () => {
    const { newsletterSubscribers = [], addToast } = useStore();
    const [q, setQ] = useState('');
    const [copied, setCopied] = useState(false);

    const list = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return newsletterSubscribers;
        return newsletterSubscribers.filter(s => (s.email || '').toLowerCase().includes(term));
    }, [newsletterSubscribers, q]);

    const emails = useMemo(() => list.map(s => s.email).filter(Boolean), [list]);

    const copyEmails = async () => {
        if (!emails.length) return;
        try {
            await navigator.clipboard.writeText(emails.join(', '));
            setCopied(true);
            addToast?.(`${emails.length} emails copiados`, 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast?.('No se pudo copiar', 'error');
        }
    };

    const exportCSV = () => {
        if (!list.length) return;
        const rows = [['Email', 'Origen', 'Fecha']];
        list.forEach(s => rows.push([
            s.email || '',
            SOURCE_LABEL[s.source] || s.source || '—',
            fmtDate(s.createdAt),
        ]));
        // Escapar comillas y envolver cada celda.
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
        // BOM para que Excel abra bien los acentos.
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast?.(`${list.length} suscriptores exportados`, 'success');
    };

    const total = newsletterSubscribers.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-6 h-6 text-[#D4AF37]" /> Suscriptores
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {total === 0 ? 'Todavía no hay suscriptores.' : `${total} email${total === 1 ? '' : 's'} capturado${total === 1 ? '' : 's'} desde los formularios de la tienda.`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyEmails}
                        disabled={!emails.length}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#D4AF37]/50 disabled:opacity-40 transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        Copiar emails
                    </button>
                    <button
                        onClick={exportCSV}
                        disabled={!list.length}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-40 transition-all"
                        style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA 50%, #B38728)' }}
                    >
                        <Download className="w-4 h-4" /> Exportar CSV (Excel)
                    </button>
                </div>
            </div>

            {total === 0 ? (
                <EmptyState
                    icon={Mail}
                    title="Sin suscriptores todavía"
                    subtitle="Cuando alguien deje su email en el newsletter (home, popup, footer) o en la pantalla de mantenimiento, va a aparecer acá."
                />
            ) : (
                <>
                    {/* Buscador */}
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar email…"
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]/50"
                        />
                    </div>

                    {/* Tabla */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/5 text-left text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    <th className="px-4 py-3 font-bold">Email</th>
                                    <th className="px-4 py-3 font-bold">Origen</th>
                                    <th className="px-4 py-3 font-bold text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {list.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium break-all">{s.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/10 text-[#B38728] dark:text-[#D4AF37] border border-[#D4AF37]/20">
                                                {SOURCE_LABEL[s.source] || s.source || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                                    </tr>
                                ))}
                                {list.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">
                                            Ningún email coincide con "{q}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-400">{list.length} de {total} mostrados</p>
                </>
            )}
        </div>
    );
};

export default SubscribersView;
