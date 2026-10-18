import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup/git-env.js'],
    testTimeout: 30000,
  },
});
