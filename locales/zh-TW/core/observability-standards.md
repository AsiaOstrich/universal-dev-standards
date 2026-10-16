---
source: ../../../core/observability-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d6bf74a0b5be
status: current
---

# 可觀測性標準

> **語言**: [English](../../../core/observability-standards.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-03-31
**適用範圍**：所有軟體專案
**範疇**：通用
**業界標準**：OpenTelemetry、W3C Trace Context、Google SRE（黃金信號）
**參考資料**：[opentelemetry.io](https://opentelemetry.io/)、[sre.google](https://sre.google/)

---

## 概述

本文件定義可觀測性標準，用於跨越三大支柱建置具備可觀測性的系統：**Logs（日誌）**、**Metrics（指標）** 與 **Traces（追蹤）**。本文件補充現有的 [日誌標準](logging-standards.md)，新增全面的 Metrics 與 Traces 指引、統一的關聯框架以及維運檢查清單。

有關完整的 Logs 指引（包括結構化日誌、日誌等級、敏感資料處理與 OpenTelemetry 整合），請參閱 [日誌標準](logging-standards.md)。

---

## 三大支柱框架

現代可觀測性依賴三大互補的支柱，各自提供觀察系統行為的不同視角：

```
┌──────────┐    trace_id     ┌──────────┐    trace_id     ┌──────────┐
│   LOGS   │◄───────────────►│  TRACES  │◄───────────────►│ METRICS  │
│ (Events) │                 │  (Spans) │                 │(Counters)│
└──────────┘                 └──────────┘                 └──────────┘
     │                            │                            │
     └────────── service.name ────┴──────── service.name ──────┘
```

| 支柱 | 擷取內容 | 使用時機 | 粒度 |
|------|---------|---------|------|
| **Logs** | 具備上下文的離散事件 | 除錯、稽核追蹤、錯誤詳情 | 高（每事件） |
| **Metrics** | 隨時間變化的數值量測 | 儀表板、告警、容量規劃 | 低（聚合） |
| **Traces** | 跨服務的請求流程 | 延遲分析、相依性對應 | 中（每請求） |

### 跨支柱關聯

可觀測性的強大之處在於跨支柱的關聯分析：

1. **Metric 異常 → Trace**：在 Metric 上使用 Exemplar 連結到呈現異常行為的特定追蹤
2. **Trace → Logs**：使用嵌入在日誌中的 `trace_id` 與 `span_id` 找出特定請求的所有日誌項目
3. **Logs → Metric**：將日誌模式聚合為指標（例如：從錯誤日誌計算錯誤率）

**關鍵關聯欄位：**
- `trace_id` — 連結 Logs ↔ Traces ↔ Metrics（透過 Exemplar）
- `service.name` — 依服務識別過濾所有三大支柱

---

## Metrics

### Metric 類型

依據您需要量測的內容選擇合適的 Metric 類型：

| 類型 | 用途 | 行為 | 使用情境 |
|------|------|------|---------|
| **Counter** | 單調遞增計數 | 只增不減（重啟時重置） | 請求數、錯誤數、傳送位元組 |
| **Gauge** | 即時數值（可增可減） | 表示當前狀態 | 溫度、佇列深度、作用中連線 |
| **Histogram** | 跨 Bucket 的數值分布 | 記錄數值到預定義的 Bucket | 請求持續時間、回應大小 |
| **Summary** | 客戶端計算的百分位數 | 在客戶端計算分位數 | 舊系統、不需要伺服器端聚合時 |

**決策指引：**
```
Does the value only go up?
├─ Yes → Counter (e.g., http.server.request.total)
└─ No
   ├─ Do you need distribution/percentiles?
   │  ├─ Yes → Histogram (e.g., http.server.request.duration.seconds)
   │  └─ No → Gauge (e.g., system.memory.usage.bytes)
   └─ Legacy requirement for client-side percentiles?
      └─ Yes → Summary
```

### 命名慣例

遵循以下模式：`<domain>.<entity>.<action>.<unit>`

| 組成部分 | 說明 | 範例 |
|-----------|-------------|---------|
| `domain` | 系統領域 | `http`, `db`, `queue`, `system` |
| `entity` | 資源類型 | `server`, `client`, `connection` |
| `action` | 量測項目 | `request`, `query`, `usage` |
| `unit` | 量測單位 | `seconds`, `bytes`, `total` |

**範例：**
- `http.server.request.duration.seconds` — HTTP 伺服器請求持續時間
- `http.server.request.total` — HTTP 總請求數（Counter）
- `db.client.query.duration.seconds` — 資料庫查詢持續時間
- `system.memory.usage.bytes` — 記憶體使用量（Gauge）
- `queue.consumer.lag.messages` — 以訊息數計的取用端延遲

**規則：**
- 多詞組成的部分使用 `snake_case`
- Gauge 與 Histogram 務必包含單位後綴
- Counter 使用 `.total` 後綴
- 避免縮寫（使用 `request` 而非 `req`）

### Label 最佳實踐

Label（亦稱標籤 tags 或屬性 attributes）為 Metric 增添維度。

**Do：**
- 使用具有有界、低基數（low-cardinality）值的 Label
- 常見 Label：`method`、`status_code`、`service`、`environment`
- 在相關的 Metric 之間保持 Label 集合的一致性

**Don't — 預防高基數：**

> ⚠️ **警告**：基數超過 **1000 個唯一值**的 Label 會導致過度的記憶體使用量與儲存成本。高基數資料（使用者 ID、請求 ID、IP 位址）應記錄在 **Logs 或 Traces** 中，而非作為 Metric Label。

| 不佳（高基數） | 良好（低基數） |
|------------------------|----------------------|
| `user_id="usr_12345"` | 使用帶有 `user_id` 欄位的 Logs |
| `request_id="req_abc"` | 使用帶有 `span_id` 的 Traces |
| `url="/api/users/12345"` | `route="/api/users/{id}"` |
| `ip="192.168.1.100"` | `region="us-east-1"` |

---

## Traces

### Span 設計原則

Span 代表一次追蹤中的單一工作單元。

**命名：**
- 使用具描述性的名稱：`db.query.users.findById`、`http.server.POST./api/orders`
- 包含操作類型與目標
- 避免使用如 `doWork` 或 `process` 等通用名稱

**必要 Span 屬性：**
| 屬性 | 說明 | 範例 |
|-----------|-------------|---------|
| `service.name` | 服務識別 | `payment-service` |
| `span.kind` | Client/Server/Internal | `SERVER` |
| 操作專屬屬性 | 取決於操作類型 | `http.method=POST` |

**粒度指引：**
- **太粗**：整個請求處理只有一個 Span → 無法看清瓶頸
- **太細**：每個函式呼叫一個 Span → 過多的額外負擔與雜訊
- **恰到好處**：每個重大 I/O 操作或業務步驟一個 Span

**經驗法則：** 在以下情況建立 Span：
1. 跨越網路邊界（HTTP 呼叫、資料庫查詢、訊息發送）
2. 發生具業務重要性的步驟（建立訂單、處理付款）
3. 發生潛在的緩慢操作（檔案 I/O、計算 > 10ms）

### 取樣策略

正式環境的追蹤可能會產生龐大的資料量。使用取樣來控制成本，同時保有可觀測性。

| 策略 | 運作方式 | 優點 | 缺點 | 使用時機 |
|----------|-------------|------|------|----------|
| **Head-based** | 在追蹤開始時決策（例如：10% 取樣率） | 簡單、低額外負擔、成本可預測 | 可能遺漏重要追蹤（錯誤、緩慢） | 高流量服務、成本敏感情境 |
| **Tail-based** | 在追蹤完成後決策（保留錯誤／緩慢追蹤） | 保留異常、擷取重要追蹤 | 需要緩衝區、資源用量較高 | 錯誤偵測、效能分析 |
| **Adaptive** | 根據流量動態調整比例 | 應對突發流量、成本平衡 | 實作與調校較複雜 | 流量模式多變的服務 |

**建議：**
- 大多數服務先從 Head-based 取樣（1-10%）開始
- 對於必須擷取錯誤的關鍵路徑，加入 Tail-based 取樣
- 流量 > 10K RPS 的服務可考慮採用 Adaptive 取樣

### 效能負擔控制

追蹤會增加額外負擔。請將其控制在可管理範圍內：

| 指標 | 目標 | 超標時處置 |
|--------|--------|-------------------|
| CPU 負擔 | < 2% | 降低取樣率 |
| 記憶體負擔 | < 50MB | 減少 Span 屬性數量 |
| 網路負擔 | < 流量的 1% | 批次匯出、壓縮 |
| 延遲影響 | 每個 Span < 1ms | 使用非同步匯出 |

### 跨服務傳遞

對於分散式系統，使用 W3C Trace Context 標準傳遞追蹤上下文：

**W3C Trace Context 標頭：**
```
traceparent: 00-<trace_id>-<span_id>-<flags>
tracestate: <vendor>=<value>
```

**跨邊界傳遞：**
- **HTTP**：`traceparent` 與 `tracestate` 標頭
- **gRPC**：Metadata 鍵值
- **訊息佇列**：訊息標頭／屬性
- **非同步工作**：儲存在工作詮釋資料（job metadata）中

---

## Golden Signals 檢查清單

根據 Google SRE 的四個黃金信號（Four Golden Signals），每個服務在進入正式環境前都應（SHOULD）監控以下項目：

### 延遲（Latency）

| 面向 | 量測方式 | 建議指標 |
|--------|------------|-------------------|
| 請求持續時間 | 使用 Histogram 的 P50、P95、P99 百分位數 | `http.server.request.duration.seconds` |
| 成功與失敗比較 | 分開計算成功／錯誤回應的延遲 | 新增 `status` 標籤 |
| 告警門檻 | P99 > X ms 持續 5 分鐘 | 基於 SLO 目標 |

### 流量（Traffic）

| 面向 | 量測方式 | 建議指標 |
|--------|------------|-------------------|
| 請求量 | 每秒請求數（RPS） | `http.server.request.total`（Counter，rate） |
| 依端點 | 依路由／方法細分 | 新增 `route`、`method` 標籤 |
| 告警門檻 | 突降 > 50% 或突增 > 200% | 與上週同期相比 |

### 錯誤（Errors）

| 面向 | 量測方式 | 建議指標 |
|--------|------------|-------------------|
| 錯誤率 | 錯誤數 / 總請求數（百分比） | `http.server.request.total{status=~"5.."}` / `http.server.request.total` |
| 依類型 | 依錯誤碼／類別細分 | 新增 `status_code`、`error_type` 標籤 |
| 告警門檻 | 錯誤率 > X% 持續 5 分鐘 | 基於 SLO 目標 |

### 飽和度（Saturation）

| 面向 | 量測方式 | 建議指標 |
|--------|------------|-------------------|
| CPU 使用率 | 可用 CPU 百分比 | `system.cpu.utilization`（Gauge） |
| 記憶體使用率 | 可用記憶體百分比 | `system.memory.utilization`（Gauge） |
| 連線池 | 活躍／最大連線數 | `db.client.connection.pool.usage`（Gauge） |
| 磁碟 I/O | 讀取／寫入吞吐量與佇列深度 | `system.disk.io`（Counter） |
| 告警門檻 | 資源 > 80% 持續 10 分鐘 | 飽和前預警 |

---

## 可觀測性成熟度模型

使用此模型來評估團隊目前的可觀測性水準並規劃改善措施：

| 等級 | 名稱 | 特徵 | 升級行動 |
|-------|------|----------------|-----------------|
| **L0** | 無可觀測性 | 無結構化日誌；僅有 stdout/stderr；透過 SSH 與 `tail -f` 進行除錯 | 實作結構化日誌；集中收集日誌 |
| **L1** | 基礎日誌 | 採用 JSON 格式的結構化 Logs；集中收集；具備基礎搜尋能力 | 新增關鍵業務指標；建立第一個儀表板 |
| **L2** | 指標驅動 | Logs + Metrics 就緒；為關鍵服務建立儀表板；基於門檻值的基礎告警 | 啟用分散式追蹤；實作基於 SLO 的告警 |
| **L3** | 完整可觀測性 | 三大支柱皆運作；關聯查詢運作正常；基於 SLO 的告警；監控黃金信號 | 新增異常偵測；針對已知問題實作自動修復 |
| **L4** | 智慧可觀測性 | AIOps 異常偵測；預測性告警；自動修復；持續最佳化 | 維護與最佳化；在組織內分享經驗學習 |

**自我評估問題：**
1. 您能否在所有服務中找到特定請求的日誌？（L1+）
2. 您能否檢視顯示目前錯誤率與延遲的儀表板？（L2+）
3. 您能否追蹤一個請求從 ingress 到資料庫並返回的完整流程？（L3+）
4. 您的系統能否在使用者回報之前自動偵測異常？（L4）

---

## 檢測檢查清單

在將服務部署至正式環境之前，請驗證以下項目：

- [ ] **啟用結構化日誌** — 採用具備 `trace_id` 關聯的 JSON 格式（參閱 [日誌標準](logging-standards.md)）
- [ ] **HTTP/gRPC 入口指標** — 所有端點的請求數、持續時間直方圖與錯誤率
- [ ] **關鍵業務操作自訂指標** — 追蹤關鍵業務事件（已建立訂單、已處理付款）
- [ ] **啟用分散式追蹤** — 設定 Span 傳遞、設定取樣率、支援 W3C Trace Context 標頭
- [ ] **健康檢查端點** — 實作存活探針（liveness probe，程序是否正在執行？）與就緒探針（readiness probe，是否能處理流量？）
- [ ] **涵蓋黃金信號的儀表板** — 至少將延遲（Latency）、流量（Traffic）、錯誤（Errors）與飽和度（Saturation）視覺化
- [ ] **定義告警規則** — 至少設定 SLO 燃燒率告警（參閱 [告警標準](alerting-standards.md)）
- [ ] **設定日誌保留期** — 依日誌等級設定保留政策
- [ ] **排除敏感資料** — 日誌／追蹤中不含密碼、權杖（token）或個人識別資訊（PII）

---

## OpenTelemetry 整合

OpenTelemetry（OTel）是建議使用的檢測框架。有關詳細的 OTel 語意慣例與整合模式，請參閱 [日誌標準 — OpenTelemetry 整合](logging-standards.md#opentelemetry-integration) 章節。

重點摘要：
- 在支援處使用 OTel SDK 進行自動檢測（auto-instrumentation）
- 屬性命名遵循 OTel 語意慣例
- 匯出至 OTel Collector 以建立中立於廠商的資料管線

---

## Quick Reference Card

### Metric 類型選擇
```
Only goes up?        → Counter
Goes up and down?    → Gauge
Need distribution?   → Histogram
Client percentiles?  → Summary
```

### 取樣策略選擇
```
High traffic, cost-sensitive?     → Head-based (1-10%)
Must capture all errors?          → Tail-based
Traffic varies widely?            → Adaptive
```

### 成熟度等級快速檢查
```
No structured logs?               → L0
Structured logs, centralized?     → L1
Logs + Metrics + Dashboards?      → L2
All three pillars + SLO alerts?   → L3
AIOps + Auto-remediation?         → L4
```

---

## 參考資料

- [OpenTelemetry 規格](https://opentelemetry.io/docs/specs/otel/) — 可觀測性檢測的業界標準
- [OpenTelemetry 語意慣例](https://opentelemetry.io/docs/specs/semconv/) — 標準化屬性命名
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — 分散式追蹤上下文傳遞
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) — 黃金信號起源
- [Google SRE — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — 多時間窗口燃燒率告警

---

**相關標準：**
- [日誌標準](logging-standards.md) — 完整 Logs 支柱指引
- [SLO 標準](slo-standards.md) — SLI/SLO/Error Budget 定義
- [告警標準](alerting-standards.md) — 告警設計與管理
- [效能標準](performance-standards.md) — 效能目標與基準測試

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初版發布：Metrics、Traces、黃金信號、成熟度模型、檢測檢查清單 |

---

## 授權條款

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
