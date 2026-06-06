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
                'cielo-dark': '#0A0A0A',
                'cielo-gold': '#D4AF37',
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
                kenburns: {
                    '0%': { transform: 'scale(1.08) translate3d(0,0,0)' },
                    '100%': { transform: 'scale(1.18) translate3d(-1.5%, -1.5%, 0)' },
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
