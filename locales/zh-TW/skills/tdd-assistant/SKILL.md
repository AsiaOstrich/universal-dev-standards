---
source: ../../../../skills/tdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  引導測試驅動開發（TDD）流程：紅-綠-重構。
  使用時機：TDD 開發、撰寫測試先行的程式碼、學習 TDD。
  關鍵字：TDD, test-driven, red-green-refactor, 測試驅動, 紅綠重構。
---

# TDD 助手

> **語言**: [English](../../../../skills/tdd-assistant/SKILL.md) | 繁體中文

引導測試驅動開發（TDD）流程：紅-綠-重構。

## TDD 循環

```
    ┌─────┐       ┌───────┐       ┌──────────┐
    │ RED │ ────► │ GREEN │ ────► │ REFACTOR │
    └─────┘       └───────┘       └──────────┘
       ▲                                │
       └────────────────────────────────┘
```

## 工作流程

### 階段 1：RED - 撰寫失敗測試
- 撰寫描述期望行為的測試
- 執行測試 - 確認它因**正確的原因失敗**
- 使用 AAA 模式（Arrange-Act-Assert）

### 階段 2：GREEN - 讓測試通過
- 撰寫**最少的**程式碼使測試通過
- 此階段可以接受硬編碼
- 執行測試 - 確認它**通過**

### 階段 3：REFACTOR - 改善程式碼
- 消除重複（DRY）
- 改善命名和結構
- **每次**修改後都執行測試
- 不新增功能

## FIRST 原則

| 原則 | 說明 | Description |
|------|------|-------------|
| **F**ast | 測試快速執行（< 100ms/單元） | Tests run quickly |
| **I**ndependent | 測試間無共享狀態 | No shared state between tests |
| **R**epeatable | 每次結果相同 | Same result every time |
| **S**elf-validating | 明確的通過/失敗結果 | Clear pass/fail result |
| **T**imely | 在產品程式碼之前撰寫 | Written before production code |

## 使用方式

- `/tdd` - 開始互動式 TDD 工作階段
- `/tdd calculateTotal` - 對特定函式進行 TDD
- `/tdd "user can login"` - 對使用者故事進行 TDD

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[test-driven-development.md](../../../../core/test-driven-development.md)
