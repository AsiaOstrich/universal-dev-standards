# 規格驅動開發 (SDD) 標準

> **語言**: English | [繁體中文](locales/zh-TW/core/spec-driven-development.md)

**版本**: 1.2.0
**最後更新**: 2025-12-30
**適用性**: 所有採用規格驅動開發的專案
**範圍**: 通用 (Universal)

---

## 摘要

規格驅動開發 (SDD) 是一種「文件優先」的開發方法論，強調在編寫任何程式碼之前，先定義清晰、結構化的規格（Specification）。這種方法特別適合 AI 輔助開發，因為高品質的規格能顯著降低 AI 的幻覺並提高程式碼生成的準確度。

SDD 的核心流程：**規格提案 → 規格審查 → 實作 → 驗證 → 歸檔**。

---

**完整指南: [SDD 指南](../../methodologies/guides/sdd-guide.md)**

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心原則** | 先規格，後實作 (Spec First) |
| **主要產物** | Markdown 規格文件 (`docs/specs/`) |
| **參與者** | 架構師、開發者、AI 助手 |
| **驗證方式** | 規格審查、正向推演 (Forward Derivation) |

## 相關標準

- [測試驅動開發](test-driven-development.md)
- [反向工程標準](reverse-engineering-standards.md)
- [正向推演標準](forward-derivation-standards.md)