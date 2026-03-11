# Test Plan Template

> Inspired by ISO/IEC/IEEE 29119-3.

## 1. Test Plan Identifier

- **Plan ID**: TP-{project}-{version}
- **Project**: {project name}
- **Version**: {version}
- **Date**: {date}

## 2. Test Scope

### In Scope
- {Feature/component to test}

### Out of Scope
- {Explicitly excluded items}

## 3. Test Levels

| Level | Command | Timeout | Scope |
|-------|---------|---------|-------|
| Unit (UT) | `{test:unit command}` | 120000ms | Single function/method |
| Integration (IT) | `{test:integration command}` | 120000ms | Multiple components |
| System (ST) | `{test:system command}` | 300000ms | Complete subsystem |
| E2E | `{test:e2e command}` | 600000ms | Full user flows |

## 4. Static Analysis

- **Command**: `{lint/type-check/analysis command}`
- **Tools**: {ESLint, ruff, mypy, etc.}

## 5. Quality Thresholds

| Setting | Value |
|---------|-------|
| Profile | strict / standard / minimal / none |
| Verify | true/false |
| Max Retries | {number} |

## 6. Test Completion Criteria

> ISO 29119: Test Completion Criteria / Test Exit Criteria
> Agile/Scrum: Definition of Done (DoD)

| Check | Command | Required |
|-------|---------|----------|
| All tests pass | `{test command}` | Yes |
| No lint errors | `{lint command}` | Yes |
| Type check clean | `{typecheck command}` | Yes |
| Static analysis clean | `{command}` | Yes |
| Documentation updated | _(manual review)_ | No |

## 7. Test Environment

| Environment | Purpose | Mock Strategy |
|-------------|---------|---------------|
| local | UT, fast IT | In-memory mocks |
| ci | Full suite | Containerized deps |
| sit | ST | Stubbed external APIs |
| staging | E2E | No mocks |

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {impact} | {mitigation} |

## 9. Approval

- **Author**: {name}
- **Reviewer**: {name}
- **Approved**: {date}
