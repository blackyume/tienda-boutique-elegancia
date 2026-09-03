/** @type {import('tailwindcss').Config} */
const { neutral } = require('tailwindcss/colors');

module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Paleta NEGRO + ORO. Remapeamos `slate` a gris neutro para
                // eliminar el tinte azulado por default de Tailwind en cards,
                // bordes y textos.
                slate: neutral,
                // Fondo: NEGRO CALIDO. Es negro de verdad (L 0,52%: el blanco
                // da 19,03:1 encima), pero girado a H40 con S~12 en vez de gris
                // puro. Esa pizca de calor es lo que hace que el oro se lea
                // como METAL sobre la pagina y no como un amarillo pegado
                // encima: un negro frio (H220) le pelea el tono al dorado.
                // Antes fue tierra (#312721) y despues platino (#1C1F25); las
                // dos viven en git.
                'cielo-dark': '#11100D',
                // Oro BRILLANTE (H45 S75 L64). El de antes, #D4AF37, daba
                // 9,05:1 sobre este negro; este da 11,48:1 -- mas luz sin
                // salirse a amarillo limon. Texto negro encima: 12,00:1.
                'cielo-gold': '#E8C65E',
                noche: {
                    950: '#0A0908',  // fondo de pagina, el mas hondo
                    900: '#11100D',  // fondo base  (= cielo-dark)
                    850: '#22201B',  // superficie de card
                    800: '#302D27',  // card elevada / hover
                    700: '#3F3A31',  // bordes
                    500: '#827A68',  // tono ancla, texto apagado
                    300: '#D1CBBD',  // texto secundario (11,77:1 sobre el base)
                    100: '#F1EEE4',  // texto principal calido (16,4:1)
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Bodoni Moda', 'Playfair Display', 'serif'],
                luxury: ['Cinzel', 'serif'],
                cinzel: ['Cinzel', 'serif'],
            },
            fontSize: {
                '2xs': '10px',
                '3xs': '9px',
            },
            backgroundImage: {
                'gold-metallic': 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
                // Relieve: las cards separan del fondo por LUZ, no por color.
                // #22201B sobre #11100D contrasta 1,17:1 - a color solo serian
                // invisibles. Sobre negro la sombra proyectada ya no puede
                // ayudar (no hay mas oscuro), asi que el trabajo lo hace el
                // FILO DE LUZ de arriba, que por eso subio de .07 a .10.
                'noche-superficie': 'linear-gradient(180deg, #26231D 0%, #16140F 100%)',
                'noche-elevada': 'linear-gradient(180deg, #34302A 0%, #22201B 100%)',
                'noche-hondo': 'linear-gradient(180deg, #080807 0%, #11100D 55%, #0E0D0A 100%)',
                // Oro pulido: el mismo brillo del gold-metallic pero mas ancho,
                // para barras y filos largos.
                'oro-pulido': 'linear-gradient(to right, #A8842B, #FFF8D4, #E8C65E, #FFF3B8, #8F6B12)',
            },
            boxShadow: {
                // Bisel: filo de luz arriba + filo oscuro abajo + sombra proyectada.
                'relieve': '0 1px 0 rgba(255,244,214,.07) inset, 0 -1px 0 rgba(0,0,0,.4) inset, 0 8px 20px -10px rgba(0,0,0,.75)',
                'relieve-alto': '0 1px 0 rgba(255,244,214,.11) inset, 0 -1px 0 rgba(0,0,0,.45) inset, 0 18px 38px -14px rgba(0,0,0,.85)',
                'relieve-hundido': '0 2px 6px -2px rgba(0,0,0,.6) inset, 0 -1px 0 rgba(255,244,214,.05) inset',
                'plata': '0 0 0 1px rgba(232,198,94,.30), 0 8px 24px -12px rgba(232,198,94,.35)',
                'oro': '0 0 0 1px rgba(232,198,94,.35), 0 8px 24px -12px rgba(232,198,94,.45)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0) scale(1.1)' },
                    '50%': { transform: 'translateY(-10px) scale(1.1)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                marquee2: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0%)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                // Zoom suave. Antes iba de 1.08 a 1.18 y se comía casi un cuarto
                // del encuadre: cualquier composición de portada terminaba con
                // las prendas de los costados cortadas.
                kenburns: {
                    '0%': { transform: 'scale(1.02) translate3d(0,0,0)' },
                    '100%': { transform: 'scale(1.07) translate3d(-0.8%, -0.8%, 0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.8s ease-out forwards',
                slideUp: 'slideUp 1s ease-out forwards',
                float: 'float 10s ease-in-out infinite',
                marquee: 'marquee 25s linear infinite',
                marquee2: 'marquee2 25s linear infinite',
                kenburns: 'kenburns 24s ease-in-out infinite alternate',
            },
        },
    },
    plugins: [],
}
