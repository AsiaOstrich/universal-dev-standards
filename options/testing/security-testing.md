# Security Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/security-testing.md)

**Parent Standard**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## Overview

Security testing identifies vulnerabilities in applications before they can be exploited. It encompasses static analysis, dynamic testing, dependency scanning, and penetration testing to ensure comprehensive security coverage.

## Best For

- Applications handling sensitive data
- Financial services
- Healthcare applications
- E-commerce platforms
- Any public-facing application

## Testing Types

### Static Application Security Testing (SAST)

Analyze source code without execution.

| Aspect | Details |
|--------|---------|
| **When to use** | Early in development, CI/CD pipeline |

**Tools:**

| Tool | Languages |
|------|-----------|
| SonarQube | Multi-language |
| Semgrep | Multi-language |
| CodeQL | Multi-language |
| Bandit | Python |
| Brakeman | Ruby |
| ESLint security plugins | JavaScript/TypeScript |

### Dynamic Application Security Testing (DAST)

Test running application for vulnerabilities.

| Aspect | Details |
|--------|---------|
| **When to use** | Staging environment, pre-production |

**Tools:**

| Tool | Type |
|------|------|
| OWASP ZAP | Open source |
| Burp Suite | Commercial |
| Nuclei | Open source |
| Nikto | Open source |

### Software Composition Analysis (SCA)

Check dependencies for known vulnerabilities.

| Aspect | Details |
|--------|---------|
| **When to use** | Every build, continuous monitoring |

**Tools:**

| Tool | Type |
|------|------|
| Snyk | SaaS/CLI |
| Dependabot | GitHub integrated |
| npm audit | CLI |
| OWASP Dependency-Check | Open source |

### Penetration Testing

Simulated attacks by security professionals.

| Aspect | Details |
|--------|---------|
| **When to use** | Before major releases, annually |

**Types:**
- **Black box:** No prior knowledge
- **White box:** Full access
- **Grey box:** Partial knowledge

### Secret Scanning

Detect exposed credentials and secrets.

**Tools:**

| Tool | Type |
|------|------|
| GitLeaks | Open source |
| TruffleHog | Open source |
| GitHub Secret Scanning | GitHub integrated |

## OWASP Top 10 (2021)

| ID | Risk | Test Focus |
|----|------|------------|
| A01 | Broken Access Control | Authorization checks, privilege escalation |
| A02 | Cryptographic Failures | Encryption, key management, data exposure |
| A03 | Injection | SQL, NoSQL, OS, LDAP injection |
| A04 | Insecure Design | Security requirements, threat modeling |
| A05 | Security Misconfiguration | Default configs, unnecessary features |
| A06 | Vulnerable Components | Outdated dependencies, known CVEs |
| A07 | Authentication Failures | Session management, credential stuffing |
| A08 | Software and Data Integrity Failures | CI/CD pipeline security, serialization |
| A09 | Security Logging and Monitoring Failures | Audit logs, alerting |
| A10 | Server-Side Request Forgery | URL validation, network segmentation |

## CI Integration

### GitHub Actions Example

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| SAST in CI | Include SAST in every build pipeline | Required |
| Dependency scanning | Scan all dependencies for vulnerabilities | Required |
| Secret scanning | Scan for exposed secrets before push | Required |
| DAST staging | Run DAST against staging environment | Recommended |
| Pentest annually | Conduct penetration testing at least annually | Recommended |
| OWASP checklist | Cover all OWASP Top 10 risks in test plan | Required |

## Quick Reference

| Type | Abbreviation | When | Tools |
|------|--------------|------|-------|
| Static Analysis | SAST | CI/CD | SonarQube, Semgrep |
| Dynamic Analysis | DAST | Staging | OWASP ZAP, Burp |
| Dependency Scan | SCA | Every build | Snyk, Dependabot |
| Penetration Test | Pentest | Annually | Manual/Professional |
| Secret Scanning | - | Pre-commit | GitLeaks, TruffleHog |

## Related Options

- [Performance Testing](./performance-testing.md) - Performance testing practices
- [Unit Testing](./unit-testing.md) - Unit testing practices

---

## References

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST SP 800-115](https://csrc.nist.gov/publications/detail/sp/800-115/final)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
