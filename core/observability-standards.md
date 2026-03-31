# Observability Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/observability-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: OpenTelemetry, W3C Trace Context, Google SRE (Golden Signals)
**References**: [opentelemetry.io](https://opentelemetry.io/), [sre.google](https://sre.google/)

---

## Overview

This document defines observability standards for building observable systems across the three pillars: **Logs**, **Metrics**, and **Traces**. It complements the existing [Logging Standards](logging-standards.md) by adding comprehensive Metrics and Traces guidance, a unified correlation framework, and operational checklists.

For complete Logs guidance including structured logging, log levels, sensitive data handling, and OpenTelemetry integration, see [Logging Standards](logging-standards.md).

---

## Three Pillars Framework

Modern observability relies on three complementary pillars, each providing a different lens into system behavior:

```
┌──────────┐    trace_id     ┌──────────┐    trace_id     ┌──────────┐
│   LOGS   │◄───────────────►│  TRACES  │◄───────────────►│ METRICS  │
│ (Events) │                 │  (Spans) │                 │(Counters)│
└──────────┘                 └──────────┘                 └──────────┘
     │                            │                            │
     └────────── service.name ────┴──────── service.name ──────┘
```

| Pillar | What It Captures | When to Use | Granularity |
|--------|-----------------|-------------|-------------|
| **Logs** | Discrete events with context | Debugging, audit trails, error details | High (per-event) |
| **Metrics** | Numerical measurements over time | Dashboards, alerting, capacity planning | Low (aggregated) |
| **Traces** | Request flow across services | Latency analysis, dependency mapping | Medium (per-request) |

### Correlation Across Pillars

The power of observability comes from correlating across pillars:

1. **Metric anomaly → Trace**: Use Exemplars on metrics to link to specific traces that exhibit the anomalous behavior
2. **Trace → Logs**: Use `trace_id` and `span_id` embedded in logs to find all log entries for a specific request
3. **Logs → Metric**: Aggregate log patterns into metrics (e.g., error rate from error logs)

**Key correlation fields:**
- `trace_id` — links Logs ↔ Traces ↔ Metrics (via Exemplars)
- `service.name` — filters all three pillars by service identity

---

## Metrics

### Metric Types

Choose the appropriate metric type based on what you need to measure:

| Type | Purpose | Behavior | Use When |
|------|---------|----------|----------|
| **Counter** | Monotonically increasing count | Only goes up (resets on restart) | Request count, error count, bytes sent |
| **Gauge** | Point-in-time value (can go up or down) | Represents current state | Temperature, queue depth, active connections |
| **Histogram** | Distribution of values across buckets | Records value in pre-defined buckets | Request duration, response size |
| **Summary** | Client-computed percentiles | Calculates quantiles on client side | Legacy systems, when server-side aggregation not needed |

**Decision guide:**
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

### Naming Conventions

Follow the pattern: `<domain>.<entity>.<action>.<unit>`

| Component | Description | Examples |
|-----------|-------------|---------|
| `domain` | System area | `http`, `db`, `queue`, `system` |
| `entity` | Resource type | `server`, `client`, `connection` |
| `action` | What's measured | `request`, `query`, `usage` |
| `unit` | Measurement unit | `seconds`, `bytes`, `total` |

**Examples:**
- `http.server.request.duration.seconds` — HTTP server request duration
- `http.server.request.total` — Total HTTP requests (Counter)
- `db.client.query.duration.seconds` — Database query duration
- `system.memory.usage.bytes` — Memory usage (Gauge)
- `queue.consumer.lag.messages` — Consumer lag in messages

**Rules:**
- Use `snake_case` for multi-word components
- Always include unit suffix for Gauges and Histograms
- Use `.total` suffix for Counters
- Avoid abbreviations (use `request` not `req`)

### Label Best Practices

Labels (also called tags or attributes) add dimensions to metrics.

**Do:**
- Use labels with bounded, low-cardinality values
- Common labels: `method`, `status_code`, `service`, `environment`
- Keep label sets consistent across related metrics

**Don't — High Cardinality Prevention:**

> ⚠️ **Warning**: Labels with cardinality exceeding **1000 unique values** cause excessive memory usage and storage costs. High-cardinality data (user IDs, request IDs, IP addresses) should be recorded in **Logs or Traces**, not as metric labels.

| Bad (High Cardinality) | Good (Low Cardinality) |
|------------------------|----------------------|
| `user_id="usr_12345"` | Use Logs with `user_id` field |
| `request_id="req_abc"` | Use Traces with `span_id` |
| `url="/api/users/12345"` | `route="/api/users/{id}"` |
| `ip="192.168.1.100"` | `region="us-east-1"` |

---

## Traces

### Span Design Principles

A span represents a single unit of work within a trace.

**Naming:**
- Use descriptive names: `db.query.users.findById`, `http.server.POST./api/orders`
- Include the operation type and target
- Avoid generic names like `doWork` or `process`

**Required Span Attributes:**
| Attribute | Description | Example |
|-----------|-------------|---------|
| `service.name` | Service identity | `payment-service` |
| `span.kind` | Client/Server/Internal | `SERVER` |
| Operation-specific | Depends on operation type | `http.method=POST` |

**Granularity Guidance:**
- **Too coarse**: One span for entire request processing → no visibility into bottlenecks
- **Too fine**: One span per function call → excessive overhead and noise
- **Just right**: One span per significant I/O operation or business step

**Rule of thumb:** Create a span when:
1. Crossing a network boundary (HTTP call, DB query, message send)
2. A business-significant step occurs (order created, payment processed)
3. A potentially slow operation happens (file I/O, computation > 10ms)

### Sampling Strategies

Production traces can generate enormous volumes. Use sampling to control costs while retaining observability.

| Strategy | How It Works | Pros | Cons | Use When |
|----------|-------------|------|------|----------|
| **Head-based** | Decision at trace start (e.g., 10% sample rate) | Simple, low overhead, predictable cost | May miss important traces (errors, slow) | High-traffic services, cost-sensitive |
| **Tail-based** | Decision after trace completes (keep errors/slow) | Retains anomalies, captures important traces | Requires buffering, higher resource usage | Error detection, performance analysis |
| **Adaptive** | Dynamic rate based on traffic volume | Handles traffic spikes, balanced cost | Complex to implement and tune | Services with variable traffic patterns |

**Recommendations:**
- Start with head-based sampling (1-10%) for most services
- Add tail-based sampling for critical paths where errors must be captured
- Consider adaptive sampling for services with traffic > 10K RPS

### Performance Overhead Control

Tracing adds overhead. Keep it manageable:

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| CPU overhead | < 2% | Reduce sampling rate |
| Memory overhead | < 50MB | Reduce span attribute count |
| Network overhead | < 1% of traffic | Batch export, compress |
| Latency impact | < 1ms per span | Use async export |

### Cross-Service Propagation

For distributed systems, propagate trace context using W3C Trace Context standard:

**W3C Trace Context Headers:**
```
traceparent: 00-<trace_id>-<span_id>-<flags>
tracestate: <vendor>=<value>
```

**Propagation across boundaries:**
- **HTTP**: `traceparent` and `tracestate` headers
- **gRPC**: Metadata keys
- **Message queues**: Message headers/attributes
- **Async jobs**: Store in job metadata

---

## Golden Signals Checklist

Based on Google SRE's Four Golden Signals, every service SHOULD monitor these before going to production:

### Latency

| Aspect | Measurement | Recommended Metric |
|--------|------------|-------------------|
| Request duration | P50, P95, P99 percentiles using Histogram | `http.server.request.duration.seconds` |
| Successful vs failed | Separate latency for success/error responses | Add `status` label |
| Alerting threshold | P99 > X ms sustained for 5 min | Based on SLO target |

### Traffic

| Aspect | Measurement | Recommended Metric |
|--------|------------|-------------------|
| Request volume | Requests per second (RPS) | `http.server.request.total` (Counter, rate) |
| By endpoint | Breakdown by route/method | Add `route`, `method` labels |
| Alerting threshold | Sudden drop > 50% or spike > 200% | Compared to same time last week |

### Errors

| Aspect | Measurement | Recommended Metric |
|--------|------------|-------------------|
| Error rate | Errors / Total requests (percentage) | `http.server.request.total{status=~"5.."}` / `http.server.request.total` |
| By type | Breakdown by error code/class | Add `status_code`, `error_type` labels |
| Alerting threshold | Error rate > X% sustained for 5 min | Based on SLO target |

### Saturation

| Aspect | Measurement | Recommended Metric |
|--------|------------|-------------------|
| CPU utilization | Percentage of available CPU | `system.cpu.utilization` (Gauge) |
| Memory utilization | Percentage of available memory | `system.memory.utilization` (Gauge) |
| Connection pool | Active / Max connections | `db.client.connection.pool.usage` (Gauge) |
| Disk I/O | Read/write throughput and queue depth | `system.disk.io` (Counter) |
| Alerting threshold | Resource > 80% sustained for 10 min | Pre-saturation warning |

---

## Observability Maturity Model

Use this model to assess your team's current observability level and plan improvements:

| Level | Name | Characteristics | Upgrade Actions |
|-------|------|----------------|-----------------|
| **L0** | No Observability | No structured logs; only stdout/stderr; debugging via SSH and `tail -f` | Implement structured logging; centralize log collection |
| **L1** | Basic Logging | Structured Logs with JSON format; centralized collection; basic search capability | Add key business metrics; create first dashboard |
| **L2** | Metrics-Driven | Logs + Metrics in place; dashboards for key services; basic alerting on thresholds | Enable distributed tracing; implement SLO-based alerting |
| **L3** | Full Observability | All three pillars operational; correlation queries work; SLO-based alerting; Golden Signals monitored | Add anomaly detection; implement auto-remediation for known issues |
| **L4** | Intelligent Observability | AIOps anomaly detection; predictive alerting; automatic remediation; continuous optimization | Maintain and optimize; share learnings across organization |

**Self-Assessment Questions:**
1. Can you find logs for a specific request across all services? (L1+)
2. Can you view dashboards showing current error rate and latency? (L2+)
3. Can you trace a request from ingress to database and back? (L3+)
4. Does your system auto-detect anomalies before users report them? (L4)

---

## Instrumentation Checklist

Before deploying a service to production, verify the following items:

- [ ] **Structured logging enabled** — JSON format with `trace_id` correlation (see [Logging Standards](logging-standards.md))
- [ ] **HTTP/gRPC entry metrics** — Request count, duration histogram, and error rate for all endpoints
- [ ] **Critical business operation custom metrics** — Key business events tracked (orders placed, payments processed)
- [ ] **Distributed tracing enabled** — Span propagation configured, sampling rate set, W3C Trace Context headers supported
- [ ] **Health check endpoints** — Liveness probe (is process running?) and readiness probe (can it serve traffic?) implemented
- [ ] **Dashboard covering Golden Signals** — At least Latency, Traffic, Errors, and Saturation visualized
- [ ] **Alert rules defined** — At minimum, SLO burn rate alerts configured (see [Alerting Standards](alerting-standards.md))
- [ ] **Log retention configured** — Retention policies set per log level
- [ ] **Sensitive data excluded** — No passwords, tokens, or PII in logs/traces

---

## OpenTelemetry Integration

OpenTelemetry (OTel) is the recommended instrumentation framework. For detailed OTel semantic conventions and integration patterns, see the [Logging Standards — OpenTelemetry Integration](logging-standards.md#opentelemetry-integration) section.

Key points:
- Use OTel SDKs for auto-instrumentation where available
- Follow OTel semantic conventions for attribute naming
- Export to OTel Collector for vendor-neutral data pipeline

---

## Quick Reference Card

### Metric Type Selection
```
Only goes up?        → Counter
Goes up and down?    → Gauge
Need distribution?   → Histogram
Client percentiles?  → Summary
```

### Sampling Strategy Selection
```
High traffic, cost-sensitive?     → Head-based (1-10%)
Must capture all errors?          → Tail-based
Traffic varies widely?            → Adaptive
```

### Maturity Level Quick Check
```
No structured logs?               → L0
Structured logs, centralized?     → L1
Logs + Metrics + Dashboards?      → L2
All three pillars + SLO alerts?   → L3
AIOps + Auto-remediation?         → L4
```

---

## References

- [OpenTelemetry Specification](https://opentelemetry.io/docs/specs/otel/) — Industry standard for observability instrumentation
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) — Standardized attribute naming
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — Distributed tracing context propagation
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) — Golden Signals origin
- [Google SRE — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — Multi-window burn rate alerting

---

**Related Standards:**
- [Logging Standards](logging-standards.md) — Complete Logs pillar guidance
- [SLO Standards](slo-standards.md) — SLI/SLO/Error Budget definitions
- [Alerting Standards](alerting-standards.md) — Alert design and management
- [Performance Standards](performance-standards.md) — Performance targets and benchmarks

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | Initial release: Metrics, Traces, Golden Signals, Maturity Model, Instrumentation Checklist |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
