---
source: ../../../../skills/commands/tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Guide through Test-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[feature or function to implement | 要實作的功能]"
status: experimental
---

# TDD 助手

> **Language**: [English](../../../../skills/commands/tdd.md) | 繁體中文

> [!WARNING]
> **實驗性功能**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

引導測試驅動開發（TDD）流程：紅-綠-重構。

## 前置檢查

在執行 TDD 階段前，AI 助手必須驗證前置條件。如果檢查失敗，停止並引導使用者。

### 階段閘門矩陣

| 目標階段 | 前置檢查 | 失敗時 |
|---------|---------|--------|
| `RED` | 1. 功能/函式已清楚定義 | → 要求使用者描述行為 |
| | 2. 若為 SDD 專案：規格存在且已核准 | → 引導至 `/sdd` |
| `GREEN` | 1. 至少有一個失敗的測試存在 | → 引導回 RED 階段 |
| | 2. 執行測試 → 確認失敗（非錯誤） | → 先修復測試語法/設定 |
| `REFACTOR` | 1. 所有測試通過（確認 GREEN） | → 停留在 GREEN 階段 |
| | 2. 前一個 RED 週期沒有失敗的測試 | → 先完成 GREEN |

### 紅燈優先強制

```
🔴 RED：撰寫測試 → 執行 → 必須失敗
   ↓ （僅在測試以預期的斷言失敗時才繼續）
🟢 GREEN：撰寫最少程式碼 → 執行 → 必須通過
   ↓ （僅在所有測試通過時才繼續）
🔵 REFACTOR：清理程式碼 → 執行 → 仍必須通過
```

**關鍵規則**：AI 不得在失敗測試存在之前撰寫實作程式碼。如果使用者要求「直接寫程式碼」，提醒 TDD 契約並建議先寫測試。

---

## 方法論整合

當調用 `/tdd` 時：
1. **自動啟用 TDD 方法論**（如果尚未啟用）
2. **將當前階段設為紅燈**（撰寫失敗的測試）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🔴 紅燈、🟢 綠燈、🔵 重構）

參見 [methodology-system](../methodology-system/SKILL.md) 了解完整方法論追蹤。

## TDD 循環

```
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────┐     ┌─────┐     ┌─────────┐ │
│    │ RED │ ──► │GREEN│ ──► │REFACTOR │ │
│    └─────┘     └─────┘     └─────────┘ │
│       ▲                          │      │
│       └──────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

## 工作流程

### 1. RED - 撰寫失敗的測試
- 為預期行為撰寫測試
- 執行測試 - 應該失敗
- 確認測試有效

### 2. GREEN - 讓測試通過
- 撰寫最少程式碼讓測試通過
- 不加額外功能
- 執行測試 - 應該通過

### 3. REFACTOR - 改善程式碼
- 清理程式碼
- 移除重複
- 所有測試應仍然通過

## FIRST 原則

| 原則 | 說明 |
|------|------|
| **F**ast | 快速執行 |
| **I**ndependent | 無相依性 |
| **R**epeatable | 可重複 |
| **S**elf-validating | 自我驗證 |
| **T**imely | 及時撰寫 |

## 使用方式

- `/tdd` - 啟動互動式 TDD session
- `/tdd calculateTotal` - 針對特定函式進行 TDD
- `/tdd "user can login"` - 針對用戶故事進行 TDD

## 參考

- 完整標準：[tdd-assistant](../tdd-assistant/SKILL.md)
- 核心指南：[testing-standards](../../core/testing-standards.md)
