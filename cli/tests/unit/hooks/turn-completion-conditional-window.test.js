// turn-completion-integrity: the "precondition is the human's" exemption is decided
// by the clause's grammar, not by how many characters it has.
//
// Measured 2026-09-29 on the published 6.14.0-beta.1 (Claude Code Stop hook, real
// stdin): "Once you choose A, I will apply it." passed, and "Once you choose
// option A or B, I will apply it." blocked. The exemption was capped at 20
// characters (en) / 1-6 characters (zh-TW) between "you" and the comma, chosen by
// feel; the cap, not the grammar, decided.
//
// Every sentence below goes through the real Claude adapter as a subprocess with
// the exact stdin shape Claude Code sends (`last_assistant_message`), so this
// tests the path that was measured, not just the locale pack.
//
// MUTATION (same idea as open-work-tracking's test): the hook directory is copied
// to a temp dir, the two windows are put BACK to their old values in the copy,
// and the same assertions must FAIL for that copy. A replacement that matches
// nothing fails the test, so a mutation that silently did nothing cannot pass for
// one that worked.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const HOOKS = join(REPO_ROOT, 'scripts', 'hooks');

// [message, blocks?, label]
const CASES = [
  // ── the five sentences measured on 6.14.0-beta.1 ─────────────────────────
  ['Once you choose, I will apply it.', false, 'en short (passed on beta.1)'],
  ['Once you choose A, I will apply it.', false, 'en short with an option (passed on beta.1)'],
  ['As soon as you choose A or B, I will apply it.', false, 'en as-soon-as (passed on beta.1)'],
  ['After you choose option A or B, I will apply it.', false, 'en after ... option A or B (BLOCKED on beta.1)'],
  ['Once you choose option A or B, I will apply it.', false, 'en once ... option A or B (BLOCKED on beta.1)'],
  // ── the long clauses real agents write ───────────────────────────────────
  ["Once you've reviewed the three options above and picked one, I will apply it.", false, 'en long clause with an apostrophe'],
  ['After you have read the summary and decided which of the two migrations to keep, I will start the rollout.', false, 'en long clause, 17 words'],
  ['你選好方案 A 或 B 後，我會接著套用。', false, 'zh-TW option A or B (blocked by the 1-6 cap)'],
  ['你看完上面三個選項並選好一個之後，我會接著套用。', false, 'zh-TW long clause'],
  ['你把上面三個選項都看過、挑好一個後，我會接著套用。', false, 'zh-TW long clause with 頓號'],
  ['等你把上面三個選項看完並選好後，我會接著套用。', false, 'zh-TW 等你...後'],
  // ── the widening must not let a real commitment through ──────────────────
  ['I will apply it once the build finishes.', true, 'en: the condition is a build, not the human'],
  ['I will apply the fix now, and you can review it later.', true, 'en: "you" only after the commitment'],
  ['After you merged it I will follow up, I will push the tag.', true, 'en: no comma before the first "I will"; a promise inside the clause'],
  ['After you merged it I will follow up.', true, 'en: known limit, no comma still fires'],
  ['建置跑完之後，我會接著套用修正。', true, 'zh-TW: the condition is a build'],
  ['我看了你的設定檔並判斷需要重構之後，我會接著改。', true, 'zh-TW: 你的 is a possessive inside MY sentence'],
  ['我把你貼的那一段整理完之後，我會接著改。', true, 'zh-TW: 你 is an object, 我 is the actor'],
  ['改好後我接著合併。', true, 'zh-TW: no 你 (unchanged from 6.13)'],
  ['你選定的那份我會接著處理。', true, 'zh-TW: no 後 after 你... (unchanged from 6.13)'],
];

/** Run the Claude adapter in `hooksDir` on one message; true when it blocked. */
function blocks(hooksDir, message) {
  const stateDir = mkdtempSync(join(tmpdir(), 'uds-tc-window-state-'));
  try {
    const r = spawnSync(process.execPath, [join(hooksDir, 'check-turn-completion.mjs')], {
      input: JSON.stringify({
        session_id: randomUUID(),
        last_assistant_message: message,
        transcript_path: null,
        stop_hook_active: false,
      }),
      env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: stateDir },
      encoding: 'utf8',
    });
    expect(r.status).toBe(0);
    const out = r.stdout.trim();
    return out ? JSON.parse(out).decision === 'block' : false;
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
  }
}

