# Error Code Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/error-code-standards.md)

**Version**: 1.2.0
**Last Updated**: 2026-03-18
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: RFC 7807, RFC 9457
**References**: [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc7807)

---

## Overview

This document defines standards for consistent error code management across applications, enabling better debugging, monitoring, and user experience.

## Error Code Format

### Standard Format

```
<PREFIX>_<CATEGORY>_<NUMBER>
```

| Component | Description | Example |
|-----------|-------------|---------|
| PREFIX | Application/service identifier | AUTH, PAY, USR |
| CATEGORY | Error category | VAL, SYS, BIZ |
| NUMBER | Unique numeric identifier | 001, 100, 404 |

### Examples

```
AUTH_VAL_001    → Authentication validation error
PAY_SYS_503     → Payment system unavailable
USR_BIZ_100     → User business rule violation
API_NET_408     → API network timeout
```

## Error Categories

### Validation Errors (VAL)

Client input validation failures.

| Code Range | Description |
|------------|-------------|
| *_VAL_001-099 | Field validation |
| *_VAL_100-199 | Format validation |
| *_VAL_200-299 | Constraint validation |

```javascript
// Examples
AUTH_VAL_001  // Missing required field: email
AUTH_VAL_101  // Invalid email format
AUTH_VAL_201  // Password too short (min 8 chars)
```

### Business Logic Errors (BIZ)

Business rule violations.

| Code Range | Description |
|------------|-------------|
| *_BIZ_001-099 | State violations |
| *_BIZ_100-199 | Rule violations |
| *_BIZ_200-299 | Limit violations |

```javascript
// Examples
ORDER_BIZ_001  // Order already cancelled
ORDER_BIZ_101  // Cannot return after 30 days
ORDER_BIZ_201  // Daily purchase limit exceeded
```

### System Errors (SYS)

Internal system failures.

| Code Range | Description |
|------------|-------------|
| *_SYS_001-099 | Internal errors |
| *_SYS_100-199 | Resource errors |
| *_SYS_500-599 | HTTP-aligned system errors |

```javascript
// Examples
DB_SYS_001    // Database query failed
CACHE_SYS_101 // Redis connection lost
API_SYS_503   // Service unavailable
```

### Network Errors (NET)

Communication and connectivity issues.

| Code Range | Description |
|------------|-------------|
| *_NET_001-099 | Connection errors |
| *_NET_100-199 | Protocol errors |
| *_NET_400-599 | HTTP-aligned network errors |

```javascript
// Examples
API_NET_001   // Connection refused
API_NET_408   // Request timeout
API_NET_502   // Bad gateway
```

### Authentication/Authorization Errors (AUTH)

Security-related errors.

| Code Range | Description |
|------------|-------------|
| *_AUTH_001-099 | Authentication failures |
| *_AUTH_100-199 | Authorization failures |
| *_AUTH_200-299 | Token/session errors |

```javascript
// Examples
SEC_AUTH_001  // Invalid credentials
SEC_AUTH_101  // Insufficient permissions
SEC_AUTH_201  // Token expired
```

## Error Message Structure

### Internal Error Object

```typescript
interface ApplicationError {
  // Core fields
  code: string;          // "AUTH_VAL_001"
  message: string;       // Technical message for logs

  // User-facing
  userMessage: string;   // Localized user message
  userMessageKey: string; // i18n key: "error.auth.val.001"

  // Context
  field?: string;        // Affected field: "email"
  details?: object;      // Additional context

  // Debugging
  timestamp: string;     // ISO 8601
  requestId: string;     // Correlation ID
  stack?: string;        // Stack trace (dev only)
}
```

### API Response Format

```json
{
  "success": false,
  "error": {
    "code": "AUTH_VAL_001",
    "message": "Email is required",
    "field": "email",
    "requestId": "req_abc123"
  }
}
```

### Multiple Errors Response

```json
{
  "success": false,
  "errors": [
    {
      "code": "AUTH_VAL_001",
      "message": "Email is required",
      "field": "email"
    },
    {
      "code": "AUTH_VAL_201",
      "message": "Password must be at least 8 characters",
      "field": "password"
    }
  ],
  "requestId": "req_abc123"
}
```

## HTTP Status Code Mapping

Map error categories to HTTP status codes:

| Category | HTTP Status | Description |
|----------|-------------|-------------|
| VAL | 400 | Bad Request |
| BIZ | 422 | Unprocessable Entity |
| AUTH (001-099) | 401 | Unauthorized |
| AUTH (100-199) | 403 | Forbidden |
| SYS | 500 | Internal Server Error |
| NET | 502/503/504 | Gateway errors |

## Internationalization (i18n)

### Message Key Format

```
error.<prefix>.<category>.<number>
```

### Example Translation Files

