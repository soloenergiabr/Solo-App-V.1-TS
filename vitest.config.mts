import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        setupFiles: ['./vitest.setup.ts'],
        // jsdom env setup is slow under heavy parallel load on some machines;
        // the default 5s testTimeout flakes async-rendering tests (waitFor for
        // fetched content, Radix interactions). Raise it — assertions unchanged.
        testTimeout: 20000,
        hookTimeout: 20000,
        exclude: [
            '**/node_modules/**',
            '**/.claude/**',
            '**/.next/**',
            '**/.git/**',
            '**/dist/**',
        ],
    },
})
