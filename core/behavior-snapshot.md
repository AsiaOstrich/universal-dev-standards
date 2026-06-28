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

> **Core principle — ignore the _value_, keep the _format_ assertion.** A field being non-deterministic means its *value* changes between runs; it does **not** mean the field's *shape* may change freely. The naive use of `ignore_fields` drops the whole field from comparison, which also stops asserting its format — so a serializer that silently turns an ISO-8601 timestamp into a Unix epoch, drops the timezone, or changes UUID casing/version passes unnoticed. **Ignore the value; still assert the format.**

### Ignore Value vs. Ignore Format

| Field | Naive: whole-field ignore | Recommended: ignore value, assert format |
|-------|---------------------------|-------------------------------------------|
| `created_at` | not compared at all | value ignored; assert it is still ISO-8601 with the same fractional-second precision and the same timezone representation |
| `trace_id` | not compared at all | value ignored; assert it still matches the UUID version and canonical 8-4-4-4-12 shape |
| `token` | not compared at all | value ignored; assert length, charset, and prefix |

### Non-Deterministic Fields: Ignore Value, Assert Format

| Field Pattern | Ignore (the value) | Still assert (format / shape) |
|--------------|--------------------|-------------------------------|
| `created_at`, `updated_at`, `timestamp` | the instant | ISO-8601 vs. epoch vs. custom; fractional-second precision (number of digits); timezone representation (`Z` vs `+00:00` vs offset) |
| `token`, `session_id`, `csrf_token` | the random bytes | length, charset, prefix |
| `request_id`, `trace_id`, `correlation_id` | the random UUID | UUID version + canonical 8-4-4-4-12 shape and casing |

**Timestamp example.** A migrated endpoint returns `created_at`:

```text
old system: "2026-05-12T08:30:00Z"
new system: "2026-05-12T08:30:00.000+00:00"
```

Both decode to the same instant, so a whole-field ignore — and even a value comparison after parsing to a date — passes. But the **serialized format drifted**: fractional seconds appeared and the timezone representation changed from `Z` to `+00:00`. Clients that string-match, or parse with a strict format, break in production. Asserting the format pattern (e.g. `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$`) catches this; ignoring the whole field hides it.

### Always Compare (Business Logic)

| Field Pattern | Reason |
|--------------|--------|
| `status`, `code`, `message`, `error_code` | Core business outcome |
| `order_status`, `payment_status` | State machine result |
| `amount`, `quantity`, `price` | Calculated business value |
| `success`, `refunded`, `cancelled` | Boolean business outcome |
| `user_id`, `order_id` (with fixed test data) | Referential integrity |

### Whole-Field Ignore (Exception — Requires Justification)

Dropping a field from comparison entirely — no value **and** no format assertion — is an **exception**, not the default. Reserve it for fields whose format is genuinely unspecified or irrelevant (e.g. an opaque vendor blob), and document the reason inline.

> ⚠️ **Risk**: whole-field ignore masks **format drift**. A timestamp that changes precision or timezone, a UUID that changes version, or a number that gains or loses a trailing zero will pass silently — the exact class of bug parity testing exists to catch.

**Rule**: `ignore_fields` is for legitimately non-deterministic *values*. Ignore the value while still asserting the field's format/shape. Using it to drop business-logic fields — or to silence format drift on non-deterministic fields — defeats the purpose of parity testing.

---

## Serialization-Format Parity

A differential oracle that compares only **deserialized objects** silently normalizes serialization-level differences away: it parses both responses into maps/objects and compares those, so any divergence that disappears on parse is invisible. To catch serialization bugs, the oracle must compare at a granularity that preserves the serialized form — either compare the **raw serialized string**, or explicitly assert the JSON shape.

### What a Parsed-Object Compare Hides

| Serialization divergence | Hidden when you compare parsed objects? |
|--------------------------|------------------------------------------|
| `1` vs `1.0` (number format) | Yes — both parse to the number `1` |
| `null` vs a missing key | Yes — both read as absent/null |
| `true` vs `1` vs `"true"` | Often — after type coercion |
| Key ordering | Yes — object keys are unordered |
| Leading zeros / scientific notation | Yes — normalized on parse |
| Whitespace and Unicode escaping (`\/`, `\uXXXX`) | Yes — lost on parse |

### Two Strategies

