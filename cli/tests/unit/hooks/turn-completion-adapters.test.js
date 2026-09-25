// Turn-completion-integrity: per-harness adapter IO contract tests.
//
// Each adapter's only job is translating its tool's stdin shape into a call to
// the shared engine and writing its tool's output shape back out — so these
// tests exercise the ADAPTERS as real subprocesses (the way each harness would
// actually invoke them), not the engine's detection logic, which is already
// covered by the locale packs' own corpora (run via --self-test below).
//
// State isolation: the engine keeps a cooldown + rolling-window state file
// under UDS_TURN_COMPLETION_STATE_DIR (or ~/.uds/turn-completion when unset).
// Every test here points that env var at its own tmpdir AND uses a unique
// session_id, so no test can pass (or flakily fail) because an earlier test
// in the same run already tripped the cooldown for that session.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const CODEX_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion-codex.mjs');
const GEMINI_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion-gemini.mjs');
const CLAUDE_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion.mjs');

let stateDir;

beforeEach(() => {
  stateDir = mkdtempSync(join(tmpdir(), 'uds-tc-state-'));
});

afterEach(() => {
  rmSync(stateDir, { recursive: true, force: true });
});

/** Run an adapter with the given stdin, isolated state, and a fresh session id. */
function runAdapter(adapterPath, stdinObj) {
  const stdout = execFileSync(process.execPath, [adapterPath], {
    input: JSON.stringify(stdinObj),
    env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: stateDir },
    encoding: 'utf8',
  });
  return JSON.parse(stdout); // both adapters guarantee valid JSON on every path
}

describe('turn-completion-integrity: Codex adapter', () => {
  it('(a) an unkept commitment blocks in Codex\'s shape', () => {
    const out = runAdapter(CODEX_ADAPTER, {
      session_id: randomUUID(),
      last_assistant_message: 'The remaining two items I will do next.',
      transcript_path: null,
      stop_hook_active: false,
    });
    expect(out.decision).toBe('block');
    expect(typeof out.reason).toBe('string');
    expect(out.reason.length).toBeGreaterThan(0);
  });

  it('(b) a conditional commitment ("once you pick, I will") is allowed', () => {
    const out = runAdapter(CODEX_ADAPTER, {
      session_id: randomUUID(),
      last_assistant_message: "Once you pick a model, I'll wire it into the config.",
      transcript_path: null,
      stop_hook_active: false,
    });
    expect(out.decision).toBeUndefined();
  });

  it('(c) malformed stdin fails open (valid JSON, no block)', () => {
    const stdout = execFileSync(process.execPath, [CODEX_ADAPTER], {
      input: 'not json at all {{{',
      env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: stateDir },
      encoding: 'utf8',
    });
    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(JSON.parse(stdout).decision).toBeUndefined();
  });

  it('an itemized blocker list (the R2 ending) is allowed, not blocked', () => {
    const out = runAdapter(CODEX_ADAPTER, {
      session_id: randomUUID(),
      last_assistant_message: [
        'Nothing left to decide. Each remaining item and who it waits on:',
        '  1. Deploy — waits on you running the setup script.',
        '  2. Credential renewal — waits on you, I cannot type it.',
      ].join('\n'),
      transcript_path: null,
      stop_hook_active: false,
    });
    expect(out.decision).toBeUndefined();
  });

  it('stop_hook_active suppresses re-firing (loop guard)', () => {
    const out = runAdapter(CODEX_ADAPTER, {
      session_id: randomUUID(),
      last_assistant_message: 'The remaining two items I will do next.',
      transcript_path: null,
      stop_hook_active: true,
    });
    expect(out.decision).toBeUndefined();
  });
});

describe('turn-completion-integrity: Gemini CLI adapter', () => {
  it('(a) an unkept commitment blocks in Gemini\'s shape ("deny", not "block")', () => {
    const out = runAdapter(GEMINI_ADAPTER, {
      session_id: randomUUID(),
      prompt: 'go ahead',
      prompt_response: 'I will update the remaining two files.',
      stop_hook_active: false,
    });
    expect(out.decision).toBe('deny');
    expect(typeof out.reason).toBe('string');
    expect(out.reason.length).toBeGreaterThan(0);
  });

  it('(b) a conditional commitment is allowed', () => {
    const out = runAdapter(GEMINI_ADAPTER, {
      session_id: randomUUID(),
      prompt: 'pick a model for me',
      prompt_response: "Once you pick a model, I'll wire it into the config.",
      stop_hook_active: false,
    });
    expect(out.decision).toBeUndefined();
  });

  it('(b) R9: prompt asking to stop exempts the turn even with a real commitment', () => {
    const out = runAdapter(GEMINI_ADAPTER, {
      session_id: randomUUID(),
      prompt: "Let's pause here, I'm heading home.",
      prompt_response: 'I will update the remaining two files.',
      stop_hook_active: false,
    });
    expect(out.decision).toBeUndefined();
  });

  it('(c) malformed stdin fails open (valid JSON, no block)', () => {
    const stdout = execFileSync(process.execPath, [GEMINI_ADAPTER], {
      input: 'not json at all {{{',
      env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: stateDir },
      encoding: 'utf8',
    });
    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(JSON.parse(stdout).decision).toBeUndefined();
  });
});

describe('turn-completion-integrity: shared corpus (all adapters read the same packs)', () => {
  it('the packs\' self-test passes for every adapter entrypoint', () => {
    for (const adapter of [CLAUDE_ADAPTER, CODEX_ADAPTER, GEMINI_ADAPTER]) {
      expect(() => execFileSync(process.execPath, [adapter, '--self-test'], { encoding: 'utf8' }))
        .not.toThrow();
    }
  });

  it('every adapter declares its shipped languages (R8)', () => {
    for (const adapter of [CLAUDE_ADAPTER, CODEX_ADAPTER, GEMINI_ADAPTER]) {
      const out = execFileSync(process.execPath, [adapter, '--languages'], { encoding: 'utf8' });
      expect(out).toContain('en (English)');
      expect(out).toContain('zh-TW');
    }
  });
});
