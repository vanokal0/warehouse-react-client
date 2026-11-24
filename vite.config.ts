/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    env: { VITE_BACKEND_API_URL: 'http://test.local/api' },
    server: { deps: { inline: ['@mui/x-data-grid'] } },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/store/**',
        'src/utils/**',
        'src/components/auth/**',
        'src/components/buttons/**',
        'src/components/lists/**',
        'src/components/pop-ups/ProductPopover.tsx',
      ],
      exclude: ['**/*.test.{ts,tsx}', '**/*.css'],
    },
  },
})
