---
source: ../../../core/behavior-driven-development.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

# 行為驅動開發（BDD）標準

> **語言**: [English](../../../core/behavior-driven-development.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-25
**適用性**: 所有採用行為驅動開發的專案
**範圍**: 通用 (Universal)
**業界標準**: 無（Dan North 實踐，2006）

---

## 摘要

行為驅動開發（BDD）是由 Dan North 於 2006 年創建的傳統開發方法論，旨在縮小業務與技術團隊之間的溝通鴻溝。軟體行為透過協作以 **Given-When-Then** 場景描述，使用 Gherkin 語法 — 一種利害關係人可以閱讀和驗證的自然語言格式。

BDD 構成雙循環 TDD（GOOS 模式）的**外層循環**，BDD 場景驅動功能層級的行為，而 TDD 處理單元層級的實作。該方法論遵循「發現-表述-自動化」的工作流程，由 Three Amigos 協作（業務 + 開發 + 測試）確保共同理解。

---

**完整指南：[BDD 指南](../../../methodologies/guides/bdd-guide.md)**

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心工作流** | 發現 → 表述 → 自動化 |
| **語言** | Gherkin（Given-When-Then） |
| **測試層級** | 功能/場景測試 |
| **參與者** | 開發人員 + BA + QA（Three Amigos） |
| **工具** | Cucumber、Behave、SpecFlow |

## Gherkin 語法範例

```gherkin
Feature: 使用者登入
  作為一個已註冊的使用者
  我希望能夠登入系統
  以便存取我的個人資料

  Scenario: 使用有效憑證登入
    Given 使用者已在登入頁面
    When 使用者輸入有效的帳號和密碼
    Then 系統應重導至儀表板
    And 顯示歡迎訊息
```

## 相關標準

- [測試驅動開發](../../../core/test-driven-development.md)
- [驗收測試驅動開發](acceptance-test-driven-development.md)
- [規格驅動開發](spec-driven-development.md)
- [測試標準](testing-standards.md)
