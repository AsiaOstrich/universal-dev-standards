# ATDD Traceability: SPEC-DOCLC-001

## AC → Requirement → Scenario 追蹤矩陣

| AC | Requirement | Scenario | 驗證方式 | 狀態 |
|----|-------------|----------|---------|------|
| AC-1 | REQ-1 | Co-update principle defined | 人工審查標準內容 | [ ] |
| AC-1 | REQ-1 | Shift-left principle defined | 人工審查標準內容 | [ ] |
| AC-2 | REQ-2 | Trigger matrix covers 7+ change types | 計算矩陣行數 | [ ] |
| AC-2 | REQ-2 | Trigger matrix covers 6+ document types | 計算矩陣列數 | [ ] |
| AC-2 | REQ-2 | Matrix uses MUST/SHOULD/N/A | 人工審查矩陣格式 | [ ] |
| AC-3 | REQ-3 | Level 1 Commit checks defined | 人工審查金字塔內容 | [ ] |
| AC-3 | REQ-3 | Level 2 PR Review checks defined | 人工審查金字塔內容 | [ ] |
| AC-3 | REQ-3 | Level 3 Release checks defined | 人工審查金字塔內容 | [ ] |
| AC-4 | REQ-4 | Hard checks listed (5+ items) | 計算硬檢查項目數 | [ ] |
| AC-4 | REQ-4 | Soft checks listed (4+ items) | 計算軟檢查項目數 | [ ] |
| AC-5 | REQ-5 | Responsibility matrix exists | 人工審查表格結構 | [ ] |
| AC-5 | REQ-5 | PR reviewer can use matrix | 人工走讀測試 | [ ] |
| AC-6 | — | No tool/framework dependency | Grep 搜尋特定工具名稱 | [ ] |
| AC-7 | — | References complementary standards | Grep 搜尋連結 | [ ] |
| AC-8 | — | zh-TW translation exists | `check-translation-sync.sh` | [ ] |
| AC-8 | — | zh-CN translation exists | `check-translation-sync.sh zh-CN` | [ ] |

## 覆蓋率統計

| 指標 | 數值 |
|------|------|
| AC 總數 | 8 |
| Scenario 總數 | 16 |
| AC 覆蓋率 | 8/8 (100%) |
| 可自動化驗證 | 4/16 (25%) |
| 需人工審查 | 12/16 (75%) |
