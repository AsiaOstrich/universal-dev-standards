---
source: ../../../core/error-code-standards.md
source_version: 1.2.1
translation_version: 1.2.1
last_synced: 2026-10-16
source_hash: 52ddb355e07f
status: current
---

# 错误码标准

> **语言**: [English](../../../core/error-code-standards.md) | [繁體中文](../../zh-TW/core/error-code-standards.md) | 简体中文

**版本**: 1.2.1
**最后更新**: 2026-06-18
**适用范围**: 所有软件项目
**范围**: universal
**所属规范**: XSPEC-291（无专用特性 XSPEC；XSPEC-291 拥有此标准）
**行业标准**: RFC 7807, RFC 9457
**参考资料**: [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc7807)

---

## 概述

本文档定义了跨应用程序统一错误码管理的标准，以实现更好的调试、监控和用户体验。

## 错误码格式

### 标准格式

```
<PREFIX>_<CATEGORY>_<NUMBER>
```

| 组件 | 说明 | 示例 |
|-----------|-------------|---------|
| PREFIX | 应用/服务标识符 | AUTH, PAY, USR |
| CATEGORY | 错误类别 | VAL, SYS, BIZ |
| NUMBER | 唯一数字标识符 | 001, 100, 404 |

### 示例

```
AUTH_VAL_001    → Authentication validation error
PAY_SYS_503     → Payment system unavailable
USR_BIZ_100     → User business rule violation
API_NET_408     → API network timeout
```

## 错误类别

### 验证错误 (VAL)

客户端输入验证失败。

| 代码范围 | 说明 |
|------------|-------------|
| *_VAL_001-099 | 字段验证 |
| *_VAL_100-199 | 格式验证 |
| *_VAL_200-299 | 约束验证 |

```javascript
// Examples
AUTH_VAL_001  // Missing required field: email
AUTH_VAL_101  // Invalid email format
AUTH_VAL_201  // Password too short (min 8 chars)
```

### 业务逻辑错误 (BIZ)

业务规则违反。

| 代码范围 | 说明 |
|------------|-------------|
| *_BIZ_001-099 | 状态违反 |
| *_BIZ_100-199 | 规则违反 |
| *_BIZ_200-299 | 限制违反 |

```javascript
// Examples
ORDER_BIZ_001  // Order already cancelled
ORDER_BIZ_101  // Cannot return after 30 days
ORDER_BIZ_201  // Daily purchase limit exceeded
```

### 系统错误 (SYS)

内部系统故障。

| 代码范围 | 说明 |
|------------|-------------|
| *_SYS_001-099 | 内部错误 |
| *_SYS_100-199 | 资源错误 |
| *_SYS_500-599 | 与 HTTP 对齐的系统错误 |

```javascript
// Examples
DB_SYS_001    // Database query failed
CACHE_SYS_101 // Redis connection lost
API_SYS_503   // Service unavailable
```

### 网络错误 (NET)

通信与连接问题。

| 代码范围 | 说明 |
|------------|-------------|
| *_NET_001-099 | 连接错误 |
| *_NET_100-199 | 协议错误 |
| *_NET_400-599 | 与 HTTP 对齐的网络错误 |

```javascript
// Examples
API_NET_001   // Connection refused
API_NET_408   // Request timeout
API_NET_502   // Bad gateway
```

### 认证/授权错误 (AUTH)

安全相关错误。

| 代码范围 | 说明 |
|------------|-------------|
| *_AUTH_001-099 | 认证失败 |
| *_AUTH_100-199 | 授权失败 |
| *_AUTH_200-299 | 令牌/会话错误 |

```javascript
// Examples
SEC_AUTH_001  // Invalid credentials
SEC_AUTH_101  // Insufficient permissions
SEC_AUTH_201  // Token expired
```

## 错误消息结构

### 内部错误对象

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

### API 响应格式

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

### 多个错误响应

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

## HTTP 状态码映射

将错误类别映射到 HTTP 状态码：

| 类别 | HTTP 状态 | 说明 |
|----------|-------------|-------------|
| VAL | 400 | Bad Request |
| BIZ | 422 | Unprocessable Entity |
| AUTH (001-099) | 401 | Unauthorized |
| AUTH (100-199) | 403 | Forbidden |
| SYS | 500 | Internal Server Error |
| NET | 502/503/504 | 网关错误 |

## 国际化 (i18n)

### 消息键格式

```
error.<prefix>.<category>.<number>
```

### 翻译文件示例

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

### 动态参数

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

## 错误码注册表

### 集中式定义

为所有错误码维护单一真实来源：

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

### 使用模式

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

## API 错误序列化

### RFC 7807 / RFC 9457 Problem Details

对于 HTTP API，使用 [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) Problem Details 格式作为标准错误信封：

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

**必填字段 (RFC 7807)：**

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `type` | URI | 错误文档的引用 |
| `title` | string | 简短的人类可读摘要 |
| `status` | integer | HTTP 状态码 |
| `detail` | string | 人类可读的详细解释 |
| `instance` | string | 导致错误的请求 URI |

