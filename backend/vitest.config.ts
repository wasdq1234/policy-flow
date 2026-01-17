import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/types.ts',
        'node_modules/',
        'dist/',
        'drizzle/',
        'vitest.config.ts',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    setupFiles: ['__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@policy-flow/contracts': path.resolve(__dirname, '../contracts'),
    },
  },
});
