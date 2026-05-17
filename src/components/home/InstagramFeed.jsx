import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const InstagramFeed = () => {
    const { siteConfig, inventory } = useStore();
    const instagramUrl = siteConfig?.social?.instagram || 'https://instagram.com';

    // Fotos reales del catálogo (no stock genérico) — honesto y premium.
    const feedImages = (inventory || [])
        .filter(p => p?.active !== false && p?.image)
        .slice(0, 6)
        .map(p => ({ url: p.image, name: p.name }));

    // Extract handle from URL if it's a full URL
    const getHandle = (url) => {
        if (!url || url === 'https://instagram.com') return '@LaBoutiqueDeLaElegancia';
        try {
            const parsed = new URL(url);
            const parts = parsed.pathname.split('/').filter(Boolean);
            return parts.length > 0 ? `@${parts[parts.length - 1]}` : '@LaBoutiqueDeLaElegancia';
        } catch {
            return url.startsWith('@') ? url : `@${url}`;
        }
    };

    const handle = getHandle(instagramUrl);

    return (
        <div className="py-20 bg-[#020617] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4 text-cielo-gold font-bold uppercase tracking-widest text-xs">
                        <Instagram className="w-4 h-4" /> Seguinos en Instagram
                    </div>
                    <h2 className="text-4xl font-cinzel text-white mb-3">{handle}</h2>
                    <p className="text-slate-500 text-sm">Mirá nuestros últimos looks y novedades</p>
                </div>

                {/* Grid — fotos reales del catálogo; si no hay, no se muestra */}
                {feedImages.length > 0 && (
                    <div className={`grid gap-2 mb-10 ${feedImages.length >= 6 ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto'}`}>
                        {feedImages.map((item, idx) => (
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={idx}
                                className="group relative aspect-square overflow-hidden cursor-pointer"
                            >
                                <img
                                    src={item.url}
                                    alt={item.name || `Look ${idx + 1}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Instagram className="w-6 h-6 text-white" />
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="text-center">
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors backdrop-blur-sm"
                    >
                        <Instagram className="w-4 h-4" />
                        Ver perfil en Instagram
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
};
