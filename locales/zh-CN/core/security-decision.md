---
source: ../../../core/security-decision.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: dac1cdefe950
status: current
---

# 安全决策标准

> **语言**: [English](../../../core/security-decision.md) | 简体中文

> **来源**: XSPEC-037 | **借鉴自**: claude-code-book Ch.4

## 概述

安全决策标准定义了三态决策模型（`deny` / `ask` / `allow`），并遵循一条铁律式的优先级：**deny 永远胜出**，无论来源的优先级高低。这意味着低优先级的用户设置若为 `deny`，会覆盖高优先级的策略设置中的 `allow`。

## 三种状态

| 决策 | 优先级 | 行为 |
|----------|----------|----------|
| `deny` | 1（最高） | 立即阻止，不再进行后续评估 |
| `ask` | 2 | 暂停并请求用户确认 |
| `allow` | 3（最低） | 允许操作继续执行 |

## 仲裁规则

```
if any rule has deny → final decision: deny
else if any rule has ask → final decision: ask
else → final decision: allow
```

**不变量**：无论来源优先级如何，deny 一律胜出。

## CI 模式

在非交互式（CI/CD）环境中，`ask` 视同 `deny`——由于没有提供人工确认的机制，该操作必须被阻止。

## projectSettings 信任半径

来自 `projectSettings`（`.adoption/` 风格目录）的配置不得用于安全敏感操作，以防止恶意仓库注入：

**禁止由 projectSettings 执行的操作**：
- 设置 `requiresUserConfirmation: false`
- 将记忆路径重定向到项目目录之外
- 将工具允许清单扩展到超出 userSettings 的范围
- 将 deny 规则降级为 allow

日志：`[WARN] projectSettings security override rejected: {operation}`

## 接口

```typescript
type SecurityDecision = "deny" | "ask" | "allow";

interface SecurityDecisionRule {
  source: string;        // user | project | policy | builtin
  decision: SecurityDecision;
  reason?: string;
}

function arbitrate(rules: SecurityDecisionRule[]): SecurityDecision {
  if (rules.some(r => r.decision === "deny")) return "deny";
  if (rules.some(r => r.decision === "ask")) return "ask";
  return "allow";
}
```

## 参考资料

- AI 优化版：[ai/standards/security-decision.ai.yaml](../../../ai/standards/security-decision.ai.yaml)
- XSPEC-037：跨项目规格
- 借鉴自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.4 四阶段权限管道


**适用范围**: universal
