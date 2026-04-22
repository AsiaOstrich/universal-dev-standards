---
source: ../../../core/spec-driven-development.md
source_version: 2.2.0
translation_version: 2.2.0
last_synced: 2026-04-22
status: current
---

# 規格驅動開發 (SDD) 標準

> **語言**: [English](../../../core/spec-driven-development.md) | 繁體中文

**版本**: 2.2.0
**最後更新**: 2026-03-30
**適用性**: 所有採用規格驅動開發的專案
**範圍**: 通用 (Universal)

---

## 摘要

規格驅動開發 (SDD) 是一種「文件優先」的開發方法論，強調在編寫任何程式碼之前，先定義清晰、結構化的規格（Specification）。這種方法特別適合 AI 輔助開發，因為高品質的規格能顯著降低 AI 的幻覺並提高程式碼生成的準確度。

SDD 的核心流程：**討論 → 規格提案 → 規格審查 → 實作 → 驗證 → 歸檔**。

---

**完整指南: [SDD 指南](../methodologies/guides/sdd-guide.md)**

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心原則** | 先規格，後實作 (Spec First) |
| **主要產物** | Markdown 規格文件 (`docs/specs/`) |
| **參與者** | 架構師、開發者、AI 助手 |
| **驗證方式** | 規格審查、正向推演 (Forward Derivation) |

## v2.2.0 新增內容

- **AC YAML Sidecar**：透過 `.ac.yaml` 檔案提供機器可讀的驗收標準（schema：`specs/schemas/acceptance-criteria.schema.yaml`）
- **I/O 合約章節**：規格範本中新增可選的結構化輸入/輸出合約
- **假設與待釐清章節**：新規格的必填章節，整合反幻覺標籤
- **AI Agent 行為章節**：可選章節，用於在規格中定義 AI Agent 行為

> 現有規格不需要回溯新增這些章節。

## 相關標準

- [測試驅動開發](test-driven-development.md)
- [反向工程標準](reverse-engineering-standards.md)
- [正向推演標準](forward-derivation-standards.md)