# Security Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/security-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-29
**Applicability**: All software projects
**Scope**: universal

> **For detailed explanations and examples, see [Security Guide](guides/security-guide.md)**

---

## Purpose

This standard defines comprehensive security guidelines for software development, covering secure coding practices, vulnerability prevention, authentication/authorization, and security testing.

**Reference Standards**:
- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)

---

## Core Security Principles

| Principle | Implementation |
|-----------|----------------|
| **Least Privilege** | Role-based access, time-limited tokens |
| **Fail Securely** | Deny access on auth error, don't expose stack traces |
| **Separation of Duties** | Different roles for dev/deploy/admin |
| **Defense in Depth** | Don't rely on single control |
| **Security by Default** | Secure defaults, opt-in for less secure options |
| **Zero Trust** | Verify every request, assume breach |

---

## OWASP Top 10 Prevention Checklist

| Vulnerability | Prevention |
|---------------|------------|
| **A01: Broken Access Control** | Deny by default, server-side checks, validate ownership |
| **A02: Cryptographic Failures** | Encrypt PII, use TLS 1.3, use secrets management |
| **A03: Injection** | Parameterized queries, validated input, use ORMs |
| **A04: Insecure Design** | Threat modeling, security requirements in specs |
| **A05: Security Misconfiguration** | Remove defaults, disable unused features, security headers |
| **A06: Vulnerable Components** | Maintain SBOM, scan with npm audit/Snyk, patch quickly |
| **A07: Auth Failures** | Strong passwords, MFA, secure sessions |
| **A08: Integrity Failures** | Code signing, verify checksums, secure CI/CD |
| **A09: Logging Failures** | Log security events, protect log integrity |
| **A10: SSRF** | Allowlist URLs, block internal IPs |

---

## Required Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

---

## Cryptography Requirements

### Algorithm Selection

| Purpose | Required | Avoid |
|---------|----------|-------|
| **Symmetric Encryption** | AES-256-GCM | DES, 3DES, AES-ECB |
| **Asymmetric Encryption** | RSA-2048+, ECDSA P-256+ | RSA-1024 |
| **Hashing** | SHA-256, SHA-3, BLAKE3 | MD5, SHA-1 |
| **Password Hashing** | Argon2id, bcrypt, scrypt | SHA-256, PBKDF2 |
| **TLS Version** | TLS 1.3, TLS 1.2 | TLS 1.0, TLS 1.1, SSL |

### Password Hashing Configuration

| Algorithm | Configuration |
|-----------|---------------|
| **Argon2id** | Memory: 64 MB, Iterations: 3, Parallelism: 4, Salt: 16 bytes |
| **bcrypt** | Cost factor ≥ 12 |
| **scrypt** | N=2^17, r=8, p=1 |

---

## Authentication Requirements

### Password Policy

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Length** | 8 characters | 12+ characters |
| **Breached Password Check** | Required | HaveIBeenPwned API |
| **History** | Last 5 passwords | Last 10 passwords |

### Session Management

| Parameter | Recommended Value |
|-----------|-------------------|
| **Session ID Length** | ≥ 128 bits |
| **Session Timeout (idle)** | 15-30 minutes |
| **Session Timeout (absolute)** | 8-24 hours |
| **Cookie Flags** | `Secure; HttpOnly; SameSite=Strict` |

### MFA Requirements

- **Required for**: Admin access, sensitive operations, account recovery
- **Recommended for**: All user accounts
- **Preferred**: WebAuthn (phishing resistant)

---

## Authorization Checklist

- [ ] Implement authorization on server-side (never trust client)
- [ ] Check permissions on every request
- [ ] Use deny by default
- [ ] Log authorization failures
- [ ] Implement rate limiting per user/role
- [ ] Review permissions periodically

---

## Input Validation Rules

| Data Type | Validation |
|-----------|------------|
| **Email** | RFC 5322 regex + domain check |
| **URL** | Protocol allowlist, no internal IPs |
| **Phone** | E.164 format |
| **Date** | ISO 8601, reasonable range |
| **Integer** | Type check, min/max bounds |
| **String** | Length limits, character allowlist |
| **File** | Type, size, magic bytes |

---

## API Security Requirements

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| **Login** | 5 attempts | 15 minutes |
| **API (authenticated)** | 1000 requests | 1 hour |
| **API (unauthenticated)** | 100 requests | 1 hour |
| **Password reset** | 3 requests | 1 hour |

---

## Security Testing Requirements

| Test Type | Frequency | Purpose |
|-----------|-----------|---------|
| **SAST** | Every commit | Find vulnerabilities in source code |
| **DAST** | Weekly/Release | Test running application |
| **SCA** | Daily | Check dependency vulnerabilities |
| **Penetration Testing** | Quarterly/Annually | Manual security testing |
| **Security Code Review** | Critical changes | Manual code review |

### Recommended Tools

| Category | Tools |
|----------|-------|
| **SAST** | SonarQube, Semgrep, CodeQL |
| **DAST** | OWASP ZAP, Burp Suite |
| **SCA** | Snyk, npm audit, Dependabot |
| **Secrets Scanning** | GitLeaks, TruffleHog |

---

## Incident Response Severity

| Level | Description | Response Time |
|-------|-------------|---------------|
| **P1 Critical** | Active breach, data exfiltration | < 15 min |
| **P2 High** | Vulnerability exploited, no data loss | < 1 hour |
| **P3 Medium** | Vulnerability discovered, not exploited | < 24 hours |
| **P4 Low** | Minor security issue | < 1 week |

---

## Pre-Deployment Security Checklist

### Authentication & Authorization
- [ ] Passwords hashed with Argon2id/bcrypt
- [ ] MFA available for all users
- [ ] Session management secure (HttpOnly, Secure, SameSite)
- [ ] Authorization checked server-side on every request

### Input/Output
- [ ] All input validated server-side
- [ ] Output encoded for context (HTML, JS, URL)
- [ ] Parameterized queries for all database operations
- [ ] File uploads validated (type, size, content)

### Cryptography
- [ ] TLS 1.2+ enforced everywhere
- [ ] Strong algorithms used (AES-256, RSA-2048+)
- [ ] No secrets in code or version control
- [ ] Keys stored in secrets manager

### Configuration
- [ ] Security headers configured
- [ ] CORS restricted to allowed origins
- [ ] Debug mode disabled in production
- [ ] Default credentials changed

### Monitoring
- [ ] Security events logged
- [ ] Alerts configured for suspicious activity
- [ ] Incident response plan documented

---

## Related Standards

- [Code Review Checklist](code-review-checklist.md) - Security review section
- [Testing Standards](testing-standards.md) - Security testing integration
- [Logging Standards](logging-standards.md) - Security logging
- [Error Code Standards](error-code-standards.md) - AUTH error codes

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-29 | Refactored: Split into Rules + Guide, moved explanations to guide |
| 1.0.0 | 2026-01-29 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
