#!/usr/bin/env node
/**
 * Writes (or checks) docs/reference/INTEGRATION-VERIFICATION-MATRIX.md from integrations/REGISTRY.json.
 * dev-platform XSPEC-357 R8 (AC-8.6): the registry is the data, this page and the README column are projections.
 *
 *   node scripts/generate-integration-matrix.mjs           write the page
 *   node scripts/generate-integration-matrix.mjs --check   exit 1 when the page differs from what the registry says
 *
 * `npm run check:liveness` makes the same comparison, so a registry edit that forgets the page goes red there.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMatrixPage } from './lib/integration-verification-matrix.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const MATRIX_PAGE = 'docs/reference/INTEGRATION-VERIFICATION-MATRIX.md';

const registry = JSON.parse(readFileSync(join(ROOT, 'integrations/REGISTRY.json'), 'utf8'));
const expected = renderMatrixPage(registry);

if (process.argv.includes('--check')) {
  let actual = '';
  try {
    actual = readFileSync(join(ROOT, MATRIX_PAGE), 'utf8');
  } catch {
    // an absent page is a mismatch, reported below
  }
  if (actual.replace(/\r\n/g, '\n') !== expected) {
    process.stderr.write(`${MATRIX_PAGE} is out of date with integrations/REGISTRY.json. Run: node scripts/generate-integration-matrix.mjs\n`);
    process.exit(1);
  }
  process.stdout.write(`${MATRIX_PAGE} matches the registry\n`);
} else {
  writeFileSync(join(ROOT, MATRIX_PAGE), expected);
  process.stdout.write(`wrote ${MATRIX_PAGE}\n`);
}
