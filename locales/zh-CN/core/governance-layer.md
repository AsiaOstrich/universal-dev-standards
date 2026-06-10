---
source: ../../../core/governance-layer.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: faff51e79a15
status: current
---

# 治理层标准

> **语言**: [English](../../../core/governance-layer.md) | [繁體中文](../../zh-TW/core/governance-layer.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-05-07
**适用范围**: 所有具有多 Agent 或多角色 AI 工作流程的软件项目
**范畴**: universal
**产业标准**: 无（UDS 原创）

---

## 目的

治理层为项目中所有 Agent 与角色提供共同锚点：
Vision（方向）→ Mission（边界 + 红线）→ Goals（可量测的 KPI）。

它是 **Standard #0**：在所有其他标准之前评估。当本标准与其他领域标准发生冲突时，本标准优先。

---

## 三层架构

### Vision（愿景）

| 字段 | 要求 |
|------|------|
| 格式 | 单一句子，≤ 50 tokens |
| 内容 | 长期方向；永恒不变；不含量测指标 |
| 变更频率 | 每年审查 |

**示例**：
> "成为全球软件团队最值得信赖的 AI 开发工作流程标准。"

---

### Mission（使命）

| 字段 | 要求 |
|------|------|
| 格式 | 3–5 项承诺陈述 + 红线清单（合计 ≤ 300 tokens） |
| 内容 | 我们做什么 / 不做什么；含触发条件与处置动作的红线 |
| 变更频率 | 每季审查 |

**红线必备字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | 字符串 | 唯一标识符（例如：R1、GUARD-001） |
| `category` | 字符串 | 分类（quality / safety / compliance / ethics） |
| `clause` | 字符串 | 人类可读的禁止或要求陈述 |
| `action` | 枚举 | `block` \| `warn` \| `escalate_to_human` 之一 |

---

### Goals（目标）

| 字段 | 要求 |
|------|------|
| 格式 | KPI 清单，≤ 500 tokens |
| 变更频率 | 每个 Sprint 校准 |
| 可否证性 | 每个 KPI 必须可量测——禁止使用「改善」、「提升」等模糊词汇 |

**KPI 必备字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | 字符串 | 唯一标识符（例如：KPI-01） |
| `metric_name` | 字符串 | 追踪的指标名称 |
| `threshold` | 字符串 | 量化目标（例如：≥ 95%、< 200 ms） |
| `measurement_method` | 字符串 | 量测方式与时机 |

---

## 优先顺序

治理层对所有其他标准具有**更高优先权**。冲突时的解析顺序：

1. **治理层**（本标准）— 方向、红线、KPI
2. **领域标准**（测试、提交信息、部署等）
3. **项目特定覆盖**（本地 `.standards/` 定制化）

---

## 红线格式

每条红线必须包含所有必备字段。执行动作说明：

| 动作 | 行为 |
|------|------|
| `block` | 立即停止 pipeline；不继续执行 |
| `warn` | 记录违规并继续；超过阈值时升级 |
| `escalate_to_human` | 暂停并要求人类决策后才继续 |

此外，每条红线应包含 `mission_clause_ref` 字段，参照其所强制执行的使命承诺。

---

## 评估器集成

当项目使用 AI 评估器 Agent 时，治理层提供评分锚点：

| 评估轴 | 权重 | 否决阈值 |
|--------|------|----------|
| 正确性 | 0.4 | < 0.3 → 不通过 |
| 使命对齐度 | 0.3 | < 0.3 → 不通过 |
| 目标达成度 | 0.3 | < 0.3 → 不通过 |

- **mission_alignment_score**：输出与使命承诺的对齐程度
- **goal_achievement_score**：输出推进目标 KPI 的程度
- 任何单一评估轴低于 0.3 即触发不通过，无论加权总分为何

---

## 风险接受（trace_only 模式）

若项目放宽人工闸门（例如 `gate.mode = trace_only`），必须在 `mission.md` 中明确撰写**风险接受条款**，包含：

| 必填字段 | 说明 |
|----------|------|
| `date` | 接受风险的日期 |
| `signatory` | 接受风险的人员或角色 |
| `gates_bypassed` | 列举所有绕过的人工闸门 |
| `risks_accepted` | 明确描述已接受的风险 |

若无有效的风险接受条款，pipeline **必须拒绝启动（fail-closed）**。

---

## 治理文件结构

采用本标准的项目应维护以下文件：

```
governance/
├── vision.md          # 单一句子愿景陈述
├── mission.md         # 承诺 + 红线清单
└── goals.md           # KPI 清单（每个 Sprint 更新）
```

---

## 合规检查清单

- [ ] Vision 为单一句子且 ≤ 50 tokens，不含量测指标
- [ ] Mission 有 3–5 项承诺及含所有必备字段的红线清单
- [ ] 每条红线均有：id、category、clause、action
- [ ] Goals 清单存在，每个 KPI 均含：id、metric_name、threshold、measurement_method
- [ ] 没有任何 KPI 使用模糊词汇（「改善」、「提升」、「更好」）
- [ ] 若 `gate.mode = trace_only`，`mission.md` 中存在风险接受条款
- [ ] 所有 AI 评估器以 0.4/0.3/0.3 权重评分，且任一轴 < 0.3 即不通过
