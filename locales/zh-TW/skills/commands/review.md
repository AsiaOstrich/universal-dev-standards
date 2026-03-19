---
source: ../../../../skills/commands/review.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Perform systematic code review with checklist
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: "[file path or branch | 檔案路徑或分支名稱]"
---

# 程式碼審查助手

> **Language**: [English](../../../../skills/commands/review.md) | 繁體中文

執行系統性的程式碼審查，使用標準化的檢查清單和評論前綴。

## 工作流程

1. **識別變更** - 取得要審查的檔案 diff
2. **套用檢查清單** - 系統性地檢查每個類別
3. **產生報告** - 使用標準前綴輸出發現
4. **總結** - 提供整體評估

## 審查類別

1. **功能性** - 是否正確運作？
2. **設計** - 架構是否適當？
3. **品質** - 程式碼是否乾淨且可維護？
4. **可讀性** - 是否容易理解？
5. **測試** - 測試覆蓋率是否足夠？
6. **安全性** - 是否有弱點？
7. **效能** - 是否有效率？
8. **錯誤處理** - 錯誤是否有正確處理？

## 評論前綴

| 前綴 | 意義 | 動作 |
|------|------|------|
| **BLOCKING** | 合併前必須修復 | 必要 |
| **IMPORTANT** | 應該修復 | 建議 |
| **SUGGESTION** | 錦上添花 | 可選 |
| **QUESTION** | 需要釐清 | 討論 |
| **NOTE** | 資訊性質 | 供參考 |

## 使用方式

- `/review` - 審查目前分支的所有變更
- `/review src/auth.js` - 審查特定檔案
- `/review feature/login` - 審查特定分支

## 參考

- 完整標準：[code-review-assistant](../code-review-assistant/SKILL.md)
- 核心指南：[code-review-checklist](../../core/code-review-checklist.md)
