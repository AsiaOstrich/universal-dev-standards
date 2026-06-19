---
source: core/guides/security-guide.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Security Guide

> **语言**: [English](../../../../core/guides/security-guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-29
**相关标准**: [Security Standards](../security-standards.md)

---

## Purpose

本指南提供软件安全的详细说明、漏洞示例与教学内容。若需要可立即执行的检查清单、必需算法与强制标头，请参阅 [Security Standards](../security-standards.md)。

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

关键洞见在于：没有任何单一的安全控制是完美的。通过分层布防，即使攻击者突破了某一层，仍会面临更多障碍。

---

## OWASP Top 10 Detailed Analysis

### A01:2021 – Broken Access Control

**为何位居第一**：访问控制失效从第 5 名跃升至第 1 名，原因在于应用程序越来越依赖复杂的权限系统，而这类系统极易配置错误。

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

**IDOR 防护示例**：
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

**SQL Injection 防护**：
```typescript
// ❌ Bad: String concatenation (vulnerable to SQL injection)
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Good: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ✅ Good: ORM with proper escaping
const user = await User.findOne({ where: { id: userId } });
```

**Command Injection 防护**：
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

**为何采用这些算法？** 它们的设计目的就是要在计算上耗费高昂的成本，使得暴力破解攻击变得不切实际。Argon2id 属于 memory-hard（内存密集）算法，意味着攻击者难以利用 GPU 轻易地并行化攻击。

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

当 RBAC 不足以应对需求时（复杂的策略）：

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

**关键洞见**：客户端验证仅用于提升用户体验。所有安全验证都必须在服务器端进行。

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

**为什么？** 错误消息可能泄漏以下信息：
- 数据库结构（SQL 错误）
- 文件系统路径（堆栈跟踪）
- 库版本（有助于锁定已知漏洞发动攻击）

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

| 类别 | 事件 |
|----------|--------|
| **Authentication** | 登录成功／失败、登出、MFA 事件 |
| **Authorization** | 拒绝访问、权限提升尝试 |
| **Data Access** | 敏感数据访问、批量导出 |
| **Admin Actions** | 用户创建、权限变更 |
| **Security Events** | 输入验证失败、触及速率限制 |

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

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [core/guides/security-guide.md](../../../../core/guides/security-guide.md)
