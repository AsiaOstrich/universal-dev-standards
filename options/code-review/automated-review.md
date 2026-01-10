# Automated Code Review

> **Language**: English | [繁體中文](../../locales/zh-TW/options/code-review/automated-review.md)

**Parent Standard**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## Overview

Automated code review uses tools to analyze code for issues, enforce standards, and catch common problems before human review. It complements manual review by handling repetitive checks consistently and instantly.

## Best For

- Catching common issues early
- Enforcing code standards consistently
- Reducing reviewer burden
- CI/CD integration
- Large codebases
- Distributed teams

## Tool Categories

### Static Analysis (SAST)

Analyze code without executing it.

| Tool | Languages | Focus |
|------|-----------|-------|
| **ESLint** | JavaScript, TypeScript | Code quality, style |
| **Pylint** | Python | Code quality, errors |
| **SonarQube** | Multi-language | Code quality, security |
| **Checkstyle** | Java | Style, conventions |
| **RuboCop** | Ruby | Style, best practices |
| **golangci-lint** | Go | Multiple linters |

### Security Scanning

Find security vulnerabilities.

| Tool | Focus |
|------|-------|
| **Snyk** | Dependency vulnerabilities |
| **CodeQL** | Semantic code analysis |
| **Bandit** | Python security issues |
| **Semgrep** | Custom security rules |
| **Brakeman** | Ruby on Rails security |

### Formatting

Code style enforcement.

| Tool | Languages |
|------|-----------|
| **Prettier** | JavaScript, TypeScript, CSS, HTML |
| **Black** | Python |
| **gofmt** | Go |
| **rustfmt** | Rust |
| **clang-format** | C, C++ |

### Type Checking

Type safety validation.

| Tool | Languages |
|------|-----------|
| **TypeScript** | TypeScript, JavaScript |
| **mypy** | Python |
| **Flow** | JavaScript |

### AI-Powered Review

| Tool | Description |
|------|-------------|
| **GitHub Copilot** | AI suggestions and review |
| **CodeRabbit** | AI PR review comments |
| **Sourcery** | Python code improvements |

## CI Integration

### GitHub Actions

```yaml
name: Code Review
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master

  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run format:check
```

### GitLab CI

```yaml
lint:
  stage: test
  script:
    - npm run lint

security:
  stage: test
  script:
    - snyk test
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Fail on errors | Block merge for critical issues | Required |
| Warnings as suggestions | Non-blocking suggestions | Recommended |
| Config in repo | Store tool config in repository | Required |
| Pre-commit hooks | Run checks before commit | Recommended |

## Recommended Setup

### Minimum
- Linter for main language
- Formatter (auto-fix enabled)
- Dependency vulnerability scanner

### Recommended
- All minimum tools
- Type checker (if applicable)
- Security scanner
- Code coverage check

### Comprehensive
- All recommended tools
- AI code review
- Custom rules for project
- Metrics tracking

## Comparison with Manual Review

| Aspect | Automated | Manual Review |
|--------|-----------|---------------|
| Speed | Instant | Hours/Days |
| Consistency | 100% | Varies |
| Context Understanding | Limited | High |
| Business Logic | Cannot verify | Can verify |
| Style Enforcement | Excellent | Inconsistent |
| Security Basics | Good | May miss |
| Cost | Tool licensing | Developer time |

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer

  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
```

## Related Options

- [PR Review](./pr-review.md) - Traditional pull request review
- [Pair Programming](./pair-programming.md) - Real-time collaborative review

---

## References

- [SonarQube](https://www.sonarqube.org/)
- [ESLint](https://eslint.org/)
- [Snyk](https://snyk.io/)
- [Pre-commit](https://pre-commit.com/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
