# Structured Task Definition Standards

**Version**: 1.0.0
**Last Updated**: 2026-03-17
**Applicability**: All projects using AI-assisted development
**Scope**: universal
**Industry Standards**: Inspired by GSD (Get Shit Done) task structure
**References**: [GSD](https://github.com/gsd-build/get-shit-done)

---

## Summary

Structured Task Definition ensures that every AI task includes the minimum context needed for reliable execution. By requiring four mandatory fields — `read_first`, `action`, `acceptance_criteria`, and `verification` — this standard prevents hallucination, eliminates ambiguity, and ensures every task outcome is objectively verifiable.

---

## Quick Reference

| Aspect | Description |
|--------|-------------|
| **Core Principle** | Every task must be grounded, specific, testable, and verifiable |
| **Required Fields** | `read_first`, `action`, `acceptance_criteria`, `verification` |
| **Anti-Hallucination** | `read_first` establishes ground truth before execution |
| **Anti-Ambiguity** | `action` specifies exact files, line numbers, and operations |
| **Anti-Omission** | `acceptance_criteria` uses GWT format for completeness |
| **Anti-Subjectivity** | `verification` uses executable commands, not judgment |

---

## The Four Required Fields

### 1. `read_first` — Establish Ground Truth

A list of files that MUST be read before executing the task. This prevents the AI from hallucinating about code structure, API signatures, or project conventions.

**Purpose**: Build accurate mental model from actual code, not assumptions.

**Format**:
```yaml
read_first:
  - path: src/auth/login.js
    reason: Contains current login implementation
  - path: tests/auth/login.test.js
    reason: Existing test patterns to follow
  - path: docs/specs/SPEC-042.md
    reason: Approved specification for this change
```

**Rules**:
- All listed files must exist (verified before task execution)
- Include both implementation files and their tests
- Include the relevant spec document (if SDD is active)
- Include config files that affect behavior

### 2. `action` — Concrete Steps

A list of specific, unambiguous steps with exact file paths and line references. Eliminates vague instructions like "improve error handling" or "add validation."

**Purpose**: Remove all ambiguity about what to do and where to do it.

**Format**:
```yaml
action:
  - step: 1
    file: src/auth/login.js
    operation: modify
    location: "lines 42-58 (validateCredentials function)"
    description: Add rate limiting check before credential validation
    details: |
      Insert a call to rateLimiter.check(req.ip) before the
      existing validateCredentials() call. If rate limit exceeded,
      throw RateLimitError with 429 status.
  - step: 2
    file: tests/auth/login.test.js
    operation: add
    location: "after line 120 (end of 'validation' describe block)"
    description: Add rate limiting test cases
```

**Rules**:
- Each step specifies a single file and operation
- Operations are: `add`, `modify`, `delete`, `move`, `rename`
- Line numbers are approximate (may shift) but provide context
- No step should be "do whatever seems right"

### 3. `acceptance_criteria` — Measurable Completion Conditions

Criteria in Given/When/Then format that define when the task is complete. Each criterion maps to a verifiable outcome.

**Purpose**: Every condition is testable — no room for "it seems to work."

**Format**:
```yaml
acceptance_criteria:
  - id: AC-1
    given: A user has made 5 login attempts in the last minute
    when: They attempt a 6th login
    then: The system returns HTTP 429 with "Rate limit exceeded" message
  - id: AC-2
    given: A user has not exceeded the rate limit
    when: They attempt login with valid credentials
    then: Login succeeds as before (no regression)
```

**Rules**:
- Use GWT format (aligns with SDD and BDD standards)
- Each AC must be independently verifiable
- Include regression criteria (existing behavior preserved)
- Number criteria for traceability (AC-1, AC-2, etc.)

### 4. `verification` — Executable Checks

Commands or checks that objectively verify the task is complete. Uses `grep`, `test`, `ls`, `npm test`, or similar — never subjective judgment.

**Purpose**: Machine-verifiable outcomes eliminate "I think it looks good."

**Format**:
```yaml
verification:
  - command: "grep -n 'rateLimiter.check' src/auth/login.js"
    expect: "At least one match found"
  - command: "npm test -- tests/auth/login.test.js"
    expect: "All tests pass (exit code 0)"
  - command: "grep -c 'rate.limit' tests/auth/login.test.js"
    expect: "At least 2 test cases for rate limiting"
```

**Rules**:
- Every AC should have at least one verification command
- Prefer deterministic checks (grep, test, file existence) over semantic evaluation
- Include test execution as a verification step
- Failed verification = task is not complete

---

## Complete Task Example

```yaml
task:
  id: TASK-042
  title: Add rate limiting to login endpoint
  spec_ref: SPEC-042

  read_first:
    - path: src/auth/login.js
      reason: Current login implementation
    - path: src/middleware/rate-limiter.js
      reason: Existing rate limiter utility
    - path: tests/auth/login.test.js
      reason: Test patterns to follow
    - path: docs/specs/SPEC-042.md
      reason: Approved specification

  action:
    - step: 1
      file: src/auth/login.js
      operation: modify
      location: "validateCredentials function (line ~45)"
      description: Add rate limit check before credential validation
    - step: 2
      file: tests/auth/login.test.js
      operation: add
      location: "end of validation describe block"
      description: Add rate limiting test cases

  acceptance_criteria:
    - id: AC-1
      given: A user exceeds 5 login attempts per minute
      when: They attempt another login
      then: HTTP 429 returned with rate limit message
    - id: AC-2
      given: A user is within rate limits
      when: They login with valid credentials
      then: Login succeeds normally (no regression)

  verification:
    - command: "grep -n 'rateLimiter' src/auth/login.js"
      expect: "Rate limiter imported and used"
    - command: "npm test -- tests/auth/login.test.js"
      expect: "All tests pass"
```

---

## When to Apply

| Scenario | Apply Full Structure? | Notes |
|----------|----------------------|-------|
| New feature (SDD) | Yes | All 4 fields required |
| Bug fix | Yes | `read_first` includes bug report and affected code |
| Refactoring | Yes | `acceptance_criteria` focus on no-regression |
| Trivial changes | No | Typos, formatting — skip structure |
| Hotfixes | Partial | At minimum `read_first` + `verification` |

---

## Integration with SDD

When used with Spec-Driven Development:
- `read_first` includes the approved spec document
- `acceptance_criteria` are derived from the spec's AC section
- `verification` includes spec compliance checks
- Tasks are created during the Implementation phase

---

## Best Practices

### Do's

- Include regression criteria in every task
- Use exact file paths (verified by `read_first`)
- Keep tasks atomic (one logical change)
- Reference spec IDs when applicable

### Don'ts

- Don't use vague action descriptions ("improve", "enhance", "refactor")
- Don't skip `verification` — it's the most important field
- Don't assume file structure — always verify via `read_first`
- Don't create tasks without reading the target code first

---

## Related Standards

- [Spec-Driven Development](spec-driven-development.md) — Task structure integrates with SDD workflow
- [Anti-Hallucination Standards](anti-hallucination.md) — `read_first` implements evidence-based analysis
- [Testing Standards](testing-standards.md) — `verification` aligns with test pyramid
- [Check-in Standards](checkin-standards.md) — Tasks produce committable units of work

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-17 | Initial standard: 4 required fields (read_first, action, acceptance_criteria, verification) |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
