---
source: ../../../core/dual-phase-output.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 双阶段输出标准

> **语言**: [English](../../../core/dual-phase-output.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-068（DEC-043 Wave 1 可靠性套件）

---

## 目的

双阶段 LLM 输出标准：`<analysis>` 丢弃 + `<summary>` 保留，统一 Agent 的输出过滤行为。

Agent 的推理过程（chain-of-thought）不应直接暴露给下游消费者：它消耗 token、包含中间假设、对机器不友好。本标准要求所有 Agent 输出分为两个阶段，`<analysis>` 标签内容在传递给下游前丢弃，只保留 `<summary>` 内容。

---

## 核心规范

- 所有 Agent 必须在输出中明确区分 `<analysis>` 与 `<summary>` 两个阶段
- `<analysis>` 内容为推理过程，不得传递给下游消费者（丢弃）
- `<summary>` 内容为最终结论，必须保留并传递
- 若 Agent 输出缺少 `<summary>` 标签，视为格式错误（DUAL-001）
- 下游模块在消费 Agent 输出前必须执行过滤步骤

---

## 输出格式

```xml
<analysis>
[Agent 的推理过程、假设检验、中间步骤]
[此区段会被丢弃，不传递给下游]
</analysis>

<summary>
[最终结论、可执行的建议、结构化数据]
[此区段会被保留并传递给下游消费者]
</summary>
```

---

## 过滤规则

| 规则 | 说明 |
|------|------|
| 规则 1 | 解析输出时，提取 `<summary>...</summary>` 内容 |
| 规则 2 | 丢弃 `<analysis>...</analysis>` 及其内容 |
| 规则 3 | 若两个标签都缺失，回传错误 `DUAL-001` |
| 规则 4 | 若只有 `<analysis>` 无 `<summary>`，回传错误 `DUAL-001` |
| 规则 5 | 允许 `<summary>` 内嵌套结构化数据（JSON、YAML、代码块）|

---

## 遥测事件

**`dual_phase_filter_applied`**（每次执行过滤时上报）

| 字段 | 类型 |
|------|------|
| `agentId` | `string` |
| `analysisTokens` | `number` |
| `summaryTokens` | `number` |
| `filterSuccess` | `boolean` |
| `timestamp` | `string` |

---

## 情境示例

**情境 1：正常双阶段输出**
- Agent 输出包含 `<analysis>` 和 `<summary>` 标签
- 过滤后只保留 `<summary>` 内容传递给下游

**情境 2：缺少 `<summary>` 标签**
- Agent 输出只有 `<analysis>` 内容
- 回传 `DUAL-001` 错误，不传递任何内容给下游

**情境 3：`<summary>` 内嵌套 JSON**
- `<summary>` 内包含结构化 JSON 数据
- 过滤后完整保留 JSON，可被下游直接解析

---

## 错误码

| 代码 | 说明 |
|------|------|
| `DUAL-001` | `MISSING_SUMMARY_TAG` — 输出缺少 `<summary>` 标签 |
| `DUAL-002` | `EMPTY_SUMMARY` — `<summary>` 标签内容为空 |
| `DUAL-003` | `MALFORMED_OUTPUT` — 输出格式无法解析 |
