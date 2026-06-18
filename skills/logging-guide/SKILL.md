---
name: logging-guide
scope: universal
anchor_standard: logging-standards
description: |
  Implement structured logging with proper log levels and sensitive data handling.
  Use when: adding logging, debugging, setting up observability.
  Keywords: logging, log level, structured logging, observability.
---

# Logging Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/logging-guide/SKILL.md)

**Version**: 1.4.0
**Last Updated**: 2026-06-19
**Applicability**: Claude Code Skills

---

> **Core Standard**: This skill implements [Logging Standards](../../core/logging-standards.md). For comprehensive methodology documentation, refer to the core standard.

## Purpose

This skill helps implement consistent, structured, and actionable application logs across all environments.

## Quick Reference

### Log Levels

| Level | Code | When to Use | Production |
|-------|------|-------------|------------|
| **TRACE** | 10 | Very detailed debugging info | Off |
| **DEBUG** | 20 | Detailed debugging info | Off |
| **INFO** | 30 | Normal operation events | On |
| **WARN** | 40 | Potential issues, recoverable | On |
| **ERROR** | 50 | Errors that need attention | On |
| **FATAL** | 60 | Critical failures | On |

### Level Selection Decision Tree

```
Is it debugging only?        → DEBUG (off in prod)
Normal operation completed?  → INFO
Something unexpected but OK? → WARN
Operation failed?            → ERROR
App cannot continue?         → FATAL
```

### When to Use Each Level

| Level | Examples |
|-------|----------|
| **TRACE** | Function entry/exit, loop iterations, variable values |
| **DEBUG** | State changes, configuration values, query parameters |
| **INFO** | App startup/shutdown, user actions, scheduled tasks |
| **WARN** | Deprecated API, retry attempts, resource approaching limits |
| **ERROR** | Failed operations, caught exceptions, integration failures |
| **FATAL** | Unrecoverable errors, startup failures, lost critical resources |

## Mandatory Events

Formatting every log perfectly but **never firing at the moment that matters** is
worse than useless — it gives false confidence during an incident. The core
standard defines **9 canonical events that MUST produce a log entry**. A logging
setup that follows the level/field rules but omits these is "compliant on paper,
materially silent". Always implement all 9:

| Event id | When | Level | Core required fields | Must NOT log |
|----------|------|-------|----------------------|--------------|
| `application_startup` | After boot, **before** accepting requests | INFO | app_name, version, git_sha, environment, hostname, pid, listening_endpoints | secrets, full connection strings |
| `request_received` | First time middleware sees a request | INFO / DEBUG | method, path, source_ip, request_id | request body, auth headers |
| `validation_failure` | schema / ModelState / DTO validation rejects | WARN | request_id, path, missing_fields[], payload_shape (keys only) | field **values**, PII |
| `authentication_failure` | login / token verification fails | WARN | uid (attempted), source_ip, failure_reason | password, token value |
| `outbound_call_start` | An outbound HTTP/RPC call is initiated | INFO | target_url (host+path), request_id propagated, timeout_ms | credentials, bearer tokens |
| `outbound_call_complete` | An external call returns or fails | INFO / WARN / ERROR | status_code **or** failure_phase (dns/tcp/tls/http), elapsed_ms, retries | response body with PII |
| `business_event` | A state-changing business operation completes | INFO | operation_name, actor, target ids, outcome | full record payload, PII |
| `heartbeat` | Long-running background service, ≥ 1× / 60 s | INFO | service_name, queue_depth, items_processed_since_last_heartbeat | — |
| `shutdown` | Process exits (graceful or fatal) | INFO / ERROR | app_name, signal/reason, uptime_seconds, pending_work_count | — |

**Why these exact events** — each closes a real incident blind spot: a silent
`validation_failure` hides un-logged payloads; `authentication_failure` without
`uid`/`source_ip` is un-investigable; a missing `heartbeat` means a 0-byte log
file goes unnoticed; absent `outbound_call_*` turns "send failed" into a 2-day
hunt with no trace of the call.

> A background service that writes no INFO/WARN/ERROR within 60 s MUST emit a
> `heartbeat`; if none appears for ≥ 2× the interval (≥ 120 s), a silence detector
> MUST alert.

