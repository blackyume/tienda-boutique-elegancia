import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Tag, Image as ImageIcon, Trash2, UploadCloud, Plus, X, Monitor, Megaphone, Layout, Share2, ToggleLeft, ToggleRight, Gift, Link as LinkIcon } from 'lucide-react';

const ImageUploader = ({ currentImage, onUpload, label, className = "" }) => {
    const { uploadImage, addToast } = useStore();
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return addToast("Solo imágenes", "error");

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            if (url) {
                onUpload(url);
                addToast("Imagen subida", "success");
            }
        } catch (error) {
            console.error(error);
            addToast("Error al subir", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className={`relative group ${className}`}>
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    relative w-full overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300
                    ${currentImage ? 'h-48 border-transparent' : 'h-32 border-slate-300 dark:border-slate-700 hover:border-[#C19A6B] bg-slate-50 dark:bg-slate-900'}
                    ${isDragging ? 'border-[#C19A6B] bg-[#C19A6B]/10' : ''}
                `}
            >
                {currentImage ? (
                    <>
                        <img src={currentImage} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                                <UploadCloud className="w-4 h-4" /> Cambiar
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-[#C19A6B] transition-colors">
                        {isUploading ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <UploadCloud className="w-8 h-8 mb-2" />
                                <span className="text-xs font-bold">Subiendo...</span>
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wider">{label || "Subir Imagen"}</span>
                                <span className="text-[10px] mt-1 opacity-70">Click o Arrastrar</span>
                            </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} disabled={isUploading} />
                    </label>
                )}
            </div>
        </div>
    );
};

// --- EXTENDED IMAGE UPLOADER ---
// Modified to include direct URL input
const SmartImageUploader = ({ currentImage, onUpload, label, className = "" }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            <ImageUploader currentImage={currentImage} onUpload={onUpload} label={label} />
            <div className="flex items-center gap-2">
                <div className="text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    placeholder="O pega una URL de imagen aquí..."
                    className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#C19A6B] outline-none text-xs py-1 dark:text-slate-300 transition-colors"
                    defaultValue={""}
                    onBlur={(e) => {
                        const val = e.target.value;
                        if (val && (val.startsWith('http') || val.startsWith('/'))) {
                            onUpload(val);
                            e.target.value = '';
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = e.currentTarget.value;
                            if (val && (val.startsWith('http') || val.startsWith('/'))) {
                                onUpload(val);
                                e.currentTarget.value = '';
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export const CMSView = () => {
    const { categories, addCategory, deleteCategory, siteConfig, updateSiteConfig, addToast, cloudinaryConfig, updateCloudinaryConfig } = useStore();
    const [activeTab, setActiveTab] = useState('home'); // home | promo | categories | config
    const [activeSubTab, setActiveSubTab] = useState('hero');

    // Category State
    const [newCatName, setNewCatName] = useState("");
    const [newCatImage, setNewCatImage] = useState("");

    // Cloudinary State
    const [cloudCfg, setCloudCfg] = useState({ cloudName: "", uploadPreset: "" });

    useEffect(() => {
        if (cloudinaryConfig) setCloudCfg(cloudinaryConfig);
    }, [cloudinaryConfig]);

    const handleSaveCloudConfig = async () => {
        await updateCloudinaryConfig(cloudCfg);
        addToast("Configuración de Cloudinary guardada", "success");
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return addToast("Nombre requerido", "error");
        await addCategory({
            id: `cat_${Date.now()}`,
            name: newCatName,
            image: newCatImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80'
        });
        setNewCatName("");
        setNewCatImage("");
        addToast("Categoría agregada", "success");
    };

    // --- GENERIC UPDATE HANDLER WITH TOAST ---
    const updateSection = async (section, key, value, silent = false) => {
        const newData = { ...siteConfig };
        if (section === 'root') {
            newData[key] = value;
        } else {
            newData[section] = { ...newData[section], [key]: value };
        }

        await updateSiteConfig(newData);
        if (!silent) addToast("Cambios guardados", "success");
    };

    // --- VALIDATED UPDATE FOR LINKS ---
    const updateLink = (section, key, value) => {
        // Basic URL validation
        if (value && !value.startsWith('http') && !value.startsWith('/')) {
            addToast("La URL debe comenzar con http:// o https://", "error");
            return;
        }
        updateSection(section, key, value);
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white mb-2">Centro de Control Web</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Administra cada texto, imagen y anuncio de tu tienda.</p>
                </div>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
                    <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'home' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Portada & Textos</button>
                    <button onClick={() => setActiveTab('promo')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'promo' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Anuncios & Popups</button>
                    <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Categorías</button>
                    <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'config' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Cloudinary</button>
                </div>
            </div>

            {activeTab === 'config' && (
                <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
                    {/* ... Cloudinary config form (same as before) ... */}
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                        <Monitor className="w-5 h-5 text-[#C19A6B]" /> Configuración de Cloudinary (Imágenes)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Cloud Name</label>
                            <input
                                value={cloudCfg.cloudName}
                                onChange={e => setCloudCfg({ ...cloudCfg, cloudName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-[#C19A6B]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Upload Preset</label>
                            <input
                                value={cloudCfg.uploadPreset}
                                onChange={e => setCloudCfg({ ...cloudCfg, uploadPreset: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-[#C19A6B]"
                            />
                        </div>
                        <Button onClick={handleSaveCloudConfig} className="w-full mt-4">Guardar Configuración</Button>
                    </div>
                </div>
            )}

            {activeTab === 'home' && (
                <div className="space-y-8">
                    {/* TOP ROW: Global Settings (Grid 3 Cols) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. VISIBILITY */}
                        <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Layout className="w-5 h-5 text-[#C19A6B]" /> Visibilidad</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-bold dark:text-white">Cintilla (Marquee)</span>
                                    <button onClick={() => updateSection('root', 'showMarquee', !siteConfig.showMarquee)} className={`text-2xl transition-colors ${siteConfig.showMarquee ? 'text-green-500' : 'text-slate-300'}`}>
                                        {siteConfig.showMarquee ? <ToggleRight /> : <ToggleLeft />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-bold dark:text-white">Editorial</span>
                                    <button onClick={() => updateSection('root', 'showEditorial', !siteConfig.showEditorial)} className={`text-2xl transition-colors ${siteConfig.showEditorial ? 'text-green-500' : 'text-slate-300'}`}>
                                        {siteConfig.showEditorial ? <ToggleRight /> : <ToggleLeft />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 2. MARQUEE TEXT */}
                        <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Tag className="w-5 h-5 text-[#C19A6B]" /> Texto Cintilla</h3>
                            <textarea
                                value={siteConfig.marquee || ""}
                                onChange={(e) => updateSection('root', 'marquee', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#C19A6B]/50 h-32 text-sm resize-none"
                                placeholder="Texto en movimiento..."
                            />
                        </section>

                        {/* 3. SOCIALS */}
                        <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Share2 className="w-5 h-5 text-[#C19A6B]" /> Redes Sociales</h3>
                            <div className="space-y-3">
                                {['instagram', 'youtube', 'tiktok'].map((social) => (
                                    <div key={social} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-bold uppercase w-16 text-slate-500">{social}</span>
                                        <input
                                            value={siteConfig.social?.[social] || ""}
                                            onChange={(e) => updateSection('social', social, e.target.value, true)} // Silent update
                                            onBlur={(e) => updateLink('social', social, e.target.value)}
                                            className="flex-1 bg-transparent text-xs outline-none dark:text-white"
                                            placeholder="https://..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* FULL WIDTH HERO SECTION */}
                    <section className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-50" />

                        <h3 className="font-bold mb-8 flex items-center gap-2 text-2xl text-slate-800 dark:text-white">
                            <Monitor className="w-6 h-6 text-[#C19A6B]" /> Portada Principal (Hero)
                        </h3>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

                            {/* LEFT: LARGE PREVIEW */}
                            <div className="xl:col-span-8 flex flex-col gap-4">
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-slate-900 group">
                                    {/* Background */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={typeof siteConfig.hero === 'string' ? siteConfig.hero : siteConfig.hero?.image}
                                            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                                            alt="Hero Preview"
                                        />
                                        <div className="absolute inset-0 bg-black/40" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 text-white pointer-events-none">
                                        <p className="font-cinzel text-xs tracking-[0.3em] mb-4 opacity-90 drop-shadow-lg">EST. 2026</p>
                                        <h2 className="font-cinzel text-4xl md:text-6xl mb-4 drop-shadow-xl font-medium">{siteConfig.hero?.title || "TITULO"}</h2>
                                        <p className="font-serif text-2xl italic text-[#C19A6B] mb-10 drop-shadow-lg">{siteConfig.hero?.subtitle || "Subtítulo"}</p>
                                        <div className="px-10 py-4 bg-white text-slate-900 font-bold text-sm tracking-[0.2em] uppercase shadow-2xl">
                                            {siteConfig.hero?.buttonText || "BOTÓN"}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-slate-400">
                                    Vista Previa en vivo • Resolución recomendada: 1920x1080px
                                </p>
                            </div>

                            {/* RIGHT: CONFIGURATION */}
                            <div className="xl:col-span-4 flex flex-col gap-6 justify-center">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Imagen de Fondo</label>
                                        <ImageUploader
                                            currentImage={null}
                                            onUpload={(url) => updateSection('hero', 'image', url)}
                                            label="Cambiar Imagen"
                                            className="w-full h-32"
                                        />
                                        <input
                                            type="text"
                                            placeholder="O pega URL aquí..."
                                            className="w-full bg-transparent text-xs py-2 border-b border-slate-300 dark:border-slate-700 focus:border-[#C19A6B] outline-none dark:text-slate-300"
                                            onBlur={(e) => e.target.value && updateSection('hero', 'image', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Título</label>
                                            <input
                                                value={siteConfig.hero?.title || ""}
                                                onChange={(e) => updateSection('hero', 'title', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#C19A6B] outline-none font-cinzel"
                                                placeholder="LA BOUTIQUE"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Subtítulo</label>
                                            <input
                                                value={siteConfig.hero?.subtitle || ""}
                                                onChange={(e) => updateSection('hero', 'subtitle', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#C19A6B] outline-none italic font-serif"
                                                placeholder="de la Elegancia"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Botón</label>
                                                <input
                                                    value={siteConfig.hero?.buttonText || ""}
                                                    onChange={(e) => updateSection('hero', 'buttonText', e.target.value)}
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#C19A6B] outline-none text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Link</label>
                                                <input
                                                    value={siteConfig.hero?.buttonLink || ""}
                                                    onChange={(e) => updateSection('hero', 'buttonLink', e.target.value)}
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#C19A6B] outline-none"
                                                    placeholder="shop"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'promo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ANNOUNCEMENT BAR */}
                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Megaphone className="w-5 h-5 text-[#C19A6B]" /> Barra de Anuncios (Top Bar)</h3>
                        <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                            <span className="text-xs font-bold uppercase">Estado: {siteConfig.announcement?.enabled ? 'Activo' : 'Inactivo'}</span>
                            <button onClick={() => updateSection('announcement', 'enabled', !siteConfig.announcement?.enabled)} className={`text-2xl ${siteConfig.announcement?.enabled ? 'text-green-500' : 'text-slate-300'}`}>
                                {siteConfig.announcement?.enabled ? <ToggleRight /> : <ToggleLeft />}
                            </button>
                        </div>
                        <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Texto del Anuncio</label>
                        <input
                            value={siteConfig.announcement?.text || ""}
                            onChange={(e) => updateSection('announcement', 'text', e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm mb-2"
                            placeholder="Ej: Envíos Gratis en compras..."
                        />
                    </section>

                    {/* POPUP */}
                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm row-span-2">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Gift className="w-5 h-5 text-[#C19A6B]" /> Popup Promocional</h3>

                        <div className="flex items-center justify-between mb-6 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                            <span className="text-xs font-bold uppercase">Activar Popup</span>
                            <button onClick={() => updateSection('promoPopup', 'active', !siteConfig.promoPopup?.active)} className={`text-2xl ${siteConfig.promoPopup?.active ? 'text-green-500' : 'text-slate-300'}`}>
                                {siteConfig.promoPopup?.active ? <ToggleRight /> : <ToggleLeft />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <SmartImageUploader
                                currentImage={siteConfig.promoPopup?.image}
                                onUpload={(url) => updateSection('promoPopup', 'image', url)}
                                label="Imagen del Popup"
                                className="h-40"
                            />
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Título</label>
                                <input value={siteConfig.promoPopup?.title || ""} onChange={(e) => updateSection('promoPopup', 'title', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Texto / Descripción</label>
                                <textarea value={siteConfig.promoPopup?.text || ""} onChange={(e) => updateSection('promoPopup', 'text', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm h-20" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Código de Descuento (Opcional)</label>
                                <input value={siteConfig.promoPopup?.code || ""} onChange={(e) => updateSection('promoPopup', 'code', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm font-mono text-center tracking-widest uppercase border border-dashed border-slate-300" placeholder="Ej: VERANO2026" />
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* NEW CATEGORY FORM */}
                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                            <Plus className="w-5 h-5 text-[#C19A6B]" /> Nueva Categoría
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Nombre</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="Ej: Vestidos de Noche"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#C19A6B]/50 transition-all font-medium text-slate-800 dark:text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Imagen de Portada</label>
                                <SmartImageUploader
                                    currentImage={newCatImage}
                                    onUpload={setNewCatImage}
                                    label="Foto de Categoría"
                                />
                            </div>

                            <Button
                                onClick={handleAddCategory}
                                disabled={!newCatName}
                                className="w-full bg-[#C19A6B] hover:bg-[#a38056] text-white py-3 rounded-xl mt-2 font-bold shadow-lg shadow-[#C19A6B]/20"
                            >
                                CREAR CATEGORÍA
                            </Button>
                        </div>
                    </section>

                    {/* CATEGORIES GRID */}
                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                            <Tag className="w-5 h-5 text-[#C19A6B]" /> Categorías Activas ({categories.length})
                        </h3>

                        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                            {categories.map(cat => (
                                <div key={cat.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                    <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                        <span className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteCategory(cat.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 shadow-sm"
                                        title="Eliminar Categoría"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="col-span-2 py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                    <p>No hay categorías creadas.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};
