import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.{js,jsx}'],
        exclude: ['node_modules/**', 'dist/**', 'e2e/**', 'playwright-report/**']
    }
});
