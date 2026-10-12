---
source: ../../../../skills/commands/code-review.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 63440740fb7c
status: current
---

---
description: "[UDS] 使用檢查清單執行系統性程式碼審查"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: "[file path or branch | 檔案路徑或分支名稱]"
---

# 程式碼審查助手

> **Language**: [English](../../../../skills/commands/code-review.md) | 繁體中文

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

- `/code-review` - 審查目前分支的所有變更
- `/code-review src/auth.js` - 審查特定檔案
- `/code-review feature/login` - 審查特定分支

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/code-review` | 執行 `git diff` 取得當前分支所有變更，開始審查 |
| `/code-review <file>` | 僅審查指定檔案 |
| `/code-review <branch>` | 審查指定分支相對於 main 的差異 |

### 互動腳本

1. 取得變更內容（git diff / 讀取檔案）
2. 逐一套用 8 個審查類別
3. 為每個發現標記嚴重度前綴（BLOCKING / IMPORTANT / SUGGESTION / QUESTION / NOTE）
4. 生成審查報告

**決策：發現衝突**
- IF 多個發現互相矛盾（如效能 vs 可讀性） → 明確說明取捨，標記為 QUESTION 請使用者決定
- ELSE → 依嚴重度排序呈現

🛑 **STOP**：報告生成後展示結果，等待使用者決定處理方式

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 審查報告展示後 | 使用者決定是否修復 BLOCKING 項目 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無變更可審查 | 告知無差異，建議先修改程式碼 |
| 檔案/分支不存在 | 列出可用的檔案或分支 |
| 變更量過大（>500 行） | 建議分批審查，列出建議的分批方式 |

## 參考

- 完整標準：[code-review-assistant](../code-review-assistant/SKILL.md)
- 核心指南：[code-review-checklist](../../core/code-review-checklist.md)
