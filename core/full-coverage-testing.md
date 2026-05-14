# Full Coverage Testing Standards

> **AI-optimized version**: `ai/standards/full-coverage-testing.ai.yaml`
> **XSPEC**: XSPEC-178
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

Assertions that always pass regardless of behavior provide false coverage.

```typescript
// ❌ FORBIDDEN — always passes, tests nothing
expect(true).toBe(true)
expect(result).toBeDefined()  // without specific value

// ✅ REQUIRED — verifies actual behavior
expect(result).toBe(90)
expect(result).toEqual({ discount: 10, total: 90 })
```

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

## Migration from Pyramid Model

If your project previously used pyramid thresholds:

1. **Delete** any hardcoded coverage thresholds from `jest.config.js` / `vitest.config.ts` (`coverageThreshold` option)
2. **Install** `.coverage-baseline.json` with current coverage as the starting ratchet
3. **Add** `scripts/check-coverage-ratchet.sh` to CI
4. **Add** `scripts/check-stubs.sh` to deploy.sh and pre-push hook
5. **Add** `scripts/check-anti-fake-tests.sh` to pre-commit or CI

The ratchet starts at your current coverage. From that point on, it can only increase.

---

## Related Standards

- `testing.ai.yaml` — Test structure, FIRST principles, AAA pattern (pyramid thresholds deprecated here)
- `unit-testing.ai.yaml` — Unit test scope and organization
- `integration-testing.ai.yaml` — Integration test patterns
- `deployment-standards.ai.yaml` — Deploy gate requirements
- XSPEC-178 — Full specification and implementation phases


**Scope**: universal
