---
source: ../../../core/standard-lifecycle-management.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 標準生命週期管理

> **語言**: [English](../../../core/standard-lifecycle-management.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-17
**狀態**: Trial（到期 2026-10-17）
**適用範圍**: universal
**來源**: XSPEC-070（DEC-043 Wave 1 治理 Meta 套件）

---

## 目的

UDS 標準生命週期狀態機。既有 66 個標準無明確狀態管理：新增標準沒有試驗期、過時標準無棄用路徑、廢棄標準仍被引用。本標準建立五狀態機（Proposed / Trial / Active / Deprecated / Archived）與合法轉移規則，並規範所有 `.ai.yaml` 標準必須在 frontmatter 標示 `status` / `since` / `expires` / `supersedes`。

---

## 核心規範

- **所有標準必有狀態**：frontmatter 必須包含 `status` 和 `since`
- **Trial 必有期限**：`expires` 預設 since + 6 months
- **Deprecated 必有替代**：`supersedes` 指向替代標準 id 或遷移文件
- **禁止反向轉移**：Active → Proposed、Archived → Active 均無意義
- **逾期自動 Archived**：Trial 到期未決則自動歸檔

---

## 狀態說明

| 狀態 | 描述 | Skill 可引用？ |
|------|------|--------------|
| **Proposed** | 草案階段，未通過 admission | 不可 |
| **Trial** | 批准但試驗中（預設 6 個月） | 可（標註 trial）|
| **Active** | 全面採用，standard-of-truth | 可 |
| **Deprecated** | 標記棄用，必須提供 `supersedes` | 可（Skill 應警示）|
| **Archived** | 已移除，僅保留歷史 | 不可 |

---

## 合法轉移路徑

```
Proposed ──(通過 admission)──→ Trial
Trial    ──(驗證通過)─────────→ Active
Trial    ──(到期/拒絕)─────────→ Archived
Active   ──(被取代)───────────→ Deprecated
Deprecated ──(遷移完成)────────→ Archived
```

**禁止的轉移**：

- Active → Proposed（無意義）
- Archived → Active（應重新申請 admission）
- Deprecated → Active（應重新 Trial）
- Proposed → Active（須先 Trial）

---

## Frontmatter 必填欄位

### 必填（所有狀態）

- `status`: proposed | trial | active | deprecated | archived
- `since`: ISO-8601（進入當前狀態的日期）
- `version`: semver 字串

### 條件必填

| 欄位 | 適用時機 |
|------|---------|
| `expires` | `status = trial`（預設 since + 6 months）|
| `supersedes` | `status = deprecated`（替代標準 id 或遷移文件路徑）|
| `migration_guide` | `status = deprecated`（相對路徑，選填但強烈建議）|

---

## 情境範例

- **情境 1 — Trial → Active**：`retry-standards` 處於 trial。2026-08-01 審視發現 DevAP Fix Loop 和 VibeOps Builder 均採用且無重大缺陷 → 轉 Active，`since=2026-08-01`，移除 `expires`
- **情境 2 — Trial 逾期自動 Archived**：某標準 trial 期限 2026-10-17 到期未通過驗證 → 狀態轉 Archived，記錄原因
- **情境 3 — Deprecated 帶遷移**：`legacy-retry-logic` 被 `retry-standards` 取代 → `status=deprecated, supersedes=retry-standards, migration_guide=docs/migrations/retry-v1-to-v2.md`；Skill 使用時顯示警告

---

## 遙測事件

**`standard_state_change`**

| 欄位 | 類型 |
|------|------|
| `standard_id` | `string` |
| `from_state` | `proposed\|trial\|active\|deprecated\|archived` |
| `to_state` | `proposed\|trial\|active\|deprecated\|archived` |
| `reason` | `string` |
| `timestamp` | `ISO-8601` |

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `LIFECYCLE-001` | `MISSING_STATUS` — frontmatter 缺 status 欄位 |
| `LIFECYCLE-002` | `MISSING_EXPIRES` — trial 狀態缺 expires 欄位 |
| `LIFECYCLE-003` | `MISSING_SUPERSEDES` — deprecated 狀態缺 supersedes 欄位 |
| `LIFECYCLE-004` | `FORBIDDEN_TRANSITION` — 嘗試執行禁止的狀態轉移 |
| `LIFECYCLE-005` | `TRIAL_EXPIRED` — trial 到期未決策 |
