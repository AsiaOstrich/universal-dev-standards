# ATDD Table: SPEC-INTSYNC-001 Integration Commands Sync

> [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md]
> [Derived from Draft]
> [Generated] ATDD Acceptance Test Table

## Acceptance Test Matrix

| AC | Test Description | Input / Precondition | Action | Expected Output | Pass/Fail |
|----|-----------------|----------------------|--------|-----------------|-----------|
| AC-1 | COMMAND-INDEX 完整性 | `skills/commands/` 有 48 個 .md 檔；排除 README.md, COMMAND-FAMILY-OVERVIEW.md, guide.md | 驗證 `COMMAND-INDEX.json` 內容 | 所有非排除的 commands 已登記；每個 command 恰好屬於一個 category | ⬜ |
| AC-2 | Tier requiredCategories 定義 | REGISTRY.json 已擴展 `requiredCategories` 欄位 | 讀取各 tier 的 `requiredCategories` | complete=全部 categories; partial=["core"]; minimal/preview/planned/tool=[] | ⬜ |
| AC-3 | Complete tier 缺少 command 報錯 | Complete tier agent 整合檔缺少某 command 引用 | 執行 `check-integration-commands-sync.sh` | 列出缺少的 commands；exit code ≠ 0 | ⬜ |
| AC-4 | Partial tier 不查非 core commands | Partial tier agent 整合檔提及全部 core commands，但缺少 ops/testing commands | 執行 `check-integration-commands-sync.sh` | 通過檢查，無錯誤 | ⬜ |
| AC-5 | 偵測未登記 command | `skills/commands/` 有一個不在 INDEX 中的 .md 檔 | 執行 `check-integration-commands-sync.sh` | 報告 "⚠️ Unregistered command: [name]" | ⬜ |
| AC-6 | Pre-release Step 7.5 整合 | `pre-release-check.sh` 已插入 Step 7.5 | 執行 `pre-release-check.sh` | Step 7.5 在 Step 7 之後、Step 8 之前執行 | ⬜ |
| AC-7 | 跨平台相容性 | macOS 或 Linux 環境 | `bash check-integration-commands-sync.sh` | 正確執行；輸出格式含顏色、pass/fail 指標 | ⬜ |

## Traceability Summary

| Metric | Count |
|--------|-------|
| Total ACs | 7 |
| BDD Scenarios | 7 |
| TDD Test Cases | 7 |
| ATDD Rows | 7 |
| 1:1 Mapping | ✅ Verified |

## File References

| Artifact | Path |
|----------|------|
| Spec | `docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md` |
| BDD Feature | `tests/features/SPEC-INTSYNC-001-integration-commands-sync.feature` |
| TDD Tests | `cli/tests/unit/scripts/integration-commands-sync.test.js` |
| ATDD Table | `docs/specs/SPEC-INTSYNC-001-atdd.md` (this file) |
