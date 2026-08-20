# Reverse Engineering Standards | 反向工程標準

**Version**: 1.3.0
**Last Updated**: 2026-08-20
**Applicability**: All projects requiring code-to-specification transformation
**Scope**: uds-specific
**Industry Standards**: IEEE 830-1998, SWEBOK v4.0 Chapter 9

> **Language**: [English](../core/reverse-engineering-standards.md) | [繁體中文](../locales/zh-TW/core/reverse-engineering-standards.md)

---

## Purpose

This standard defines the principles, workflows, and best practices for reverse engineering existing code into structured specification documents. Reverse engineering bridges legacy systems with modern development methodologies (SDD → BDD → TDD).

**Key Benefits**:
- Transform undocumented code into traceable specifications
- Enable modern development practices on legacy systems
- Create shared understanding between new team members and existing codebases
- Establish foundation for future enhancements and refactoring

---

## Reverse Engineering Workflow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Reverse Engineering Workflow                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ Code Scan   │───▶│Test Analysis│───▶│Gap Identify │───▶│ Spec Gen  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘  │
│        │                  │                  │                  │        │
│        │                  │                  │                  ▼        │
│        │                  │                  │         ┌───────────────┐ │
│        │                  │                  │         │ Human Review  │ │
│        │                  │                  │         └───────────────┘ │
│        │                  │                  │                  │        │
│        ▼                  ▼                  ▼                  ▼        │
│   [Confirmed]        [Confirmed]        [Unknown]         [Validated]    │
│   from code          from tests         for humans        specification  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Workflow Stages

| Stage | Description | Output | Certainty Level |
|-------|-------------|--------|-----------------|
| **Code Scanning** | Analyze code structure, APIs, data models | Technical inventory | [Confirmed] |
| **Test Analysis** | Parse existing tests for acceptance criteria | Draft acceptance criteria | [Confirmed]/[Inferred] |
| **Implicit Rule Scan** | Scan non-HTTP persistence write paths for undocumented rules | Implicit-rule inventory + three-question answers | [Confirmed]/[Inferred]/[Unknown] |
| **Auth Scope Extraction** | Extract every query predicate that bounds results by the operator's own identity | Self-scoping predicate inventory + required negative tests | [Confirmed]/[Inferred]/[Unknown] |
| **Gap Identification** | List unknowns requiring human input | Gap analysis document | [Unknown] items |
| **Spec Generation** | Generate draft specification | Draft SPEC-XXX.md | Mixed certainty |
| **Human Review** | Stakeholder validation and gap filling | Validated specification | [Confirmed] |

