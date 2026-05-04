# Security Testing Standards

**Version**: 1.0.0
**Last Updated**: 2026-05-04
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: OWASP Testing Guide v4, NIST SP 800-115, ISO/IEC 27001
**References**: OWASP Top 10, CWE/SANS Top 25

[English](.) | [繁體中文](../locales/zh-TW/core/security-testing.md)

---

## Purpose

This document defines the security testing methodology for software projects. It complements `security-standards.md` (architecture-level security design) with execution-level guidance: which tools to run, when to run them, and how to respond to findings.

---

## Four Security Testing Layers

### 1. SAST — Static Analysis

Analyze source code without executing it. Runs in pre-commit and CI.

| Language | Tool | Detects |
|----------|------|---------|
| TypeScript/JS | eslint-plugin-security | eval injection, regex DoS, path traversal |
| Python | bandit | SQL injection, hardcoded credentials |
| Java | SpotBugs + FindSecBugs | SQL injection, XSS |

**Gate**: High/Critical → block merge

### 2. Dependency Auditing

Scan third-party packages for known CVEs. Runs on pre-push and weekly.

| Ecosystem | Tool | Command |
|-----------|------|---------|
| Node.js | npm audit | `npm audit --audit-level=high` |
| Python | pip-audit | `pip-audit` |

**Gate**: High/Critical CVE → block release (document exceptions with expiry date)

### 3. Secret Scanning

Detect accidentally committed secrets. Runs on every commit.

Tools: gitleaks, truffleHog

**Gate**: Any detected secret → block commit immediately

### 4. DAST — Dynamic Analysis

Test the running application via HTTP. Runs post-staging-deployment.

Tools: OWASP ZAP, Nuclei

**Gate**: High/Critical finding → block production promotion

---

## CVE Response Policy

| Severity | Response |
|----------|----------|
| Critical | Patch within 24h; block all deploys |
| High | Resolve before next release |
| Moderate | Resolve within 14 days |
| Low | Track; resolve in maintenance window |

---

## Anti-Patterns

- Treating all CVEs as equal urgency
- Running DAST against production (use staging)
- Ignoring `npm audit` indefinitely
- Mocking auth middleware in tests (see mock-boundary.md)

---

## Relationship to Other Standards

- `security-standards`: Architecture-level controls (input validation, auth design)
- `mock-boundary`: Never mock security controls in tests
- `deployment-standards`: DAST runs as part of deployment pipeline
