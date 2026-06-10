---
source: ../../../core/security-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: fa53a8627f24
status: current
---

# 安全测试标准

> **语言**: [English](../../../core/security-testing.md) | [繁體中文](../../zh-TW/core/security-testing.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-05-04
**适用性**: 所有软件项目
**范围**: universal
**行业标准**: OWASP Testing Guide v4, NIST SP 800-115, ISO/IEC 27001
**参考**: OWASP Top 10, CWE/SANS Top 25

---

## 目的

本文档定义软件项目的安全测试方法论。它与 `security-standards.md`（架构层面的安全设计）互补，提供执行层面的指导：应运行哪些工具、何时运行、以及如何响应发现的问题。

---

## 四个安全测试层

### 1. SAST — 静态分析

在不执行代码的情况下分析源代码。在 pre-commit 和 CI 中运行。

| 语言 | 工具 | 检测项 |
|----------|------|---------|
| TypeScript/JS | eslint-plugin-security | eval 注入、regex DoS、路径遍历 |
| Python | bandit | SQL 注入、硬编码凭据 |
| Java | SpotBugs + FindSecBugs | SQL 注入、XSS |

**门禁**: High/Critical → 阻止 merge

### 2. 依赖审计

扫描第三方包的已知 CVE。在 pre-push 和每周运行。

| 生态系统 | 工具 | 命令 |
|-----------|------|---------|
| Node.js | npm audit | `npm audit --audit-level=high` |
| Python | pip-audit | `pip-audit` |

**门禁**: High/Critical CVE → 阻止发布（例外须记录并附到期日期）

### 3. 密钥扫描

检测意外提交的密钥。在每次 commit 时运行。

工具: gitleaks、truffleHog

**门禁**: 检测到任何密钥 → 立即阻止 commit

### 4. DAST — 动态分析

通过 HTTP 测试运行中的应用程序。在 staging 部署后运行。

工具: OWASP ZAP、Nuclei

**门禁**: High/Critical 发现 → 阻止晋升至 production

---

## CVE 响应策略

| 严重程度 | 响应 |
|----------|----------|
| Critical | 24 小时内修补；阻止所有部署 |
| High | 下次发布前解决 |
| Moderate | 14 天内解决 |
| Low | 跟踪；在维护窗口解决 |

---

## 反模式

- 将所有 CVE 视为同等紧急
- 对 production 运行 DAST（应使用 staging）
- 无限期忽略 `npm audit`
- 在测试中 mock 身份认证 middleware（见 mock-boundary.md）

---

## 与其他标准的关系

- `security-standards`: 架构层面的控制措施（输入验证、身份认证设计）
- `mock-boundary`: 测试中绝不 mock 安全控制
- `deployment-standards`: DAST 作为部署流水线的一部分运行
