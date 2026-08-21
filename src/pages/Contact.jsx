import React, { useLayoutEffect, useState } from 'react';
import { MessageCircle, Mail, Instagram, MapPin, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { telegramDeConfig } from '../utils/contacto';

export const Contact = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const { siteConfig } = useStore();
    const whatsapp = String(siteConfig?.whatsappNumber || siteConfig?.contact?.whatsapp || '5493492216487').replace(/\D/g, '');
    const email = siteConfig?.contact?.email || 'laboutiquedelaeleganciaoficial@gmail.com';
    const instagramUrl = siteConfig?.social?.instagram || 'https://www.instagram.com/laboutiquedelaeleganciaoficial/';

    const telegramUrl = telegramDeConfig(siteConfig);

    const [nombre, setNombre] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [copiado, setCopiado] = useState(false);

    const textoConsulta = () => `¡Hola! Soy ${nombre || 'un cliente'}.\n\n${mensaje || 'Quería hacer una consulta.'}`;

    const enviarWhatsapp = () => {
        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(textoConsulta())}`, '_blank');
    };

    // Telegram no deja prellenar el mensaje de un chat privado (no existe un
    // ?text= como en wa.me), asi que copiamos la consulta al portapapeles y
    // abrimos el chat: la clienta solo tiene que pegar.
    const enviarTelegram = async () => {
        try {
            await navigator.clipboard.writeText(textoConsulta());
            setCopiado(true);
            setTimeout(() => setCopiado(false), 4000);
        } catch { /* si el navegador no deja copiar, igual abrimos el chat */ }
        window.open(telegramUrl, '_blank');
    };

    return (
        <div className="bg-white dark:bg-[#1C1F25] min-h-screen pt-32 pb-20 px-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-[#D4AF37] font-bold tracking-[0.25em] uppercase text-xs">Estamos para ayudarte</span>
                    <h1 className="text-4xl font-luxury font-bold text-slate-900 dark:text-white mt-2 tracking-wide">Contacto</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">¿Tenés una consulta? Escribinos por el canal que prefieras.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Canales */}
                    <div className="space-y-4">
                        {telegramUrl && (
                            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#229ED9]/50 transition-colors group">
                                <span className="w-12 h-12 rounded-full bg-[#229ED9]/10 flex items-center justify-center group-hover:bg-[#229ED9]/20 transition-colors"><Send className="w-6 h-6 text-[#229ED9]" /></span>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Telegram</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Respuesta rápida · la mejor opción</p>
                                </div>
                            </a>
                        )}
                        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#25D366]/50 transition-colors group">
                            <span className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors"><MessageCircle className="w-6 h-6 text-[#25D366]" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">WhatsApp</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">También estamos acá</p>
                            </div>
                        </a>
                        <a href={`mailto:${email}`} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#D4AF37]/50 transition-colors group">
                            <span className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center"><Mail className="w-6 h-6 text-[#D4AF37]" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Email</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs break-all">{email}</p>
                            </div>
                        </a>
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-pink-500/50 transition-colors group">
                            <span className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center"><Instagram className="w-6 h-6 text-pink-500" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Instagram</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Mirá novedades y mandanos un DM</p>
                            </div>
                        </a>
                        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
                            <span className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center"><MapPin className="w-6 h-6 text-slate-400" /></span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Ubicación</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Tienda online · Envíos desde Rafaela, Santa Fe</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulario → Telegram o WhatsApp */}
                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-2xl p-6">
                        <h2 className="font-bold text-slate-900 dark:text-white mb-1">Escribinos directo</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-5">Completá y te abrimos el chat con tu mensaje listo.</p>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tu nombre</label>
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Sofía"
                            className="w-full mb-4 p-3 text-sm rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors"
                        />
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tu consulta</label>
                        <textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            rows={4}
                            placeholder="Contanos en qué te podemos ayudar…"
                            className="w-full mb-5 p-3 text-sm rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] transition-colors resize-none"
                        />
                        <div className="space-y-2.5">
                            {telegramUrl && (
                                <button
                                    onClick={enviarTelegram}
                                    className="w-full flex items-center justify-center gap-2 bg-[#229ED9] hover:brightness-110 text-white font-bold text-sm py-3.5 rounded-xl transition-all"
                                >
                                    <Send className="w-4 h-4" /> {copiado ? 'Mensaje copiado, pegalo en el chat' : 'Enviar por Telegram'}
                                </button>
                            )}
                            <button
                                onClick={enviarWhatsapp}
                                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:brightness-110 text-white font-bold text-sm py-3.5 rounded-xl transition-all"
                            >
                                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
