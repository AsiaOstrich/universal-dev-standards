---
name: observability
scope: universal
anchor_standard: observability-standards
description: |
  Guide observability setup, metrics design, and alerting configuration.
  Use when: new service instrumentation, SLO definition, alert design, maturity assessment.
  Keywords: observability, metrics, traces, golden signals, alerting, SLO.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[service name or observability topic | 服務名稱或可觀測性主題]"
---

# Observability Assistant | 可觀測性助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/observability-assistant/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-06-19
**Applicability**: Claude Code Skills

> **Core Standard**: This skill implements [Observability Standards](../../core/observability-standards.md). For the authoritative methodology (full Metrics/Traces detail, sampling, OTel integration), refer to the core standard.

Guide observability implementation across the three pillars: Logs, Metrics, and Traces.

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

Each pillar gives a different lens; their power is in correlation.

| Pillar | What It Captures | When to Use | Granularity |
|--------|-----------------|-------------|-------------|
| **Logs** | Discrete events with context | Debugging, audit trails, error details | High (per-event) |
| **Metrics** | Numerical measurements over time | Dashboards, alerting, capacity planning | Low (aggregated) |
| **Traces** | Request flow across services | Latency analysis, dependency mapping | Medium (per-request) |

**Correlation fields**: `trace_id` links Logs ↔ Traces ↔ Metrics (via Exemplars);
`service.name` filters all three pillars. Workflow: metric anomaly → exemplar →
trace → `trace_id` in logs.

## Golden Signals | 四大黃金信號

Based on Google SRE. Every service SHOULD monitor all four before production.

| Signal | Measure | Example Metric | Alert (SLO-based) |
|--------|---------|----------------|-------------------|
| **Latency** | P50/P95/P99 via Histogram, split success/error | `http.server.request.duration.seconds` | P99 > X ms for 5 min |
| **Traffic** | Requests/sec, by route/method | `http.server.request.total` (rate) | drop > 50% or spike > 200% |
| **Errors** | errors / total requests | `...request.total{status=~"5.."}` ÷ total | error rate > X% for 5 min |
| **Saturation** | CPU/mem/pool/disk utilization | `system.cpu.utilization` (Gauge) | resource > 80% for 10 min |

## Metric Types | Metric 型別

| Type | Behavior | Use When |
|------|----------|----------|
| **Counter** | Only goes up (resets on restart) | request count, error count, bytes sent |
| **Gauge** | Point-in-time, up/down | queue depth, active connections, memory |
| **Histogram** | Distribution across buckets | request duration, response size |
| **Summary** | Client-computed percentiles | legacy, no server-side aggregation |

**Naming**: `<domain>.<entity>.<action>.<unit>` in `snake_case` (e.g.
`db.client.query.duration.seconds`). **Label cardinality**: keep labels under
~1000 unique values — never use `user_id` / `request_id` / raw `url` / `ip` as
labels; record those in Logs or Traces instead.

## Maturity Model (L0–L4) | 成熟度模型

| Level | Name | Characteristics | Upgrade Action |
|-------|------|-----------------|----------------|
| **L0** | No Observability | only stdout/stderr; debug via SSH + `tail -f` | structured logging; centralize collection |
| **L1** | Basic Logging | structured JSON logs, centralized, searchable | add business metrics; first dashboard |
| **L2** | Metrics-Driven | Logs + Metrics, dashboards, threshold alerts | enable tracing; SLO-based alerting |
| **L3** | Full Observability | three pillars + correlation + SLO alerts + Golden Signals | anomaly detection; auto-remediation |
| **L4** | Intelligent | AIOps anomaly detection, predictive alerts, auto-remediation | maintain, optimize, share learnings |

**Self-check**: find logs for one request across services (L1+) → dashboards of
error rate & latency (L2+) → trace request ingress→DB→back (L3+) → auto-detect
anomalies before users report (L4).

## Instrumentation Checklist | 上線前檢查表

Before deploying a service to production:

- [ ] **Structured logging** — JSON with `trace_id` correlation
- [ ] **HTTP/gRPC entry metrics** — request count, duration histogram, error rate per endpoint
- [ ] **Business operation metrics** — key events tracked (orders, payments)
- [ ] **Distributed tracing** — span propagation, sampling rate, W3C Trace Context headers
- [ ] **Health checks** — liveness (running?) and readiness (can serve?) probes
- [ ] **Golden Signals dashboard** — Latency, Traffic, Errors, Saturation visualized
- [ ] **Alert rules** — at minimum SLO burn-rate alerts
- [ ] **Log retention** — policies set per log level
- [ ] **Sensitive data excluded** — no passwords, tokens, or PII in logs/traces

## Next Steps Guidance | 下一步引導

> **可觀測性引導完成。建議下一步：**
> - 執行 `/slo` 定義 SLI/SLO/Error Budget ⭐ **推薦**
> - 執行 `/incident` 設定事故回應流程
> - 執行 `/checkin` 提交變更

## Reference | 參考

- Core standard: [observability-standards.md](../../core/observability-standards.md)
- Core standard: [alerting-standards.md](../../core/alerting-standards.md)
- Core standard: [slo-standards.md](../../core/slo-standards.md)
