---
source: ../../../core/spec-driven-development.md
source_version: 2.3.0
translation_version: 2.3.0
last_synced: 2026-06-10
source_hash: 08dd8c2bee20
status: current
---

# 規格驅動開發 (SDD) 標準

> **語言**: [English](../../../core/spec-driven-development.md) | 繁體中文

**版本**: 2.3.0
**最後更新**: 2026-06-08
**適用性**: 所有採用規格驅動開發的專案
**範圍**: 通用 (Universal)

---

## 摘要

規格驅動開發（SDD）是一種 AI 時代的方法論（2025 年起），有別於傳統的 TDD/BDD/ATDD。它確保所有變更在實作前都透過規格進行規劃、記錄與核准。核心原則是**「規格優先，程式碼其次」**——沒有對應的已核准規格，就不能進行任何功能性程式碼變更。

SDD 在不同的成熟度層級運作：規格優先（完成後丟棄）、規格錨定（貫穿整個演進過程維護）、規格即來源（規格是唯一來源，程式碼自動生成）。此方法論使用正向推演（Forward Derivation）從規格生成測試產物（BDD 場景、TDD 骨架、契約）。

---

**完整指南: [SDD 指南](../methodologies/guides/sdd-guide.md)**

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **核心工作流程** | 討論 → 提案 → 審查 → 實作 → 驗證 → 歸檔 |
| **核心原則** | 規格優先，程式碼其次 (Spec First, Code Second) |
| **AC 格式** | Given/When/Then（GWT，預設——啟用 BDD 推演）**或** EARS 記法（選用，XSPEC-263） |
| **測試生成** | 正向推演（/derive-bdd、/derive-tdd、/derive-all） |
| **成熟度層級** | 規格優先、規格錨定、規格即來源 |
| **工具** | OpenSpec、Spec Kit、手動（基於檔案） |
| **I/O 契約** | 可選的結構化輸入/輸出定義，用於跨規格資料流 |
| **假設** | 追蹤假設（[Assumption]）與待釐清項目（[Need Confirmation]）的必填章節 |
| **AC YAML Sidecar** | 建議在 AC 超過 3 條時使用 .ac.yaml（機器可讀 AC） |
| **AI Agent 行為** | 可選章節，用於在規格中定義 Agent 角色、規則、品質檢查、限制 |

## AC 格式

UDS 支援兩種 AC 記法。**GWT 為預設與首選**（Forward Derivation／BDD 場景生成依賴它）。**EARS**（Easy Approach to Requirements Syntax，IBM Rational）為可選補充，對事件／狀態／恆常／異常需求表達更精準。

| EARS 型 | 模板 | 用於 |
|---------|------|------|
| 恆常 Ubiquitous | `THE SYSTEM SHALL <response>` | 恆常需求（無觸發）|
| 事件驅動 Event-driven | `WHEN <trigger> THE SYSTEM SHALL <response>` | 事件觸發 |
| 狀態驅動 State-driven | `WHILE <state> THE SYSTEM SHALL <response>` | 狀態持續期間 |
| 異常 Unwanted | `IF <condition>, THEN THE SYSTEM SHALL <response>` | 錯誤／異常處理 |
| 選配 Optional | `WHERE <feature included> THE SYSTEM SHALL <response>` | 選配功能 |

每個 AC 提供 **GWT 或 EARS** 之一（`.ac.yaml` 的 `given/when/then` 或 `ears`）。BDD 可推導行為優先 GWT；GWT 表達牽強時改用 EARS。不強制兩者並存、不移除 GWT。

## v2.3.0 新增內容

- **EARS 記法** 作為可選 AC 格式（XSPEC-263）：5 種 EARS 模板 + `.ac.yaml` `ears` 欄位。GWT 維持預設與首選；`given/when/then` 由 required 放寬（向後相容）。

## v2.2.0 新增內容

- **AC YAML Sidecar**：透過 `.ac.yaml` 檔案提供機器可讀的驗收標準（schema：`specs/schemas/acceptance-criteria.schema.yaml`）
- **I/O 合約章節**：規格範本中新增可選的結構化輸入/輸出合約
- **假設與待釐清章節**：新規格的必填章節，整合反幻覺標籤
- **AI Agent 行為章節**：可選章節，用於在規格中定義 AI Agent 行為

> 現有規格不需要回溯新增這些章節。

## 相關標準

- [正向推演標準](forward-derivation-standards.md)
- [反向工程標準](reverse-engineering-standards.md)
- [測試驅動開發](test-driven-development.md)
- [行為驅動開發](behavior-driven-development.md)