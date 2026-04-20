---
source: ../../../core/standard-lifecycle-management.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 标准生命周期管理

> **语言**: [English](../../../core/standard-lifecycle-management.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-070（DEC-043 Wave 1 治理 Meta 套件）

---

## 目的

UDS 标准生命周期状态机。既有 66 个标准无明确状态管理：新增标准没有试验期、过时标准无弃用路径、废弃标准仍被引用。本标准建立五状态机（Proposed / Trial / Active / Deprecated / Archived）与合法转移规则，并规范所有 `.ai.yaml` 标准必须在 frontmatter 标示 `status` / `since` / `expires` / `supersedes`。

---

## 核心规范

- **所有标准必有状态**：frontmatter 必须包含 `status` 和 `since`
- **Trial 必有期限**：`expires` 默认 since + 6 months
- **Deprecated 必有替代**：`supersedes` 指向替代标准 id 或迁移文档
- **禁止反向转移**：Active → Proposed、Archived → Active 均无意义
- **逾期自动 Archived**：Trial 到期未决则自动归档

---

## 状态说明

| 状态 | 描述 | Skill 可引用？ |
|------|------|--------------|
| **Proposed** | 草案阶段，未通过 admission | 不可 |
| **Trial** | 批准但试验中（默认 6 个月） | 可（标注 trial）|
| **Active** | 全面采用，standard-of-truth | 可 |
| **Deprecated** | 标记弃用，必须提供 `supersedes` | 可（Skill 应警示）|
| **Archived** | 已移除，仅保留历史 | 不可 |

---

## 合法转移路径

```
Proposed ──(通过 admission)──→ Trial
Trial    ──(验证通过)─────────→ Active
Trial    ──(到期/拒绝)─────────→ Archived
Active   ──(被取代)───────────→ Deprecated
Deprecated ──(迁移完成)────────→ Archived
```

**禁止的转移**：

- Active → Proposed（无意义）
- Archived → Active（应重新申请 admission）
- Deprecated → Active（应重新 Trial）
- Proposed → Active（须先 Trial）

---

## Frontmatter 必填字段

### 必填（所有状态）

- `status`: proposed | trial | active | deprecated | archived
- `since`: ISO-8601（进入当前状态的日期）
- `version`: semver 字符串

### 条件必填

| 字段 | 适用时机 |
|------|---------|
| `expires` | `status = trial`（默认 since + 6 months）|
| `supersedes` | `status = deprecated`（替代标准 id 或迁移文档路径）|
| `migration_guide` | `status = deprecated`（相对路径，选填但强烈建议）|

---

## 情境示例

- **情境 1 — Trial → Active**：`retry-standards` 处于 trial。2026-08-01 审视发现 DevAP Fix Loop 和 VibeOps Builder 均采用且无重大缺陷 → 转 Active，`since=2026-08-01`，移除 `expires`
- **情境 2 — Trial 逾期自动 Archived**：某标准 trial 期限 2026-10-17 到期未通过验证 → 状态转 Archived，记录原因
- **情境 3 — Deprecated 带迁移**：`legacy-retry-logic` 被 `retry-standards` 取代 → `status=deprecated, supersedes=retry-standards, migration_guide=docs/migrations/retry-v1-to-v2.md`；Skill 使用时显示警告

---

## 遥测事件

**`standard_state_change`**

| 字段 | 类型 |
|------|------|
| `standard_id` | `string` |
| `from_state` | `proposed\|trial\|active\|deprecated\|archived` |
| `to_state` | `proposed\|trial\|active\|deprecated\|archived` |
| `reason` | `string` |
| `timestamp` | `ISO-8601` |

---

## 错误码

| 代码 | 说明 |
|------|------|
| `LIFECYCLE-001` | `MISSING_STATUS` — frontmatter 缺 status 字段 |
| `LIFECYCLE-002` | `MISSING_EXPIRES` — trial 状态缺 expires 字段 |
| `LIFECYCLE-003` | `MISSING_SUPERSEDES` — deprecated 状态缺 supersedes 字段 |
| `LIFECYCLE-004` | `FORBIDDEN_TRANSITION` — 尝试执行禁止的状态转移 |
| `LIFECYCLE-005` | `TRIAL_EXPIRED` — trial 到期未决策 |
