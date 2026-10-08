# Full Coverage Testing Standards

> **AI-optimized version**: `ai/standards/full-coverage-testing.ai.yaml`
> **XSPEC**: XSPEC-178, XSPEC-444 (R2, R5 — pre-commit warnings and shipped gate scripts), XSPEC-470 (R1 — tautology means "expected value not independent")
> **Replaces**: Pyramid threshold model (UT≥80%, IT≥70%, E2E happy-path-only)

## Overview

Full Coverage Testing is a behavior-completeness paradigm designed for the AI-era, where the cost of generating tests equals the cost of generating code. Traditional pyramid thresholds assumed tests were expensive to write — this assumption no longer holds.

**Core principle**: Every public function must be tested for all three behavioral paths. Coverage is measured by behavior completeness, not percentage floors. CI enforces a ratchet: coverage can only increase, never decrease.

---

## Behavior-Completeness Model

Instead of "80% line coverage", require:

| Path | Description | Example |
|------|-------------|---------|
| **Happy path** | Normal input produces correct output | `calculateDiscount(100, 0.1) → 90` |
| **Edge case** | Boundary values do not cause unexpected errors | `calculateDiscount(0, 1.0) → 0 without throwing` |
| **Error path** | Invalid input raises clear error or error state | `calculateDiscount(-1, 2.0) → throws ArgumentError` |

Every public function requires all three. This replaces the "80% of business logic" target with a qualitative, behavior-driven requirement.

---

## Ratchet CI Policy

- The current coverage baseline is the minimum acceptable coverage
- Any PR that decreases coverage is blocked from merging
- Improvements update the baseline automatically on merge
- No fixed percentage floor — the coverage achieved today is tomorrow's floor

```bash
# Stored in .coverage-baseline.json
{ "line": 91.3, "branch": 88.7, "timestamp": "2026-05-06" }

# PR regression → blocked
Coverage regression: 91.3% → 89.1%. Ratchet threshold violated.

# PR improvement → baseline updated
Coverage improved: 91.3% → 92.0%. New baseline set.
```

---

## Anti-Fake Test Rules

### Forbidden: Tautology Assertions

An assertion that cannot disagree with the implementation provides false coverage. There are two kinds:

1. **Always true** — it passes whatever the code does: `expect(true).toBe(true)`, `assert 200 == 200`.
2. **Not independent** — the expected value is produced by the code under test, or by the same logic written a second time inside the test. It passes when the implementation is right, and it passes just as well when the implementation and the copy are wrong in the same way.

The second kind is defined with the vocabulary of [`verification-oracle`](verification-oracle.md): an assertion's **oracle** is the source that says what the right answer is, and a tautology is an assertion whose oracle *is the implementation itself*. This standard does not define "independent source of truth" a second time; it uses that standard's: a registered ground-truth case, a known literal, a hand-computed example, or the specification (see its *Oracle-ability Spectrum*).

```typescript
// ❌ FORBIDDEN — always passes, tests nothing
expect(true).toBe(true)
expect(result).toBeDefined()  // without specific value

// ❌ FORBIDDEN — the oracle is the implementation
expect(countInstalled(manifest)).toBe(countInstalled(manifest))                    // the same call on both sides
expect(countInstalled(manifest)).toBe(manifest.standards.filter(s => s.installed).length)  // the same logic, typed again
//   ^ a reviewer's call: the scanner catches only the subset listed under "What the shipped scanner decides" below, and this one is not in it

// ✅ REQUIRED — a value that was decided before the code ran
expect(result).toBe(90)
expect(result).toEqual({ discount: 10, total: 90 })
expect(countInstalled({ standards: [{ id: 'a', installed: true }, { id: 'b', installed: false }] })).toBe(1)
```

Not every comparison of two computed values is a tautology. These are fine, and are **not** reported:

| Looks similar | Why it is a real test |
|---------------|-----------------------|
| `expect(snapshot(dir)).toEqual(before)` after an action | Asks "did anything change?" — the two values are taken at different moments |
| `expect(parse(a)).toEqual(parseWithOldEngine(a))` | A second, independently written implementation is the oracle |
| `expect(hash(x)).toBe(hash(x))` in a test named for determinism | Comparing two calls is the point of the test |
| `expect(report.total).toBe(rows.reduce(...))` where `report` comes from a different data path than `rows` | A reconciliation between two sources |

#### What the shipped scanner decides, and what stays a reviewer's question

