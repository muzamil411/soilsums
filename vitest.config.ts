import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the "@/*" path mapping in tsconfig.json.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    include: ['lib/**/*.test.ts', 'data/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
    globals: false,
    // Every test here exercises a pure function, so workers can be reused.
    isolate: false,
  },
});
