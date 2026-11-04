import React, { useLayoutEffect, useState } from 'react';
import { Mail, Instagram, MapPin, Check } from 'lucide-react';
import { Rombo } from '../components/ui/Ornamento';
import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CORREO_DE_LA_TIENDA, enviarConsulta } from '../utils/consultas';
import { esCorreoValido } from '../utils/newsletter';

export const Contact = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const { siteConfig } = useStore();
    const location = useLocation();
    const email = siteConfig?.contact?.email || CORREO_DE_LA_TIENDA;
    const instagramUrl = siteConfig?.social?.instagram || 'https://www.instagram.com/laboutiquedelaeleganciaoficial/';

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [novedades, setNovedades] = useState(false);
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');

    const enviar = async (e) => {
        e.preventDefault();
        if (estado === 'enviando') return;
        if (!esCorreoValido(correo.trim())) {
            setError('Revisá el correo: así no te va a llegar la respuesta.');
            return;
        }
        setError('');
        setEstado('enviando');
        const ok = await enviarConsulta({ nombre, email: correo, mensaje, novedades, pagina: location.pathname }, siteConfig);
        setEstado(ok ? 'listo' : '');
        if (!ok) setError('No pudimos enviarla. Probá de nuevo en un momento.');
    };

    return (
        <div className="bg-white dark:bg-[#11100D] min-h-screen pt-32 pb-20 px-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-3 text-[#E8C65E]/80 font-semibold tracking-[0.35em] uppercase text-2xs"><Rombo /> Estamos para ayudarte <Rombo /></span>
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-noche-100 mt-3">Contacto</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">¿Tenés una consulta? Dejala acá y te respondemos por correo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Canales */}
                    <div className="space-y-4">
                        <a href={`mailto:${email}`} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#E8C65E]/50 transition-colors group">
                            <span className="w-12 h-12 rounded-full bg-[#E8C65E]/10 flex items-center justify-center"><Mail className="w-6 h-6 text-[#E8C65E]" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Email</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs break-all">{email}</p>
                            </div>
                        </a>
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#E8C65E]/50 transition-colors group">
                            <span className="w-12 h-12 rounded-full bg-[#E8C65E]/10 flex items-center justify-center"><Instagram className="w-6 h-6 text-[#E8C65E]" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Instagram</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Mirá novedades y mandanos un DM</p>
                            </div>
                        </a>
                        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
                            <span className="w-12 h-12 rounded-full bg-[#E8C65E]/10 flex items-center justify-center"><MapPin className="w-6 h-6 text-[#E8C65E]" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Ubicación</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Tienda online · Envíos desde Rafaela, Santa Fe</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de consultas: mismo destino que la burbuja del chat */}
                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-2xl p-6">
                        {estado === 'listo' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <span className="w-12 h-12 rounded-full bg-[#E8C65E]/10 flex items-center justify-center mb-4"><Check className="w-6 h-6 text-[#E8C65E]" /></span>
                                <p className="font-bold text-slate-900 dark:text-white">Recibimos tu consulta</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 break-all">Te respondemos a {correo.trim().toLowerCase()}</p>
                            </div>
                        ) : (
                            <form onSubmit={enviar}>
                                <h2 className="font-bold text-slate-900 dark:text-white mb-1">Escribinos directo</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-5">Te responde una persona, por correo.</p>
                                <label htmlFor="consulta-nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tu nombre</label>
                                <input id="consulta-nombre" required maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Sofía" autoComplete="given-name" className="w-full mb-4 p-3 text-sm rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors" />
                                <label htmlFor="consulta-correo" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tu correo</label>
                                <input id="consulta-correo" required type="email" maxLength={256} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tucorreo@ejemplo.com" autoComplete="email" className="w-full mb-4 p-3 text-sm rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors" />
                                <label htmlFor="consulta-mensaje" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tu consulta</label>
                                <textarea id="consulta-mensaje" required maxLength={1500} value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={4} placeholder="Contanos en qué te podemos ayudar…" className="w-full mb-4 p-3 text-sm rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors resize-none" />
                                <label className="flex items-start gap-2.5 mb-4 text-xs leading-snug text-slate-500 dark:text-slate-400 cursor-pointer">
                                    <input type="checkbox" checked={novedades} onChange={(e) => setNovedades(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-[#E8C65E]" />
                                    <span>Quiero recibir novedades y promociones por correo. Me puedo dar de baja cuando quiera.</span>
                                </label>
                                {error && <p role="alert" className="text-xs text-red-500 dark:text-red-300 mb-3">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={estado === 'enviando'}
                                    className="btn-oro w-full py-3.5 bg-cielo-gold hover:bg-[#F3D985] text-[#11100D] font-bold text-sm rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {estado === 'enviando' ? 'Enviando…' : 'Enviar consulta'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
