# GitHub Copilot Instructions

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/github-copilot/copilot-instructions.md) | [简体中文](../../locales/zh-CN/integrations/github-copilot/copilot-instructions.md)

**Version**: 2.0.0
**Last Updated**: 2026-01-13

This file defines custom instructions for GitHub Copilot Chat to ensure compliance with Universal Dev Standards.

## Usage

Copy this file to `.github/copilot-instructions.md` in your repository.

---

# Universal Dev Standards Compliance

You are an expert AI coding assistant. You are required to follow the **Universal Dev Standards** defined in this project.

## 1. Core Protocol: Anti-Hallucination

Reference: `.standards/anti-hallucination.md`

1. **Evidence-Based Analysis**:
   - Always read the relevant files before answering.
   - Do not guess APIs, class names, or library versions.
   - If context is missing, ask the user to open the relevant file.

2. **Source Attribution**:
   - Cite your sources when explaining logic.
   - Format: `[Source: Code] path/to/file:line`

3. **Certainty Classification**:
   - Use tags: `[Confirmed]`, `[Inferred]`, `[Assumption]`, `[Unknown]`

4. **Recommendations**:
   - When presenting options, explicitly state a recommendation with reasoning.

---

## 2. Commit Message Standards

Reference: `.standards/commit-message-guide.md`

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance |

### Examples

```
feat(auth): add OAuth2 Google login support
fix(api): handle null response from payment gateway
docs(readme): update installation instructions
```

---

## 3. Code Review Checklist

Reference: `.standards/code-review-checklist.md`

### Comment Prefixes

| Prefix | Meaning | Action |
|--------|---------|--------|
| **❗ BLOCKING** | Must fix before merge | Required |
| **⚠️ IMPORTANT** | Should fix | Recommended |
| **💡 SUGGESTION** | Nice-to-have | Optional |
| **❓ QUESTION** | Need clarification | Discuss |
| **📝 NOTE** | Informational | None |

### Review Categories

1. **Functionality** - Does it work correctly?
2. **Design** - Right architecture and patterns?
3. **Quality** - Clean code, no smells?
4. **Readability** - Easy to understand?
5. **Tests** - Adequate coverage?
6. **Security** - No vulnerabilities?
7. **Performance** - Efficient?
8. **Error Handling** - Properly handled?
9. **Documentation** - Updated?
10. **Dependencies** - Necessary and safe?

---

## 4. Test-Driven Development (TDD)

Reference: `.standards/test-driven-development.md`

### TDD Cycle

```
🔴 RED → 🟢 GREEN → 🔵 REFACTOR
```

| Phase | Action | Rule |
|-------|--------|------|
| 🔴 RED | Write failing test | Test describes behavior, not implementation |
| 🟢 GREEN | Minimum code to pass | "Fake it" is acceptable |
| 🔵 REFACTOR | Clean up | Run tests after EVERY change |

### FIRST Principles

| Principle | Requirement |
|-----------|-------------|
| **F**ast | < 100ms per unit test |
| **I**ndependent | No shared state |
| **R**epeatable | Same result always |
| **S**elf-validating | Clear pass/fail |
| **T**imely | Test before code |

---

## 5. Test Coverage: 7 Dimensions

Reference: `.standards/test-completeness-dimensions.md`

### The 7 Dimensions

| # | Dimension | What to Test |
|---|-----------|--------------|
| 1 | **Happy Path** | Valid input → expected output |
| 2 | **Boundary** | Min/max values, limits |
| 3 | **Error Handling** | Invalid input, not found |
| 4 | **Authorization** | Role permissions |
| 5 | **State Changes** | Before/after states |
| 6 | **Validation** | Format, business rules |
| 7 | **Integration** | Real DB/API calls |

### Feature Type → Required Dimensions

| Feature Type | Required Dimensions |
|--------------|---------------------|
| CRUD API | 1, 2, 3, 4, 6, 7 |
| Query/Search | 1, 2, 3, 4, 7 |
| State Machine | 1, 3, 4, 5, 6 |
| Validation | 1, 2, 3, 6 |
| Background Job | 1, 3, 5 |

---

## 6. Pre-Commit Checklist

Reference: `.standards/checkin-standards.md`

### Mandatory Checks

```
□ BUILD: Code compiles (zero errors)
□ TESTS: All tests pass (100%)
□ QUALITY: Follows coding standards, no secrets
□ DOCS: Updated if needed
□ WORKFLOW: Branch naming + commit message correct
```

### Never Commit When

- ❌ Build has errors
- ❌ Tests are failing
- ❌ Feature incomplete (would break functionality)
- ❌ Contains WIP/TODO in critical logic
- ❌ Contains debugging code (console.log, print)
- ❌ Contains commented-out code blocks

### Ideal Commit Size

- Files: 1-10 (split if > 10)
- Lines: 50-300
- Scope: Single concern

---

## 7. Requirement Writing (INVEST)

Reference: `.standards/requirement-writing.md`

### User Story Format

```
As a [role],
I want [feature],
So that [benefit].
```

### INVEST Criteria

| Criterion | Question |
|-----------|----------|
| **I**ndependent | Can be delivered alone? |
| **N**egotiable | Details can be discussed? |
| **V**aluable | Provides user value? |
| **E**stimable | Can estimate effort? |
| **S**mall | Fits in one sprint? |
| **T**estable | Has clear acceptance criteria? |

### Acceptance Criteria

Good: Specific, Measurable, Testable
```
✅ User can upload files up to 10MB
✅ System responds within 500ms (95th percentile)
❌ System should be fast (not measurable)
```

---

## 8. Spec-Driven Development (SDD) Priority

**Rule**: When an SDD tool (OpenSpec, Spec Kit, etc.) is integrated, prioritize using its commands over manual file editing.

**Detection**:
- OpenSpec: `openspec/` directory or `openspec.json`
- Spec Kit: `specs/` directory or `.speckit` configuration

---

## Related Standards

- [Anti-Hallucination](../../core/anti-hallucination.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [Code Review Checklist](../../core/code-review-checklist.md)
- [Testing Standards](../../core/testing-standards.md)
- [Test Completeness Dimensions](../../core/test-completeness-dimensions.md)
- [Checkin Standards](../../core/checkin-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-13 | Major enhancement: Added TDD, Test Coverage, Code Review, Checkin, Requirement sections |
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial GitHub Copilot integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
