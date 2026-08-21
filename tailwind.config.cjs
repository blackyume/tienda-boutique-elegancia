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
                // Paleta black + gold. Remapeamos `slate` a gris neutro para
                // eliminar el tinte azulado por default de Tailwind en cards,
                // bordes y textos. El acento dorado se mantiene.
                slate: neutral,
                // Fondo: PLATINO. La rampa conserva la escalera de luz exacta
                // que tenia la tierra del campo (misma L en cada escalon, para
                // que el relieve -- que separa por LUZ, no por color -- quede
                // igual), pero girada a H220 con S~13. Ese tinte frio leve es
                // lo que hace que se lea PLATA y no carbon: el gris puro (S0)
                // se ve apagado y el oro no salta.
                // La tierra NO se borro: vive en git y en /tierra-tile.webp.
                'cielo-dark': '#1C1F25',
                // El dorado de marca NO se toca: contra #1C1F25 da 7,85:1
                // (mejor que los 6,92:1 que daba sobre la tierra).
                'cielo-gold': '#D4AF37',
                plata: {
                    950: '#131519',  // fondo de pagina, el mas hondo
                    900: '#1C1F25',  // fondo base  (= cielo-dark)
                    850: '#272B33',  // superficie de card
                    800: '#323744',  // card elevada / hover
                    700: '#3A404B',  // bordes
                    500: '#7C8695',  // plata media, el tono ancla
                    300: '#C4CBD6',  // plata clara (texto secundario)
                    100: '#E6EAF0',  // texto sobre plata (14,7:1 sobre el base)
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
                // #272B33 sobre #1C1F25 contrasta apenas 1,15:1 - a color solo
                // serian invisibles.
                'plata-superficie': 'linear-gradient(180deg, #2A2E36 0%, #1F2227 100%)',
                'plata-elevada': 'linear-gradient(180deg, #363B46 0%, #272B33 100%)',
                'plata-hondo': 'linear-gradient(180deg, #15181D 0%, #1C1F25 55%, #191C22 100%)',
                // Brillo de plata pulida, el gemelo frio del gold-metallic.
                'plata-metalica': 'linear-gradient(to right, #7E8590, #F2F5F9, #A7AEBA, #E8ECF2, #6E7682)',
            },
            boxShadow: {
                // Bisel: filo de luz arriba + filo oscuro abajo + sombra proyectada.
                'relieve': '0 1px 0 rgba(226,234,245,.07) inset, 0 -1px 0 rgba(0,0,0,.4) inset, 0 8px 20px -10px rgba(0,0,0,.75)',
                'relieve-alto': '0 1px 0 rgba(226,234,245,.11) inset, 0 -1px 0 rgba(0,0,0,.45) inset, 0 18px 38px -14px rgba(0,0,0,.85)',
                'relieve-hundido': '0 2px 6px -2px rgba(0,0,0,.6) inset, 0 -1px 0 rgba(226,234,245,.05) inset',
                'plata': '0 0 0 1px rgba(196,203,214,.30), 0 8px 24px -12px rgba(196,203,214,.35)',
                'oro': '0 0 0 1px rgba(212,175,55,.35), 0 8px 24px -12px rgba(212,175,55,.45)',
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
