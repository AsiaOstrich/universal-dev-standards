---
name: testing-guide
description: |
  Testing pyramid and test writing standards for UT/IT/ST/E2E.
  Use when: writing tests, discussing test coverage, test strategy, or test naming.
  Keywords: test, unit, integration, e2e, coverage, mock, 測試, 單元, 整合, 端對端.
---

# Testing Guide

This skill provides testing pyramid standards and best practices for systematic testing.

## Quick Reference

### Testing Pyramid

```
                    ┌─────────┐
                    │   E2E   │  ← Fewer, slower (3%)
                   ─┴─────────┴─
                  ┌─────────────┐
                  │     ST      │  ← System (7%)
                 ─┴─────────────┴─
                ┌─────────────────┐
                │       IT        │  ← Integration (20%)
               ─┴─────────────────┴─
              ┌─────────────────────┐
              │         UT          │  ← Unit (70%)
              └─────────────────────┘
```

### Test Levels Overview

| Level | Scope | Speed | Dependencies |
|-------|-------|-------|-------------|
| **UT** | Single function/class | < 100ms | Mocked |
| **IT** | Component interaction | 1-10s | Real DB (containerized) |
| **ST** | Full system | Minutes | Production-like |
| **E2E** | User journeys | 30s+ | Everything real |

### Coverage Targets

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Line | 70% | 85% |
| Branch | 60% | 80% |
| Function | 80% | 90% |

## Detailed Guidelines

For complete standards, see:
- [Testing Pyramid](./testing-pyramid.md)

## Naming Conventions

### File Naming

```
[ClassName]Tests.cs       # C#
[ClassName].test.ts       # TypeScript
[class_name]_test.py      # Python
[class_name]_test.go      # Go
```

### Method Naming

```
[MethodName]_[Scenario]_[ExpectedResult]()
should_[behavior]_when_[condition]()
test_[method]_[scenario]_[expected]()
```

## Test Doubles

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Stub** | Returns predefined values | Fixed API responses |
| **Mock** | Verifies interactions | Check method called |
| **Fake** | Simplified implementation | In-memory database |
| **Spy** | Records calls, delegates | Partial mocking |

### When to Use What

- **UT**: Use mocks/stubs for all external deps
- **IT**: Use fakes for DB, stubs for external APIs
- **ST**: Real components, fake only external services
- **E2E**: Real everything

## AAA Pattern

```typescript
test('method_scenario_expected', () => {
    // Arrange - Setup test data
    const input = createTestInput();
    const sut = new SystemUnderTest();

    // Act - Execute behavior
    const result = sut.execute(input);

    // Assert - Verify result
    expect(result).toBe(expected);
});
```

## FIRST Principles

- **F**ast - Tests run quickly
- **I**ndependent - Tests don't affect each other
- **R**epeatable - Same result every time
- **S**elf-validating - Clear pass/fail
- **T**imely - Written with production code

## Anti-Patterns to Avoid

- ❌ Test Interdependence (tests must run in order)
- ❌ Flaky Tests (sometimes pass, sometimes fail)
- ❌ Testing Implementation Details
- ❌ Over-Mocking
- ❌ Missing Assertions
- ❌ Magic Numbers/Strings

---

## Configuration Detection

This skill supports project-specific configuration.

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
   - If this skill is listed, it is disabled for this project
2. Check `CONTRIBUTING.md` for "Testing Standards" section
3. If not found, **default to standard coverage targets**

### First-Time Setup

If no configuration found and context is unclear:

1. Ask the user: "This project hasn't configured testing standards. Would you like to customize coverage targets?"
2. After user selection, suggest documenting in `CONTRIBUTING.md`:

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |
```

### Configuration Example

In project's `CONTRIBUTING.md`:

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |

### Testing Framework
- Unit Tests: Jest
- Integration Tests: Supertest
- E2E Tests: Playwright
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
