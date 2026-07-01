# Mock Boundary Standards

**Version**: 1.1.0
**Last Updated**: 2026-07-01
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

## Hollow Test Detection

Before submitting a test file, check:

1. **Mock count ≥ import count** → Review: at least one assertion must verify actual output
2. **All assertions are `.toHaveBeenCalled()` variants** → Add output-value assertions
3. **Mock path matches test subject directory** → Self-referential mock; remove it
4. **More mock setup lines than assertion lines** → Likely hollow

---

## Anti-Patterns

- **Total Mock Isolation**: Every import mocked; only mock interactions asserted
- **Mock the World**: External + internal + DB + FS all mocked in one test
- **Orphan Mock**: Cross-module mock with no integration test counterpart
- **Security Bypass Mock**: Auth/permission logic replaced with pass-through stub
- **Database Mock Cascade**: DB returns hardcoded data, hiding real query errors
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

---

## Relationship to Other Standards

- **testing**: Mock boundary rules apply to all test levels in the testing pyramid
- **test-completeness-dimensions**: Dimension 8 (AI Test Quality) references these rules
- **flow-based-testing**: Flow tests must follow mock boundary rules

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-05-04 | Initial standard: hollow test problem, CAN/CANNOT mock tables, detection, anti-patterns, rules summary |
| 1.1.0 | 2026-07-01 | Added injectable background execution as a seam (parallel to clock injection): CAN-mock row, `Injectable Background Execution` section, `Poll/Sleep for Background Result` anti-pattern, and no-poll/sleep rule (issue #143) |
