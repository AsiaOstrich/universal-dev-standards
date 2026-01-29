# Behavior-Driven Development (BDD) Standards

**Version**: 1.1.0
**Last Updated**: 2026-01-25
**Applicability**: All projects adopting Behavior-Driven Development
**Scope**: universal

---

## Summary

Behavior-Driven Development (BDD) is a traditional development methodology (2006) created by Dan North that bridges the communication gap between business and technical teams. Software behavior is specified through collaboration using **Given-When-Then** scenarios written in Gherkin syntax - a natural language format that stakeholders can read and validate.

BDD forms the **outer loop** of Double-Loop TDD (GOOS pattern), where BDD scenarios drive feature-level behavior while TDD handles unit-level implementation. The methodology follows a Discovery-Formulation-Automation workflow, with Three Amigos collaboration (Business + Development + Testing) ensuring shared understanding.

---

**Full Guide: [BDD Guide](../methodologies/guides/bdd-guide.md)**

---

## Quick Reference

| Aspect | Description |
|--------|-------------|
| **Core Workflow** | Discovery → Formulation → Automation |
| **Language** | Gherkin (Given-When-Then) |
| **Test Level** | Feature/Scenario tests |
| **Participants** | Developers + BA + QA (Three Amigos) |
| **Tools** | Cucumber, Behave, SpecFlow |

## Related Standards

- [Test-Driven Development](test-driven-development.md)
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md)
- [Spec-Driven Development](spec-driven-development.md)
- [Testing Standards](testing-standards.md)