`scripts/check-anti-fake-tests.mjs` (see "The two scanners" below) names the two shapes that can be decided from the text alone. It reads **JavaScript/TypeScript** (`toBe`, `toEqual`, `toStrictEqual`, chai `to.equal`/`to.eql`, node `assert.equal`/`strictEqual`/`deepEqual`/`deepStrictEqual`):

| Shape | Example | Reported when |
|-------|---------|---------------|
| **same call** | `expect(total(items)).toBe(total(items))` | both sides are the same call with the same arguments (and no other call or `new` inside the call), written in one statement, and the test is not named for comparing two calls (determinism, idempotence, caching, identity) |
| **recomputed** | `expect(total(items)).toBe(items.reduce((s, i) => s + i.price, 0))` | the call under test takes an input, and the expected value runs that same input (named as the argument itself, e.g. `items.reduce`, not a field of it) through `reduce`, `map`, `flatMap` or `filter` with a callback that uses nothing but its own parameters (plus pure built-ins such as `Math`, `Number`, `String`), holds no literal and is not a mere copy (`(x) => x`, `(x) => ({ ...x })`); the call under test is one call with no other call or `new` inside it and nothing after it such as `.length`. Only the text of the assertion is read: a name set on an earlier line is never looked through |

These look similar and are **left alone on purpose**, because the text cannot tell them from a sound test: `expect(priceOf(ids)).toEqual(ids.map(id => KNOWN_PRICES[id]))` (the expected value is read from a fixed table, an independent source); `expect(activeOf(users)).toEqual(users.filter(u => u.id === 2))` (the literal is knowledge the test author supplied); `expect(render(now())).toBe(render(now()))` (two calls to `now()` are two values, so the two sides are not known to be equal); `expect(parse(serialize(rows))).toEqual(rows.map(r => r))` (a round trip: there is a call inside the call under test); `expect(clone(input)).toEqual(input.map(x => x))` (a callback that only hands its parameter back, or a shallow copy of it such as `u => ({ ...u })`, is a copy and not logic; a `filter(x => x)`, which selects by truthiness, is logic, but it is left alone with them because the text cannot tell it from a copy); `expect(sortUsers(users).length).toBe(users.filter(u => u.name).length)` (the value under test is a property of the result, and which side is right cannot be read from the text). `const before = items.map(i => i.price); freezeCart(items); expect(pricesOf(items)).toEqual(before)` (a name set on an earlier line holds a value from an earlier moment, and what happened in between is what the test asks about; the same-call shape is read the same way). The rule is: when in doubt, miss it rather than accuse it.

**Two costs that are accepted, not hidden.**

1. **Differential tests are named.** A test that uses a reference implementation as its oracle, `expect(fastTotal(items)).toBe(items.reduce((s, i) => s + i.price, 0))`, looks exactly like the textbook example, so the scanner names it. Such a test is legitimate (see the table above, "a second, independently written implementation"); the ways to settle it are: put one assertion against a hand-computed literal in the same test (a test is reported only when none of its assertions is a real one), or list the file under `ignore` in `.standards/test-policy.json` (this removes the whole file from every check of this scanner, and `ignore` takes no reason, so say why in a comment). A test name such as "matches the reference implementation" does **not** exempt it, and the `exempt` list does not apply to this scanner (it belongs to the code-without-a-test check).
2. **The rule is easy to get around.** Wrapping the expected value in `Number(...)`, adding `.valueOf()` or `[0]`, or passing `items.slice()` instead of `items` is enough to stop the scanner from seeing it. It is a prompt for the reviewer, not a gate that holds against someone who means to avoid it, and that includes an AI agent writing the test: do not read a clean scan as evidence that the expected values are independent. The reviewer's questions below are the control; the script only points at the cheapest cases.

As with `expect(true).toBe(true)`, a test is reported only when **none** of its assertions is a real one; a self-comparison next to an assertion against a literal is left to the reviewer. When the text cannot decide, the scanner stays silent — a scanner that cries wolf is switched off.

Everything else is a **reviewer's question**, asked in code review (see [Code Review Checklist](code-review-checklist.md)): Where did this expected value come from? Could it be produced by running the code under test? Would the test still pass if the implementation were wrong in the way the test's own arithmetic is wrong? Typical cases the scanner does not judge: a hand-written loop that re-derives the answer, a helper that wraps the implementation, a snapshot generated from the implementation's own first output, and every language other than JavaScript/TypeScript.

### Forbidden: Mocking Core Business Logic

