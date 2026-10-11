---
source: ../../../core/token-budget.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 72030e8c343a
status: current
---

# Token 预算区间标准

> **语言**: [English](../../../core/token-budget.md) | 简体中文

> **来源**: XSPEC-036 | **借鉴自**: claude-code-book Ch.7

## 概述

Token 预算区间模型将 token 用量划分为四个递进区间，每个区间触发逐步加强的保护策略。这能避免「一切正常直到突然崩溃」的失败模式，让系统在触及硬性上限之前有时间优雅降级。

## 区间

| 区间 | 范围 | 行为 | 日志级别 |
|------|-------|--------|-----------|
| **SAFE** | 0–84% | 正常运行 | — |
| **WARNING** | 85–89% | 发出事件，通知协调者 | info |
| **DANGER** | 90–94% | 触发轻量压缩（Snip） | warn |
| **BLOCKING** | 95–100% | 拒绝新请求，返回错误 | error |

## 常量

```typescript
const TOKEN_BUDGET_ZONE = {
  WARNING_THRESHOLD: 0.85,
  DANGER_THRESHOLD: 0.90,
  BLOCKING_THRESHOLD: 0.95,
} as const;

type TokenBudgetZone = "safe" | "warning" | "danger" | "blocking";
```

## DANGER 区行为

进入 DANGER 区（90–94%）时：
1. **Tool Result Snip**：截断大型工具输出，保留摘要
2. **降低 maxToolRounds**：对剩余 Agent 削减 20%
3. **持久化到磁盘**：将重要输出移出上下文

## 压缩后预算

压缩操作需要输出空间才能成功。预留常量如下：

| 常量 | 值 | 用途 |
|----------|-------|---------|
| `MAX_FILES_TO_RESTORE` | 5 | 压缩后最多恢复的文件数 |
| `TOTAL_TOKEN_BUDGET` | 50,000 | 压缩后的总 token 预算 |
| `MAX_TOKENS_PER_FILE` | 5,000 | 单一文件的 token 上限 |

## 适用场景

- 任务执行的 token 监控（采用层）
- 多 Agent 管道的累积上下文管理（采用层）
- PipelineMemory Snip 触发条件（采用层）
- 任何具有 `maxTotalTokens` 限制的环境

## 参考资料

- AI 优化版：[ai/standards/token-budget.ai.yaml](../../../ai/standards/token-budget.ai.yaml)
- XSPEC-036：跨项目规格
- 借鉴自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.7 四区上下文管理


**适用范围**: universal
