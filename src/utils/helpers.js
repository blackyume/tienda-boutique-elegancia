export const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Dorado/oro metálico premium (gradiente). Requiere `background` (no backgroundColor).
export const METALLIC_GOLD = 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #D4AF37 55%, #AA771C 100%)';
export const METALLIC_SILVER = 'linear-gradient(135deg, #9C9C9C 0%, #F5F5F5 45%, #C0C0C0 55%, #808080 100%)';

// Diccionario Masivo de Colores (Español & Inglés). A nivel de módulo para
// poder normalizarlo una sola vez y reutilizarlo.
const COLOR_DICT = {
    // Básicos
    'blanco': '#FFFFFF', 'white': '#FFFFFF',
    'negro': '#000000', 'black': '#000000',
    'gris': '#9CA3AF', 'grey': '#9CA3AF', 'gray': '#9CA3AF', 'gris melange': '#9CA3AF', 'gris oscuro': '#4B5563', 'plomo': '#4B5563', 'carbón': '#374151',

    // Rojos / Rosas
    'rojo': '#EF4444', 'red': '#EF4444', 'carmín': '#991B1B', 'rubí': '#9F1239',
    'bordo': '#7F1D1D', 'bordó': '#7F1D1D', 'vino': '#7F1D1D', 'borgoña': '#5B1818', 'marsala': '#5B1818', 'granate': '#7F1D1D',
    'rosa': '#EC4899', 'pink': '#EC4899', 'rosa viejo': '#D48698', 'rosa bebe': '#FBCFE8', 'rosa pastel': '#FBCFE8', 'palo rosa': '#D8A0A6', 'rosa chicle': '#F472B6',
    'fucsia': '#D946EF', 'magenta': '#D946EF', 'chicle': '#DB2777', 'frambuesa': '#BE185D',
    'coral': '#FB7185', 'salmon': '#FA8072', 'salmón': '#FA8072',

    // Azules / Celestes
    'azul': '#2563EB', 'blue': '#2563EB',
    'azul marino': '#1E3A8A', 'navy': '#1E3A8A', 'azul noche': '#121A2E', 'marino': '#1E3A8A',
    'azul francia': '#1D4ED8', 'royal': '#1D4ED8', 'cobalto': '#1E40AF', 'eléctrico': '#1D4ED8',
    'celeste': '#38BDF8', 'skyblue': '#38BDF8', 'cielo': '#7DD3FC',
    'turquesa': '#2DD4BF', 'turquoise': '#2DD4BF', 'petroleo': '#0E7490', 'petróleo': '#0E7490', 'cian': '#22D3EE', 'aquamarina': '#7FFFD4', 'aguamarina': '#7FFFD4',
    'jean': '#475569', 'denim': '#475569', 'índigo': '#4338CA', 'indigo': '#4338CA',

    // Verdes
    'verde': '#10B981', 'green': '#10B981',
    'verde manzana': '#84CC16', 'manzana': '#84CC16', 'pistacho': '#BEF264',
    'verde militar': '#4F5D2F', 'militar': '#4F5D2F', 'oliva': '#4F5D2F', 'musgo': '#3F6212', 'seco': '#4F5D2F',
    'verde agua': '#99F6E4', 'menta': '#6EE7B7', 'esmeralda': '#10B981',
    'verde botella': '#064E3B', 'botella': '#064E3B', 'benetton': '#009944', 'inglés': '#064E3B', 'bosque': '#14532D',
    'lima': '#84CC16', 'lime': '#84CC16', 'limón': '#D9F99D', 'limon': '#D9F99D',

    // Amarillos / Naranjas / Tierras
    'amarillo': '#F59E0B', 'yellow': '#F59E0B', 'oro': METALLIC_GOLD, 'gold': METALLIC_GOLD,
    'mostaza': '#D97706', 'mustard': '#D97706', 'ocre': '#B45309', 'miel': '#F59E0B', 'ámbar': '#F59E0B', 'ambar': '#F59E0B',
    'naranja': '#F97316', 'orange': '#F97316', 'ladrillo': '#9A3412', 'terracota': '#C05621', 'calabaza': '#EA580C', 'mandarina': '#F97316',
    'chocolate': '#5D4037', 'brown': '#5D4037', 'marron': '#78350F', 'marrón': '#78350F', 'cafe': '#3E2723', 'café': '#3E2723', 'tabaco': '#451a03', 'moka': '#4E3629',
    'camel': '#C19A6B', 'suela': '#A0522D', 'tostado': '#A0522D', 'canela': '#A0522D',
    'beige': '#D2B48C', 'arena': '#E5D0A1', 'champagne': '#F7E7CE', 'champan': '#F7E7CE', 'avellana': '#D2B48C', 'taupe': '#8B7E74',
    'nude': '#E5D0C6', 'piel': '#E5D0C6', 'durazno': '#FFDAB9', 'damasco': '#FFCBA4',
    'crema': '#FBF3D9', 'crudo': '#EDE6D6', 'natural': '#E8E0CC', 'maiz': '#FAE087', 'maíz': '#FAE087', 'vainilla': '#FEF3C7', 'hueso': '#E3DAC9', 'marfil': '#FFFFF0',

    // Violetas
    'violeta': '#8B5CF6', 'purple': '#8B5CF6', 'púrpura': '#7C3AED', 'purpura': '#7C3AED',
    'lila': '#C4B5FD', 'lavanda': '#DDD6FE', 'malva': '#D8B4FE',
    'uva': '#581C87', 'morado': '#7C3AED', 'ciruela': '#6D28D9', 'berenjena': '#4C1D95',

    // Metálicos / Especiales
    'plata': METALLIC_SILVER, 'silver': METALLIC_SILVER, 'plateado': METALLIC_SILVER, 'gris perla': '#E5E7EB', 'perla': '#F0EAD6',
    'dorado': METALLIC_GOLD, 'cobre': '#B87333', 'bronce': '#CD7F32',
    'multicolor': 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
};

