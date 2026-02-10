# 測試驅動開發 (TDD) 標準

> **語言**: [English](../../../core/test-driven-development.md) | 繁體中文

**版本**: 1.2.0
**最後更新**: 2026-01-25
**適用性**: 所有採用測試驅動開發的專案
**範圍**: 通用 (Universal)

---

## 摘要

測試驅動開發 (TDD) 是一種傳統開發方法論 (1999)，以測試驅動軟體功能的設計與實作。核心工作流程遵循 **紅-綠-重構 (Red-Green-Refactor)** 循環：

1. **紅 (Red)**：撰寫一個描述預期行為的失敗測試
2. **綠 (Green)**：撰寫最少量的程式碼讓測試通過
3. **重構 (Refactor)**：在保持測試通過的同時改善程式碼品質

TDD 是傳統測試驅動開發家族的一部分（與 BDD 和 ATDD 並列），可用於 AI 時代 SDD（規格驅動開發）工作流程的實作階段。此方法論促進可測試、模組化的程式碼設計，並提供關於程式碼正確性的即時回饋。

---

**完整指南: [TDD 指南](../methodologies/guides/tdd-guide.md)**

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心循環** | 紅 → 綠 → 重構 → 重複 |
| **FIRST 原則** | 快速 (Fast)、獨立 (Independent)、可重複 (Repeatable)、自我驗證 (Self-validating)、及時 (Timely) |
| **測試層級** | 單元/整合測試 |
| **參與者** | 開發人員 |
| **工具** | xUnit 框架 (Jest, pytest, JUnit 等) |

## 相關標準

- [測試標準](testing-standards.md)
- [規格驅動開發](spec-driven-development.md)