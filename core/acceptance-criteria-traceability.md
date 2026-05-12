# Acceptance Criteria Traceability Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/acceptance-criteria-traceability.md)

**Applicability**: All software projects using specification-driven or test-driven workflows
**Scope**: universal

---

## Overview

Acceptance Criteria Traceability Standards define how to track the relationship between Acceptance Criteria (AC), test implementations, and coverage status. This standard ensures every AC is verifiably tested and provides standardized reporting formats for coverage analysis.

## References

| Standard/Source | Content |
|----------------|---------|
| ISO/IEC/IEEE 29119-3 | Test Documentation — Traceability Matrix |
| IEEE 830 | Software Requirements Specification — Traceability |
| ISTQB Foundation | Requirements-based testing |
| INVEST Principles | Acceptance criteria quality |

---

## AC-to-Test Traceability Matrix

### Standard Matrix Format

| AC-ID | Test File | Test Name | Status | Notes |
|-------|-----------|-----------|--------|-------|
| AC-1 | `tests/auth.test.ts` | `should login with valid credentials` | ✅ covered | |
| AC-2 | `tests/auth.test.ts` | `should reject invalid credentials` | ✅ covered | |
| AC-3 | — | — | ❌ uncovered | Blocked by API dependency |
| AC-4 | `tests/auth.test.ts` | `should lock account after 5 failures` | ⚠️ partial | Missing edge case |

### Matrix Fields

| Field | Required | Description |
|-------|----------|-------------|
| `AC-ID` | Yes | Unique identifier from the specification (e.g., AC-1, AC-2) |
| `Test File` | Yes (if covered) | Path to the test file implementing this AC |
| `Test Name` | Yes (if covered) | Name of the test case or describe block |
| `Status` | Yes | Coverage status: `covered`, `partial`, `uncovered` |
| `Notes` | No | Additional context (blockers, dependencies, etc.) |

### Linking Convention

Tests MUST reference their source AC using standard annotations:

```typescript
// TypeScript/JavaScript
describe('AC-1: User login with valid credentials', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('should redirect to dashboard on successful login', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: User login with valid credentials
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

---

## Coverage Status Definitions

### Status Classification

| Status | Symbol | Definition | Criteria |
|--------|--------|-----------|----------|
| **Covered** | ✅ | AC is fully tested | All conditions in AC have corresponding test assertions |
| **Partial** | ⚠️ | AC is partially tested | Some conditions tested, but edge cases or paths missing |
| **Uncovered** | ❌ | AC has no tests | No test case references this AC |
| **Not Implemented** | 🚫 | AC has no corresponding implementation | Feature code does not exist (not a test gap — a code gap) |

### `not_implemented` vs `uncovered` Decision Tree

```
Q1: Does the corresponding code exist in src/?
  No → 🚫 not_implemented
  Yes → Q2: Does any test reference this AC?
    No → ❌ uncovered
    Yes → Q3: Are all conditions in the AC tested?
      Yes → ✅ covered
      No → ⚠️ partial
```

Typical signals of `not_implemented`: `throw new NotImplementedException()`, empty stub body, `// FEATURE_STUB:` marker.

### Coverage Calculation

```
AC Coverage % = (covered_count + partial_count × 0.5) / (total_ac_count - not_implemented_count) × 100

Where:
  covered_count = count of AC with status "covered"
  total_ac_count = total number of AC in specification
  not_implemented_count = count of AC with status "not_implemented" (excluded from denominator)
  partial counts as 0.5 for coverage calculation
```

### Example Calculation

```
SPEC-001: 20 AC total
  - 15 covered (✅)
  - 0 partial (⚠️)
  - 2 uncovered (❌)
  - 3 not_implemented (🚫)

Coverage = (15 + 0) / (20 - 3) × 100 = 88.2%
Status: BLOCKED by 3 not_implemented AC(s)
```

### CI Gate for `not_implemented`

`not_implemented` ACs trigger a **blocking** CI gate independent of the coverage percentage gate:

```
[AC-NOT-IMPL] 3 AC(s) marked not_implemented:
  🚫 AC-007  OrderCancellation
  🚫 AC-012  RefundCalculation
  🚫 AC-019  ExportToPDF
All not_implemented ACs must be resolved before UAT.
```

The gate clears only when all `not_implemented` ACs are updated to `uncovered`, `partial`, or `covered`.

---

## Quality Thresholds

### Default Thresholds

| Threshold | Value | Enforcement |
|-----------|-------|-------------|
| **Minimum AC Coverage** | 100% | Required for production release |
| **Minimum for Check-in** | 80% | Required for feature branch merge |
| **Warning Level** | 60% | Triggers coverage warning |

### Configurable Thresholds

Projects MAY customize thresholds in their configuration:

```json
{
  "acCoverage": {
    "minimum": 100,
    "checkinMinimum": 80,
    "warningLevel": 60,
    "partialWeight": 0.5
  }
}
```

### Threshold Exceptions

Exceptions to coverage requirements MUST be documented:

