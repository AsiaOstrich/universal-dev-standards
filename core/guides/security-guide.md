# Security Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/core/guides/security-guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Related Standard**: [Security Standards](../security-standards.md)

---

## Purpose

This guide provides detailed explanations, vulnerability examples, and educational content for software security. For actionable checklists, required algorithms, and mandatory headers, see [Security Standards](../security-standards.md).

---

## Table of Contents

1. [Security Principles Explained](#security-principles-explained)
2. [OWASP Top 10 Detailed Analysis](#owasp-top-10-detailed-analysis)
3. [Authentication Deep Dive](#authentication-deep-dive)
4. [Authorization Patterns](#authorization-patterns)
5. [Input Validation Strategies](#input-validation-strategies)
6. [Cryptography Explained](#cryptography-explained)
7. [Secure Coding Patterns](#secure-coding-patterns)
8. [Security Testing Methods](#security-testing-methods)
9. [Secrets Management Practices](#secrets-management-practices)
10. [Security Logging Best Practices](#security-logging-best-practices)
11. [Incident Response Process](#incident-response-process)
12. [References](#references)

---

## Security Principles Explained

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────┐
│                    Defense in Depth Model                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Layer 1: Perimeter Security                                   │
│   ├── Firewall, WAF, DDoS protection                           │
│   └── Network segmentation                                      │
│                                                                 │
│   Layer 2: Application Security                                 │
│   ├── Input validation, output encoding                        │
│   ├── Authentication, authorization                            │
│   └── Secure session management                                │
│                                                                 │
│   Layer 3: Data Security                                        │
│   ├── Encryption at rest and in transit                        │
│   ├── Data masking, tokenization                               │
│   └── Access controls                                          │
│                                                                 │
│   Layer 4: Monitoring & Response                                │
│   ├── Security logging, SIEM                                   │
│   ├── Intrusion detection                                      │
│   └── Incident response                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The key insight is that no single security control is perfect. By layering defenses, even if an attacker bypasses one layer, they face additional obstacles.

---

## OWASP Top 10 Detailed Analysis

### A01:2021 – Broken Access Control

**Why It's #1**: Access control failures moved from #5 to #1 because applications increasingly rely on complex permission systems that are easy to misconfigure.

```
┌─────────────────────────────────────────────────────────────────┐
│             Broken Access Control Prevention                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Vulnerabilities:                                              │
│   ├── IDOR (Insecure Direct Object Reference)                  │
│   ├── Missing function-level access control                    │
│   ├── Privilege escalation                                     │
│   └── CORS misconfiguration                                    │
│                                                                 │
│   Prevention:                                                   │
│   ├── Deny by default, explicit allow list                     │
│   ├── Server-side access control (never trust client)          │
│   ├── Validate object ownership on every request               │
│   ├── Log access control failures, alert on anomalies          │
│   └── Rate limit APIs to prevent enumeration                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**IDOR Prevention Example**:
```typescript
// ❌ Bad: Direct object reference without ownership check
app.get('/api/orders/:orderId', (req, res) => {
  const order = db.orders.findById(req.params.orderId);
  res.json(order);
});

// ✅ Good: Validate ownership
app.get('/api/orders/:orderId', authenticate, (req, res) => {
  const order = db.orders.findById(req.params.orderId);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});
```

### A03:2021 – Injection

**SQL Injection Prevention**:
```typescript
// ❌ Bad: String concatenation (vulnerable to SQL injection)
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Good: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ✅ Good: ORM with proper escaping
const user = await User.findOne({ where: { id: userId } });
```

**Command Injection Prevention**:
```typescript
// ❌ Bad: Direct shell execution with user input is dangerous
// Never pass unvalidated user input to shell commands

// ✅ Good: Use library APIs with validated input
import sharp from 'sharp';
if (!/^[a-zA-Z0-9_-]+$/.test(filename)) {
  throw new Error('Invalid filename');
}
await sharp(`${filename}.png`).toFile('output.jpg');

// ✅ Good: Use execFile with argument array (no shell)
import { execFile } from 'child_process';
execFile('convert', [validatedInput, 'output.jpg']);
```

### A10:2021 – Server-Side Request Forgery (SSRF)

```typescript
// ❌ Bad: Unvalidated URL from user input
const response = await fetch(userProvidedUrl);

// ✅ Good: Allowlist validation
const ALLOWED_HOSTS = ['api.trusted.com', 'cdn.trusted.com'];
const url = new URL(userProvidedUrl);
if (!ALLOWED_HOSTS.includes(url.hostname)) {
  throw new Error('URL not allowed');
}
// Also: Block internal IPs (127.0.0.1, 10.x.x.x, 192.168.x.x, etc.)
```

---

## Authentication Deep Dive

### Password Storage Explained

```
┌─────────────────────────────────────────────────────────────────┐
│                    Password Hashing Standards                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ✅ Recommended Algorithms (in order):                         │
│   1. Argon2id (winner of PHC, memory-hard)                     │
│   2. bcrypt (cost factor ≥ 12)                                 │
│   3. scrypt (N=2^17, r=8, p=1)                                 │
│                                                                 │
│   ❌ Never Use:                                                 │
│   - MD5, SHA1, SHA256 (without salt/iteration)                 │
│   - Plain text storage                                         │
│   - Reversible encryption for passwords                        │
│                                                                 │
│   Configuration Example (Argon2id):                            │
│   - Memory: 64 MB                                              │
│   - Iterations: 3                                              │
│   - Parallelism: 4                                             │
│   - Salt: 16 bytes (random per password)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why these algorithms?** They are designed to be computationally expensive, making brute-force attacks impractical. Argon2id is memory-hard, meaning attackers can't easily parallelize attacks with GPUs.

### JWT Best Practices

```typescript
// ✅ JWT Configuration
const jwtConfig = {
  algorithm: 'RS256',        // Use asymmetric for distributed systems
  expiresIn: '15m',          // Short-lived access tokens
  issuer: 'your-app.com',
  audience: 'your-app.com',
};

// ✅ Validation checklist:
// - Verify signature with correct algorithm
// - Check exp, iat, nbf claims
// - Validate iss and aud claims
// - Use allowlist for algorithms (prevent "none" attack)

// ❌ Never:
// - Store sensitive data in JWT payload
// - Use symmetric keys for multi-party systems
// - Set expiresIn > 1 hour for access tokens
```

---

## Authorization Patterns

### RBAC Model Example

```
┌─────────────────────────────────────────────────────────────────┐
│                    RBAC Model Example                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Roles:                                                        │
│   ├── admin        → All permissions                           │
│   ├── manager      → Read, Write, Delete (own team)            │
│   ├── editor       → Read, Write                               │
│   └── viewer       → Read only                                 │
│                                                                 │
│   Permissions:                                                  │
│   ├── resource:read                                            │
│   ├── resource:write                                           │
│   ├── resource:delete                                          │
│   └── resource:admin                                           │
│                                                                 │
│   Assignment:                                                   │
│   User → Role → Permissions                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### ABAC for Complex Policies

When RBAC is insufficient (complex policies):

```typescript
// ABAC Policy Example
const policy = {
  effect: 'allow',
  action: 'document:edit',
  conditions: {
    'user.department': { equals: 'resource.department' },
    'user.clearanceLevel': { greaterThanOrEqual: 'resource.sensitivityLevel' },
    'time.hour': { between: [9, 17] },
  },
};
```

---

## Input Validation Strategies

### Validation Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Input Validation Layers                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Client-side (UX only, not security)                        │
│      └── Immediate feedback, reduce server load                 │
│                                                                 │
│   2. API Gateway / Edge                                         │
│      └── Rate limiting, basic format validation                 │
│                                                                 │
│   3. Application Layer (PRIMARY)                                │
│      ├── Type validation (schema validation)                   │
│      ├── Business rule validation                              │
│      └── Sanitization                                          │
│                                                                 │
│   4. Database Layer                                             │
│      └── Constraints, triggers (last line of defense)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: Client-side validation is for user experience only. All security validation must happen server-side.

---

## Cryptography Explained

### Key Management Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Key Management Lifecycle                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Generation                                                 │
│      ├── Use cryptographically secure RNG                      │
│      ├── Generate in secure environment (HSM, KMS)             │
│      └── Never generate client-side                            │
│                                                                 │
│   2. Storage                                                    │
│      ├── Use KMS (AWS KMS, HashiCorp Vault, Azure Key Vault)   │
│      ├── Never store in code or version control                │
│      └── Encrypt keys at rest with master key                  │
│                                                                 │
│   3. Distribution                                               │
│      ├── Use secure channels only                              │
│      └── Implement key wrapping                                │
│                                                                 │
│   4. Rotation                                                   │
│      ├── Define rotation schedule (90 days typical)            │
│      ├── Support graceful rotation (multiple active keys)      │
│      └── Automate rotation where possible                      │
│                                                                 │
│   5. Revocation & Destruction                                   │
│      ├── Immediate revocation on compromise                    │
│      └── Secure deletion (memory wipe, crypto-shredding)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Secure Coding Patterns

### Error Handling

```typescript
// ❌ Bad: Exposes internal details
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack });
}

// ✅ Good: Generic message, log details internally
catch (error) {
  logger.error('Database error', { error, requestId: req.id });
  res.status(500).json({
    error: 'An internal error occurred',
    requestId: req.id
  });
}
```

**Why?** Error messages can reveal:
- Database structure (SQL errors)
- File system paths (stack traces)
- Library versions (useful for targeting known vulnerabilities)

---

## Security Testing Methods

### CI/CD Security Integration

```yaml
# Example: GitHub Actions Security Pipeline
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Dependency vulnerability check
      - name: npm audit
        run: npm audit --audit-level=high

      # SAST
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/owasp-top-ten

      # Secrets scanning
      - name: GitLeaks
        uses: gitleaks/gitleaks-action@v2

      # Container scanning
      - name: Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
```

---

## Security Logging Best Practices

### What to Log

| Category | Events |
|----------|--------|
| **Authentication** | Login success/failure, logout, MFA events |
| **Authorization** | Access denied, privilege escalation attempts |
| **Data Access** | Sensitive data access, bulk exports |
| **Admin Actions** | User creation, permission changes |
| **Security Events** | Input validation failures, rate limit hits |

### Log Format

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "SECURITY",
  "event_type": "authentication_failure",
  "user_id": "usr_12345",
  "ip_address": "203.0.113.50",
  "user_agent": "Mozilla/5.0...",
  "request_id": "req_abc123",
  "details": {
    "reason": "invalid_password",
    "attempt_count": 3
  }
}
```

---

## Incident Response Process

```
┌─────────────────────────────────────────────────────────────────┐
│                 Security Incident Response                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. IDENTIFY                                                   │
│      ├── Detect and confirm the incident                       │
│      ├── Determine scope and impact                            │
│      └── Assign severity level                                 │
│                                                                 │
│   2. CONTAIN                                                    │
│      ├── Isolate affected systems                              │
│      ├── Preserve evidence                                     │
│      └── Prevent further damage                                │
│                                                                 │
│   3. ERADICATE                                                  │
│      ├── Remove threat actor access                            │
│      ├── Patch vulnerabilities                                 │
│      └── Reset compromised credentials                         │
│                                                                 │
│   4. RECOVER                                                    │
│      ├── Restore systems from clean backups                    │
│      ├── Verify system integrity                               │
│      └── Monitor for reoccurrence                              │
│                                                                 │
│   5. LESSONS LEARNED                                            │
│      ├── Document timeline and actions                         │
│      ├── Identify root cause                                   │
│      └── Update security controls                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## References

### Standards
- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NIST SP 800-53 Rev 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

### Books
- OWASP - "OWASP Testing Guide v4"
- Adam Shostack - "Threat Modeling: Designing for Security" (2014)
- Dafydd Stuttard - "The Web Application Hacker's Handbook" (2011)

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
