# Standard Admission Criteria

> **Source**: XSPEC-070 | **Driven by**: DEC-043 Wave 1 Governance Meta Pack | **Status**: Trial (2026-04-17 ~ 2026-10-17)

## Overview

新標準納入 UDS 的四項條件。在 DEC-043 提出 60+ 候選新標準的背景下，需要一個明文的納入檢查清單，避免標準庫膨脹（重疊、未使用）與降低品質。本標準是 UDS 的治理層 meta 標準 — 用來「決定標準的標準」。每個候選新標準必須通過四項條件才能從 Proposed 進入 Trial。

## Key Principles

- **四項硬性條件**：所有候選新標準必須同時通過 Evidence / Scope / Non-overlapping / AI-executable
- **拒絕理由必須具體**：不得以「不合適」之類籠統用詞結案，必須指出未通過的 criterion
- **Admission ≠ Active**：通過 admission 僅代表可進 Trial，不代表直接 Active
- **Self-applicability**：本標準也必須符合四項條件
- **Backward compat**：既有 66 個 Active 標準不溯及既往

## The Four Criteria

### 1. Evidence（具體場景）

至少 2 個具體使用場景（非 hypothetical）：

- 場景來自實際專案、Repo、論文或 DEC 記錄
- 描述具體（可舉出檔案 / 函式 / commit）
- 至少 1 個來自 AsiaOstrich 內部痛點或外部產業佐證

**拒絕範例**：「未來可能用到」— 無具體場景

### 2. Scope（明確作用域）

- `meta.scope` 標示 `universal` / `partial` / `uds-specific`
- frontmatter 列出適用的活動類型（development / deployment / testing）
- 若為 partial 或 uds-specific，說明不通用的原因

**拒絕範例**：「所有場合都適用」— 過度泛化

### 3. Non-overlapping（無重大重疊）

與既有 UDS 標準內容重複 < 30%：

- 列出最接近的 3 個既有標準，說明差異
- 若有 ≥ 30% 重疊，應改為擴充既有標準
- 明確定義 `integration_points`

**拒絕範例**：與 `retry-standards` 80% 內容重複 — 應合併

### 4. AI-executable（AI 可消費）

至少一個 Quality Gate (adoption layer) / Agent prompt (採用層) / Skill 能消費：

- 定義清楚的 guidelines（每條可驗證）
- 至少 2 個 Given-When-Then scenarios
- 需型別時提供 interface / types 區塊
- 明確的 `integration_points`

**拒絕範例**：只有抽象原則，無任何 AI 可執行的規則

## Rejection Protocol

1. 拒絕理由必須指出未通過的 criterion（evidence / scope / non-overlapping / ai-executable）
2. 拒絕記錄寫入 `cross-project/decisions/` 或 DEC 的 rejection log
3. 候選者可依理由修正後重新申請（不永久封鎖）
4. 若拒絕理由涉及重疊，應建議改為擴充既有標準

## Usage Examples

- **Scenario 1 — 通過**：`retry-standards` 申請。Evidence（XSPEC-067 Scenario 1-1/1-2）、Scope（universal）、Non-overlapping（與 circuit-breaker 互補）、AI-executable（9 guidelines + 3 scenarios）全通過 → 進入 Trial
- **Scenario 2 — 因重疊拒絕**：`advanced-retry-with-jitter` 申請。與 `retry-standards` 重疊 > 30% → 拒絕，建議改為 Phase 2 擴充
- **Scenario 3 — 因證據不足拒絕**：`universal-best-practices` 申請。僅「未來可能用到」類描述 → 拒絕，要求至少 2 個已發生案例

## Error Codes

- `ADMISSION-001` — `MISSING_EVIDENCE`
- `ADMISSION-002` — `SCOPE_UNDEFINED`
- `ADMISSION-003` — `OVERLAP_EXCEEDED`（> 30%）
- `ADMISSION-004` — `NOT_AI_EXECUTABLE`

## References

- AI-optimized: [ai/standards/standard-admission-criteria.ai.yaml](../ai/standards/standard-admission-criteria.ai.yaml)
- XSPEC-070: DEC-043 Wave 1 Governance Meta Pack 跨專案規格
- DEC-043: UDS 覆蓋完整性路線圖（本標準是 Wave 1 前置條件）
- Related: `standard-lifecycle-management`, `skill-standard-alignment-check`, `adr-standards`
- Industry: IETF RFC admission criteria, Python PEP process, W3C Recommendation Track
