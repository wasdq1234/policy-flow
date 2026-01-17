import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // @ts-ignore - Plugin type compatibility issue between vite and vitest
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'src/__tests__/**',
        'src/mocks/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@policy-flow/contracts': path.resolve(__dirname, '../contracts'),
    },
  },
});
