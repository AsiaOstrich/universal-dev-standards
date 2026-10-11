---
source: ../../../core/dual-phase-output.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 6a2398bdff72
status: current
---

# 双阶段 LLM 输出标准

> **语言**: [English](../../../core/dual-phase-output.md) | 简体中文

> **来源**: XSPEC-035 | **借鉴自**: claude-code-book Ch.7 AutoCompact

## 概述

双阶段 LLM 输出模式要求 LLM 审查 Agent 在单次响应中产生两个 XML 区块：`<analysis>` 思考草稿（处理后丢弃）与 `<summary>` 结构化结论（保留）。这让模型能充分推理，同时避免思考过程在对话上下文中累积。

## 问题

审查 Agent（Judge、Evaluator、Guardian）通常产生 2000–5000 token 的响应，其中 50–70% 是会在对话历史中累积的推理内容。在重复审查的场景（Fix Loop 重试 3 次）中，每个任务因此浪费 3000–10500 token。

## 格式

```xml
<analysis>
[Reasoning scratchpad — DISCARDED after processing]
- Step-by-step evaluation
- Edge case considerations
- Alternative comparisons
</analysis>

<summary>
decision: approved | rejected | needs_revision
confidence: high | medium | low
findings:
  - [type] description
next_action: [recommended follow-up action]
</summary>
```

## 后处理规则

1. 提取 `<summary>` 内容 → 持久化到上下文
2. 丢弃 `<analysis>` 内容 → 绝不写入对话历史
3. 若缺少 `<summary>` 标签 → 回退：把整段响应当作 summary，并记录 `[WARN] dual-phase format missing`

## 扩展字段

应用可以在 `<summary>` 内新增字段，但不得移除核心字段：
- **安全（Guardian）**：`severity: critical | high | medium | low`、`cwe_ids: [CWE-NNN]`
- **质量（Evaluator）**：`test_coverage: number`、`tech_debt_score: number`

## Token 影响

| 场景 | 节省量 |
|------|--------|
| 单次审查 | 1000–3500 token |
| Fix Loop（重试 3 次） | 3000–10500 token |
| 多 Agent 管线（evaluator + guardian；采用层） | 每次运行 2000–7000 token |

## 参考资料

- AI 优化版：[ai/standards/dual-phase-output.ai.yaml](../../../ai/standards/dual-phase-output.ai.yaml)
- XSPEC-035：跨项目规格
- 借鉴自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.7 `formatCompactSummary`


**适用范围**: universal
