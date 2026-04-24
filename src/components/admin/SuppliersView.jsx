import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../utils/helpers';
import {
    Building2, Search, Plus, Edit2, Trash2, X, Phone, Mail, MapPin,
    MessageCircle, Package, Check, Filter, Calendar, FileText, User
} from 'lucide-react';

export const SuppliersView = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, categories, addToast } = useStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);

    // Form state
    const emptySupplier = {
        name: '',
        category: '',
        contactName: '',
        phone: '',
        email: '',
        whatsapp: '',
        address: '',
        city: '',
        province: '',
        notes: '',
        active: true
    };

    // Filtered suppliers
    const filteredSuppliers = useMemo(() => {
        return (suppliers || []).filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [suppliers, searchTerm, selectedCategory]);

    // Stats
    const stats = useMemo(() => {
        const all = suppliers || [];
        return {
            total: all.length,
            active: all.filter(s => s.active !== false).length,
            inactive: all.filter(s => s.active === false).length
        };
    }, [suppliers]);

    // Handlers
    const handleOpenModal = (supplier = null) => {
        setCurrentSupplier(supplier || { ...emptySupplier, id: Date.now() });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSupplier(null);
    };

    const handleSave = async () => {
        if (!currentSupplier.name.trim()) {
            addToast('El nombre del proveedor es obligatorio', 'error');
            return;
        }

        try {
            if (suppliers?.find(s => s.id === currentSupplier.id)) {
                await updateSupplier(currentSupplier.id, currentSupplier);
            } else {
                await addSupplier({ ...currentSupplier, createdAt: Date.now() });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving supplier:', error);
            addToast('Error al guardar proveedor', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este proveedor?')) {
            await deleteSupplier(id);
        }
    };

    const openWhatsApp = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 pb-24 animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 tracking-wider">
                        Proveedores
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light tracking-wide">
                        Gestiona tus proveedores y contactos comerciales.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-black hover:bg-[#C19A6B] text-white shadow-xl shadow-black/10 px-4 sm:px-6 py-2 sm:py-3 rounded-none border border-[#C19A6B] text-xs uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" /> Nuevo Proveedor
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Total</p>
                </div>
                <div className="bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600">{stats.active}</span>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Activos</p>
                </div>
                <div className="bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-xl sm:text-2xl font-black text-slate-400">{stats.inactive}</span>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Inactivos</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl p-3 sm:p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full text-sm border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                        placeholder="Buscar proveedor..."
                    />
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#C19A6B] appearance-none cursor-pointer font-medium w-full sm:min-w-[160px]"
                    >
                        <option value="Todos">Todas las Categorías</option>
                        {(categories || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* SUPPLIERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredSuppliers.map((supplier) => (
                    <div
                        key={supplier.id}
                        className={`bg-white dark:bg-[#1e293b] p-4 sm:p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${supplier.active === false ? 'border-slate-300 dark:border-slate-700 opacity-60' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                        {/* Status Badge */}
                        {supplier.active === false && (
                            <div className="absolute top-0 right-0 bg-slate-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest">
                                Inactivo
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#C19A6B]/10 flex items-center justify-center text-[#C19A6B] border border-[#C19A6B]/20 shrink-0">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate">
                                    {supplier.name}
                                </h3>
                                {supplier.category && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mt-1">
                                        <Package className="w-3 h-3 mr-1" /> {supplier.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                            {supplier.contactName && (
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-[#C19A6B] shrink-0" />
                                    <span className="truncate">{supplier.contactName}</span>
                                </div>
                            )}
                            {supplier.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-[#C19A6B] shrink-0" />
                                    <span>{supplier.phone}</span>
                                </div>
                            )}
                            {supplier.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-[#C19A6B] shrink-0" />
                                    <span className="truncate">{supplier.email}</span>
                                </div>
                            )}
                            {(supplier.city || supplier.province) && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[#C19A6B] shrink-0" />
                                    <span className="truncate">{[supplier.city, supplier.province].filter(Boolean).join(', ')}</span>
                                </div>
                            )}
                        </div>

                        {/* Notes Preview */}
                        {supplier.notes && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-4 sm:mb-6 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 mb-1">
                                    <FileText className="w-3 h-3" /> Notas
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {supplier.notes}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                            {supplier.whatsapp && (
                                <button
                                    onClick={() => openWhatsApp(supplier.whatsapp)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                </button>
                            )}
                            <button
                                onClick={() => handleOpenModal(supplier)}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                                onClick={() => handleDelete(supplier.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Created Date */}
                        {supplier.createdAt && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <Calendar className="w-3 h-3" />
                                Agregado: {new Date(supplier.createdAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredSuppliers.length === 0 && (
                <div className="text-center py-16 sm:py-20 bg-white dark:bg-[#1e293b] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold mb-2">No hay proveedores registrados</p>
                    <p className="text-slate-400 text-sm mb-6">Agrega tu primer proveedor para comenzar.</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 bg-[#C19A6B] hover:bg-[#A88555] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Agregar Proveedor
                    </button>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && currentSupplier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 dark:border-slate-800 shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1e293b] shrink-0">
                            <h3 className="font-bold text-base sm:text-lg dark:text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#C19A6B]" />
                                {suppliers?.find(s => s.id === currentSupplier.id) ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6">
                            {/* Name & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                        Nombre del Proveedor *
                                    </label>
                                    <input
                                        value={currentSupplier.name}
                                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                        placeholder="Ej: Textiles del Sur"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                        Categoría de Productos
                                    </label>
                                    <input
                                        list="supplier-categories"
                                        value={currentSupplier.category}
                                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                        placeholder="Ej: Vestidos"
                                    />
                                    <datalist id="supplier-categories">
                                        {(categories || []).map(c => <option key={c.id} value={c.name} />)}
                                    </datalist>
                                </div>
                            </div>

                            {/* Contact Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                    Nombre de Contacto
                                </label>
                                <input
                                    value={currentSupplier.contactName}
                                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactName: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                    placeholder="Ej: María López"
                                />
                            </div>

                            {/* Phone & WhatsApp */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        value={currentSupplier.phone}
                                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                        placeholder="Ej: 011 4444-5555"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                        WhatsApp
                                    </label>
                                    <input
                                        value={currentSupplier.whatsapp}
                                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, whatsapp: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                        placeholder="Ej: 5491123456789"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={currentSupplier.email}
                                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                    placeholder="Ej: contacto@proveedor.com"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                    Dirección
                                </label>
                                <input
                                    value={currentSupplier.address}
                                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                    placeholder="Ej: Av. Corrientes 1234"
                                />
                            </div>

                            {/* City & Province */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                        Ciudad
                                    </label>
                                    <input
                                        value={currentSupplier.city}
                                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                        placeholder="Ej: Buenos Aires"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                        Provincia
                                    </label>
                                    <input
                                        value={currentSupplier.province}
                                        onChange={(e) => setCurrentSupplier({ ...currentSupplier, province: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all"
                                        placeholder="Ej: CABA"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                    Notas Adicionales
                                </label>
                                <textarea
                                    value={currentSupplier.notes}
                                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-[#C19A6B] transition-all min-h-[100px] resize-none"
                                    placeholder="Información adicional sobre el proveedor, condiciones de pago, horarios de atención, etc."
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setCurrentSupplier({ ...currentSupplier, active: !currentSupplier.active })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${currentSupplier.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${currentSupplier.active ? 'left-7' : 'left-1'}`} />
                                </button>
                                <div>
                                    <span className="font-bold text-sm text-slate-700 dark:text-white">
                                        {currentSupplier.active ? 'Proveedor Activo' : 'Proveedor Inactivo'}
                                    </span>
                                    <p className="text-xs text-slate-400">
                                        {currentSupplier.active ? 'Visible en el listado principal' : 'Oculto del listado principal'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-[#1e293b] shrink-0">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#C19A6B] hover:bg-[#A88555] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
                            >
                                <Check className="w-4 h-4" /> Guardar Proveedor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
