---
source: ../../../core/observability-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
---

# 可觀測性標準

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義可觀測性標準，涵蓋三大支柱：**Logs（日誌）**、**Metrics（指標）** 和 **Traces（追蹤）**。補充現有的 [日誌標準](logging-standards.md)，新增全面的 Metrics 與 Traces 指引、統一關聯框架及操作檢查清單。

完整 Logs 指引（結構化日誌、日誌等級、敏感資料處理、OpenTelemetry 整合）請參閱 [日誌標準](logging-standards.md)。

---

## 三大支柱框架

| 支柱 | 擷取內容 | 使用時機 | 粒度 |
|------|---------|---------|------|
| **Logs** | 具備上下文的離散事件 | 除錯、稽核追蹤、錯誤詳情 | 高（每事件） |
| **Metrics** | 隨時間變化的數值量測 | 儀表板、告警、容量規劃 | 低（聚合） |
| **Traces** | 跨服務的請求流程 | 延遲分析、依賴對應 | 中（每請求） |

### 跨支柱關聯

- **Metric 異常 → Trace**：使用 Exemplars 連結到特定 Trace
- **Trace → Logs**：使用 `trace_id` 和 `span_id` 查找特定請求的日誌
- **Logs → Metric**：將日誌模式聚合為指標（如：從錯誤日誌計算錯誤率）

關鍵關聯欄位：`trace_id`、`service.name`

---

## Metric 類型

| 類型 | 用途 | 行為 | 使用情境 |
|------|------|------|---------|
| **Counter** | 單調遞增計數 | 只增不減（重啟時重置） | 請求數、錯誤數、傳送位元組 |
| **Gauge** | 即時數值（可增可減） | 表示當前狀態 | 溫度、佇列深度、活躍連線 |
| **Histogram** | 跨 Bucket 的值分布 | 記錄值到預定義 Bucket | 請求持續時間、回應大小 |
| **Summary** | 客戶端計算的百分位數 | 在客戶端計算分位數 | 舊系統、不需伺服器端聚合時 |

---

## Golden Signals（黃金信號）

每個服務上線前應監控：

| 信號 | 量測 | 建議指標 |
|------|------|---------|
| **Latency（延遲）** | P50、P95、P99 百分位數 | `http.server.request.duration.seconds` |
| **Traffic（流量）** | 每秒請求數（RPS） | `http.server.request.total` |
| **Errors（錯誤）** | 錯誤 / 總請求（百分比） | 5xx / total |
| **Saturation（飽和度）** | CPU、記憶體、連線池使用率 | `system.cpu.utilization` 等 |

---

## 可觀測性成熟度模型

| 等級 | 名稱 | 特徵 |
|------|------|------|
| **L0** | 無可觀測性 | 無結構化日誌；僅 stdout/stderr |
| **L1** | 基礎日誌 | 結構化 Logs + JSON 格式 + 集中收集 |
| **L2** | 指標驅動 | Logs + Metrics + 儀表板 + 基礎告警 |
| **L3** | 完整可觀測性 | 三大支柱運作 + 關聯查詢 + SLO 告警 |
| **L4** | 智慧可觀測性 | AIOps 異常偵測 + 預測告警 + 自動修復 |

---

## Quick Reference Card

### Metric 類型選擇
```
只會增加？        → Counter
可增可減？        → Gauge
需要分布？        → Histogram
客戶端百分位數？  → Summary
```

### 取樣策略選擇
```
高流量、成本敏感？     → Head-based（1-10%）
必須擷取所有錯誤？     → Tail-based
流量變化大？           → Adaptive
```

### 成熟度等級快速檢查
```
無結構化日誌？               → L0
結構化日誌、已集中？         → L1
Logs + Metrics + 儀表板？    → L2
三大支柱 + SLO 告警？       → L3
AIOps + 自動修復？           → L4
```

---

**相關標準：**
- [日誌標準](logging-standards.md) — 完整 Logs 支柱指引
- [SLO 標準](slo-standards.md) — SLI/SLO/Error Budget 定義
- [告警標準](alerting-standards.md) — 告警設計與管理
