# Flaky Test Management Standards

## Overview

A single flaky test in a 3000-test suite can erode CI confidence enough that developers start ignoring failures. Once developers learn to "just re-run CI", real bugs slip through. The cost of eliminating flaky tests is always lower than the cost of the false sense of security they create.

## Definition

A test is **flaky** if it produces different results (pass/fail) on consecutive runs with the same code. The 2% threshold: if a test fails ≥ 2% of runs on `main` without code changes, it is flaky.

## Detection

Most CI systems can detect flakiness automatically:

- **GitHub Actions**: Look for `Flaky tests detected` annotations
- **Manual**: Run `npx vitest run --reporter=verbose` 5 times, look for non-deterministic results
- **Vitest**: `vitest run --repeat=5` (runs each test 5 times)

## Quarantine Workflow

```
Detected → Quarantine (< 48h) → Track → Fix or Delete (< 30 days)
```

### Quarantine Annotation

```typescript
// TODO: quarantined 2026-05-05 — flaky race condition, see issue #42
it.skip("reconnects after WebSocket disconnect", async () => {
  // ... test body preserved for reference
})
```

### Tracking Issue Template

```markdown
**Flaky Test**: `describe > test name`
**File**: `src/path/to/test.ts`
**Quarantined**: 2026-05-05
**Failure rate**: ~5% on main
**Known failure mode**: `Cannot read property 'socket' of undefined`
**Root cause hypothesis**: Race condition in WebSocket teardown
**Deadline**: 2026-06-05
```

## Common Root Causes

| Root Cause | Fix |
|-----------|-----|
| Race condition | Use `waitFor()`, `vi.waitFor()`, proper async coordination |
| Shared state | Reset state in `beforeEach`/`afterEach` |
| External service | Mock the dependency |
| File system ordering | Use deterministic sort |
| Random without seed | Set fixed seed in test |
| Timing-dependent | Fake timers (`vi.useFakeTimers()`) |

## Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    retry: 2,              // retry failed tests up to 2 times
    testTimeout: 10000,    // 10s timeout prevents infinite hangs
    hookTimeout: 5000,     // 5s hook timeout
  }
})
```

## Related Standards

- [Testing Standards](testing.md) — overall test pyramid
- [Test Governance Standards](test-governance.md) — CI policies


**Scope**: universal
