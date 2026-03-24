---
source: ../../../core/api-design-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
---

# API 设计标准

> **语言**: [English](../../../core/api-design-standards.md) | 简体中文

> 版本: 1.0.0 | 最后更新: 2026-03-18

**适用范围**: 所有软件项目
**范畴**: universal
**业界标准**: OpenAPI 3.x, JSON:API 1.1, Google API Design Guide, RFC 7231 (HTTP 语义)
**参考资料**: [openapis.org](https://www.openapis.org/), [jsonapi.org](https://jsonapi.org/), [Google API Design Guide](https://cloud.google.com/apis/design), [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231)

---

## 目的

本标准定义设计、构建与维护 API 的全面性指南。涵盖 REST、GraphQL 及 gRPC 范式，提供资源命名、版本控制、分页、错误处理、身份验证与文档撰写的一致性模式。

**参考标准**:
- [OpenAPI Specification 3.x](https://spec.openapis.org/oas/v3.1.0)
- [JSON:API 1.1](https://jsonapi.org/format/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [RFC 7231 — HTTP 语义](https://datatracker.ietf.org/doc/html/rfc7231)
- [RFC 7807 — HTTP API 问题详情](https://datatracker.ietf.org/doc/html/rfc7807)

---

## REST 设计原则

### 资源命名

| 规则 | 正确 | 错误 |
|------|------|------|
| **使用名词，非动词** | `/users` | `/getUsers` |
| **使用复数名词** | `/articles` | `/article` |
| **使用 kebab-case** | `/user-profiles` | `/userProfiles`, `/user_profiles` |
| **使用小写** | `/orders` | `/Orders` |
| **嵌套表示关联** | `/users/123/orders` | `/getUserOrders?userId=123` |
| **最多 2 层嵌套** | `/users/123/orders` | `/users/123/orders/456/items/789/details` |

### HTTP 动词

| 动词 | 用途 | 请求主体 | 幂等性 | 安全性 |
|------|------|---------|--------|--------|
| **GET** | 获取资源 | 无 | 是 | 是 |
| **POST** | 创建新资源 | 有 | 否 | 否 |
| **PUT** | 完整替代资源 | 有 | 是 | 否 |
| **PATCH** | 部分更新资源 | 有 | 否 | 否 |
| **DELETE** | 移除资源 | 选用 | 是 | 否 |
| **HEAD** | 与 GET 相同但不含主体 | 无 | 是 | 是 |
| **OPTIONS** | 描述通信选项 | 无 | 是 | 是 |

### HTTP 状态码

#### 成功 (2xx)

| 代码 | 意义 | 使用时机 |
|------|------|---------|
| **200 OK** | 一般成功 | GET、PUT、PATCH、含主体的 DELETE |
| **201 Created** | 资源已创建 | POST（包含 `Location` 头部） |
| **202 Accepted** | 请求已接受，异步处理中 | 长时间执行的操作 |
| **204 No Content** | 成功但无主体 | DELETE、无响应主体的 PUT |

#### 客户端错误 (4xx)

| 代码 | 意义 | 使用时机 |
|------|------|---------|
| **400 Bad Request** | 格式错误的请求 | 无效 JSON、缺少必要字段 |
| **401 Unauthorized** | 需要身份验证 | 无 token、token 过期 |
| **403 Forbidden** | 权限不足 | 有效 token，角色不符 |
| **404 Not Found** | 资源不存在 | 无效的资源 ID |
| **405 Method Not Allowed** | 不支持的 HTTP 方法 | 对只读端点使用 POST |
| **409 Conflict** | 状态冲突 | 重复创建、版本冲突 |
| **422 Unprocessable Entity** | 验证错误 | 有效 JSON 但不符业务逻辑 |
| **429 Too Many Requests** | 超过速率限制 | 包含 `Retry-After` 头部 |

#### 服务器错误 (5xx)

| 代码 | 意义 | 使用时机 |
|------|------|---------|
| **500 Internal Server Error** | 非预期服务器错误 | 未处理的异常 |
| **502 Bad Gateway** | 上游服务错误 | 依赖服务故障 |
| **503 Service Unavailable** | 暂时无法使用 | 维护、过载 |
| **504 Gateway Timeout** | 上游超时 | 依赖服务超时 |

---

## URL 结构

### 基础 URL 格式

```
https://api.example.com/v1/resources
```

| 组成元素 | 惯例 | 范例 |
|----------|------|------|
| **协议** | 必须使用 HTTPS | `https://` |
| **子域名** | 使用 `api.` 前缀 | `api.example.com` |
| **版本** | 路径前缀 | `/v1/` |
| **资源** | 复数名词、kebab-case | `/user-profiles` |

### 资源层级

```
# 集合
GET /users

# 特定资源
GET /users/123

# 子资源集合（1 层嵌套）
GET /users/123/orders

# 特定子资源（2 层嵌套 — 上限）
GET /users/123/orders/456

# 避免更深层嵌套 — 使用顶层搭配筛选
GET /order-items?order_id=456
```

### 资源操作

对于非 CRUD 操作，使用子资源动作：

```
# 可接受的动作模式
POST /users/123/activate
POST /orders/456/cancel
POST /reports/generate

# 避免动词式 URL
POST /activateUser          # 错误
POST /cancelOrder           # 错误
```

---

## API 版本控制策略

### 比较矩阵

| 策略 | 范例 | 优点 | 缺点 |
|------|------|------|------|
| **URL 路径** | `/v1/users` | 明确、易于路由、可缓存 | URL 污染、较难迁移 |
| **头部** | `Accept-Version: v1` | 干净的 URL | 隐藏、不易在浏览器测试 |
| **查询参数** | `/users?v=1` | 易于新增 | 容易忽略、缓存问题 |
| **内容协商** | `Accept: application/vnd.api.v1+json` | 符合标准 | 复杂、难以发现 |

### 决策指南

```
是否需要同时支持多个版本？
├── 是 → URL 路径版本控制（最明确）
└── 否 → 是否优先考虑干净的 URL？
          ├── 是 → 头部版本控制
          └── 否 → URL 路径版本控制（较简单）
```

### 建议方式：URL 路径版本控制

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

### 版本生命周期

| 阶段 | 持续时间 | 动作 |
|------|----------|------|
| **现行** | 积极开发中 | 完整支持、新功能 |
| **支持中** | 后继版本发布后 6-12 个月 | 仅限错误修复、安全修补 |
| **已弃用** | 3-6 个月通知期 | Sunset 头部、迁移指南 |
| **已终止** | 弃用期结束后 | 返回 410 Gone 与迁移信息 |

### 弃用头部

```http
Sunset: Sat, 01 Jan 2028 00:00:00 GMT
Deprecation: true
Link: <https://api.example.com/v2/docs>; rel="successor-version"
```

---

## 请求/响应标准

### 内容头部

```http
# 请求
Content-Type: application/json
Accept: application/json

# 响应
Content-Type: application/json; charset=utf-8
```

### JSON 命名惯例

| 惯例 | 使用于 | 范例 |
|------|--------|------|
| **camelCase** | JSON 属性 | `firstName`, `createdAt` |
| **kebab-case** | URL 路径 | `/user-profiles` |
| **snake_case** | 查询参数 | `?sort_by=created_at` |

### 标准响应封装

```json
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "createdAt": "2026-03-18T10:30:00Z"
    }
  },
  "meta": {
    "requestId": "req-abc-123",
    "timestamp": "2026-03-18T10:30:00Z"
  }
}
```

### 集合响应封装

```json
{
  "data": [
    { "id": "1", "type": "user", "attributes": { "firstName": "John" } },
    { "id": "2", "type": "user", "attributes": { "firstName": "Jane" } }
  ],
  "meta": {
    "totalCount": 150,
    "page": 1,
    "pageSize": 20,
    "requestId": "req-abc-124"
  },
  "links": {
    "self": "/v1/users?page=1&limit=20",
    "next": "/v1/users?page=2&limit=20",
    "last": "/v1/users?page=8&limit=20"
  }
}
```

### 日期/时间格式

- 一律使用 **ISO 8601** 格式：`2026-03-18T10:30:00Z`
- API 响应一律使用 **UTC** 时区
- 接受含时区的输入，转换为 UTC 存储

---

## 分页

### 策略比较

| 策略 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **偏移量式** | 简单列表、有页码的 UI | 易于实现、可跳至特定页 | 数据变动时不一致、大数据集性能差 |
| **游标式** | 实时动态、大数据集 | 一致性佳、性能好 | 无法跳页、游标不透明 |
| **键集式** | 已排序的大数据集 | 性能极佳 | 需要稳定排序键 |

### 偏移量式分页

```
GET /v1/users?page=2&limit=20
```

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8
  },
  "links": {
    "first": "/v1/users?page=1&limit=20",
    "prev": "/v1/users?page=1&limit=20",
    "self": "/v1/users?page=2&limit=20",
    "next": "/v1/users?page=3&limit=20",
    "last": "/v1/users?page=8&limit=20"
  }
}
```

### 游标式分页

```
GET /v1/events?limit=20&cursor=eyJpZCI6MTAwfQ==
```

```json
{
  "data": [...],
  "meta": {
    "limit": 20,
    "hasMore": true
  },
  "links": {
    "self": "/v1/events?limit=20",
    "next": "/v1/events?limit=20&cursor=eyJpZCI6MTIwfQ=="
  }
}
```

### 默认值

| 参数 | 默认值 | 上限 |
|------|--------|------|
| `page` | 1 | - |
| `limit` / `page_size` | 20 | 100 |
| `cursor` | null（从头开始） | - |

---

## 筛选、排序与字段选择

### 筛选

```
# 简单相等
GET /v1/users?status=active

# 括号表示法（推荐用于复杂筛选）
GET /v1/users?filter[status]=active&filter[role]=admin

# 范围筛选
GET /v1/orders?filter[created_at][gte]=2026-01-01&filter[created_at][lte]=2026-03-18

# 多值（逗号分隔）
GET /v1/users?filter[role]=admin,editor
```

### 排序

```
# 升序（默认）
GET /v1/users?sort=created_at

# 降序（加 - 前缀）
GET /v1/users?sort=-created_at

# 多字段排序（逗号分隔）
GET /v1/users?sort=-created_at,last_name
```

### 字段选择（稀疏字段集）

```
# 选择特定字段
GET /v1/users?fields=id,first_name,email

# 依资源类型选择字段（JSON:API 风格）
GET /v1/articles?fields[article]=title,body&fields[author]=name
```

### 搜索

```
# 全文搜索
GET /v1/users?q=john+doe

# 范围搜索
GET /v1/users?search[name]=john&search[email]=example.com
```

---

## 身份验证模式

### 决策矩阵

| 方法 | 适用场景 | 复杂度 | 安全等级 |
|------|----------|--------|----------|
| **API Key** | 服务器对服务器、内部 API | 低 | 中 |
| **OAuth 2.0** | 第三方访问、用户授权委派 | 高 | 高 |
| **JWT Bearer** | 无状态验证、微服务 | 中 | 高 |
| **mTLS** | 服务网格、零信任 | 高 | 极高 |

### API Key

```http
# 头部（建议方式）
Authorization: ApiKey sk_live_abc123def456

# 查询参数（避免使用 — 会记录在服务器日志中）
GET /v1/users?api_key=sk_live_abc123def456
```

### OAuth 2.0 流程

| 流程 | 适用场景 | 客户端类型 |
|------|----------|-----------|
| **Authorization Code + PKCE** | 网页应用、移动应用 | 公开 |
| **Client Credentials** | 机器对机器 | 机密 |
| **Device Code** | IoT、CLI 工具 | 公开（受限输入） |
| **Refresh Token** | 长期有效的会话 | 任何 |

### JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT 最佳实践：**

| 规则 | 要求 |
|------|------|
| **算法** | RS256 或 ES256（非对称） |
| **Access token TTL** | 最多 15 分钟 |
| **Refresh token TTL** | 7-30 天 |
| **Payload** | 绝不包含敏感数据（密码、PII） |
| **验证** | 一律验证签名、发行者、受众、到期时间 |
| **撤销** | 维护 token 黑名单或使用短期 token |

---

## 速率限制

### 标准头部

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset: 1711036800
```

| 头部 | 说明 |
|------|------|
| `X-RateLimit-Limit` | 窗口内允许的最大请求数 |
| `X-RateLimit-Remaining` | 当前窗口内剩余的请求数 |
| `X-RateLimit-Reset` | 窗口重置的 Unix 时间戳 |
| `Retry-After` | 重试前等待的秒数（用于 429） |

### 速率限制层级

| 层级 | 限制 | 窗口 | 适用场景 |
|------|------|------|----------|
| **免费** | 100 请求 | 1 小时 | 公开/匿名 |
| **基本** | 1,000 请求 | 1 小时 | 已验证用户 |
| **专业** | 10,000 请求 | 1 小时 | 付费客户 |
| **企业** | 自定义 | 自定义 | 协商的 SLA |

### 429 响应

```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "You have exceeded the rate limit of 1000 requests per hour.",
  "instance": "/v1/users",
  "retryAfter": 3600
}
```

### 速率限制策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **固定窗口** | 在固定时间段内计算请求数 | 简单实现 |
| **滑动窗口** | 滚动式时间窗口 | 更精确的限制 |
| **令牌桶** | 以稳定速率补充令牌 | 允许突发流量 |
| **漏桶** | 以固定速率处理请求 | 平滑流量 |

---

## 错误响应格式

### RFC 7807 问题详情

所有错误响应必须遵循 [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) Problem Details 格式：

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The request body contains invalid fields.",
  "instance": "/v1/users",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Must be a valid email address."
    },
    {
      "field": "age",
      "code": "OUT_OF_RANGE",
      "message": "Must be between 0 and 150."
    }
  ],
  "traceId": "req-abc-123"
}
```

### 必要字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | URI | 错误文档的参考连结 |
| `title` | string | 简短、人类可读的摘要 |
| `status` | integer | HTTP 状态码 |
| `detail` | string | 针对此特定情况的人类可读说明 |

### 选用字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `instance` | URI | 造成错误的请求 URI |
| `errors` | array | 字段层级的验证错误 |
| `traceId` | string | 用于调试的请求追踪标识码 |

### 常见错误类型

```json
// 身份验证错误 (401)
{
  "type": "https://api.example.com/errors/authentication-required",
  "title": "Authentication Required",
  "status": 401,
  "detail": "A valid access token is required to access this resource."
}

