# Testing Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/testing-standards.md)

**Version**: 3.0.0
**Last Updated**: 2026-01-29
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: ISTQB CTFL v4.0, ISO/IEC/IEEE 29119
**References**: [istqb.org](https://istqb.org/)

---

## Purpose

This standard defines actionable testing rules and conventions for AI agents and developers. For theoretical foundations, educational content, and detailed examples, see [Testing Theory Knowledge Base](../skills/testing-guide/testing-theory.md).

**Reference Standards**:
- [ISTQB CTFL v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering)

---

## Glossary

| Abbreviation | Full Term | Description |
|--------------|-----------|-------------|
| **UT** | Unit Testing | Testing individual functions/methods in isolation |
| **IT** | Integration Testing | Testing interactions between components |
| **ST** | System Testing | Testing the complete integrated system |
| **AT** | Acceptance Testing | Testing against business acceptance criteria |
| **E2E** | End-to-End Testing | Testing complete user workflows |
| **UAT** | User Acceptance Testing | Acceptance testing performed by end users |
| **SIT** | System Integration Testing | Testing integration of multiple systems |

> **Note**: "IT" in this document always refers to "Integration Testing", not "Information Technology".

---

## Testing Framework Selection

| Framework | Levels | Best For |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | Enterprise, compliance, formal QA |
| **Industry Pyramid** | UT (70%) → IT (20%) → E2E (10%) | Agile, DevOps, CI/CD |

---

## Testing Pyramid (Default Ratios)

```
              ┌─────────┐
              │   E2E   │  ← 10% (Fewer, slower, expensive)
             ─┴─────────┴─
            ┌─────────────┐
            │    IT/SIT   │  ← 20% (Integration Testing)
           ─┴─────────────┴─
          ┌─────────────────┐
          │       UT        │  ← 70% (Unit Testing - Foundation)
          └─────────────────┘
```

| Level | Percentage | Execution Time Target |
|-------|------------|----------------------|
| Unit Testing (UT) | 70% | < 10 min total |
| Integration Testing (IT) | 20% | < 30 min total |
| E2E Testing | 10% | < 2 hours total |

---

## Test Level Requirements

### Unit Testing (UT)

**Characteristics**: Isolated, Fast (< 100ms each), Deterministic

#### Scope

| Include | Exclude |
|---------|---------|
| Single function/method | Database queries |
| Single class | External API calls |
| Pure business logic | File I/O operations |
| Data transformations | Multi-class interactions |
| Validation rules | Network calls |

#### Naming Convention

**File Naming**:
```
[ClassName]Tests.[ext]      # C#
[ClassName].test.[ext]      # TypeScript/JavaScript
[class_name]_test.[ext]     # Python, Go
```

**Method Naming** (choose ONE per project):

| Style | Best For | Example |
|-------|----------|---------|
| `[Method]_[Scenario]_[Result]` | C#, Java | `CalculateTotal_NegativePrice_ThrowsException()` |
| `should_[behavior]_when_[condition]` | JavaScript/TypeScript | `should_reject_login_when_account_locked()` |
| `test_[method]_[scenario]_[expected]` | Python (pytest) | `test_validate_email_invalid_format_returns_false()` |

#### Coverage Thresholds

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Line Coverage | 70% | 85% |
| Branch Coverage | 60% | 80% |
| Function Coverage | 80% | 90% |

---

### Integration Testing (IT)

**Characteristics**: Component integration, Real dependencies (often containerized), 1-10 seconds each

#### When Required

**Decision Rule**: If your unit test uses a wildcard matcher (`any()`, `It.IsAny<>`, `Arg.Any<>`) for a query/filter parameter, that functionality MUST have an integration test.

| Scenario | Reason |
|----------|--------|
| Query predicates | Mocks cannot verify filter expressions |
| Entity relationships | Verify foreign key correctness |
| Composite keys | In-memory DB may differ from real DB |
| Field mapping | DTO ↔ Entity transformations |
| Pagination | Row ordering and counting |
| Transactions | Rollback behavior |

#### Scope

| Include | Exclude |
|---------|---------|
| Database CRUD operations | Full user workflows |
| Repository + Database | Cross-service communication |
| Service + Repository | UI interactions |
| API endpoint + Service layer | |
| Message queue producers/consumers | |
| Cache read/write operations | |

#### Naming Convention

```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]
```

---

### System Testing (ST)

**Characteristics**: Complete system, Production-like environment, Requirement-based

#### Scope

| Include | Exclude |
|---------|---------|
| Complete API workflows | UI visual testing |
| Cross-service transactions | User journey simulations |
| Data flow through entire system | A/B testing scenarios |
| Security requirements | |
| Performance under load | |
| Error handling & recovery | |

#### Types

| Type | Description |
|------|-------------|
| Functional | Verify features work as specified |
| Performance | Load, stress, scalability testing |
| Security | Penetration, vulnerability scanning |
| Reliability | Failover, recovery, stability |
| Compatibility | Cross-platform, browser compatibility |

#### Naming Convention

```
[Feature]SystemTests.[ext]
[Feature].system.test.[ext]
[Feature]_st.[ext]
```

---

### End-to-End Testing (E2E)

**Characteristics**: User perspective, Full stack (UI → API → Database), Slowest (30s+ each)

#### Scope

| Include | Exclude |
|---------|---------|
| Critical user journeys | Every possible user path |
| Login/Authentication flows | Edge cases (use UT/IT) |
| Core business transactions | Performance benchmarking |
| Cross-browser functionality | |
| Smoke tests for deployments | |

#### Naming Convention

```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]
```

---

## Test Doubles

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Stub** | Returns predefined values | Fixed API responses |
| **Mock** | Verifies interactions | Verify method called |
| **Fake** | Simplified implementation | In-memory database |
| **Spy** | Records calls, delegates to real | Partial mocking |
| **Dummy** | Placeholder, never used | Fill required parameters |

### Usage by Test Level

| Level | Guidance |
|-------|----------|
| **UT** | Use Mocks/Stubs for all external dependencies |
| **IT** | Use Fakes for databases, Stubs for external APIs |
| **ST** | Use real components, Fakes only for external third-party |
| **E2E** | Use real everything; stub only external payment/email |

---

## Mock Limitations

**Problem**: Wildcard matchers (`any()`, `It.IsAny<>`) ignore actual query logic, allowing incorrect queries to pass.

**Rule**: If mocking a method that accepts a query/filter/predicate parameter, you MUST have a corresponding integration test to verify the query logic.

```python
# Example - Python
# ❌ This test cannot verify query correctness
mock_repo.find.return_value = users

# ✓ Add integration test to verify actual query
```

---

## Test Data Requirements

### Principles

1. **Isolation**: Each test manages its own data
2. **Cleanup**: Tests clean up after themselves
3. **Determinism**: Tests don't depend on shared state
4. **Readability**: Test data clearly shows intent

### Distinct Identifiers Rule

When entities have both a surrogate key (auto-generated ID) and a business identifier, test data MUST use different values for each.

```python
# ❌ Wrong: id equals business_code - mapping errors undetected
dept = Department(id=1, business_code=1)

# ✓ Correct: distinct values catch mapping errors
dept = Department(id=1, business_code=1001)
```

### Composite Keys Rule

For entities with composite primary keys, ensure each record has a unique key combination.

```python
# ❌ Key collision
batch1 = BatchRecord(id=0, send_time=now)
batch2 = BatchRecord(id=0, send_time=now)  # Conflict!

# ✓ Unique combinations
batch1 = BatchRecord(id=0, send_time=now + timedelta(seconds=1))
batch2 = BatchRecord(id=0, send_time=now + timedelta(seconds=2))
```

---

## Test Environment

### Language-Specific Tools

| Language | Version Manager | Lock File |
|----------|----------------|-----------|
| Python | venv, virtualenv, poetry | requirements.txt, poetry.lock |
| Node.js | nvm, fnm | package-lock.json, yarn.lock |
| Ruby | rbenv, rvm | Gemfile.lock |
| Java | SDKMAN, jenv | pom.xml, build.gradle.lock |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |
| Rust | rustup, cargo | Cargo.lock |

### Best Practices

1. **Always use virtual environments** for development and testing
2. **Commit lock files** to version control
3. **Pin versions** in CI/CD pipelines
4. **Document required runtime versions** in README or .tool-versions

### Container Usage by Test Level

| Level | Container Usage |
|-------|-----------------|
| UT | Not needed - use mocks |
| IT | Testcontainers for databases, caches |
| ST | Docker Compose for full environment |
| E2E | Full containerized stack |

---

## CI/CD Integration

### Test Execution Strategy

| Stage | When | Timeout |
|-------|------|---------|
| Unit Test | Every commit | 10 min |
| Integration Test | Every commit | 30 min |
| System Test | PR merge to main | 2 hours |
| E2E Test | Release candidates | 4 hours |

### Required Metrics

| Metric | UT | IT | ST | E2E |
|--------|----|----|----|----|
| Pass/Fail Count | Required | Required | Required | Required |
| Execution Time | Required | Required | Required | Required |
| Coverage % | Required | Required | Optional | Not needed |
| Flaky Test Rate | Required | Required | Required | Required |
| Screenshots/Videos | Not needed | Not needed | Optional | Required |

---

## Best Practices

### AAA Pattern

```
// Arrange - Set up test data and environment
// Act - Execute the behavior under test
// Assert - Verify the result
```

### FIRST Principles

| Principle | Description |
|-----------|-------------|
| **F**ast | Tests run quickly |
| **I**ndependent | Tests don't affect each other |
| **R**epeatable | Same result every time |
| **S**elf-validating | Clear pass/fail |
| **T**imely | Written with production code |

### Anti-Patterns to Avoid

- Test Interdependence (tests must run in specific order)
- Flaky Tests (sometimes pass, sometimes fail)
- Testing Implementation Details (tests break on refactoring)
- Over-Mocking (nothing real is tested)
- Missing Assertions (tests verify nothing meaningful)
- Magic Numbers/Strings (unexplained values)
- Identical Test IDs (same values for surrogate and business keys)

---

## Test Documentation Structure

### tests/README.md Required Sections

Every `tests/` directory SHOULD include a README.md with:

#### 1. Test Overview Table

| Test Type | Count | Framework | Environment |
|-----------|-------|-----------|-------------|
| Unit Tests | 150 | Jest | Node.js |
| Integration Tests | 45 | Jest | Node.js + TestContainers |
| E2E Tests | 12 | Playwright | Browser |

#### 2. Current Status Section

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Pass Rate | 98.5% | >= 95% | Pass |
| Line Coverage | 82% | >= 80% | Pass |
| Branch Coverage | 75% | >= 70% | Pass |

#### 3. Report Links Section

| Report Type | Location | Description |
|-------------|----------|-------------|
| Test Results | `results/` | Timestamped execution reports |
| Coverage | `coverage/` | Code coverage reports |
| Gap Analysis | `docs/gap-analysis.md` | Missing coverage analysis |

### Test Report Naming Convention

| Item | Convention | Example |
|------|------------|---------|
| Report filename | `test-report-YYYYMMDD-HHMMSS.md` | `test-report-20260129-143000.md` |
| Report directory | `tests/results/` | |
| Coverage directory | `tests/coverage/` | |

### Directory Structure

```
tests/
├── README.md                    # Test overview and status
├── results/                     # Test execution reports
├── coverage/                    # Coverage reports
├── docs/                        # Test documentation
├── unit/                        # Unit tests
├── integration/                 # Integration tests
└── e2e/                         # End-to-end tests
```

---

## Coverage Targets Summary

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Line | 70% | 85% |
| Branch | 60% | 80% |
| Function | 80% | 90% |
| Mutation Score | - | >= 80% (critical code) |

---

## Related Standards

- [Testing Theory Knowledge Base](../skills/testing-guide/testing-theory.md) - Educational content, examples, techniques
- [Test-Driven Development](test-driven-development.md) - TDD/BDD/ATDD methodology
- [Test Completeness Dimensions](test-completeness-dimensions.md) - 8-dimension test coverage
- [Spec-Driven Development](spec-driven-development.md) - SDD workflow integration
- [Code Check-in Standards](checkin-standards.md)
- [Code Review Checklist](code-review-checklist.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2026-01-29 | **Major refactor**: Split into Rules (this file) and Theory (testing-theory.md). Reduced from 141KB/3185 lines to ~12KB/350 lines. All educational content moved to skills/testing-guide/testing-theory.md. Rules-only format optimized for AI agent consumption. |
| 2.2.0 | 2026-01-20 | Added Test Documentation Structure section |
| 2.1.0 | 2026-01-05 | Added SWEBOK v4.0 reference, Testing Fundamentals, Test-Related Measures |
| 2.0.0 | 2026-01-05 | Major update aligned with ISTQB CTFL v4.0 and ISO/IEC/IEEE 29119 |
| 1.3.0 | 2025-12-29 | Add Testing Framework Selection, IT/SIT abbreviation clarification |
| 1.2.0 | 2025-12-19 | Add Mock Limitations, Integration Test requirements, Test Data patterns |
| 1.1.1 | 2025-12-11 | Improved System test example with generic domain concepts |
| 1.1.0 | 2025-12-05 | Add test environment isolation section |
| 1.0.0 | 2025-12-05 | Initial testing standards with UT/IT/ST/E2E coverage |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Maintainer**: Development Team
