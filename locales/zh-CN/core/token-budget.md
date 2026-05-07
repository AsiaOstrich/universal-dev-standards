---
source: ../../../core/token-budget.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Token 预算标准

> **语言**: [English](../../../core/token-budget.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-068（DEC-043 Wave 1 可靠性套件）

---

## 目的

Token 阈值四区模型（SAFE/WARNING/DANGER/BLOCKING），统一各采用层的 token 用量管控行为。

各 Agent 对于「快用完 token 了」的处理方式各异（有的直接截断、有的无警告、有的在最后才通知）。本标准定义四个阈值区间，确保所有 Agent 在进入不同区间时采取一致的行为（警告、简化输出、阻塞）。

---

## 核心规范

- 所有 Agent 必须实现四区 token 预算模型
- 进入 WARNING 区必须产生结构化日志（非中断）
- 进入 DANGER 区必须切换为简化输出模式
- 进入 BLOCKING 区必须拒绝新任务，等待预算刷新
- 阈值比例可配置，默认值如下

---

## 四区模型

| 区间 | 范围（已用比例） | 行为 |
|------|----------------|------|
| **SAFE** | 0% – 60% | 正常执行，无特殊处理 |
| **WARNING** | 60% – 80% | 产生 `token_budget_warning` 遥测事件；继续执行 |
| **DANGER** | 80% – 95% | 切换简化输出模式；省略详细说明；继续执行 |
| **BLOCKING** | 95% – 100% | 拒绝新任务；回传 `TOKEN_BUDGET_EXHAUSTED`；等待刷新 |

---

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `warningThreshold` | `0.60` | 进入 WARNING 区的比例阈值 |
| `dangerThreshold` | `0.80` | 进入 DANGER 区的比例阈值 |
| `blockingThreshold` | `0.95` | 进入 BLOCKING 区的比例阈值 |
| `totalBudget` | 由模型/配置决定 | Token 总预算上限 |

---

## 简化输出模式（DANGER 区）

进入 DANGER 区后，Agent 必须：

1. 省略详细的推理说明（只保留结论）
2. 压缩示例代码（省略注释和空行）
3. 不启动需要大量 token 的子任务
4. 在输出开头标注 `[DANGER MODE]`

---

## 遥测事件

**`token_budget_warning`**（进入 WARNING 或以上区间时上报）

| 字段 | 类型 |
|------|------|
| `agentId` | `string` |
| `zone` | `WARNING\|DANGER\|BLOCKING` |
| `usedTokens` | `number` |
| `totalBudget` | `number` |
| `usedRatio` | `number` |
| `timestamp` | `string` |

---

## 情境示例

**情境 1：进入 WARNING 区**
- 条件：已用 token 占比达 62%
- 结果：上报 `token_budget_warning`（zone=WARNING），继续正常执行

**情境 2：进入 DANGER 区**
- 条件：已用 token 占比达 83%
- 结果：切换简化输出模式，输出标注 `[DANGER MODE]`

**情境 3：进入 BLOCKING 区**
- 条件：已用 token 占比达 96%
- 结果：拒绝新任务，回传 `TOKEN_BUDGET_EXHAUSTED`，等待下一个预算周期

---

## 错误码

| 代码 | 说明 |
|------|------|
| `TOKEN-001` | `TOKEN_BUDGET_EXHAUSTED` — 已进入 BLOCKING 区，拒绝新任务 |
| `TOKEN-002` | `TOKEN_BUDGET_CONFIG_INVALID` — 阈值配置无效（如 warningThreshold > dangerThreshold）|
