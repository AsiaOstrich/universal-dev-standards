# [SPEC-OBS-001] Feature: Observability Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Critical (P0)
- **Scope**: universal
- **Related**: `core/logging-standards.md` (擴展), SPEC-SLO-001, SPEC-ALERT-001

## Overview

將現有的 `logging-standards` 擴展為完整的可觀測性標準，涵蓋三支柱（Logs、Metrics、Traces）的統一規範。現有 `logging-standards` 已包含 Logs 和部分 OTel 整合內容，本規格聚焦於**補強 Metrics 和 Traces 的獨立標準**，以及**統一的可觀測性策略框架**。

## Motivation

### 問題陳述

1. **Metrics 無標準** — 現有 `logging-standards` 僅在 "Three Pillars" 段落提及 Metrics 概念，但缺乏度量類型定義（Counter、Gauge、Histogram）、命名慣例、聚合策略
2. **Traces 僅有基礎** — 現有 trace_id/span_id 的傳播規範已存在，但缺乏 Span 設計原則、取樣策略、效能開銷控制
3. **無成熟度模型** — 團隊無法自評可觀測性現狀，也無逐步改善的路線圖
4. **Golden Signals 未標準化** — Google SRE 的四大黃金信號（延遲、流量、錯誤、飽和度）缺乏可操作的檢查表
5. **Instrumentation 無指引** — 開發者不知道「上線前需要埋哪些觀測點」

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `logging-standards` | **擴展**：保留現有 Logs 內容不變，新增 Metrics + Traces 獨立章節 |
| `performance-standards` | **互補**：performance 定義目標，observability 定義如何量測 |
| `deployment-standards` | **銜接**：部署後的可觀測性驗證 |
| SPEC-SLO-001 | **基礎**：SLO 的 SLI 來源依賴可觀測性基礎設施 |
| SPEC-ALERT-001 | **基礎**：告警規則基於 Metrics 和 Logs |

## Requirements

### REQ-1: 可觀測性三支柱統一框架

系統 SHALL 提供統一的三支柱（Logs、Metrics、Traces）可觀測性框架，定義各支柱的角色、互動方式和關聯機制。

#### Scenario: 開發者查閱可觀測性總覽
- **GIVEN** 開發者首次接觸可觀測性標準
- **WHEN** 開發者閱讀 `core/observability-standards.md` 的總覽章節
- **THEN** 應看到三支柱的定義、各自適用場景、以及透過 trace_id 和 service.name 關聯的說明

#### Scenario: 三支柱關聯查詢
- **GIVEN** 維運人員發現某個 Metric 異常
- **WHEN** 維運人員按照標準的關聯指引操作
- **THEN** 能透過 Exemplar 跳轉到相關 Trace，再從 Trace 找到對應 Logs

### REQ-2: Metrics 標準

系統 SHALL 定義 Metrics 的類型、命名慣例、聚合策略和最佳實踐。

#### Scenario: 選擇正確的 Metric 類型
- **GIVEN** 開發者需要監控某個指標
- **WHEN** 開發者查閱 Metric 類型選擇指南
- **THEN** 能根據指南判斷應使用 Counter、Gauge、Histogram 或 Summary

#### Scenario: 命名新的 Metric
- **GIVEN** 開發者建立新的自訂 Metric
- **WHEN** 開發者遵循命名慣例
- **THEN** Metric 名稱符合 `<domain>.<entity>.<action>.<unit>` 模式（如 `http.server.request.duration.seconds`）

#### Scenario: 高基數 (High Cardinality) 防護
- **GIVEN** 開發者在 Metric 中加入 Label
- **WHEN** Label 的 cardinality 超過閾值（如 > 1000 unique values）
- **THEN** 標準應有警告指引，建議改用 Logs 或 Traces 記錄高基數資料

### REQ-3: Traces 標準

系統 SHALL 定義分散式追蹤的 Span 設計、取樣策略和效能控制。

#### Scenario: 設計有意義的 Span
- **GIVEN** 開發者為某個操作建立 Span
- **WHEN** 開發者遵循 Span 設計原則
- **THEN** Span 名稱具描述性（如 `db.query.users.findById`），包含必要屬性，粒度適當（不過細也不過粗）

