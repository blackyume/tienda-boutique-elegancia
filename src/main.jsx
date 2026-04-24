import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import { initSentry } from './lib/sentry'

initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      const notifyUpdate = (worker) => {
        window.dispatchEvent(new CustomEvent('lbe:sw-update', {
          detail: {
            activate: () => worker.postMessage('SKIP_WAITING'),
          },
        }));
      };

      // SW ya esperando al cargar la pagina (usuario volvio y hay update)
      if (reg.waiting && navigator.serviceWorker.controller) notifyUpdate(reg.waiting);

      // Update detectado durante la sesion actual
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            notifyUpdate(installing);
          }
        });
      });

      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });

      // Chequeo periodico de actualizacion (por si el usuario deja la tab abierta mucho tiempo)
      setInterval(() => { reg.update().catch(() => { }); }, 60 * 60 * 1000);
    } catch (err) {
      console.warn('[sw] registration failed:', err);
    }
  });
}