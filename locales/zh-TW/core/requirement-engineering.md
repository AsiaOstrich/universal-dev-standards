---
source: ../../../core/requirement-engineering.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

# 需求工程標準

> **語言**: [English](../../../core/requirement-engineering.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-28
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**業界標準**: IEEE 830-1998、IEEE 29148-2018、SWEBOK v4.0
**參考**: [computer.org](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4)

---

## 摘要

需求工程是在整個開發生命週期中系統性地引出、分析、規格化和驗證軟體需求的過程。它提供撰寫、管理和驗證需求的理論基礎，基於業界標準包括 IEEE 830-1998、IEEE 29148-2018、SWEBOK v4.0 和 ISO/IEC 25010。

此過程涵蓋功能需求（系統應做什麼）、非功能需求（效能、安全、可用性等品質屬性）和約束條件。使用者故事（Agile 格式）搭配驗收條件（Given-When-Then）作為主要規格格式，透過 INVEST 準則驗證。

---

**完整指南：[需求工程指南](../../../methodologies/guides/requirement-engineering-guide.md)**

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心流程** | 引出 → 分析 → 規格化 → 驗證 |
| **需求類型** | 功能需求 (FR)、非功能需求 (NFR)、約束條件 |
| **優先級排序** | MoSCoW、P0-P3、Kano 模型 |
| **品質模型** | ISO/IEC 25010（8 個特徵） |
| **標準** | IEEE 830、IEEE 29148、SWEBOK v4.0 |

## 使用者故事格式

```
作為 [角色]
我希望 [功能]
以便 [商業價值]
```

### INVEST 準則

| 準則 | 說明 |
|------|------|
| **I**ndependent | 獨立 — 故事之間盡量獨立 |
| **N**egotiable | 可協商 — 細節可以討論調整 |
| **V**aluable | 有價值 — 對使用者或業務有價值 |
| **E**stimable | 可估算 — 可以估算工作量 |
| **S**mall | 小型 — 可在一個迭代內完成 |
| **T**estable | 可測試 — 可以撰寫驗收條件 |

## 需求優先級

### MoSCoW 方法

| 分類 | 說明 |
|------|------|
| **Must have** | 必要 — 沒有就無法發布 |
| **Should have** | 應有 — 重要但可以延後 |
| **Could have** | 可有 — 增值但非必要 |
| **Won't have** | 不做 — 此版本明確排除 |

## 相關標準

- [規格驅動開發](spec-driven-development.md)
- [正向推導標準](forward-derivation-standards.md)
- [行為驅動開發](behavior-driven-development.md)
- [測試標準](testing-standards.md)
