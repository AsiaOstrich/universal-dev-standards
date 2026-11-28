---
source: ../../../../skills/security-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-11-28
source_hash: d43d13d774e2
status: current
description: |
  引导安全审查与漏洞评估，遵循 OWASP 标准。
  Use when: 安全审计、漏洞检查、安全编码审查、威胁建模。
  Not for: 自动化的依赖包、CVE 与密钥扫描——请用 /scan；处理正在发生的安全事件——请用 /incident。
  Keywords: security, OWASP, vulnerability, authentication, authorization, 信息安全, 漏洞, 认证, 授权, 威胁建模.
---

# 安全审计助手

> **语言**: [English](../../../../skills/security-assistant/SKILL.md) | 简体中文

引导系统化的安全审查，遵循 OWASP Top 10 和业界最佳实践。

## 快速检查清单 — OWASP Top 10 预防

| ID | 风险 | 预防措施 |
|----|------|----------|
| A01 | 访问控制失效 | 最小权限原则，默认拒绝 |
| A02 | 加密失败 | 使用强加密算法，保护密钥 |
| A03 | 注入攻击 | 参数化查询、输入验证 |
| A04 | 不安全设计 | 威胁建模、安全设计模式 |
| A05 | 安全配置错误 | 强化默认值、最小权限 |
| A06 | 易受攻击的组件 | 追踪依赖包、定期修补 |
| A07 | 认证失败 | 多因素认证、强密码策略 |
| A08 | 数据完整性失败 | 验证签名、使用可信来源 |
| A09 | 日志记录失败 | 记录安全事件、监控告警 |
| A10 | SSRF | 验证 URL、限制对外流量 |

## 安全审查工作流程

```
SCOPE ──► SCAN ──► VERIFY ──► ANALYZE ──► REPORT
```

### 1. Scope — 定义审计范围
识别目标模块、数据流和信任边界。

### 2. Scan — 识别漏洞
检查代码的 OWASP Top 10 模式、检查依赖包、检视配置。

### 3. Verify — 验证：试图推翻每个发现
扫描产生的每个候选发现，都交给**没有参与发现的验证者**。只由发现者自己裁决的发现，只是被提出，不是被验证（[verification-evidence](../../../../core/verification-evidence.md) VE-013）。

- **谁来验证**：没有参与扫描的全新 agent、子代理或人。只给它主张、位置与代码，**不给发现者的推理**。以这样的立场开场：“这不是你写的发现，试着从源代码推翻它。”
- **没有独立验证者**：该发现保持 `unverified`，不得自己确认自己的发现。
- **只有三种状态**：

| 状态 | 含义 | 可带严重度？ |
|------|------|--------------|
| `confirmed` | 验证者试图推翻而失败，并留下证据 | **可以 —— 唯一可带严重度的状态** |
| `unverified` | 尚无验证者裁决，或验证者无法判断 | **不可以** |
| `refuted` | 验证者证明该发现不成立 | **不可以** |

被推翻的发现**保留**并写明理由，下次审查才不会换个说法再提一次。待验证的发现既不算通过，也不算不存在。

### 4. Analyze — 评估风险
只对**已确认**的发现，依严重程度（Critical/High/Medium/Low）和可利用性分类。其他状态的发现不排序。

### 5. Report — 记录发现
产出可行动的发现报告，附带修复建议，采用下方的结构化格式，并在交出前跑检查。审查只有两种结束方式：**`all_verified`**（没有发现停在 `unverified`），或 **`incomplete`** 并写明原因。不得半途停下而不说明。

## 发现报告格式

```json
{
  "scope": "src/auth",
  "completion": "incomplete",
  "incomplete_reason": "F-2 had no separate verifier",
  "findings": [
    { "id": "F-1", "title": "SQL built by string concatenation", "location": "src/auth/login.js:42",
      "discovered_by": "scan", "status": "confirmed", "severity": "high",
      "verified_by": "verifier-1", "evidence": "req.body.user reaches db.exec unescaped",
      "remediation": "Use a parameterized query" },
    { "id": "F-2", "title": "Weak password hash", "location": "src/auth/hash.js:8",
      "discovered_by": "scan", "status": "unverified",
      "pending_reason": "no separate verifier was available" },
    { "id": "F-3", "title": "Reflected XSS", "location": "src/ui/view.js:15",
      "discovered_by": "scan", "status": "refuted",
      "verified_by": "verifier-1", "refutation_reason": "the template escapes this output" }
  ]
}
```

各状态的字段契约：

- `confirmed`：`severity`（critical / high / medium / low）、`verified_by`、`evidence`；`remediation` 选填。
- `unverified`：`pending_reason`。**不得有 `severity`。**
- `refuted`：`verified_by`、`refutation_reason`。**不得有 `severity`，也不得有 `remediation`。**
- `verified_by` 必须与 `discovered_by` 不同。`completion` 是 `all_verified` 或 `incomplete`；`incomplete` 需要 `incomplete_reason`。

**只有“已确认”的发现可以带严重度（SF-002）。**

### 跑检查

```
uds security check-findings findings.json
uds security check-findings - <<'EOF'   # 或由标准输入传入
{ ...报告... }
EOF
```

退出码 `0`：报告符合契约。`1`：不符合（逐条点名），修正后才能交出。`2`：检查无法判断（文件不存在或不是 JSON），**2 不算通过**。检查只判断报告的**形状**，不判断发现是否为真，也不判断验证者是否真的不知道发现过程；那一部分取决于你怎么执行验证阶段。

## 严重程度分类

只适用于 `confirmed` 的发现。

| 等级 | 标准 |
|------|------|
| **Critical** | 远程代码执行、数据泄露 |
| **High** | 认证绕过、权限提升 |
| **Medium** | 信息泄露、CSRF |
| **Low** | 缺少 Header、冗长错误信息 |

## 使用方式

```
/security                - 当前项目的完整安全审查
/security src/auth       - 审计特定模块
/security --owasp        - OWASP Top 10 重点审查
```

## 下一步引导

`/security` 完成后，AI 助手应建议：

> **安全审查完成。建议下一步：**
> - 执行 `/checkin` 确认修复符合提交规范 ⭐ **推荐**
> - 执行 `/code-review` 对安全修复进行代码审查
> - 执行 `/commit` 提交安全修复
> - 检查依赖包更新 → `npm audit` 或 `pip audit`

## 参考

- 核心规范：[security-standards.md](../../../../core/security-standards.md)
- 谁可以裁决一项主张：[verification-evidence.md](../../../../core/verification-evidence.md)（VE-013 至 VE-020）

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-03-23 | 初始版本 |
| 1.1.0 | 2026-11-28 | 新增验证阶段（没有参与发现的验证者；确认／待验证／推翻；只有确认可带严重度）、结构化发现报告与 `uds security check-findings` |


## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文档：[`/security`](../commands/security.md#ai-agent-behavior--ai-代理行为)

## 授权

CC BY 4.0 — 文档内容
