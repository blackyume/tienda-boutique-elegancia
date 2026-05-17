/* ESLint 8 (eslintrc). Objetivo: atrapar bugs reales (vars sin usar,
   undef, hooks mal usados) sin pedantería de estilo que rompa el
   código legacy. CI corre `eslint . --ext js,jsx --max-warnings 0`. */
module.exports = {
    root: true,
    env: { browser: true, es2021: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    settings: { react: { version: 'detect' } },
    plugins: ['react-refresh'],
    ignorePatterns: [
        'dist', 'build', 'coverage', 'node_modules',
        'playwright-report', 'test-results', 'blob-report',
        'public/**', '*.config.js', '*.config.cjs',
    ],
    rules: {
        // Bugs reales
        // 'React' se ignora: el proyecto usa el JSX runtime nuevo, el
        // import sobra en todo el repo (artefacto de migración, inocuo).
        // 'warn': hay dead code legacy; informa sin bloquear el CI.
        // Igual sirve (atrapó bugs reales). Los errores sí bloquean.
        'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^(_|React$)' }],
        'no-undef': 'error',
        'react-hooks/rules-of-hooks': 'error',
        // Ruido de estilo desactivado (no aporta y rompe legacy)
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
        'react/display-name': 'off',
        // Advisory, no es bug; el código ya usa eslint-disable puntuales.
        'react-hooks/exhaustive-deps': 'off',
        'react-refresh/only-export-components': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
    },
    overrides: [
        {
            // Serverless Vercel + Firebase Functions = CommonJS/Node
            files: ['api/**/*.js', 'functions/**/*.js'],
            env: { node: true, browser: false },
            parserOptions: { sourceType: 'script' },
        },
        {
            // Scripts build-time = ESM/Node (usan import)
            files: ['scripts/**/*.js'],
            env: { node: true, browser: false },
            parserOptions: { sourceType: 'module' },
        },
        {
            // Tests (Vitest) + e2e (Playwright)
            files: ['tests/**/*.{js,jsx}', 'e2e/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
            env: { node: true },
        },
        {
            // Service workers
            files: ['public/**/*.js'],
            env: { serviceworker: true, browser: true },
        },
    ],
};
