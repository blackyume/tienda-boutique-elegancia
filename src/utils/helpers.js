export const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const getColorHex = (colorName) => {
    if (!colorName) return '#E5E7EB'; // Gris default

    const name = colorName.toLowerCase().trim();

    // 1. Si el usuario escribió un código HEX (ej: #FF0000), usarlo directo
    if (name.startsWith('#')) {
        return name;
    }

    // 2. Diccionario Masivo de Colores (Español & Inglés)
    const map = {
        // Básicos
        'blanco': '#FFFFFF', 'white': '#FFFFFF',
        'negro': '#000000', 'black': '#000000',
        'gris': '#9CA3AF', 'grey': '#9CA3AF', 'gris melange': '#9CA3AF', 'gris oscuro': '#4B5563', 'plomo': '#4B5563', 'carbón': '#374151',

        // Rojos / Rosas
        'rojo': '#EF4444', 'red': '#EF4444', 'carmín': '#991B1B', 'rubí': '#9F1239',
        'bordo': '#7F1D1D', 'vino': '#7F1D1D', 'borgoña': '#5B1818', 'marsala': '#5B1818',
        'rosa': '#EC4899', 'pink': '#EC4899', 'rosa viejo': '#D48698', 'rosa bebe': '#FCE7F3', 'rosa pastel': '#FCE7F3',
        'fucsia': '#D946EF', 'magenta': '#D946EF', 'chicle': '#DB2777', 'frambuesa': '#BE185D',
        'coral': '#FB7185', 'salmon': '#FA8072',

        // Azules / Celestes
        'azul': '#2563EB', 'blue': '#2563EB',
        'azul marino': '#1E3A8A', 'navy': '#1E3A8A', 'azul noche': '#0F172A', 'marino': '#1E3A8A',
        'azul francia': '#1D4ED8', 'royal': '#1D4ED8', 'cobalto': '#1E40AF', 'eléctrico': '#2563EB',
        'celeste': '#38BDF8', 'skyblue': '#38BDF8', 'cielo': '#E0F2FE', 'pastel': '#E0F2FE',
        'turquesa': '#2DD4BF', 'turquoise': '#2DD4BF', 'petroleo': '#0E7490', 'cian': '#22D3EE', 'aquamarina': '#7FFFD4',
        'jean': '#475569', 'denim': '#475569', 'índigo': '#4338CA',

        // Verdes
        'verde': '#10B981', 'green': '#10B981',
        'verde manzana': '#84CC16', 'manzana': '#84CC16', 'pistacho': '#BEF264',
        'verde militar': '#4F5D2F', 'oliva': '#4F5D2F', 'musgo': '#3F6212', 'seco': '#4F5D2F',
        'verde agua': '#99F6E4', 'menta': '#6EE7B7', 'esmeralda': '#10B981',
        'verde botella': '#064E3B', 'benetton': '#009944', 'inglés': '#064E3B', 'bosque': '#14532D',
        'lima': '#84CC16', 'lime': '#84CC16', 'limón': '#F7FEE7',

        // Amarillos / Naranjas / Tierras
        'amarillo': '#F59E0B', 'yellow': '#F59E0B', 'oro': '#FFD700', 'gold': '#FFD700',
        'mostaza': '#D97706', 'mustard': '#D97706', 'ocre': '#B45309', 'miel': '#F59E0B',
        'naranja': '#F97316', 'orange': '#F97316', 'ladrillo': '#9A3412', 'terracota': '#C05621', 'calabaza': '#EA580C',
        'chocolate': '#5D4037', 'brown': '#5D4037', 'marron': '#78350F', 'cafe': '#3E2723', 'tabaco': '#451a03',
        'camel': '#C19A6B', 'suela': '#C19A6B', 'tostado': '#A0522D',
        'beige': '#D2B48C', 'arena': '#E5D0A1', 'champagne': '#F7E7CE', 'avellana': '#D2B48C',
        'nude': '#E5D0C6', 'piel': '#E5D0C6', 'durazno': '#FFDAB9',
        'crema': '#FFFDD0', 'crudo': '#F5F5DC', 'natural': '#E8E4C9', 'maiz': '#FAE087', 'vainilla': '#FEF3C7',

        // Violetas
        'violeta': '#8B5CF6', 'purple': '#8B5CF6',
        'lila': '#C4B5FD', 'lavanda': '#E9D5FF', 'malva': '#D8B4FE',
        'uva': '#581C87', 'morado': '#7C3AED', 'ciruela': '#4C1D95', 'berenjena': '#4C1D95',

        // Metálicos / Especiales
        'plata': '#C0C0C0', 'silver': '#C0C0C0', 'gris perla': '#E5E7EB',
        'dorado': '#FFD700', 'cobre': '#B87333', 'bronce': '#CD7F32',
        'multicolor': 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
    };

    // 3. Si no está en el mapa, intentar usar el nombre como color CSS nativo (ej: "tomato")
    // Si falla, devuelve gris claro.
    return map[name] || name;
};

export const optimizeImage = (url, width = 800) => {
    if (!url) return '';
    if (typeof url !== 'string') return url;

    // 1. Cloudinary Optimization
    // Pattern: /upload/ --> /upload/f_auto,q_auto,w_{width}/
    if (url.includes('cloudinary.com')) {
        // Avoid double optimization or messing up existing transformations if possible
        // Simple replace for standard upload urls
        return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }

    // 2. Unsplash Optimization (already supported by query params)
    // Pattern: append &w={width}&q=80&auto=format
    if (url.includes('images.unsplash.com')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${width}&q=80&auto=format`;
    }

    // 3. Others (return as is)
    return url;
};