Mocking your own code means the business logic is never actually executed.

```typescript
// ❌ FORBIDDEN — business logic never runs
jest.mock('./orderService', () => ({ calculateTotal: jest.fn(() => 100) }))

// ✅ ALLOWED — mock only external dependencies
// MOCK: External Stripe API — no sandbox available in CI
jest.mock('./payment-gateway', () => ({ charge: jest.fn().mockResolvedValue({ id: 'ch_test' }) }))
```

### Required: Mock Reason Comments

Every mock must explain why the dependency cannot be real.

```typescript
// ❌ FORBIDDEN — no explanation
jest.mock('./payment-gateway')

// ✅ REQUIRED — explicit reason
// MOCK: External payment gateway — network dependency, no sandbox in CI
jest.mock('./payment-gateway', () => ({ ... }))
```

### Mock Boundary: What Can Be Mocked

| ✅ Allowed to Mock | ❌ Forbidden to Mock |
|-------------------|---------------------|
| External HTTP APIs (payment, OAuth) | Core business calculation functions |
| Hardware interfaces (sensors, GPIO) | Your own service layer methods |
| Third-party SDKs without test mode | Database queries (use in-memory SQLite) |
| Docker daemon | Your own utility functions |

---

## STUB Marker Protocol

All temporary/placeholder implementations MUST be marked with the standard STUB marker. This is enforced by pre-push hooks and deploy.sh.

### Marking a STUB

```typescript
// WARNING: STUB — Remove before UAT
async function validatePayment(card: Card): Promise<boolean> {
  return true; // Always approve — replace with real Stripe call
}
```

### Exempting a Genuine Limitation

When a dependency truly cannot be tested (hardware, live API without sandbox):

```typescript
// COVERAGE_EXEMPT: Hardware temperature sensor — no simulation available in CI
async function readTemperature(): Promise<number> {
  return hardwareSensor.read();
}
```

The exemption reason MUST be non-empty and specific.

### Deployment Gates

| Environment | STUB Present | Action |
|-------------|-------------|--------|
| Feature branch push | Yes | ⚠️ Warning (not blocked) |
| `main` branch push | Yes | ❌ Blocked |
| Staging deploy | Yes | ⚠️ Warning (not blocked) |
| UAT deploy | Yes | ❌ Blocked |
| Production deploy | Yes | ❌ Blocked (critical log) |

---

## AC Traceability

Link each test to its Acceptance Criteria using the `@ac` JSDoc tag:

```typescript
/**
 * @ac AC-US03-2
 */
it('should block PR when coverage regresses below baseline', () => {
  // test body
})

// If no AC maps to this test:
/**
 * @ac UNTRACED
 */
it('helper utility returns correct format', () => { ... })
```

CI reports AC coverage rate. If more than 20% of ACs lack `@ac`-tagged tests, a warning is shown.

---

## Migration Error-Path Completeness (XSPEC-288)

