---
source: ../../../../skills/code-review-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  使用標準化檢查清單執行系統性程式碼審查。
  使用時機：審查程式碼、PR 審查、程式碼品質檢查。
  關鍵字：review, code review, PR, checklist, 審查, 程式碼, 品質。
---

# 程式碼審查助手

> **語言**: [English](../../../../skills/code-review-assistant/SKILL.md) | 繁體中文

使用標準化的檢查清單和評論前綴，執行系統性的程式碼審查。

## 工作流程

1. **識別變更** - 透過 `git diff` 或 `git show` 取得待審查檔案的差異
2. **套用檢查清單** - 系統性地檢查每個審查類別
3. **產生報告** - 使用標準評論前綴輸出發現
4. **總結** - 提供整體評估和建議的後續行動

## 審查類別

1. **功能性** - 功能是否正確？ | Does it work correctly?
2. **設計** - 架構是否合適？ | Is the architecture appropriate?
3. **品質** - 程式碼是否乾淨可維護？ | Is the code clean and maintainable?
4. **可讀性** - 是否容易理解？ | Is it easy to understand?
5. **測試** - 測試覆蓋是否足夠？ | Is there adequate test coverage?
6. **安全性** - 是否有安全漏洞？ | Are there any vulnerabilities?
7. **效能** - 是否有效率？ | Is it efficient?
8. **錯誤處理** - 錯誤處理是否妥當？ | Are errors handled properly?

## 評論前綴

| 前綴 | 意義 | 動作 | Action |
|------|------|------|--------|
| **BLOCKING** | 必須在合併前修復 | 必須修復 | Required |
| **IMPORTANT** | 應該修復 | 建議修復 | Recommended |
| **SUGGESTION** | 錦上添花 | 可選改善 | Optional |
| **QUESTION** | 需要說明 | 需要討論 | Discuss |
| **NOTE** | 資訊性 | 僅供參考 | FYI |

## 使用方式

- `/review` - 審查目前分支的所有變更
- `/review src/auth.js` - 審查特定檔案
- `/review feature/login` - 審查特定分支

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[code-review-checklist.md](../../../../core/code-review-checklist.md)
