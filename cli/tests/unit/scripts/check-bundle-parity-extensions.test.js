// XSPEC-452 R1 — the bundle-parity check covers `extensions/`, by name AND by bytes.
//
// Until 2026-10-06 the check compared only `.ai.yaml` standards, so a package that held 0 of the 7
// extension files was "OK — bundle parity holds". Each case below builds a tiny fake repo (the script
// derives every path from its own location, so a copy of it is run inside the fake) and reads the
// script's own verdict and exit code.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';

const SCRIPT = resolve(import.meta.dirname, '../../../scripts/check-bundle-parity.mjs');
let root;

const put = (rel, text) => {
  const full = join(root, rel);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, text);
};

function runParity() {
  const r = spawnSync('node', [join(root, 'cli', 'scripts', 'check-bundle-parity.mjs')], { encoding: 'utf-8' });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'uds-test-parity-ext-'));
  mkdirSync(join(root, 'cli', 'scripts'), { recursive: true });
  cpSync(SCRIPT, join(root, 'cli', 'scripts', 'check-bundle-parity.mjs'));
  // One .ai.yaml standard present on every side so the pre-existing comparison is satisfied.
  put('.standards/a.ai.yaml', 'id: a\n');
  put('ai/standards/a.ai.yaml', 'id: a\n');
  put('cli/bundled/ai/standards/a.ai.yaml', 'id: a\n');
  // Two extension files, packaged identically.
  for (const rel of ['languages/csharp-style.md', 'locales/zh-tw.md']) {
    put(`extensions/${rel}`, `# ${rel}\n`);
    put(`cli/bundled/extensions/${rel}`, `# ${rel}\n`);
  }
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('check-bundle-parity: extensions/', () => {
  it('passes when every extension file is bundled with identical bytes', () => {
    const r = runParity();
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(/extensions: source=2 bundled=2/);
  });

  it('fails and names the file when an extension file is missing from the bundle', () => {
    rmSync(join(root, 'cli/bundled/extensions/locales/zh-tw.md'));
    const r = runParity();
    expect(r.code, r.out).toBe(1);
    expect(r.out).toContain('extensions/locales/zh-tw.md');
    expect(r.out).toMatch(/NOT in the bundle/);
  });

  it('fails when the whole extensions/ directory is absent from the bundle (what the 6.13.1 package looked like)', () => {
    rmSync(join(root, 'cli/bundled/extensions'), { recursive: true });
    const r = runParity();
    expect(r.code, r.out).toBe(1);
    expect(r.out).toContain('extensions/languages/csharp-style.md');
    expect(r.out).toContain('extensions/locales/zh-tw.md');
  });

  it('fails when a bundled extension file differs by a single byte', () => {
    put('cli/bundled/extensions/languages/csharp-style.md', '# languages/csharp-style.md\n ');
    const r = runParity();
    expect(r.code, r.out).toBe(1);
    expect(r.out).toContain('~ extensions/languages/csharp-style.md');
  });

  it('fails when the bundle carries an extension file the repo does not have', () => {
    put('cli/bundled/extensions/locales/xx.md', 'stray\n');
    const r = runParity();
    expect(r.code, r.out).toBe(1);
    expect(r.out).toContain('extensions/locales/xx.md');
    expect(r.out).toMatch(/NOT in extensions\//);
  });
});
