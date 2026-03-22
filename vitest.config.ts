import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
    include: [
      'src/actions/**/*.test.ts',
      'src/lib/**/*.test.ts',
      'src/app/api/**/*.test.ts',
    ],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      include: ['src/actions/**', 'src/lib/**', 'src/app/api/**'],
      exclude: ['**/*.test.ts', 'src/lib/mock-data.ts'],
    },
  },
});
