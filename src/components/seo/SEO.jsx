import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../context/StoreContext';

export const SEO = ({ title, description, image, url, type = 'website' }) => {
    const { siteConfig } = useStore();

    // Fallbacks to Site Config
    const siteTitle = siteConfig?.hero?.title || 'La Boutique de la Elegancia';
    const siteSubtitle = siteConfig?.hero?.subtitle || 'Alta Costura';

    const metaTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - ${siteSubtitle}`;
    const metaDescription = description || siteConfig?.editorial?.text || 'Tienda de ropa exclusiva con envíos a todo el país.';
    const metaImage = image || siteConfig?.hero?.image;
    const metaUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};
