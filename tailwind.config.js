/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cielo-dark': '#020617',
                'cielo-gold': '#D4AF37',
                // Inferring remaining colors or placeholders
                'gold-metallic': 'linear-gradient(45deg, #FFD700, #FDB931)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                luxury: ['Cinzel', 'serif'],
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
                spinY: {
                    '0%': { transform: 'rotateY(0deg)' },
                    '100%': { transform: 'rotateY(360deg)' },
                },
                sheen: {
                    '0%, 100%': { transform: 'translateX(-160%) skewX(-12deg)', opacity: '0' },
                    '45%': { opacity: '0.55' },
                    '55%': { opacity: '0.55' },
                    '100%': { transform: 'translateX(160%) skewX(-12deg)', opacity: '0' },
                },
                groundShadow: {
                    '0%, 100%': { transform: 'translateX(-50%) scaleX(1)', opacity: '0.45' },
                    '25%': { transform: 'translateX(-50%) scaleX(0.55)', opacity: '0.25' },
                    '50%': { transform: 'translateX(-50%) scaleX(1)', opacity: '0.45' },
                    '75%': { transform: 'translateX(-50%) scaleX(0.55)', opacity: '0.25' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.8s ease-out forwards',
                slideUp: 'slideUp 1s ease-out forwards',
                float: 'float 10s ease-in-out infinite',
                marquee: 'marquee 25s linear infinite',
                marquee2: 'marquee2 25s linear infinite',
                'spin-y': 'spinY 9s linear infinite',
                'sheen': 'sheen 4.5s ease-in-out infinite',
                'ground-shadow': 'groundShadow 9s linear infinite',
            },
        },
    },
    plugins: [],
}