```yaml
# en.yaml
error:
  auth:
    val:
      001: "Email is required"
      101: "Invalid email format"
    auth:
      001: "Invalid credentials"
      201: "Session expired"

# zh-TW.yaml
error:
  auth:
    val:
      001: "電子郵件為必填欄位"
      101: "電子郵件格式無效"
    auth:
      001: "帳號或密碼錯誤"
      201: "工作階段已過期"
```

### Dynamic Parameters

```yaml
# Template with parameters
error:
  order:
    biz:
      201: "Daily limit of {limit} orders exceeded"

# Usage
formatMessage('error.order.biz.201', { limit: 10 })
// Output: "Daily limit of 10 orders exceeded"
```

## Error Code Registry

### Centralized Definition

Maintain a single source of truth for all error codes:

```typescript
// errors/registry.ts
export const ErrorCodes = {
  // Authentication
  AUTH_VAL_001: {
    code: 'AUTH_VAL_001',
    httpStatus: 400,
    messageKey: 'error.auth.val.001',
    description: 'Email field is required',
  },
  AUTH_VAL_101: {
    code: 'AUTH_VAL_101',
    httpStatus: 400,
    messageKey: 'error.auth.val.101',
    description: 'Email format is invalid',
  },
  // ... more codes
} as const;
```

### Usage Pattern

```typescript
import { ErrorCodes } from './errors/registry';

function validateEmail(email: string) {
  if (!email) {
    throw new AppError(ErrorCodes.AUTH_VAL_001);
  }
  if (!isValidEmail(email)) {
    throw new AppError(ErrorCodes.AUTH_VAL_101);
  }
}
```

## API Error Serialization

### RFC 7807 / RFC 9457 Problem Details

For HTTP APIs, use the [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) Problem Details format as the standard error envelope:

```json
{
  "type": "https://api.example.com/errors/auth-val-001",
  "title": "Validation Error",
  "status": 400,
  "detail": "Email field is required for registration",
  "instance": "/api/register",
  "code": "AUTH_VAL_001",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "code": "AUTH_VAL_001"
    }
  ],
  "requestId": "req_abc123",
  "timestamp": "2026-03-18T10:30:00Z"
}
```

**Required Fields (RFC 7807):**

| Field | Type | Description |
|-------|------|-------------|
| `type` | URI | Reference to error documentation |
| `title` | string | Short, human-readable summary |
| `status` | integer | HTTP status code |
| `detail` | string | Human-readable explanation |
| `instance` | string | URI of the request that caused the error |

**Extension Fields (Recommended):**

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Application error code (PREFIX_CATEGORY_NUMBER) |
| `errors` | array | Detailed field-level errors |
| `requestId` | string | Correlation ID for tracing |
| `timestamp` | string | ISO 8601 timestamp |

### REST JSON Error Response

Standard REST error response combining internal error codes with RFC 7807:

```json
// Single error
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request validation failed",
  "errors": [
    {
      "code": "AUTH_VAL_001",
      "field": "email",
      "message": "Email is required",
      "pointer": "/data/attributes/email"
    }
  ]
}

// Multiple errors
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Multiple validation errors occurred",
  "errors": [
    {
      "code": "AUTH_VAL_001",
      "field": "email",
      "message": "Email is required",
      "pointer": "/data/attributes/email"
    },
    {
      "code": "AUTH_VAL_201",
      "field": "password",
      "message": "Password must be at least 8 characters",
      "pointer": "/data/attributes/password"
    }
  ]
}
```

### GraphQL Error Handling

GraphQL uses a different error model. Map application error codes into the `extensions` field:

```json
{
  "data": null,
  "errors": [
    {
      "message": "Email is required",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["createUser"],
      "extensions": {
        "code": "AUTH_VAL_001",
        "category": "VALIDATION",
        "field": "email",
        "httpStatus": 400,
        "timestamp": "2026-03-18T10:30:00Z"
      }
    }
  ]
}
```

**GraphQL Error Categories:**

| Category | Maps To | Use For |
|----------|---------|---------|
| `VALIDATION` | VAL | Input validation failures |
| `BUSINESS_RULE` | BIZ | Business logic violations |
| `AUTHENTICATION` | AUTH (001-099) | Authentication failures |
| `AUTHORIZATION` | AUTH (100-199) | Permission failures |
| `INTERNAL` | SYS | Server-side errors |
| `NETWORK` | NET | Upstream service failures |

### gRPC Error Handling

Map application error codes to gRPC status codes and include details via metadata:

```protobuf
// Error detail message
message ErrorDetail {
  string code = 1;          // "AUTH_VAL_001"
  string message = 2;       // Human-readable message
  string field = 3;         // Affected field
  string documentation = 4; // Link to error docs
}
```

