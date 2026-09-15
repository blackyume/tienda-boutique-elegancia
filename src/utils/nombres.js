// Cómo se muestran los nombres de producto en la tienda.
//
// El dueño carga los nombres en MAYÚSCULAS ("JEANS ELASTIZADO OXFORD"), que
// en serif y a dos líneas gritan. Acá se convierten al mostrarlos, sin tocar
// lo guardado: "Jeans elastizado Oxford". Se respetan las siglas y las
// palabras que el dueño escribió con mayúscula intencional dentro de un
// nombre mixto.

const MINUSCULAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'con', 'sin', 'y', 'o', 'a', 'en', 'para', 'por']);

// Marcas y nombres propios que van con mayúscula aunque estén en el medio.
const PROPIOS = new Set(['oxford', 'morley', 'rafaela', 'levis', "levi's", 'wrangler', 'lee', 'santi']);

// Siglas y talles que se dejan como están.
const SIGLAS = /^(xs|s|m|l|xl|xxl|xxxl|xg|g|xxg|uv|3d|2d|v|u)$/i;

const capitalizar = (p) => p.charAt(0).toUpperCase() + p.slice(1);

/**
 * Nombre de producto para la tienda. Sólo transforma los nombres que están
 * TODOS en mayúsculas; un nombre escrito con criterio ("Top Rib Verano") se
 * deja igual.
 */
export const tituloDeProducto = (nombre) => {
    const s = String(nombre || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    const letras = s.replace(/[^a-záéíóúñü]/gi, '');
    if (!letras || letras !== letras.toUpperCase()) return s;

    return s.toLowerCase().split(' ').map((palabra, i) => {
        if (SIGLAS.test(palabra) && palabra.length <= 3) return palabra.toUpperCase();
        if (i > 0 && MINUSCULAS.has(palabra)) return palabra;
        if (PROPIOS.has(palabra)) return capitalizar(palabra);
        if (i === 0) return capitalizar(palabra);
        return palabra;
    }).join(' ').replace(/^(\p{L})/u, (m) => m.toUpperCase());
};