#### Scenario: 設定取樣策略
- **GIVEN** 生產環境的 Trace 流量過大
- **WHEN** 團隊根據標準選擇取樣策略
- **THEN** 能從 Head-based / Tail-based / Adaptive 取樣中選擇，並理解各自的取捨

#### Scenario: 跨服務追蹤傳播
- **GIVEN** 請求經過多個微服務
- **WHEN** 各服務遵循 W3C Trace Context 標準
- **THEN** 完整的 trace 可從入口追蹤到最終服務，包含所有中間 span

### REQ-4: Golden Signals 檢查表

系統 SHALL 提供基於 Google SRE 四大黃金信號的可操作檢查表。

#### Scenario: 新服務上線前的可觀測性檢查
- **GIVEN** 新服務準備部署到生產環境
- **WHEN** 團隊使用 Golden Signals 檢查表
- **THEN** 確認四大信號（延遲 Latency、流量 Traffic、錯誤 Errors、飽和度 Saturation）均有對應的 Metric 和告警

#### Scenario: 各信號的量測方式
- **GIVEN** 團隊需要量測「延遲」信號
- **WHEN** 查閱檢查表的延遲段落
- **THEN** 看到具體的量測方式（P50/P95/P99 histogram）、推薦的 Metric 名稱、以及告警閾值建議

### REQ-5: 可觀測性成熟度模型

系統 SHALL 定義 L0-L4 的可觀測性成熟度等級，供團隊自評和規劃改善路線。

#### Scenario: 團隊自評成熟度
- **GIVEN** 團隊想了解自身可觀測性的現狀
- **WHEN** 團隊對照成熟度模型進行自評
- **THEN** 能確定目前等級（L0-L4），並看到升級到下一等級所需的具體行動

#### Scenario: 成熟度等級定義
- **GIVEN** 以下成熟度等級定義
- **WHEN** 團隊查閱各等級標準
- **THEN** 看到以下定義：

| 等級 | 名稱 | 特徵 |
|------|------|------|
| L0 | 無觀測 | 無結構化日誌，僅 stdout/stderr |
| L1 | 基礎日誌 | 結構化 Logs，集中收集，基本搜尋 |
| L2 | 指標導向 | Logs + Metrics，有 dashboard，基本告警 |
| L3 | 全面可觀測 | 三支柱完整，關聯查詢，SLO-based 告警 |
| L4 | 智慧觀測 | AIOps，異常偵測，自動修復，預測性告警 |

### REQ-6: Instrumentation 指引

系統 SHALL 提供服務上線前必須滿足的 Instrumentation 檢查表。

#### Scenario: 服務 Instrumentation 檢查
- **GIVEN** 服務即將進入生產環境
- **WHEN** 開發者依照 Instrumentation 檢查表逐項確認
- **THEN** 確認以下項目已完成：
  - [ ] 結構化日誌已啟用（含 trace_id 關聯）
  - [ ] HTTP/gRPC 入口 Metrics 已埋設（request count、duration、error rate）
  - [ ] 關鍵業務操作有 custom Metrics
  - [ ] 分散式追蹤已啟用（Span 傳播、取樣設定）
  - [ ] 健康檢查端點已建立（liveness + readiness）
  - [ ] Dashboard 已建立（至少涵蓋 Golden Signals）
  - [ ] 告警規則已定義（至少 SLO burn rate）

### REQ-7: 現有標準的平滑演進

系統 SHALL 確保從現有 `logging-standards` 到新 `observability-standards` 的平滑過渡。

#### Scenario: 現有 logging-standards 內容保留
- **GIVEN** 現有 `logging-standards` 中的所有內容
- **WHEN** 建立新的 `observability-standards`
- **THEN** 現有 Logs 相關內容完整保留，Metrics 和 Traces 作為新增章節，不破壞現有引用

#### Scenario: 交叉引用
- **GIVEN** `logging-standards` 已被其他標準引用
- **WHEN** 新標準建立後
- **THEN** `logging-standards` 加入指向 `observability-standards` 的引用，並標註 "For complete observability guidance including Metrics and Traces"

