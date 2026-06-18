# Security Testing Standards

**Version**: 1.1.0
**Last Updated**: 2026-06-19
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

## Finding Remediation Lifecycle

The layers above detect findings and the CVE policy sets resolution SLAs, but a
finding also needs an **owned lifecycle** — otherwise "block merge" is the only
defined action and everything after detection is undefined. Every security
finding (SAST / DAST / secret / dependency CVE) follows this state machine.

| State | Meaning | Owner | Exit condition |
|-------|---------|-------|----------------|
| **Detected** | A layer (SAST/DAST/secret/audit) raised it | the scanning gate (CI) | severity assigned |
| **Triaged** | Severity + validity confirmed (real vs false positive) | security reviewer | real → In-Progress; false-positive → `suppressed` with recorded justification |
| **In-Progress** | Fix being implemented | code owner of the affected component | a fix is committed |
| **Resolved** | Fix merged | code owner | the originating scan re-runs clean |
| **Verified** | Re-scan confirms the finding is gone | the scanning gate (CI) | finding closed |

- **Gate**: a Critical/High finding in any state other than `Verified` (or
  `Triaged → suppressed` with justification) **blocks release**, consistent with
  the CVE Response Policy SLAs above.
- **No silent close**: a finding may only leave the lifecycle via `Verified`
  (re-scan clean) or an explicit, recorded `suppressed` decision by the security
  reviewer — never by deletion, nor by the fix author self-approving.

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
