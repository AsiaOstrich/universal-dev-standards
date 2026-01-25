# Spec-Driven Development (SDD) Standards

**Version**: 2.0.0
**Last Updated**: 2026-01-25
**Applicability**: All projects adopting Spec-Driven Development

> **Language**: [English](../core/spec-driven-development.md) | [繁體中文](../locales/zh-TW/core/spec-driven-development.md)

---

## Purpose

This standard defines the principles and workflows for Spec-Driven Development (SDD), ensuring that changes are planned, documented, and approved via specifications before implementation.

**Key Benefits**:
- Reduced miscommunication between stakeholders and developers
- Clear audit trail for all changes
- Easier onboarding for new team members

---

## SDD as Independent Methodology

SDD (Spec-Driven Development, 2025) is an AI-era methodology distinct from the traditional TDD/BDD/ATDD family. It emerged from the increasing adoption of AI-assisted development tools and the need for specification-first approaches in modern software engineering.

### Historical Context

| Methodology Family | Era | Core Literature | Relationship |
|-------------------|-----|-----------------|--------------|
| **TDD/BDD/ATDD** | 1999-2011 | GOOS (Freeman & Pryce), Dan North, Gojko Adzic | Traditional test-driven development family |
| **SDD (2025)** | 2025+ | Thoughtworks, GitHub spec-kit, Martin Fowler | AI-era emerging concept, independent from traditional family |

### Relationship to Testing Methodologies

SDD is **not** part of the "ATDD → BDD → TDD" sequence. Instead, it generates test artifacts through Forward Derivation but remains a separate methodology.

| Methodology | Origin | Focus | SDD Integration |
|-------------|--------|-------|-----------------|
| **TDD** | 1999, Kent Beck | Code-level tests | Can be used during SDD Implementation phase |
| **BDD** | 2006, Dan North | Behavior scenarios | Forward Derivation generates .feature files |
| **ATDD** | 2003-2006, GOOS | Collaborative acceptance | Optional input method for AC definition |

### Key Distinction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Two Independent Methodological Systems                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────┐                                   │
│   │     SDD (AI-Era Methodology)         │                                  │
│   │                                      │                                  │
│   │   Requirements → SPEC.md → Forward   │                                  │
│   │              Derivation → Tests      │                                  │
│   │                                      │                                  │
│   │   • Spec is authoritative source     │                                  │
│   │   • AI-assisted code generation      │                                  │
│   │   • Forward Derivation generates     │                                  │
│   │     test structures                  │                                  │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   ┌─────────────────────────────────────┐                                   │
│   │  Double-Loop TDD (Traditional)       │                                  │
│   │                                      │                                  │
│   │   BDD (Outer Loop) → TDD (Inner Loop)│                                  │
│   │                                      │                                  │
│   │   • Tests drive design               │                                  │
│   │   • Manual development               │                                  │
│   │   • ATDD is optional collaboration   │                                  │
│   │     input, not a sequential step     │                                  │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## SDD Maturity Levels

Based on Martin Fowler's analysis of SDD tools (2025), teams can operate at different maturity levels:

| Level | Name | Description | Human Role |
|-------|------|-------------|------------|
| 1 | **Spec-first** | Write spec, discard after completion | Edit spec and code |
| 2 | **Spec-anchored** | Maintain spec throughout evolution | Edit spec, AI assists code |
| 3 | **Spec-as-source** | Spec is only source, code auto-generated | Only edit spec, never touch code |

### Level Characteristics

**Level 1: Spec-first**
- Specifications written before implementation
- Specs may be discarded after feature completion
- Code remains the authoritative source
- Most common in 2025

**Level 2: Spec-anchored**
- Specifications maintained throughout the lifecycle
- Specs used for evolution and maintenance
- AI assists with code changes based on spec updates
- Growing adoption in enterprise environments

**Level 3: Spec-as-source**
- Specifications are the only source of truth
- Code is marked as "GENERATED - DO NOT EDIT"
- Any change requires spec modification first
- Still experimental in 2025