1. **Raw-string comparison** — compare the exact serialized string. Strongest fidelity; use it when the wire format is part of the contract (public APIs, cached payloads, signed bodies).
2. **Explicit JSON-shape assertions** — when raw compare is too strict (e.g. legitimately non-deterministic values), assert the shape explicitly:
   - **key presence and order** (when order is contractual)
   - **number format**: `1` vs `1.0`, leading zeros, scientific notation
   - **`null` vs absent key** (an omitted field is not the same as an explicit `null`)
   - **boolean/string type**: `true` vs `"true"` vs `1`

### Cross-Language Rewrites Change the Serializer

When a system is rewritten in another language, the serializer changes — and serializers differ in their **defaults**. The oracle must assert these explicitly, because nothing else will. Common PHP `json_encode` ↔ C# `System.Text.Json` default differences:

| Concern | PHP `json_encode` (default) | C# `System.Text.Json` (default) |
|---------|------------------------------|----------------------------------|
| Number trailing zeros | `(float) 1.0` emits `1`; `JSON_PRESERVE_ZERO_FRACTION` is needed to keep `1.0` | `double` `1.0` serializes as `1`; `decimal` preserves scale |
| Date / time | no native date type — app-defined (often a custom string or epoch) | `DateTime`/`DateTimeOffset` → ISO-8601 (round-trip "O"), e.g. `2026-05-12T08:30:00+00:00` |
| Timezone | app-defined | `DateTimeOffset` keeps the offset; `DateTime.Kind` decides `Z` vs offset |
| `null` properties | included as `"k":null` | included by default; omitted only with `DefaultIgnoreCondition.WhenWritingNull` |
| Key ordering | insertion order (associative array) | property-declaration / reflection order |
| Slash and Unicode escaping | escapes `/` and non-ASCII unless `JSON_UNESCAPED_SLASHES` / `JSON_UNESCAPED_UNICODE` | does not escape `/`; escapes non-ASCII per the configured encoder |

### Asserting the Serialized Shape (TypeScript)

```typescript
// Beyond value parity: assert the serialized form, not just the parsed object.
function assertSerializationParity(oldRaw: string, newRaw: string): void {
  // 1. Strongest: exact serialized string (after stripping only ignored *values*).
  if (oldRaw === newRaw) return;

  // 2. Otherwise assert shape explicitly on the raw text, not on JSON.parse():
  //    number format — a "1.0" in old must not silently become "1" in new
  const numberShape = (s: string) => s.match(/:\s*-?\d+(\.\d+)?([eE][+-]?\d+)?/g) ?? [];
  expect(numberShape(newRaw)).toEqual(numberShape(oldRaw));

  //    null vs missing — an explicit "key":null must not disappear
  expect(/"refund_id"\s*:\s*null/.test(newRaw))
    .toBe(/"refund_id"\s*:\s*null/.test(oldRaw));
}
```

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
| Comparing only the deserialized object | Serialization-format bugs (number format, `null` vs missing key, key order, type coercion) are normalized away on parse | Compare the raw serialized string, or assert the JSON shape explicitly (see Serialization-Format Parity) |
| Whole-field `ignore_fields` on a non-deterministic field | Masks the field's **format** drift (timestamp precision/timezone, UUID version) | Ignore the value but still assert the format/shape (see `ignore_fields` Guidance) |
| Characterization tests without `@characterization` | Gate 0 can't find them | Always annotate with `@characterization` |
| Starting refactoring before Gate 0 | Behavior drift undetectable | Run characterization tests first, always |

---

## Related Standards

- [Feature Manifest Standard](feature-manifest-standard.md) — FM-NNN schema for manifest features
- [Acceptance Criteria Traceability](acceptance-criteria-traceability.md) — `not_implemented` AC status
- [Refactoring Standards](refactoring-standards.md) — Characterization test requirements
- [Testing Standards](testing-standards.md) — Test implementation standards
- [Data Migration Testing](data-migration-testing.md) — same "don't compare what merely *looks* equal" principle, applied at the DB storage layer (byte/codepoint encoding) rather than the oracle/serialization layer

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | Initial version — snapshot schema, parity gate, Gate 0 characterization protocol (XSPEC-201) |
| 1.1.0 | 2026-06-28 | Comparison-fidelity additions (XSPEC-306) — `ignore_fields` rewritten to "ignore value, assert format"; new Serialization-Format Parity section (raw vs. JSON-shape assertions, PHP↔C# serializer defaults); 2 format-masking anti-patterns; cross-ref to data-migration-testing |
