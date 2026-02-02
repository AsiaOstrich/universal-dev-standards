# Test-Driven Development (TDD) Standards

**Version**: 1.2.0
**Last Updated**: 2026-01-25
**Applicability**: All projects adopting Test-Driven Development
**Scope**: universal
**Industry Standards**: None (Kent Beck practice, 1999)

---

## Summary

Test-Driven Development (TDD) is a traditional development methodology (1999) where tests drive the design and implementation of software features. The core workflow follows the **Red-Green-Refactor** cycle:

1. **Red**: Write a failing test that describes expected behavior
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Improve code quality while keeping tests green

TDD is part of the traditional test-driven development family (alongside BDD and ATDD) and can be used during the Implementation phase of AI-era SDD (Spec-Driven Development) workflows. The methodology promotes testable, modular code design and provides immediate feedback on code correctness.

---

**Full Guide: [TDD Guide](../methodologies/guides/tdd-guide.md)**

---

## Quick Reference

| Aspect | Description |
|--------|-------------|
| **Core Cycle** | Red → Green → Refactor → Repeat |
| **FIRST Principles** | Fast, Independent, Repeatable, Self-validating, Timely |
| **Test Level** | Unit/Integration tests |
| **Participants** | Developers |
| **Tools** | xUnit frameworks (Jest, pytest, JUnit, etc.) |

## Related Standards

- [Testing Standards](testing-standards.md)
- [Behavior-Driven Development](behavior-driven-development.md)
- [Spec-Driven Development](spec-driven-development.md)
