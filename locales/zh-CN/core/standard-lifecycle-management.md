---
source: ../../../core/standard-lifecycle-management.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: e7c98175b173
status: current
---

# 标准生命周期管理

> **语言**: [English](../../../core/standard-lifecycle-management.md) | 简体中文

> **来源**: XSPEC-070 | **驱动来源**: DEC-043 Wave 1 Governance Meta Pack | **状态**: Trial（2026-04-17 ~ 2026-10-17）

## 概述

UDS 标准生命周期状态机。既有 66 个标准无明确状态管理：新增标准没有试验期、过时标准无弃用路径、废弃标准仍被引用。本标准建立五状态机（Proposed / Trial / Active / Deprecated / Archived）与合法转移规则，并规范所有 `.ai.yaml` 标准必须在 frontmatter 标示 `status` / `since` / `expires` / `supersedes`。

## 关键原则

- **所有标准必有状态**：frontmatter 必须包含 `status` 和 `since`
- **Trial 必有期限**：`expires` 默认 since + 6 months
- **Deprecated 必有替代**：`supersedes` 指向替代标准 id 或迁移文档
- **禁止反向转移**：Active → Proposed、Archived → Active 均无意义
- **逾期自动 Archived**：Trial 到期未决则自动归档

## 状态

| 状态 | 描述 | Skill 可引用？ |
|-------|-------------|----------------------|
| **Proposed** | 草案阶段，未通过 admission | 否 |
| **Trial** | 批准但试验中（默认 6 个月）| 是（标注 trial）|
| **Active** | 全面采用，standard-of-truth | 是 |
| **Deprecated** | 标记弃用，必须提供 `supersedes` | 是（Skill 应警示）|
| **Archived** | 已移除，仅保留历史 | 否 |

## 合法转移

```
Proposed ──(admission passed)──→ Trial
Trial    ──(validated)──────────→ Active
Trial    ──(expired/rejected)───→ Archived
Active   ──(superseded)─────────→ Deprecated
Deprecated ──(migration done)───→ Archived
```

**禁止的转移**：

- Active → Proposed（无意义）
- Archived → Active（应重新申请 admission）
- Deprecated → Active（应重新 Trial）
- Proposed → Active（须先 Trial）

## Frontmatter 必填字段

### 始终必填

- `status`: proposed | trial | active | deprecated | archived
- `since`: ISO-8601（进入当前状态的日期）
- `version`: semver 字符串

### 条件必填

| 字段 | 适用时机 |
|-------|------|
| `expires` | `status = trial`（默认 since + 6 months）|
| `supersedes` | `status = deprecated`（替代标准 id 或迁移文档路径）|
| `migration_guide` | `status = deprecated`（相对路径，选填但强烈建议）|

## 使用示例

- **场景 1 —— Trial → Active**：`retry-standards` 处于 trial。2026-08-01 审视发现 Fix Loop（采用层）和 Builder Agent（采用层）均采用且无重大缺陷 → 转 Active，`since=2026-08-01`，移除 `expires`
- **场景 2 —— Trial 逾期自动 Archived**：某标准 trial 期限 2026-10-17 到期未通过验证 → 状态转 Archived，记录原因
- **场景 3 —— Deprecated 带迁移**：`legacy-retry-logic` 被 `retry-standards` 取代 → `status=deprecated, supersedes=retry-standards, migration_guide=docs/migrations/retry-v1-to-v2.md`；Skill 使用时显示警告

## 遥测事件

`standard_state_change`:

```
{
  standard_id: string,
  from_state: proposed|trial|active|deprecated|archived,
  to_state:   proposed|trial|active|deprecated|archived,
  reason: string,
  timestamp: ISO-8601
}
```

## 错误码

- `LIFECYCLE-001` — `MISSING_STATUS`
- `LIFECYCLE-002` — `MISSING_EXPIRES`（trial 状态）
- `LIFECYCLE-003` — `MISSING_SUPERSEDES`（deprecated 状态）
- `LIFECYCLE-004` — `FORBIDDEN_TRANSITION`
- `LIFECYCLE-005` — `TRIAL_EXPIRED`（期限已过但未决策）

## 参考资料

- AI 优化版：[ai/standards/standard-lifecycle-management.ai.yaml](../../../ai/standards/standard-lifecycle-management.ai.yaml)
- XSPEC-070：DEC-043 Wave 1 Governance Meta Pack 跨项目规格
- DEC-043：UDS 覆盖完整性路线图（驱动来源）
- 相关：`standard-admission-criteria`, `skill-standard-alignment-check`, `adr-standards`
- 业界：IETF RFC lifecycle (Proposed → Draft → Internet Standard), Python PEP states, W3C Recommendation Track


**范围**: universal
