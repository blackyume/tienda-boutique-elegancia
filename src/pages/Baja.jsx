import React, { useLayoutEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { darDeBajaNewsletter, esCorreoValido } from '../utils/newsletter';

// Dejar de recibir publicidad (Ley 25.326): lo prometen la casilla del chat y la
// política de privacidad, y cada correo de publicidad tiene que llevar este enlace.
export const Baja = () => {
    useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
    const [correo, setCorreo] = useState('');
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');

    const enviar = async (e) => {
        e.preventDefault();
        if (estado === 'enviando') return;
        if (!esCorreoValido(correo.trim())) {
            setError('Revisá el correo.');
            return;
        }
        setError('');
        setEstado('enviando');
        const ok = await darDeBajaNewsletter(correo);
        setEstado(ok ? 'listo' : '');
        if (!ok) setError('No pudimos hacerlo. Probá de nuevo en un momento.');
    };

    return (
        <div className="bg-white dark:bg-[#11100D] min-h-screen pt-32 pb-20 px-6 font-sans">
            <div className="max-w-md mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-noche-100">Darse de baja</h1>
                {estado === 'listo' ? (
                    <div className="mt-10">
                        <span className="w-12 h-12 rounded-full bg-[#E8C65E]/10 inline-flex items-center justify-center mb-4"><Check className="w-6 h-6 text-[#E8C65E]" /></span>
                        <p className="font-bold text-slate-900 dark:text-white">Listo, no te mandamos más publicidad</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Los correos de tus pedidos y consultas te siguen llegando.</p>
                    </div>
                ) : (
                    <form onSubmit={enviar} className="mt-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Escribí tu correo y dejamos de mandarte novedades y promociones.</p>
                        <label htmlFor="baja-correo" className="block text-left text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tu correo</label>
                        <input
                            id="baja-correo"
                            required
                            type="email"
                            maxLength={256}
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="tucorreo@ejemplo.com"
                            autoComplete="email"
                            className="w-full mb-4 p-3 text-sm rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#E8C65E] transition-colors"
                        />
                        {error && <p role="alert" className="text-xs text-red-500 dark:text-red-300 mb-3">{error}</p>}
                        <button
                            type="submit"
                            disabled={estado === 'enviando'}
                            className="btn-oro w-full py-3.5 bg-cielo-gold hover:bg-[#F3D985] text-[#11100D] font-bold text-sm rounded-xl transition-colors disabled:opacity-60"
                        >
                            {estado === 'enviando' ? 'Enviando…' : 'Darme de baja'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
