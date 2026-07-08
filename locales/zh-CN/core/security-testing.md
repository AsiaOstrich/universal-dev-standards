---
source: ../../../core/security-testing.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-08
source_hash: 242e9016416c
status: current
---

# 安全测试标准

> **语言**: [English](../../../core/security-testing.md) | [繁體中文](../../zh-TW/core/security-testing.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-06-19
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

## 发现事项修复生命周期

上述各层负责检测发现，CVE 策略则设定解决时限（SLA），但一个发现事项还需要一个**有负责人的生命周期**——否则「阻止 merge」就是唯一定义好的动作，检测之后的一切都没有定义。每个安全发现（SAST / DAST / 密钥 / 依赖 CVE）都遵循以下状态机。

| 状态 | 含义 | 负责人 | 退出条件 |
|-------|---------|-------|----------------|
| **Detected（已检测）** | 由某一层（SAST/DAST/密钥/审计）提出 | 扫描门禁（CI） | 已分配严重程度 |
| **Triaged（已分诊）** | 已确认严重程度与有效性（真实 vs 误报） | 安全审查者 | 真实 → 转为 In-Progress；误报 → 标记为 `suppressed` 并记录理由 |
| **In-Progress（处理中）** | 修复正在实现 | 受影响组件的代码负责人 | 修复已提交 |
| **Resolved（已解决）** | 修复已合并 | 代码负责人 | 原扫描重新运行后无发现 |
| **Verified（已验证）** | 重新扫描确认发现已消失 | 扫描门禁（CI） | 发现事项关闭 |

- **门禁**：任何 Critical/High 发现若状态非 `Verified`（或 `Triaged → suppressed` 且附有理由），皆**阻止发布**，与上述 CVE 响应策略的 SLA 一致。
- **不得静默关闭**：发现事项只能通过 `Verified`（重新扫描无发现）或安全审查者明确记录的 `suppressed` 决定离开此生命周期——绝不可通过删除，也不可由修复作者自行批准关闭。

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
