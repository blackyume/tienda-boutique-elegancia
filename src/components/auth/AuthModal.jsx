import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Mail, Lock, User, Loader } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useStore();

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
            <div className="relative bg-white dark:bg-[#0B1120] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-slideUp">

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
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white dark:bg-[#0B1120]">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-cinzel text-slate-900 dark:text-white mb-2 tracking-wide">
                            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                        </h2>
                        <p className="font-montserrat text-slate-500 dark:text-slate-400 text-sm">
                            {isLogin ? 'Accede a tu cuenta personal de lujo.' : 'Únete a la experiencia exclusiva.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre</label>
                                <div className="relative">
                                    <User className="absolute top-3 left-0 w-5 h-5 text-slate-400 group-focus-within:text-[#C19A6B] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        required
                                        className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#C19A6B] outline-none transition-colors text-slate-900 dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute top-3 left-0 w-5 h-5 text-slate-400 group-focus-within:text-[#C19A6B] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#C19A6B] outline-none transition-colors text-slate-900 dark:text-white"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-0 w-5 h-5 text-slate-400 group-focus-within:text-[#C19A6B] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#C19A6B] outline-none transition-colors text-slate-900 dark:text-white"
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

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 font-bold text-[#C19A6B] hover:underline uppercase text-xs tracking-wider"
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
