# Project Discovery Workflow Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/project-discovery/workflow.md)

**Version**: 1.0.0
**Last Updated**: 2026-02-09

---

## Overview

This guide provides detailed execution instructions for each step of the Phase 0 Discovery workflow. Use this as a companion to the [Project Discovery SKILL](./SKILL.md).

```
┌─────────────────────────────────────────────────────────────────┐
│                Phase 0: Discovery Pipeline                       │
│                                                                  │
│  Input: Existing codebase + proposed feature area               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 0.1 Code │→│ 0.2 Arch │→│ 0.3 Docs │                       │
│  │  Health   │  │  Review  │  │ Inventory│                       │
│  └──────────┘  └──────────┘  └──────────┘                      │
│       │              │              │                             │
│       ▼              ▼              ▼                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 0.4 Code │→│ 0.5 Deps │→│ 0.6 Impact│                      │
│  │  Review   │  │ Security │  │  Scope   │                       │
│  └──────────┘  └──────────┘  └──────────┘                      │
│       │              │              │                             │
│       └──────────────┴──────────────┘                            │
│                      │                                           │
│                      ▼                                           │
│              Discovery Report                                    │
│          (go / no-go / conditional)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 0.1: Code Health Check

### Objective

Establish a quantitative baseline of the codebase's current quality.

### Procedure

#### 0.1.1 Run Test Suite

```bash
# Example commands (adapt to your project)
npm test                    # Node.js
pytest --cov               # Python
dotnet test                # .NET
./gradlew test             # Java/Kotlin
```

Record:
- Total tests, passed, failed, skipped
- Coverage percentage (line, branch if available)
- Execution time

#### 0.1.2 Run Linter

```bash
# Example commands
npm run lint               # ESLint
flake8 .                   # Python
dotnet format --verify-no-changes  # .NET
```

Record:
- Error count
- Warning count
- Most frequent rule violations

#### 0.1.3 Identify Code Smells

Look for:
- Functions exceeding 50 lines
- Files exceeding 500 lines
- Nesting depth > 4 levels
- Duplicated code blocks
- God classes / modules with too many responsibilities

#### 0.1.4 Check Dead Code

- Unused exports
- Unreachable code paths
- Commented-out code blocks
- Deprecated functions still present

### Output Template

```markdown
### Step 0.1 Results: Code Health

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Tests passing | X/Y | 100% | ✅/⚠️/❌ |
| Test coverage | X% | ≥ 60% | ✅/⚠️/❌ |
| Lint errors | X | 0 | ✅/⚠️/❌ |
| Lint warnings | X | < 20 | ✅/⚠️/❌ |
| Major code smells | X | < 5 | ✅/⚠️/❌ |
| Dead code files | X | 0 | ✅/⚠️/❌ |

**Health Score**: [Good / Needs Attention / Critical]
```

### Quality Gate

| Condition | Action |
|-----------|--------|
| Test pass rate < 70% | ❌ Flag as high-risk. Recommend fixing tests first. |
| Coverage < 30% | ⚠️ Recommend adding tests before new features. |
| Critical lint errors | ⚠️ Address before proceeding. |

### Referenced Standards

- [Testing Standards](../../core/testing-standards.md) — Coverage targets, test pyramid
- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md) — Code scanning methodology

---

## Step 0.2: Architecture Understanding

### Objective

Map the system's structure, identify patterns, and assess maintainability.

### Procedure

#### 0.2.1 Identify Entry Points

- Main application file (e.g., `index.ts`, `main.py`, `Program.cs`)
- API route definitions
- Event handlers / message consumers
- Scheduled jobs / cron tasks
- CLI entry points

#### 0.2.2 Map Module Dependencies

Trace the dependency graph:
```
entry point → routing → controllers → services → repositories → database
                                    → external APIs
                                    → message queues
```

Look for:
- Circular dependencies
- Overly broad imports
- Tight coupling between unrelated modules

#### 0.2.3 Identify Architectural Pattern

| Pattern | Indicators |
|---------|-----------|
| MVC | controllers/, models/, views/ directories |
| DDD | domain/, application/, infrastructure/ directories |
| Microservices | Multiple service directories, API gateways |
| Monolith | Single large application directory |
| Hexagonal | ports/, adapters/ directories |
| Event-Driven | Event handlers, message queues, pub/sub |

#### 0.2.4 Assess AI-Friendliness

Check against [AI-Friendly Architecture](../../core/ai-friendly-architecture.md):
- Clear module boundaries?
- Discoverable project structure?
- Consistent naming conventions?
- Documented interfaces?

### Output Template

```markdown
### Step 0.2 Results: Architecture

**Identified Pattern**: [Pattern name] [Confirmed/Inferred]
**Module Count**: X modules across Y packages
**Entry Points**: [list]

