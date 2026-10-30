---
name: observability
source: ../../../../skills/observability-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: 00f5ea242d6d
status: current
description: |
  引導可觀測性建置、指標設計與告警設定。
  Use when: 新服務的埋點、SLO 定義、告警設計、成熟度評估。
  Not for: 設定數值目標與 Error Budget 政策——請用 /slo；日誌格式與層級——請用 /logging-guide。
  Keywords: observability, metrics, traces, golden signals, alerting, SLO, 可觀測性, 指標, 追蹤, 告警.
allowed-tools: Read, Write, Grep, Glob
scope: universal
argument-hint: "[service name or observability topic | 服務名稱或可觀測性主題]"
---

# Observability Assistant | 可觀測性助手

> **語言**: [English](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/observability-assistant/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-06-19
**適用對象**: Claude Code Skills

> **核心規範**：本技能實作 [Observability Standards](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/observability-standards.md)。有關權威方法論（完整 Metrics/Traces 細節、取樣、OTel 整合），請參閱核心規範。

引導三支柱可觀測性實作：Logs、Metrics、Traces。

## Capabilities | 功能

| Capability | Description | 說明 |
|------------|-------------|------|
| **Instrumentation Check** | Pre-launch observability checklist | 上線前可觀測性檢查表 |
| **Maturity Assessment** | L0-L4 maturity self-evaluation | L0-L4 成熟度自評 |
| **Metric Design** | Help design metrics (type, naming, labels) | 協助設計 Metrics |
| **Alert Design** | Design SLO-based alerts with noise reduction | 設計 SLO-based 告警 |
| **Golden Signals** | Verify 4 golden signals coverage | 驗證四大黃金信號覆蓋 |

## Usage | 使用方式

```bash
/observability                        # Show observability guide
/observability --checklist            # Run instrumentation checklist
/observability --maturity             # Maturity assessment (L0-L4)
/observability --alerting             # Alert design guide
/observability "payment-service"      # Guide for specific service
```

## Three Pillars Framework | 三支柱框架

每個支柱都提供不同的視角；它們的威力在於彼此關聯。

| 支柱 | 擷取內容 | 使用時機 | 粒度 |
|------|----------|----------|------|
| **Logs** | 具備脈絡的離散事件 | 除錯、稽核軌跡、錯誤細節 | 高（每事件） |
| **Metrics** | 隨時間變化的數值量測 | 儀表板、告警、容量規劃 | 低（彙總） |
| **Traces** | 跨服務的請求流程 | 延遲分析、相依性對應 | 中（每請求） |

**關聯欄位**：`trace_id` 連結 Logs ↔ Traces ↔ Metrics（透過 Exemplars）；`service.name` 篩選所有三大支柱。工作流程：指標異常 → exemplar → trace → Logs 中的 `trace_id`。

## Golden Signals | 四大黃金信號

基於 Google SRE。每個服務在進入正式環境前都應（SHOULD）監控全部四項信號。

| 信號 | 度量方式 | Metric 範例 | 告警（SLO-based） |
|------|----------|-------------|-------------------|
| **Latency** | 透過 Histogram 測量 P50/P95/P99，區分成功／錯誤 | `http.server.request.duration.seconds` | P99 > X ms 持續 5 分鐘 |
| **Traffic** | 請求數／秒，依路由／方法劃分 | `http.server.request.total` (rate) | 下降 > 50% 或突增 > 200% |
| **Errors** | 錯誤數 / 總請求數 | `...request.total{status=~"5.."}` ÷ total | 錯誤率 > X% 持續 5 分鐘 |
| **Saturation** | CPU／記憶體／連線池／磁碟使用率 | `system.cpu.utilization` (Gauge) | 資源 > 80% 持續 10 分鐘 |

## Metric Types | Metric 型別

| 型別 | 行為 | 使用時機 |
|------|------|----------|
| **Counter** | 只增不減（重啟時重設） | 請求數、錯誤數、傳送位元組數 |
| **Gauge** | 時間點數值，可增可減 | 佇列深度、作用中連線數、記憶體 |
| **Histogram** | 跨區間／分桶的分佈 | 請求耗時、回應大小 |
| **Summary** | 客戶端計算的百分位數 | 舊版系統、無伺服器端彙總 |

**命名規範**：以 `snake_case` 表示的 `<domain>.<entity>.<action>.<unit>`（例如 `db.client.query.duration.seconds`）。**標籤基數（Label cardinality）**：將標籤保持在 ~1000 個不重複值以下——絕不要將 `user_id` / `request_id` / 原始 `url` / `ip` 用作標籤；請改將這些資訊記錄在 Logs 或 Traces 中。

## Maturity Model (L0–L4) | 成熟度模型

| 等級 | 名稱 | 特性 | 升級行動 |
|------|------|------|----------|
| **L0** | 無可觀測性 | 僅有 stdout/stderr；透過 SSH + `tail -f` 除錯 | 結構化日誌；集中化收集 |
| **L1** | 基礎日誌 | 結構化 JSON 日誌、集中化、可搜尋 | 加入業務指標；建立第一個儀表板 |
| **L2** | 指標驅動 | Logs + Metrics、儀表板、門檻值告警 | 啟用追蹤；SLO-based 告警 |
| **L3** | 完整可觀測性 | 三支柱 + 關聯 + SLO 告警 + 黃金信號 | 異常偵測；自動修復 |
| **L4** | 智慧化 | AIOps 異常偵測、預測性告警、自動修復 | 維護、最佳化、分享經驗 |

**自評檢查**：跨服務找出單一請求的日誌（L1+）→ 錯誤率與延遲的儀表板（L2+）→ 追蹤請求從入口→資料庫→返回（L3+）→ 在使用者回報前自動偵測異常（L4）。

## Instrumentation Checklist | 上線前檢查表

在將服務部署至正式環境之前：

- [ ] **結構化日誌（Structured logging）** — 包含 `trace_id` 關聯的 JSON
- [ ] **HTTP/gRPC 入口指標** — 每個端點的請求數、耗時長條圖（duration histogram）、錯誤率
- [ ] **業務維運指標** — 追蹤關鍵事件（訂單、付款）
- [ ] **分散式追蹤（Distributed tracing）** — span 傳遞、取樣率、W3C Trace Context 標頭
- [ ] **健康檢查** — 存活探針（liveness，是否運作中？）與就緒探針（readiness，是否可提供服務？）
- [ ] **黃金信號儀表板** — 將 Latency、Traffic、Errors、Saturation 視覺化
- [ ] **告警規則** — 至少具備 SLO 燃燒率（burn-rate）告警
- [ ] **日誌保留** — 依日誌層級設定保留政策
- [ ] **排除敏感資料** — 日誌／追蹤中不得包含密碼、token 或 PII

## Next Steps Guidance | 下一步引導

> **可觀測性引導完成。建議下一步：**
> - 執行 `/slo` 定義 SLI/SLO/Error Budget ⭐ **推薦**
> - 執行 `/incident` 設定事故回應流程
> - 執行 `/checkin` 提交變更

## Reference | 參考

- 詳細指南：[guide.md](./guide.md) — 日誌、指標、追蹤三大支柱的完整說明。要建立監控、挑選指標型別、導入追蹤或評估成熟度時讀它。
- 核心規範：[observability-standards.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/observability-standards.md)
- 核心規範：[alerting-standards.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/alerting-standards.md)
- 核心規範：[slo-standards.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/slo-standards.md)