**gRPC Status Code Mapping:**

| Category | gRPC Status | Code |
|----------|-------------|------|
| VAL | `INVALID_ARGUMENT` | 3 |
| BIZ | `FAILED_PRECONDITION` | 9 |
| AUTH (001-099) | `UNAUTHENTICATED` | 16 |
| AUTH (100-199) | `PERMISSION_DENIED` | 7 |
| SYS | `INTERNAL` | 13 |
| NET | `UNAVAILABLE` | 14 |

```go
// Go example
import "google.golang.org/grpc/status"
import "google.golang.org/grpc/codes"

st := status.New(codes.InvalidArgument, "Validation failed")
st, _ = st.WithDetails(&errdetails.BadRequest{
    FieldViolations: []*errdetails.BadRequest_FieldViolation{
        {Field: "email", Description: "AUTH_VAL_001: Email is required"},
    },
})
return st.Err()
```

## Retry and Idempotency

### Retry Guidance

| Category | Retryable | Strategy |
|----------|-----------|----------|
| VAL | No | Fix input and resubmit |
| BIZ | No | Resolve business condition |
| AUTH (001-099) | No | Re-authenticate |
| AUTH (200-299) | Yes | Refresh token, then retry |
| SYS | Maybe | Retry with exponential backoff |
| NET | Yes | Retry with exponential backoff |

### Retry Response Headers

```http
HTTP/1.1 503 Service Unavailable
Retry-After: 30
X-RateLimit-Reset: 1679961600
```

Include retry guidance in error responses:

```json
{
  "type": "https://api.example.com/errors/rate-limit",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Too many requests",
  "code": "API_NET_429",
  "retryable": true,
  "retryAfter": 30
}
```

### Idempotency Keys

For non-idempotent operations (POST), require `Idempotency-Key` header:

```http
POST /api/payments HTTP/1.1
Idempotency-Key: key_abc123def456
Content-Type: application/json

{"amount": 100, "currency": "USD"}
```

**Idempotency Rules:**

| Verb | Idempotent | Key Required |
|------|-----------|-------------|
| GET | Yes | No |
| PUT | Yes | No |
| DELETE | Yes | No |
| PATCH | No | Recommended |
| POST | No | Required for critical operations |

---

## Documentation Requirements

### Error Code Documentation

Each error code should document:

1. **Code**: The error code string
2. **Description**: What this error means
3. **Cause**: Common causes
4. **Resolution**: How to fix it
5. **Example**: Sample scenario

```markdown
## AUTH_VAL_001

**Description**: Email field is required

**Cause**: The request body does not contain an email field

**Resolution**: Include a valid email in the request body

**Example**:
// Missing email
POST /api/register
{ "password": "secret123" }

// Correct
POST /api/register
{ "email": "user@example.com", "password": "secret123" }
```

## Quick Reference Card

### Code Format

```
<PREFIX>_<CATEGORY>_<NUMBER>
AUTH_VAL_001
```

### Categories

| Code | Category | Use For |
|------|----------|---------|
| VAL | Validation | Input validation failures |
| BIZ | Business | Business rule violations |
| SYS | System | Internal system errors |
| NET | Network | Communication failures |
| AUTH | Auth | Security-related errors |

### HTTP Mapping

| Category | Status |
|----------|--------|
| VAL | 400 |
| BIZ | 422 |
| AUTH | 401/403 |
| SYS | 500 |
| NET | 502/503 |

### Checklist

- [ ] Unique code for each error
- [ ] Category matches error type
- [ ] User message is localized
- [ ] HTTP status is correct
- [ ] Error is documented
- [ ] Code is in registry

---

**Related Standards:**
- [Logging Standards](logging-standards.md) - Error logging practices
- [API Documentation Standards](api-documentation-standards.md) - Error response documentation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-18 | Added: API Error Serialization (RFC 7807 Problem Details, REST, GraphQL, gRPC), Retry and Idempotency guidance |
| 1.1.0 | 2026-01-05 | Added: References section with RFC 7807, RFC 9457, HTTP status codes, and Microsoft REST API Guidelines |
| 1.0.0 | 2025-12-30 | Initial error code standards |

---

## References

- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807) - IETF standard for error response format
- [RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457) - Updated RFC 7807 (2023)
- [HTTP Status Codes (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - HTTP status code reference
- [Microsoft REST API Guidelines - Errors](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md#handling-errors) - Industry best practices
- [GraphQL Spec - Errors](https://spec.graphql.org/October2021/#sec-Errors) - GraphQL error format specification
- [gRPC Status Codes](https://grpc.github.io/grpc/core/md_doc_statuscodes.html) - gRPC error handling reference
- [Google API Design Guide - Errors](https://cloud.google.com/apis/design/errors) - Google's API error design patterns

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