#### Dependency Overview
[Simplified dependency diagram]

#### Concerns
- [Confirmed/Inferred] [Description with source: file:line]

#### AI-Friendliness Score
| Dimension | Rating | Notes |
|-----------|--------|-------|
| Discoverability | ✅/⚠️/❌ | ... |
| Module boundaries | ✅/⚠️/❌ | ... |
| Naming consistency | ✅/⚠️/❌ | ... |
| Interface clarity | ✅/⚠️/❌ | ... |
```

### Quality Gate

| Condition | Action |
|-----------|--------|
| No clear module boundaries | ⚠️ Recommend architectural refactoring plan. |
| Circular dependencies | ⚠️ Document and plan resolution. |
| Unknown pattern | Flag as [Unknown] — requires stakeholder input. |

### Referenced Standards

- [AI-Friendly Architecture](../../core/ai-friendly-architecture.md)
- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md)

---

## Step 0.3: Documentation Inventory

### Objective

Assess what documentation exists, its completeness, and freshness.

### Procedure

#### 0.3.1 Check Standard Documents

| Document | Check |
|----------|-------|
| README.md | Exists? Setup instructions? Current? |
| CONTRIBUTING.md | Exists? Covers workflow? |
| CHANGELOG.md | Exists? Format? Last entry? |
| LICENSE | Exists? Correct? |
| API documentation | Exists? Auto-generated? Current? |
| ADRs (Architecture Decision Records) | Exist? Organized? |

#### 0.3.2 Evaluate Inline Documentation

- Function/method JSDoc/docstrings coverage
- Module-level documentation
- Complex algorithm explanations
- TODO/FIXME/HACK comment count

#### 0.3.3 Assess Documentation Freshness

Compare document dates against recent code changes:
- If docs haven't been updated in 6+ months but code changed significantly → Stale
- If docs reference removed features or old APIs → Outdated

### Output Template

```markdown
### Step 0.3 Results: Documentation

| Document | Exists | Last Updated | Status |
|----------|--------|-------------|--------|
| README.md | ✅/❌ | YYYY-MM-DD | ✅ Current / ⚠️ Stale / ❌ Missing |
| CONTRIBUTING.md | ✅/❌ | ... | ... |
| CHANGELOG.md | ✅/❌ | ... | ... |
| API docs | ✅/❌ | ... | ... |
| ADRs | ✅/❌ | ... | ... |
| Inline docs | ⚠️ Partial | ... | ... |

**Documentation Score**: [Good / Needs Attention / Critical]
**TODO/FIXME count**: X
```

### Quality Gate

| Condition | Action |
|-----------|--------|
| No README | ❌ Create README before proceeding. |
| Docs severely outdated (> 1 year) | ⚠️ Flag as documentation debt. |
| No CHANGELOG | ⚠️ Recommend adding changelog tracking. |

### Referenced Standards

- [Documentation Structure](../../core/documentation-structure.md)
- [Changelog Standards](../../core/changelog-standards.md)

---

## Step 0.4: Code Review Snapshot

### Objective

Perform a targeted quality audit of the most critical code paths.

### Procedure

#### 0.4.1 Identify Critical Paths

Select 3-5 paths based on:
- Business criticality (auth, payments, data access)
- Complexity (most complex modules)
- Change frequency (most modified files)
- Relevance to planned feature work

#### 0.4.2 Apply Code Review Checklist

For each critical path, evaluate:

| Category | Check |
|----------|-------|
| Functionality | Does it work correctly? Edge cases handled? |
| Security | Input validation? SQL injection? XSS? Auth checks? |
| Error handling | Try/catch? Graceful degradation? Error logging? |
| Readability | Clear naming? Reasonable function length? |
| Performance | Obvious bottlenecks? N+1 queries? Memory leaks? |

#### 0.4.3 Apply Anti-Hallucination Labels

**CRITICAL**: Only report what you have actually read.

- `[Confirmed]` — Directly verified in code
- `[Inferred]` — Logical deduction from patterns
- `[Unknown]` — Not verified, needs investigation

### Output Template

```markdown
### Step 0.4 Results: Code Review Snapshot

#### Critical Path 1: [Name]
[Confirmed] Reviewed: [file list with line ranges]

| Aspect | Rating | Notes |
|--------|--------|-------|
| Functionality | ✅/⚠️/❌ | ... |
| Security | ✅/⚠️/❌ | ... |
| Error handling | ✅/⚠️/❌ | ... |
| Readability | ✅/⚠️/❌ | ... |
| Performance | ✅/⚠️/❌ | ... |

