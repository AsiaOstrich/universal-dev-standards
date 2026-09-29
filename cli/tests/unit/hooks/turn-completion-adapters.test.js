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
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const CODEX_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion-codex.mjs');
const GEMINI_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion-gemini.mjs');
const CLAUDE_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion.mjs');
const AGY_ADAPTER = join(REPO_ROOT, 'scripts/hooks/check-turn-completion-agy.mjs');
const AGY_FIXTURES = join(import.meta.dirname, '..', '..', 'fixtures', 'agy-stop-hook');

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

describe('turn-completion-integrity: Claude Code adapter', () => {
  // Measured 2026-09-28 against Claude Code 2.1.283 in a live `claude -p`
  // session: when the Stop hook runs, the transcript does NOT yet hold the
  // final assistant message, and stdin carries it as last_assistant_message.
  // The adapter used to read only the transcript, got "", and allowed 5/5
  // turns that should have blocked. These transcripts reproduce the shape the
  // hook actually sees at that moment, not the completed file seen afterwards.

  /** Claude Code prints nothing on allow, so parse only when there is output. */
  function runClaude(stdinObj) {
    const stdout = execFileSync(process.execPath, [CLAUDE_ADAPTER], {
      input: JSON.stringify(stdinObj),
      env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: stateDir },
      encoding: 'utf8',
    });
    return stdout.trim() ? JSON.parse(stdout) : {};
  }

  /** Write a Claude Code transcript from [role, text] pairs. */
  function writeTranscript(name, turns) {
    const path = join(stateDir, name);
    writeFileSync(path, turns.map(([role, text]) =>
      JSON.stringify({ type: role, message: { role, content: role === 'user' ? text : [{ type: 'text', text }] } })).join('\n') + '\n');
    return path;
  }

  it('blocks on last_assistant_message when the transcript does not yet hold the final message (the live shape)', () => {
    const tp = writeTranscript('race.jsonl', [['user', 'please refactor the parser']]);
    const out = runClaude({ session_id: randomUUID(), transcript_path: tp, stop_hook_active: false,
      last_assistant_message: "I'll do the remaining two next." });
    expect(out.decision).toBe('block');
  });

  it('judges the current message, not a stale commitment from the previous turn left in the transcript', () => {
    const tp = writeTranscript('stale.jsonl', [
      ['user', 'please refactor the parser'],
      ['assistant', "I'll do the remaining two next."],
      ['user', 'ok go'],
    ]);
    const out = runClaude({ session_id: randomUUID(), transcript_path: tp, stop_hook_active: false,
      last_assistant_message: 'Both are done and the tests pass.' });
    expect(out).toEqual({});
  });

  it('still reads the human side from the transcript: a stop request exempts the turn (R9)', () => {
    const tp = writeTranscript('stop.jsonl', [['user', "Let's pause here, I'm heading home."]]);
    const out = runClaude({ session_id: randomUUID(), transcript_path: tp, stop_hook_active: false,
      last_assistant_message: "I'll do the remaining two next." });
    expect(out).toEqual({});
  });

  it('falls back to the transcript when stdin has no last_assistant_message (older Claude Code)', () => {
    const tp = writeTranscript('fallback.jsonl', [
      ['user', 'please refactor the parser'],
      ['assistant', "I'll do the remaining two next."],
    ]);
    const out = runClaude({ session_id: randomUUID(), transcript_path: tp, stop_hook_active: false });
    expect(out.decision).toBe('block');
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

describe('turn-completion-integrity: Antigravity CLI (agy) adapter', () => {
  // Shapes below are the ones a real agy 1.2.12 session produced on
  // 2026-09-29 (`agy -p`, single turn, no tool calls), de-identified: the
  // fixtures under tests/fixtures/agy-stop-hook/ are the real stdin payloads
  // and transcripts with the home directory and conversationId replaced.
  //   - stdin carries only `transcriptPath` (+ conversationId etc.): no final
  //     message, no human message
  //   - transcript is JSONL; the human is source USER_EXPLICIT / type
  //     USER_INPUT wrapped in <USER_REQUEST> and followed by system blocks;
  //     the model is source MODEL / type PLANNER_RESPONSE; a `continue`
  //     reason comes back as source SYSTEM / type SYSTEM_MESSAGE.

  let step;
  const userRec = (text) => ({
    step_index: step++, source: 'USER_EXPLICIT', type: 'USER_INPUT', status: 'DONE',
    created_at: '2026-09-29T07:27:35Z',
    content: `<USER_REQUEST>\n${text}\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\nThe current local time is: 2026-09-29T15:27:35+08:00.\n</ADDITIONAL_METADATA>`,
  });
  const modelRec = (text) => ({
    step_index: step++, source: 'MODEL', type: 'PLANNER_RESPONSE', status: 'DONE',
    created_at: '2026-09-29T07:27:36Z', content: text,
  });
  const systemRec = (text) => ({
    step_index: step++, source: 'SYSTEM', type: 'SYSTEM_MESSAGE', status: 'DONE',
    created_at: '2026-09-29T07:27:42Z',
    content: `The following is a <SYSTEM_MESSAGE> not actually sent by the user. It is provided by the system as important information to pay attention to.\n\n<SYSTEM_MESSAGE>\nStop hook blocked termination: ${text}\n</SYSTEM_MESSAGE>`,
  });

  beforeEach(() => { step = 0; });

  /** Write a transcript from records, run the adapter with agy's real stdin shape. */
  function runAgy(records, { raw } = {}) {
    const tp = join(stateDir, 'transcript_full.jsonl');
    writeFileSync(tp, raw ?? records.map((r) => JSON.stringify(r)).join('\n') + '\n');
    return runAgyWithStdin({
      artifactDirectoryPath: '/home/user/.gemini/antigravity-cli/brain/x',
      conversationId: randomUUID(),
      error: '', executionNum: 0, fullyIdle: true, modelName: 'test-model',
      terminationReason: 'NO_TOOL_CALL', transcriptPath: tp, workspacePaths: ['/tmp/agy-probe'],
    });
  }
  function runAgyWithStdin(stdinObj) {
    return runAdapter(AGY_ADAPTER, stdinObj);
  }

  const COMMIT = 'The remaining two items I will do next.';

  it('(a) an unkept commitment continues in agy\'s shape ("continue", not "block"/"deny")', () => {
    const out = runAgy([userRec('please refactor the parser'), modelRec(COMMIT)]);
    expect(out.decision).toBe('continue');
    expect(out.reason).toContain('UDS standard turn-completion-integrity (R1)');
  });

  it('(b) a conditional commitment is allowed, and allow is exactly {}', () => {
    const out = runAgy([userRec('pick a model for me'), modelRec("Once you pick a model, I'll wire it into the config.")]);
    expect(out).toEqual({});
  });

  it('(c) R9: the human asked to stop → allowed even with a real commitment', () => {
    const out = runAgy([userRec('go ahead and refactor the parser'), modelRec('On it.'),
      userRec("Let's pause here, I'm heading home."), modelRec(COMMIT)]);
    expect(out).toEqual({});
  });

  it('the human\'s stop request counts only from <USER_REQUEST>: the system block after it is not the human', () => {
    const rec = userRec('go ahead and refactor the parser');
    rec.content = rec.content.replace('</ADDITIONAL_METADATA>', "Let's pause here, I'm heading home.\n</ADDITIONAL_METADATA>");
    const out = runAgy([rec, modelRec(COMMIT)]);
    expect(out.decision).toBe('continue');
  });

  // The failure R9 + R11 guard against, in agy's own shape: the hook's
  // `continue` reason comes back as source SYSTEM / type SYSTEM_MESSAGE. Read
  // "any non-MODEL record" as the human and this message becomes "the human's
  // last message". Here it carries a stop phrase and NO self-echo marker, so
  // only the `source` filter (not isSelfEcho) can keep it out — that is what
  // makes the mutation "read any non-MODEL message" turn this test red.
  it('a SYSTEM_MESSAGE is never read as the human: a stop phrase inside it does not exempt the turn', () => {
    const out = runAgy([userRec('go ahead and refactor the parser'), modelRec('Started.'),
      systemRec("Let's pause here, I'm heading home."), modelRec(COMMIT)]);
    expect(out.decision).toBe('continue');
  });

  it('the transcript holding this hook\'s own previous block reason does not void a real stop request', () => {
    // real human stop request first, then our own reason as SYSTEM_MESSAGE
    const out = runAgy([userRec("Let's pause here, I'm heading home."), modelRec(COMMIT),
      systemRec('Your last message stated a next action.\n\nUDS standard turn-completion-integrity (R1): a stated next action is not optional.'),
      modelRec(COMMIT)]);
    expect(out).toEqual({});
  });

  it('the final reply is the LAST MODEL/PLANNER_RESPONSE: an earlier commitment that was then done is not judged', () => {
    const out = runAgy([userRec('refactor'), modelRec(COMMIT), systemRec('continue'), modelRec('Both are done and the tests pass.')]);
    expect(out).toEqual({});
  });

  it('a MODEL record of another type is not the final reply', () => {
    const rec = modelRec(COMMIT);
    rec.type = 'TOOL_CALL';
    const out = runAgy([userRec('refactor'), rec]);
    expect(out).toEqual({});
  });

  it('an itemized blocker list (the R2 ending) is allowed', () => {
    const out = runAgy([userRec('finish up'), modelRec([
      'Nothing left to decide. Each remaining item and who it waits on:',
      '  1. Deploy — waits on you running the setup script.',
      '  2. Credential renewal — waits on you, I cannot type it.',
    ].join('\n'))]);
    expect(out).toEqual({});
  });

  describe('real captured payloads (fixtures/agy-stop-hook)', () => {
    function runFixture(stdinName, transcriptName) {
      const tp = join(stateDir, 'transcript_full.jsonl');
      writeFileSync(tp, readFileSync(join(AGY_FIXTURES, transcriptName), 'utf8'));
      const stdin = JSON.parse(readFileSync(join(AGY_FIXTURES, stdinName), 'utf8'));
      return runAgyWithStdin({ ...stdin, conversationId: randomUUID(), transcriptPath: tp });
    }

    it('first call (transcript ends at the model reply "FIRST") → allowed', () => {
      expect(runFixture('stdin-1.json', 'transcript-1.jsonl')).toEqual({});
    });

    it('second call (transcript holds our own SYSTEM_MESSAGE, reply "AGAIN") → allowed, no crash', () => {
      expect(runFixture('stdin-2.json', 'transcript-2.jsonl')).toEqual({});
    });

    it('the real shape with the model reply swapped for a commitment → continue', () => {
      const tp = join(stateDir, 'transcript_full.jsonl');
      const lines = readFileSync(join(AGY_FIXTURES, 'transcript-1.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
      lines[1].content = COMMIT;
      writeFileSync(tp, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
      const stdin = JSON.parse(readFileSync(join(AGY_FIXTURES, 'stdin-1.json'), 'utf8'));
      expect(runAgyWithStdin({ ...stdin, conversationId: randomUUID(), transcriptPath: tp }).decision).toBe('continue');
    });
  });

  // 🔴 agy runs the hook with the working directory set to `.agents/`
  // (measured 2026-09-29, agy 1.2.12). Nothing in the adapter or engine reads
  // process.cwd() (packs load relative to the module, state lives under
  // ~/.uds or UDS_TURN_COMPLETION_STATE_DIR, the transcript path is absolute
  // from stdin) — these pin that, by running the adapter from `.agents/`.
  describe('working directory is `.agents/`, not the project root', () => {
    function runFrom(cwd, records, conversationId = randomUUID()) {
      const tp = join(stateDir, 'transcript_full.jsonl');
      writeFileSync(tp, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
      const stdout = execFileSync(process.execPath, [AGY_ADAPTER], {
        cwd,
        input: JSON.stringify({ conversationId, transcriptPath: tp, workspacePaths: [join(cwd, '..')] }),
        env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: join(stateDir, 'state') },
        encoding: 'utf8',
      });
      return JSON.parse(stdout);
    }
    const setup = () => {
      const root = mkdtempSync(join(stateDir, 'proj-'));
      const agents = join(root, '.agents');
      mkdirSync(agents);
      return { root, agents };
    };

    it('blocks the same as from the project root', () => {
      const { root, agents } = setup();
      const recs = [userRec('refactor'), modelRec(COMMIT)];
      expect(runFrom(agents, recs).decision).toBe('continue');
      expect(runFrom(root, recs).decision).toBe('continue');
    });

    it('allows (conditional, and human-asked stop) the same as from the project root', () => {
      const { root, agents } = setup();
      const cond = [userRec('pick'), modelRec("Once you pick a model, I'll wire it into the config.")];
      const stop = [userRec("Let's pause here, I'm heading home."), modelRec(COMMIT)];
      for (const cwd of [agents, root]) {
        expect(runFrom(cwd, cond)).toEqual({});
        expect(runFrom(cwd, stop)).toEqual({});
      }
    });

    it('a second call in the same conversation inside the cooldown allows (R6) — same from either directory', () => {
      const { agents } = setup();
      const recs = [userRec('refactor'), modelRec(COMMIT)];
      const id = randomUUID();
      expect(runFrom(agents, recs, id).decision).toBe('continue');
      expect(runFrom(agents, recs, id)).toEqual({});
    });
  });

  describe('R5: every failure path allows with valid JSON', () => {
    it('malformed stdin', () => {
      const stdout = execFileSync(process.execPath, [AGY_ADAPTER], {
        input: 'not json at all {{{',
        env: { ...process.env, UDS_TURN_COMPLETION_STATE_DIR: stateDir },
        encoding: 'utf8',
      });
      expect(JSON.parse(stdout)).toEqual({});
    });

    it('transcriptPath missing from stdin', () => {
      expect(runAgyWithStdin({ conversationId: randomUUID(), executionNum: 0 })).toEqual({});
    });

    it('transcriptPath points at a file that does not exist', () => {
      expect(runAgyWithStdin({ conversationId: randomUUID(), transcriptPath: join(stateDir, 'nope.jsonl') })).toEqual({});
    });

    it('a transcript with corrupt lines: the good lines still count', () => {
      const good = JSON.stringify(modelRec(COMMIT));
      const out = runAgy(null, { raw: `{{{ not json\n${JSON.stringify(userRec('refactor'))}\n${good}\n{"truncated":` });
      expect(out.decision).toBe('continue');
    });

    it('an empty transcript', () => {
      expect(runAgy(null, { raw: '' })).toEqual({});
    });
  });
});

describe('turn-completion-integrity: shared corpus (all adapters read the same packs)', () => {
  it('the packs\' self-test passes for every adapter entrypoint', () => {
    for (const adapter of [CLAUDE_ADAPTER, CODEX_ADAPTER, GEMINI_ADAPTER, AGY_ADAPTER]) {
      expect(() => execFileSync(process.execPath, [adapter, '--self-test'], { encoding: 'utf8' }))
        .not.toThrow();
    }
  });

  it('every adapter declares its shipped languages (R8)', () => {
    for (const adapter of [CLAUDE_ADAPTER, CODEX_ADAPTER, GEMINI_ADAPTER, AGY_ADAPTER]) {
      const out = execFileSync(process.execPath, [adapter, '--languages'], { encoding: 'utf8' });
      expect(out).toContain('en (English)');
      expect(out).toContain('zh-TW');
    }
  });
});
