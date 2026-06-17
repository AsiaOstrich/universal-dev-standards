# Logging Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/logging-standards.md)

**Version**: 1.4.0
**Last Updated**: 2026-06-17
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: RFC 5424, OpenTelemetry, W3C Trace Context
**References**: [opentelemetry.io](https://opentelemetry.io/)

---

## Overview

This document defines logging standards for consistent, structured, and actionable application logs across all environments.

## Mandatory Events

> **Closes** UDS issue [#108](https://github.com/AsiaOstrich/universal-dev-standards/issues/108) (XSPEC-234). The rest of this standard defines **how** to write a log entry (level / fields / PII mask / rotation). This section defines **when you MUST write one** — excluding "compliant on paper but materially silent" logging.

Logging that follows every formatting rule but **never fires at the moment that matters** is worse than useless: it gives false confidence during an incident. The events below are the canonical moments where a log entry is **mandatory**. Each declares `when` / `must_log` / `must_NOT_log` / `level` / `rationale`.

### Why this exists (real incidents)

A PHP→.NET migration burned 2 days diagnosing "send failed, no log", because **four layers were all silent**:

1. **Load-balancer marks backend DOWN** (503) on health-probe timeout — backend logged only probe noise, zero business events.
2. **Framework validation reject** (e.g. ModelState / DTO 501) — the rejecting framework returned before any handler ran, so the **payload was never logged**.
3. **Auth failure** logged only "Account or password error" — **no uid, no source IP** → un-investigable.
4. **Background worker alive but log file 0 bytes** — no mechanism detected the silence.

None of these were caught by the formatting rules alone. Mandatory events close that gap.

### Catalog (9 canonical events)

| id | when | level | Core required fields (`must_log`) | `must_NOT_log` |
|----|------|-------|-----------------------------------|----------------|
| `application_startup` | After process boot, **before** accepting requests | INFO | app_name, version, git_sha, environment, hostname, pid, listening_endpoints | secrets, full connection strings |
| `request_received` | First time HTTP middleware sees a request | INFO / DEBUG | method, path, source_ip, request_id | request body, auth headers |
| `validation_failure` | schema / ModelState / DTO validation rejects | WARN | request_id, path, missing_fields[], payload_shape (keys only) | field **values**, PII |
| `authentication_failure` | login / token verification fails | WARN | uid (attempted), source_ip, failure_reason | password, token value |
| `outbound_call_start` | An outbound HTTP/RPC call is initiated | INFO | target_url (host+path), request_id propagated, timeout_ms | credentials, bearer tokens |
| `outbound_call_complete` | An external call returns or fails | INFO / WARN / ERROR | status_code **or** failure_phase (dns/tcp/tls/http), elapsed_ms, retries | response body with PII |
| `business_event` | A state-changing business operation completes | INFO | operation_name, actor, target ids, outcome | full record payload, PII |
| `heartbeat` | Long-running background service, ≥ 1× / 60 s | INFO | service_name, queue_depth, items_processed_since_last_heartbeat | — |
| `shutdown` | Process exits (graceful or fatal) | INFO / ERROR | app_name, signal/reason, uptime_seconds, pending_work_count | — |

Each event's `rationale` ties back to a real failure mode: `validation_failure` ⇒ incident #2 (un-logged payload); `authentication_failure` field requirements ⇒ incident #3 (no uid/IP); `heartbeat` + silence detection ⇒ incident #4 (0-byte log); `application_startup`/`shutdown` ⇒ lifecycle blind spots; `outbound_call_*` ⇒ "send failed" with no trace of the call.

### Scenarios

#### Scenario: Validation failure must produce a log

- **GIVEN** an API endpoint receives a payload missing a `[Required]` field
- **WHEN** the framework auto-rejects (e.g. 400/501) before the handler runs
- **THEN** a WARN log MUST be written with `request_id`, `path`, `missing_fields[]`, `payload_shape` (keys only)
- **AND** a post-mortem can reconstruct the failure cause directly from the log

#### Scenario: Background service must heartbeat

- **GIVEN** a worker process is running
- **WHEN** no INFO/WARN/ERROR is written within 60 s
- **THEN** a `heartbeat` log MUST be written with current queue depth and items processed
- **AND** if no heartbeat appears for ≥ 2× the interval (≥ 120 s), the silence detector MUST alert

### Compliant startup log example

```json
{
  "timestamp": "2026-06-17T08:00:00.000Z",
  "level": "INFO",
  "message": "application_startup",
  "event": "application_startup",
  "app_name": "payment-service",
  "version": "2.3.1",
  "git_sha": "a1b2c3d",
  "environment": "production",
  "hostname": "pod-abc123",
  "pid": 4711,
  "listening_endpoints": ["0.0.0.0:8080", "0.0.0.0:9090/metrics"]
}
```

### Follow-on rules

1. **Access-log separation** — health-probe / liveness traffic MUST NOT pollute the business-event log. Route probes to a separate sink/file so they cannot drown out or rotate away business events (see incident #1).
2. **Log-silence detection SLA** — a service SHOULD alert after N minutes with no events, with N ≤ 2× the `heartbeat` interval. Absence of expected logs is itself an alertable condition (see the "Absence of Expected Logs" alert pattern below).
3. **OPS-facing log discoverability** — error responses returned to the client SHOULD carry the `request_id`, so support can correlate a user-reported failure to backend logs without round-trips for log access.

> **Cross-ref**: `heartbeat` / silence detection complement the [Log File Rotation Policy](#log-file-rotation-policy) (a 0-byte / silently-dropping log is the same blind spot from two directions) and migration-assistant's Background Job / Side-Effect Completeness (these events are the observable "has-fired" evidence).

## Log Levels

### Standard Log Levels

| Level | Code | When to Use | Production |
|-------|------|-------------|------------|
| TRACE | 10 | Very detailed debugging info | Off |
| DEBUG | 20 | Detailed debugging info | Off |
| INFO | 30 | Normal operation events | On |
| WARN | 40 | Potential issues, recoverable errors | On |
| ERROR | 50 | Errors that need attention | On |
| FATAL | 60 | Critical failures, app termination | On |

### Level Selection Guide

**TRACE**: Use for very detailed diagnostic output
- Function entry/exit
- Loop iterations
- Variable values during debugging

**DEBUG**: Use for diagnostic information
- State changes
- Configuration values
- Query parameters

**INFO**: Use for normal operational events
- Application startup/shutdown
- User actions completed
- Scheduled tasks executed
- External service calls completed

**WARN**: Use for potential issues
- Deprecated API usage
- Retry attempts
- Resource approaching limits
- Fallback behavior triggered

**ERROR**: Use for errors that need attention
- Failed operations that need investigation
- Caught exceptions with impact
- Integration failures
- Data validation failures

**FATAL**: Use for critical failures
- Unrecoverable errors
- Startup failures
- Loss of critical resources

## Structured Logging

### Required Fields

All log entries should include:

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "User login successful",
  "service": "auth-service",
  "environment": "production"
}
```

### Recommended Fields

Add context-specific fields:

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "User login successful",
  "service": "auth-service",
  "environment": "production",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "usr_12345",
  "request_id": "req_67890",
  "duration_ms": 150,
  "http_method": "POST",
  "http_path": "/api/v1/login",
  "http_status": 200
}
```

### Field Naming Conventions

- Use `snake_case` for field names
- Use consistent names across services
- Prefix with domain: `http_`, `db_`, `queue_`

| Domain | Common Fields |
|--------|---------------|
| HTTP | http_method, http_path, http_status, http_duration_ms |
| Database | db_query_type, db_table, db_duration_ms, db_rows_affected |
| Queue | queue_name, queue_message_id, queue_delay_ms |
| User | user_id, user_role, user_action |
| Request | request_id, trace_id, span_id |

## Sensitive Data Handling

### Never Log

- Passwords or secrets
- API keys or tokens
- Credit card numbers
- Social security numbers
- Authentication tokens (full)

### Mask or Redact

```javascript
// Bad
logger.info('Login attempt', { password: userPassword });

// Good
logger.info('Login attempt', { password: '***REDACTED***' });

// Good - mask partial
logger.info('Card processed', { last_four: '4242' });
```

### PII Handling

- Log user IDs, not email addresses when possible
- Use hashed identifiers for sensitive lookups
- Configure data retention policies

## Log Format Standards

### JSON Format (Recommended for Production)

```json
{"timestamp":"2025-01-15T10:30:00.123Z","level":"INFO","message":"Request completed","request_id":"req_123","duration_ms":45}
```

### Human-Readable Format (Development)

```
2025-01-15T10:30:00.123Z [INFO] Request completed request_id=req_123 duration_ms=45
```

### Multi-line Messages

For stack traces or large payloads:
- Keep the main log entry on one line
- Include stack traces in a `stack` field
- Truncate large payloads with `...(truncated)`

## Error Logging

### Required Error Fields

```json
{
  "level": "ERROR",
  "message": "Database connection failed",
  "error_type": "ConnectionError",
  "error_message": "Connection refused",
  "error_code": "ECONNREFUSED",
  "stack": "Error: Connection refused\n    at connect (/app/db.js:45:11)..."
}
```

### Error Context

Always include:
- What operation was attempted
- Relevant identifiers (user_id, request_id)
- Input parameters (sanitized)
- Retry count if applicable

```javascript
logger.error('Failed to process order', {
  error_type: err.name,
  error_message: err.message,
  order_id: orderId,
  user_id: userId,
  retry_count: 2,
  stack: err.stack
});
```

## Correlation and Tracing

### Request Correlation

Use `request_id` to correlate all logs within a single request:

```javascript
// Middleware sets request_id
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || generateId();
  res.setHeader('x-request-id', req.requestId);
  next();
});

// All subsequent logs include it
logger.info('Processing request', { request_id: req.requestId });
```

### Distributed Tracing

For microservices, include:
- `trace_id`: Unique ID for the entire request flow
- `span_id`: ID for this specific operation
- `parent_span_id`: ID of the calling operation

---

## OpenTelemetry Integration

### Semantic Conventions

OpenTelemetry defines standardized attribute names for consistent observability. Follow these conventions for cross-tool interoperability.

**Resource Attributes** (service identity):

| Attribute | Description | Example |
|-----------|-------------|---------|
| `service.name` | Logical service name | `payment-service` |
| `service.version` | Service version | `2.3.1` |
| `service.instance.id` | Unique instance identifier | `pod-abc123` |
| `deployment.environment` | Environment name | `production` |

**HTTP Attributes**:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `http.request.method` | HTTP method | `POST` |
| `http.route` | Route pattern | `/api/v1/users/{id}` |
| `http.response.status_code` | Response status | `200` |
| `url.path` | Request path | `/api/v1/users/123` |
| `server.address` | Server hostname | `api.example.com` |

**Database Attributes**:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `db.system` | Database type | `postgresql` |
| `db.name` | Database name | `orders_db` |
| `db.operation` | Operation type | `SELECT` |
| `db.statement` | Sanitized query | `SELECT * FROM users WHERE id = ?` |

**Example Structured Log with OTel Conventions**:

```json
{
  "timestamp": "2026-01-15T10:30:00.123Z",
  "severity": "INFO",
  "body": "Order created successfully",
  "resource": {
    "service.name": "order-service",
    "service.version": "1.5.0",
    "deployment.environment": "production"
  },
  "attributes": {
    "trace_id": "abc123def456",
    "span_id": "span789",
    "http.request.method": "POST",
    "http.route": "/api/v1/orders",
    "http.response.status_code": 201,
    "order.id": "ORD-12345",
    "user.id": "usr-67890"
  }
}
```

### Log Severity Mapping

Map traditional log levels to OpenTelemetry severity:

| Traditional | OTel Severity | OTel Number |
|-------------|---------------|-------------|
| TRACE | TRACE | 1-4 |
| DEBUG | DEBUG | 5-8 |
| INFO | INFO | 9-12 |
| WARN | WARN | 13-16 |
| ERROR | ERROR | 17-20 |
| FATAL | FATAL | 21-24 |

---

## Observability Three Pillars Integration

### Logs, Metrics, and Traces Correlation

Modern observability requires correlating the three pillars through shared identifiers.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Observability Three Pillars                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    trace_id    ┌──────────┐    trace_id    ┌──────────┐
│   │  LOGS    │◄──────────────►│  TRACES  │◄──────────────►│ METRICS  │
│   │ (Events) │                │ (Spans)  │                │(Counters)│
│   └──────────┘                └──────────┘                └──────────┘
│        │                           │                           │
│        │     Correlation Keys      │                           │
│        │  ┌─────────────────────┐ │                           │
│        └──┤ trace_id, span_id,  ├──┘                           │
│           │ service.name        │──────────────────────────────┘
│           └─────────────────────┘
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Pattern

**Step 1: Extract Context from Incoming Requests**

```javascript
// Middleware extracts trace context from headers
app.use((req, res, next) => {
  const traceId = req.headers['traceparent']?.split('-')[1] || generateTraceId();
  const spanId = generateSpanId();

  req.traceContext = { traceId, spanId };

  // Store in async local storage for automatic propagation
  asyncLocalStorage.run({ traceId, spanId }, () => next());
});
```

**Step 2: Emit Correlated Logs**

```javascript
logger.info('Processing order', {
  trace_id: context.traceId,
  span_id: context.spanId,
  order_id: orderId
});
```

**Step 3: Record Metrics with Exemplars**

```javascript
// Exemplars link metrics to specific traces
orderCounter.add(1, {
  'status': 'success'
}, {
  traceId: context.traceId,
  spanId: context.spanId
});
```

**Step 4: Query Across Pillars**

```
// In Grafana: Jump from metric spike to related traces
// In Jaeger: View logs associated with a trace
// In Loki: Find traces for specific log patterns
```

### Correlation Best Practices

| Practice | Benefit |
|----------|---------|
| Always include `trace_id` in logs | Jump from log to full trace |
| Add `trace_id` as metric exemplar | Investigate metric anomalies |
| Use consistent `service.name` | Filter across all pillars |
| Propagate context across async boundaries | Maintain correlation in async ops |

---

## Log-based Alerting

### Alert Design Principles

**1. Avoid Alert Storms**

```yaml
# Bad: Alert on every error
- alert: ErrorOccurred
  expr: log_errors_total > 0  # ❌ Too noisy

# Good: Alert on error rate increase
- alert: ErrorRateHigh
  expr: rate(log_errors_total[5m]) > 0.01  # ✅ Rate-based
  for: 5m
  annotations:
    summary: "Error rate exceeds 1% over 5 minutes"
```

**2. Group Related Alerts**

```yaml
# Group by service and error type
group_by: ['service', 'error_type']
group_wait: 30s
group_interval: 5m
```

**3. Include Actionable Context**

```yaml
annotations:
  summary: "{{ $labels.service }} error rate high"
  description: "Error rate {{ $value | printf \"%.2f\" }}% in last 5m"
  runbook_url: "https://wiki.example.com/runbooks/error-rate-high"
  dashboard_url: "https://grafana.example.com/d/service-errors"
```

### Alert Severity Guidelines

| Severity | Response Time | Example Conditions |
|----------|---------------|-------------------|
| Critical | Immediate (page) | Service down, data loss risk |
| Warning | Within hours | Error rate elevated, resource 80% |
| Info | Next business day | Deprecation warnings, minor anomalies |

### Log-based Alert Patterns

**Pattern 1: Error Rate Threshold**

```promql
# Alert when error rate exceeds threshold
sum(rate(log_messages_total{level="error"}[5m])) by (service)
/
sum(rate(log_messages_total[5m])) by (service) > 0.05
```

**Pattern 2: Absence of Expected Logs**

```promql
# Alert when heartbeat logs missing
absent(log_messages_total{message=~".*heartbeat.*"}[5m])
```

**Pattern 3: Specific Error Patterns**

```promql
# Alert on specific error codes
sum(rate(log_messages_total{error_code=~"DB_.*"}[5m])) > 10
```

### De-duplication Strategies

| Strategy | Implementation | Use Case |
|----------|----------------|----------|
| Time-based | Ignore same alert within N minutes | Flapping alerts |
| Fingerprint | Hash of alert labels | Identical alerts |
| Dependency | Suppress child alerts when parent fires | Cascading failures |

---

## Advanced Correlation Patterns

### Cross-Service Correlation ID

Propagate correlation context across service boundaries:

**HTTP Header Propagation**:

```
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  Service A    │────────►│  Service B    │────────►│  Service C    │
│               │         │               │         │               │
│ trace_id: abc │         │ trace_id: abc │         │ trace_id: abc │
│ span_id: 001  │         │ span_id: 002  │         │ span_id: 003  │
│               │         │ parent: 001   │         │ parent: 002   │
└───────────────┘         └───────────────┘         └───────────────┘
        │                         │                         │
        ▼                         ▼                         ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  Centralized Log Storage                     │
   │  Query: trace_id="abc" → Returns logs from all 3 services   │
   └─────────────────────────────────────────────────────────────┘
```

**W3C Trace Context Headers**:

```http
traceparent: 00-abc123def456-span789-01
tracestate: vendor=value
```

**Message Queue Propagation**:

```json
{
  "headers": {
    "traceparent": "00-abc123-def456-01"
  },
  "body": {
    "order_id": "ORD-123",
    "action": "process"
  }
}
```

### Async Operation Correlation

For background jobs and async operations:

```javascript
// When enqueueing job
const job = {
  data: { orderId: 123 },
  metadata: {
    trace_id: currentContext.traceId,
    correlation_id: generateCorrelationId(),
    enqueued_at: new Date().toISOString()
  }
};

// When processing job
logger.info('Processing background job', {
  trace_id: job.metadata.trace_id,
  correlation_id: job.metadata.correlation_id,
  job_type: 'order_processing',
  queue_time_ms: Date.now() - new Date(job.metadata.enqueued_at)
});
```

### Business Transaction Correlation

For multi-step business processes:

```json
{
  "timestamp": "2026-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Order payment completed",
  "trace_id": "abc123",
  "business_correlation": {
    "transaction_id": "TXN-789",
    "order_id": "ORD-456",
    "customer_id": "CUST-123",
    "flow_step": "3/5",
    "flow_name": "order_fulfillment"
  }
}
```

## Performance Considerations

### Log Volume Management

| Environment | Level | Volume Strategy |
|-------------|-------|-----------------|
| Development | DEBUG | All logs |
| Staging | INFO | Most logs |
| Production | INFO | Sampling for high-volume |

### High-Volume Endpoints

For endpoints called thousands of times per second:
- Use sampling (log 1 in 100)
- Aggregate metrics instead of individual logs
- Use separate log streams

### Async Logging

- Use async/buffered logging in production
- Set appropriate buffer sizes
- Handle buffer overflow gracefully

## Log Aggregation

### Recommended Stack

| Component | Options |
|-----------|---------|
| Collection | Fluentd, Filebeat, Vector |
| Storage | Elasticsearch, Loki, CloudWatch |
| Visualization | Kibana, Grafana, Datadog |
| Alerting | PagerDuty, OpsGenie, Slack |

### Retention Policy

| Log Level | Retention |
|-----------|-----------|
| DEBUG | 7 days |
| INFO | 30 days |
| WARN | 90 days |
| ERROR/FATAL | 1 year |

---

## Log File Rotation Policy

### Rotation policy — MUST set both

A file-based log sink configuration **MUST** include **both** triggers:

1. **Time-based rotation** (`rollingInterval: Day` or equivalent) — for chronological partitioning
2. **Size-based rotation** with `rollOnFileSizeLimit: true` (or equivalent) — to handle volume spikes

> **Why mandatory:** Most logging libraries ship with a silent default size cap. When the file hits the cap, subsequent log writes are **dropped silently** — no warning, no error. The application keeps running while half a day of logs vanish. Setting both triggers explicitly defeats this trap.

### Default cap is hostile in production

| Library | Default size cap | Behavior when cap hit |
|---|---|---|
| Serilog File sink (.NET) | 1 GB | **Silently stops writing** (`RollOnFileSizeLimit = false` by default) |
| log4j RollingFileAppender | none unless set | Same — no roll = drops |
| Python `RotatingFileHandler` | infinite unless `maxBytes` set | Grows unbounded |
| Winston `winston-daily-rotate-file` | none unless `maxSize` set | Same — no roll = drops |

If you do not explicitly configure size-based rotation, you are accepting one of the failure modes above.

### Recommended starting values

| Parameter | Value | Rationale |
|---|---|---|
| `fileSizeLimitBytes` | 100 MB | Balance: small enough to open in an editor, large enough to avoid excessive rolls |
| `rollOnFileSizeLimit` | `true` | When cap hit, create `*-001.txt`, `*-002.txt`; do **NOT** drop |
| `retainedFileCountLimit` | ≥ N×7 where N = max expected rolls/day | Avoid premature deletion of in-window logs |

### Recipes per language

**.NET / Serilog** (`appsettings.json`):

```json
{
  "Serilog": {
    "WriteTo": [{
      "Name": "File",
      "Args": {
        "path": "logs/app-.txt",
        "rollingInterval": "Day",
        "fileSizeLimitBytes": 104857600,
        "rollOnFileSizeLimit": true,
        "retainedFileCountLimit": 90
      }
    }]
  }
}
```

**Python** (`logging.handlers`):

```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    filename="logs/app.log",
    maxBytes=104857600,   # 100 MB
    backupCount=90        # ~3 months of rolls assuming low cardinality
)
# For combined time+size rotation, compose TimedRotatingFileHandler with size check
# or use a third-party library such as concurrent-log-handler.
```

**Java / log4j2** (`log4j2.xml`):

```xml
<RollingFile name="App" fileName="logs/app.log"
             filePattern="logs/app-%d{yyyy-MM-dd}-%i.log.gz">
  <PatternLayout pattern="%d %-5p %c{1.} - %m%n"/>
  <Policies>
    <TimeBasedTriggeringPolicy interval="1"/>
    <SizeBasedTriggeringPolicy size="100 MB"/>
  </Policies>
  <DefaultRolloverStrategy max="90"/>
</RollingFile>
```

**Node / Winston** (`winston-daily-rotate-file`):

```javascript
import DailyRotateFile from "winston-daily-rotate-file";

new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "100m",
  maxFiles: "90d"
});
```

### Operational SOP — investigate, don't just raise the cap

If a log file size reaches ≥ 90% of `fileSizeLimitBytes` at expected end-of-day, **investigate the cause before raising the cap**. Typical root causes:

- Noisy retry loop logging every attempt at INFO instead of WARN summary
- Unbounded debug logging accidentally enabled in production
- Stack-trace flood from one upstream failure
- Health probe / sidecar polluting the business log

Raising the cap masks the underlying noise problem and pushes the next outage further out.

### Failure-mode reference (real incident)

A production .NET Worker using only `rollingInterval: Day` (no size limit set, Serilog default 1 GB cap) hit the cap at 07:31 and silently dropped every log entry until 13:00+ when the operator noticed the tail was stale. Five consecutive daily files showed `~1,073,741,8XX bytes` (= 1 GiB exactly, Serilog default). Half a day of production diagnostics were lost. Setting `fileSizeLimitBytes` + `rollOnFileSizeLimit: true` would have rolled to `worker-YYYYMMDD_001.txt` and preserved the events.

---

## Quick Reference Card

### Log Level Selection

```
Is it debugging only?        → DEBUG (off in prod)
Normal operation completed?  → INFO
Something unexpected but OK? → WARN
Operation failed?            → ERROR
App cannot continue?         → FATAL
```

### Required Fields Checklist

- [ ] timestamp (ISO 8601)
- [ ] level
- [ ] message
- [ ] service name
- [ ] request_id or trace_id

### Security Checklist

- [ ] No passwords or secrets
- [ ] No full tokens
- [ ] PII masked or hashed
- [ ] Credit cards never logged
- [ ] Retention policies configured

### Rotation Checklist

- [ ] Time-based rotation set (`rollingInterval: Day` or equivalent)
- [ ] Size-based rotation set with `rollOnFileSizeLimit: true` (or equivalent)
- [ ] `fileSizeLimitBytes` explicitly configured (default cap is hostile)
- [ ] `retainedFileCountLimit` ≥ N×7 to cover within-window rolls
- [ ] 90% size SOP defined: investigate noise root cause, do not just raise cap

---

**Related Standards:**
- [Testing Standards](testing-standards.md) - Testing logging output (or use `/testing-guide` skill)
- [Code Review Checklist](code-review-checklist.md) - Reviewing logging practices

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-06-17 | Added: Mandatory Events catalog — 9 canonical "when you MUST log" events (when/must_log/must_NOT_log/level/rationale), validation-failure + heartbeat scenarios, compliant startup example, follow-on rules (access-log separation, silence-detection SLA, request_id discoverability) (XSPEC-234 / closes issue #108) |
| 1.3.0 | 2026-05-26 | Added: Log File Rotation Policy — mandatory dual-trigger (time + size) rotation with hostile-default warning, recipes for .NET/Python/Java/Node, ops SOP (XSPEC-232 / closes issue #111) |
| 1.2.0 | 2026-01-24 | Added: OpenTelemetry Semantic Conventions, Observability Three Pillars Integration, Log-based Alerting, Advanced Correlation Patterns |
| 1.1.0 | 2026-01-05 | Added: References section with OWASP, RFC 5424, OpenTelemetry, and 12 Factor App |
| 1.0.0 | 2025-12-30 | Initial logging standards |

---

## References

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) - Security logging best practices
- [RFC 5424 - The Syslog Protocol](https://datatracker.ietf.org/doc/html/rfc5424) - Standard log message format
- [OpenTelemetry Logging](https://opentelemetry.io/docs/specs/otel/logs/) - Modern observability standard
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) - Standardized attribute naming
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) - Distributed tracing context propagation
- [12 Factor App - Logs](https://12factor.net/logs) - Cloud-native logging principles
- [Google SRE - Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) - Alert design best practices

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
