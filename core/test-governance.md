# Test Governance Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/test-governance.md)

**Version**: 1.2.0
**Last Updated**: 2026-08-14
**Applicability**: All software projects
**Scope**: universal

---

## Overview

Test governance standards define the policies, completion criteria, and environment management strategies for testing activities. This standard bridges ISO/IEC/IEEE 29119 formal processes with Agile/Scrum practices.

## References

| Standard/Source | Content |
|----------------|---------|
| ISO/IEC/IEEE 29119-2 | Test Processes |
| ISO/IEC/IEEE 29119-3 | Test Documentation (Test Plan / Test Case) |
| ISO/IEC/IEEE 12207 | Verification Process + Integration Process |
| Agile/Scrum Guide | Definition of Done (DoD) |
| ISTQB Foundation Syllabus | Test levels, test types |
| Mike Cohn Test Pyramid | Pyramid empirical ratios (recommended defaults) |

## Terminology

| Term | Standard Source | Description |
|------|----------------|-------------|
| Definition of Done (DoD) | Agile/Scrum | Checklist for task/feature completion |
| Test Completion Criteria | ISO 29119-2 | Exit criteria for test activities |
| System Integration Testing | ISO 12207 | Not an official ISO term, but industry-standard |
| Pyramid Ratio 70/20/7/3 | Mike Cohn (empirical) | Recommended defaults, not mandatory |

---

## Test Policy

### Quality Objectives

| ID | Name | Measurement |
|----|------|-------------|
| QO-1 | Functional Correctness | Test pass rate >= 95% |
| QO-2 | Regression Prevention | Zero regression failures in CI |
| QO-3 | Code Quality | Zero lint/type errors, static analysis pass |

### Level Ownership

| Level | Owner | Environment | Pyramid Ratio |
|-------|-------|-------------|---------------|
| Unit Tests (UT) | Developer | local | 70% |
| Integration Tests (IT) | Developer | local / ci | 20% |
| System Tests (ST) | QA / Developer | ci / sit | 7% |
| E2E Tests | QA | staging | 3% |

### Static Analysis

Run static analysis tools before test execution:

- `ruff check .` (Python)
- `eslint .` (TypeScript/JavaScript)
- `mypy .` (Python type checking)

### Threshold Gates Must Fail Closed

A measurement layer that prints a percentage but exits `0` regardless of whether that number cleared its threshold is a report, not a gate. It stays green while the number it prints drifts downward across commits, and nothing stops the next merge.

Every check with a pass/fail threshold — coverage, lint, mutation score, or any other bounded metric — must translate "below threshold" into a non-zero exit code, using the tool's own enforcement flag rather than a wrapper script that re-parses printed output after the fact:

| Tool | Fail-closed flag |
|------|-------------------|
| pytest-cov | `--cov-fail-under=<N>` |
| coverage.py | `coverage report --fail-under=<N>` |
| diff-cover | `diff-cover coverage.xml --fail-under=<N>` |
| nyc / Istanbul | `--check-coverage --lines <N>` |
| Stryker Mutator | `thresholds.break` in `stryker.config.json` |
| ESLint | `--max-warnings 0` |

A wrapper script that computes the number, prints it, and always `exit 0` satisfies neither this rule nor `verification-evidence`'s Evidence Validity rule 1 — the tool's exit code no longer carries any information about the artefact it measured.

---

## Completion Criteria

Test completion criteria define when testing activities can be considered done.
- **ISO 29119** calls these "Test Completion Criteria" or "Test Exit Criteria"
- **Agile/Scrum** calls them "Definition of Done (DoD)"

### Task Level

Per-task completion criteria (checked after each task):

| Check | Required | Description |
|-------|----------|-------------|
| verify_command_passed | Yes | Task verify command or test levels all pass |
| no_lint_errors | Yes | No lint errors in changed files |
| type_check_passed | Yes | Type checking passes |

### Feature Level

Per-feature completion criteria (checked at feature boundary):

| Check | Required | Description |
|-------|----------|-------------|
| all_tasks_passed | Yes | All tasks in the feature are completed successfully |
| acceptance_criteria_met | Yes | All acceptance criteria are verified |
| no_regression | Yes | No existing tests broken |

### Release Level

Release completion criteria (checked before release):

| Check | Required | Description |
|-------|----------|-------------|
| all_features_complete | Yes | All planned features are complete |
| e2e_pass | Yes | Full E2E test suite passes |
| static_analysis_clean | Yes | Static analysis reports zero issues |
| documentation_updated | No | Documentation reflects changes |

---

## Environment Management

| Environment | Description | Purpose | Mock Strategy |
|-------------|-------------|---------|---------------|
| local | Developer workstation | Unit tests, fast integration tests | In-memory mocks and stubs |
| ci | CI/CD pipeline | Full test suite, lint, type check, static analysis | Containerized dependencies (testcontainers) |
| sit | System Integration Testing | System tests with real service interactions | Stubbed external APIs, real internal services |
| staging | Pre-production | E2E tests, smoke tests | No mocks, real external services |

> **Note**: SIT = System Integration Testing, aligned with ISO 12207 Verification + Integration Process.

---

## Rules

| ID | Trigger | Instruction | Priority |
|----|---------|-------------|----------|
| enforce-completion-criteria | Completing a task or feature | Verify all required completion criteria are met before marking task/feature as done | Required |
| pyramid-compliance | Planning test strategy | Follow the 70/20/7/3 pyramid ratio as a guideline. Deviation is acceptable with documented justification | Required |
| sit-isolation | Running system tests | System tests should stub external dependencies but use real internal services. Use SIT environment for system-level validation | Recommended |
| test-execution-continuity | Adding or completing a test case | A test case must be wired to an automated execution trigger (CI gate, build hook, or scheduled run). A test that exists but is never run provides false confidence and is worse than no test at all. Verify that execution history exists before marking test coverage as complete. | Required |
| fail-closed-threshold-gate | Configuring or reviewing any coverage/lint/mutation/other threshold check | The check must use the tool's fail-under (or equivalent) enforcement flag so it exits non-zero when the threshold is not met. A script that only prints the number and always exits 0 is a report, not a gate, and does not satisfy this rule | Required |

---

## Templates

- [Test Plan Template](../templates/test-plan-template.md) — ISO 29119-3 inspired
- [Test Case Template](../templates/test-case-template.md) — ISO 29119-3 inspired

---

## Related Standards

- [Testing Standards](testing-standards.md) — Testing pyramid and coverage ratios
- [Test Completeness Dimensions](test-completeness-dimensions.md) — 8-dimension test coverage
- [Check-in Standards](checkin-standards.md) — Pre-commit quality gates
- [Verification Evidence](verification-evidence.md) — Evidence Validity governs how to *read* an exit code once produced; `fail-closed-threshold-gate` governs how the gate must be *built* so that exit code carries real information in the first place

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-11 | Initial version — test policy, completion criteria, environment management |
| 1.2.0 | 2026-08-14 | Added `fail-closed-threshold-gate` — coverage/lint/mutation threshold checks must exit non-zero below threshold, not just print the number |
