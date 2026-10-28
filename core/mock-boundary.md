# Mock Boundary Standards

**Version**: 1.3.0
**Last Updated**: 2026-10-28
**Applicability**: All software projects with unit and integration tests
**Scope**: universal
**Industry Standards**: ISTQB Foundation (Test Doubles), xUnit Patterns (Gerard Meszaros)
**References**: "Working Effectively with Legacy Code" (Feathers), "Growing Object-Oriented Software" (Freeman & Pryce)

[English](.) | [繁體中文](../locales/zh-TW/core/mock-boundary.md)

---

## Purpose

This document defines rules for what can and cannot be mocked in tests. Its goal is to prevent **hollow tests** — tests that always pass but fail to detect real bugs because they replace the system's logic with stubs.

---

## The Hollow Test Problem

A hollow test mocks so much of the system that the test becomes a specification of mock wiring rather than system behavior. The classic symptom: you can delete the implementation file and the test still passes.

**Real example (Multi-agent pipeline SPEC-002.test.ts)**:

```typescript
vi.mock('../../src/runner/agent-runner.js')      // Core logic replaced
vi.mock('../../src/runner/guardian-hooks.js')     // Core logic replaced
vi.mock('../../src/runner/prototyper.js')         // Core logic replaced
vi.mock('../../src/runner/iteration-report.js')   // Core logic replaced
vi.mock('../../src/memory/memory-store.js')       // Core logic replaced
vi.mock('node:fs/promises', ...)                  // I/O replaced

// All assertions verify mock call counts — not actual outputs.
// runPipeline() touches zero real code.
```

---

## What You CAN Mock

| Category | Examples | Reason |
|----------|----------|--------|
| External HTTP services | LLM APIs, payment gateways, email services | Prevents flaky tests; controls response scenarios |
| Time functions | `Date.now()`, `new Date()`, `setTimeout` | Makes tests deterministic |
| Environment variables | `process.env.NODE_ENV`, `process.env.LICENSE_KEY` | Enables config variation |
| File system (unit tests only) | `fs.readFile`, `fs.writeFile` | Avoids I/O in fast unit tests |
| Cross-module boundaries (with IT counterpart) | Other modules' public APIs | Isolates unit under test |
| In-process background execution (via injectable runner) | `Task.Run`, unawaited promises, `setTimeout`, goroutines, thread-pool dispatch | Injecting a runner seam lets tests await deterministic completion, eliminating the race |

---

## What You CANNOT Mock

| Category | Example Violation | Why Forbidden |
|----------|-------------------|---------------|
| Own module's core logic | `vi.mock('./pipeline-runner.js')` in pipeline-runner tests | Makes the test a no-op |
| Database in IT/flow/E2E tests | `vi.mock('./db/client.js')` in integration tests | Hides query bugs, schema issues |
| HTTP framework internals | `vi.mock('express')` | Real routing may be broken |
| Security controls | Always-pass auth middleware stub | Security regressions invisible |

---

## Injectable Background Execution

Fire-and-forget background work (a `Task.Run`, an unawaited promise, a `setTimeout`, a goroutine, a `java.util.concurrent` executor submission, or `asyncio.create_task`) is a **seam**, exactly like the system clock. Just as you inject a clock instead of reading wall-clock time, you inject the background dispatcher instead of spawning work directly. This lets a test drive the work to a **deterministic, awaited completion** and assert on its outcome (success, exception, or retry) — no polling, no sleeping, no race.

Abstract the dispatch behind a small interface (e.g. `IBackgroundTaskRunner` / `BackgroundDispatcher`), then provide two implementations:

- **Production**: preserves true fire-and-forget semantics — dispatch returns immediately and the work runs detached.
- **Test**: runs the work **inline** and **tracks the underlying Task/promise**, exposing a handle the test can `await` so completion (and any failure) is observable.

Language-neutral sketch (TypeScript pseudo-code):

