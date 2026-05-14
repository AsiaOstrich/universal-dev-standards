# GitHub Copilot Instructions

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/github-copilot/copilot-instructions.md) | [简体中文](../../locales/zh-CN/integrations/github-copilot/copilot-instructions.md)

**Version**: 2.1.0
**Last Updated**: 2026-01-25

This file defines custom instructions for GitHub Copilot Chat to ensure compliance with Universal Dev Standards.

## Usage

Copy this file to `.github/copilot-instructions.md` in your repository.

---

# Universal Dev Standards Compliance

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

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

Reference: `.standards/commit-message.ai.yaml`

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

## 4. Workflow Enforcement Gates

**CRITICAL**: Before executing any workflow phase command, you MUST check prerequisites.

### Session Start Protocol
At session start, check for active workflows: `ls .workflow-state/*.yaml 2>/dev/null`
If active workflows found → inform user and offer to resume.

### Phase Gates

| Workflow | Phase | Prerequisite | On Failure |
|---------|-------|-------------|------------|
| SDD | implement | Spec status = Approved | → `/sdd approve` |
| SDD | verify | All ACs have code + tests | → `/sdd implement` |
| TDD | GREEN | Failing test exists | → Stay in RED |
| TDD | REFACTOR | All tests passing | → Stay in GREEN |
| BDD | AUTOMATION | `.feature` file exists | → FORMULATION |
| Commit | feat/fix | Check active specs | → Suggest `Refs: SPEC-XXX` |

**NEVER** write implementation code before a failing test exists (TDD).
**NEVER** write step definitions before `.feature` files exist (BDD).

Reference: `.standards/workflow-enforcement.ai.yaml`

---

## 5. Test-Driven Development (TDD)

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

## 6. Test Coverage: 8 Dimensions

Reference: `.standards/test-completeness-dimensions.md`

### The 8 Dimensions

| # | Dimension | What to Test |
|---|-----------|--------------|
| 1 | **Happy Path** | Valid input → expected output |
| 2 | **Boundary** | Min/max values, limits |
| 3 | **Error Handling** | Invalid input, not found |
| 4 | **Authorization** | Role permissions |
| 5 | **State Changes** | Before/after states |
| 6 | **Validation** | Format, business rules |
| 7 | **Integration** | Real DB/API calls |
| 8 | **AI Generation** | AI-generated test quality |

### Feature Type → Required Dimensions

| Feature Type | Required Dimensions |
|--------------|---------------------|
| CRUD API | 1, 2, 3, 4, 6, 7, 8* |
| Query/Search | 1, 2, 3, 4, 7, 8* |
| State Machine | 1, 3, 4, 5, 6, 8* |
| Validation | 1, 2, 3, 6, 8* |
| Background Job | 1, 3, 5, 8* |

*Dimension 8 applies when tests are AI-generated

---

## 7. Pre-Commit Checklist

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

## 8. Requirement Writing (INVEST)

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

## 9. Spec-Driven Development (SDD) Priority

**Rule**: When an SDD tool (OpenSpec, Spec Kit, etc.) is integrated, prioritize using its commands over manual file editing.

**Detection**:
- OpenSpec: `openspec/` directory or `openspec.json`
- Spec Kit: `specs/` directory or `.speckit` configuration

---

## 10. AI Response Navigation / AI 回應導航

**Rule**: Every substantive AI response MUST end with a Navigation Footer suggesting next steps.
**規則**：每個實質性的 AI 回應結尾必須包含導航區塊，建議下一步行動。

**Key behaviors / 關鍵行為**:
- Append navigation suggestions after completing tasks, providing analysis, asking questions, or reporting errors
- Mark the recommended option with ⭐ when providing multiple choices
- Use contextual templates (task completed, user question, error/failure, in progress, informational reply)
- Adapt option count to context (1-5, never exceed 5)
- Prefer slash commands in suggestions when applicable

**豁免 / Exemption**: Ultra-short confirmations ("OK", "Done") may omit navigation.

Reference: `.standards/ai-response-navigation.ai.yaml` (or `core/ai-response-navigation.md`)

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
| 2.1.0 | 2026-01-25 | Updated: Test Coverage 7 dimensions → 8 dimensions (added AI Generation) |
| 2.0.0 | 2026-01-13 | Major enhancement: Added TDD, Test Coverage, Code Review, Checkin, Requirement sections |
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial GitHub Copilot integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).


## Available UDS Slash Commands | UDS 可用命令

> Auto-generated index for SPEC-INTSYNC-001 sync compliance. The authoritative descriptions live in `skills/commands/*.md` and `skills/commands/COMMAND-INDEX.json`.

> 為 SPEC-INTSYNC-001 同步合規自動產生的索引。權威描述位於 `skills/commands/*.md` 與 `COMMAND-INDEX.json`。

### core

- `/commit`
- `/review`
- `/sdd`
- `/check`
- `/init`
- `/update`
- `/config`

### testing

- `/tdd`
- `/bdd`
- `/atdd`
- `/e2e`
- `/coverage`
- `/ac-coverage`
- `/derive`
- `/derive-bdd`
- `/derive-tdd`
- `/derive-atdd`
- `/derive-all`

### quality

- `/checkin`
- `/refactor`
- `/scan`
- `/security`
- `/reverse`
- `/reverse-sdd`
- `/reverse-bdd`
- `/reverse-tdd`

### docs

- `/docs`
- `/docgen`
- `/changelog`
- `/requirement`
- `/brainstorm`
- `/sdd-retro`
- `/pr`

### ops

- `/observability`
- `/slo`
- `/runbook`
- `/incident`
- `/metrics`
- `/durable`
- `/ci-cd`

### methodology

- `/methodology`
- `/dev-workflow`
- `/discover`
- `/release`
- `/audit`
- `/migrate`

### reference

- `/database`
- `/api-design`
