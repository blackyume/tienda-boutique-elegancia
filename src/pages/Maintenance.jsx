import React, { useState } from 'react';
import { Loader, Lock, Instagram } from 'lucide-react';
import { Rombo } from '../components/ui/Ornamento';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from '../components/ui/ToastContainer';
import { subscribeNewsletter } from '../utils/newsletter';

export const Maintenance = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const { loginWithGoogle, isAdmin, user } = useStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || status === 'loading') return;
        setStatus('loading');
        const ok = await subscribeNewsletter(email, 'maintenance');
        if (ok) { setStatus('success'); setEmail(''); }
        else setStatus('idle');
    };

    const handleAdminLogin = async () => {
        setLoginLoading(true);
        setLoginError('');
        try {
            const success = await loginWithGoogle();
            if (success) {
                // Wait a moment for auth state to update
                setTimeout(() => {
                    // Check if user became admin after login
                    // Note: isAdmin will update reactively, but we need a slight delay
                    navigate('/admin');
                }, 500);
            }
        } catch (error) {
            setLoginError('Error al iniciar sesión');
        } finally {
            setLoginLoading(false);
        }
    };

    // If already logged in as admin, redirect
    React.useEffect(() => {
        if (isAdmin) {
            navigate('/admin');
        }
    }, [isAdmin, navigate]);

    return (
        <div className="relative min-h-screen bg-noche-950 text-white flex flex-col items-center justify-center px-6 py-16 overflow-hidden font-sans">
            <ToastContainer />

            {/* El arco de la marca, de fondo */}
            <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[min(94vw,46rem)] h-[92vh] rounded-t-full border border-cielo-gold/25" />
            <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[min(84vw,42rem)] h-[88vh] rounded-t-full border border-cielo-gold/10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(232,198,94,0.07),transparent_65%)]" />

            <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center animate-fadeIn">
                <img src="/assets/logo-main.png?v=5" alt="La Boutique de la Elegancia" className="w-[min(68vw,18rem)] h-auto mb-10" />

                <span className="inline-flex items-center gap-4 text-2xs uppercase tracking-[0.4em] font-semibold text-cielo-gold/80">
                    <Rombo /> Colección 2027 <Rombo />
                </span>

                <h1 className="mt-5 font-serif text-5xl md:text-6xl text-noche-100">Muy pronto</h1>
                <p className="mt-3 font-serif italic text-xl md:text-2xl text-cielo-gold">Elegancia que habla por vos.</p>
                <p className="mt-5 text-sm text-noche-300/90 font-light leading-relaxed">
                    Estamos preparando la tienda. Dejanos tu correo y te avisamos cuando abramos.
                </p>

                <div className="w-full mt-7">
                    <form onSubmit={handleSubmit} className="flex items-center bg-white/5 border border-cielo-gold/25 focus-within:border-cielo-gold/60 rounded-full p-1 pl-5 transition-colors">
                        <input
                            type="email"
                            required
                            placeholder="Tu correo"
                            aria-label="Tu correo"
                            className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-base md:text-sm placeholder:text-noche-300/60 font-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'success' || status === 'loading'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'success' || status === 'loading'}
                            className="btn-oro px-5 py-2.5 rounded-full font-semibold text-xs uppercase tracking-widest"
                        >
                            {status === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : (status === 'success' ? '¡Listo!' : 'Avisarme')}
                        </button>
                    </form>
                    {status === 'success' && (
                        <p className="mt-4 text-cielo-gold text-xs font-medium uppercase tracking-widest">Te avisamos.</p>
                    )}
                </div>

                <a href="https://www.instagram.com/laboutiquedelaeleganciaoficial/" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm text-noche-300 hover:text-cielo-gold transition-colors">
                    <Instagram className="w-4 h-4 text-cielo-gold" /> @laboutiquedelaeleganciaoficial
                </a>

                {/* Acceso del administrador: discreto a propósito */}
                <div className="mt-7">
                    <button
                        onClick={handleAdminLogin}
                        disabled={loginLoading}
                        aria-label="Acceso"
                        title="Acceso"
                        className="p-2.5 rounded-full border border-white/10 hover:border-cielo-gold/40 transition-colors group"
                    >
                        {loginLoading ? <Loader className="w-4 h-4 animate-spin text-noche-300" /> : <Lock className="w-4 h-4 text-noche-300/60 group-hover:text-cielo-gold transition-colors" />}
                    </button>
                    {loginError && <p className="mt-2 text-red-400 text-xs">{loginError}</p>}
                    {user && !isAdmin && <p className="mt-2 text-noche-300/70 text-xs">Sin acceso.</p>}
                </div>

                <p className="mt-6 text-[10px] text-noche-300/60 uppercase tracking-[0.3em]">La Boutique de la Elegancia &copy; 2027</p>
            </div>
        </div>
    );
};
