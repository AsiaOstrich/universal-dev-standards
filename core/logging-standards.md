# Logging Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/logging-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-05
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
| 1.1.0 | 2026-01-05 | Added: References section with OWASP, RFC 5424, OpenTelemetry, and 12 Factor App |
| 1.0.0 | 2025-12-30 | Initial logging standards |

---

## References

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) - Security logging best practices
- [RFC 5424 - The Syslog Protocol](https://datatracker.ietf.org/doc/html/rfc5424) - Standard log message format
- [OpenTelemetry Logging](https://opentelemetry.io/docs/specs/otel/logs/) - Modern observability standard
- [12 Factor App - Logs](https://12factor.net/logs) - Cloud-native logging principles

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
