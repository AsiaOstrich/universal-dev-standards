# Logging Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/logging-standards.md)

**Version**: 1.2.0
**Last Updated**: 2026-01-24
**Applicability**: All software projects

---

## Overview

This document defines logging standards for consistent, structured, and actionable application logs across all environments.

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

---

**Related Standards:**
- [Testing Standards](testing-standards.md) - Testing logging output (or use `/testing-guide` skill)
- [Code Review Checklist](code-review-checklist.md) - Reviewing logging practices

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
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
