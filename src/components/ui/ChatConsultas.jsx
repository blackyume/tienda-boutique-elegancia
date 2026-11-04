import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { alPedirConsulta, enviarConsulta } from '../../utils/consultas';
import { esCorreoValido } from '../../utils/newsletter';

const PREGUNTAS = {
    nombre: '¡Gracias! ¿Cómo te llamás?',
    email: '¿A qué correo te respondemos?',
};

const PLACEHOLDER = {
    mensaje: 'Escribí tu consulta…',
    nombre: 'Tu nombre',
    email: 'tucorreo@ejemplo.com',
};

const saludo = (producto) => (producto
    ? `Hola, ¿qué querés saber de «${producto}»?`
    : 'Hola, ¿en qué te ayudamos? Dejanos tu consulta y te respondemos por correo.');

const Globo = ({ de, children }) => (
    <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${de === 'clienta'
        ? 'self-end bg-cielo-gold text-[#11100D] rounded-2xl rounded-br-sm'
        : 'self-start bg-white/[0.07] text-noche-100 rounded-2xl rounded-bl-sm'}`}
    >
        {children}
    </div>
);

// Burbuja de consultas: una pregunta por vez, como un chat, para que dejar el
// correo sea un paso más de la charla y no un formulario. Contestan ellos por
// correo; no es la Elegancia IA, que sigue oculta (ver App.jsx).
export const ChatConsultas = () => {
    const { siteConfig } = useStore();
    const location = useLocation();
    const [visible, setVisible] = useState(false);
    const [mostrarAviso, setMostrarAviso] = useState(false);
    const [abierta, setAbierta] = useState(false);
    const [producto, setProducto] = useState('');
    const [paso, setPaso] = useState('mensaje');
    const [charla, setCharla] = useState([]);
    const [datos, setDatos] = useState({ mensaje: '', nombre: '', email: '' });
    const [novedades, setNovedades] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const listaRef = useRef(null);
    const campoRef = useRef(null);

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 1200);
        const t2 = setTimeout(() => setMostrarAviso(true), 5000);
        const t3 = setTimeout(() => setMostrarAviso(false), 11000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    const empezar = (prenda = '') => {
        setProducto(prenda);
        setPaso('mensaje');
        setCharla([{ de: 'tienda', texto: saludo(prenda) }]);
        setDatos((d) => ({ ...d, mensaje: '' }));
        setError('');
    };

    useEffect(() => alPedirConsulta((prenda) => {
        empezar(prenda);
        setAbierta(true);
    }), []);

    useEffect(() => {
        listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: 'smooth' });
        if (abierta) campoRef.current?.focus();
    }, [charla, abierta]);

    useEffect(() => {
        if (!abierta) return undefined;
        const alTeclear = (e) => { if (e.key === 'Escape') setAbierta(false); };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    }, [abierta]);

    if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') return null;

    const abrir = () => {
        if (!charla.length) empezar();
        setAbierta(true);
    };

    const avanzar = async (e) => {
        e.preventDefault();
        if (enviando) return;
        const valor = datos[paso].trim();
        if (!valor) return;
        if (paso === 'email' && !esCorreoValido(valor)) {
            setError('Revisá el correo: así no te va a llegar la respuesta.');
            return;
        }
        setError('');

        if (paso !== 'email') {
            const siguiente = paso === 'mensaje' ? 'nombre' : 'email';
            setCharla((c) => [...c, { de: 'clienta', texto: valor }, { de: 'tienda', texto: PREGUNTAS[siguiente] }]);
            setPaso(siguiente);
            return;
        }

        setEnviando(true);
        const ok = await enviarConsulta({ ...datos, producto, novedades, pagina: location.pathname }, siteConfig);
        setEnviando(false);
        if (!ok) {
            setError('No pudimos enviarla. Probá de nuevo en un momento.');
            return;
        }
        setCharla((c) => [
            ...c,
            { de: 'clienta', texto: valor },
            { de: 'tienda', texto: `Recibido, ${datos.nombre.trim()}. Te respondemos a ${valor.toLowerCase()}.` },
        ]);
        setPaso('listo');
    };

    const alto = location.pathname.startsWith('/product/') ? 'bottom-24' : 'bottom-4';

    return (
        <>
            {abierta && (
                <div
                    role="dialog"
                    aria-label="Consultas"
                    className={`fixed ${alto} sm:bottom-6 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[23rem] max-h-[min(34rem,calc(100svh-8rem))] flex flex-col bg-noche-900 border border-cielo-gold/30 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.55)] overflow-hidden animate-fadeIn`}
                >
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                        <div>
                            <p className="font-cinzel text-sm tracking-[0.12em] text-cielo-gold">Consultas</p>
                            <p className="text-[11px] text-noche-300/80 mt-0.5">Te responde una persona, por correo</p>
                        </div>
                        <button onClick={() => setAbierta(false)} aria-label="Cerrar" className="p-1.5 text-noche-300 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div ref={listaRef} className="flex-1 min-h-[12rem] overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
                        {charla.map((m, i) => <Globo key={i} de={m.de}>{m.texto}</Globo>)}
                    </div>

                    {paso === 'listo' ? (
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={() => empezar()}
                                className="w-full py-3 border border-cielo-gold/40 text-cielo-gold font-cinzel text-2xs uppercase tracking-[0.25em] transition-colors hover:bg-cielo-gold/10"
                            >
                                Hacer otra consulta
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={avanzar} className="p-4 border-t border-white/10">
                            {paso === 'email' && (
                                <label className="flex items-start gap-2.5 mb-3 text-xs leading-snug text-noche-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={novedades}
                                        onChange={(e) => setNovedades(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 shrink-0 accent-[#E8C65E]"
                                    />
                                    <span>Quiero recibir novedades y promociones por correo. Me puedo dar de baja cuando quiera.</span>
                                </label>
                            )}
                            {error && <p role="alert" className="text-xs text-red-300 mb-2">{error}</p>}
                            <div className="flex items-center gap-2">
                                <input
                                    ref={campoRef}
                                    type={paso === 'email' ? 'email' : 'text'}
                                    autoComplete={paso === 'email' ? 'email' : paso === 'nombre' ? 'given-name' : 'off'}
                                    maxLength={paso === 'mensaje' ? 1500 : 120}
                                    value={datos[paso]}
                                    onChange={(e) => setDatos((d) => ({ ...d, [paso]: e.target.value }))}
                                    placeholder={PLACEHOLDER[paso]}
                                    aria-label={PLACEHOLDER[paso]}
                                    className="flex-1 min-w-0 px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-noche-300/60 outline-none focus:border-cielo-gold/60 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={enviando || !datos[paso].trim()}
                                    aria-label={paso === 'email' ? 'Enviar consulta' : 'Seguir'}
                                    className="w-11 h-11 shrink-0 rounded-xl bg-cielo-gold text-[#11100D] flex items-center justify-center transition-colors hover:bg-[#F3D985] disabled:opacity-40"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            {paso === 'email' && (
                                <p className="text-[10px] text-noche-300/60 mt-2">
                                    Usamos tu correo para responderte. <Link to="/privacy" className="underline hover:text-noche-100">Privacidad</Link>
                                </p>
                            )}
                        </form>
                    )}
                </div>
            )}

            {!abierta && (
                <div
                    onMouseEnter={() => setMostrarAviso(true)}
                    onMouseLeave={() => setMostrarAviso(false)}
                    className={`fixed ${alto} sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
                >
                    {/* El globo sólo desde `sm`: en celular caía encima del botón del hero. */}
                    <div className={`hidden sm:block origin-bottom-right transition-all duration-300 ${mostrarAviso ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
                        <div className="relative bg-noche-900 border border-cielo-gold/30 px-4 py-3 rounded-xl rounded-br-none shadow-[0_8px_32px_rgba(0,0,0,0.45)] max-w-[220px]">
                            <p className="font-cinzel text-[11px] font-semibold tracking-wide text-cielo-gold mb-0.5">Atención personalizada</p>
                            <p className="text-[10px] leading-relaxed text-noche-300">Dejanos tu consulta y te respondemos por correo.</p>
                        </div>
                    </div>
                    <button
                        onClick={abrir}
                        aria-label="Hacer una consulta"
                        className="relative w-14 h-14 rounded-full flex items-center justify-center text-[#11100D] transition-transform duration-300 hover:scale-[1.06] active:scale-95"
                        style={{
                            background: 'linear-gradient(145deg, #FCF6BA 0%, #E8C65E 45%, #B8932E 100%)',
                            boxShadow: '0 8px 24px -6px rgba(232,198,94,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
                        }}
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    );
};
