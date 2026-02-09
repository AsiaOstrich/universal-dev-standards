---
name: discover
scope: universal
description: |
  Assess project health, architecture, and risks before adding new features.
  Use when: onboarding to legacy projects, starting new features on existing codebases, evaluating technical debt.
  Keywords: discovery, assessment, audit, legacy, health check, technical debt, 現況評估, 風險分析, 技術債, 專案盤點.
---

# Project Discovery Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/project-discovery/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-02-09
**Applicability**: All AI coding assistants

> **Utility Skill**: This skill combines existing UDS core standards into a structured discovery workflow. No dedicated core standard is required.

---

## Purpose

Before adding new features to an existing codebase, you need a clear picture of its current state. Phase 0 — Discovery — provides a systematic assessment of code health, architecture, documentation, dependencies, and risk so you can plan changes with confidence.

This skill guides you through 6 assessment steps, each referencing existing UDS standards for methodology and quality gates.

## Quick Reference

### Phase 0 Discovery Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Phase 0: Project Discovery                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  0.1  Code Health Check                                         │
│       └─ Test coverage, lint issues, code smells                │
│                                                                  │
│  0.2  Architecture Understanding                                │
│       └─ Entry points, module map, patterns                     │
│                                                                  │
│  0.3  Documentation Inventory                                   │
│       └─ READMEs, ADRs, changelogs, inline docs                │
│                                                                  │
│  0.4  Code Review Snapshot                                      │
│       └─ Sample audit of critical paths                         │
│                                                                  │
│  0.5  Dependency & Security Check                               │
│       └─ Outdated packages, known vulnerabilities               │
│                                                                  │
│  0.6  Impact Scope Analysis                                     │
│       └─ Change propagation, risk matrix                        │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  Output: Discovery Report (go / no-go / conditional)            │
│  Next:  /reverse → /spec → implement                            │
└─────────────────────────────────────────────────────────────────┘
```

### Step Summary

| Step | Focus | Key Output | UDS Standards Referenced |
|------|-------|------------|------------------------|
| 0.1 | Code Health | Test coverage %, lint score, code smell count | Testing, Reverse Engineering |
| 0.2 | Architecture | Module dependency diagram, pattern identification | AI-Friendly Architecture, Reverse Engineering |
| 0.3 | Documentation | Doc coverage matrix, staleness indicators | Documentation Structure, Changelog |
| 0.4 | Code Review | Critical path audit, quality snapshot | Anti-Hallucination, Code Review Checklist |
| 0.5 | Dependencies | Vulnerability report, outdated package list | Security, Check-in Standards |
| 0.6 | Impact Scope | Risk matrix, change propagation map | Requirement Engineering |

## Workflow Steps

### Step 0.1: Code Health Check

**Goal**: Establish a baseline measurement of code quality.

**Actions**:
1. Run existing test suite and record pass rate and coverage
2. Run linter and count warnings/errors
3. Identify code smells (long functions, deep nesting, duplicated logic)
4. Check for dead code and unused exports

**Output Format**:
```markdown
## Code Health Summary

| Metric | Value | Status |
|--------|-------|--------|
| Test pass rate | 85/100 (85%) | ⚠️ Below target |
| Test coverage | 42% | ❌ Low |
| Lint errors | 23 | ⚠️ Needs attention |
| Code smells | 7 major | ⚠️ Needs attention |
```

**Quality Gate**: If test pass rate < 70%, flag as high-risk before proceeding.

**Referenced Standards**:
- [Testing Standards](../../core/testing-standards.md)
- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md)

### Step 0.2: Architecture Understanding

**Goal**: Map the system structure and identify architectural patterns.

**Actions**:
1. Identify entry points (main files, API routes, event handlers)
2. Map module/package dependencies
3. Identify architectural pattern (MVC, DDD, microservices, monolith, etc.)
4. Note any anti-patterns (circular dependencies, god modules)
5. Assess AI-friendliness (clear boundaries, discoverable structure)

**Output Format**:
```markdown
## Architecture Overview

**Pattern**: [Confirmed] MVC with service layer
**Entry Points**: src/index.ts, src/api/routes.ts
**Module Count**: 24 modules across 6 packages

### Dependency Map (simplified)
routes → controllers → services → repositories → database

### Concerns
- [Confirmed] Circular dependency between UserService ↔ AuthService
- [Inferred] Tight coupling in payment module
```

**Quality Gate**: If no clear module boundaries exist, recommend architectural refactoring before feature work.

**Referenced Standards**:
- [AI-Friendly Architecture](../../core/ai-friendly-architecture.md)
- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md)

### Step 0.3: Documentation Inventory

**Goal**: Assess documentation completeness and freshness.

**Actions**:
1. Check for README, CONTRIBUTING, CHANGELOG
2. Scan for architecture decision records (ADRs)
3. Evaluate inline documentation (JSDoc, docstrings, comments)
4. Check if docs match current code state

**Output Format**:
```markdown
## Documentation Inventory

| Document | Exists | Last Updated | Current |
|----------|--------|-------------|---------|
| README.md | ✅ | 2025-06-15 | ⚠️ Stale |
| CHANGELOG.md | ❌ | — | — |
| API docs | ✅ | 2025-09-01 | ✅ Current |
| ADRs | ❌ | — | — |
| Inline docs | ⚠️ Partial | — | — |
```

**Quality Gate**: If README is missing or severely outdated, recommend documentation update as prerequisite.

**Referenced Standards**:
- [Documentation Structure](../../core/documentation-structure.md)
- [Changelog Standards](../../core/changelog-standards.md)

### Step 0.4: Code Review Snapshot

**Goal**: Sample-audit critical code paths for quality and correctness.

**Actions**:
1. Identify the 3-5 most critical code paths (auth, payment, data access, etc.)
2. Review each path using the Code Review Checklist
3. Apply Anti-Hallucination labels — only report what you have actually read
4. Note any security concerns or error handling gaps

**Output Format**:
```markdown
## Code Review Snapshot

