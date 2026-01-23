import { defineConfig } from 'vitest/config';

// Use dot reporter in CI/non-TTY environments to avoid hanging
const isCI = process.env.CI || !process.stdout.isTTY;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // Run tests in sequence to avoid race conditions with temp directories
    fileParallelism: false,
    // Use dot reporter in non-TTY environments (CI, background processes)
    // to prevent hanging due to terminal capability detection
    reporters: isCI ? ['dot'] : ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/index.js'],
      thresholds: {
        // Start with achievable thresholds, increase as coverage improves
        lines: 25,
        branches: 15,
        functions: 25,
        statements: 25
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup.js']
  }
});
