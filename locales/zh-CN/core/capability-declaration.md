---
source: ../../../core/capability-declaration.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5890495db0da
status: current
---

# 能力声明标准

> **语言**: [English](../../../core/capability-declaration.md) | 简体中文

> **来源**: XSPEC-037 | **借鉴自**: claude-code-book Ch.3

## 概述

能力声明标准要求所有工具、Adapter 与 Agent 明确声明其安全属性。**所有属性默认取最保守的（Fail-Closed）值**——忘记声明能力的开发者得到的是安全的行为，而不是危险的行为。

借鉴自 claude-code-book 的 `buildTool` 工厂设计：其中 `isConcurrencySafe()` 与 `isReadOnly()` 默认为 `false`，性能优化必须明确选择启用（opt-in）。

## Fail-Closed 默认值

```typescript
const FAIL_CLOSED_DEFAULTS: CapabilityDeclaration = {
  isConcurrencySafe: false,       // Cannot run in parallel
  isReadOnly: false,              // Assumed to have side effects
  requiresUserConfirmation: true, // Must confirm before execution
  trustLevel: "untrusted",        // Maximum sandbox restrictions
};
```

## CapabilityDeclaration 接口

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isConcurrencySafe` | boolean | **false** | 可安全地与其他操作并行执行 |
| `isReadOnly` | boolean | **false** | 不产生任何持久性状态变更 |
| `requiresUserConfirmation` | boolean | **true** | 执行前需要用户明确批准 |
| `trustLevel` | enum | **untrusted** | 沙箱隔离级别 |

## 信任级别

| 级别 | 说明 | 沙箱 |
|------|------|------|
| `trusted` | 内置或已审计的插件 | 无限制 |
| `sandboxed` | 第三方工具 | 受限的执行环境 |
| `untrusted` | 来源未知 | 最大限制（默认） |

## 常见工具声明

| 工具 | isConcurrencySafe | isReadOnly | requiresConfirmation | trustLevel |
|------|-------------------|------------|---------------------|------------|
| GrepTool | ✅ true | ✅ true | ❌ false | trusted |
| GlobTool | ✅ true | ✅ true | ❌ false | trusted |
| FileReadTool | ✅ true | ✅ true | ❌ false | trusted |
| FileEditTool | ❌ false | ❌ false | ✅ true | trusted |
| BashTool | ❌ false | ❌ false | ✅ true | sandboxed |

## 执行规范

- **缺少声明**：使用 `FAIL_CLOSED_DEFAULTS`，并记录 `[WARN] Capability not declared for: {name}`
- **虚假声明检测**：若声明 `isReadOnly: true` 却执行写入 → 记录 `CAPABILITY_MISMATCH` 事件，并回退为 Fail-Closed
- **并发**：只有 `isConcurrencySafe: true` 的组件可以被批次放入并行执行

## 参考资料

- AI 优化版：[ai/standards/capability-declaration.ai.yaml](../../../ai/standards/capability-declaration.ai.yaml)
- XSPEC-037：跨项目规格
- 借鉴自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.3 `buildTool` Fail-Closed 工厂


**适用范围**: universal