### Critical Path: Authentication
[Confirmed] Reviewed src/auth/login.ts, src/auth/middleware.ts

| Aspect | Rating | Notes |
|--------|--------|-------|
| Error handling | ⚠️ | Missing catch for token refresh failure |
| Security | ✅ | bcrypt hashing, parameterized queries |
| Readability | ✅ | Clear naming, reasonable function length |

[Unknown] Token rotation policy — requires stakeholder input
```

**Quality Gate**: Any ❌ security finding requires immediate attention before feature work.

**Referenced Standards**:
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md)
- [Code Review Checklist](../../core/code-review-checklist.md)

### Step 0.5: Dependency & Security Check

**Goal**: Identify vulnerable, outdated, or unnecessary dependencies.

**Actions**:
1. Run `npm audit` / `pip audit` / equivalent for the project's ecosystem
2. List outdated packages with severity levels
3. Check for known CVEs in dependencies
4. Identify unused dependencies

**Output Format**:
```markdown
## Dependency Report

| Category | Count | Severity |
|----------|-------|----------|
| Critical vulnerabilities | 1 | ❌ High |
| High vulnerabilities | 3 | ⚠️ Medium |
| Outdated (major) | 5 | ⚠️ |
| Outdated (minor/patch) | 12 | ℹ️ |
| Unused dependencies | 2 | ℹ️ |
```

**Quality Gate**: Any critical vulnerability must be patched before adding new features.

**Referenced Standards**:
- [Security Standards](../../core/security-standards.md)
- [Check-in Standards](../../core/checkin-standards.md)

### Step 0.6: Impact Scope Analysis

**Goal**: Map how proposed changes would propagate through the system.

**Actions**:
1. Identify the feature area(s) to be modified
2. Trace direct and transitive dependencies
3. Assess blast radius (how many modules touched)
4. Build a risk matrix (likelihood vs. impact)

**Output Format**:
```markdown
## Impact Analysis

### Change Target: User profile module

**Blast Radius**: 6 modules directly affected, 3 transitively

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Break auth flow | Medium | High | Add integration tests |
| Payment regression | Low | Critical | Manual QA before deploy |
| API contract change | High | Medium | Version API endpoint |
```

**Quality Gate**: If blast radius exceeds 30% of total modules, recommend incremental approach.

**Referenced Standards**:
- [Requirement Engineering](../../core/requirement-engineering.md)

## Discovery Report Template

After completing all 6 steps, synthesize findings into a Discovery Report:

```markdown
# Discovery Report: [Project Name]

**Date**: YYYY-MM-DD
**Assessed by**: [AI / Human]

## Executive Summary
[1-2 sentences: overall project health and readiness]

## Verdict: [GO / NO-GO / CONDITIONAL]

## Key Findings
1. ...
2. ...
3. ...

## Blockers (if any)
- ...

## Recommendations
1. ...
2. ...

## Next Steps
- [ ] /reverse (if legacy code needs SDD specs)
- [ ] /spec (for new feature specification)
- [ ] Address blockers listed above
```

## Integration with Other Skills

### With /reverse (Reverse Engineering)

Use `/reverse` after discovery when:
- Architecture is poorly documented
- You need formal SDD specs for existing modules
- Legacy code needs structured analysis before changes

### With /spec (Spec-Driven Development)

Use `/spec` after discovery to:
- Write specifications for new features informed by discovery findings
- Reference the Discovery Report for risk assessment sections

### With /review (Code Review)

The Step 0.4 snapshot is a lightweight version of `/review`. Use full `/review` when:
- Discovery finds significant quality concerns
- A deeper audit is needed before planning changes

## Anti-Patterns to Avoid

### What NOT to Do

1. **Skipping Discovery**
   - Wrong: Jump straight into coding on an unfamiliar codebase
   - Right: Run `/discover` first to understand what you're working with

2. **Fabricating Metrics**
   - Wrong: "Test coverage is probably around 60%"
   - Right: "[Unknown] Test coverage — need to run test suite to measure"

3. **Incomplete Assessment**
   - Wrong: Only check code health, skip dependencies
   - Right: Complete all 6 steps for a reliable picture

4. **Ignoring Quality Gates**
   - Wrong: Proceed despite critical vulnerabilities
   - Right: Address blockers before adding complexity

## Best Practices

- Read all relevant code before making claims (Anti-Hallucination)
- Use certainty labels: `[Confirmed]`, `[Inferred]`, `[Unknown]`
- Include source citations with file:line references
- Clearly separate facts from recommendations
- Tailor depth to project size (small project = lighter assessment)

---

## Related Standards

- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md) — Deep code analysis methodology
- [Testing Standards](../../core/testing-standards.md) — Test coverage benchmarks
- [Security Standards](../../core/security-standards.md) — Vulnerability assessment
- [AI-Friendly Architecture](../../core/ai-friendly-architecture.md) — Architecture assessment criteria
- [Documentation Structure](../../core/documentation-structure.md) — Documentation completeness
- [Changelog Standards](../../core/changelog-standards.md) — Change tracking
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md) — Evidence-based analysis
- [Code Review Checklist](../../core/code-review-checklist.md) — Review methodology
- [Check-in Standards](../../core/checkin-standards.md) — Quality gates
- [Requirement Engineering](../../core/requirement-engineering.md) — Impact analysis

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-09 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
