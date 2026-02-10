# Daily Development Workflow Guide

**Version**: 1.1.0
**Last Updated**: 2026-02-10

> **Language**: English | [繁體中文](../locales/zh-TW/adoption/DAILY-WORKFLOW-GUIDE.md)

This guide explains how to use Universal Development Standards in your daily development workflow after running `uds init`.

---

## Table of Contents

- [Phase 0: Project Discovery](#phase-0-project-discovery)
- [Core Principle: Incremental Adoption](#core-principle-incremental-adoption)
- [Workflow Selection by Task Type](#workflow-selection-by-task-type)
- [Greenfield vs Brownfield Projects](#greenfield-vs-brownfield-projects)
- [Legacy Code Adoption Strategy](#legacy-code-adoption-strategy)
- [Scenario-Based Workflows](#scenario-based-workflows)
- [Available Commands Quick Reference](#available-commands-quick-reference)
- [Quality Checkpoints](#quality-checkpoints)
- [When to Write Full Specifications](#when-to-write-full-specifications)
- [Best Practices Summary](#best-practices-summary)
- [Related Standards](#related-standards)
- [Version History](#version-history)
- [License](#license)

---

## Phase 0: Project Discovery

> **When to use**: First time onboarding to an existing codebase, or before making major changes to unfamiliar modules.

Before diving into code changes on a brownfield project, run `/discover` to assess the current state:

```
1. /discover [area]     → Assess project health, architecture, risks
2. /reverse spec        → Reverse engineer existing code to specs (if needed)
3. /sdd                 → Write specification for new features
4. Implement            → /tdd or /bdd with test protection
```

### Assessment Dimensions

| Dimension | What to Check |
|-----------|--------------|
| **Architecture** | Module structure, dependency graph, entry points |
| **Dependencies** | Outdated packages, known vulnerabilities, license risks |
| **Test Coverage** | Existing test suite, coverage gaps, test quality |
| **Security** | `npm audit` findings, hardcoded secrets, exposed endpoints |
| **Technical Debt** | TODOs, code duplication, complexity hotspots |

### Output

The Discovery Report provides:
- Overall health score (1-10)
- Per-dimension scores and key findings
- **Verdict**: GO / NO-GO / CONDITIONAL
- Prioritized recommendations (HIGH / MED / LOW)

> **Next**: After discovery, proceed to `/reverse` if you need to understand existing code, then `/sdd` for new features.

---

## Core Principle: Incremental Adoption

### Common Misconception vs Reality

```
┌─────────────────────────────────────────────────────────────────┐
│                    ❌ Misconception vs ✅ Reality                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❌ Misconception:                                               │
│  "Must write specs and tests for ALL legacy code before         │
│   starting any new development"                                 │
│                                                                 │
│  ✅ Reality:                                                     │
│  "Only add tests and documentation incrementally when you       │
│   'touch' existing code"                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Boy Scout Rule

> "Leave the code better than you found it"

- Reverse-engineering an entire system is impractical and low-value
- Focus on **incremental improvement**, not **perfection upfront**
- Each time you touch code, add a little protection (tests, docs)

---

## Workflow Selection by Task Type

### Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    Task Type → Workflow Selection                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  First time in this codebase?                                   │
│  │                                                              │
│  ├─ Yes → /discover first (Phase 0 assessment)                  │
│  │                                                              │
│  └─ No (familiar with codebase)                                 │
│                                                                 │
│  Is this a brand new feature?                                   │
│  │                                                              │
│  ├─ Yes (Greenfield)                                            │
│  │   └─ Use full flow: ATDD → SDD → BDD → TDD                   │
│  │                                                              │
│  └─ No (Brownfield/Legacy)                                      │
│      │                                                          │
│      ├─ Is the scope large? (architectural, cross-module)       │
│      │   │                                                      │
│      │   ├─ Yes → Golden Master + SDD                           │
│      │   │       (requires spec and full test protection)       │
│      │   │                                                      │
│      │   └─ No → Modifying single module/function               │
│      │       │                                                  │
│      │       ├─ Has existing tests?                             │
│      │       │   │                                              │
│      │       │   ├─ Yes → Direct TDD cycle                      │
│      │       │   │                                              │
│      │       │   └─ No → Write characterization tests first     │
│      │       │                                                  │
│      │       └─ Is it a bug fix?                                │
│      │           │                                              │
│      │           ├─ Yes → Write failing test → Fix              │
│      │           │                                              │
│      │           └─ No → TDD for new behavior                   │
│      │                                                          │
│      └─ Is it pure refactoring (no behavior change)?            │
│          │                                                      │
│          ├─ Yes → Ensure test coverage → Refactor → Tests pass  │
│          │                                                      │
│          └─ No → Hybrid: protect existing + TDD new behavior    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Greenfield vs Brownfield Projects

### Definitions

| Project Type | Description | Example |
|--------------|-------------|---------|
| **Greenfield** | New project or feature with no existing code | New microservice, new module |
| **Brownfield** | Existing codebase with legacy code | Maintenance, feature additions to existing systems |

### Workflow Comparison

| Aspect | Greenfield | Brownfield |
|--------|------------|------------|
| **Spec** | Write full spec (SDD) | Only for major changes |
| **Tests** | TDD from start | Characterization tests first |
| **Documentation** | Create as you go | Add incrementally |
| **Methodology** | Full ATDD → SDD → BDD → TDD | Simplified based on scope |

---

## Legacy Code Adoption Strategy

### Strategy 1: Modifying Existing Code (Bug Fix / Small Changes)

```
┌────────────────────────────────────────────────────────────────┐
│           Legacy Code Modification (Golden Master Strategy)     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1️⃣  Understand Current Behavior (Don't write spec, write test)│
│      ├─ Read code, understand current behavior                 │
│      ├─ Write a "Characterization Test"                        │
│      │   capturing existing behavior (right or wrong)          │
│      └─ This test is your "safety net"                         │
│                                                                │
│  2️⃣  Modify Code                                                │
│      ├─ Make changes under test protection                     │
│      ├─ If test fails, you know what broke                     │
│      └─ For bug fixes: make test fail first, then fix          │
│                                                                │
│  3️⃣  Commit (No full Spec needed)                              │
│      └─ Commit message describes the change                    │
│                                                                │
│  ⚠️  Key: No SPEC document needed, no full BDD scenarios        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Example: Fixing a validation bug**

```typescript
// 1. Write characterization test capturing current behavior
test('characterization: login validates email format', () => {
  // Observe what existing code does, then record it
  const result = validateEmail('invalid');
  expect(result).toBe(false); // Record existing behavior
});

// 2. Write failing test describing the bug
test('should reject email without domain', () => {
  const result = validateEmail('user@');
  expect(result).toBe(false); // Currently might be true (bug)
});

// 3. Fix bug, make test pass
// 4. Commit
```

### Strategy 2: Adding New Behavior to Existing Feature

```
┌────────────────────────────────────────────────────────────────┐
│              Feature Extension (Hybrid Strategy)                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1️⃣  Protect Existing Behavior                                 │
│      └─ Write characterization tests for areas you'll modify   │
│                                                                │
│  2️⃣  Define New Behavior (Simplified TDD/BDD)                  │
│      ├─ Write tests for new functionality (TDD)                │
│      ├─ Or write Given-When-Then scenarios (BDD)               │
│      └─ No full Spec Workshop needed                           │
│                                                                │
│  3️⃣  Implement New Feature                                     │
│      └─ Implement under test protection                        │
│                                                                │
│  4️⃣  Refactor (Optional)                                       │
│      └─ If time permits, improve touched legacy code           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Strategy 3: Major Refactoring / Architectural Changes

```
┌────────────────────────────────────────────────────────────────┐
│              Major Changes (Requires Spec)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ⚠️  Only this scenario requires a more complete workflow       │
│                                                                │
│  0️⃣  Assess Current State (Discovery + Reverse Engineering)    │
│      ├─ /discover to assess project health and risks           │
│      ├─ /reverse spec to reverse engineer existing code        │
│      └─ Output: Discovery Report + existing specs              │
│                                                                │
│  1️⃣  Write Change Specification (SDD)                          │
│      ├─ Describe why refactoring is needed                     │
│      ├─ Define impact scope                                    │
│      └─ Acceptance criteria: system behavior unchanged         │
│                                                                │
│  2️⃣  Create Golden Master Tests                                │
│      ├─ Record all current system outputs                      │
│      ├─ Use Snapshot Testing / Approval Testing                │
│      └─ This is your "correct answer"                          │
│                                                                │
│  3️⃣  Perform Refactoring                                       │
│      ├─ Ensure Golden Master tests pass after each step        │
│      └─ If tests fail → revert immediately                     │
│                                                                │
│  4️⃣  Gradually Convert Golden Masters to Proper Tests          │
│      └─ Improve test quality over time                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Scenario-Based Workflows

### Scenario A: New Feature Development (Full Flow)

For significant new features requiring stakeholder acceptance:

```
1️⃣  ATDD Phase: Define "Done"
    ├─ Hold Specification Workshop
    ├─ PO, Developer, QA define Acceptance Criteria together
    └─ Explicitly define "Out of Scope"
    💡 Command: /atdd

2️⃣  SDD Phase: Write Technical Specification
    ├─ Write technical design document based on AC
    ├─ Technical review and approval
    └─ Output: SPEC-XXX document
    💡 Command: /sdd

3️⃣  BDD Phase: Write Behavior Specifications
    ├─ Discovery: Identify scenarios from AC
    ├─ Formulation: Write Gherkin Given-When-Then scenarios
    └─ Output: Feature files
    💡 Command: /bdd

4️⃣  TDD Phase: Implementation
    ├─ 🔴 RED: Write failing tests
    ├─ 🟢 GREEN: Minimal implementation
    ├─ 🔵 REFACTOR: Clean up code
    └─ Repeat until all BDD scenarios pass
    💡 Command: /tdd

5️⃣  Verification and Commit
    ├─ Demo to PO, get formal acceptance
    ├─ Commit code
    └─ Archive spec document
    💡 Command: /commit
```

### Scenario B: Bug Fix (Simplified TDD Flow)

```
1. Write failing test reproducing the bug
2. Fix bug to make test pass
3. Refactor if needed
4. Commit with issue reference

💡 Commands:
- /tdd (enter TDD mode)
- /commit (auto-generate conventional commit message)
```

### Scenario C: Small Change / Quick Fix

```
1. If touching existing code without tests:
   └─ Write characterization test first
2. Make the change
3. Verify tests pass
4. Commit

💡 No special methodology needed
```

### Scenario D: Code Review / PR

```
1. Use systematic code review checklist
2. Apply appropriate comment prefixes:
   - ❗ BLOCKING: Must fix before merge
   - ⚠️ IMPORTANT: Should fix
   - 💡 SUGGESTION: Nice-to-have
   - ❓ QUESTION: Need clarification

💡 Command: /review
```

---

## Available Commands Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/discover` | Assess project health and risks | First time in codebase, before major changes |
| `/reverse` | Reverse engineer code to specs/BDD/TDD | Understanding existing code |
| `/tdd` | Start TDD workflow | Writing code |
| `/bdd` | Start BDD workflow | Designing behavior specs |
| `/sdd` | Start SDD workflow | Need technical specification |
| `/atdd` | Start ATDD workflow | Features requiring formal acceptance |
| `/refactor` | Start refactoring workflow | Improving code structure |
| `/methodology` | View/switch current methodology | Managing dev process |
| `/commit` | Generate conventional commit message | Committing code |
| `/review` | Start code review | Reviewing PRs |
| `/requirement` | Write requirement document | Defining User Stories |
| `/checkin` | Pre-commit quality verification | Before committing code |
| `/changelog` | Generate changelog entries | During release preparation |
| `/coverage` | Analyze test coverage | Assessing test quality |
| `/docs` | Manage documentation | Writing/updating docs |
| `/release` | Guide release process | Preparing releases |

---

## Quality Checkpoints

### Pre-Commit (Automatic via Git Hooks)

```
✅ All tests pass
✅ No linting errors
✅ No leaked secrets
```

### Pre-PR Creation

```
✅ Follows Check-in Standards
✅ Commit messages follow Conventional Commits
✅ Test coverage not decreased
```

### Code Review

```
✅ Code passes 10-category review checklist
✅ If Spec exists, implementation matches spec
✅ No scope creep
```

---

## When to Write Full Specifications

### Worth Writing Spec

| Scenario | Reason |
|----------|--------|
| ✅ Cross-team new features | Multiple stakeholders need alignment |
| ✅ Changes requiring PO/stakeholder sign-off | Formal acceptance needed |
| ✅ Architectural refactoring | High risk, need documentation |
| ✅ External API design | Contract definition |
| ✅ Regulatory/compliance changes | Audit trail required |

### Not Worth Writing Spec

| Scenario | Reason |
|----------|--------|
| ❌ Small bug fixes | Low complexity, tests sufficient |
| ❌ Code cleanup/refactoring | No behavior change |
| ❌ Internal tool improvements | Low ceremony needed |
| ❌ Performance optimization | Unless behavior changes |
| ❌ Dependency upgrades | Routine maintenance |

---

## Best Practices Summary

### Adoption Priority for Legacy Projects

| Priority | Item | Reason |
|----------|------|--------|
| 🔴 High | Commit Message Standards | Zero cost, immediate benefit |
| 🔴 High | Check-in Standards | Prevent issues entering codebase |
| 🟡 Medium | TDD (new code only) | New code gets test protection |
| 🟡 Medium | Characterization Tests (touched legacy) | Incremental safety net |
| 🟢 Low | Full BDD/SDD | Only for major new features |
| 🟢 Low | Reverse-engineering old Specs | Usually not worth it |

### DO and DON'T

```
┌─────────────────────────────────────────────────────────────────┐
│                    UDS Daily Development Best Practices          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ DO:                                                          │
│  ├─ Choose methodology based on task type                       │
│  ├─ Use /commands to start workflows                            │
│  ├─ Define "done" criteria before implementation                │
│  ├─ Pass quality checks on every commit                         │
│  └─ Let AI track your current phase                             │
│                                                                 │
│  ❌ DON'T:                                                       │
│  ├─ Skip tests and implement directly                           │
│  ├─ Develop major features without specs                        │
│  ├─ Ignore methodology system phase reminders                   │
│  ├─ Commit code that fails tests                                │
│  └─ Arbitrarily expand scope during development                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What You DON'T Need to Do

```
┌─────────────────────────────────────────────────────────────────┐
│                    UDS Legacy Project Adoption                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❌ NOT Required:                                                │
│  ├─ Write Specs for all legacy code                             │
│  ├─ Write tests for all legacy code                             │
│  └─ Reverse-engineer before starting work                       │
│                                                                 │
│  ✅ Required:                                                    │
│  ├─ When modifying legacy code, add tests for touched parts     │
│  ├─ Use TDD/BDD for new features                                │
│  ├─ Write Specs only for major changes                          │
│  └─ Continuously improve incrementally                          │
│                                                                 │
│  📈 Over Time:                                                   │
│  Test coverage naturally grows because you always               │
│  "touch a little, protect a little"                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Related Standards

- [Adoption Guide](ADOPTION-GUIDE.md) - How to install UDS
- [Project Discovery](../skills/project-discovery/SKILL.md) - Phase 0 project assessment
- [Reverse Engineering Standards](../core/reverse-engineering-standards.md) - Reverse engineering workflow
- [Refactoring Standards](../core/refactoring-standards.md) - Refactoring workflow
- [Test-Driven Development](../core/test-driven-development.md) - TDD standards including Golden Master Testing
- [Behavior-Driven Development](../core/behavior-driven-development.md) - BDD workflow
- [Acceptance Test-Driven Development](../core/acceptance-test-driven-development.md) - ATDD workflow
- [Spec-Driven Development](../core/spec-driven-development.md) - SDD workflow
- [Check-in Standards](../core/checkin-standards.md) - Code check-in requirements
- [Code Review Checklist](../core/code-review-checklist.md) - Review process

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-10 | Add Phase 0 discovery, /discover + /reverse + /refactor commands |
| 1.0.0 | 2026-01-19 | Initial daily workflow guide |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
