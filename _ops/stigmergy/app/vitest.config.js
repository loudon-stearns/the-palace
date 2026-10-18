import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['tests/e2e/**'],
    setupFiles: ['tests/setup/loopback-only.js', 'tests/setup/git-env.js'],
  },
});
