import React from 'react';
import { Instagram } from 'lucide-react';

export const InstagramFeed = () => {
    // Imágenes de muestra (en un futuro podrían venir de la API de Instagram)
    const images = [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1529139574466-a302c2d56dc6?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1550614000-4b9519e007d3?auto=format&fit=crop&q=80&w=400"
    ];

    return (
        <div className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-8 text-[#C19A6B] font-bold uppercase tracking-widest text-xs">
                    <Instagram className="w-4 h-4" /> Seguinos en Instagram
                </div>
                <h2 className="text-4xl font-serif text-slate-900 dark:text-white mb-12">@LaBoutique</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <a href="#" key={idx} className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer">
                            <img src={img} alt="Instagram Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-white" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};