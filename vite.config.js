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
                    'firebase-vendor': [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/storage'
                    ],
                    'mp-vendor': ['@mercadopago/sdk-react'],
                    'charts-vendor': ['recharts'],
                    'office-vendor': ['jspdf', 'jspdf-autotable', 'xlsx']
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
