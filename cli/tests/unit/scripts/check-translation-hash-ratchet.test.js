// scripts/check-translation-hash-ratchet.sh: the baseline's expiry date only applies while the baseline still lists debt.
// The debt reached 0 on 2026-11-23; an empty baseline that turned CI red on its date would fail main for nothing.
// The script is run for real (bash), with the date and the baseline file overridden, and its exit code is read back.

import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const SCRIPT = resolve(__dirname, '../../../../scripts/check-translation-hash-ratchet.sh');
const dir = mkdtempSync(join(tmpdir(), 'hash-ratchet-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function run(today, baselineLines) {
  const baseline = join(dir, `baseline-${today}-${baselineLines.length}.txt`);
  writeFileSync(baseline, ['# test baseline', ...baselineLines, ''].join('\n'));
  const r = spawnSync('bash', [SCRIPT], {
    encoding: 'utf-8',
    env: { ...process.env, HASH_RATCHET_TODAY: today, HASH_RATCHET_BASELINE: baseline },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

describe('translation hash ratchet: baseline expiry', () => {
  it('an empty baseline past its expiry date still passes, because there is no debt left to re-judge', () => {
    const r = run('2026-11-26', []);
    expect(r.code, r.out).toBe(0);
    expect(r.out).not.toContain('到期');
  });

  it('a baseline that still lists debt fails once its expiry date has passed', () => {
    const r = run('2026-11-26', ['locales/zh-TW/some-debt.md']);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toContain('已於 2026-11-25 到期');
  });

  it('a baseline that still lists debt passes before its expiry date', () => {
    const r = run('2026-11-24', ['locales/zh-TW/some-debt.md']);
    expect(r.code, r.out).toBe(0);
  });
});
