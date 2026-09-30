// parsePackFiles reads `npm pack --dry-run --json`. The publish job of
// 6.14.0-beta.2 failed because the reader assumed npm's stdout shape and
// cleanliness; these fixtures are the shapes actually observed:
//   npm 10.9.8 — an array, with a husky line printed before it (from `prepare`)
//   npm 12.1.0 — an object keyed by package name (the array moved one level down)
import { describe, it, expect } from 'vitest';
import { parsePackFiles } from '../../../../scripts/npm-pack-files.mjs';

const FILES = [{ path: 'src/a.js', size: 1, mode: 420 }, { path: 'package.json', size: 2, mode: 420 }];
const entry = { id: 'x@1.0.0', name: 'x', files: FILES, entryCount: 2, bundled: [] };
const EXPECTED = ['src/a.js', 'package.json'];

describe('parsePackFiles', () => {
  it('reads the npm <= 11 shape (array), with lifecycle noise before it', () => {
    const out = `Husky hooks configured successfully.\n${JSON.stringify([entry], null, 2)}\n`;
    expect(parsePackFiles(out)).toEqual(EXPECTED);
  });

  it('reads the npm 12 shape (object keyed by package name)', () => {
    const out = `${JSON.stringify({ x: entry }, null, 2)}\n`;
    expect(parsePackFiles(out)).toEqual(EXPECTED);
  });

  it('reads the npm 12 shape with noise before AND after', () => {
    const out = `Husky setup skipped: CI environment detected.\n${JSON.stringify({ x: entry }, null, 2)}\nnpm notice something\n`;
    expect(parsePackFiles(out)).toEqual(EXPECTED);
  });

  it('is not fooled by a bracket line inside the noise', () => {
    const out = `[\nnot json\n]\n${JSON.stringify([entry], null, 2)}\n`;
    expect(parsePackFiles(out)).toEqual(EXPECTED);
  });

  it('throws instead of returning an empty list when there is no pack JSON', () => {
    expect(() => parsePackFiles('nothing here\n')).toThrow(/no npm pack JSON/);
    expect(() => parsePackFiles('')).toThrow(/no npm pack JSON/);
    // valid JSON, wrong document: must not be read as "a package with no files"
    expect(() => parsePackFiles('{\n  "a": 1\n}\n')).toThrow(/no npm pack JSON/);
  });
});
