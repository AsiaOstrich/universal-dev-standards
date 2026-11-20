/**
 * Comparison keys built from relative paths use '/' on every platform.
 *
 * Why: 6.16.0-beta.1 went red on windows-latest. `check-module-reachability` built its module keys
 * with path.relative(), which returns `bin\uds.js` on Windows, then compared them with the entry list
 * and baseline written as `bin/uds.js`. The entry points themselves were reported as "new unreachable
 * modules". The real entry test is `baseline-expiry-rule.test.js` run on windows-latest; the arms here
 * prove the same thing on macOS/Linux, where path.relative() can never return a backslash:
 *
 *   1. the helper turns a path.win32 relative path into '/' (driven through `pathImpl`).
 *   2. each gate script still builds its keys through the helper (no raw `relative(` call left).
 *
 * Wires that make these red when cut:
 *   cli/scripts/lib/posix-path.mjs               export const toPosix = (p) => p.replace(/\\/g, '/');
 *   cli/scripts/check-module-reachability.mjs    out.push(relativePosix(CLI_ROOT, full));
 */
import { it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { win32 } from 'node:path';
import { toPosix, relativePosix } from '../../../scripts/lib/posix-path.mjs';

const CLI = resolve(import.meta.dirname, '../../..');
const REPO = resolve(CLI, '..');

it('posix-path: a Windows relative path comes back with forward slashes, equal to the entry-list spelling', () => {
  const key = relativePosix('C:\\work\\repo\\cli', 'C:\\work\\repo\\cli\\bin\\uds.js', win32);
  expect(key).toBe('bin/uds.js');
  expect(relativePosix('C:\\work\\repo\\cli', 'C:\\work\\repo\\cli\\src\\utils\\telemetry-uploader.js', win32)).toBe(
    'src/utils/telemetry-uploader.js',
  );
  // a path leaving the base keeps its '..' segments, as the script-seed code relies on
  expect(relativePosix('C:\\work\\repo\\cli', 'C:\\work\\repo\\scripts\\x.mjs', win32)).toBe('../scripts/x.mjs');
});

it('posix-path: toPosix leaves an already-posix key unchanged and rewrites every backslash', () => {
  expect(toPosix('src/a/b.js')).toBe('src/a/b.js');
  expect(toPosix('src\\a\\b.js')).toBe('src/a/b.js');
});

// Source-level guard. It cannot replace the windows-latest run, but it turns red on macOS/Linux the
// moment one of these gates goes back to a raw path.relative().
const GATES = [
  'cli/scripts/check-module-reachability.mjs',
  'cli/scripts/check-command-existence.mjs',
  'scripts/check-shipped-stamp-consistency.ts',
];

for (const gate of GATES) {
  it(`posix-path: ${gate} builds relative-path keys through relativePosix, never a raw relative()`, () => {
    const src = readFileSync(resolve(REPO, gate), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(src).toMatch(/\brelativePosix\(/);
    expect(src).not.toMatch(/(?<![\w.])relative\(/);
  });
}
