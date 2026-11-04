import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../context/StoreContext';
import { enviarArrepentimiento } from '../../utils/consultas';

/**
 * MANDATORY BY ARGENTINE LAW (Res. 424/2020)
 * Must provide an easy way to revoke purchase within 10 days.
 */
export const RegretModal = ({ isOpen, onClose }) => {
    const { siteConfig } = useStore();
    const [formData, setFormData] = useState({ nombre: '', orderId: '', email: '' });
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [tramite, setTramite] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;
        setEnviando(true);
        setError('');
        const r = await enviarArrepentimiento({ nombre: formData.nombre, pedido: formData.orderId, email: formData.email }, siteConfig);
        setEnviando(false);
        if (r) setTramite(r);
        else setError('No pudimos registrar tu pedido. Probá de nuevo en un momento.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#11100D] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fadeIn">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>

                {!tramite ? (
                    <>
                        <div className="flex items-center gap-3 mb-6 text-amber-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Botón de Arrepentimiento</h2>
                        </div>

                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            Conforme a la Ley de Defensa del Consumidor, tenés derecho a revocar tu compra dentro de los <strong>10 días corridos</strong> de recibido el producto. La devolución no tiene costo para vos y te damos un código de trámite en el momento.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Tu Nombre</label>
                                <input
                                    required
                                    type="text"
                                    maxLength={80}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#E8C65E] outline-none transition-colors"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Número de Pedido</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#E8C65E] outline-none transition-colors"
                                    placeholder="ORD-123456"
                                    maxLength={40}
                                    value={formData.orderId}
                                    onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email de Compra</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#E8C65E] outline-none transition-colors"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
                            <Button type="submit" isLoading={enviando} className="btn-oro w-full bg-amber-600 hover:bg-amber-700 text-white mt-4">
                                Solicitar Revocación
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Solicitud Recibida</h3>
                        <p className="text-slate-300 text-sm mb-3">Tu código de trámite es:</p>
                        <p className="font-mono text-2xl tracking-widest text-[#E8C65E] mb-4 select-all">{tramite.codigo}</p>
                        <p className="text-slate-300 text-sm mb-6">
                            {tramite.correo
                                ? 'También te lo mandamos por correo. Te escribimos para coordinar la devolución.'
                                : 'Anotalo: no pudimos mandártelo por correo. Te escribimos para coordinar la devolución.'}
                        </p>
                        <Button onClick={onClose} variant="outline" className="btn-oro text-white border-white/20">Cerrar</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
