import { defineConfig } from 'vitest/config';

// Use dot reporter in CI/non-TTY environments to avoid hanging
const isCI = process.env.CI || !process.stdout.isTTY;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // E2E tests are fully isolated (independent temp dirs, no shared state)
    fileParallelism: true,
    // Use dot reporter in non-TTY environments (CI, background processes)
    // to prevent hanging due to terminal capability detection
    reporters: isCI ? ['dot'] : ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/index.js'],
      // Pinned at measured-minus-3pt so the gate can actually fire.
      //
      // Measured 2026-07-29 (`npx vitest run --coverage`, the same set
      // test:coverage runs): statements 63.00, branches 55.04, functions 73.04,
      // lines 63.94.
      //
      // The previous values were 25/15/25/25, beside the comment "Start with
      // achievable thresholds, increase as coverage improves". They never were.
      // A gate 38 points below actual cannot fire — coverage could halve and
      // still pass — and that is worse than having no gate, because the repo
      // looks guarded. Found by the XSPEC-073 deep test audit.
      //
      // Raise these when coverage rises. A margin of 3pt absorbs the ordinary
      // drift of adding a file before its tests land; it is not room to regress
      // into.
      thresholds: {
        lines: 60,
        branches: 52,
        functions: 70,
        statements: 60
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup.js']
  }
});
