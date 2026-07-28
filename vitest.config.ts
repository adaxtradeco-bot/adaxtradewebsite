import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default;

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/**',
          'src/tests/**',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData/**',
          'dist/**',
          '.next/**',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
