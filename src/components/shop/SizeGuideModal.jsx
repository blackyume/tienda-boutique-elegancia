import React, { useState, useEffect } from 'react';
import { X, Ruler } from 'lucide-react';

const TOPS = [
    ['S', '85 - 90', '50'],
    ['M', '90 - 95', '52'],
    ['L', '95 - 100', '54'],
    ['XL', '100 - 105', '56'],
];
const BOTTOMS = [
    ['36 (S)', '60 - 64', '88 - 92'],
    ['38 (M)', '64 - 68', '92 - 96'],
    ['40 (L)', '68 - 72', '96 - 100'],
    ['42 (XL)', '72 - 76', '100 - 104'],
];

export const SizeGuideModal = ({ onClose }) => {
    const [tab, setTab] = useState('tops');
    const isTops = tab === 'tops';
    const rows = isTops ? TOPS : BOTTOMS;

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Guía de talles"
        >
            <div
                className="relative w-full max-w-lg rounded-[22px] p-[1.5px] overflow-hidden shadow-[0_0_60px_-14px_rgba(193,154,107,0.5)] animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-[#E8C65E]/25" />
                <div className="relative bg-[#11100D] rounded-[20px] overflow-hidden">
                    {/* Header */}
                    <div className="px-7 py-5 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-serif text-xl text-white flex items-center gap-2.5">
                            <Ruler className="w-5 h-5 text-[#E8C65E]" /> Guía de Talles
                        </h3>
                        <button
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex">
                        {[['tops', 'Partes de arriba'], ['bottoms', 'Partes de abajo']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors relative ${tab === key ? 'text-[#E8C65E]' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {label}
                                {tab === key && <span className="absolute bottom-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-[#E8C65E] to-transparent" />}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-7">
                        <div className="overflow-hidden rounded-xl border border-white/10">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/[0.03] text-[#E8C65E]/80 uppercase text-[10px] tracking-[0.15em]">
                                    <tr>
                                        <th className="p-3 pl-5 font-bold">Talle</th>
                                        <th className="p-3 font-bold">{isTops ? 'Busto (cm)' : 'Cintura (cm)'}</th>
                                        <th className="p-3 font-bold">{isTops ? 'Largo (cm)' : 'Cadera (cm)'}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {rows.map(([t, a, b], i) => (
                                        <tr key={t} className={i % 2 ? 'bg-white/[0.02]' : ''}>
                                            <td className="p-3 pl-5 font-bold text-white">{t}</td>
                                            <td className="p-3">{a}</td>
                                            <td className="p-3">{b}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 rounded-xl border border-[#E8C65E]/20 bg-[#E8C65E]/[0.06] p-4 text-xs text-slate-300 leading-relaxed">
                            <strong className="text-[#E8C65E]">Cómo medir:</strong>{' '}
                            {isTops
                                ? 'Tomá el contorno del busto por la parte más saliente y el largo desde el hombro hasta la cadera.'
                                : 'Tomá la cintura por la parte más estrecha y la cadera por la parte más ancha.'}
                            <span className="block mt-1.5 text-slate-500">
                                Si estás entre dos talles, elegí el más grande para mayor comodidad.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