// 授权错误 (403)
{
  "type": "https://api.example.com/errors/insufficient-permissions",
  "title": "Insufficient Permissions",
  "status": 403,
  "detail": "You do not have permission to delete this resource."
}

// 找不到资源 (404)
{
  "type": "https://api.example.com/errors/resource-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with ID '999' does not exist."
}
```

---

## GraphQL 设计原则

### Schema 设计

```graphql
# 类型使用 PascalCase
type User {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  createdAt: DateTime!
  orders(first: Int, after: String): OrderConnection!
}

# 使用描述性的 input 类型
input CreateUserInput {
  firstName: String!
  lastName: String!
  email: String!
}

# mutation 使用动词前缀
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

# Payload 类型含 userErrors
type CreateUserPayload {
  user: User
  userErrors: [UserError!]!
}

type UserError {
  field: [String!]
  message: String!
  code: UserErrorCode!
}
```

### 命名惯例

| 元素 | 惯例 | 范例 |
|------|------|------|
| **类型** | PascalCase | `UserProfile` |
| **字段** | camelCase | `firstName` |
| **枚举** | SCREAMING_SNAKE_CASE | `ORDER_STATUS` |
| **枚举值** | SCREAMING_SNAKE_CASE | `IN_PROGRESS` |
| **Mutation** | 动词 + 名词 | `createUser`, `updateOrder` |
| **Query** | 名词或名词片语 | `user`, `allUsers` |
| **Input 类型** | 动作 + 名词 + `Input` | `CreateUserInput` |
| **Payload 类型** | 动作 + 名词 + `Payload` | `CreateUserPayload` |

### Relay 风格分页（Connections）

```graphql
type Query {
  users(first: Int, after: String, last: Int, before: String): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 错误处理

```json
{
  "data": {
    "createUser": {
      "user": null,
      "userErrors": [
        {
          "field": ["input", "email"],
          "message": "Email is already in use.",
          "code": "TAKEN"
        }
      ]
    }
  }
}
```

---

## gRPC 服务设计

### Proto 文件惯例

```protobuf
syntax = "proto3";

package example.user.v1;

option go_package = "example.com/api/user/v1;userv1";
option java_package = "com.example.api.user.v1";

// UserService 管理用户帐号。
service UserService {
  // GetUser 依 ID 返回单一用户。
  rpc GetUser(GetUserRequest) returns (GetUserResponse);

  // ListUsers 返回分页的用户清单。
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);

  // CreateUser 创建新的用户帐号。
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);

  // UpdateUser 更新现有用户。
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);

  // DeleteUser 移除用户帐号。
  rpc DeleteUser(DeleteUserRequest) returns (google.protobuf.Empty);
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
  string filter = 3;
  string order_by = 4;
}

message ListUsersResponse {
  repeated User users = 1;
  string next_page_token = 2;
  int32 total_size = 3;
}

message User {
  string user_id = 1;
  string first_name = 2;
  string last_name = 3;
  string email = 4;
  google.protobuf.Timestamp created_at = 5;
}
```

### 命名惯例

| 元素 | 惯例 | 范例 |
|------|------|------|
| **包** | `company.service.version` | `example.user.v1` |
| **服务** | PascalCase + `Service` | `UserService` |
| **RPC 方法** | PascalCase 动词 + 名词 | `GetUser`, `ListUsers` |
| **消息** | PascalCase | `GetUserRequest` |
| **字段** | snake_case | `user_id`, `first_name` |
| **枚举** | PascalCase 类型、UPPER 值 | `Status`, `ACTIVE` |

### gRPC 错误码对应

| gRPC 代码 | HTTP 对应 | 说明 |
|-----------|----------|------|
| `OK` | 200 | 成功 |
| `INVALID_ARGUMENT` | 400 | 客户端指定了无效的参数 |
| `UNAUTHENTICATED` | 401 | 缺少或无效的身份验证 |
| `PERMISSION_DENIED` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `ALREADY_EXISTS` | 409 | 资源已存在 |
| `FAILED_PRECONDITION` | 412 | 因系统状态而拒绝操作 |
| `RESOURCE_EXHAUSTED` | 429 | 速率限制或配额超出 |
| `INTERNAL` | 500 | 内部服务器错误 |
| `UNAVAILABLE` | 503 | 服务不可用 |
| `DEADLINE_EXCEEDED` | 504 | 操作超时 |

---

## API 文档要求

### OpenAPI 规格要求

每个 REST API 必须具备 OpenAPI 3.x 规格，包含：

| 区段 | 必要 | 说明 |
|------|------|------|
| `info` | 是 | 标题、版本、描述、联系方式 |
| `servers` | 是 | 所有环境的基础 URL |
| `paths` | 是 | 所有端点及其操作 |
| `components/schemas` | 是 | 所有请求/响应 schema |
| `components/securitySchemes` | 是 | 身份验证方法 |
| `security` | 是 | 默认安全需求 |
| `tags` | 建议 | 端点的逻辑分组 |

### 文档检查清单

- [ ] 每个端点都有摘要与描述
- [ ] 所有参数都记载了类型、范例和限制条件
- [ ] POST/PUT/PATCH 提供请求主体范例
- [ ] 记载所有可能的响应代码与范例
- [ ] 指定每个端点的身份验证需求
- [ ] 记载速率限制
- [ ] 记载分页参数
- [ ] 记载错误响应格式与范例

### OpenAPI 范例

```yaml
openapi: 3.1.0
info:
  title: User Management API
  version: 1.0.0
  description: API for managing user accounts
  contact:
    email: api-support@example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://api.staging.example.com/v1
    description: Staging

paths:
  /users:
    get:
      summary: List all users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Successfully retrieved users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
```

---

## 安全考量

### 传输安全

| 要求 | 标准 |
|------|------|
| **HTTPS** | 所有 API 端点皆为必要 |
| **TLS 版本** | TLS 1.2 最低要求，TLS 1.3 建议 |
| **HSTS** | 包含 `Strict-Transport-Security` 头部 |
| **凭证** | 有效的凭证，生产环境不使用自签凭证 |

### CORS 配置

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

| 规则 | 要求 |
|------|------|
| **不使用通配符（`*`）搭配 credentials** | 指定确切的来源 |
| **限制方法** | 仅允许需要的 HTTP 方法 |
| **限制头部** | 仅允许需要的自定义头部 |
| **预检缓存** | 设定 `Max-Age` 以减少 OPTIONS 请求 |

### 输入验证

| 规则 | 实现方式 |
|------|----------|
| **验证所有输入** | 服务器端验证所有参数 |
| **使用允许清单** | 根据已知的正确模式验证 |
| **限制请求大小** | 设定 `Content-Length` 限制（例如 1 MB） |
| **消毒输出** | 防止响应中的注入攻击 |
| **参数化查询** | 绝不将用户输入串接到查询中 |

### API 安全头部

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store
Content-Security-Policy: default-src 'none'
```

---

## 快速参考卡

### URL 模式

```
[VERB] https://api.{domain}/v{N}/{resources}/{id}/{sub-resources}/{id}
```

### 响应结构

```
成功 → { data, meta, links }
错误 → { type, title, status, detail, errors, traceId }
```

### 必要头部

| 方向 | 头部 | 值 |
|------|------|-----|
| 请求 | `Content-Type` | `application/json` |
| 请求 | `Accept` | `application/json` |
| 请求 | `Authorization` | `Bearer {token}` |
| 响应 | `X-RateLimit-Limit` | `1000` |
| 响应 | `X-RateLimit-Remaining` | `994` |
| 响应 | `X-Request-ID` | `req-abc-123` |

### HTTP 动词速查表

| 动作 | 动词 | URL | 状态码 |
|------|------|-----|--------|
| 列表 | GET | `/users` | 200 |
| 读取 | GET | `/users/123` | 200 |
| 创建 | POST | `/users` | 201 |
| 完整更新 | PUT | `/users/123` | 200 |
| 部分更新 | PATCH | `/users/123` | 200 |
| 删除 | DELETE | `/users/123` | 204 |

---

## 相关标准

- [错误码标准](error-code-standards.md) - 错误码惯例与目录
- [安全标准](security-standards.md) - 身份验证、授权与安全实践
- [日志标准](logging-standards.md) - API 请求/响应日志
- [测试标准](testing-standards.md) - API 测试策略
- [文档撰写标准](documentation-writing-standards.md) - 撰写 API 文档

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-18 | 初始版本 |

---

## 参考资料

- [OpenAPI Specification](https://www.openapis.org/)
- [JSON:API Specification](https://jsonapi.org/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [RFC 7231 — HTTP/1.1 Semantics and Content](https://datatracker.ietf.org/doc/html/rfc7231)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
