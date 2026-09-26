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
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
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

  // 2026-09-26: bestEffortLastUserMessage() only ever tried
  // { message: { role, content } } or a flat { role, content } — neither
  // shape a real codex-cli 0.156.1 rollout.jsonl uses, so R9 (a user-directed
  // stop exempts the turn) never fired against a real Codex install. The real
  // shape, confirmed against an actual ~/.codex/sessions/**/*.jsonl file, is
  // { type: "response_item", payload: { type: "message", role, content:
  // [{ type: "input_text", text }] } }. These three tests write a transcript
  // in that exact real shape, mixed in with other record types a rollout
  // actually contains (event_msg, token_usage_record, session_meta,
  // world_state, a non-message response_item), to prove the fix reads past
  // all of them to find the real last user message.
  describe('R9 against a real codex-cli rollout.jsonl shape', () => {
    // Stop phrase reused from the Gemini adapter's own R9 test below and from
    // the en pack's corpus (locales/en.mjs) rather than a fresh one like
    // "pause, I'm heading out": that phrasing does NOT fire isStopRequest(),
    // because normalize() rewrites "I'm" to "I am" before STOP_REQUEST (which
    // still expects the contracted "I'm") is tested against it — a pre-existing
    // mismatch between normalize() and STOP_REQUEST, out of scope for this fix.
    // "Let's pause here, ..." matches on the separate `let's (stop|pause|...)`
    // branch, which normalize() does not touch, so it is unaffected by that gap.

    /** Write a rollout.jsonl with the given ordered list of user message texts, interleaved with noise records. */
    function writeRollout(path, userTexts) {
      const lines = [
        { type: 'session_meta', payload: { id: 'sess-1', timestamp: '2026-09-26T00:00:00Z' } },
        { type: 'response_item', payload: { type: 'reasoning', content: [] } },
        { type: 'event_msg', payload: { type: 'agent_message', message: 'working on it' } },
        { type: 'token_usage_record', payload: { total_tokens: 123 } },
        { type: 'world_state', payload: {} },
        // A developer-role message must NOT be read as a user message.
        { type: 'response_item', payload: { type: 'message', role: 'developer', content: [{ type: 'input_text', text: "Let's pause here, I'm heading home." }] } },
        ...userTexts.map((text) => ({
          type: 'response_item',
          payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] },
        })),
        { type: 'response_item', payload: { type: 'custom_tool_call', name: 'do_thing' } },
      ];
      writeFileSync(path, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
    }

    it('has an unkept commitment and the real last user message asked to stop → allowed', () => {
      const transcriptPath = join(stateDir, 'rollout-stop.jsonl');
      writeRollout(transcriptPath, ['go ahead and refactor the parser', "Let's pause here, I'm heading home."]);

      const out = runAdapter(CODEX_ADAPTER, {
        session_id: randomUUID(),
        last_assistant_message: 'The remaining two items I will do next.',
        transcript_path: transcriptPath,
        stop_hook_active: false,
      });

      expect(out.decision).toBeUndefined();
    });

    it('same shape, real last user message did NOT ask to stop → still blocks', () => {
      const transcriptPath = join(stateDir, 'rollout-no-stop.jsonl');
      writeRollout(transcriptPath, ['go ahead and refactor the parser', 'sounds good, go ahead']);

      const out = runAdapter(CODEX_ADAPTER, {
        session_id: randomUUID(),
        last_assistant_message: 'The remaining two items I will do next.',
        transcript_path: transcriptPath,
        stop_hook_active: false,
      });

      expect(out.decision).toBe('block');
    });

    it('a role:"developer" message alone (no role:"user" message at all) is not read as a user stop request → still blocks', () => {
      const transcriptPath = join(stateDir, 'rollout-developer-only.jsonl');
      writeRollout(transcriptPath, []); // no user-role message; only the developer-role one baked into writeRollout

      const out = runAdapter(CODEX_ADAPTER, {
        session_id: randomUUID(),
        last_assistant_message: 'The remaining two items I will do next.',
        transcript_path: transcriptPath,
        stop_hook_active: false,
      });

      expect(out.decision).toBe('block');
    });

    // Mutation check (verified by hand, then reverted — see commit/handback
    // notes): with extractMessage()'s `ev.payload` branch removed, the "asked
    // to stop → allowed" test above goes red (block instead of undefined),
    // confirming it actually exercises the real codex-cli shape and not just
    // whatever fallback happened to already work.
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