**扩展字段（推荐）：**

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `code` | string | 应用程序错误码（PREFIX_CATEGORY_NUMBER） |
| `errors` | array | 详细的字段级错误 |
| `requestId` | string | 用于追踪的关联 ID |
| `timestamp` | string | ISO 8601 时间戳 |

### REST JSON 错误响应

结合内部错误码与 RFC 7807 的标准 REST 错误响应：

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

### GraphQL 错误处理

GraphQL 使用不同的错误模型。将应用程序错误码映射到 `extensions` 字段中：

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

**GraphQL 错误类别：**

| 类别 | 映射至 | 用途 |
|----------|---------|---------|
| `VALIDATION` | VAL | 输入验证失败 |
| `BUSINESS_RULE` | BIZ | 业务逻辑违反 |
| `AUTHENTICATION` | AUTH (001-099) | 认证失败 |
| `AUTHORIZATION` | AUTH (100-199) | 权限失败 |
| `INTERNAL` | SYS | 服务端错误 |
| `NETWORK` | NET | 上游服务失败 |

### gRPC 错误处理

将应用程序错误码映射到 gRPC 状态码，并通过元数据包含详细信息：

```protobuf
// Error detail message
message ErrorDetail {
  string code = 1;          // "AUTH_VAL_001"
  string message = 2;       // Human-readable message
  string field = 3;         // Affected field
  string documentation = 4; // Link to error docs
}
```

**gRPC 状态码映射：**

| 类别 | gRPC 状态 | 代码 |
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

## 重试与幂等性

### 重试指导

| 类别 | 可重试 | 策略 |
|----------|-----------|----------|
| VAL | 否 | 修复输入并重新提交 |
| BIZ | 否 | 解决业务条件问题 |
| AUTH (001-099) | 否 | 重新认证 |
| AUTH (200-299) | 是 | 刷新令牌后重试 |
| SYS | 可能 | 指数退避重试 |
| NET | 是 | 指数退避重试 |

### 重试响应头

```http
HTTP/1.1 503 Service Unavailable
Retry-After: 30
X-RateLimit-Reset: 1679961600
```

在错误响应中包含重试指导：

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

### 幂等键

对于非幂等操作（POST），要求 `Idempotency-Key` 请求头：

```http
POST /api/payments HTTP/1.1
Idempotency-Key: key_abc123def456
Content-Type: application/json

{"amount": 100, "currency": "USD"}
```

**幂等规则：**

| 动词 | 幂等 | 需要键 |
|------|-----------|-------------|
| GET | 是 | 否 |
| PUT | 是 | 否 |
| DELETE | 是 | 否 |
| PATCH | 否 | 推荐 |
| POST | 否 | 关键操作必需 |

---

## 文档要求

### 错误码文档

每个错误码应记录：

1. **代码**：错误码字符串
2. **描述**：此错误的含义
3. **原因**：常见原因
4. **解决方案**：如何修复
5. **示例**：示例场景

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

## 快速参考卡

### 代码格式

```
<PREFIX>_<CATEGORY>_<NUMBER>
AUTH_VAL_001
```

### 类别

| 代码 | 类别 | 用途 |
|------|----------|---------|
| VAL | 验证 | 输入验证失败 |
| BIZ | 业务 | 业务规则违反 |
| SYS | 系统 | 内部系统错误 |
| NET | 网络 | 通信失败 |
| AUTH | 认证 | 安全相关错误 |

### HTTP 映射

| 类别 | 状态 |
|----------|--------|
| VAL | 400 |
| BIZ | 422 |
| AUTH | 401/403 |
| SYS | 500 |
| NET | 502/503 |

### 检查清单

- [ ] 每个错误有唯一代码
- [ ] 类别符合错误类型
- [ ] 用户消息已本地化
- [ ] HTTP 状态正确
- [ ] 错误已记录文档
- [ ] 代码已注册

---

**相关标准：**
- [日志标准](logging-standards.md) - 错误日志实践
- [API 文档标准](api-design-standards.md) - 错误响应文档

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.2.0 | 2026-03-18 | 新增：API 错误序列化（RFC 7807 Problem Details、REST、GraphQL、gRPC）、重试与幂等性指引 |
| 1.1.0 | 2026-01-05 | 新增：参考资料部分，包含 RFC 7807、RFC 9457、HTTP 状态码以及 Microsoft REST API Guidelines |
| 1.0.0 | 2025-12-30 | 初始错误码标准 |

---

## 参考资料

- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807) - IETF 错误响应格式标准
- [RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457) - RFC 7807 更新版 (2023)
- [HTTP Status Codes (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - HTTP 状态码参考
- [Microsoft REST API Guidelines - Errors](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md#handling-errors) - 行业最佳实践
- [GraphQL Spec - Errors](https://spec.graphql.org/October2021/#sec-Errors) - GraphQL 错误格式规范
- [gRPC Status Codes](https://grpc.github.io/grpc/core/md_doc_statuscodes.html) - gRPC 错误处理参考
- [Google API Design Guide - Errors](https://cloud.google.com/apis/design/errors) - Google 的 API 错误设计模式

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