## Acceptance Criteria

- **AC-1**: Given 開發者查閱標準, when 閱讀 Metrics 章節, then 能找到完整的 Metric 類型定義（Counter/Gauge/Histogram/Summary）、命名慣例、Label 最佳實踐
- **AC-2**: Given 開發者查閱標準, when 閱讀 Traces 章節, then 能找到 Span 設計原則、取樣策略比較表、W3C Trace Context 整合指引
- **AC-3**: Given 團隊自評, when 使用成熟度模型, then 能明確判定 L0-L4 等級並看到升級所需行動
- **AC-4**: Given 新服務上線, when 使用 Golden Signals 檢查表, then 四大信號各有可操作的量測方式和推薦 Metric
- **AC-5**: Given 開發者準備上線, when 使用 Instrumentation 檢查表, then 有明確的 7 項必要項目可逐一確認
- **AC-6**: Given 現有 logging-standards, when 新標準建立, then 現有內容 100% 保留，僅新增章節
- **AC-7**: Given 標準文件, when 檢查格式, then 符合 UDS core 標準格式（Version/Scope/References/License）

## Technical Design

### 文件結構

```
core/
├── logging-standards.md          ← 保留，新增交叉引用
├── observability-standards.md    ← 新建，Metrics + Traces + 框架
```

### 章節結構（observability-standards.md）

```markdown
# Observability Standards

## Overview
## Three Pillars Framework
  ### Logs（引用 logging-standards）
  ### Metrics
    #### Metric Types
    #### Naming Conventions
    #### Label Best Practices
    #### High Cardinality Prevention
  ### Traces
    #### Span Design Principles
    #### Sampling Strategies
    #### Performance Overhead Control
    #### Cross-Service Propagation
## Correlation Across Pillars
## Golden Signals Checklist
  ### Latency
  ### Traffic
  ### Errors
  ### Saturation
## Observability Maturity Model (L0-L4)
## Instrumentation Checklist
## OpenTelemetry Integration（從 logging-standards 提升）
## References
```

### 對應 Skill

| 產出物 | 類型 |
|--------|------|
| `core/observability-standards.md` | Core 標準 |
| `skills/observability-assistant/SKILL.md` | 新 Skill |
| `.standards/observability.ai.yaml` | AI YAML |

### 與其他 SPEC 的依賴

```
SPEC-OBS-001 (本規格)
    ├── SPEC-SLO-001 依賴本規格的 Metrics 基礎
    └── SPEC-ALERT-001 依賴本規格的 Metrics + Golden Signals
```

## Test Plan

- [ ] `observability-standards.md` 符合 UDS core 標準格式驗證
- [ ] Metrics 章節包含 4 種 Metric 類型的完整定義和範例
- [ ] Traces 章節包含取樣策略比較表（至少 3 種）
- [ ] Golden Signals 檢查表包含 4 個信號的量測方式
- [ ] 成熟度模型包含 L0-L4 共 5 個等級的完整定義
- [ ] Instrumentation 檢查表包含至少 7 個檢查項目
- [ ] 現有 `logging-standards.md` 內容未被修改（僅新增交叉引用）
- [ ] `check-standards-sync.sh` 通過
- [ ] `check-translation-sync.sh` 通過（如有翻譯）

## Implementation Notes

### Metrics 類型定義參考

| 類型 | 用途 | 範例 |
|------|------|------|
| **Counter** | 單調遞增計數 | `http.server.request.total` |
| **Gauge** | 瞬時值（可升可降） | `system.memory.usage.bytes` |
| **Histogram** | 值的分布 | `http.server.request.duration.seconds` |
| **Summary** | 客戶端計算的百分位數 | `rpc.client.duration.seconds` |

### 取樣策略比較

| 策略 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| Head-based | 簡單、低開銷 | 可能丟失重要 trace | 高流量、低延遲要求 |
| Tail-based | 保留異常 trace | 需暫存、高資源 | 錯誤偵測、效能分析 |
| Adaptive | 動態調整取樣率 | 實作複雜 | 流量波動大的服務 |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
