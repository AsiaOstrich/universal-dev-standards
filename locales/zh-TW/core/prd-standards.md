---
source: ../../../core/prd-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 3addb642ee83
status: current
---

# 產品需求文件（PRD）標準

> **Language**: [English](../../../core/prd-standards.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/prd-standards.ai.yaml`
> **規格**: XSPEC-069（cross-project/specs/XSPEC-069-uds-product-layer-pack.md）

## 概觀

本標準定義**產品需求文件（PRD）**的結構、內容要求與生命週期治理。涵蓋五大必備
PRD 段落、從 PRD 需求銜接至可追溯 user story，以及 kickoff 後變更的修訂政策。確保
產品意圖能以可量化成功標準清楚傳達給工程、設計與利害關係人。

本標準屬於**產品層標準包**（XSPEC-069）。PRD 是工程需求的*上游*：PRD → user story
→ requirement。它銜接 `requirement-engineering`（需求的工程視角），並消費
`product-metrics-standards` 作為成功指標。

> **範圍**：本標準定義 *PRD 產物*（段落、追溯性、修訂政策）。這是 UDS 的產品層邊緣
> （依 XSPEC-070 `standard-admission-criteria`）——需求的工程視角仍留在
> `requirement-engineering`。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | PRD 五大段落（問題、persona、成功指標、範圍、限制） | MUST |
| REQ-002 | PRD → user story 銜接（INVEST、可追溯至成功指標） | MUST |
| REQ-003 | 修訂政策（kickoff 後的正式變更流程） | MUST |

### REQ-001 — PRD 五大段落

每份 PRD MUST 依序包含五段落：(1) **Problem Statement**——以可觀察詞語描述使用者
痛點／機會，並盡量附量化資料；(2) **Target User / Persona**——誰受影響，引用具名
persona（≥1 主要、≥1 次要）含角色、情境與目標；(3) **Success Metrics**——2~4 個可
量化結果，各含現況 baseline、目標值與量測方法；(4) **Scope In / Out**——明確列出
包含與排除（排除項可引用未來 PRD）；(5) **Constraints**——技術、法規、時間、預算或
相依性限制。

### REQ-002 — PRD 至 User Story 銜接

每個 PRD 需求 MUST 拆解為一個以上 user story，遵循 `requirement-engineering` 的
INVEST 原則。每個由 PRD 衍生的 story MUST 可追溯至至少一個 PRD 成功指標；無法連結
的 story MUST 在進 backlog 前標記供 PM 審視。追溯連結（PRD 段落 ID → user story ID
→ 成功指標）MUST 維護於 backlog 工具或 PRD 中的矩陣。

### REQ-003 — 修訂政策

開發 kickoff 會議後請求的 PRD 變更 MUST 遵循正式流程：(1) 以理由與影響評估記錄
提案變更；(2) 取得 PM、Tech Lead 與 Design Lead 的簽核；(3) 評估範圍影響——新增
範圍須將對應項目移出範圍或調整時程；(4) 更新版本歷史，含日期、作者、變更摘要與
核准者。kickoff 後修改卻無版本歷史的 PRD 視為不合規。輕微編輯變更（錯字、排版）
豁免簽核。

## 反樣態

- PRD 無可量化成功指標（僅質性目標，如「改善 UX」）。
- 範圍蔓延而無變更紀錄：sprint 中途新增需求且未記錄核准。
- 解法優先（solution-first）的 PRD：在確立使用者問題前先描述實作細節。
- 無明確的 out-of-scope 段落，導致開發期間的邊界爭議。
- 開發開始後才定義成功指標，使其無法驗證。

## 與既有標準的整合

- **`requirement-engineering`**——PRD 需求拆解為 INVEST user story。
- **`product-metrics-standards`**——PRD 成功指標取自指標階層。
- **`user-story-mapping`**——PRD 範圍實現為 story map 與 MVP 切片。
- **`acceptance-criteria-traceability`**——story 帶有可追溯回 PRD 指標的 AC。

## 相關規格

- XSPEC-069 — UDS 產品層標準包（本標準來源）
- XSPEC-070 — 治理 meta 標準（`standard-admission-criteria` 邊緣審視）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~003：五大段落、PRD→story 銜接、修訂政策（XSPEC-069） |
