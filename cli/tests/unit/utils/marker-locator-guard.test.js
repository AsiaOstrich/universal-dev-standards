// [XSPEC adopter-report Q5] Guard: no call site may go back to locating a UDS
// marker with raw indexOf/includes. That was the actual defect (Q5) — a
// prose or fenced-code mention of the marker text was mistaken for the real
// boundary and everything between the mention and the real END marker got
// deleted. `locateMarkerBlock`/`tryLocateMarkerBlock` (marker-locator.js) is
// the only place allowed to look for marker text directly; every other file
// must go through it.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SRC_DIR = join(__dirname, '../../../src');

// The one file allowed to contain the raw indexOf/includes marker search —
// it IS the shared implementation.
const ALLOWED_FILE = 'marker-locator.js';

function listJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listJsFiles(full));
    } else if (extname(full) === '.js') {
      out.push(full);
    }
  }
  return out;
}

// Matches `.indexOf(` / `.includes(` where the argument references a marker
// variable/constant by any of the names this codebase uses for them.
const FORBIDDEN_PATTERN = /\.(indexOf|includes)\(\s*(markers\.(start|end)|UDS_BEGIN|UDS_END|UDS_MARKERS)/;

describe('marker location guard (Q5)', () => {
  it('sanity check: the forbidden pattern itself is detectable', () => {
    // Proves the regex isn't silently broken before trusting a "0 hits" result.
    expect(FORBIDDEN_PATTERN.test("content.indexOf(markers.start)")).toBe(true);
    expect(FORBIDDEN_PATTERN.test("content.includes(UDS_BEGIN)")).toBe(true);
    expect(FORBIDDEN_PATTERN.test("locateMarkerBlock(content, markers)")).toBe(false);
  });

  it('no src file other than marker-locator.js locates markers via indexOf/includes', () => {
    const files = listJsFiles(SRC_DIR).filter((f) => !f.endsWith(ALLOWED_FILE));
    expect(files.length).toBeGreaterThan(50); // sanity: the walk actually found the tree

    const offenders = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (FORBIDDEN_PATTERN.test(line)) {
          offenders.push(`${file}:${i + 1}: ${line.trim()}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
