// XSPEC adopter-report Q1 (part A) guard: no src file may assign a literal
// schema-version string to `manifest.version`. Five sites did exactly that
// (update.js x3, check.js, config.js), each with a version literal that
// predated a later schema bump — so running the operation on an
// already-current manifest silently downgraded it. Every write must go
// through `bumpManifestVersion` (core/manifest.js), which never regresses
// the version.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '../../../src');

function listJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listJsFiles(full));
    else if (extname(full) === '.js') out.push(full);
  }
  return out;
}

const FORBIDDEN_PATTERN = /manifest\.version\s*=\s*['"][^'"]+['"]/;

describe('no hardcoded manifest.version literal (Q1)', () => {
  it('sanity check: the forbidden pattern is detectable', () => {
    expect(FORBIDDEN_PATTERN.test("manifest.version = '3.3.0';")).toBe(true);
    expect(FORBIDDEN_PATTERN.test('bumpManifestVersion(manifest);')).toBe(false);
  });

  it('no src file assigns a literal version string to manifest.version', () => {
    const files = listJsFiles(SRC_DIR);
    expect(files.length).toBeGreaterThan(50);

    const offenders = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      content.split('\n').forEach((line, i) => {
        if (FORBIDDEN_PATTERN.test(line)) {
          offenders.push(`${file}:${i + 1}: ${line.trim()}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
