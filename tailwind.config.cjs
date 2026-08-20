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
                // eliminar el tinte azulado en toda la app (cards, bordes, textos)
                // sin tocar cada componente. El acento dorado se mantiene.
                slate: neutral,
                // Fondo: tierra del campo. El tono NO se eligio a ojo, se midio
                // sobre la foto del corral (CAMPO-TIERRA.jpg): la tierra pisada
                // del primer plano da H22 S20 de forma consistente en las 4
                // zonas medidas (dominante #9E816F, 26% de los pixeles).
                // Toda la rampa sale de ese mismo H22/S20 cambiando la L, para
                // que la pagina entera sea el mismo puñado de tierra.
                'cielo-dark': '#312721',
                // El dorado de marca NO se toca: contra #312721 da 6,92:1,
                // sigue pasando AA holgado, y es la identidad de la tienda.
                'cielo-gold': '#D4AF37',
                tierra: {
                    950: '#1F1814',  // fondo de pagina, el mas hondo
                    900: '#312721',  // fondo base  (= cielo-dark)
                    850: '#40332B',  // superficie de card
                    800: '#503F35',  // card elevada / hover
                    700: '#685245',  // bordes
                    500: '#9E816F',  // tierra medida, el tono ancla
                    300: '#C6B4A9',  // polvo del corral
                    100: '#EEE7E3',  // texto sobre tierra (13,2:1)
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
                // #40332B sobre #312721 contrasta apenas 1,15:1 - a color solo
                // serian invisibles.
                'tierra-superficie': 'linear-gradient(180deg, #443630 0%, #352A24 100%)',
                'tierra-elevada': 'linear-gradient(180deg, #534137 0%, #40332B 100%)',
                'tierra-hondo': 'linear-gradient(180deg, #251D19 0%, #312721 55%, #2A211C 100%)',
            },
            boxShadow: {
                // Bisel: filo de luz arriba + filo oscuro abajo + sombra proyectada.
                'relieve': '0 1px 0 rgba(255,238,220,.07) inset, 0 -1px 0 rgba(0,0,0,.4) inset, 0 8px 20px -10px rgba(0,0,0,.75)',
                'relieve-alto': '0 1px 0 rgba(255,238,220,.11) inset, 0 -1px 0 rgba(0,0,0,.45) inset, 0 18px 38px -14px rgba(0,0,0,.85)',
                'relieve-hundido': '0 2px 6px -2px rgba(0,0,0,.6) inset, 0 -1px 0 rgba(255,238,220,.05) inset',
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
