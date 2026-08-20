---
source: ../../../../skills/observability-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 760e3ec43846
status: current
scope: universal
description: |
  引導跨三大支柱的 observability 實作：Logs、Metrics 與 Traces。
  使用時機：建立監控、選擇 metric 類型、實作 tracing、評估成熟度。
  關鍵字：observability, metrics, traces, logs, golden signals, OpenTelemetry, 可觀測性, 監控。
---

# Observability Assistant

> **語言**：[English](../../../../skills/observability-assistant/guide.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-04-01
**適用範圍**：Claude Code Skills

---

## 用途

本 skill 透過提供三大支柱（Logs、Metrics、Traces）、metric 類型選擇、Golden Signals 監控與成熟度自我評估的指引，協助團隊建構可觀測的系統。

---

## 快速參考（YAML 壓縮版）

```yaml
# === THREE PILLARS 三大支柱 ===
three_pillars:
  logs:
    captures: "Discrete events with context / 帶上下文的離散事件"
    use_for: "Debugging, audit trails, error details"
    granularity: "High (per-event)"
  metrics:
    captures: "Numerical measurements over time / 隨時間變化的數值量測"
    use_for: "Dashboards, alerting, capacity planning"
    granularity: "Low (aggregated)"
  traces:
    captures: "Request flow across services / 跨服務的請求流"
    use_for: "Latency analysis, dependency mapping"
    granularity: "Medium (per-request)"

correlation:
  metric_to_trace: "Use Exemplars to link anomalous metric → specific trace"
  trace_to_logs: "Use trace_id + span_id embedded in logs"
  logs_to_metric: "Aggregate log patterns into metrics (e.g., error rate)"
  key_fields: ["trace_id", "service.name"]

# === METRIC TYPES 指標類型 ===
metric_types:
  counter:
    behavior: "Monotonically increasing (resets on restart) / 只增不減"
    examples: ["request count", "error count", "bytes sent"]
  gauge:
    behavior: "Point-in-time value, can go up or down / 當前值，可升可降"
    examples: ["temperature", "queue depth", "active connections"]
  histogram:
    behavior: "Distribution across buckets / 跨桶分布"
    examples: ["request duration", "response size"]
  summary:
    behavior: "Client-computed percentiles / 客戶端計算百分位"
    examples: ["legacy systems needing client-side quantiles"]

metric_type_decision:
  only_goes_up: "→ Counter"
  need_distribution: "→ Histogram"
  current_state_value: "→ Gauge"
  legacy_client_percentiles: "→ Summary"

naming: "<domain>.<entity>.<action>.<unit>"
# e.g., http.server.request.duration.seconds

# === GOLDEN SIGNALS 黃金信號 ===
golden_signals:
  latency:
    what: "Request duration P50/P95/P99 / 請求延遲"
    metric: "http.server.request.duration.seconds"
    alert: "P99 > threshold sustained 5 min"
  traffic:
    what: "Requests per second (RPS) / 每秒請求數"
    metric: "http.server.request.total (Counter, rate)"
    alert: "Sudden drop >50% or spike >200%"
  errors:
    what: "Error rate = 5xx / total / 錯誤率"
    metric: "http.server.request.total{status=~'5..'}"
    alert: "Error rate > X% sustained 5 min"
  saturation:
    what: "Resource utilization / 資源飽和度"
    metrics: ["system.cpu.utilization", "system.memory.utilization", "db.client.connection.pool.usage"]
    alert: "Resource > 80% sustained 10 min"

# === MATURITY MODEL 成熟度模型 ===
maturity:
  L0_no_observability:
    characteristics: "No structured logs; debugging via SSH + tail -f / 無結構化日誌"
    upgrade: "Implement structured logging; centralize collection"
  L1_basic_logging:
    characteristics: "Structured JSON logs; centralized; basic search / 結構化日誌+集中收集"
    upgrade: "Add business metrics; create first dashboard"
  L2_metrics_driven:
    characteristics: "Logs + Metrics; dashboards; basic alerting / 日誌+指標+儀表板"
    upgrade: "Enable distributed tracing; SLO-based alerting"
  L3_full_observability:
    characteristics: "All three pillars; correlation; SLO alerts; Golden Signals / 三支柱完整"
    upgrade: "Add anomaly detection; auto-remediation"
  L4_intelligent:
    characteristics: "AIOps; predictive alerting; automatic remediation / 智慧化可觀測"
    upgrade: "Maintain, optimize, share learnings"

self_assessment:
  - "Can you find logs for a specific request across all services? (L1+)"
  - "Can you view dashboards showing error rate and latency? (L2+)"
  - "Can you trace a request from ingress to database and back? (L3+)"
  - "Does your system auto-detect anomalies before users report? (L4)"

# === INSTRUMENTATION CHECKLIST 儀器化清單 ===
pre_production_checklist:
  - "Structured logging enabled (JSON + trace_id)"
  - "HTTP/gRPC entry metrics (count, duration histogram, error rate)"
  - "Critical business operation custom metrics"
  - "Distributed tracing enabled (sampling rate set, W3C headers)"
  - "Health check endpoints (liveness + readiness)"
  - "Dashboard covering Golden Signals"
  - "Alert rules defined (SLO burn rate)"
  - "Log retention configured"
  - "Sensitive data excluded from logs/traces"
```

---

## 與相關技能整合 / Integration with Related Skills

| Skill | 整合點 | 說明 |
|-------|-------------------|-------------|
| `/slo` | 以 SLO 為基礎的告警 | 以 metrics 作為 SLI 資料來源；burn rate 告警參照 Golden Signals |
| `/incident` | 事件診斷 | 三大支柱提供診斷資料；correlation 加速 MTTD/MTTR |
| `/observability --alerting` | 告警設計 | Golden Signals 引導告警規則建立 |

---

## 設定偵測

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 是否有「Disabled Skills」段落
2. 檢查 `CONTRIBUTING.md` 是否有「Observability Standards」段落
3. 若未找到，**預設採用標準 observability 實務**

---

## 詳細指引

完整標準請參閱：
- [Observability Standards](../../core/observability-standards.md)
- [Logging Standards](../../core/logging-standards.md)

---

## 相關標準

- [Observability Standards](../../core/observability-standards.md) - 核心標準
- [SLO Standards](../../core/slo-standards.md) - SLI/SLO/Error Budget
- [Alerting Standards](../../core/alerting-standards.md) - 告警設計
- [Performance Standards](../../core/performance-standards.md) - 效能目標
- [SLO Assistant](../slo-assistant/SKILL.md) - SLO 工作流程
- [Runbook Assistant](../runbook-assistant/SKILL.md) - 維運程序

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | 初版發布 |

---

## 授權

本 skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