```typescript
// Seam — injected wherever background work is dispatched
interface BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void
}

// Production: real fire-and-forget — returns immediately, work runs detached
class FireAndForgetDispatcher implements BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void {
    void work() // intentionally not awaited
  }
}

// Test: inline execution + tracked tasks so tests can await completion
class DeterministicDispatcher implements BackgroundDispatcher {
  private readonly tasks: Promise<void>[] = []
  dispatch(work: () => Promise<void>): void {
    this.tasks.push(work()) // start inline, keep the handle
  }
  async settle(): Promise<void> {
    await Promise.all(this.tasks) // test awaits deterministic completion
  }
}
```

The test injects `DeterministicDispatcher`, exercises the code under test, then `await dispatcher.settle()` before asserting on the result — the background side effect is now fully observable and deterministic.

---

## Blocking Hooks: Test the Host's Entry, Not the Matcher

A **hook** is a script an AI host (Claude Code, Codex, Gemini CLI, Antigravity CLI, and others) runs at a lifecycle event. Some hooks can **stop** what the host was about to do: refuse a tool call, reject a prompt, keep a turn from ending. For these the hollow-test problem needs no mock at all. The test simply never touches the entry the host calls.

A hook has two layers. The **judgement** decides whether this command is dangerous. The **wiring** reads the host's stdin payload and answers in the signal the host reads (an exit code, or JSON on stdout). A unit test that imports the judgement function exercises the first layer only, and the host reads the second. A wrong exit code, a payload field read under the wrong name, or output in a shape the host ignores all leave that test green.

### Counter-example: UDS's own dangerous-command hook blocked 0 of 26

`scripts/hooks/check-dangerous-cmd.mjs` is a PreToolUse hook. When it detected a dangerous command it exited **1**. Claude Code blocks a tool call only on exit **2**; any other non-zero code is a non-blocking hook error and the command runs anyway. Its tests imported the matcher function (`isDangerousCommand()`) and called it directly, so they were green for months.

Replaying 11,617 real shell calls (2026-10-27) the rule `rm -rf /` fired 26 times. The host blocked **0** of them. 25 of the 26 were harmless temp cleanups such as `rm -rf /tmp/x`; none was a real attempt to wipe the root. The same pattern missed `rm -fr /` and `rm -r -f /`. The fix and its entry tests shipped in PR #281.

### Rules

**H1 (MUST).** A hook that can stop a tool call, a prompt or a turn MUST have at least one test that does all three:

1. **Runs the hook as a separate process**, with the same command the host's config runs. Spawning the script counts; importing it does not.
2. **Sends the host's own payload on stdin**, with the field names that host uses (see the table below: Claude Code sends `tool_name` / `tool_input`, Antigravity sends `toolCall`). A payload shaped like the author's idea of the host proves nothing.
3. **Asserts the signal the host reads**: the exact exit code, or the JSON the host parses on stdout. "Non-zero", "exited with an error" and "stderr contained the word" do not count: exit 1 is non-zero and blocks nothing on Claude Code.

A test that imports and calls an internal function MAY exist and is useful for the judgement, but it does not count toward H1.

**H2 (SHOULD).** Pair the blocking case with an allowing case run the same way, and assert the host's allow signal (for example exit 0 with nothing on stdout). A hook that blocks everything passes a blocking-only test.

**H3 (SHOULD).** Cut check: change the hook's block signal (for example `exit 2` to `exit 1`) and confirm the entry test goes red. A test that stays green has not been guarding the wiring.

H1 also applies to a hook whose only effect is that the host reads its signal, such as a PostToolUse hook that uses exit 2 to put its stderr in front of the model. The tool has already run, so it cannot be undone, but a wrong code silences the hook just the same.

### What each host reads as "blocked"

Retrieved 2026-10-28 from each host's own documentation. Hosts change these contracts; re-check the source before relying on a cell, and when a cell says "not found" the page was read and says nothing, which is not the same as "no".