**Findings**: [list with certainty labels]
```

### Quality Gate

| Condition | Action |
|-----------|--------|
| Security vulnerability found | ❌ Must fix before adding features. |
| Critical error handling gaps | ⚠️ Address before proceeding. |

### Referenced Standards

- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md)
- [Code Review Checklist](../../core/code-review-checklist.md)

---

## Step 0.5: Dependency & Security Check

### Objective

Identify vulnerable, outdated, or unnecessary dependencies.

### Procedure

#### 0.5.1 Run Security Audit

```bash
# Node.js
npm audit

# Python
pip-audit
safety check

# .NET
dotnet list package --vulnerable

# Go
govulncheck ./...
```

#### 0.5.2 Check Outdated Packages

```bash
# Node.js
npm outdated

# Python
pip list --outdated

# .NET
dotnet list package --outdated
```

#### 0.5.3 Identify Unused Dependencies

```bash
# Node.js
npx depcheck

# Python
pip-extra-reqs --requirements-file=requirements.txt .
```

#### 0.5.4 Assess License Compliance

Check for incompatible licenses in dependency tree.

### Output Template

```markdown
### Step 0.5 Results: Dependencies

| Category | Count | Details |
|----------|-------|---------|
| Critical vulnerabilities | X | [list CVE IDs] |
| High vulnerabilities | X | ... |
| Outdated (major version) | X | ... |
| Outdated (minor/patch) | X | ... |
| Unused dependencies | X | [list package names] |
| License concerns | X | ... |

**Security Score**: [Good / Needs Attention / Critical]
```

### Quality Gate

| Condition | Action |
|-----------|--------|
| Critical CVE | ❌ Must patch before adding features. |
| > 5 high vulnerabilities | ⚠️ Plan remediation sprint. |
| Unused dependencies | ℹ️ Clean up to reduce attack surface. |

### Referenced Standards

- [Security Standards](../../core/security-standards.md)
- [Check-in Standards](../../core/checkin-standards.md)

---

## Step 0.6: Impact Scope Analysis

### Objective

Map how the proposed changes would propagate through the system and assess risk.

### Procedure

#### 0.6.1 Define Change Target

Clearly state:
- What feature area will be modified?
- What modules will be directly touched?
- What is the expected change type (add, modify, refactor)?

#### 0.6.2 Trace Dependencies

For each directly modified module:
1. List modules that import/depend on it
2. List modules it imports/depends on
3. Count total affected modules (direct + transitive)

#### 0.6.3 Build Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Description] | Low/Med/High | Low/Med/High/Critical | [Action] |

Likelihood factors:
- Code complexity of affected area
- Test coverage of affected area
- Number of modules touched

Impact factors:
- Business criticality of affected functionality
- User-facing vs. internal
- Data integrity implications

#### 0.6.4 Determine Verdict

| Blast Radius | Recommendation |
|-------------|----------------|
| < 10% of modules | ✅ GO — Low risk, proceed normally |
| 10-30% of modules | ⚠️ CONDITIONAL — Add integration tests first |
| > 30% of modules | ❌ NO-GO — Break into smaller changes |

### Output Template

```markdown
### Step 0.6 Results: Impact Scope

**Change Target**: [Feature/module name]
**Blast Radius**: X modules directly, Y transitively (Z% of total)

#### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | ... | ... | ... |

**Verdict**: [GO / CONDITIONAL / NO-GO]
**Rationale**: [1-2 sentences]
```

### Referenced Standards

- [Requirement Engineering](../../core/requirement-engineering.md)

---

## Synthesizing the Discovery Report

After completing all 6 steps, combine findings into a single report.

### Report Structure

```markdown
# Discovery Report: [Project Name]

**Date**: YYYY-MM-DD
**Assessed by**: [AI assistant / Developer name]
**Scope**: [Feature area or full project]

## Executive Summary
[2-3 sentences: overall health, key risks, recommendation]

## Verdict: [GO / NO-GO / CONDITIONAL]

## Scores Summary

| Area | Score | Critical Issues |
|------|-------|----------------|
| Code Health (0.1) | ✅/⚠️/❌ | X |
| Architecture (0.2) | ✅/⚠️/❌ | X |
| Documentation (0.3) | ✅/⚠️/❌ | X |
| Code Quality (0.4) | ✅/⚠️/❌ | X |
| Dependencies (0.5) | ✅/⚠️/❌ | X |
| Impact Scope (0.6) | ✅/⚠️/❌ | X |

## Blockers
[List any items that must be resolved before proceeding]

## Recommendations
[Ordered by priority]

## Next Steps
- [ ] Address blockers
- [ ] /reverse — if legacy code needs SDD specs
- [ ] /spec — write specifications for new features
- [ ] Begin implementation
```

### Verdict Decision Matrix

| Blockers | High Risks | Verdict |
|----------|-----------|---------|
| 0 | 0-2 | ✅ GO |
| 0 | 3+ | ⚠️ CONDITIONAL — address risks first |
| 1+ | Any | ❌ NO-GO — resolve blockers |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-09 | Initial release |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
