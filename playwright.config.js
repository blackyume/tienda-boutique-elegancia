import { defineConfig, devices } from '@playwright/test';

// Por default apunta a producción. Para local: BASE_URL=http://localhost:4173 npm run e2e
const BASE_URL = process.env.BASE_URL || 'https://la-boutique-de-la-elegancia.web.app';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15_000,
        navigationTimeout: 30_000
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
    ],
    // Si BASE_URL es localhost, levantar preview server
    webServer: BASE_URL.includes('localhost')
        ? {
            command: 'npm run preview',
            port: 4173,
            reuseExistingServer: !process.env.CI,
            timeout: 60_000
        }
        : undefined
});