| Host | Event | Blocks | Does not block | Source |
|---|---|---|---|---|
| Claude Code | PreToolUse | exit **2** (stderr is the reason); or exit 0 with stdout `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}` | any other exit code, **including 1**, is a non-blocking hook error and the action proceeds; invalid JSON likewise. Exception stated by the docs: a hook configured with `onFailure: "block"` blocks when it fails | code.claude.com/docs/en/hooks: Exit code output, Exit code 2, Other exit codes, Decision control |
| Claude Code | UserPromptSubmit | exit **2** (the prompt never reaches the model); or exit 0 with stdout `{"decision":"block","reason":"..."}` | any other exit code (same `onFailure: "block"` exception) | same page, Exit code 2 behavior per event |
| Claude Code | PostToolUse | cannot block: the tool already ran. Exit 2 only shows stderr to the model | any exit code, for blocking purposes | same page, Exit code 2 behavior per event |
| Codex | PreToolUse | exit **2** with the reason on stderr; or stdout `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}`; the older `{"decision":"block","reason":"..."}` is also accepted | plain text on stdout is ignored; `permissionDecision:"ask"`, `continue:false`, `stopReason`, `suppressOutput` are not supported and the hook run is marked failed while the tool call continues; other non-zero exit codes: not found | developers.openai.com/codex/hooks, PreToolUse |
| Codex | UserPromptSubmit | exit **2** with the reason on stderr; or stdout `{"decision":"block","reason":"..."}` | plain text on stdout is added as context; other non-zero exit codes: not found | same page, UserPromptSubmit |
| Codex | PermissionRequest | stdout `{"hookSpecificOutput":{"decision":{"behavior":"deny","message":"..."}}}`; any `deny` wins | exit 2 for this event: not found; plain text on stdout is ignored | same page, PermissionRequest |
| Gemini CLI (legacy) | BeforeTool | exit **2** (stderr is the reason sent to the agent); or exit 0 with stdout `{"decision":"deny","reason":"..."}` (`"block"` is an alias). The docs name the JSON form the preferred path | any other exit code is a warning and the CLI continues | geminicli.com/docs/hooks/reference, Global hook mechanics and BeforeTool |
| Gemini CLI (legacy) | BeforeAgent, BeforeModel | exit **2** aborts the turn (BeforeAgent also erases the prompt from context; BeforeModel skips the LLM call); or `decision:"deny"` | as above | same page |
| Antigravity CLI (`agy`) | PreToolUse | exit 0 with stdout `{"decision":"deny","reason":"..."}` ("Hard blocks execution immediately"). The `decision` field is required; its other values are `allow`, `auto_approve`, `ask`, `force_ask`, `deny_unless_prior_grant`. stdin carries `toolCall.name` and `toolCall.args`, not Claude Code's names | exit-code semantics: not found (the official page is silent). Do not assume Claude Code's exit 2 applies. A third-party guide claims any non-zero code denies; it is not official and is not used here | antigravity.google/docs/hooks, Input and output contract, PreToolUse |
| Cursor and other hosts | any | not found (not surveyed in this revision) | not found | none |

Stop-type events (Claude Code and Codex Stop, Gemini CLI AfterAgent, Antigravity Stop) are **not repeated here**. Their block contracts are in the "Supported harnesses" table of [turn-completion-integrity](turn-completion-integrity.md), the single place they are written down. That table also records one case where a failed Antigravity hook was let through silently, which is the same wiring failure this section is about.

### A replay validates the wiring, not the rules

Replaying recorded real calls through a hook (for example with rules-to-guards) is a strong way to check the wiring. It has a limit that must be stated whenever its result is reported. If the same rule list decides both "this should be blocked" and "this should not", the replay proves the hook behaves as its rules say. It does not prove the rules are right.

The 0-of-26 measurement could be made because the host's contract (exit 2 blocks) is a fact outside the hook. For "which commands deserve blocking" there was only the hook's own pattern: all 26 hits were consistent with it, 0 were real dangers, and `rm -fr /`, which the pattern did not cover, could never show up as a miss because the oracle shares the blind spot.

So report a replay as "wiring is correct" or "wiring is wrong". Do not report "the rules are correct" from it. To say anything about the rules, read the commands that actually matched, or keep a separate answer key (see [verification-oracle](verification-oracle.md)) written without looking at the hook's patterns.

### Enforcement in UDS

