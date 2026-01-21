# Copilot Chat Reference

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/github-copilot/COPILOT-CHAT-REFERENCE.md) | [简体中文](../../locales/zh-CN/integrations/github-copilot/COPILOT-CHAT-REFERENCE.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-21

This document provides prompt templates for GitHub Copilot Chat to achieve similar functionality to Claude Code slash commands.

---

## Why This Document?

GitHub Copilot does not support slash commands like Claude Code. This reference provides standardized prompts you can use in Copilot Chat to achieve similar results.

---

## Prompt Templates

### 1. Commit Message Generation

**Claude Code**: `/commit`

**Copilot Chat Prompt**:
```
Generate a commit message for these changes following Conventional Commits format:
- Type: feat, fix, docs, style, refactor, test, or chore
- Format: type(scope): description
- Keep subject line under 50 characters
```

**Example**:
```
Generate a commit message for the changes I just made to the authentication module.
Use Conventional Commits format: type(scope): description
```

---

### 2. Code Review

**Claude Code**: `/review`

**Copilot Chat Prompt**:
```
Review this code following the code review checklist:

1. Functionality - Does it work correctly?
2. Design - Right architecture?
3. Quality - Clean code, no code smells?
4. Security - No vulnerabilities?
5. Tests - Adequate coverage?
6. Performance - Efficient?

Use these comment prefixes:
- ❗ BLOCKING: Must fix
- ⚠️ IMPORTANT: Should fix
- 💡 SUGGESTION: Nice to have
- ❓ QUESTION: Need clarification
```

---

### 3. TDD Guidance

**Claude Code**: `/tdd`

**Copilot Chat Prompt**:
```
Help me implement [feature] using TDD (Test-Driven Development):

1. RED: Write a failing test first
   - Test should describe behavior, not implementation
   - Use AAA pattern (Arrange-Act-Assert)

2. GREEN: Write minimum code to pass
   - "Fake it" is acceptable
   - Don't over-engineer

3. REFACTOR: Clean up while keeping tests green
   - Run tests after every change

Follow FIRST principles: Fast, Independent, Repeatable, Self-validating, Timely
```

---

### 4. Test Coverage Analysis

**Claude Code**: `/coverage`

**Copilot Chat Prompt**:
```
Analyze test coverage for [feature] using the 7 dimensions:

1. Happy Path - Normal expected behavior
2. Boundary - Min/max values, limits
3. Error Handling - Invalid input, exceptions
4. Authorization - Role-based access
5. State Changes - Before/after verification
6. Validation - Format, business rules
7. Integration - Real DB/API queries

Which dimensions are missing? What tests should I add?
```

---

### 5. Requirement Writing

**Claude Code**: `/requirement`

**Copilot Chat Prompt**:
```
Help me write a user story following INVEST criteria:

Format:
As a [role],
I want [feature],
So that [benefit].

INVEST Checklist:
- Independent: Can be delivered alone?
- Negotiable: Details can be discussed?
- Valuable: Provides user value?
- Estimable: Can estimate effort?
- Small: Fits in one sprint?
- Testable: Has clear acceptance criteria?

Include specific, measurable acceptance criteria.
```

---

### 6. Pre-Commit Check

**Claude Code**: `/check`

**Copilot Chat Prompt**:
```
Before I commit, verify these quality gates:

□ BUILD: Does code compile without errors?
□ TESTS: Do all tests pass?
□ QUALITY: Does code follow standards? Any secrets?
□ DOCS: Is documentation updated?
□ WORKFLOW: Is branch naming and commit message correct?

Should I NOT commit if:
- Build errors exist
- Tests are failing
- Feature is incomplete
- Contains debugging code (console.log)
- Contains commented-out code
```

---

### 7. Release Preparation

**Claude Code**: `/release`

**Copilot Chat Prompt**:
```
Help me prepare a release following semantic versioning:

Version format: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

Tasks:
1. What version should this be?
2. Generate CHANGELOG entry with:
   - Added: New features
   - Changed: Changes to existing features
   - Fixed: Bug fixes
   - Deprecated: Features to be removed
   - Removed: Removed features
   - Security: Security fixes
```

---

### 8. Documentation

**Claude Code**: `/docs`

**Copilot Chat Prompt**:
```
Help me write documentation for this [function/module/API]:

Include:
1. Purpose - What does it do?
2. Parameters - Input parameters with types
3. Return value - What it returns
4. Examples - Usage examples
5. Errors - Possible error conditions
6. Related - Related functions/modules
```

---

### 9. Refactoring Guidance

**Claude Code**: `/refactor`

**Copilot Chat Prompt (Decision Tree)**:
```
Help me decide whether to refactor or rewrite this code. Answer these questions:

1. Is the code currently working in production? [Y/N]
   → N: Consider rewrite (lower risk)
2. Do I understand what the code does? [Y/N]
   → N: Write characterization tests first
3. Is test coverage > 60%? [Y/N]
   → N: Add tests first
4. Is the core architecture salvageable? [Y/N]
   → N: Use Strangler Fig pattern (gradual replacement)
   → Y: Use incremental refactoring

Based on my answers, recommend the appropriate strategy.
```

**Copilot Chat Prompt (Tactical Refactoring)**:
```
Suggest tactical refactoring improvements for this code:

**Boy Scout Rule** (small, opportunistic cleanup):
- Rename confusing variables
- Extract methods
- Remove dead code
- Minutes, not hours

**Preparatory Refactoring** (before adding features):
- "First make the change easy, then make the easy change" - Kent Beck
- Restructure to accommodate new requirements
- Separate commit from feature work

Which approach fits my situation?
```

**Copilot Chat Prompt (Legacy Code Safety)**:
```
Help me safely refactor this legacy code:

1. **Characterization Tests** (do this FIRST):
   - Call the code, write assertion expected to fail
   - Update assertion to match actual behavior
   - Repeat until behavior is captured

2. **Find Seams**:
   - Object seams (polymorphism)
   - Link seams (dependency injection)

3. **Sprout/Wrap Techniques**:
   - Sprout Method: New logic in new testable method
   - Wrap Method: Add behavior before/after existing code

Start by helping me write characterization tests.
```

**Copilot Chat Prompt (Strategic Refactoring)**:
```
I need to do a large-scale refactoring. Help me choose between:

1. **Strangler Fig**: Gradually replace legacy system
   - Use when: Replacing entire system, need continuous operation
   - How: Intercept → Migrate → Complete

2. **Anti-Corruption Layer (ACL)**: Translate between old and new
   - Use when: Must coexist with legacy system
   - How: Create Facade + Adapter + Translator layer

3. **Branch by Abstraction**: Refactor shared code on trunk
   - Use when: Long-term refactoring, no feature branches
   - How: Introduce abstraction → Add new implementation → Switch → Remove old

Which pattern fits my situation? My constraints are: [describe situation]
```

Reference: `core/refactoring-standards.md`

---

## Quick Reference Card

| Task | Copilot Chat Prompt Start |
|------|---------------------------|
| Commit | "Generate commit message following Conventional Commits..." |
| Review | "Review this code following the checklist..." |
| TDD | "Help me implement using TDD..." |
| Coverage | "Analyze test coverage using 7 dimensions..." |
| Requirement | "Write user story following INVEST..." |
| Pre-commit | "Verify these quality gates before commit..." |
| Release | "Prepare release following semantic versioning..." |
| Docs | "Write documentation for this..." |
| Refactor | "Help me decide whether to refactor or rewrite..." |
| Tactical | "Suggest tactical refactoring improvements..." |
| Legacy | "Help me safely refactor this legacy code..." |

---

## Best Practices

### 1. Be Specific

```
❌ "Review this code"
✅ "Review this authentication module for security vulnerabilities and test coverage"
```

### 2. Provide Context

```
❌ "Write tests"
✅ "Write unit tests for the calculateDiscount function, covering boundary values and error cases"
```

### 3. Reference Standards

```
"Following the project's anti-hallucination standards, verify your suggestions by reading the actual code first"
```

### 4. Ask for Reasoning

```
"Explain why you made this recommendation with [Confirmed] or [Assumption] tags"
```

---

## Related Resources

- [copilot-instructions.md](./copilot-instructions.md) - Full standards reference
- [skills-mapping.md](./skills-mapping.md) - Claude Code skills mapping

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-21 | Added refactoring guidance prompts (decision tree, tactical, legacy, strategic) |
| 1.0.0 | 2026-01-13 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