For the full catalog (each event's `when` / `must_log` / `must_NOT_log` /
`rationale` and compliant examples), see the **Mandatory Events** section of the
[core Logging Standards](../../core/logging-standards.md#mandatory-events).

## Structured Logging

### Required Fields

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

Use `snake_case` and prefix with domain:

| Domain | Common Fields |
|--------|---------------|
| HTTP | http_method, http_path, http_status, http_duration_ms |
| Database | db_query_type, db_table, db_duration_ms, db_rows_affected |
| Queue | queue_name, queue_message_id, queue_delay_ms |
| User | user_id, user_role, user_action |
| Request | request_id, trace_id, span_id |

## Detailed Guidelines

For complete standards, see:
- [Logging Standards](../../core/logging-standards.md)

### AI-Optimized Format (Token-Efficient)

For AI assistants, use the YAML format files for reduced token usage:
- Base standard: `ai/standards/logging.ai.yaml`

## Sensitive Data Handling

### Never Log

- Passwords or secrets
- API keys or tokens
- Credit card numbers
- Social security numbers
- Full authentication tokens

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

## Log Format

### JSON Format (Production)

```json
{"timestamp":"2025-01-15T10:30:00.123Z","level":"INFO","message":"Request completed","request_id":"req_123","duration_ms":45}
```

### Human-Readable (Development)

```
2025-01-15T10:30:00.123Z [INFO] Request completed request_id=req_123 duration_ms=45
```

## Performance Considerations

### Log Volume by Environment

| Environment | Level | Strategy |
|-------------|-------|----------|
| Development | DEBUG | All logs |
| Staging | INFO | Most logs |
| Production | INFO | Sampling for high-volume |

### High-Volume Endpoints

- Use sampling (log 1 in 100)
- Aggregate metrics instead of individual logs
- Use separate log streams

## Log File Rotation

File-based log sinks **MUST** set **both** rotation triggers — time-based **and** size-based. Default size caps in popular libraries (Serilog 1 GB, log4j/Winston/Python `RotatingFileHandler` no cap) cause silent data loss in production.

```
✓ rollingInterval: Day                    # time-based
✓ fileSizeLimitBytes: 104857600 (100 MB)  # size-based
✓ rollOnFileSizeLimit: true               # roll, do NOT drop
✓ retainedFileCountLimit: ≥ N*7           # N = max rolls/day
```

When a log file reaches **≥ 90% of `fileSizeLimitBytes`** at expected end-of-day, **investigate the noise root cause** (noisy retry loop / unbounded debug logging / stack-trace flood) before raising the cap.

> Full specification with per-language recipes (.NET Serilog / Python / Java log4j2 / Node Winston) and the real-incident failure-mode reference: see [Log File Rotation Policy](../../core/logging-standards.md#log-file-rotation-policy) in the core standard.

## Checklist

### Required Fields

- [ ] timestamp (ISO 8601)
- [ ] level
- [ ] message
- [ ] service name
- [ ] request_id or trace_id

### Security

- [ ] No passwords or secrets
- [ ] No full tokens
- [ ] PII masked or hashed
- [ ] Credit cards never logged
- [ ] Retention policies configured

### Rotation

- [ ] Time-based rotation set (`rollingInterval: Day` or equivalent)
- [ ] Size-based rotation set (`fileSizeLimitBytes` + `rollOnFileSizeLimit: true`)
- [ ] `retainedFileCountLimit` ≥ N×7 (N = max rolls/day)
- [ ] 90% size SOP defined (investigate noise, do not just raise cap)

---

## Configuration Detection

This skill supports project-specific configuration.

### Detection Order

1. Check for existing logging library configuration
2. Check `CONTRIBUTING.md` for logging guidelines
3. If not found, **default to structured JSON logging**

### First-Time Setup

If no logging standard found:

1. Suggest: "This project hasn't configured logging standards. Would you like to set up structured logging?"
2. Suggest documenting in `CONTRIBUTING.md`:

```markdown
## Logging Standards

### Log Levels
- DEBUG: Development only, detailed diagnostic info
- INFO: Normal operations (startup, user actions, tasks)
- WARN: Unexpected but recoverable situations
- ERROR: Failures that need investigation

### Required Fields
All logs must include: timestamp, level, message, service, request_id

### Sensitive Data
Never log: passwords, tokens, credit cards, SSN
```

---

## Next Steps Guidance | 下一步引導

After `/logging` completes, the AI assistant should suggest:

> **日誌標準已掌握。建議下一步 / Logging standards understood. Suggested next steps:**
> - 根據日誌指南在程式碼中實作結構化日誌 ⭐ **Recommended / 推薦** — 立即將日誌標準應用到專案 / Apply logging standards to the project immediately
> - 執行 `/errors` 設計錯誤碼以配合日誌系統 — 讓錯誤追蹤更有效率 / Make error tracking more efficient
> - 執行 `/sdd` 將可觀測性需求納入規格 — 確保日誌需求在規格中有定義 / Ensure logging requirements are defined in specs

---

## Related Standards

- [Logging Standards](../../core/logging-standards.md)
- [Error Code Standards](../../core/error-code-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-06-19 | Added: Mandatory Events section (9 canonical events) to close skill↔standard content drift; aligned version with core Logging Standards v1.4.0 (XSPEC-070 Phase 2) |
| 1.1.0 | 2026-05-26 | Added: Log File Rotation section with cross-link to core standard rotation policy; Rotation checklist (XSPEC-232) |
| 1.0.0 | 2025-12-30 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
