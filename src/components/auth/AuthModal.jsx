import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Mail, Lock, User, Loader } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register, loginWithGoogle } = useStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        let success = false;

        if (isLogin) {
            success = await login(formData.email, formData.password);
        } else {
            success = await register(formData.email, formData.password, formData.name);
        }

        setIsLoading(false);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#11100D] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-slideUp">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 text-slate-500 md:text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left Side - Image (Desktop only) */}
                <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2070"
                        alt="Luxury Fashion"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="relative z-10 text-center p-8">
                        <h2 className="text-4xl font-cinzel text-white mb-4 tracking-widest">La Boutique</h2>
                        <p className="font-serif italic text-white/80 text-lg">"La elegancia es la única belleza que no se marchita."</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white dark:bg-[#11100D]">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-cinzel text-slate-900 dark:text-white mb-2 tracking-wide">
                            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                        </h2>
                        <p className=" text-slate-500 dark:text-slate-400 text-sm">
                            {isLogin ? 'Accede a tu cuenta personal de lujo.' : 'Únete a la experiencia exclusiva.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre</label>
                                <div className="relative">
                                    <User className="absolute top-3 left-0 w-5 h-5 text-slate-400 group-focus-within:text-[#E8C65E] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        required
                                        className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#E8C65E] outline-none transition-colors text-slate-900 dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute top-3 left-0 w-5 h-5 text-slate-400 group-focus-within:text-[#E8C65E] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#E8C65E] outline-none transition-colors text-slate-900 dark:text-white"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-0 w-5 h-5 text-slate-400 group-focus-within:text-[#E8C65E] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#E8C65E] outline-none transition-colors text-slate-900 dark:text-white"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-cinzel font-bold py-4 rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-8 tracking-widest uppercase text-sm"
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : (isLogin ? 'INGRESAR' : 'REGISTRARSE')}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-700"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#11100D] px-2 text-slate-500">O continuar con</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            setIsLoading(true);
                            const success = await loginWithGoogle();
                            setIsLoading(false);
                            if (success) onClose();
                        }}
                        disabled={isLoading}
                        className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 py-3 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 font-bold text-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuar con Google
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 font-bold text-[#E8C65E] hover:underline uppercase text-xs tracking-wider"
                            >
                                {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