UDS checks this rule against its own shipped hooks in CI: `node scripts/check-hook-entry-tests.mjs` (npm run `check:hook-entry-tests`) fails when a hook UDS ships that can block has no test that spawns it, feeds stdin and asserts the host's signal. It is static text analysis: it shows that a test of the right shape exists, not that the test would go red if the hook regressed. That is what H3 is for.

---

## Hollow Test Detection

Before submitting a test file, check:

1. **Mock count ≥ import count** → Review: at least one assertion must verify actual output
2. **All assertions are `.toHaveBeenCalled()` variants** → Add output-value assertions
3. **Mock path matches test subject directory** → Self-referential mock; remove it
4. **More mock setup lines than assertion lines** → Likely hollow
5. **A blocking hook whose tests only import and call its functions** → Add an entry test that spawns it and asserts the host's signal (see Blocking Hooks)

---

## Anti-Patterns

- **Total Mock Isolation**: Every import mocked; only mock interactions asserted
- **Mock the World**: External + internal + DB + FS all mocked in one test
- **Orphan Mock**: Cross-module mock with no integration test counterpart
- **Security Bypass Mock**: Auth/permission logic replaced with pass-through stub
- **Database Mock Cascade**: DB returns hardcoded data, hiding real query errors
- **Matcher-Only Hook Test**: A blocking hook whose tests import and call its judgement function and never run the hook as the host does. Green while the hook blocks nothing (UDS's own 0-of-26)
- **Poll/Sleep for Background Result**: Sleeping or polling to wait for fire-and-forget work to finish. The race is still there — the timeout merely hides it most of the time while slowing the whole suite and, on a shared runner, leaking flakiness into other MRs' CI. Inject a deterministic runner and await the tracked task instead.

---

## Rules Summary

| Rule | Trigger | Action |
|------|---------|--------|
| No self-mock | Test file mocks its own module | Remove mock; let real code run |
| Real DB in IT/flow | Writing IT or flow test | Use in-memory SQLite or test schema |
| IT counterpart | Mocking cross-module boundary | Ensure corresponding IT exists |
| No security mock | Test involves auth/permissions | Use real test user + real token |
| Hollow review | Mock count ≥ import count | Add output-value assertion |
| No poll/sleep for background work | Test asserts a fire-and-forget side effect | Inject deterministic runner; await the tracked task |
| Host entry test for blocking hooks | Hook can stop a tool call, prompt or turn | Spawn it, send the host's payload on stdin, assert the exit code or stdout JSON the host reads |
| Replay proves wiring only | Reporting a replay of real calls through a hook | Report "wiring correct"; do not report "rules correct" unless the rules were checked against an independent answer |

---

## Relationship to Other Standards

- **testing**: Mock boundary rules apply to all test levels in the testing pyramid
- **test-completeness-dimensions**: Dimension 8 (AI Test Quality) references these rules
- **flow-based-testing**: Flow tests must follow mock boundary rules
- **turn-completion-integrity**: Holds the block contracts for Stop-type events; this standard holds them for tool and prompt events, and neither repeats the other
- **verification-oracle**: An answer key for judging whether a hook's rules are right must not be derived from the hook's own patterns

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-05-04 | Initial standard: hollow test problem, CAN/CANNOT mock tables, detection, anti-patterns, rules summary |
| 1.1.0 | 2026-07-01 | Added injectable background execution as a seam (parallel to clock injection): CAN-mock row, `Injectable Background Execution` section, `Poll/Sleep for Background Result` anti-pattern, and no-poll/sleep rule (issue #143) |
| 1.3.0 | 2026-10-28 | Added `Blocking Hooks: Test the Host's Entry, Not the Matcher`: H1 MUST (spawn the hook, send the host's stdin payload, assert the signal the host reads), H2/H3 SHOULD, the per-host block-signal table, and the replay-validates-wiring-not-rules note, with UDS's own 0-of-26 as the counter-example. Number re-aligned with `mock-boundary.ai.yaml`, which had used 1.2.0 for the background-execution addition recorded here as 1.1.0 |
