---
scope: universal
description: |
  Guide observability implementation across the three pillars: Logs, Metrics, and Traces.
  Use when: setting up monitoring, choosing metric types, implementing tracing, assessing maturity.
  Keywords: observability, metrics, traces, logs, golden signals, OpenTelemetry, 可觀測性, 監控.
---

# Observability Assistant

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/observability-assistant/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-01
**Applicability**: Claude Code Skills

---

## Purpose

This skill helps teams build observable systems by providing guidance on the three pillars (Logs, Metrics, Traces), metric type selection, Golden Signals monitoring, and maturity self-assessment.

---

## Quick Reference (YAML Compressed)

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

## Integration with Related Skills / 與相關技能整合

| Skill | Integration Point | Description |
|-------|-------------------|-------------|
| `/slo` | SLO-based alerting | Use metrics as SLI data source; burn rate alerts reference Golden Signals |
| `/incident` | Incident diagnosis | Three pillars provide diagnostic data; correlation speeds up MTTD/MTTR |
| `/observability --alerting` | Alert design | Golden Signals inform alert rule creation |

---

## Configuration Detection

### Detection Order

1. Check `CONTRIBUTING.md` for "Disabled Skills" section
2. Check `CONTRIBUTING.md` for "Observability Standards" section
3. If not found, **default to standard observability practices**

---

## Detailed Guidelines

For complete standards, see:
- [Observability Standards](../../core/observability-standards.md)
- [Logging Standards](../../core/logging-standards.md)

---

## Related Standards

- [Observability Standards](../../core/observability-standards.md) - Core standard
- [SLO Standards](../../core/slo-standards.md) - SLI/SLO/Error Budget
- [Alerting Standards](../../core/alerting-standards.md) - Alert design
- [Performance Standards](../../core/performance-standards.md) - Performance targets
- [SLO Assistant](../slo-assistant/SKILL.md) - SLO workflow
- [Runbook Assistant](../runbook-assistant/SKILL.md) - Operational procedures

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
