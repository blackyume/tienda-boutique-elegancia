import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { DESTINOS_DE_AVISO } from '../../utils/novedades';

const CAMPO = 'w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm';

// El cartel de novedades de la tienda. Publicar genera un id nuevo, así también
// lo ve quien cerró el aviso anterior.
export const NovedadEditor = ({ novedad, onGuardar }) => {
    const [titulo, setTitulo] = useState(novedad?.titulo || '');
    const [texto, setTexto] = useState(novedad?.texto || '');
    const [enlace, setEnlace] = useState(novedad?.enlace ?? '/shop?sort=newest');

    useEffect(() => {
        setTitulo(novedad?.titulo || '');
        setTexto(novedad?.texto || '');
        setEnlace(novedad?.enlace ?? '/shop?sort=newest');
    }, [novedad?.id]);

    const publicar = () => onGuardar({ activo: true, titulo: titulo.trim(), texto: texto.trim(), enlace, id: String(Date.now()) });
    const quitar = () => onGuardar({ ...novedad, activo: false });

    return (
        <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-1 flex items-center gap-2 text-slate-800 dark:text-white">
                <Megaphone className="w-5 h-5 text-[#E8C65E]" /> Cartel de novedades
            </h3>
            <p className="text-xs text-slate-500 mb-4">
                Las prendas nuevas se avisan solas. Esto es para contar otra cosa: un cambio en los envíos, una fecha, una novedad de la tienda.
            </p>

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                    <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={60} placeholder="Llegó la colección de verano" className={CAMPO} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Texto (opcional)</label>
                    <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={120} rows={2} className={CAMPO} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">El botón lleva a</label>
                    <select value={enlace} onChange={(e) => setEnlace(e.target.value)} className={CAMPO}>
                        {DESTINOS_DE_AVISO.map((d) => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
                <button type="button" onClick={publicar} disabled={!titulo.trim()} className="btn-oro px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Publicar cartel
                </button>
                {novedad?.activo && (
                    <button type="button" onClick={quitar} className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-500 transition-colors">
                        Quitarlo
                    </button>
                )}
            </div>
        </section>
    );
};
