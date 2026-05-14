# Behavior Snapshot Standard

> **Language**: English | 繁體中文

**Applicability**: Migration and refactoring projects requiring behavioral parity verification
**Scope**: universal

---

## Overview

The Behavior Snapshot Standard defines a golden-file format for recording HTTP request/response pairs from an existing system. These snapshots serve two purposes:

1. **Migration parity baseline** — verify the new system reproduces the same behavior as the old system
2. **Refactoring characterization** — lock existing behavior before changing code (Gate 0 protocol)

## References

| Standard/Source | Content |
|----------------|---------|
| XSPEC-201 | Refactor/Migration Completeness Protocol |
| Michael Feathers: *Working Effectively with Legacy Code* | Characterization test concept |
| Golden Master Testing | Pattern for recording and replaying expected outputs |

---

## Snapshot File Format

### Location

```
.snapshots/<feature-id>/<scenario>.json
```

### Schema

```json
{
  "feature_id": "FM-007",
  "scenario": "happy_path",
  "request": {
    "method": "POST",
    "path": "/api/orders/123/cancel",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "reason": "customer_request"
    }
  },
  "response": {
    "status": 200,
    "body": {
      "success": true,
      "order_status": "cancelled",
      "refund_initiated": true
    }
  },
  "ignore_fields": ["refund_id", "cancelled_at"]
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `feature_id` | Yes | `FM-NNN` from feature-manifest.yaml |
| `scenario` | Yes | `snake_case` scenario name (`happy_path`, `not_found`, etc.) |
| `request.method` | Yes | HTTP method |
| `request.path` | Yes | URL path without base URL |
| `request.headers` | No | Headers needed for the request (no real auth tokens) |
| `request.body` | No | Request body (JSON) |
| `response.status` | Yes | Expected HTTP status code |
| `response.body` | Yes | Expected response body (fields to compare) |
| `ignore_fields` | No | Fields to skip during comparison (see guidance below) |

---

## Directory Structure

```
.snapshots/
  FM-001-UserLogin/
    happy_path.json
    invalid_credentials.json
    account_locked.json
  FM-007-OrderCancellation/
    happy_path.json
    order_not_found.json
    order_already_cancelled.json
    MANUAL-refund_webhook.json     ← manually authored
```

### MANUAL- Prefix

Files prefixed `MANUAL-` contain snapshots that cannot be automatically recorded:
- Webhook endpoints triggered by third parties
- Scenarios requiring specific, hard-to-reproduce database state
- Background job / queue-triggered flows (non-HTTP entry points)

`MANUAL-` files are excluded from automated replay but are counted in coverage reporting.

---

## `ignore_fields` Guidance

### Always Ignore (Non-Deterministic)

| Field Pattern | Reason |
|--------------|--------|
| `created_at`, `updated_at`, `timestamp` | Changes every request |
| `token`, `session_id`, `csrf_token` | Cryptographically random |
| `request_id`, `trace_id`, `correlation_id` | Random UUID |

### Always Compare (Business Logic)

| Field Pattern | Reason |
|--------------|--------|
| `status`, `code`, `message`, `error_code` | Core business outcome |
| `order_status`, `payment_status` | State machine result |
| `amount`, `quantity`, `price` | Calculated business value |
| `success`, `refunded`, `cancelled` | Boolean business outcome |
| `user_id`, `order_id` (with fixed test data) | Referential integrity |

**Rule**: `ignore_fields` is for legitimately non-deterministic values. Using it to hide business logic differences defeats the purpose of parity testing.

---

## Parity Check Tool

Run `scripts/parity-check.ts` to replay all snapshots against a target system:

```bash
npx tsx scripts/parity-check.ts --url http://new-system:8080 [--snapshots .snapshots] [--env uat|staging]
```

### Output

```
🔄 Parity Check — 119 snapshots against http://new-system:8080

  ✅ FM-001 / happy_path
  ✅ FM-001 / invalid_credentials
  ❌ [PARITY-FAIL] FM-007 / happy_path
      body.order_status: expected "cancelled", got "pending"
      body.refund_initiated: expected true, got false

─────────────────────────────────
Parity Results: 118/119 passed (99.2%)

❌ 1 parity check(s) failed.
[PARITY-BLOCK] UAT/production deployment blocked. Fix parity failures first.
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All snapshots pass |
| 1 | Failures found + `--env uat` or `production` → deployment blocked |
| 2 | Failures found + `--env staging` → warning only |

---

## Gate 0: Characterization Test Protocol (Refactoring)

Before starting any refactoring, characterization tests must exist and pass.

### What Are Characterization Tests?

Characterization tests record what the existing code *actually does* — not what it *should* do. They lock observable behavior before changes begin. If a characterization test fails during refactoring, it signals unintended behavior change.

```typescript
describe('characterization: OrderService.cancelOrder', () => {
  // @characterization
  it('returns status cancelled and sets refund_initiated=true for valid order', async () => {
    const result = await orderService.cancelOrder('test-order-123', 'customer_request');
    expect(result.order_status).toBe('cancelled');
    expect(result.refund_initiated).toBe(true);
  });
});
```

### Gate 0 Enforcement

1. **Before first refactoring commit**: Run `npm test -- --grep characterization`
   - Any failure → STOP. Fix the existing code before changing it.
2. **During refactoring**: Every commit re-runs characterization tests
   - Any failure → immediate warning of behavior drift
3. **Gate 2 (completion)**: All characterization tests pass → refactoring complete

### Anti-Pattern Warning

> Never start refactoring without Gate 0. Once you start changing code, it becomes impossible to tell whether a test failure is "I broke something" or "the test was wrong about old behavior."

---

## Integration with Migration Pipeline

### Gate 1 Pre-Flight (`--variant migration`)

Before `/vo-pipeline --variant migration`:
1. `artifacts/feature-manifest.yaml` must exist
2. `.snapshots/` must contain at least one snapshot per feature

### Parity Gate (Before UAT)

After all features are implemented, run parity check:
- 100% pass rate required (excluding `MANUAL-` files)
- Any failure blocks UAT promotion

---

## Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| Overusing `ignore_fields` | Business logic differences hidden | Only ignore non-deterministic fields |
| Skipping MANUAL snapshots | Untested webhook/background behavior | Author MANUAL snapshots before UAT |
| Recording snapshots from broken system | Wrong baseline | Verify old system behavior before recording |
| Characterization tests without `@characterization` | Gate 0 can't find them | Always annotate with `@characterization` |
| Starting refactoring before Gate 0 | Behavior drift undetectable | Run characterization tests first, always |

---

## Related Standards

- [Feature Manifest Standard](feature-manifest-standard.md) — FM-NNN schema for manifest features
- [Acceptance Criteria Traceability](acceptance-criteria-traceability.md) — `not_implemented` AC status
- [Refactoring Standards](refactoring-standards.md) — Characterization test requirements
- [Testing Standards](testing-standards.md) — Test implementation standards

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | Initial version — snapshot schema, parity gate, Gate 0 characterization protocol (XSPEC-201) |
