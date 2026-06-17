---
source: ../../../core/product-metrics-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: e37a44aefd92
status: current
---

# 產品指標框架標準

> **Language**: [English](../../../core/product-metrics-standards.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/product-metrics-standards.ai.yaml`
> **規格**: XSPEC-069（cross-project/specs/XSPEC-069-uds-product-layer-pack.md）

## 概觀

本標準定義團隊如何**選擇、結構化與治理產品指標**。涵蓋框架選用矩陣（成長型用
AARRR、體驗型用 HEART、平台型用自訂北極星）、北極星準則、三層指標階層（北極星 →
L1 driver → L2 diagnostic），以及拒絕與營收／留存脫鉤指標的反虛榮（anti-vanity）
規則。使團隊圍繞能驅動有意義產品決策的指標對齊，而非活動追蹤。

本標準屬於**產品層標準包**（XSPEC-069）。其追蹤要求連接 SRE 可觀測性基本元件
（`observability-standards`、`slo-sli`）。

> **範圍**：本標準定義*指標選擇與治理*。具體分析工具（Amplitude/Mixpanel）屬採用者
> 的選擇。服務層級可靠性指標置於 `slo-sli`；此處為產品結果視角。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 框架選用矩陣（AARRR / HEART / 自訂北極星） | MUST |
| REQ-002 | 北極星準則（leading、可量測、actionable、可解釋） | MUST |
| REQ-003 | 指標階層（最多三層） | MUST |
| REQ-004 | 反虛榮規則 | MUST |

### REQ-001 — 框架選用矩陣

團隊 MUST 依產品類型選擇主要指標框架：**成長型產品**（消費 app、市集、病毒式產品）
→ **AARRR**（Acquisition、Activation、Retention、Referral、Revenue）；**體驗型
產品**（生產力工具、B2B SaaS）→ **HEART**（Happiness、Engagement、Adoption、
Retention、Task Success）；**平台型產品**（開發者平台、API）→ 反映平台價值的
**自訂北極星**，並視情況以 AARRR 或 HEART 元件補充。框架選用 MUST 記載於 PRD 或
產品策略文件。

### REQ-002 — 北極星準則

每個產品 MUST 定義恰好一個北極星指標，滿足全部四項準則：(1) **Leading
indicator**——預測未來業務健康而非量測過去結果；(2) **可量測且可追蹤**——可由可得
資料以既定頻率（週／月）計算；(3) **團隊可施力**——產品團隊有直接槓桿可影響；
(4) **一句話可解釋**。北極星 MUST 於每年產品規劃週期審視並再確認。

### REQ-003 — 指標階層

團隊 MUST 將指標結構化為至多三層階層。**Level 1（北極星）**：一個代表整體產品價值
的指標。**Level 2（L1 driver）**：3~5 個直接影響北極星的指標，各具文件化的因果
假設。**Level 3（L2 diagnostic）**：解釋 L1 driver 變動的 per-feature／per-team
指標（每個 driver 最多 3 個）。超過三層的指標為 PROHIBITED——代表量測碎片化而非
聚焦。

### REQ-004 — 反虛榮規則

團隊 MUST 在將任何指標加入官方儀表板前套用反虛榮測試。若某指標可在營收與留存持平
或下降時上升，即測試失敗；此類指標 MUST NOT 出現於官方產品審視或作為功能成功標準。
常見失敗：總註冊用戶（無活躍篩選）、原始 pageview（無 session 品質篩選）、總 API
呼叫（無唯一活躍客戶篩選）、媒體提及、無 activation 的下載數。當虛榮指標於營運監控
有用時，MUST 明確標示為「operational indicator, not success metric」。

## 反樣態

- 將虛榮指標（總註冊、原始 pageview）作為主要成功指標追蹤。
- 未定義北極星——團隊各自最佳化不同局部指標，造成失準。
- 團隊指標衝突，一隊的最佳化損害另一隊的指標。
- 指標階層深於三層——複雜而無洞見。
- 每季變更北極星，妨礙年對年趨勢分析。

## 與既有標準的整合

- **`prd-standards`**——PRD 成功指標取自此階層。
- **`observability-standards` / `slo-sli`**——產品指標的*追蹤*複用 SRE 指標／可觀測
  性基本元件；可靠性 SLO 仍留在 `slo-sli`。
- **`user-story-mapping`**——story 驗收條件對應北極星 driver。

## 相關規格

- XSPEC-069 — UDS 產品層標準包（本標準來源）
- XSPEC-063 — SRE 標準包（`observability-standards`、`slo-sli`）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~004：框架矩陣、北極星準則、指標階層、反虛榮規則（XSPEC-069） |
