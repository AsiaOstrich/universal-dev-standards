---
source: ../../../core/security-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: a9d69cc6a3a7
status: current
---

# 安全标准

> **语言**: [English](../../../core/security-standards.md) | [繁體中文](../../zh-TW/core/security-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-01-29
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: OWASP Top 10 (2021), OWASP ASVS v4.0, NIST SP 800-53
**参考**: [owasp.org](https://owasp.org/Top10/), [owasp.org](https://owasp.org/www-project-application-security-verification-standard/)

> **详细说明和示例请参阅 [安全指南](guides/security-guide.md)**

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
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

---

## 加密要求

### 算法选择

| 用途 | 必需 | 避免 |
|------|------|------|
| **对称加密** | AES-256-GCM | DES, 3DES, AES-ECB |
| **非对称加密** | RSA-2048+, ECDSA P-256+ | RSA-1024 |
| **哈希** | SHA-256, SHA-3, BLAKE3 | MD5, SHA-1 |
| **密码哈希** | Argon2id, bcrypt, scrypt | SHA-256, PBKDF2 |
| **TLS 版本** | TLS 1.3, TLS 1.2 | TLS 1.0, TLS 1.1, SSL |

### 密码哈希配置

| 算法 | 配置 |
|------|------|
| **Argon2id** | Memory: 64 MB, Iterations: 3, Parallelism: 4, Salt: 16 bytes |
| **bcrypt** | Cost factor ≥ 12 |
| **scrypt** | N=2^17, r=8, p=1 |

---

## 认证要求

### 密码策略

| 需求 | 最小值 | 推荐值 |
|------|--------|--------|
| **长度** | 8 个字符 | 12+ 个字符 |
| **泄露密码检查** | 必需 | HaveIBeenPwned API |
| **历史记录** | 最近 5 个密码 | 最近 10 个密码 |

### 会话管理

| 参数 | 推荐值 |
|------|--------|
| **会话 ID 长度** | ≥ 128 位 |
| **会话超时（空闲）** | 15-30 分钟 |
| **会话超时（绝对）** | 8-24 小时 |
| **Cookie 标志** | `Secure; HttpOnly; SameSite=Strict` |

### MFA 要求

- **必需用于**: 管理员访问、敏感操作、账户恢复
- **推荐用于**: 所有用户账户
- **首选**: WebAuthn（防钓鱼）

---

## 授权清单

- [ ] 在服务端实施授权（绝不信任客户端）
- [ ] 检查每个请求的权限
- [ ] 采用默认拒绝
- [ ] 记录授权失败
- [ ] 实施针对每个用户/角色的速率限制
- [ ] 定期审查权限

---

## 输入验证规则

| 数据类型 | 验证 |
|----------|------|
| **Email** | RFC 5322 正则表达式 + 域名检查 |
| **URL** | 协议白名单，无内部 IP |
| **Phone** | E.164 格式 |
| **Date** | ISO 8601，合理范围 |
| **Integer** | 类型检查，最小/最大边界 |
| **String** | 长度限制，字符白名单 |
| **File** | 类型、大小、magic bytes |

---

## API 安全要求

### 速率限制

| 端点类型 | 限制 | 窗口 |
|----------|------|------|
| **登录** | 5 次尝试 | 15 分钟 |
| **API（已认证）** | 1000 次请求 | 1 小时 |
| **API（未认证）** | 100 次请求 | 1 小时 |
| **密码重置** | 3 次请求 | 1 小时 |

---

## 安全测试要求

| 测试类型 | 频率 | 目的 |
|----------|------|------|
| **SAST** | 每次提交 | 发现源代码中的漏洞 |
| **DAST** | 每周/每次发布 | 测试运行中的应用程序 |
| **SCA** | 每日 | 检查依赖漏洞 |
| **渗透测试** | 每季度/每年 | 手动安全测试 |
| **安全代码审查** | 关键变更 | 手动代码审查 |

### 推荐工具

| 类别 | 工具 |
|------|------|
| **SAST** | SonarQube, Semgrep, CodeQL |
| **DAST** | OWASP ZAP, Burp Suite |
| **SCA** | Snyk, npm audit, Dependabot |
| **密钥扫描** | GitLeaks, TruffleHog |

---

## 事件响应严重程度

| 级别 | 描述 | 响应时间 |
|------|------|----------|
| **P1 严重** | 活跃入侵、数据外泄 | < 15 分钟 |
| **P2 高** | 漏洞被利用、无数据丢失 | < 1 小时 |
| **P3 中** | 发现漏洞、未被利用 | < 24 小时 |
| **P4 低** | 次要安全问题 | < 1 周 |

---

## 部署前安全检查清单

### 认证与授权
- [ ] 密码使用 Argon2id/bcrypt 进行哈希
- [ ] 所有用户均可使用 MFA
- [ ] 会话管理安全（HttpOnly、Secure、SameSite）
- [ ] 每个请求均在服务端检查授权

### 输入/输出
- [ ] 所有输入均在服务端进行验证
- [ ] 输出根据上下文进行编码（HTML、JS、URL）
- [ ] 所有数据库操作均使用参数化查询
- [ ] 文件上传经过验证（类型、大小、内容）

### 加密
- [ ] 所有地方均强制使用 TLS 1.2+
- [ ] 使用强算法（AES-256、RSA-2048+）
- [ ] 代码或版本控制中无机密信息
- [ ] 密钥存储在机密管理器中

### 配置
- [ ] 已配置安全头
- [ ] CORS 限制为允许的来源
- [ ] 生产环境中禁用调试模式
- [ ] 已更改默认凭据

### 监控
- [ ] 记录安全事件
- [ ] 为可疑活动配置告警
- [ ] 记录事件响应计划

---

## 相关标准

- [代码审查清单](code-review-checklist.md) - 安全审查部分
- [测试标准](testing-standards.md) - 安全测试集成
- [日志标准](logging-standards.md) - 安全日志记录
- [错误码标准](error-code-standards.md) - AUTH 错误码
- [部署标准](deployment-standards.md) - 部署前安全检查清单

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-29 | 重构：拆分为规则 + 指南，将解释说明移至指南 |
| 1.0.0 | 2026-01-29 | 初始发布 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
