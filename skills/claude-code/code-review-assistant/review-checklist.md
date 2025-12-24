# Code Review Checklist

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/code-review-assistant/review-checklist.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Claude Code Skills

---

## Purpose

This document provides a comprehensive checklist for code review to ensure code quality and standards compliance.

---

## 1. Functionality

- [ ] **Code does what it's supposed to do**
  - Requirement/spec alignment verified
  - Acceptance criteria met
  - Edge cases handled

- [ ] **No obvious bugs**
  - Null/undefined checks present
  - Array bounds checked
  - Error conditions handled

- [ ] **Logic is correct**
  - Conditions make sense
  - Loops terminate properly
  - Calculations are accurate

---

## 2. Design & Architecture

- [ ] **Follows project architecture**
  - Layering respected
  - Separation of concerns maintained
  - Dependency direction correct

- [ ] **Appropriate design patterns used**
  - Not over-engineered
  - Not under-engineered
  - Patterns applied correctly

- [ ] **Code is in the right place**
  - Files organized logically
  - Related code grouped together

---

## 3. Code Quality

- [ ] **Follows coding standards**
  - Naming conventions adhered to
  - Formatting consistent
  - Style guide followed

- [ ] **No code smells**
  - Methods ≤50 lines
  - Classes have single responsibility
  - Cyclomatic complexity ≤10
  - No deeply nested conditionals (≤3 levels)

- [ ] **DRY principle applied**
  - No duplicated code blocks
  - Common logic extracted

---

## 4. Readability

- [ ] **Code is easy to understand**
  - Variable names are descriptive
  - Function names reveal intent
  - Logic flows naturally

- [ ] **Comments are helpful**
  - Complex logic explained
  - WHY documented, not WHAT
  - No commented-out code

---

## 5. Testing

- [ ] **Tests are present**
  - New code has tests
  - Tests cover happy path
  - Tests cover error cases
  - Edge cases tested

- [ ] **Tests are good quality**
  - Tests are readable
  - Test names describe scenarios
  - Assertions are clear
  - No flaky tests

- [ ] **Test coverage maintained**
  - Coverage not decreased
  - Critical paths covered

---

## 6. Security

- [ ] **No security vulnerabilities**
  - No SQL injection risks
  - No XSS vulnerabilities
  - No hardcoded secrets
  - No insecure dependencies

- [ ] **Input validation present**
  - User input sanitized
  - Type checking performed
  - Size limits enforced

- [ ] **Auth/Authorization correct**
  - Proper auth checks
  - Role-based access enforced
  - Sensitive data protected

---

## 7. Performance

- [ ] **No obvious performance issues**
  - No N+1 queries
  - No unnecessary loops
  - No blocking operations in hot paths

- [ ] **Efficient algorithms used**
  - Complexity considered
  - Appropriate data structures
  - Caching where beneficial

- [ ] **Resource management proper**
  - Connections closed
  - Memory leaks prevented
  - File handles released

---

## 8. Error Handling

- [ ] **Errors handled appropriately**
  - Try-catch blocks present
  - Specific exceptions caught
  - Generic catch avoided

- [ ] **Error messages helpful**
  - Messages are descriptive
  - Actionable information included
  - No sensitive data exposed

- [ ] **Logging is adequate**
  - Errors logged with context
  - Log levels appropriate
  - No excessive logging

---

## 9. Documentation

- [ ] **API documentation present**
  - Public methods documented
  - Parameters explained
  - Return values described
  - Exceptions documented

- [ ] **README updated if needed**
  - New features documented
  - Setup instructions current

- [ ] **CHANGELOG updated (if applicable)**
  - User-facing changes added to `[Unreleased]`
  - Breaking changes marked with **BREAKING**

---

## 10. Dependencies

- [ ] **Dependencies justified**
  - New dependencies necessary
  - License compatible
  - No security vulnerabilities
  - Actively maintained

- [ ] **Dependency versions locked**
  - Exact versions specified
  - Lock file updated

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│ Code Review Quick Checklist            │
├─────────────────────────────────────────┤
│ ✓ Functionality - Does it work?        │
│ ✓ Design - Right architecture?         │
│ ✓ Quality - Clean code?                │
│ ✓ Readability - Easy to understand?    │
│ ✓ Tests - Adequate coverage?           │
│ ✓ Security - No vulnerabilities?       │
│ ✓ Performance - Efficient?             │
│ ✓ Errors - Properly handled?           │
│ ✓ Docs - Updated?                      │
│ ✓ Dependencies - Necessary?            │
└─────────────────────────────────────────┘
```

---

## Related Standards

- [Code Review Checklist](../../../core/code-review-checklist.md)
- [Checkin Standards](../../../core/checkin-standards.md)
- [Pre-Commit Checklist](./checkin-checklist.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Added: Standard sections (Purpose, Related Standards, Version History, License) |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