describe('turn-completion-integrity: the conditional exemption is decided by grammar, not length', () => {
  for (const [message, want, label] of CASES) {
    it(`${want ? 'blocks' : 'allows'}: ${label}`, () => {
      expect(blocks(HOOKS, message)).toBe(want);
    });
  }

  it('the adapter\'s own --self-test passes (the corpus in the locale packs)', () => {
    const r = spawnSync(process.execPath, [join(HOOKS, 'check-turn-completion.mjs'), '--self-test'], { encoding: 'utf8' });
    expect(r.status).toBe(0);
  });
});

describe('MUTATION: the old caps put back make these assertions fail', () => {
  let mutantRoot;
  beforeAll(() => { mutantRoot = mkdtempSync(join(tmpdir(), 'uds-tc-window-mut-')); });
  afterAll(() => { rmSync(mutantRoot, { recursive: true, force: true }); });

  /** Copy scripts/hooks, replace `from` (must occur exactly once) with `to` in one locale file. */
  function mutant(name, file, from, to) {
    const dir = join(mutantRoot, name);
    cpSync(HOOKS, dir, { recursive: true });
    const p = join(dir, 'turn-completion', 'locales', file);
    const src = readFileSync(p, 'utf8');
    expect(src.split(from).length - 1, `mutation anchor must match exactly once in ${file}`).toBe(1);
    writeFileSync(p, src.replace(from, () => to));
    return dir;
  }

  const EN_NEW = "'(?:(?!\\\\bI\\\\s+(?:will|am going to|am about to|going to|about to)\\\\b)[^,.;:!?\\\\n])*'";
  const EN_OLD = "'[^,.\\\\n]{0,20}'";
  const ZH_NEW = "'|(?:^|[，,。！？；;：:\\\\n]|等到|等|待|當|若|一旦|如果|只要)\\\\s*你(?!的)[^，,。！？；;：:\\\\n我你]+(之)?後[，,]\\\\s*我)'";
  const ZH_OLD = "'|你[^，,。\\\\n我你]{1,6}(之)?後[，,]\\\\s*我)'";

  it('en: restoring the 20-character cap blocks the long/option sentences again', () => {
    const dir = mutant('en-cap', 'en.mjs', EN_NEW, EN_OLD);
    expect(blocks(dir, 'Once you choose option A or B, I will apply it.')).toBe(true);
    expect(blocks(dir, 'After you choose option A or B, I will apply it.')).toBe(true);
    expect(blocks(dir, "Once you've reviewed the three options above and picked one, I will apply it.")).toBe(true);
    // ...which is exactly the defect: the real hook allows them.
    expect(blocks(HOOKS, 'Once you choose option A or B, I will apply it.')).toBe(false);
    // and the corpus notices: --self-test of the mutant is red.
    const r = spawnSync(process.execPath, [join(dir, 'check-turn-completion.mjs'), '--self-test'], { encoding: 'utf8' });
    expect(r.status).not.toBe(0);
  });

  it('zh-TW: restoring the 1-6 character cap blocks the long clauses again', () => {
    const dir = mutant('zh-cap', 'zh-TW.mjs', ZH_NEW, ZH_OLD);
    expect(blocks(dir, '你看完上面三個選項並選好一個之後，我會接著套用。')).toBe(true);
    expect(blocks(dir, '你選好方案 A 或 B 後，我會接著套用。')).toBe(true);
    expect(blocks(HOOKS, '你看完上面三個選項並選好一個之後，我會接著套用。')).toBe(false);
    const r = spawnSync(process.execPath, [join(dir, 'check-turn-completion.mjs'), '--self-test'], { encoding: 'utf8' });
    expect(r.status).not.toBe(0);
  });

  it('en: dropping the "no promise of my own inside the clause" guard lets a real commitment through', () => {
    const dir = mutant('en-noguard', 'en.mjs', EN_NEW, "'[^,.;:!?\\\\n]*'");
    expect(blocks(dir, 'After you merged it I will follow up, I will push the tag.')).toBe(false);
    expect(blocks(HOOKS, 'After you merged it I will follow up, I will push the tag.')).toBe(true);
  });

  it('zh-TW: dropping the "你 must open the clause / not 你的" guard lets a real commitment through', () => {
    const dir = mutant('zh-noguard', 'zh-TW.mjs', ZH_NEW, "'|你[^，,。！？；;：:\\\\n我你]+(之)?後[，,]\\\\s*我)'");
    expect(blocks(dir, '我看了你的設定檔並判斷需要重構之後，我會接著改。')).toBe(false);
    expect(blocks(HOOKS, '我看了你的設定檔並判斷需要重構之後，我會接著改。')).toBe(true);
  });
});
