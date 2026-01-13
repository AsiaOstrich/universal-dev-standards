# Copilot Chat Reference

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/github-copilot/COPILOT-CHAT-REFERENCE.md) | [简体中文](../../locales/zh-CN/integrations/github-copilot/COPILOT-CHAT-REFERENCE.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-13

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
| 1.0.0 | 2026-01-13 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
