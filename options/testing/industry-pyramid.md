# Industry Testing Pyramid

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/industry-pyramid.md)

**Parent Standard**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## Overview

The industry testing pyramid is the standard 3-level testing model used by agile and DevOps teams. It emphasizes fast feedback through many unit tests, moderate integration tests, and minimal end-to-end tests.

## Best For

- Agile/Scrum development teams
- CI/CD focused environments
- Small to medium projects
- DevOps practices
- Rapid iteration cycles

## The Pyramid

```
    ┌─────────┐
    │   E2E   │  ← 10% (Slow, expensive)
    ├─────────┤
    │   IT    │  ← 20% (Medium speed)
    ├─────────┤
    │   UT    │  ← 70% (Fast, many)
    └─────────┘
```

**Target Ratio:** 70/20/10 (UT/IT/E2E)

**Rationale:**
- More unit tests = faster feedback
- Fewer E2E tests = lower maintenance cost
- Integration tests catch interface issues

## Testing Levels

### Unit Testing (UT) - 70%

| Aspect | Details |
|--------|---------|
| **Definition** | Isolated tests for individual functions, methods, or classes |
| **Scope** | Single function/method/class |
| **Speed** | < 100ms per test |
| **Dependencies** | All mocked |

**Characteristics:**
- Fast execution
- Deterministic results
- No I/O operations
- Tests single unit of behavior

### Integration Testing (IT) - 20%

| Aspect | Details |
|--------|---------|
| **Definition** | Tests for component interactions and data flow |
| **Scope** | Multiple components working together |
| **Speed** | 1-10 seconds per test |
| **Dependencies** | Mix of real and mocked |

**Note:** Also called SIT (System Integration Testing) in enterprise environments.

**Characteristics:**
- Tests real integrations
- May use containers (Testcontainers)
- Validates data flow

### End-to-End Testing (E2E) - 10%

| Aspect | Details |
|--------|---------|
| **Definition** | Tests complete user workflows from UI to database |
| **Scope** | Full system from user perspective |
| **Speed** | 30 seconds to minutes per test |
| **Dependencies** | All real |

**Characteristics:**
- Simulates real user behavior
- Tests critical paths only
- Highest maintenance cost

## Coverage Targets

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Line Coverage | 70% | 85% |
| Branch Coverage | 60% | 80% |
| Function Coverage | 80% | 90% |

## Tools by Level

### Unit Testing

| Language | Tools |
|----------|-------|
| JavaScript | Jest, Vitest, Mocha |
| Python | pytest, unittest |
| Java | JUnit, TestNG |
| C# | xUnit, NUnit, MSTest |
| Go | testing package, testify |

### Integration Testing

| Language | Tools |
|----------|-------|
| JavaScript | Supertest, Testcontainers |
| Python | pytest, Testcontainers |
| Java | Spring Boot Test, Testcontainers |
| C# | WebApplicationFactory, Testcontainers |

### E2E Testing

| Language | Tools |
|----------|-------|
| JavaScript | Playwright, Cypress, Puppeteer |
| Python | Playwright, Selenium |
| Java | Selenium, Playwright |

## When to Choose Industry Pyramid

**Choose when:**
- Practicing Agile/Scrum methodology
- CI/CD pipeline is critical
- Fast feedback is priority
- Team is small and cross-functional
- Minimal documentation overhead desired

**Avoid when:**
- Need formal QA certification
- Enterprise compliance requirements
- Dedicated QA team prefers ISTQB
- Audit documentation is required

## Comparison with ISTQB

| Industry Level | ISTQB Equivalent | Note |
|----------------|------------------|------|
| Unit Testing (UT) | Component Testing | Same concept |
| Integration Testing (IT) | Integration Testing | Same concept, IT vs SIT abbreviation |
| E2E Testing | System Testing + Acceptance Testing | Industry combines these levels |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Follow pyramid ratio | Target 70/20/10 ratio for UT/IT/E2E | Required |
| Test at lowest level | Write tests at the lowest level that provides confidence | Recommended |
| Avoid E2E for edge cases | Use unit tests for edge cases, not E2E | Recommended |
| Integration for boundaries | Use integration tests to verify interface contracts | Recommended |

## Related Options

- [ISTQB Framework](./istqb-framework.md) - Formal 4-level testing framework
- [Unit Testing](./unit-testing.md) - Detailed unit testing practices
- [Integration Testing](./integration-testing.md) - Integration testing practices
- [E2E Testing](./e2e-testing.md) - End-to-end testing practices

---

## References

- [Martin Fowler's Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [Google Testing Blog](https://testing.googleblog.com)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