### References

- [Thoughtworks: Spec-Driven Development](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)
- [Martin Fowler: SDD Tools (Kiro, spec-kit, Tessl)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [GitHub spec-kit](https://github.com/github/spec-kit/blob/main/spec-driven.md)

---

## Common Pitfalls

Avoid these common pitfalls when adopting SDD:

| Pitfall | Problem | Mitigation |
|---------|---------|------------|
| **Over-formalization** | Slows feedback like waterfall development | Keep iterative, use short cycles |
| **Spec Drift** | Spec and code become out of sync | Continuous validation, drift detection in CI/CD |
| **AI Hallucination** | AI generates code that doesn't match spec | Robust verification, contract testing |
| **Size Mismatch** | Using heavy workflow for small bugs | Choose appropriate process based on complexity |
| **Premature Optimization** | Jumping to Spec-as-source (Level 3) | Start with Spec-first, evolve gradually |

### When NOT to Use Full SDD

| Scenario | Recommendation |
|----------|----------------|
| Critical hotfixes | Fix first, document later |
| Typos and formatting | Direct commit, no spec needed |
| Exploratory prototypes | Skip formal specs, iterate quickly |
| Small bug fixes (< 30 min) | Lightweight tracking only |

---

## SDD Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Proposal   │───▶│    Review    │───▶│Implementation│
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   Archive    │◀───│ Verification │
                    └──────────────┘    └──────────────┘
```

### Workflow Stages

| Stage | Description | Artifacts |
|-------|-------------|-----------|
| **Proposal** | Define what to change and why | `proposal.md` |
| **Review** | Stakeholder approval | Review comments, approval record |
| **Implementation** | Execute the approved spec | Code, tests, docs |
| **Verification** | Confirm implementation matches spec | Test results, review |
| **Archive** | Close and archive the spec | Archived spec with links to commits/PRs |

---

## Core Principles

### 1. Priority of SDD Tool Commands

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated and provides specific commands (e.g., slash commands like `/openspec` or `/spec`), AI assistants MUST prioritize using these commands over manual file editing.

**Rationale**:
- **Consistency**: Tools ensure the spec structure follows strict schemas.
- **Traceability**: Commands often handle logging, IDs, and linking automatically.
- **Safety**: Tools may have built-in validation preventing invalid states.

**Example**:
- ✅ Use `/openspec proposal "Add Login"` instead of manually creating `changes/add-login/proposal.md`.

---

### 2. Methodology Over Tooling

**Rule**: SDD is a methodology, not bound to a single tool. While OpenSpec is a common implementation, these standards apply to any SDD tool (e.g., Spec Kit).

**Guidelines**:
- **Universal Flow**: Proposal -> Review -> Implementation -> Verification -> Archive.
- **Tool Adaptation**: Adapt to the specific commands and patterns of the active SDD tool in the workspace.

---

### 3. Spec First, Code Second

**Rule**: No functional code changes shall be made without a corresponding approved specification or change proposal.

**Exceptions**:
- Critical hotfixes (restore service immediately, document later).
- Trivial changes (typos, comments, formatting).

---

## Spec Document Template

### Proposal Template

```markdown
# [SPEC-ID] Feature Title

## Summary
Brief description of the proposed change.

## Motivation
Why is this change needed? What problem does it solve?

## Detailed Design
Technical approach, affected components, data flow.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
List any dependencies on other specs or external systems.

## Risks
Potential risks and mitigation strategies.
```

---

## Integration with Other Standards

### With Commit Message Guide

When implementing an approved spec, reference the spec ID in commit messages:

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### With Check-in Standards

Before checking in code for a spec:

1. ✅ Spec is approved
2. ✅ Implementation matches spec
3. ✅ Tests cover acceptance criteria
4. ✅ Spec ID referenced in PR

### With Code Review Checklist

Reviewers should verify:

- [ ] Change matches approved spec
- [ ] No scope creep beyond spec
- [ ] Spec acceptance criteria met

---

## Common SDD Tools

| Tool | Description | Command Examples |
|------|-------------|------------------|
| **OpenSpec** | Specification management | `/openspec proposal`, `/openspec approve` |
| **Spec Kit** | Lightweight spec tracking | `/spec create`, `/spec close` |
| **Manual** | No tool, file-based | Create `specs/SPEC-XXX.md` manually |

---

## Best Practices

### Do's

- ✅ Keep specs focused and atomic (one change per spec)
- ✅ Include clear acceptance criteria
- ✅ Link specs to implementation PRs
- ✅ Archive specs after completion

### Don'ts

- ❌ Start coding before spec approval
- ❌ Modify scope during implementation without updating spec
- ❌ Leave specs in limbo (always close or archive)
- ❌ Skip verification step

---

## Integration with Reverse Engineering

### Overview

For existing codebases without specifications, use [Reverse Engineering Standards](reverse-engineering-standards.md) to generate SDD-compatible proposal drafts.

### Reverse Engineering → SDD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  Reverse Engineering → SDD Pipeline                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Existing Code                                                         │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │ /reverse-spec                                               │       │
│   │   • Code scanning → Technical inventory [Confirmed]         │       │
│   │   • Test analysis → Acceptance criteria [Confirmed/Inferred]│       │
│   │   • Gap identification → [Unknown] items                    │       │
│   └────────────────────────────────────────────────────────────┘       │
│        │                                                                │
│        ▼                                                                │
│   DRAFT SPEC (Reverse-Engineered)                                       │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │ SDD Review Process                                          │       │
│   │   • Human fills [Unknown] sections (motivation, risks)      │       │
│   │   • Stakeholder validation of [Inferred] items              │       │
│   │   • Formal approval                                         │       │
│   └────────────────────────────────────────────────────────────┘       │
│        │                                                                │
│        ▼                                                                │
│   APPROVED SPEC → Normal SDD workflow continues                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Requirements for Reverse-Engineered Specs

When a specification is generated via reverse engineering:

1. **Mark Status**: Include `Status: Draft (Reverse-Engineered)` in metadata
2. **Fill Unknowns**: All `[Unknown]` sections MUST be filled by humans before approval
3. **Validate Inferences**: All `[Inferred]` items must be reviewed and confirmed
4. **Standard Review**: Follow normal SDD review process before implementation
5. **Source Citations**: Maintain file:line references for traceability

### When to Use Reverse Engineering

| Scenario | Approach |
|----------|----------|
| Legacy system modernization | Start with reverse engineering |
| Documenting undocumented code | Generate specs from code |
| New team onboarding | Extract specifications for knowledge transfer |
| Pre-refactoring documentation | Create specs before major changes |

### Related Commands

| Command | Purpose |
|---------|---------|
| `/reverse-spec` | Generate SDD specification from existing code |
| `/reverse-bdd` | Convert acceptance criteria to Gherkin scenarios |
| `/reverse-tdd` | Analyze test coverage against BDD scenarios |

---

## Integration with Forward Derivation

### Overview

After a specification is approved, use [Forward Derivation Standards](forward-derivation-standards.md) to automatically generate BDD scenarios, TDD test skeletons, and ATDD acceptance tests from the Acceptance Criteria.

### Forward Derivation → SDD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  Approved Spec → Forward Derivation Pipeline             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   APPROVED SPEC-XXX.md                                                  │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │ /derive-all specs/SPEC-XXX.md                               │       │
│   │   • Parse Acceptance Criteria                               │       │
│   │   • Transform AC → Gherkin scenarios [Generated]           │       │
│   │   • Generate TDD test skeletons [Generated]                │       │
│   │   • Create ATDD acceptance tables [Generated]              │       │
│   └────────────────────────────────────────────────────────────┘       │
│        │                                                                │
│        ▼                                                                │
│   OUTPUT FILES                                                          │
│   ├── features/SPEC-XXX.feature (BDD)                                  │
│   ├── tests/SPEC-XXX.test.ts (TDD)                                     │
│   └── acceptance/SPEC-XXX-acceptance.md (ATDD)                         │
│        │                                                                │
│        ▼                                                                │
│   HUMAN REVIEW → BDD/TDD workflow continues                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### When to Use Forward Derivation

| Scenario | Approach |
|----------|----------|
| Spec approved, starting implementation | Use `/derive-all` to generate test structures |
| Need BDD scenarios quickly | Use `/derive-bdd` for Gherkin generation |
| Starting TDD workflow | Use `/derive-tdd` for test skeletons |
| Manual acceptance testing | Use `/derive-atdd` for test tables |

### Related Commands

| Command | Input | Output | Purpose |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin scenarios |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → Test skeletons |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → Test tables |
| `/derive-all` | SPEC-XXX.md | All above | Full derivation pipeline |
| `/derive-contracts` | SPEC-XXX.md | contract.json, schema.json | AC → Contract verification |

---

## Validation Layer

SDD requires robust verification mechanisms to ensure generated code aligns with specifications. The Validation Layer provides continuous verification throughout the development lifecycle.

### Theoretical Foundation

| Theory | Source | Application in SDD |
|--------|--------|-------------------|
| **Design by Contract** | Bertrand Meyer, 1986 | AC as pre/post conditions |
| **Formal Verification** | Computer Science | Spec vs Implementation |
| **Specification by Example** | Gojko Adzic, 2011 | Executable specifications |
| **Contract Testing** | Pact, 2013+ | Service contract verification |

### Verification Mechanisms

| Mechanism | Purpose | Tools |
|-----------|---------|-------|
| **Contract Testing** | Verify implementation honors interface guarantees | Pact, Spring Cloud Contract, Specmatic |
| **Schema Validation** | Reject payloads violating structural requirements | JSON Schema, OpenAPI validators |
| **Drift Detection** | Detect divergence between spec and behavior | CI/CD integration, Specmatic |
| **Backward Compatibility** | Classify changes as additive/breaking | OpenAPI diff tools |

### SDD Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SDD Validation Layer                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SPEC-XXX.md (Approved)                                                    │
│        │                                                                    │
│        ├──→ Forward Derivation                                              │
│        │         │                                                          │
│        │         ├──→ Contract Tests (generated)                            │
│        │         ├──→ Schema Validators (generated)                         │
│        │         ├──→ BDD Scenarios (generated)                             │
│        │         └──→ TDD Skeletons (generated)                             │
│        │                                                                    │
│        └──→ Implementation (AI-assisted)                                    │
│                  │                                                          │
│                  ▼                                                          │
│        ┌─────────────────────────────────────────────────────┐             │
│        │              Continuous Verification                 │             │
│        │  ┌─────────────────────────────────────────────────┐│             │
│        │  │ Contract Tests          ✓/✗                     ││             │
│        │  │ Schema Validation       ✓/✗                     ││             │
│        │  │ Drift Detection         ✓/✗                     ││             │
│        │  │ BDD Scenarios           ✓/✗                     ││             │
│        │  │ TDD Unit Tests          ✓/✗                     ││             │
│        │  └─────────────────────────────────────────────────┘│             │
│        └─────────────────────────────────────────────────────┘             │
│                  │                                                          │
│                  ▼                                                          │
│        Verification Report → Archive or Iterate                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Generated Verification Artifacts

| Artifact | Purpose | Verification Role |
|----------|---------|-------------------|
| `.feature` (BDD) | Behavior scenarios | Acceptance verification |
| `.test.ts` (TDD) | Unit test skeletons | Implementation verification |
| `acceptance.md` (ATDD) | Acceptance test tables | Business verification |
| `contract.json` | Contract definitions | Interface verification |
| `schema.json` | Schema definitions | Structure verification |

### V&V in SDD

- **Verification** (Building it right): Contract tests pass, schema valid, code matches spec
- **Validation** (Building right thing): AC met, stakeholder approval, business value delivered

### References

- [InfoQ: Spec-Driven Development - Validation Layer](https://www.infoq.com/articles/spec-driven-development/)
- [Microsoft: Consumer-Driven Contract Testing](https://microsoft.github.io/code-with-engineering-playbook/automated-testing/cdc-testing/)
- [Wikipedia: Formal Verification](https://en.wikipedia.org/wiki/Formal_verification)
- [Specmatic: AI-powered API Contract Testing](https://specmatic.io/)

---

## SDD + Testing Integration Model

### Theoretical Basis

SDD verification is grounded in established testing theory:

```
Design by Contract (1986)     Specification by Example (2011)
        │                              │
        ▼                              ▼
┌───────────────────────────────────────────────────────────────┐
│               SDD Verification Model                           │
│                                                               │
│   Spec (AC)  ←──→  Contract Tests  ←──→  Implementation       │
│       ↑                 ↑                      ↓              │
│   Pre/Post          Verification           Runtime            │
│   Conditions        Mechanisms             Behavior           │
└───────────────────────────────────────────────────────────────┘
```

### Integration Points

| SDD Phase | Testing Integration | Theory |
|-----------|---------------------|--------|
| **Spec Writing** | AC = Pre/Post conditions | Design by Contract |
| **Forward Derivation** | Generate Contract Tests | Executable Specification |
| **Implementation** | TDD (optional) | Test-Driven Development |
| **Verification** | Contract Testing + Drift Detection | Runtime Verification |
| **Archive** | Test results as evidence | Traceability |

### Practical Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Practical SDD Workflow                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   【Input Sources】(Any of these)                                            │
│   ├── Requirements interviews (most common)                                 │
│   ├── Stakeholder emails/documents                                          │
│   ├── Product Requirements Document (PRD)                                   │
│   └── ATDD Workshop (optional collaboration)                                │
│        ↓                                                                    │
│   【SDD Proposal Writing】                                                   │
│   SPEC-XXX.md includes:                                                     │
│   - Summary, Motivation                                                     │
│   - Detailed Design                                                         │
│   - Acceptance Criteria (Given-When-Then)                                   │
│   - Dependencies, Risks                                                     │
│        ↓                                                                    │
│   【Review & Approval】                                                      │
│        ↓                                                                    │
│   【Forward Derivation】                                                     │
│   /derive-all → .feature, .test.ts, acceptance.md, contract.json            │
│        ↓                                                                    │
│   【Implementation】(TDD optional)                                           │
│        ↓                                                                    │
│   【Verification】→ 【Archive】                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Adjustments from Traditional Approaches

1. **ATDD Workshop is Optional**: Not every feature needs a formal workshop
2. **Spec is the Starting Point**: Regardless of input source, convert to SPEC-XXX.md
3. **Given-When-Then Embedded**: AC format borrows from BDD, but doesn't require formal ATDD process
4. **Forward Derivation Fills Gaps**: Auto-generates test structures, compensating for lack of workshops

---

## Integration with Forward/Reverse Engineering

This standard works together with two complementary standards to form a complete specification ecosystem:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SDD Ecosystem Integration                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Legacy Code                    New Feature                            │
│       │                              │                                  │
│       ▼                              ▼                                  │
│   ┌─────────────────┐        ┌─────────────────┐                        │
│   │ Reverse         │        │ SDD             │                        │
│   │ Engineering     │        │ (This Standard) │                        │
│   │ Standards       │        │                 │                        │
│   └────────┬────────┘        └────────┬────────┘                        │
│            │                          │                                  │
│            │  Code → Spec             │  Spec First                      │
│            │                          │                                  │
│            ▼                          ▼                                  │
│       ┌─────────────────────────────────────┐                           │
│       │          SPEC-XXX.md                │                           │
│       │    (Approved Specification)         │                           │
│       └──────────────────┬──────────────────┘                           │
│                          │                                               │
│                          ▼                                               │
│   ┌─────────────────────────────────────────────────────┐               │
│   │          Forward Derivation Standards                │               │
│   │                                                      │               │
│   │   Spec → BDD (.feature)                              │               │
│   │   Spec → TDD (.test.ts)                              │               │
│   │   Spec → ATDD (acceptance.md)                        │               │
│   └─────────────────────────────────────────────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**When to Use Each**:

| Scenario | Starting Point | Standard to Use |
|----------|---------------|-----------------|
| New feature development | Nothing exists | SDD → Forward Derivation |
| Documenting existing code | Code exists, no spec | Reverse Engineering → SDD |
| Adding tests to existing code | Spec exists | Forward Derivation |
| Major refactoring | Code exists, unclear behavior | Reverse Engineering → SDD → Forward Derivation |

---

## Related Standards

- [Forward Derivation Standards](forward-derivation-standards.md) - Specification-to-test transformation (Spec → BDD/TDD/ATDD)
- [Reverse Engineering Standards](reverse-engineering-standards.md) - Code-to-specification transformation (Code → Spec)
- [Test-Driven Development](test-driven-development.md) - TDD workflow and SDD integration
- [Behavior-Driven Development](behavior-driven-development.md) - BDD workflow with Given-When-Then scenarios
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - ATDD workflow for business acceptance
- [Testing Standards](testing-standards.md) - Testing framework and best practices (or use `/testing-guide` skill)
- [Test Completeness Dimensions](test-completeness-dimensions.md) - 8-dimension test coverage
- [Commit Message Guide](commit-message-guide.md) - Commit message conventions
- [Code Check-in Standards](checkin-standards.md) - Code check-in requirements
- [Code Review Checklist](code-review-checklist.md) - Code review guidelines
- [Documentation Structure](documentation-structure.md) - Documentation structure standards

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-25 | **Major refactor**: Added SDD as Independent Methodology section (separating SDD from TDD/BDD/ATDD family), Maturity Levels (Martin Fowler 2025), Common Pitfalls, Validation Layer with theoretical foundation, SDD + Testing Integration Model, /derive-contracts command |
| 1.4.0 | 2026-01-19 | Added: Integration with Forward Derivation section, derive commands |
| 1.3.0 | 2026-01-19 | Added: Integration with Reverse Engineering section, related commands |
| 1.2.0 | 2026-01-05 | Added: IEEE 830-1998 and SWEBOK v4.0 Chapter 1 (Software Requirements) to References |
| 1.1.0 | 2025-12-24 | Added: Workflow diagram, Spec template, Integration guide, Best practices, Related standards, License |
| 1.0.0 | 2025-12-23 | Initial SDD standard definition |

---

## References

### SDD (2025 AI-Era)

- [Thoughtworks: Spec-Driven Development](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)
- [Martin Fowler: SDD Tools (Kiro, spec-kit, Tessl)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [GitHub spec-kit](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [InfoQ: Spec-Driven Development](https://www.infoq.com/articles/spec-driven-development/)

### Traditional Requirements Engineering

- [OpenSpec Documentation](https://github.com/openspec)
- [Design Documents Best Practices](https://www.industrialempathy.com/posts/design-docs-at-google/)
- [ADR (Architecture Decision Records)](https://adr.github.io/)
- [IEEE 830-1998 - Software Requirements Specifications](https://standards.ieee.org/ieee/830/1222/) - Requirements documentation standard
- [SWEBOK v4.0 - Chapter 1: Software Requirements](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

### Verification Theory

- [Design by Contract - Bertrand Meyer, 1986](https://en.wikipedia.org/wiki/Design_by_contract) - Pre/post conditions theory
- [Wikipedia: Formal Verification](https://en.wikipedia.org/wiki/Formal_verification) - Formal verification theory
- [Microsoft: Consumer-Driven Contract Testing](https://microsoft.github.io/code-with-engineering-playbook/automated-testing/cdc-testing/) - Contract Testing framework
- [Specmatic: AI-powered API Contract Testing](https://specmatic.io/) - Modern contract testing tool
- [Gojko Adzic: Specification by Example](https://gojko.net/books/specification-by-example/) - Executable specifications (2011)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
