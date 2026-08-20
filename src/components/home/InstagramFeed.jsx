import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { optimizeImage } from '../../utils/helpers';
import { SectionHeader } from './SectionHeader';

export const InstagramFeed = () => {
    const { siteConfig, inventory } = useStore();
    const instagramUrl = siteConfig?.social?.instagram || 'https://www.instagram.com/laboutiquedelaeleganciaoficial/';

    // Son fotos del catálogo, no posteos de Instagram (traerlos necesitaría la
    // API de Meta). Antes cada una llevaba al perfil: la visitante tocaba una
    // prenda que le gustó y terminaba fuera de la tienda. Ahora cada foto va a
    // SU producto, y el botón de abajo queda para seguir la cuenta.
    const feedImages = (inventory || [])
        .filter(p => p?.active !== false && p?.image)
        .slice(0, 6)
        .map(p => ({ id: p.id, url: p.image, name: p.name }));

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
        <div className="py-14 md:py-20 bg-[#312721] border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-6">
                <SectionHeader
                    eyebrow={<span className="inline-flex items-center gap-2"><Instagram className="w-3.5 h-3.5" /> Seguinos en Instagram</span>}
                    title={handle}
                    titleClassName="text-2xl md:text-3xl lg:text-4xl break-all sm:break-normal"
                    subtitle="Tocá cualquier prenda para verla, y seguinos para las novedades"
                    className="mb-12"
                />

                {/* Grid — fotos reales del catálogo; si no hay, no se muestra */}
                {feedImages.length > 0 && (
                    <div className={`grid gap-2 mb-10 ${feedImages.length >= 6 ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto'}`}>
                        {feedImages.map((item, idx) => (
                            <Link
                                to={`/product/${item.id}`}
                                key={item.id || idx}
                                aria-label={`Ver ${item.name}`}
                                className="group relative aspect-square overflow-hidden cursor-pointer"
                            >
                                <img
                                    src={optimizeImage(item.url, 400)}
                                    alt={item.name || `Look ${idx + 1}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-[10px] uppercase tracking-widest text-white font-bold leading-tight line-clamp-2">
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
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
