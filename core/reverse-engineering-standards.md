# Reverse Engineering Standards | 反向工程標準

**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Applicability**: All projects requiring code-to-specification transformation
**Scope**: uds-specific

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
| **Gap Identification** | List unknowns requiring human input | Gap analysis document | [Unknown] items |
| **Spec Generation** | Generate draft specification | Draft SPEC-XXX.md | Mixed certainty |
| **Human Review** | Stakeholder validation and gap filling | Validated specification | [Confirmed] |

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

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
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