| Exception Type | When Allowed | Documentation Required |
|---------------|-------------|----------------------|
| External dependency blocker | Third-party API unavailable | Issue link + timeline |
| Infrastructure limitation | Test environment constraint | Workaround plan |
| Deferred to next iteration | Agreed with stakeholders | Ticket reference |

---

## AC Coverage Report Format

### Standard Report Structure

```markdown
# AC Coverage Report

**Specification**: SPEC-001 — User Authentication
**Generated**: 2026-03-18
**Coverage**: 75% (6/8 AC)

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Covered | 5 | 62.5% |
| ⚠️ Partial | 2 | 25.0% |
| ❌ Uncovered | 1 | 12.5% |

## Traceability Matrix

| AC-ID | Description | Status | Test Reference |
|-------|-------------|--------|----------------|
| AC-1 | Login with valid credentials | ✅ | auth.test.ts:15 |
| AC-2 | Reject invalid credentials | ✅ | auth.test.ts:32 |
| AC-3 | Rate limit login attempts | ⚠️ | auth.test.ts:48 (missing edge case) |
| ...   | ...                        | ... | ... |

## Gaps

### Uncovered AC
- **AC-8**: Social login integration — Blocked by OAuth provider sandbox

### Partial AC
- **AC-3**: Rate limit — Missing test for concurrent requests
- **AC-6**: Session timeout — Missing test for background tab behavior

## Action Items
1. [ ] AC-8: Set up OAuth sandbox environment (ETA: 2026-03-25)
2. [ ] AC-3: Add concurrent request test
3. [ ] AC-6: Add background tab test
```

### Machine-Readable Format

```json
{
  "specId": "SPEC-001",
  "specName": "User Authentication",
  "generatedAt": "2026-03-18T10:00:00Z",
  "coverage": {
    "percentage": 75,
    "covered": 5,
    "partial": 2,
    "uncovered": 1,
    "total": 8
  },
  "matrix": [
    {
      "acId": "AC-1",
      "description": "Login with valid credentials",
      "status": "covered",
      "testFile": "tests/auth.test.ts",
      "testName": "should login with valid credentials",
      "testLine": 15
    }
  ]
}
```

---

## Automatic Spec Generation Quality Rules

### AC Quality Requirements

When generating specifications automatically (from PRD, user stories, or requirements), the generated AC MUST meet these quality criteria:

| Criterion | Description | Validation |
|-----------|-------------|-----------|
| **Specific** | AC describes a concrete, observable behavior | No vague terms ("should work well", "fast enough") |
| **Measurable** | AC has quantifiable or verifiable outcome | Contains expected values, states, or behaviors |
| **Achievable** | AC is technically feasible | References known APIs, data, or capabilities |
| **Relevant** | AC relates to the feature's purpose | Maps to a user need or business requirement |
| **Testable** | AC can be verified by a test | Can be expressed as Given-When-Then |

### Spec Generation I/O Contract

#### Input Format

| Input Type | Required Fields | Example |
|-----------|----------------|---------|
| PRD | Title, Description, User Stories | Product Requirements Document |
| User Story | As a / I want / So that | "As a user, I want to login..." |
| Feature Brief | Feature name, Goals, Constraints | Feature description document |

#### Output Format

Generated spec MUST include:

| Section | Required | Description |
|---------|----------|-------------|
| SPEC ID | Yes | Unique identifier (e.g., SPEC-001) |
| Title | Yes | Feature name |
| Description | Yes | What the feature does |
| Acceptance Criteria | Yes | Numbered AC list (AC-1, AC-2, ...) |
| AC Format | Yes | Given-When-Then or structured bullet |
| Testability Flag | Yes | Each AC marked as testable/not-testable |

#### Validation Rules

1. **AC Count**: Generated spec MUST have at least 1 AC
2. **AC Uniqueness**: No duplicate AC descriptions
3. **AC Completeness**: Happy path + at least 1 error/edge case
4. **AC Testability**: 100% of AC must be testable
5. **Traceability**: Each AC links back to source requirement

---

## Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| Untraceable tests | Cannot verify spec coverage | Always annotate tests with AC-ID |
| Claiming partial as covered | False confidence in coverage | Use honest status classification |
| Ignoring uncovered AC | Gaps in verification | Track and plan coverage for all AC |
| AC without testability | Cannot be verified | Ensure all AC are testable |
| Coverage without assertions | Tests run but verify nothing | Check for meaningful assertions |
| Using `uncovered` for missing code | Hides functional completeness gap | Use `not_implemented` when code doesn't exist |
| Including `not_implemented` in denominator | Inflates coverage metric | Exclude `not_implemented` from denominator |

---

## Related Standards

- [Forward Derivation Standards](forward-derivation-standards.md) — Generating tests from AC
- [Spec-Driven Development](spec-driven-development.md) — AC definition format
- [Testing Standards](testing-standards.md) — Test implementation standards
- [Check-in Standards](checkin-standards.md) — Coverage gates for check-in
- [Test Governance](test-governance.md) — Completion criteria

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial version — traceability matrix, coverage calculation, spec generation rules |
| 1.1.0 | 2026-05-12 | Add `not_implemented` 4th status; update CI gate formula; add decision tree (XSPEC-199) |
