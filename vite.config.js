import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        target: 'es2019',
        sourcemap: false,
        cssCodeSplit: true,
        chunkSizeWarningLimit: 900,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    // firebase/messaging NO va acá: se importa dinámicamente en
                    // pushNotifications.js para que quede en su propio chunk lazy
                    // y no pese en la carga inicial de todas las páginas.
                    'firebase-vendor': [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/storage'
                    ],
                    'mp-vendor': ['@mercadopago/sdk-react'],
                    'charts-vendor': ['recharts']
                    // jspdf/xlsx NO van acá: forzarlos a un chunk fijo los metía
                    // en el modulepreload del index.html y la tienda se bajaba
                    // 900 KB de librerías que sólo usa el panel admin. Se
                    // importan con await import(), así que Vite ya los separa.
                }
            }
        }
    },
    server: {
        port: 5173,
        open: false
    },
    preview: {
        port: 4173
    }
});
