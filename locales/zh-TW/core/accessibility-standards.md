---
source: ../../../core/accessibility-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

# 無障礙標準

> **語言**: [English](../../../core/accessibility-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-29
**適用性**: 所有具有使用者介面的軟體專案
**範圍**: 通用 (Universal)
**業界標準**: WCAG 2.1/2.2、WAI-ARIA 1.2、Section 508
**參考**: [w3.org](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 目的

本標準定義建立無障礙軟體的完整指南，確保軟體能被各種能力的人使用。本標準符合國際標準（包括 WCAG 2.1），並支持全球各地的無障礙法規合規。

**參考標準**：
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - 網頁內容無障礙指南
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - 最新 WCAG 版本（2023）
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - 無障礙富網際網路應用程式
- [Section 508](https://www.section508.gov/) - 美國聯邦無障礙需求
- [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) - 歐洲無障礙標準

---

## 無障礙原則（POUR）

| 原則 | 說明 | 範例 |
|------|------|------|
| **可感知 (Perceivable)** | 資訊和使用者介面元件必須以使用者可感知的方式呈現 | 替代文字、字幕、對比度 |
| **可操作 (Operable)** | 使用者介面元件和導航必須可操作 | 鍵盤導航、充足時間、防癲癇 |
| **可理解 (Understandable)** | 資訊和使用者介面的操作必須可理解 | 可讀性、可預測、輸入協助 |
| **穩健 (Robust)** | 內容必須足夠穩健，能被各種使用者代理正確解讀 | 相容性、解析、名稱/角色/值 |

## WCAG 合規等級

| 等級 | 說明 | 建議 |
|------|------|------|
| **A** | 最低要求 — 所有專案必須達成 | 基礎無障礙需求 |
| **AA** | 建議等級 — 大多數法規要求此等級 | 涵蓋大多數使用者需求 |
| **AAA** | 最高等級 — 特定情境的最佳實踐 | 政府、醫療、教育 |

## 鍵盤導航

| 需求 | 說明 |
|------|------|
| 所有互動元素可透過鍵盤存取 | Tab、Shift+Tab、Enter、Space、方向鍵 |
| 焦點指示器可見 | 使用者能清楚看到目前焦點位置 |
| 無鍵盤陷阱 | 使用者可以用鍵盤離開所有元件 |
| 焦點順序合邏輯 | Tab 順序遵循視覺佈局 |

## 色彩與對比

| 元素 | AA 等級 | AAA 等級 |
|------|---------|----------|
| 一般文字 | 4.5:1 | 7:1 |
| 大型文字（18pt+） | 3:1 | 4.5:1 |
| UI 元件 | 3:1 | — |
| 非文字內容 | 3:1 | — |

## 測試清單

| 測試項目 | 工具 |
|----------|------|
| 自動化無障礙掃描 | axe-core、Lighthouse |
| 鍵盤導航測試 | 手動測試 |
| 螢幕閱讀器測試 | NVDA、VoiceOver、JAWS |
| 色彩對比驗證 | Colour Contrast Analyser |
| 表單標籤驗證 | axe-core、WAVE |

## 相關標準

- [效能標準](performance-standards.md)
- [安全標準](security-standards.md)
- [測試標準](testing-standards.md)
