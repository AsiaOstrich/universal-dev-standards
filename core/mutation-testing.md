# Mutation Testing Standards

**Version**: 1.0.0
**Last Updated**: 2026-05-04
**Applicability**: All software projects with unit/integration tests
**Scope**: universal
**Industry Standards**: ISTQB Foundation Syllabus (test effectiveness metrics)
**References**: "Introduction to Software Testing" (Ammann & Offutt), Stryker Mutator docs

[English](.) | [繁體中文](../locales/zh-TW/core/mutation-testing.md)

---

## Purpose

Mutation testing evaluates test suite effectiveness by injecting artificial bugs and checking whether tests detect them. It answers the question that line coverage cannot: **"Do my tests actually verify correct behavior?"**

---

## Key Concept: Mutation Score

```
Mutation Score = Killed Mutants / (Killed + Survived) × 100%
```

- **Killed**: Test suite detected the artificial bug (test failed) ✅
- **Survived**: Test suite missed the bug (tests still pass) ❌

A test with `expect(x).toBeDefined()` can achieve 100% line coverage but survive many mutations (because `x` being `null`, `0`, or `"wrong"` all satisfy `.toBeDefined()`).

---

## Tools

| Language | Tool | Command |
|----------|------|---------|
| TypeScript/JS | Stryker Mutator | `npx stryker run` |
| Python | mutmut | `mutmut run` |
| Java | PIT (Pitest) | `mvn pitest:mutationCoverage` |

---

## Thresholds

| Module Type | Minimum Score | Enforcement |
|-------------|--------------|-------------|
| Auth/License/Payment/Security | 80% | Block release |
| Standard business logic | 70% | Warning; resolve before next release |
| AI-generated tests | 50% | Required; reject if below |
| Overall project | 60% | Track trend; alert on regression |

---

## When to Run

| Trigger | Command | Enforcement |
|---------|---------|-------------|
| Pre-release gate | `npm run test:mutation` | ≥ 60% overall |
| Critical module change | `npx stryker run --mutate 'src/auth/**'` | ≥ 80% |
| AI-generated test review | `npx stryker run` | ≥ 50% |

**Never** add mutation testing to commit hooks — it's too slow (10-60 minutes).

---

## Stryker Quick Start (TypeScript + Vitest)

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

```json
// stryker.config.json
{
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/license/**/*.ts", "!src/**/*.test.ts"],
  "thresholds": { "high": 80, "low": 60, "break": 50 }
}
```

---

## Anti-Patterns

- Treating line coverage as a proxy for test effectiveness
- Adding mutation testing to CI for every PR (too slow)
- Accepting AI-generated tests without mutation score validation
- Killing mutations by adding `toBeDefined()` assertions

---

## Relationship to Other Standards

- `test-completeness-dimensions`: Dimension 8 (AI Test Quality) references mutation score
- `mock-boundary`: Hollow tests survive many mutations; mock boundary rules prevent hollow tests
- `testing`: Mutation testing is the quality gate on top of the test pyramid
