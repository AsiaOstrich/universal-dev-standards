---
source: ../../../../skills/atdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  引導驗收測試驅動開發（ATDD）流程，用於定義和驗證使用者故事。
  使用時機：定義驗收條件、使用者故事驗證、ATDD 流程。
  關鍵字：atdd, acceptance, user story, INVEST, 驗收測試, 使用者故事, 驗收條件。
---

# ATDD 助手

> **語言**: [English](../../../../skills/atdd-assistant/SKILL.md) | 繁體中文

引導驗收測試驅動開發（ATDD）流程，用於定義和驗證使用者故事。

## ATDD 循環

WORKSHOP ──► DISTILLATION ──► DEVELOPMENT ──► DEMO ──► DONE

## 工作流程

### 1. WORKSHOP - 定義驗收條件
PO 提出使用者故事，團隊提出澄清問題，共同定義驗收條件。

### 2. DISTILLATION - 轉換為測試
將驗收條件轉換為可執行的測試格式，消除歧義，取得 PO 簽核。

### 3. DEVELOPMENT - 實作
執行驗收測試（初始應失敗），使用 BDD/TDD 進行實作，迭代直到全部通過。

### 4. DEMO - 向利害關係人展示
展示通過的驗收測試，示範可運作的功能，取得正式驗收。

### 5. DONE - 完成
PO 已驗收，程式碼已合併，故事已關閉。

## INVEST 準則

| 準則 | 說明 | Criterion | Description |
|------|------|-----------|-------------|
| **I**ndependent | 可獨立開發 | Independent | Can be developed separately |
| **N**egotiable | 可協商細節 | Negotiable | Details can be discussed |
| **V**aluable | 提供商業價值 | Valuable | Delivers business value |
| **E**stimable | 可估算工作量 | Estimable | Can estimate effort |
| **S**mall | 一個 Sprint 可完成 | Small | Fits in one sprint |
| **T**estable | 有明確驗收條件 | Testable | Has clear acceptance criteria |

## 使用者故事格式

```
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria
- Given [context], when [action], then [result]
```

## 使用方式

- `/atdd` - 啟動互動式 ATDD 會話
- `/atdd "user can reset password"` - 針對特定功能進行 ATDD
- `/atdd US-123` - 針對現有使用者故事進行 ATDD

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[acceptance-test-driven-development.md](../../../../core/acceptance-test-driven-development.md)