> **Note (v1.3.0)**: An **Auth Scope Extraction** stage runs alongside Implicit Rule Scan — see [Auth Scope Extraction (Self-Referential Query Predicates)](#auth-scope-extraction-self-referential-query-predicates) below. Implicit Rule Scan covers rules that are invisible because they run **off** the request path. This stage covers a rule that is invisible while sitting **on** a fully-exercised request path: a `WHERE` predicate that bounds results by the operator's own identity. It reads as one filter among several, and a rewrite that drops it returns data of exactly the right shape — belonging to everyone.
>
> **Note (v1.2.0)**: An **Implicit Rule Scan** stage is inserted after Code Scanning / Test Analysis and before Gap Identification — see [Implicit Rule Scan (Non-HTTP Persistence Rules)](#implicit-rule-scan-non-http-persistence-rules) below. Standard code scanning extracts HTTP entry points and data models, but persistent field values are frequently written by **non-HTTP paths** (cron, queue, computed columns, triggers, ORM hooks) whose business rules are never documented — the highest-frequency source of missed logic in a cross-language rewrite or cross-DB migration.

---

## Implicit Rule Scan (Non-HTTP Persistence Rules)

> **Workflow position**: after Code Scanning / Test Analysis, before Gap Identification.

Code scanning extracts what is reachable through HTTP — routes, controllers, request handlers. But a persisted field's value is often decided **off the request path**: a nightly cron flips a status, a queue retry re-stamps a timestamp, a database trigger derives a total, an ORM lifecycle hook zeroes a counter. Those rules are rarely written down, so a rewrite that only mirrors the HTTP surface silently drops them. This stage mechanically derives every non-HTTP write path and locks each implicit rule as a verifiable artifact.

### Derive (mechanical list source)

Scan the legacy system for every **non-HTTP persistence write path** across four categories:

1. **Scheduled** — crontab entries, scheduler config, `@Scheduled`-style annotations, batch jobs
2. **Queue** — queue consumers, job handlers, background workers, message listeners
3. **DB-layer** — triggers, computed/generated columns, `DEFAULT` expressions, check constraints
4. **ORM lifecycle** — `beforeSave`/`afterSave`/observer/model-event hooks, middleware that mutates persistent state

### Oracle (detect) — three questions per field

For each persistent field written by a non-HTTP path, answer and lock **three questions**:

| Question | What to capture |
|----------|-----------------|
| **When is it SET?** | The condition/trigger that first assigns the value |
| **When is it OVERWRITTEN?** | Every later write — **including asynchronous overwrites** (links back to post-cutover aggregate reconciliation) |
| **When is it RESET / zeroed?** | The conditions that clear or default the value back |

- Extend the **Devil's Advocate** challenge from the HTTP layer to **cover non-HTTP paths**: apply the same five adversarial categories (boundary, ordering, concurrency, failure/retry, null/default) to cron conditions, queue retries, computed columns, and trigger logic.
- Tag every extracted rule with a certainty level: `[Confirmed]` (with a `file:line` citation) / `[Inferred]` / `[Unknown]`. Every `[Unknown]` is handed to Gap Identification for a human — it is never guessed.
- **Output**: lock each implicit rule as a **behavior-snapshot scenario** or a **reconciliation invariant** (e.g. `SUM(cost) GROUP BY status` must hold across cutover), so the rule becomes a re-runnable oracle rather than prose.

### Gate timing

Pre-flight (planning). Any non-HTTP write field whose three questions are unanswered is marked `not_implemented` and **blocks cutover** — an undeclared implicit rule is treated as a known omission risk, not an acceptable gap.

### PHP-specific note: loose comparison / type juggling

When scanning PHP write paths, additionally flag **loose-comparison / type-juggling** dependencies: `==` comparisons, the truthy/falsy behavior of `"0"` / `""` / `null` / `0`, and automatic string-to-number coercion. These have no direct equivalent under a strongly-typed target (e.g. C#/.NET), so the implicit rule they encode is a high-frequency source of silently-dropped logic during a cross-language rewrite. Mark each such site `[Confirmed]` with `file:line` and lock the intended semantics as an explicit rule.

---

## Auth Scope Extraction (Self-Referential Query Predicates)

> **Workflow position**: alongside Implicit Rule Scan — after Code Scanning / Test Analysis, before Gap Identification.

A **self-referential predicate** is a query condition that bounds the result set by *who is asking*: `WHERE tenant_id = :current_user_tenant`, `WHERE owner = :uid`, `WHERE dept_id = (SELECT dept_id FROM member WHERE account = :uid)`. It is the line that turns "list the accounts" into "list **your** accounts".

The question this stage answers is narrow and mechanical:

> **For every predicate in the legacy code that bounds results by the operator's own identity, does the ported code have an equivalent predicate?**

Not "does it return the same shape". Not "does it return data". An **equivalent predicate**: the same field, bound to the same notion of *self*.

### Why this needs its own stage

Authorization is not a missing concern — any competent test taxonomy already names cross-tenant access as something to test. The concern does not go missing; **it goes un-recalled**. Three properties make this specific defect survive every gate that would normally catch it:

1. **The security-critical line looks like a filter.** The boundary lives inside a `WHERE` clause, not in the request or response contract. Someone porting "get all accounts" sees a `SELECT` and a `JOIN`; the tenant predicate reads as one more condition among several.
2. **Shape-based assertions cannot see scope.** A test that calls the endpoint as some valid administrator and asserts `200` plus a non-empty list passes **identically** whether the scoping is correct or deleted outright. Contract tests, parity snapshots and response-DTO comparisons are all blind here by construction: the response is well-formed either way. It just belongs to everybody.
3. **A shared resolver existing is not the same as this call site using it.** Codebases that have already been burned once typically grow a shared scope-resolver utility. A new or overlooked call site can reimplement the query from scratch and never call it — and the presence of the utility elsewhere is then actively misleading, because it reads as coverage.

### Derive (mechanical list source)

Enumerate candidate predicates by scanning the legacy data-access layer — do not work from recall. Adapt the patterns to the stack; the target is any condition whose right-hand side resolves to **the caller's own value**:

| Signal | Examples |
|--------|----------|
| **Direct self-binding** | `WHERE <col> = :currentUser` / `:uid` / `$operatorId` / `session.user_id` |
| **Tenant / org / owner columns** | `tenant_id`, `org_id`, `master_account`, `owner_id`, `dept_id`, `company_id` compared against a caller-derived value |
| **Subquery resolving the caller's scope** | `WHERE dept_id = (SELECT dept_id FROM member WHERE account = :uid)` |
| **Role-branched query construction** | Branches on `role` / `account_type` where **each branch** applies a different scope — enumerate every branch, not just the one exercised by the happy path |
| **Scope applied outside SQL** | ORM global scopes, query-builder mixins, repository base classes, row-level-security policies, middleware that injects a filter |

The last row matters: a predicate can be enforced by something the `SELECT` statement never mentions. A grep over SQL alone will report a **smaller** set than exists, and a smaller set here reads exactly like a safer one.

### Record (per match)

For every candidate, record — `[Confirmed]` requires a `file:line` citation:

| Field | Content |
|-------|---------|
| **Location** | `file:line` in the legacy source |
| **Predicate** | The exact condition text |
| **Self-binding** | Which caller-derived value it resolves to, and how that value is obtained |
| **Triggering branch** | Which role / parameter / code path reaches this predicate |
| **Certainty** | `[Confirmed]` / `[Inferred]` / `[Unknown]` |

Every `[Unknown]` — a scope you cannot determine from the code — goes to Gap Identification for a human. It is never guessed, and never assumed absent.

### Oracle (detect) — predicate equivalence, per call site

For each recorded predicate, verify in the ported code:

1. **A literal equivalent exists** — the same field, bound to the same notion of self. A different field that "happens to give the same rows for current data" is not equivalent; it is a coincidence with an expiry date.
2. **Every branch is covered.** If the legacy scoped differently per role, each branch needs its own verified equivalent. A port that collapses five role-branches into one coarse "is this an administrator?" check has replaced a boundary with a permission.
3. **This call site invokes the shared resolver.** If the new system centralises scoping in a utility, confirm **this** call site actually calls it. The utility's existence elsewhere in the codebase is not evidence about this endpoint.

### Mandatory negative test

**Rule RE-AUTH-001 (Required)** — Every confirmed self-scoping predicate MUST be locked by a **negative test**: operator **A** issues the request, and the assertion is that operator **B**'s records are **absent** from the response. Both A and B are valid, authenticated, and authorized to use the endpoint.

The assertion must be about **absence**. A test asserting `200`, or a non-empty list, or a matching response schema, is not sufficient evidence and MUST NOT be counted as coverage for this predicate — each of those passes with the scoping clause deleted.

A useful self-check before trusting the test: **delete the scoping predicate in a scratch copy and re-run.** If the test still passes, it is not testing scope, whatever its name says.

### Gate timing

Pre-flight (planning) for extraction; pre-UAT for the negative tests.

**Rule RE-AUTH-002 (Required)** — Any self-scoping predicate whose ported equivalent is unverified, or which has no negative test, is marked `not_implemented` and **blocks cutover**. An unverified authorization boundary is a known omission risk, not an acceptable gap — the failure mode is cross-tenant disclosure, and it ships green.

> **Provenance.** This stage was derived from a real PHP → C# migration in which a tenant-scoped account-listing endpoint lost its isolation predicate during the rewrite. The port replaced per-role scoping with a coarse "is this account any enabled administrator?" check and returned every account in the database regardless of which tenant asked. It shipped, it passed every existing test — the method had none — and it was found when a customer reported seeing account information that should not have been there.

---

## Core Principles

### 1. Certainty Framework

All extracted information MUST be tagged with certainty levels:

| Tag | Definition | Example |
|-----|------------|---------|
| `[Confirmed]` | Directly verified from code or tests | "POST /api/users endpoint at src/routes/users.ts:15" |
| `[Inferred]` | Logical deduction from observed patterns | "Likely uses dependency injection based on constructor pattern" |
| `[Assumption]` | Reasonable assumption needing verification | "Sessions probably expire after 24 hours based on typical patterns" |
| `[Unknown]` | Cannot determine from code, requires human input | "Business motivation for this feature" |

**Rule**: When in doubt, use a more uncertain tag rather than overclaiming.

### 2. Anti-Hallucination Compliance

This standard strictly follows [Anti-Hallucination Standards](anti-hallucination.md):

- **Evidence-Based**: Only analyze content that has been explicitly read
- **Source Attribution**: Every claim must include `[Source: Code]` or `[Source: Test]` with file:line references
- **No Fabrication**: Never invent APIs, configurations, or requirements without verification
- **Explicit Unknowns**: Always list what cannot be determined from code

### 3. Progressive Disclosure

Extract information in layers:

1. **System Overview**: Entry points, main components, high-level architecture
2. **Component Details**: Individual modules, their responsibilities, interfaces
3. **Implementation Specifics**: Algorithms, data flows, edge cases

### 4. Test-to-Requirement Mapping

Existing tests are valuable sources of implicit requirements:

```javascript
// Test: src/tests/auth.test.ts
describe('Authentication', () => {
  it('should return 401 for invalid credentials', () => {...});
  it('should issue JWT token on successful login', () => {...});
});
```

Maps to:

```markdown
## Acceptance Criteria
[Confirmed] From test analysis (src/tests/auth.test.ts):
- [ ] Return 401 status code for invalid credentials (line 3)
- [ ] Issue JWT token on successful login (line 4)
```

---

## What Can vs Cannot Be Extracted

### Extractable (AI Automated)

| Aspect | Certainty | Source |
|--------|-----------|--------|
| API Endpoints | [Confirmed] | Route definitions, controllers |
| Data Models | [Confirmed] | Types, interfaces, schemas |
| Function Signatures | [Confirmed] | Parameters, return types |
| Test Cases | [Confirmed] | Test files → Acceptance Criteria |
| Dependencies | [Confirmed] | Package references, imports |
| Configuration Patterns | [Confirmed] | Config files |
| Behavior Patterns | [Inferred] | Code analysis |

### Not Extractable (Requires Human Input)

| Aspect | Why | Required Action |
|--------|-----|-----------------|
| **Motivation/Why** | Historical context not in code | Ask stakeholders |
| **Business Context** | Domain knowledge | Ask product owner |
| **Risk Assessment** | Requires domain expertise | Consult domain experts |
| **Trade-off Decisions** | Historical context missing | Review design docs if any |
| **Non-Functional Requirements** | Often implicit | Discuss with architects |
| **Out-of-Scope Decisions** | Explicitly excluded items | Review original requirements |

---

## Integration with Development Methodologies

### Reverse Engineering Pipeline

```
┌───────────────────────────────────────────────────────────────────────┐
│                   Reverse Engineering → Forward Development            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Existing                                                            │
│   Code + Tests                                                        │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ Reverse Engineering (This Standard)                          │    │
│   │   • Code Scanning → Technical Inventory                      │    │
│   │   • Test Analysis → Acceptance Criteria                      │    │
│   │   • Gap Identification → [Unknown] List                      │    │
│   └─────────────────────────────────────────────────────────────┘    │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ SDD (Spec-Driven Development)                                │    │
│   │   • Reverse-engineered spec = Proposal Draft                 │    │
│   │   • Fill [Unknown] sections → Complete Proposal              │    │
│   │   • Formal Review → Approved Specification                   │    │
│   └─────────────────────────────────────────────────────────────┘    │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ BDD (Behavior-Driven Development)                            │    │
│   │   • Acceptance Criteria → Gherkin Scenarios                  │    │
│   │   • Stakeholder Validation                                   │    │
│   └─────────────────────────────────────────────────────────────┘    │
│       │                                                               │
│       ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │ TDD (Test-Driven Development)                                │    │
│   │   • Gherkin → Unit Test Requirements                         │    │
│   │   • Gap Analysis → Missing Test Coverage                     │    │
│   └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### SDD Integration

Reverse-engineered specifications feed directly into SDD workflow:

1. **Output = SDD Proposal Draft**: The generated specification becomes a proposal
2. **Human Review Required**: All `[Unknown]` sections MUST be filled by humans
3. **Formal Approval**: Spec must go through standard SDD review process
4. **Status Tracking**: Mark as "Reverse-Engineered" in spec metadata

### BDD Integration

Convert acceptance criteria to Gherkin format:

```markdown
## Acceptance Criteria (from reverse engineering)
[Confirmed] User can add item to empty cart
[Confirmed] Quantity increments for duplicate items
[Inferred] Maximum quantity limit: 99 items
```

Becomes:

```gherkin
Feature: Shopping Cart
  # Source: Reverse-engineered from src/cart/

  Scenario: Add item to empty cart
    Given an empty shopping cart
    When the user adds "Widget" to the cart
    Then the cart should contain 1 "Widget"

  Scenario: Add duplicate item
    Given a cart with 1 "Widget"
    When the user adds another "Widget"
    Then the cart should contain 2 "Widget"

  @needs-confirmation
  Scenario: Maximum quantity limit
    Given a cart with 99 "Widget"
    When the user tries to add another "Widget"
    Then the add should be rejected
    # [Inferred] - Verify with stakeholders
```

### TDD Integration

Use reverse-engineered specifications to identify test coverage gaps:

1. **Map Existing Tests**: Link tests to acceptance criteria
2. **Identify Gaps**: Find criteria without corresponding tests
3. **Prioritize**: Focus on high-risk untested behaviors
4. **Write Tests**: Use TDD workflow for new test coverage

---

## Specification Template for Reverse Engineering

```markdown
# [SPEC-XXX] [Feature Name] - Reverse Engineered

## Metadata
- **Status**: Draft (Reverse-Engineered)
- **Source**: [directory or file path]
- **Generated**: [date]
- **Reviewed By**: [pending]

## Summary
[Brief description - [Inferred] or [Confirmed]]

## Motivation
[Unknown] - Requires human input
- Why was this feature originally built?
- What problem does it solve?

## Technical Design

### API Endpoints
[Confirmed] From code analysis:
- `POST /api/resource` - [Source: Code] src/routes/resource.ts:15
- `GET /api/resource/:id` - [Source: Code] src/routes/resource.ts:25

### Data Models
[Confirmed] From type definitions:
- `Resource` interface - [Source: Code] src/types/resource.ts:5-20

### Dependencies
[Confirmed] From import analysis:
- Database: PostgreSQL (knex client)
- Cache: Redis

## Acceptance Criteria
[Confirmed] From test analysis (src/tests/resource.test.ts):
- [ ] Create resource with valid data (line 10)
- [ ] Return 400 for invalid input (line 25)
- [ ] Return 404 for non-existent resource (line 40)

[Unknown] Not covered by tests:
- [ ] [Need Confirmation] Rate limiting behavior
- [ ] [Need Confirmation] Cache invalidation strategy

## Risks
[Unknown] - Requires domain expertise

## Out of Scope
[Unknown] - Requires historical context

## Source Citations
| Item | File | Line | Certainty |
|------|------|------|-----------|
| POST /api/resource | src/routes/resource.ts | 15 | [Confirmed] |
| Resource interface | src/types/resource.ts | 5-20 | [Confirmed] |
| 400 on invalid | src/tests/resource.test.ts | 25 | [Confirmed] |
```

---

## Failure Handling & Escalation

Reverse engineering infers intent from existing code; some inputs cannot be
analyzed safely. This section defines the failure → escalate → re-verify path so
a low-confidence or unparseable input never produces a spec that looks
authoritative.

| Condition | Trigger | Action | Re-verify |
|-----------|---------|--------|-----------|
| **Parse failure** | Source cannot be parsed (unsupported language, broken syntax tree) | Mark the unit `[Unknown]` and report the language/file; escalate to a human domain expert. Emit no inferred behavior for it. | Source parses after tooling/fix |
| **High unknown ratio** | `[Unknown]` items exceed the confidence threshold (default > 50% of behaviors) | Halt spec finalization; require a subject-matter-expert interview to fill `[Unknown]` items first. Do not ship a majority-guessed spec. | Unknown ratio below threshold |
| **Contradicted inference** | Code contradicts a previously inferred behavior | Downgrade the item to `[Assumption]` and escalate to the code owner; never record a contradicted inference as `[Confirmed]`. | Owner confirms or corrects |
| **Test-analysis failure** | Existing tests cannot be run/parsed for behavior extraction | Fall back to static analysis only; mark affected behaviors `[Inferred]` (lower certainty), never `[Confirmed]`. | — |

**Rule RE-FAIL-001 (Required)**: A parse failure or an above-threshold
`[Unknown]` ratio MUST block spec finalization and escalate to a human — never
present a sub-threshold-confidence spec as authoritative.

---

## Anti-Patterns to Avoid

### Code Analysis Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| **Fabricating Motivation** | Misleading spec | Mark as `[Unknown]` |
| **Assuming Requirements** | False confidence | Mark as `[Need Confirmation]` |
| **Speculating About Unread Code** | Hallucination | Only analyze what's read |
| **Presenting Inferences as Facts** | Broken trust | Always use appropriate tags |
| **Skipping Human Review** | Incomplete spec | Always require review phase |

### Process Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| **Generating for Unread Code** | Invalid output | Read all relevant files first |
| **Filling [Unknown] Without Human** | Invalid spec | Always get human input |
| **Skipping Test Analysis** | Missing criteria | Always analyze existing tests |
| **Single-Pass Generation** | Shallow spec | Use progressive disclosure |

---

## Best Practices

### Do's

- ✅ Read all relevant files before making any claims
- ✅ Tag every statement with certainty level
- ✅ Include source citations with file:line references
- ✅ Clearly list what needs human input
- ✅ Preserve original code comments as context
- ✅ Map tests to acceptance criteria
- ✅ Use progressive disclosure (overview → details)
- ✅ Validate inferences with stakeholders

### Don'ts

- ❌ Assume motivation or business context
- ❌ Present inferences as confirmed facts
- ❌ Skip source attribution
- ❌ Generate specs for unread code
- ❌ Fill `[Unknown]` sections without human input
- ❌ Ignore existing tests
- ❌ Skip human review phase
- ❌ Over-engineer the specification

---

## Tool Integration

### Command-Line Tools

| Tool | Command | Purpose |
|------|---------|---------|
| **Claude Code** | `/reverse-spec` | Generate SDD specification from code |
| **Claude Code** | `/reverse-bdd` | Convert AC to Gherkin scenarios |
| **Claude Code** | `/reverse-tdd` | Analyze test coverage against BDD |

### Skill References

- [Reverse Engineer Skill](../skills/reverse-engineer/SKILL.md) - Detailed workflow implementation
- [Spec-Driven Development Skill](../skills/spec-driven-dev/SKILL.md) - SDD integration
- [BDD Assistant Skill](../skills/bdd-assistant/SKILL.md) - Gherkin formulation
- [TDD Assistant Skill](../skills/tdd-assistant/SKILL.md) - Test coverage analysis

---

## Related Standards

- [Anti-Hallucination Guidelines](anti-hallucination.md) - Evidence-based analysis requirements
- [Spec-Driven Development](spec-driven-development.md) - Specification workflow
- [Behavior-Driven Development](behavior-driven-development.md) - Given-When-Then scenarios
- [Test-Driven Development](test-driven-development.md) - Red-Green-Refactor cycle
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - Acceptance criteria
- [Code Review Checklist](code-review-checklist.md) - Review guidelines
- [Test Completeness Dimensions](test-completeness-dimensions.md) - Dimension 4 (Authorization) names the cross-tenant test; Auth Scope Extraction is the discovery step that determines which ones you need

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-08-20 | Added: Auth Scope Extraction stage (self-referential query predicates) — derive signals incl. non-SQL scope enforcement, per-match record with `file:line`, predicate-equivalence oracle covering every role branch and per-call-site resolver use, rule RE-AUTH-001 (mandatory negative test asserting the ABSENCE of another operator's records) and RE-AUTH-002 (unverified predicate blocks cutover) (issue [#166](https://github.com/AsiaOstrich/universal-dev-standards/issues/166)) |
| 1.2.0 | 2026-06-27 | Added: Implicit Rule Scan stage (non-HTTP persistence write-path extraction) — 4 derive categories + three-question oracle + non-HTTP Devil's Advocate + PHP type-juggling note + certainty/`file:line` (XSPEC-284 R4/AC-8) |
| 1.1.0 | 2026-06-18 | Added: Failure Handling & Escalation section — parse failure / high-unknown-ratio / contradicted-inference escalation + rule RE-FAIL-001 (XSPEC-292 T7) |
| 1.0.0 | 2026-01-19 | Initial release |

---

## References

- [Anti-Hallucination Standards](anti-hallucination.md) - Core compliance requirement
- [IEEE 830-1998 - Software Requirements Specifications](https://standards.ieee.org/ieee/830/1222/)
- [SWEBOK v4.0 - Chapter 9: Software Maintenance](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
- [Working Effectively with Legacy Code - Michael Feathers](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
