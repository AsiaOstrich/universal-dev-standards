---
source: ../../../core/security-decision.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 安全决策标准

> **语言**: [English](../../../core/security-decision.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-068（DEC-043 Wave 1 可靠性套件）

---

## 目的

安全决策铁律：deny > ask > allow 优先级仲裁，确保所有安全相关决策不被绕过。

当多个规则对同一操作产生冲突的安全决策时（一个规则说 allow，另一个说 deny），必须有明确的优先级仲裁机制。本标准定义三态优先级（deny > ask > allow），并禁止任何代码路径绕过 deny 决策。

---

## 核心规范

- 安全决策优先级：`deny` > `ask` > `allow`
- 任何 `deny` 决策均不可被 `allow` 或 `ask` 覆盖
- `policy_violation` 类失败必须触发 `deny`，不得重试
- 安全决策必须记录遥测事件（`security_decision_made`）
- 禁止在安全决策路径上使用 try/catch 静默吞掉异常

---

## 三态优先级

| 优先级 | 决策 | 说明 |
|--------|------|------|
| 最高 | `deny` | 明确拒绝，不可被覆盖；记录原因 |
| 中间 | `ask` | 需要用户确认后才可执行 |
| 最低 | `allow` | 默认放行，前提是无 deny/ask 规则匹配 |

### 仲裁逻辑

```
if (任何规则产生 deny) → deny（终止，不继续检查）
else if (任何规则产生 ask) → ask（等待用户确认）
else → allow
```

---

## 禁止的模式

| 禁止 | 原因 |
|------|------|
| 捕获 `DenyError` 并继续执行 | 绕过安全决策 |
| 在 `deny` 后重试操作 | `policy_violation` 不可重试 |
| 在 `ask` 阶段超时后自动 allow | 应超时后自动 deny |
| 忽略安全决策遥测日志 | 无审计追踪 |

---

## 遥测事件

**`security_decision_made`**（每次安全决策时上报）

| 字段 | 类型 |
|------|------|
| `operation` | `string` |
| `decision` | `deny\|ask\|allow` |
| `matchedRule` | `string` |
| `reason` | `string` |
| `timestamp` | `string` |

---

## 情境示例

**情境 1：deny 优先于 allow**
- 条件：规则 A 产生 allow，规则 B 产生 deny
- 结果：最终决策为 deny，操作被拒绝，记录原因

**情境 2：ask 超时**
- 条件：操作需要用户确认（ask），用户 30 秒内未响应
- 结果：超时后自动转为 deny（不允许自动 allow）

**情境 3：policy_violation 不重试**
- 条件：操作触发 `policy_violation`，决策为 deny
- 结果：立即终止，不进入重试逻辑，记录 `security_decision_made`

---

## 错误码

| 代码 | 说明 |
|------|------|
| `SEC-001` | `OPERATION_DENIED` — 安全决策为 deny，操作被拒绝 |
| `SEC-002` | `ASK_TIMEOUT` — 用户确认超时，自动转为 deny |
| `SEC-003` | `SECURITY_BYPASS_DETECTED` — 检测到绕过安全决策的代码路径 |
