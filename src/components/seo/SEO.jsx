import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../context/StoreContext';
import { resolveHeroImage } from '../../utils/helpers';

const SITE_URL = 'https://la-boutique-de-la-elegancia.web.app';

export const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    product,
    averageRating,
    reviewCount,
    brandName = 'La Boutique de la Elegancia'
}) => {
    const { siteConfig } = useStore();

    const siteTitle = siteConfig?.hero?.title || brandName;
    const siteSubtitle = siteConfig?.hero?.subtitle || 'Moda Femenina Premium';

    const metaTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} — ${siteSubtitle}`;
    const metaDescription =
        description ||
        'Moda femenina premium en Argentina. Jeans, camperas, tops, bodys y shorts elegidos uno por uno. Envíos a todo el país y pago en cuotas.';
    // Open Graph exige URL ABSOLUTA: con una ruta relativa WhatsApp y Facebook
    // no muestran la vista previa.
    const rawImage = image || resolveHeroImage(siteConfig) || '/og-image.jpg';
    const metaImage = /^https?:\/\//.test(rawImage) ? rawImage : `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    const metaUrl =
        url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

    // JSON-LD para producto (Schema.org Product).
    const productLd = product
        ? {
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              image: Array.isArray(product.images) && product.images.length > 0
                  ? product.images
                  : [product.image].filter(Boolean),
              description: product.description || metaDescription,
              sku: String(product.id),
              brand: { '@type': 'Brand', name: brandName },
              category: product.category,
              offers: {
                  '@type': 'Offer',
                  url: metaUrl,
                  priceCurrency: 'ARS',
                  price: Number(product.price) || 0,
                  availability:
                      (product.stock === 0 ||
                          (product.variants &&
                              Object.values(product.variants).every((n) => !n)))
                          ? 'https://schema.org/OutOfStock'
                          : 'https://schema.org/InStock',
                  itemCondition: 'https://schema.org/NewCondition'
              }
          }
        : null;

    if (productLd && averageRating && reviewCount > 0) {
        productLd.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Number(averageRating.toFixed ? averageRating.toFixed(1) : averageRating),
            reviewCount: reviewCount
        };
    }

    const organizationLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brandName,
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        sameAs: [
            siteConfig?.social?.instagram,
            siteConfig?.social?.tiktok,
            siteConfig?.social?.youtube
        ].filter(Boolean)
    };

    return (
        <Helmet>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={metaUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content="es_AR" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {productLd && (
                <script type="application/ld+json">{JSON.stringify(productLd)}</script>
            )}
            <script type="application/ld+json">{JSON.stringify(organizationLd)}</script>
        </Helmet>
    );
};
