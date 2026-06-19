---
source: core/guides/security-guide.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Security Guide

> **語言**: [English](../../../../core/guides/security-guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-29
**相關標準**: [Security Standards](../security-standards.md)

---

## Purpose

本指南提供軟體安全的詳細說明、漏洞範例與教學內容。若需要可立即執行的檢查清單、必要演算法與強制標頭，請參閱 [Security Standards](../security-standards.md)。

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

關鍵洞見在於：沒有任何單一的安全控制是完美的。透過分層佈防，即使攻擊者突破了某一層，仍會面臨更多障礙。

---

## OWASP Top 10 Detailed Analysis

### A01:2021 – Broken Access Control

**為何位居第一**：存取控制失效從第 5 名躍升至第 1 名，原因在於應用程式越來越依賴複雜的權限系統，而這類系統極易設定錯誤。

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

**IDOR 防護範例**：
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

**SQL Injection 防護**：
```typescript
// ❌ Bad: String concatenation (vulnerable to SQL injection)
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Good: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ✅ Good: ORM with proper escaping
const user = await User.findOne({ where: { id: userId } });
```

**Command Injection 防護**：
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

**為何採用這些演算法？** 它們的設計目的就是要在計算上耗費高昂的成本，使得暴力破解攻擊變得不切實際。Argon2id 屬於 memory-hard（記憶體密集）演算法，意味著攻擊者難以利用 GPU 輕易地平行化攻擊。

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

當 RBAC 不足以應付需求時（複雜的政策）：

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

**關鍵洞見**：用戶端驗證僅用於提升使用者體驗。所有安全驗證都必須在伺服器端進行。

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

**為什麼？** 錯誤訊息可能洩漏以下資訊：
- 資料庫結構（SQL 錯誤）
- 檔案系統路徑（堆疊追蹤）
- 函式庫版本（有助於鎖定已知漏洞發動攻擊）

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

| 類別 | 事件 |
|----------|--------|
| **Authentication** | 登入成功／失敗、登出、MFA 事件 |
| **Authorization** | 拒絕存取、權限提升嘗試 |
| **Data Access** | 敏感資料存取、大量匯出 |
| **Admin Actions** | 使用者建立、權限變更 |
| **Security Events** | 輸入驗證失敗、觸及速率限制 |

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

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [core/guides/security-guide.md](../../../../core/guides/security-guide.md)
