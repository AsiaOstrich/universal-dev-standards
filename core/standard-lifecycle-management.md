# Standard Lifecycle Management

> **Source**: XSPEC-070 | **Driven by**: DEC-043 Wave 1 Governance Meta Pack | **Status**: Trial (2026-04-17 ~ 2026-10-17)

## Overview

UDS 標準生命週期狀態機。既有 66 個標準無明確狀態管理：新增標準沒有試驗期、過時標準無棄用路徑、廢棄標準仍被引用。本標準建立五狀態機（Proposed / Trial / Active / Deprecated / Archived）與合法轉移規則，並規範所有 `.ai.yaml` 標準必須在 frontmatter 標示 `status` / `since` / `expires` / `supersedes`。

## Key Principles

- **所有標準必有狀態**：frontmatter 必須包含 `status` 和 `since`
- **Trial 必有期限**：`expires` 預設 since + 6 months
- **Deprecated 必有替代**：`supersedes` 指向替代標準 id 或遷移文件
- **禁止反向轉移**：Active → Proposed、Archived → Active 均無意義
- **逾期自動 Archived**：Trial 到期未決則自動歸檔

## States

| State | Description | Skill-referenceable? |
|-------|-------------|----------------------|
| **Proposed** | 草案階段，未通過 admission | No |
| **Trial** | 批准但試驗中（預設 6 個月）| Yes（標註 trial）|
| **Active** | 全面採用，standard-of-truth | Yes |
| **Deprecated** | 標記棄用，必須提供 `supersedes` | Yes（Skill 應警示）|
| **Archived** | 已移除，僅保留歷史 | No |

## Legal Transitions

```
Proposed ──(admission passed)──→ Trial
Trial    ──(validated)──────────→ Active
Trial    ──(expired/rejected)───→ Archived
Active   ──(superseded)─────────→ Deprecated
Deprecated ──(migration done)───→ Archived
```

**禁止的轉移**：

- Active → Proposed（無意義）
- Archived → Active（應重新申請 admission）
- Deprecated → Active（應重新 Trial）
- Proposed → Active（須先 Trial）

## Frontmatter Required Fields

### Always Required

- `status`: proposed | trial | active | deprecated | archived
- `since`: ISO-8601（進入當前狀態的日期）
- `version`: semver 字串

### Conditional

| Field | When |
|-------|------|
| `expires` | `status = trial`（預設 since + 6 months）|
| `supersedes` | `status = deprecated`（替代標準 id 或遷移文件路徑）|
| `migration_guide` | `status = deprecated`（相對路徑，選填但強烈建議）|

## Usage Examples

- **Scenario 1 — Trial → Active**：`retry-standards` 處於 trial。2026-08-01 審視發現 DevAP Fix Loop 和 VibeOps Builder 均採用且無重大缺陷 → 轉 Active，`since=2026-08-01`，移除 `expires`
- **Scenario 2 — Trial 逾期自動 Archived**：某標準 trial 期限 2026-10-17 到期未通過驗證 → 狀態轉 Archived，記錄原因
- **Scenario 3 — Deprecated 帶遷移**：`legacy-retry-logic` 被 `retry-standards` 取代 → `status=deprecated, supersedes=retry-standards, migration_guide=docs/migrations/retry-v1-to-v2.md`；Skill 使用時顯示警告

## Telemetry Event

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

## Error Codes

- `LIFECYCLE-001` — `MISSING_STATUS`
- `LIFECYCLE-002` — `MISSING_EXPIRES`（trial 狀態）
- `LIFECYCLE-003` — `MISSING_SUPERSEDES`（deprecated 狀態）
- `LIFECYCLE-004` — `FORBIDDEN_TRANSITION`
- `LIFECYCLE-005` — `TRIAL_EXPIRED`（期限已過但未決策）

## References

- AI-optimized: [ai/standards/standard-lifecycle-management.ai.yaml](../ai/standards/standard-lifecycle-management.ai.yaml)
- XSPEC-070: DEC-043 Wave 1 Governance Meta Pack 跨專案規格
- DEC-043: UDS 覆蓋完整性路線圖（驅動來源）
- Related: `standard-admission-criteria`, `skill-standard-alignment-check`, `adr-standards`
- Industry: IETF RFC lifecycle (Proposed → Draft → Internet Standard), Python PEP states, W3C Recommendation Track
