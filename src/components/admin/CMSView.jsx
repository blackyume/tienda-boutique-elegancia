import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import { Tag, Image as ImageIcon, Trash2, UploadCloud, Plus, X, Monitor, Megaphone, Layout, Share2, ToggleLeft, ToggleRight, Gift, Link as LinkIcon, Quote, Target, Clock } from 'lucide-react';

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
                    ${currentImage ? 'h-48 border-transparent' : 'h-32 border-slate-300 dark:border-slate-700 hover:border-[#E8C65E] bg-slate-50 dark:bg-slate-900'}
                    ${isDragging ? 'border-[#E8C65E] bg-[#E8C65E]/10' : ''}
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
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-[#E8C65E] transition-colors">
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
// Las portadas del carrusel del hero. Guarda `hero.slides` como lista de URLs.
// Si la lista queda vacía, la home vuelve sola a las portadas de la casa.
const EditorPortadas = ({ slides, onCambiar }) => {
    const lista = (Array.isArray(slides) ? slides : [])
        .map((x) => (typeof x === 'string' ? x : x?.escritorio || x?.image || x?.url || ''))
        .filter(Boolean);

    const mover = (i, salto) => {
        const j = i + salto;
        if (j < 0 || j >= lista.length) return;
        const copia = [...lista];
        [copia[i], copia[j]] = [copia[j], copia[i]];
        onCambiar(copia);
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Portadas del carrusel</label>
            <p className="text-[11px] text-slate-400 leading-snug">
                Van rotando en la home con un fundido. Con la lista vacía se usan las dos portadas
                de modelo que ya vienen cargadas.
            </p>

            {lista.length > 0 && (
                <ul className="space-y-2 pt-1">
                    {lista.map((url, i) => (
                        <li key={url + i} className="flex items-center gap-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 p-1.5">
                            <img src={url} alt="" className="w-14 h-10 object-cover shrink-0" />
                            <span className="text-[10px] text-slate-400 truncate grow">{url.split('/').pop()}</span>
                            <button type="button" onClick={() => mover(i, -1)} disabled={i === 0}
                                className="p-1 text-slate-400 hover:text-[#E8C65E] disabled:opacity-25" aria-label="Subir">↑</button>
                            <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1}
                                className="p-1 text-slate-400 hover:text-[#E8C65E] disabled:opacity-25" aria-label="Bajar">↓</button>
                            <button type="button" onClick={() => onCambiar(lista.filter((_, k) => k !== i))}
                                className="p-1 text-slate-400 hover:text-red-500" aria-label="Quitar">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <ImageUploader
                currentImage={null}
                onUpload={(url) => onCambiar([...lista, url])}
                label="Sumar portada"
                className="w-full h-20"
            />
        </div>
    );
};

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
                    className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#E8C65E] outline-none text-xs py-1 dark:text-slate-300 transition-colors"
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

// Editor de la barra de anuncios: borrador local + vista previa en vivo (igual
// a como se ve en la tienda) + atajos. Sólo guarda al apretar el botón.
const ANNOUNCEMENT_PRESETS = [
    'Compra Segura · Envíos a todo el País',
    'Nueva Colección 2026 · Ya Disponible',
    'Envíos a todo el País · Atención Personalizada',
    'Compra Protegida con Mercado Pago',
];

const AnnouncementEditor = ({ text, enabled, onSaveText, onToggle }) => {
    const [draft, setDraft] = useState(text || '');
    useEffect(() => { setDraft(text || ''); }, [text]);
    const dirty = draft !== (text || '');

    return (
        <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Megaphone className="w-5 h-5 text-[#E8C65E]" /> Barra de Anuncios (Top Bar)
            </h3>

            {/* ESTADO */}
            <div className="flex items-center justify-between mb-5 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <span className="text-xs font-bold uppercase">Estado: {enabled ? 'Activo' : 'Inactivo'}</span>
                <button onClick={onToggle} className={`text-2xl ${enabled ? 'text-green-500' : 'text-slate-300'}`}>
                    {enabled ? <ToggleRight /> : <ToggleLeft />}
                </button>
            </div>

            {/* VISTA PREVIA EN VIVO */}
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Vista previa</label>
            <div className={`rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-5 ${enabled ? '' : 'opacity-50'}`}>
                <div className="relative py-2 text-center" style={{ background: 'linear-gradient(90deg, #9A781D, #BF953F 16%, #FBF1B0 50%, #BF953F 84%, #9A781D)' }}>
                    <div className="banner-shine pointer-events-none absolute inset-0 opacity-70" />
                    <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-white/40" />
                    <p className="relative flex items-center justify-center gap-3 text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#211705]">
                        <span className="text-[#5c4410]/60 text-[8px]">◆</span>
                        <span>{draft || 'Compra Segura · Envíos a todo el País · Nueva Colección 2026'}</span>
                        <span className="text-[#5c4410]/60 text-[8px]">◆</span>
                    </p>
                </div>
            </div>

            {/* TEXTO */}
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Texto del Anuncio</label>
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && dirty) onSaveText(draft); }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#E8C65E] border border-slate-200 dark:border-slate-700"
                placeholder="Ej: Envíos a todo el país · Nueva colección"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">Separá los mensajes con <span className="font-mono text-[#E8C65E] font-bold">·</span> o <span className="font-mono text-[#E8C65E] font-bold">|</span>.</p>

            {/* ATAJOS */}
            <div className="flex flex-wrap gap-2 mt-3">
                {ANNOUNCEMENT_PRESETS.map((p) => (
                    <button key={p} onClick={() => setDraft(p)} className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#E8C65E] hover:text-[#E8C65E] transition-colors">
                        {p}
                    </button>
                ))}
            </div>

            {/* GUARDAR */}
            <button
                onClick={() => onSaveText(draft)}
                disabled={!dirty}
                className={`mt-5 w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${dirty ? 'bg-[#E8C65E] text-black hover:brightness-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'}`}
            >
                {dirty ? 'Guardar texto' : 'Guardado ✓'}
            </button>
        </section>
    );
};

export const CMSView = () => {
    const { categories, addCategory, deleteCategory, siteConfig, updateSiteConfig, addToast, cloudinaryConfig, updateCloudinaryConfig, inventory } = useStore();
    const confirm = useConfirm();
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

    // El toast "Cambios guardados" se debouncea: al escribir/arrastrar un slider
    // se guarda en cada cambio, pero el aviso aparece UNA sola vez cuando parás
    // (antes saltaba un toast por cada tecla).
    const savedToastTimer = useRef(null);
    const notifySaved = () => {
        if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
        savedToastTimer.current = setTimeout(() => addToast("Cambios guardados", "success"), 900);
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
        if (!silent) notifySaved();
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
                    <button onClick={() => setActiveTab('sections')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'sections' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Secciones Home</button>
                    <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'config' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Cloudinary</button>
                </div>
            </div>

            {activeTab === 'config' && (
                <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
                    {/* ... Cloudinary config form (same as before) ... */}
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                        <Monitor className="w-5 h-5 text-[#E8C65E]" /> Configuración de Cloudinary (Imágenes)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Cloud Name</label>
                            <input
                                value={cloudCfg.cloudName}
                                onChange={e => setCloudCfg({ ...cloudCfg, cloudName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Upload Preset</label>
                            <input
                                value={cloudCfg.uploadPreset}
                                onChange={e => setCloudCfg({ ...cloudCfg, uploadPreset: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E]"
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
                        <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Layout className="w-5 h-5 text-[#E8C65E]" /> Visibilidad</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-bold dark:text-white">Cintilla (Marquee)</span>
                                    <button onClick={() => updateSection('root', 'showMarquee', !siteConfig.showMarquee)} className={`text-2xl transition-colors ${siteConfig.showMarquee ? 'text-green-500' : 'text-slate-300'}`}>
                                        {siteConfig.showMarquee ? <ToggleRight /> : <ToggleLeft />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 2. MARQUEE TEXT */}
                        <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Tag className="w-5 h-5 text-[#E8C65E]" /> Texto Cintilla</h3>
                            <textarea
                                value={siteConfig.marquee || ""}
                                onChange={(e) => updateSection('root', 'marquee', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#E8C65E]/50 h-32 text-sm resize-none"
                                placeholder="Texto en movimiento..."
                            />
                        </section>

                        {/* 3. SOCIALS */}
                        <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Share2 className="w-5 h-5 text-[#E8C65E]" /> Redes Sociales</h3>
                            <div className="space-y-3">
                                {['instagram', 'youtube', 'tiktok', 'telegram'].map((social) => (
                                    <div key={social} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-bold uppercase w-16 text-slate-500">{social}</span>
                                        <input
                                            value={siteConfig.social?.[social] || ""}
                                            onChange={(e) => updateSection('social', social, e.target.value, true)} // Silent update
                                            onBlur={(e) => updateLink('social', social, e.target.value)}
                                            className="flex-1 bg-transparent text-xs outline-none dark:text-white"
                                            placeholder={social === 'telegram' ? '@tu_usuario' : 'https://...'}
                                        />
                                    </div>
                                ))}
                                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 px-1">
                                    El Telegram de acá es el de <strong>contacto con la clienta</strong> (tu usuario, ej. <code>@laboutique</code>): prende el botón flotante y el link del pie. No es el del canal donde se publican los productos, que se configura en Ajustes.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* FULL WIDTH HERO SECTION */}
                    <section className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E8C65E] to-transparent opacity-50" />

                        <h3 className="font-bold mb-8 flex items-center gap-2 text-2xl text-slate-800 dark:text-white">
                            <Monitor className="w-6 h-6 text-[#E8C65E]" /> Portada Principal (Hero)
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
                                        <p className="font-serif text-2xl italic text-[#E8C65E] mb-10 drop-shadow-lg">{siteConfig.hero?.subtitle || "Subtítulo"}</p>
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
                                            currentImage={siteConfig.hero?.image}
                                            onUpload={(url) => updateSection('hero', 'image', url)}
                                            label="Cambiar Imagen"
                                            className="w-full h-32"
                                        />
                                        <input
                                            type="text"
                                            placeholder="O pega URL aquí..."
                                            className="w-full bg-transparent text-xs py-2 border-b border-slate-300 dark:border-slate-700 focus:border-[#E8C65E] outline-none dark:text-slate-300"
                                            onBlur={(e) => e.target.value && updateSection('hero', 'image', e.target.value)}
                                        />
                                    </div>

                                    <EditorPortadas
                                        slides={siteConfig.hero?.slides}
                                        onCambiar={(lista) => updateSection('hero', 'slides', lista)}
                                    />

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Título</label>
                                            <input
                                                value={siteConfig.hero?.title || ""}
                                                onChange={(e) => updateSection('hero', 'title', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#E8C65E] outline-none font-cinzel"
                                                placeholder="LA BOUTIQUE"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Subtítulo</label>
                                            <input
                                                value={siteConfig.hero?.subtitle || ""}
                                                onChange={(e) => updateSection('hero', 'subtitle', e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#E8C65E] outline-none italic font-serif"
                                                placeholder="de la Elegancia"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Botón</label>
                                                <input
                                                    value={siteConfig.hero?.buttonText || ""}
                                                    onChange={(e) => updateSection('hero', 'buttonText', e.target.value)}
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#E8C65E] outline-none text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Link</label>
                                                <input
                                                    value={siteConfig.hero?.buttonLink || ""}
                                                    onChange={(e) => updateSection('hero', 'buttonLink', e.target.value)}
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-[#E8C65E] outline-none"
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
                    <AnnouncementEditor
                        text={siteConfig.announcement?.text}
                        enabled={siteConfig.announcement?.enabled}
                        onSaveText={(t) => updateSection('announcement', 'text', t)}
                        onToggle={() => updateSection('announcement', 'enabled', !siteConfig.announcement?.enabled)}
                    />

                    {/* POPUP */}
                    <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm row-span-2">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Gift className="w-5 h-5 text-[#E8C65E]" /> Popup Promocional</h3>

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

            {activeTab === 'sections' && (
                <SectionsEditor
                    siteConfig={siteConfig}
                    updateSiteConfig={updateSiteConfig}
                    addToast={addToast}
                    inventory={inventory}
                />
            )}

            {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* NEW CATEGORY FORM */}
                    <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                            <Plus className="w-5 h-5 text-[#E8C65E]" /> Nueva Categoría
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Nombre</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="Ej: Vestidos de Noche"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#E8C65E]/50 transition-all font-medium text-slate-800 dark:text-slate-100"
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
                                className="w-full bg-[#E8C65E] hover:bg-[#B8932E] text-white py-3 rounded-xl mt-2 font-bold shadow-lg shadow-[#E8C65E]/20"
                            >
                                CREAR CATEGORÍA
                            </Button>
                        </div>
                    </section>

                    {/* CATEGORIES GRID */}
                    <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                            <Tag className="w-5 h-5 text-[#E8C65E]" /> Categorías Activas ({categories.length})
                        </h3>

                        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                            {categories.map(cat => (
                                <div key={cat.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                    <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                        <span className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={async () => { if (await confirm({ title: 'Eliminar categoría', message: `¿Eliminar la categoría "${cat.name}"? Los productos no se borran, pero dejan de aparecer agrupados.`, confirmText: 'Eliminar', danger: true })) deleteCategory(cat.id); }}
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

// --- SECTIONS EDITOR: Testimonials + ShopTheLook + Drop countdown ---
const SectionsEditor = ({ siteConfig, updateSiteConfig, addToast, inventory }) => {
    const testimonials = Array.isArray(siteConfig?.testimonials) ? siteConfig.testimonials : [];
    const shopTheLook = siteConfig?.shopTheLook || {};
    const hotspots = Array.isArray(shopTheLook?.hotspots) ? shopTheLook.hotspots : [];
    const drop = siteConfig?.drop || {};

    const saveField = async (key, value) => {
        await updateSiteConfig({ ...siteConfig, [key]: value });
    };
    const saveNested = async (root, payload) => {
        await updateSiteConfig({ ...siteConfig, [root]: { ...(siteConfig?.[root] || {}), ...payload } });
    };

    const toLocalInput = (raw) => {
        if (!raw) return '';
        const d = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
        if (isNaN(d.getTime())) return '';
        const off = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - off).toISOString().slice(0, 16);
    };

    // Testimonials handlers
    const addTestimonial = () => {
        const next = [...testimonials, { name: '', location: '', text: '', rating: 5 }];
        saveField('testimonials', next);
    };
    const updateTestimonial = (idx, patch) => {
        const next = testimonials.map((t, i) => (i === idx ? { ...t, ...patch } : t));
        saveField('testimonials', next);
    };
    const removeTestimonial = (idx) => {
        const next = testimonials.filter((_, i) => i !== idx);
        saveField('testimonials', next);
    };

    // Hotspots handlers
    const addHotspot = () => {
        if (!inventory?.length) return addToast('No hay productos disponibles', 'error');
        const next = [...hotspots, { productId: inventory[0].id, x: 50, y: 50 }];
        saveNested('shopTheLook', { hotspots: next });
    };
    const updateHotspot = (idx, patch) => {
        const next = hotspots.map((h, i) => (i === idx ? { ...h, ...patch } : h));
        saveNested('shopTheLook', { hotspots: next });
    };
    const removeHotspot = (idx) => {
        const next = hotspots.filter((_, i) => i !== idx);
        saveNested('shopTheLook', { hotspots: next });
    };

    return (
        <div className="space-y-8">
            {/* TESTIMONIALS */}
            <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        <Quote className="w-5 h-5 text-[#E8C65E]" /> Testimonios ({testimonials.length})
                    </h3>
                    <button onClick={addTestimonial} className="inline-flex items-center gap-1 px-4 py-2 bg-[#E8C65E] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#B8932E] transition-colors">
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>

                {testimonials.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        Sin testimonios personalizados — se mostrarán los por defecto. Creá el primero para sobreescribir.
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    value={t.name || ''}
                                    onChange={(e) => updateTestimonial(idx, { name: e.target.value })}
                                    placeholder="Nombre (ej: Sofía G.)"
                                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E]"
                                />
                                <button onClick={() => removeTestimonial(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                value={t.location || ''}
                                onChange={(e) => updateTestimonial(idx, { location: e.target.value })}
                                placeholder="Ciudad (ej: Buenos Aires)"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E]"
                            />
                            <textarea
                                value={t.text || ''}
                                onChange={(e) => updateTestimonial(idx, { text: e.target.value })}
                                placeholder="Comentario del cliente…"
                                rows={3}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E] resize-none"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estrellas</span>
                                <select
                                    value={t.rating || 5}
                                    onChange={(e) => updateTestimonial(idx, { rating: Number(e.target.value) })}
                                    className="px-2 py-1 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SHOP THE LOOK */}
            <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-6">
                    <Target className="w-5 h-5 text-[#E8C65E]" /> Shop the Look (Hotspots)
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase text-slate-500 block">Imagen del look</label>
                        <ImageUploader
                            currentImage={shopTheLook.image}
                            onUpload={(url) => saveNested('shopTheLook', { image: url })}
                            label="Subir imagen del look"
                        />
                        <input
                            type="text"
                            placeholder="O pega URL aquí…"
                            defaultValue=""
                            onBlur={(e) => e.target.value && saveNested('shopTheLook', { image: e.target.value })}
                            className="w-full bg-transparent text-xs py-2 border-b border-slate-300 dark:border-slate-700 focus:border-[#E8C65E] outline-none dark:text-slate-300"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Sin imagen y sin puntos, la sección no se muestra en la home.
                            Cada punto (x, y) usa coordenadas en porcentaje 0–100 sobre la imagen.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-slate-500">Puntos ({hotspots.length})</span>
                            <button onClick={addHotspot} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8C65E] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#B8932E]">
                                <Plus className="w-3 h-3" /> Nuevo
                            </button>
                        </div>
                        {hotspots.length === 0 && (
                            <div className="py-6 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                Sin hotspots — se usan los primeros 3 productos por defecto.
                            </div>
                        )}
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {hotspots.map((h, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={String(h.productId)}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                const asNum = Number(raw);
                                                updateHotspot(idx, { productId: Number.isNaN(asNum) ? raw : asNum });
                                            }}
                                            className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                            {inventory.map(p => (
                                                <option key={p.id} value={String(p.id)}>{p.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => removeHotspot(idx)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Eliminar">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">X ({h.x ?? 50}%)</span>
                                            <input
                                                type="range" min={0} max={100} step={1}
                                                value={Number(h.x ?? 50)}
                                                onChange={(e) => updateHotspot(idx, { x: Number(e.target.value) })}
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Y ({h.y ?? 50}%)</span>
                                            <input
                                                type="range" min={0} max={100} step={1}
                                                value={Number(h.y ?? 50)}
                                                onChange={(e) => updateHotspot(idx, { y: Number(e.target.value) })}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* DROP / COUNTDOWN */}
            <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-6">
                    <Clock className="w-5 h-5 text-[#E8C65E]" /> Próximo Drop / Cuenta Regresiva
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                    Si tenés una promoción programada en Firestore (<code>scheduled_promotions</code>), se prioriza esa.
                    Si no, se usa esta fecha como fallback. Dejala vacía para ocultar el banner.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Título</label>
                        <input
                            value={drop.title || ''}
                            onChange={(e) => saveNested('drop', { title: e.target.value })}
                            placeholder="Ej: Colección Otoño 2026"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E]"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Fecha y hora</label>
                        <input
                            type="datetime-local"
                            value={toLocalInput(drop.nextAt)}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (!v) return saveNested('drop', { nextAt: '' });
                                saveNested('drop', { nextAt: new Date(v).toISOString() });
                            }}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Descripción</label>
                        <textarea
                            rows={2}
                            value={drop.description || ''}
                            onChange={(e) => saveNested('drop', { description: e.target.value })}
                            placeholder="Ej: Acceso anticipado para subscriptoras. No te lo pierdas."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-[#E8C65E] resize-none"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};
