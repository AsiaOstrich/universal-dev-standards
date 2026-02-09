---
source: ../../../../skills/checkin-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  在提交程式碼前驗證品質關卡，確保程式碼庫穩定性。
  使用時機：提交前檢查、品質驗證、pre-commit 檢查。
  關鍵字：checkin, pre-commit, quality gate, 簽入, 品質關卡, 驗證。
---

# 簽入助手

> **語言**: [English](../../../../skills/checkin-assistant/SKILL.md) | 繁體中文

在提交程式碼前驗證品質關卡，確保程式碼庫的穩定性。

## 工作流程

1. **檢查 git 狀態** - 執行 `git status` 和 `git diff` 了解待提交的變更
2. **執行測試** - 執行 `npm test`（或專案測試指令）驗證所有測試通過
3. **執行程式碼檢查** - 執行 `npm run lint` 檢查程式碼風格合規
4. **驗證品質關卡** - 根據以下清單逐項檢查
5. **報告結果** - 呈現通過/失敗摘要並建議後續步驟

## 品質關卡

| 關卡 | 檢查項目 | Check |
|------|---------|-------|
| **建置** | 編譯零錯誤 | Code compiles with zero errors |
| **測試** | 所有測試通過（100%） | All existing tests pass |
| **覆蓋率** | 覆蓋率未下降 | Test coverage not decreased |
| **程式碼品質** | 符合編碼規範、無程式碼異味 | Follows coding standards |
| **安全性** | 無硬編碼密鑰或漏洞 | No hardcoded secrets |
| **文件** | API 文件和 CHANGELOG 已更新 | Documentation updated |
| **工作流程** | 分支命名和提交訊息格式正確 | Branch naming and commit correct |

## 禁止提交的情況

- 建置有錯誤 | Build has errors
- 測試失敗 | Tests are failing
- 功能不完整會破壞現有功能 | Feature is incomplete and would break functionality
- 關鍵邏輯中有 WIP/TODO | Contains WIP/TODO in critical logic
- 包含除錯程式碼（console.log、print） | Contains debugging code
- 包含被註解的程式碼區塊 | Contains commented-out code blocks

## 使用方式

- `/checkin` - 對目前變更執行完整品質關卡驗證
- 驗證通過後，使用 `/commit` 建立 commit message

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[checkin-standards.md](../../../../core/checkin-standards.md)
