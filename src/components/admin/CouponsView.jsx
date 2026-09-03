import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import {
    Ticket, Plus, Edit2, Trash2, X, Check,
    Percent, DollarSign, Calendar, Hash,
    ToggleLeft, ToggleRight, Gift, Copy
} from 'lucide-react';

export const CouponsView = () => {
    const { coupons, addCoupon, updateCoupon, deleteCoupon, addToast } = useStore();
    const confirm = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage', // 'percentage' | 'fixed'
        value: '',
        minPurchase: '',
        expiresAt: '',
        maxUses: '',
        active: true
    });

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: '',
            minPurchase: '',
            expiresAt: '',
            maxUses: '',
            active: true
        });
        setEditingCoupon(null);
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code || '',
                type: coupon.type || 'percentage',
                value: coupon.value || '',
                minPurchase: coupon.minPurchase || '',
                expiresAt: coupon.expiresAt || '',
                maxUses: coupon.maxUses || '',
                active: coupon.active !== false
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code.trim()) {
            addToast("El código es obligatorio", "error");
            return;
        }
        if (!formData.value || Number(formData.value) <= 0) {
            addToast("El valor del descuento debe ser mayor a 0", "error");
            return;
        }
        if (formData.type === 'percentage' && Number(formData.value) > 100) {
            addToast("Un descuento porcentual no puede superar 100%", "error");
            return;
        }
        if (formData.maxUses && (!Number.isInteger(Number(formData.maxUses)) || Number(formData.maxUses) <= 0)) {
            addToast("El límite de usos debe ser un entero mayor a 0", "error");
            return;
        }
        if (formData.expiresAt && isNaN(new Date(formData.expiresAt).getTime())) {
            addToast("La fecha de expiración no es válida", "error");
            return;
        }
        if (isSubmitting) return;

        const couponData = {
            ...formData,
            code: formData.code.toUpperCase().trim(),
            value: Number(formData.value),
            minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
            maxUses: formData.maxUses ? Number(formData.maxUses) : null
        };

        setIsSubmitting(true);
        try {
            if (editingCoupon) {
                await updateCoupon(editingCoupon.id, couponData);
            } else {
                await addCoupon(couponData);
            }
            setIsModalOpen(false);
            resetForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (await confirm({ title: 'Eliminar cupón', message: 'El cupón dejará de funcionar de inmediato. ¿Eliminarlo?', confirmText: 'Eliminar', danger: true })) {
            await deleteCoupon(id);
        }
    };

    const handleToggleActive = async (coupon) => {
        await updateCoupon(coupon.id, { active: !coupon.active });
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        addToast("Código copiado al portapapeles", "success");
    };

    const isExpired = (expiresAt) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-10 pb-24">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-luxury font-bold dark:text-white text-slate-900 tracking-wider flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-[#E8C65E]" />
                        Cupones de Descuento
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">
                        Crea y gestiona códigos promocionales para tus clientes.
                    </p>
                </div>
                <Button
                    onClick={() => openModal()}
                    className="bg-black hover:bg-[#E8C65E] text-white shadow-xl shadow-black/10 px-6 py-3 rounded-none border border-[#E8C65E] text-xs uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1"
                >
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Cupón
                </Button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Ticket className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Cupones</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white">{coupons.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Check className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Activos</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white">
                                {coupons.filter(c => c.active && !isExpired(c.expiresAt)).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Hash className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Usos Totales</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white">
                                {coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expirados</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white">
                                {coupons.filter(c => isExpired(c.expiresAt)).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* COUPONS TABLE */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-slate-50/50 dark:bg-[#161616] text-slate-500 font-luxury uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="p-4 pl-6">Código</th>
                            <th className="p-4 text-center">Descuento</th>
                            <th className="p-4 text-center">Mínimo</th>
                            <th className="p-4 text-center">Expira</th>
                            <th className="p-4 text-center">Usos</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-right pr-6">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-12 text-center text-slate-400">
                                    <Gift className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No hay cupones creados</p>
                                    <p className="text-xs mt-1">Crea tu primer cupón de descuento</p>
                                </td>
                            </tr>
                        ) : (
                            coupons.map(coupon => {
                                const expired = isExpired(coupon.expiresAt);
                                const limitReached = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                                const isActive = coupon.active && !expired && !limitReached;

                                return (
                                    <tr key={coupon.id} className={`transition-colors ${!isActive ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                        {/* CODE */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-lg text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                                    {coupon.code}
                                                </span>
                                                <button
                                                    onClick={() => copyCode(coupon.code)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    title="Copiar código"
                                                >
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* DISCOUNT */}
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 font-bold text-[#E8C65E]">
                                                {coupon.type === 'percentage' ? (
                                                    <><Percent className="w-4 h-4" /> {coupon.value}%</>
                                                ) : (
                                                    <><DollarSign className="w-4 h-4" /> ${coupon.value.toLocaleString()}</>
                                                )}
                                            </span>
                                        </td>

                                        {/* MIN PURCHASE */}
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                                            {coupon.minPurchase ? `$${coupon.minPurchase.toLocaleString()}` : '-'}
                                        </td>

                                        {/* EXPIRES */}
                                        <td className="p-4 text-center">
                                            <span className={`text-xs font-medium ${expired ? 'text-red-500' : 'text-slate-500'}`}>
                                                {formatDate(coupon.expiresAt)}
                                                {expired && <span className="ml-1">(Expirado)</span>}
                                            </span>
                                        </td>

                                        {/* USES */}
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                                            <span className={limitReached ? 'text-red-500 font-bold' : ''}>
                                                {coupon.usedCount || 0}
                                                {coupon.maxUses && <span className="text-slate-400">/{coupon.maxUses}</span>}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleToggleActive(coupon)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                                    }`}
                                            >
                                                {isActive ? (
                                                    <><ToggleRight className="w-4 h-4" /> Activo</>
                                                ) : (
                                                    <><ToggleLeft className="w-4 h-4" /> Inactivo</>
                                                )}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => openModal(coupon)}
                                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#161616]">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-[#E8C65E]" />
                                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                            </h3>
                            <button
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Code */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                                    Código del Cupón *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold text-lg tracking-widest outline-none focus:border-[#E8C65E] focus:ring-1 focus:ring-[#E8C65E]/20 transition-all"
                                    placeholder="EJ: VERANO20"
                                />
                            </div>

                            {/* Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                                        Tipo de Descuento
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'percentage' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${formData.type === 'percentage'
                                                ? 'bg-[#E8C65E] text-white border-[#E8C65E]'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#E8C65E]'
                                                }`}
                                        >
                                            <Percent className="w-4 h-4" /> %
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'fixed' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${formData.type === 'fixed'
                                                ? 'bg-[#E8C65E] text-white border-[#E8C65E]'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#E8C65E]'
                                                }`}
                                        >
                                            <DollarSign className="w-4 h-4" /> $
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                                        Valor *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#E8C65E] transition-all"
                                        placeholder={formData.type === 'percentage' ? 'Ej: 20' : 'Ej: 5000'}
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Min Purchase */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                                    Compra Mínima (opcional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.minPurchase}
                                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#E8C65E] transition-all"
                                    placeholder="Sin mínimo"
                                />
                            </div>

                            {/* Expiration & Max Uses */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                                        Fecha de Expiración
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#E8C65E] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                                        Límite de Usos
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#E8C65E] transition-all"
                                        placeholder="Sin límite"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="flex-1 !bg-slate-100 dark:!bg-slate-700 !text-slate-700 dark:!text-slate-200 hover:!bg-slate-200 dark:hover:!bg-slate-600 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#E8C65E] hover:bg-[#B8932E] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-[#E8C65E]/20"
                                >
                                    {isSubmitting ? 'Guardando…' : (editingCoupon ? 'Guardar Cambios' : 'Crear Cupón')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