// Normaliza un nombre: minúsculas, sin acentos, espacios colapsados.
const DIACRITICS = /[̀-ͯ]/g;
const normColor = (s) => String(s || '').toLowerCase().trim()
    .normalize('NFD').replace(DIACRITICS, '').replace(/\s+/g, ' ');

// Diccionario con claves normalizadas (sin acentos) para matchear "café"≈"cafe".
const NORM_DICT = Object.fromEntries(Object.entries(COLOR_DICT).map(([k, v]) => [normColor(k), v]));

// Palabras modificadoras: ajustan un color base. Ej "azul bebé", "verde oscuro".
const MODIFIERS = {
    claro: ['claro', 'clarito', 'clara', 'light', 'tenue'],
    pastel: ['pastel', 'bebe', 'baby', 'suave', 'palido'],
    oscuro: ['oscuro', 'oscura', 'dark', 'profundo', 'intenso'],
    fluo: ['fluo', 'fluor', 'neon', 'fluorescente'],
};
const MOD_WORDS = new Set(Object.values(MODIFIERS).flat());

// --- Mini-utilidades de color (operan sobre #rrggbb) ---
const hexToRgb = (h) => {
    let s = h.replace('#', '');
    if (s.length === 3) s = s.split('').map(c => c + c).join('');
    const n = parseInt(s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (hex, target, amt) => { const [r, g, b] = hexToRgb(hex); const [tr, tg, tb] = target; return rgbToHex(r + (tr - r) * amt, g + (tg - g) * amt, b + (tb - b) * amt); };
const lighten = (hex, amt) => mix(hex, [255, 255, 255], amt);
const darken = (hex, amt) => mix(hex, [0, 0, 0], amt);
const isHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

// Resuelve un nombre como color CSS nativo del browser (ej "tomato", "skyblue",
// "hotpink") usando el canvas. Devuelve null fuera del browser o si es inválido.
let _cssCtx;
const cssNativeColor = (name) => {
    if (typeof document === 'undefined') return null;
    try {
        _cssCtx = _cssCtx || document.createElement('canvas').getContext('2d');
        _cssCtx.fillStyle = '#010203'; _cssCtx.fillStyle = name; const a = _cssCtx.fillStyle;
        _cssCtx.fillStyle = '#030201'; _cssCtx.fillStyle = name; const b = _cssCtx.fillStyle;
        return a === b ? a : null; // si ambos defaults dan lo mismo, el color es válido
    } catch { return null; }
};

const _cache = new Map();

// getColorHex: resuelve CUALQUIER nombre al mejor color posible, automáticamente.
// overrides = mapa nombre→hex elegido por el dueño (gana siempre).
export const getColorHex = (colorName, overrides) => {
    if (!colorName) return '#E5E7EB';

    // 0. Override explícito del producto (tono elegido a mano).
    if (overrides) {
        const ov = overrides[colorName] || overrides[normColor(colorName)];
        if (ov) return ov;
    }

    const raw = String(colorName).toLowerCase().trim();
    if (raw.startsWith('#') || raw.startsWith('rgb') || raw.startsWith('hsl')) return colorName;

    const name = normColor(colorName);
    if (_cache.has(name)) return _cache.get(name);

    const out = resolveColor(name);
    _cache.set(name, out);
    return out;
};

const resolveColor = (name) => {
    // 1. Match exacto (con o sin acentos).
    if (NORM_DICT[name]) return NORM_DICT[name];

    // 2. Nombre compuesto: separar modificadores (claro/oscuro/pastel/fluo) del color base.
    const words = name.split(' ').filter(Boolean);
    const baseWords = words.filter(w => !MOD_WORDS.has(w) && w !== 'de' && w !== 'color');
    const mods = words.filter(w => MOD_WORDS.has(w));
    const baseName = baseWords.join(' ');

    let base = NORM_DICT[baseName] || cssNativeColor(baseName);
    // 3. Si el compuesto no matchea, probar palabra por palabra (la última que matchee, ej "palo de rosa"→rosa).
    if (!base) { for (const w of baseWords) { const hit = NORM_DICT[w] || cssNativeColor(w); if (hit) base = hit; } }
    // 4. Color CSS nativo del nombre completo (ej "hotpink", "tomato").
    if (!base) base = cssNativeColor(name);

    if (base && mods.length && isHex(base)) {
        for (const m of mods) {
            if (MODIFIERS.claro.includes(m)) base = lighten(base, 0.4);
            else if (MODIFIERS.pastel.includes(m)) base = lighten(base, 0.6);
            else if (MODIFIERS.oscuro.includes(m)) base = darken(base, 0.35);
            else if (MODIFIERS.fluo.includes(m)) base = mix(lighten(base, 0.1), [180, 255, 0], 0.25);
        }
    }
    // 5. Último recurso: gris claro visible (nunca un swatch invisible).
    return base || '#CBD5E1';
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
// Portada del hero. La tienda arrancó con una foto de stock de Unsplash (una
// modelo ajena a la marca) cargada en el CMS; se reemplazó por una portada
// propia armada con las prendas publicadas. Mientras el CMS siga apuntando a
// esa foto de stock se ignora; cualquier portada nueva que se suba sí manda.
export const PORTADA_PROPIA = '/portada-modelo.jpg';

export const resolveHeroImage = (siteConfig) => {
    const configurada = typeof siteConfig?.hero === 'string'
        ? siteConfig.hero
        : siteConfig?.hero?.image;
    if (!configurada || configurada.includes('images.unsplash.com')) return PORTADA_PROPIA;
    return configurada;
};
