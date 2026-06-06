// Paleta de swatches del panel Admin (incluye patrones simulados:
// estampado, animal print, floreado, rayado). Para colores de cara al
// cliente usar `getColorHex` de utils/helpers.js (maneja #hex y CSS names).

export const COLOR_MAP = {
    'blanco': '#ffffff', 'negro': '#000000', 'gris': '#808080', 'gris claro': '#d3d3d3', 'gris oscuro': '#a9a9a9', 'plata': '#c0c0c0', 'humo': '#848884', 'carbon': '#36454f', 'blanco tiza': '#f5f5f5', 'hueso': '#e3dac9', 'marfil': '#fffff0', 'crema': '#fffdd0', 'vainilla': '#f3e5ab', 'nude': '#f5d0b5', 'piel': '#f5d0b5', 'natural': '#faebd7', 'champagne': '#fad6a5', 'vison': '#9e9e9e', 'taupe': '#483c32', 'camel': '#D4AF37', 'beige': '#f5f5dc', 'arena': '#f4a460', 'crudo': '#dbd7d2', 'tiza': '#f5f5f5',

    // Rojos / Rosas / Naranjas
    'rojo': '#ff0000', 'bordo': '#800000', 'bordó': '#800000', 'vino': '#722f37', 'terracota': '#e2725b', 'ladrillo': '#b22222', 'cereza': '#de3163', 'carmesi': '#dc143c', 'granate': '#800000', 'rubi': '#e0115f', 'coral': '#ff7f50', 'salmon': '#fa8072', 'durazno': '#ffe5b4', 'naranja': '#ffa500', 'calabaza': '#ff7518', 'oxido': '#b7410e', 'mandarina': '#f28500',
    'rosa': '#ffc0cb', 'rosa viejo': '#eed0d6', 'rosa pastel': '#ffd1dc', 'rosa chicle': '#ff69b4', 'chicle': '#ff69b4', 'fucsia': '#ff00ff', 'magenta': '#ff00ff', 'frambuesa': '#e30b5d', 'uva': '#6f2da8', 'ciclamen': '#ff00ff',

    // Azules / Celestes / Turquesas
    'azul': '#0000ff', 'azul marino': '#000080', 'marino': '#000080', 'azul francia': '#318ce7', 'azul electrico': '#7df9ff', 'azul noche': '#191970', 'petroleo': '#005f6b', 'azul acero': '#4682b4', 'cobalto': '#0047ab', 'indigo': '#4b0082', 'ultramar': '#120a8f', 'jean': '#5d76cb',
    'celeste': '#87ceeb', 'celeste pastel': '#b0e0e6', 'cielo': '#87ceeb', 'turquesa': '#40e0d0', 'aqua': '#00ffff', 'cian': '#00ffff', 'aguamarina': '#7fffd4', 'menta': '#98ff98', 'petroleo claro': '#5f9ea0',

    // Verdes
    'verde': '#008000', 'verde oscuro': '#006400', 'verde militar': '#4b5320', 'militar': '#4b5320', 'oliva': '#808000', 'musgo': '#8a9a5b', 'seco': '#8a9a5b', 'verde botella': '#006a4e', 'botella': '#006a4e', 'esmeralda': '#50c878', 'verde agua': '#20b2aa', 'verde manzana': '#8db600', 'manzana': '#8db600', 'lima': '#32cd32', 'verde lima': '#32cd32', 'pistacho': '#93c572', 'jade': '#00a86b', 'benetton': '#00994e', 'fluor': '#ccff00', 'neon': '#39ff14', 'palta': '#568203',

    // Amarillos / Dorados
    'amarillo': '#ffff00', 'amarillo patito': '#fcf655', 'mostaza': '#ffdb58', 'maiz': '#fbec5d', 'limon': '#fff700', 'dorado': '#ffd700', 'oro': '#ffd700', 'ambar': '#ffbf00',

    // Marrones / Tierras / Maderas
    'marron': '#8b4513', 'chocolate': '#d2691e', 'cafe': '#6f4e37', 'tierra': '#a0522d', 'suela': '#b87333', 'moka': '#4e3629', 'tabaco': '#6f4c3e', 'canela': '#d2691e', 'cobre': '#b87333', 'bronce': '#cd7f32', 'roble': '#4d372d',

    // Violetas / Lilas
    'violeta': '#ee82ee', 'purpura': '#800080', 'lila': '#c8a2c8', 'morado': '#a020f0', 'lavanda': '#e6e6fa', 'ciruela': '#8e4585', 'berenjena': '#614051', 'obispo': '#663399',

    // Estampados / Especiales (Simulados)
    'multicolor': 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
    'estampado': 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)',
    'animal print': 'repeating-radial-gradient(#8b4513, #f5deb3 5px, #8b4513 10px)',
    'floreado': 'radial-gradient(circle, #ff69b4 20%, #00ff00 20%, #fff 50%)',
    'rayado': 'repeating-linear-gradient(90deg, #000, #000 5px, #fff 5px, #fff 10px)'
};

export const getColorHex = (name) => COLOR_MAP[String(name || '').toLowerCase()] || '#cbd5e1';
