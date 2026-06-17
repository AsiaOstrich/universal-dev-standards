---
source: ../../../core/user-story-mapping.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: d161a742d704
status: current
---

# User Story Mapping 標準

> **Language**: [English](../../../core/user-story-mapping.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/user-story-mapping.ai.yaml`
> **規格**: XSPEC-069（cross-project/specs/XSPEC-069-uds-product-layer-pack.md）

## 概觀

本標準定義團隊如何建構與運用 **story map** 來規劃產品發布。涵蓋三層 story map 結構
（Backbone 活動、Walking Skeleton 子任務、Detail Stories）、MVP 水平切片規則、每個
story 的 INVEST 合規，以及與可量化產品指標連結的 Given/When/Then 驗收條件。可避免
不完整的 MVP，並確保每個 story 皆可測試與可追溯。

本標準屬於**產品層標準包**（XSPEC-069），位於 `prd-standards`（上游意圖）與
`requirement-engineering`（下游 INVEST story）之間，驗收條件連結
`product-metrics-standards`。

> **範圍**：本標準定義 *story map 結構與 MVP 切片紀律*。具體規劃工具（Miro/Jira）
> 屬採用者的選擇。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Story map 三層（backbone、walking skeleton、detail story） | MUST |
| REQ-002 | MVP 水平切片規則（禁止垂直切片 MVP） | MUST |
| REQ-003 | Story INVEST 合規 | MUST |
| REQ-004 | 驗收條件格式（Given/When/Then、連結指標） | MUST |

### REQ-001 — Story Map 三層

每張 story map MUST 結構化為三個水平層：(1) **Backbone**（頂列）——最高抽象層級的
使用者活動，代表完整的端到端旅程，各為使用者視角的動詞片語；backbone 須代表完整
旅程，而非僅已實作功能。(2) **Walking Skeleton**（中列）——使每個 backbone 活動可
運作的最少子任務，垂直排列於各 backbone 項目下。(3) **Detail Stories**（底列）——
針對變體、增強與邊界案例的具體 story，於各欄內垂直排序（越高優先級越高）。

### REQ-002 — MVP 水平切片規則

MVP 發布邊界 MUST 為跨 story map 的**水平切片**，於 walking skeleton 層級涵蓋所有
backbone 活動。僅涵蓋部分 backbone 活動的 MVP（**垂直切片**——把某活動做到完美而
其他缺席或不可運作）為 PROHIBITED，因其無法供使用者端到端評估。**例外**：單活動
產品（如聚焦型工具）若全部價值主張由該單一活動交付則豁免；例外 MUST 於 story map
記錄理由。

### REQ-003 — Story INVEST 合規

map 中每個 story MUST 符合 `requirement-engineering` 的 INVEST 準則：
**I**ndependent、**N**egotiable、**V**aluable、**E**stimable、**S**mall（至多一個
sprint；過大則拆分）、**T**estable（存在可客觀驗證的驗收條件）。未通過 INVEST 的
story 須在進 sprint 前精煉；評估 MUST 於 backlog refinement 會議進行。

### REQ-004 — 驗收條件格式

每個 story MUST 具備至少一條 **Given/When/Then** 格式的驗收條件，並於適用時連結至
`product-metrics-standards` 階層中的可量化產品結果。驗收條件無法客觀驗證（如「頁面
看起來不錯」）的 story 為不合規。驗收條件 MUST 在開發開始前撰寫，且開發開始後未經
PM 與 dev lead 簽核 MUST NOT 修改（與 PRD 變更相同的修訂政策）。

## 反樣態

- 垂直 MVP 切片：把某活動做到完美而其他 backbone 活動缺席。
- 無驗收條件的 story 進入開發（無明確 definition of done）。
- backbone 活動對應系統元件而非實際使用者目標。
- story map 僅用於規劃後即棄置，未作為活文件維護。
- 略過 backbone 與 walking skeleton 脈絡直接加入 detail story。

## 與既有標準的整合

- **`prd-standards`**——PRD 範圍實現為 story map 與 MVP 切片。
- **`requirement-engineering`**——story 遵循其定義的 INVEST 準則。
- **`product-metrics-standards`**——驗收條件對應北極星 driver。
- **`acceptance-criteria-traceability`**——GWT 條件提供 AC 追溯主幹。

## 相關規格

- XSPEC-069 — UDS 產品層標準包（本標準來源）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~004：三層 map、MVP 水平切片規則、INVEST 合規、GWT 驗收條件（XSPEC-069） |
