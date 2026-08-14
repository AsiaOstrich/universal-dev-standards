# Mutation Testing Standards

**Version**: 1.1.0
**Last Updated**: 2026-08-14
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

## Attribution: Kill Is Credited to the First Failing Test

`Killed` means *some* test in the run failed against the mutant — most tools do not record *which* test killed it, and none records *which test level*. A 7/7 kill score therefore verifies the **whole suite that ran against the mutant**, not any single test, and not any single test level (unit vs. integration vs. property).

**Consequence**: "the property suite verifies X" is not a claim an aggregate mutation run supports. To support it, re-run mutation testing with *only* the property suite active:

```bash
npx stryker run --mutate 'src/module/**' -- --project=property
```

If the isolated run kills fewer mutants than the aggregate run, the gap is exactly what the unit/integration tests were quietly covering.

**Rule**: high-risk modules (the same set the 80% threshold applies to — auth/license/payment/security) must re-run mutants against the property suite in isolation before any claim of "property-verified" is made.

---

## One-Sided Invariants Miss Fail-Closed Defects

A property like "output never exceeds the limit" is one-sided: it cannot detect a mutant that makes the code **fail closed** — reject everything, including valid input — because a fail-closed mutant never produces an over-limit output. The mutation score looks unaffected while an entire class of defect (denial of service, wrongly rejected requests) is invisible to the suite.

**Fix**: pair every one-sided invariant with its opposite boundary. "Never exceeds the limit" needs a companion property — e.g. "accepts everything at or below the limit" — so that both over-permissive and over-restrictive mutants have a path to detection.

---

## Equivalent Mutants Are Not Survivors to Chase

A surviving mutant is not automatically a test gap. Some mutants are **semantically equivalent** to the original — no input can distinguish their behavior — and no test can kill them, regardless of how it's written. Forcing a kill with an assertion that exists only to move the score (`expect(x).toBeDefined()` on an incidental value) produces a hollow test without closing any real gap.

**Required classification for every reviewed survivor**:
- **Genuine gap** → write a test that exercises the distinguishing behavior.
- **`equivalent, because <reason>`** → recorded with the input(s) checked to reach that conclusion.

An unclassified survivor is not the same as a classified-equivalent one. Only a classified-equivalent mutant may be excluded from the score's denominator.

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
- Claiming "the property suite verifies X" from an aggregate (not isolated) mutation run
- Using only a one-sided invariant for a property that has a fail-closed failure mode
- Forcing a kill on a semantically equivalent mutant instead of classifying it `equivalent, because <reason>`

---

## Relationship to Other Standards

- `test-completeness-dimensions`: Dimension 8 (AI Test Quality) references mutation score
- `mock-boundary`: Hollow tests survive many mutations; mock boundary rules prevent hollow tests
- `testing`: Mutation testing is the quality gate on top of the test pyramid
