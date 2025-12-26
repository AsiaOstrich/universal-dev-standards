import { vi, afterEach } from 'vitest';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test fixtures directory
export const TEST_FIXTURES_DIR = join(__dirname, 'fixtures');
export const TEST_TEMP_DIR = join(__dirname, 'temp');

// Ensure temp directory exists at startup
if (!existsSync(TEST_TEMP_DIR)) {
  mkdirSync(TEST_TEMP_DIR, { recursive: true });
}

// Clean up after all tests
afterEach(() => {
  vi.restoreAllMocks();
});

// Helper to restore console for specific tests
export function restoreConsole() {
  vi.mocked(console.log).mockRestore();
}
