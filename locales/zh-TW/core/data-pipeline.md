---
source: ../../../core/data-pipeline.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 5a7a49049bd8
status: current
---

# 資料管線標準

> **Language**: [English](../../../core/data-pipeline.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/data-pipeline.ai.yaml`
> **規格**: XSPEC-068（cross-project/specs/XSPEC-068-uds-data-engineering-pack.md）

## 概觀

本標準定義建構**可靠、可觀測且可維護資料管線**的工程要求。涵蓋 idempotency 與
exactly-once 語意、錯誤處理與 dead-letter queue、checkpoint 與復原、資料血緣
（lineage）追蹤、管線可觀測性與 SLO，以及測試要求。適用於批次 ETL、串流管線與
ML 特徵管線。

本標準屬於**資料工程標準包**（XSPEC-068）。它將 `database-standards`（涵蓋靜態 DB
schema）延伸至資料的移動與轉換，並複用 SRE 家族的可靠性與可觀測性基本元件
（`observability-standards`、`slo-sli`）。

> **範圍**：本標準定義*管線設計原則*（idempotency、錯誤處理、復原、血緣、可觀測性、
> 測試）。具體 orchestrator（Airflow/Dagster）、lineage store（Marquez/DataHub）與
> DLQ 傳輸屬採用者的選擇。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Idempotency 與 exactly-once 處理 | MUST |
| REQ-002 | 錯誤處理與 dead-letter queue | MUST |
| REQ-003 | Checkpoint 與復原 | MUST |
| REQ-004 | 資料血緣追蹤 | MUST |
| REQ-005 | 管線可觀測性與 SLO | MUST |
| REQ-006 | 管線測試要求 | MUST |

### REQ-001 — Idempotency 與 Exactly-Once 處理

每條管線 MUST 設計為 **idempotent** 執行：對相同時間窗或批次重跑同一管線，MUST
產生相同輸出且無重複或資料遺失。管線 MUST 使用確定性鍵去重。批次管線 MUST 支援
歷史 partition 的乾淨重跑。串流管線 MUST 實作 exactly-once，或以唯一 event ID 去重
的 at-least-once。批次工作偏好覆寫輸出 partition 而非附加。

### REQ-002 — 錯誤處理與 Dead-Letter Queue

管線 MUST 實作具分類失敗模式的結構化錯誤處理。**Transient** 錯誤（網路逾時、API
速率限制）MUST 使用指數退避重試（最多 3 次）。**Permanent** 錯誤（schema 違規、
無效資料）MUST 將紀錄路由至 Dead-Letter Queue（DLQ），帶有原始紀錄、錯誤類型、
錯誤訊息與處理時間戳。DLQ 紀錄 MUST 受監控並在管線 SLA 內處理。

### REQ-003 — Checkpoint 與復原

長時間批次管線與有狀態串流管線 MUST 實作 **checkpointing**，以在執行中途失敗時
復原而無需全量重跑。Checkpoint MUST 記錄最後成功處理的 partition/offset/watermark、
job run ID 與時間戳。復原 MUST 從最後 checkpoint 續跑，而非從頭開始。Checkpoint
狀態 MUST 儲存於耐久的外部儲存，而非本機磁碟。

### REQ-004 — 資料血緣追蹤

每條管線 MUST 發出**血緣中繼資料**，描述其資料流：來源資料集（含版本／時間戳）、
所套用的轉換邏輯，以及產出的輸出資料集。血緣 MUST 為機器可讀並匯入中央 lineage
store 或資料目錄，以支援資料品質問題的根因分析與上游變更的影響評估。

### REQ-005 — 管線可觀測性與 SLO

每條正式管線 MUST 暴露：已處理紀錄數（counter）、處理延遲（histogram）、錯誤率
（gauge）、DLQ 深度（gauge）與最後成功執行時間戳。管線 MUST 為 **freshness**
（來源後 N 小時內可用）、**completeness**（≥ X% 紀錄成功處理）與 **latency**
（p95 在門檻內）定義 SLO。SLO 違規 MUST 觸發告警。

### REQ-006 — 管線測試要求

管線 MUST 具備自動化測試，涵蓋：轉換邏輯的單元測試（樣本輸入／輸出）、以合成資料
驗證端到端流程的整合測試，以及驗證輸出符合所宣告 data contract（`data-contract`）
的 schema 一致性測試。管線 SHOULD 對歷史問題邊界案例（關鍵欄位 null、負數金額、
重複紀錄）具備回歸測試。轉換邏輯的測試覆蓋率 MUST ≥ 80%。

## 與既有標準的整合

- **`data-contract`**——schema 一致性測試以生產者宣告的 contract 與品質 SLO 驗證
  管線輸出。
- **`schema-evolution`**——管線須容忍來源的向後相容 schema 變更。
- **`observability-standards` / `slo-sli`**——管線 metric 與 freshness／completeness
  SLO 複用 SRE 可觀測性與 SLO 基本元件。
- **`database-standards`**——將靜態 schema 標準延伸至資料移動。
- **`audit-trail`**——backfill 與重跑記錄稽核事件（原因）。

## 相關規格

- XSPEC-068 — UDS 資料工程標準包（本標準來源）
- XSPEC-066 — 合規與稽核標準包（backfill 原因用 `audit-trail`）
- XSPEC-063 — SRE 標準包（`observability-standards`、`slo-sli`）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：idempotency、錯誤處理／DLQ、checkpoint／復原、血緣、可觀測性／SLO、測試（XSPEC-068） |
