---
source: ../../../core/standard-admission-criteria.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 标准纳入条件

> **语言**: [English](../../../core/standard-admission-criteria.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-070（DEC-043 Wave 1 治理 Meta 套件）

---

## 目的

新标准纳入 UDS 的四项条件。在 DEC-043 提出 60+ 候选新标准的背景下，需要一个明文的纳入检查清单，避免标准库膨胀（重叠、未使用）与降低品质。本标准是 UDS 的治理层 meta 标准 — 用来「决定标准的标准」。每个候选新标准必须通过四项条件才能从 Proposed 进入 Trial。

---

## 核心规范

- **四项硬性条件**：所有候选新标准必须同时通过 Evidence / Scope / Non-overlapping / AI-executable
- **拒绝理由必须具体**：不得以「不合适」之类笼统用词结案，必须指出未通过的 criterion
- **Admission ≠ Active**：通过 admission 仅代表可进 Trial，不代表直接 Active
- **Self-applicability**：本标准也必须符合四项条件
- **Backward compat**：既有 66 个 Active 标准不溯及既往

---

## 四项条件

### 1. Evidence（具体场景）

至少 2 个具体使用场景（非 hypothetical）：

- 场景来自实际项目、Repo、论文或 DEC 记录
- 描述具体（可举出文件 / 函数 / commit）
- 至少 1 个来自 AsiaOstrich 内部痛点或外部产业佐证

**拒绝示例**：「未来可能用到」— 无具体场景

### 2. Scope（明确作用域）

- `meta.scope` 标示 `universal` / `partial` / `uds-specific`
- frontmatter 列出适用的活动类型（development / deployment / testing）
- 若为 partial 或 uds-specific，说明不通用的原因

**拒绝示例**：「所有场合都适用」— 过度泛化

### 3. Non-overlapping（无重大重叠）

与既有 UDS 标准内容重复 < 30%：

- 列出最接近的 3 个既有标准，说明差异
- 若有 ≥ 30% 重叠，应改为扩充既有标准
- 明确定义 `integration_points`

**拒绝示例**：与 `retry-standards` 80% 内容重复 — 应合并

### 4. AI-executable（AI 可消费）

至少一个 DevAP QualityGate / VibeOps Agent prompt / Skill 能消费：

- 定义清楚的 guidelines（每条可验证）
- 至少 2 个 Given-When-Then scenarios
- 需类型时提供 interface / types 块
- 明确的 `integration_points`

**拒绝示例**：只有抽象原则，无任何 AI 可执行的规则

---

## 拒绝协议

1. 拒绝理由必须指出未通过的 criterion（evidence / scope / non-overlapping / ai-executable）
2. 拒绝记录写入 `cross-project/decisions/` 或 DEC 的 rejection log
3. 候选者可依理由修正后重新申请（不永久封锁）
4. 若拒绝理由涉及重叠，应建议改为扩充既有标准

---

## 情境示例

- **情境 1 — 通过**：`retry-standards` 申请。Evidence（XSPEC-067 Scenario 1-1/1-2）、Scope（universal）、Non-overlapping（与 circuit-breaker 互补）、AI-executable（9 guidelines + 3 scenarios）全通过 → 进入 Trial
- **情境 2 — 因重叠拒绝**：`advanced-retry-with-jitter` 申请。与 `retry-standards` 重叠 > 30% → 拒绝，建议改为 Phase 2 扩充
- **情境 3 — 因证据不足拒绝**：`universal-best-practices` 申请。仅「未来可能用到」类描述 → 拒绝，要求至少 2 个已发生案例

---

## 错误码

| 代码 | 说明 |
|------|------|
| `ADMISSION-001` | `MISSING_EVIDENCE` — 未提供至少 2 个具体使用场景 |
| `ADMISSION-002` | `SCOPE_UNDEFINED` — 未定义 meta.scope 或适用活动类型 |
| `ADMISSION-003` | `OVERLAP_EXCEEDED` — 与既有标准重叠 > 30% |
| `ADMISSION-004` | `NOT_AI_EXECUTABLE` — 无任何 AI 可消费的规则或 scenarios |
