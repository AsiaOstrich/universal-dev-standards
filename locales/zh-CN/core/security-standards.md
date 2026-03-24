---
source: ../../../core/security-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/security-standards.md) | 简体中文

# 安全标准

**版本**: 1.1.0
**最后更新**: 2026-01-29
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: OWASP Top 10 (2021), OWASP ASVS v4.0, NIST SP 800-53
**参考**: [owasp.org](https://owasp.org/Top10/)

> **详细说明和示例请参阅 [安全指南](../../../core/guides/security-guide.md)**

---

## 目的

本标准定义软件开发的综合安全指南，涵盖安全编码实践、漏洞预防、认证/授权和安全测试。

**参考标准**:
- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)

---

## 核心安全原则

| 原则 | 实施方式 |
|------|---------|
| **最小权限** | 基于角色的访问控制、限时令牌 |
| **安全失败** | 认证错误时拒绝访问，不暴露堆栈跟踪 |
| **职责分离** | 开发/部署/管理使用不同角色 |
| **纵深防御** | 不依赖单一控制措施 |
| **默认安全** | 安全默认值，选择性开启较不安全的选项 |
| **零信任** | 验证每个请求，假设已被入侵 |

---

## OWASP Top 10 预防清单

| 漏洞 | 预防措施 |
|------|---------|
| **A01: 失效的访问控制** | 默认拒绝、服务端检查、验证所有权 |
| **A02: 加密失败** | 加密 PII、使用 TLS 1.3、使用密钥管理 |
| **A03: 注入** | 参数化查询、输入验证、使用 ORM |
| **A04: 不安全设计** | 威胁建模、在规格中包含安全需求 |
| **A05: 安全配置错误** | 移除默认值、禁用未使用功能、安全头 |
| **A06: 易受攻击的组件** | 维护 SBOM、使用 npm audit/Snyk 扫描、快速修补 |
| **A07: 认证失败** | 强密码、MFA、安全会话 |
| **A08: 完整性失败** | 代码签名、验证校验和、安全 CI/CD |
| **A09: 日志记录失败** | 记录安全事件、保护日志完整性 |
| **A10: SSRF** | URL 白名单、阻止内部 IP |

---

## 必需的安全头

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 安全测试

| 测试类型 | 工具 | 频率 |
|---------|------|------|
| **SAST**（静态分析） | SonarQube, CodeQL, Semgrep | 每次提交 |
| **DAST**（动态分析） | OWASP ZAP, Burp Suite | 每次发布 |
| **SCA**（依赖扫描） | npm audit, Snyk, Dependabot | 每日 |
| **密钥扫描** | git-secrets, TruffleHog | 每次提交 |

---

## 相关标准

- [部署标准](deployment-standards.md)
- [性能标准](performance-standards.md)
- [测试标准](testing-standards.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
