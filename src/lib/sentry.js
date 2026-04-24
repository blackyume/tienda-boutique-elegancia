// Sentry init — solo si VITE_SENTRY_DSN está definido en env.
// Si falta, no hace nada (queda como no-op). DSN se setea en Vercel / .env.
import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
    if (!DSN) return false;
    if (!import.meta.env.PROD && !import.meta.env.VITE_SENTRY_DEV) return false;

    try {
        Sentry.init({
            dsn: DSN,
            environment: import.meta.env.MODE,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                    maskAllText: false,
                    blockAllMedia: false
                })
            ],
            tracesSampleRate: 0.2,
            replaysSessionSampleRate: 0.05,
            replaysOnErrorSampleRate: 1.0,
            ignoreErrors: [
                'ResizeObserver loop limit exceeded',
                'Non-Error promise rejection captured',
                /^NetworkError/,
                /Failed to fetch/
            ]
        });
        return true;
    } catch (err) {
        console.warn('[sentry] init failed:', err?.message);
        return false;
    }
};

export const captureError = (err, context) => {
    try { Sentry.captureException(err, { extra: context }); } catch { }
};

export { Sentry };