> Part of the [XSPEC-284](https://github.com/AsiaOstrich/universal-dev-standards) 9-axis migration completeness matrix (**axis ⑨ — error paths**). The three-path model above requires an error path **per function**; this section adds the **migration-specific** guarantee that legacy's error/degradation/fallback branches are **systematically** carried over — not merely sampled.

### Why the three-path model alone is not enough for a migration

The per-function error-path requirement and XSPEC-201's error-path snapshot only verify the error cases **you thought to enumerate**. In a rewrite the happy path is migrated because it has an explicit requirement, while error branches — scattered across `try/catch` layers, custom exception hierarchies, specific error codes, and degradation fallbacks — are **silently dropped in bulk**. A passing error-path sample does not prove **no branch was missed** (same blind-spot class as #134, occurring on the error-path layer). This section is the **systematic-enumeration + gap-analysis** layer above the snapshot mechanism.

### Step 1 — Mechanized legacy exception / error-code list (derive, R1)

Enumerate the legacy error surface **mechanically**, not from memory:

| Source | Yields |
|--------|--------|
| `catch` / `except` / `rescue` blocks (grep) | every caught exception type + handler |
| Custom exception / error class hierarchy | the declared error taxonomy |
| Error/status codes (HTTP status, app error codes, error enums) | the response-code surface |
| Error response shapes (serializers, error DTOs) | the on-the-wire error contract |

The captured list is the **error-path to-verify checklist** — sourced from artifacts, not human recall.

### Step 2 — Systematic missing-branch gap analysis (oracle, R2)

For **each** legacy error branch from Step 1, verify the new system has a corresponding handler. A branch with no mapping is marked `not_implemented` (XSPEC-199) and **blocks**. The output is a **"missing error branch" gap report** over the full derived list — not a sample that happened to pass.

```markdown
## Error-Path Gap Report — <module>

| Legacy branch (error type / code) | New-system handler | Status |
|-----------------------------------|--------------------|--------|
| PaymentDeclinedException → 402 | PaymentService.handleDecline | MAPPED |
| GatewayTimeout → retry+fallback | (none found) | not_implemented — BLOCK |
| ValidationError → 422 + field list | InputValidator | MAPPED |

**Branches: N total · M mapped · K not_implemented (block if K>0)**
```

### Step 3 — Degradation / fallback parity (R3)

Legacy degradation modes (fallback on external-service failure, retry, partial results) are easy to drop because they only run when something fails. Verify the new system preserves the corresponding degradation behavior, so the system is not "consistent on the happy path, wildly different on failure":

- [ ] External-service-failure **fallback** behavior matches legacy
- [ ] **Retry** policy (count, backoff, give-up) matches legacy
- [ ] **Partial-result** handling matches legacy (returns what it can vs all-or-nothing)
- [ ] **Circuit-breaker / timeout** degradation matches legacy

### Step 4 — Error-response differential (oracle, R4)

Extend [behavior-snapshot](behavior-snapshot.md) parity and XSPEC-284 R5 replay to cover the **error response**, not just the happy-path response. Compare new vs legacy on:

- **Error code** (HTTP status, app error code)
- **Message structure** (error DTO shape, field-level errors)
- **HTTP status** mapping per error class

This makes implicit error-path divergence self-report at cutover, the same way the happy-path snapshot does.

**Gate timing**: pre-UAT (gap analysis + degradation parity) + cutover before/after (error-response differential).

### Importance ranking (scope guidance)

Not every legacy error branch must map at equal priority. Rank by **production-actual trigger frequency** (echoes #134 "production is the oracle"): branches that have actually fired in production logs are mapped first; never-fired latent branches are lower priority but still listed. A high-frequency production error branch with no new-system mapping is a hard block.

### Completeness declaration (matrix alignment)

Axis ⑨ is satisfied when this section declares all three: **derive** (Step 1 mechanized exception/error-code list), **oracle** (Step 2 systematic gap analysis + Step 4 error-response differential), and **gate timing** (pre-UAT + cutover before/after). Reuse XSPEC-201 error-path snapshot + the three-path model above — this section adds only systematic missing-branch analysis and the error-response differential, it does not rebuild a test framework.

---

## Pre-commit Warnings and Gate Scripts Shipped by UDS (XSPEC-444 R2, R5)

The rules above used to depend on scripts the standard told you to write yourself. `uds init` now writes the scanners for you, and `uds check` — the command UDS's pre-commit hook runs — prints what they and one more check find. **All of it warns by default and blocks nothing**; tightening is opt-in (see "Warn first, tighten later").

### The two scanners (`uds init` writes them to `scripts/`)

| Script | Finds |
|--------|-------|
| `scripts/check-anti-fake-tests.mjs` | a test with **no assertion**; a test whose only assertions are **tautologies** (`expect(true).toBe(true)`, `assert 200 == 200`; in JavaScript/TypeScript also an expected value that is the same call as the code under test, or is recomputed from the same input with `reduce`/`map`/`filter` — see "Forbidden: Tautology Assertions"); a test file in which **every test is skipped or todo** |
| `scripts/check-stubs.mjs` | `// WARNING: STUB` markers; a body that says it is **not implemented** (`raise NotImplementedError`, `todo!()`, `TODO()` ...) with no marker beside it; a named function whose body is **empty** with no marker beside it |

- Pure Node, no dependencies, no test framework assumed. They are **your files**: edit them, wire them into CI. Run on its own, each exits non-zero when it finds something — `node scripts/check-stubs.mjs` is the pre-push/deploy gate this standard's deployment gates describe.
- `uds init` never overwrites a file that exists, and `uds update` never overwrites one either; for a project initialised earlier, `uds update` offers to write them (the prompt defaults to no; `uds update -y` answers it yes).
- With files staged they read only those files; with nothing staged (a CI run, a manual `uds check`) each walks the whole project — the walk stops at 200,000 files, and `uds check` gives each scanner 120 seconds (past that it reports "could not judge", never a pass) — so in a very large repository run them in CI rather than expecting them to be instant.
- A placeholder is *declared* by `STUB` or `COVERAGE_EXEMPT` on its line or the three above; a declared placeholder is reported once, as its marker.
- **Languages.** Test-file rules exist for JavaScript/TypeScript, Python, Java/Kotlin/Scala/C#, Go, Rust, Ruby, Elixir, PHP, Swift, Dart, Lua and C/C++. A test file in any **other** language is listed as "NOT scanned" — never counted as clean. Empty-function rules exist for JavaScript/TypeScript, Python, Go, Rust, Ruby and PHP; elsewhere markers and "not implemented" bodies are still found and the output says which languages had no empty-function rule.
- They read text; they do not run your tests. A helper that asserts under a name the scanner cannot recognise is reported as "no-assertion": name it `assert*` / `verify*` / `expect*`, or list its pattern under `assertionPatterns` in the policy file.
- Each run first checks itself against known fakes and known good tests; if that fails it exits `2` ("could not judge"), which is never a pass.

### Code changed without a test (`uds check`, on staged changes)

When files are staged for commit, `uds check` compares what changed:

- code files changed and **no test file** changed in the same commit → a warning that lists the code files;
- a changed file of a type UDS does not recognise → a warning that lists it and says how to classify it (never assumed fine, never blocks);
- a deletion is not a change that needs a test; a **pure rename** (git's `R100`) and a path matching an `exempt` entry are exempt, and the output records the reason.

With nothing staged (a CI run, a manual `uds check`) the diff check says nothing; the two scanners then look at the whole project.

### The policy file `.standards/test-policy.json` (optional)

Which paths are tests and which are code is data with defaults for the common ecosystems, not a list of frameworks. Every list **adds to** the defaults:

```json
{
  "mode": "warn",
  "testDirs": ["integration"],
  "testPatterns": ["*.itest.*"],
  "sourceExtensions": ["zig"],
  "nonCodeExtensions": ["gradle"],
  "ignore": ["generated/**"],
  "exempt": [{ "pattern": "src/gen/**", "reason": "generated by protoc" }],
  "assertionPatterns": ["\\bmustMatch\\w*\\s*\\("]
}
```

An `exempt` entry without a `reason` is not honored and is reported: an exemption must say why.

### Warn first, tighten later

`"mode": "warn"` (the default) prints and lets the commit through. `"mode": "block"` makes `uds check` exit non-zero — and so stops the commit — when a scanner finds something, a scanner cannot judge, or code changed without a test. A file type UDS does not recognise never blocks. **Not implemented yet** (the specification does not say where a baseline would live or what it counts): a ratchet on the number of unpaired changes, and a per-commit exemption reason (a pre-commit hook cannot read the commit message).

---

## Migration from Pyramid Model

If your project previously used pyramid thresholds:

1. **Delete** any hardcoded coverage thresholds from `jest.config.js` / `vitest.config.ts` (`coverageThreshold` option)
2. **Install** `.coverage-baseline.json` with current coverage as the starting ratchet
3. **Add** `scripts/check-coverage-ratchet.sh` to CI
4. **Add** `scripts/check-stubs.mjs` to deploy.sh and pre-push hook (written by `uds init`; `uds update` offers it to an existing project)
5. **Add** `scripts/check-anti-fake-tests.mjs` to pre-commit or CI (written by `uds init`; `uds check` already runs it and warns)

The ratchet starts at your current coverage. From that point on, it can only increase.

---

## Related Standards

- `testing.ai.yaml` — Test structure, FIRST principles, AAA pattern (pyramid thresholds deprecated here)
- `unit-testing.ai.yaml` — Unit test scope and organization
- `integration-testing.ai.yaml` — Integration test patterns
- `deployment-standards.ai.yaml` — Deploy gate requirements
- `flaky-test-management.md` — Intermittent-failure handling: a test that flakes is **not** a passing test. Before a coverage figure counts toward a gate, intermittent failures MUST be quarantined / retry-budgeted / root-caused per that standard — otherwise "full coverage" hides non-deterministic gaps.
- `behavior-snapshot.md` — Error-response differential oracle (Migration Error-Path Completeness, axis ⑨)
- `migration-assistant` skill — Legacy exception/error-code derive + degradation parity (XSPEC-288)
- XSPEC-178 — Full specification and implementation phases
- XSPEC-288 — Migration Error-Path Completeness (axis ⑨ of XSPEC-284 matrix)


**Scope**: universal
