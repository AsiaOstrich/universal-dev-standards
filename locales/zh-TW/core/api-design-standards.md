---
source: ../../../core/api-design-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-18
status: current
---

# API 設計標準

> **語言**: [English](../../../core/api-design-standards.md) | 繁體中文

> 版本: 1.0.0 | 最後更新: 2026-03-18

**適用範圍**: 所有軟體專案
**範疇**: universal
**業界標準**: OpenAPI 3.x, JSON:API 1.1, Google API Design Guide, RFC 7231 (HTTP 語意)
**參考資料**: [openapis.org](https://www.openapis.org/), [jsonapi.org](https://jsonapi.org/), [Google API Design Guide](https://cloud.google.com/apis/design), [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231)

---

## 目的

本標準定義設計、建構與維護 API 的全面性指南。涵蓋 REST、GraphQL 及 gRPC 範式，提供資源命名、版本控制、分頁、錯誤處理、身份驗證與文件撰寫的一致性模式。

**參考標準**:
- [OpenAPI Specification 3.x](https://spec.openapis.org/oas/v3.1.0)
- [JSON:API 1.1](https://jsonapi.org/format/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [RFC 7231 — HTTP 語意](https://datatracker.ietf.org/doc/html/rfc7231)
- [RFC 7807 — HTTP API 問題詳情](https://datatracker.ietf.org/doc/html/rfc7807)

---

## REST 設計原則

### 資源命名

| 規則 | 正確 | 錯誤 |
|------|------|------|
| **使用名詞，非動詞** | `/users` | `/getUsers` |
| **使用複數名詞** | `/articles` | `/article` |
| **使用 kebab-case** | `/user-profiles` | `/userProfiles`, `/user_profiles` |
| **使用小寫** | `/orders` | `/Orders` |
| **巢狀表示關聯** | `/users/123/orders` | `/getUserOrders?userId=123` |
| **最多 2 層巢狀** | `/users/123/orders` | `/users/123/orders/456/items/789/details` |

### HTTP 動詞

| 動詞 | 用途 | 請求主體 | 冪等性 | 安全性 |
|------|------|---------|--------|--------|
| **GET** | 取得資源 | 無 | 是 | 是 |
| **POST** | 建立新資源 | 有 | 否 | 否 |
| **PUT** | 完整取代資源 | 有 | 是 | 否 |
| **PATCH** | 部分更新資源 | 有 | 否 | 否 |
| **DELETE** | 移除資源 | 選用 | 是 | 否 |
| **HEAD** | 與 GET 相同但不含主體 | 無 | 是 | 是 |
| **OPTIONS** | 描述通訊選項 | 無 | 是 | 是 |

### HTTP 狀態碼

#### 成功 (2xx)

| 代碼 | 意義 | 使用時機 |
|------|------|---------|
| **200 OK** | 一般成功 | GET、PUT、PATCH、含主體的 DELETE |
| **201 Created** | 資源已建立 | POST（包含 `Location` 標頭） |
| **202 Accepted** | 請求已接受，非同步處理中 | 長時間執行的操作 |
| **204 No Content** | 成功但無主體 | DELETE、無回應主體的 PUT |

#### 用戶端錯誤 (4xx)

| 代碼 | 意義 | 使用時機 |
|------|------|---------|
| **400 Bad Request** | 格式錯誤的請求 | 無效 JSON、缺少必要欄位 |
| **401 Unauthorized** | 需要身份驗證 | 無 token、token 過期 |
| **403 Forbidden** | 權限不足 | 有效 token，角色不符 |
| **404 Not Found** | 資源不存在 | 無效的資源 ID |
| **405 Method Not Allowed** | 不支援的 HTTP 方法 | 對唯讀端點使用 POST |
| **409 Conflict** | 狀態衝突 | 重複建立、版本衝突 |
| **422 Unprocessable Entity** | 驗證錯誤 | 有效 JSON 但不符商業邏輯 |
| **429 Too Many Requests** | 超過速率限制 | 包含 `Retry-After` 標頭 |

#### 伺服器錯誤 (5xx)

| 代碼 | 意義 | 使用時機 |
|------|------|---------|
| **500 Internal Server Error** | 非預期伺服器錯誤 | 未處理的例外 |
| **502 Bad Gateway** | 上游服務錯誤 | 依賴服務故障 |
| **503 Service Unavailable** | 暫時無法使用 | 維護、過載 |
| **504 Gateway Timeout** | 上游逾時 | 依賴服務逾時 |

---

## URL 結構

### 基礎 URL 格式

```
https://api.example.com/v1/resources
```

| 組成元素 | 慣例 | 範例 |
|----------|------|------|
| **協定** | 必須使用 HTTPS | `https://` |
| **子網域** | 使用 `api.` 前綴 | `api.example.com` |
| **版本** | 路徑前綴 | `/v1/` |
| **資源** | 複數名詞、kebab-case | `/user-profiles` |

### 資源階層

```
# 集合
GET /users

# 特定資源
GET /users/123

# 子資源集合（1 層巢狀）
GET /users/123/orders

# 特定子資源（2 層巢狀 — 上限）
GET /users/123/orders/456

# 避免更深層巢狀 — 使用頂層搭配篩選
GET /order-items?order_id=456
```

### 資源操作

對於非 CRUD 操作，使用子資源動作：

```
# 可接受的動作模式
POST /users/123/activate
POST /orders/456/cancel
POST /reports/generate

# 避免動詞式 URL
POST /activateUser          # 錯誤
POST /cancelOrder           # 錯誤
```

---

## API 版本控制策略

### 比較矩陣

| 策略 | 範例 | 優點 | 缺點 |
|------|------|------|------|
| **URL 路徑** | `/v1/users` | 明確、易於路由、可快取 | URL 汙染、較難遷移 |
| **標頭** | `Accept-Version: v1` | 乾淨的 URL | 隱藏、不易在瀏覽器測試 |
| **查詢參數** | `/users?v=1` | 易於新增 | 容易忽略、快取問題 |
| **內容協商** | `Accept: application/vnd.api.v1+json` | 符合標準 | 複雜、難以發現 |

### 決策指南

```
是否需要同時支援多個版本？
├── 是 → URL 路徑版本控制（最明確）
└── 否 → 是否優先考慮乾淨的 URL？
          ├── 是 → 標頭版本控制
          └── 否 → URL 路徑版本控制（較簡單）
```

### 建議方式：URL 路徑版本控制

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

### 版本生命週期

| 階段 | 持續時間 | 動作 |
|------|----------|------|
| **現行** | 積極開發中 | 完整支援、新功能 |
| **支援中** | 後繼版本發布後 6-12 個月 | 僅限錯誤修復、安全修補 |
| **已棄用** | 3-6 個月通知期 | Sunset 標頭、遷移指南 |
| **已終止** | 棄用期結束後 | 回傳 410 Gone 與遷移資訊 |

### 棄用標頭

```http
Sunset: Sat, 01 Jan 2028 00:00:00 GMT
Deprecation: true
Link: <https://api.example.com/v2/docs>; rel="successor-version"
```

---

## 請求/回應標準

### 內容標頭

```http
# 請求
Content-Type: application/json
Accept: application/json

# 回應
Content-Type: application/json; charset=utf-8
```

### JSON 命名慣例

| 慣例 | 使用於 | 範例 |
|------|--------|------|
| **camelCase** | JSON 屬性 | `firstName`, `createdAt` |
| **kebab-case** | URL 路徑 | `/user-profiles` |
| **snake_case** | 查詢參數 | `?sort_by=created_at` |

### 標準回應封裝

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

### 集合回應封裝

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

### 日期/時間格式

- 一律使用 **ISO 8601** 格式：`2026-03-18T10:30:00Z`
- API 回應一律使用 **UTC** 時區
- 接受含時區的輸入，轉換為 UTC 儲存

---

## 分頁

### 策略比較

| 策略 | 適用場景 | 優點 | 缺點 |
|------|----------|------|------|
| **偏移量式** | 簡單列表、有頁碼的 UI | 易於實作、可跳至特定頁 | 資料變動時不一致、大資料集效能差 |
| **游標式** | 即時動態、大資料集 | 一致性佳、效能好 | 無法跳頁、游標不透明 |
| **鍵集式** | 已排序的大資料集 | 效能極佳 | 需要穩定排序鍵 |

### 偏移量式分頁

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

### 游標式分頁

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

### 預設值

| 參數 | 預設值 | 上限 |
|------|--------|------|
| `page` | 1 | - |
| `limit` / `page_size` | 20 | 100 |
| `cursor` | null（從頭開始） | - |

---

## 篩選、排序與欄位選擇

### 篩選

```
# 簡單相等
GET /v1/users?status=active

# 括號表示法（推薦用於複雜篩選）
GET /v1/users?filter[status]=active&filter[role]=admin

# 範圍篩選
GET /v1/orders?filter[created_at][gte]=2026-01-01&filter[created_at][lte]=2026-03-18

# 多值（逗號分隔）
GET /v1/users?filter[role]=admin,editor
```

### 排序

```
# 升序（預設）
GET /v1/users?sort=created_at

# 降序（加 - 前綴）
GET /v1/users?sort=-created_at

# 多欄位排序（逗號分隔）
GET /v1/users?sort=-created_at,last_name
```

### 欄位選擇（稀疏欄位集）

```
# 選擇特定欄位
GET /v1/users?fields=id,first_name,email

# 依資源類型選擇欄位（JSON:API 風格）
GET /v1/articles?fields[article]=title,body&fields[author]=name
```

### 搜尋

```
# 全文搜尋
GET /v1/users?q=john+doe

# 範圍搜尋
GET /v1/users?search[name]=john&search[email]=example.com
```

---

## 身份驗證模式

### 決策矩陣

| 方法 | 適用場景 | 複雜度 | 安全等級 |
|------|----------|--------|----------|
| **API Key** | 伺服器對伺服器、內部 API | 低 | 中 |
| **OAuth 2.0** | 第三方存取、使用者授權委派 | 高 | 高 |
| **JWT Bearer** | 無狀態驗證、微服務 | 中 | 高 |
| **mTLS** | 服務網格、零信任 | 高 | 極高 |

### API Key

```http
# 標頭（建議方式）
Authorization: ApiKey sk_live_abc123def456

# 查詢參數（避免使用 — 會記錄在伺服器日誌中）
GET /v1/users?api_key=sk_live_abc123def456
```

### OAuth 2.0 流程

| 流程 | 適用場景 | 用戶端類型 |
|------|----------|-----------|
| **Authorization Code + PKCE** | 網頁應用、行動應用 | 公開 |
| **Client Credentials** | 機器對機器 | 機密 |
| **Device Code** | IoT、CLI 工具 | 公開（受限輸入） |
| **Refresh Token** | 長期有效的工作階段 | 任何 |

### JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT 最佳實踐：**

| 規則 | 要求 |
|------|------|
| **演算法** | RS256 或 ES256（非對稱） |
| **Access token TTL** | 最多 15 分鐘 |
| **Refresh token TTL** | 7-30 天 |
| **Payload** | 絕不包含敏感資料（密碼、PII） |
| **驗證** | 一律驗證簽名、發行者、受眾、到期時間 |
| **撤銷** | 維護 token 黑名單或使用短期 token |

---

## 速率限制

### 標準標頭

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset: 1711036800
```

| 標頭 | 說明 |
|------|------|
| `X-RateLimit-Limit` | 視窗內允許的最大請求數 |
| `X-RateLimit-Remaining` | 目前視窗內剩餘的請求數 |
| `X-RateLimit-Reset` | 視窗重設的 Unix 時間戳 |
| `Retry-After` | 重試前等待的秒數（用於 429） |

### 速率限制層級

| 層級 | 限制 | 視窗 | 適用場景 |
|------|------|------|----------|
| **免費** | 100 請求 | 1 小時 | 公開/匿名 |
| **基本** | 1,000 請求 | 1 小時 | 已驗證使用者 |
| **專業** | 10,000 請求 | 1 小時 | 付費客戶 |
| **企業** | 自訂 | 自訂 | 協商的 SLA |

### 429 回應

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

| 策略 | 說明 | 適用場景 |
|------|------|----------|
| **固定視窗** | 在固定時間段內計算請求數 | 簡單實作 |
| **滑動視窗** | 滾動式時間視窗 | 更精確的限制 |
| **令牌桶** | 以穩定速率補充令牌 | 允許突發流量 |
| **漏桶** | 以固定速率處理請求 | 平滑流量 |

---

## 錯誤回應格式

### RFC 7807 問題詳情

所有錯誤回應必須遵循 [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) Problem Details 格式：

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

### 必要欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `type` | URI | 錯誤文件的參考連結 |
| `title` | string | 簡短、人類可讀的摘要 |
| `status` | integer | HTTP 狀態碼 |
| `detail` | string | 針對此特定情況的人類可讀說明 |

### 選用欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `instance` | URI | 造成錯誤的請求 URI |
| `errors` | array | 欄位層級的驗證錯誤 |
| `traceId` | string | 用於除錯的請求追蹤識別碼 |

### 常見錯誤類型

```json
// 身份驗證錯誤 (401)
{
  "type": "https://api.example.com/errors/authentication-required",
  "title": "Authentication Required",
  "status": 401,
  "detail": "A valid access token is required to access this resource."
}

// 授權錯誤 (403)
{
  "type": "https://api.example.com/errors/insufficient-permissions",
  "title": "Insufficient Permissions",
  "status": 403,
  "detail": "You do not have permission to delete this resource."
}

// 找不到資源 (404)
{
  "type": "https://api.example.com/errors/resource-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with ID '999' does not exist."
}
```

---

## GraphQL 設計原則

### Schema 設計

```graphql
# 類型使用 PascalCase
type User {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  createdAt: DateTime!
  orders(first: Int, after: String): OrderConnection!
}

# 使用描述性的 input 類型
input CreateUserInput {
  firstName: String!
  lastName: String!
  email: String!
}

# mutation 使用動詞前綴
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

# Payload 類型含 userErrors
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

### 命名慣例

| 元素 | 慣例 | 範例 |
|------|------|------|
| **類型** | PascalCase | `UserProfile` |
| **欄位** | camelCase | `firstName` |
| **列舉** | SCREAMING_SNAKE_CASE | `ORDER_STATUS` |
| **列舉值** | SCREAMING_SNAKE_CASE | `IN_PROGRESS` |
| **Mutation** | 動詞 + 名詞 | `createUser`, `updateOrder` |
| **Query** | 名詞或名詞片語 | `user`, `allUsers` |
| **Input 類型** | 動作 + 名詞 + `Input` | `CreateUserInput` |
| **Payload 類型** | 動作 + 名詞 + `Payload` | `CreateUserPayload` |

### Relay 風格分頁（Connections）

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

### 錯誤處理

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

## gRPC 服務設計

### Proto 檔案慣例

```protobuf
syntax = "proto3";

package example.user.v1;

option go_package = "example.com/api/user/v1;userv1";
option java_package = "com.example.api.user.v1";

// UserService 管理使用者帳號。
service UserService {
  // GetUser 依 ID 回傳單一使用者。
  rpc GetUser(GetUserRequest) returns (GetUserResponse);

  // ListUsers 回傳分頁的使用者清單。
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);

  // CreateUser 建立新的使用者帳號。
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);

  // UpdateUser 更新現有使用者。
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);

  // DeleteUser 移除使用者帳號。
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

### 命名慣例

| 元素 | 慣例 | 範例 |
|------|------|------|
| **套件** | `company.service.version` | `example.user.v1` |
| **服務** | PascalCase + `Service` | `UserService` |
| **RPC 方法** | PascalCase 動詞 + 名詞 | `GetUser`, `ListUsers` |
| **訊息** | PascalCase | `GetUserRequest` |
| **欄位** | snake_case | `user_id`, `first_name` |
| **列舉** | PascalCase 類型、UPPER 值 | `Status`, `ACTIVE` |

### gRPC 錯誤碼對應

| gRPC 代碼 | HTTP 對應 | 說明 |
|-----------|----------|------|
| `OK` | 200 | 成功 |
| `INVALID_ARGUMENT` | 400 | 用戶端指定了無效的引數 |
| `UNAUTHENTICATED` | 401 | 缺少或無效的身份驗證 |
| `PERMISSION_DENIED` | 403 | 權限不足 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `ALREADY_EXISTS` | 409 | 資源已存在 |
| `FAILED_PRECONDITION` | 412 | 因系統狀態而拒絕操作 |
| `RESOURCE_EXHAUSTED` | 429 | 速率限制或配額超出 |
| `INTERNAL` | 500 | 內部伺服器錯誤 |
| `UNAVAILABLE` | 503 | 服務不可用 |
| `DEADLINE_EXCEEDED` | 504 | 操作逾時 |

---

## API 文件要求

### OpenAPI 規格要求

每個 REST API 必須具備 OpenAPI 3.x 規格，包含：

| 區段 | 必要 | 說明 |
|------|------|------|
| `info` | 是 | 標題、版本、描述、聯絡方式 |
| `servers` | 是 | 所有環境的基礎 URL |
| `paths` | 是 | 所有端點及其操作 |
| `components/schemas` | 是 | 所有請求/回應 schema |
| `components/securitySchemes` | 是 | 身份驗證方法 |
| `security` | 是 | 預設安全需求 |
| `tags` | 建議 | 端點的邏輯分組 |

### 文件檢查清單

- [ ] 每個端點都有摘要與描述
- [ ] 所有參數都記載了類型、範例和限制條件
- [ ] POST/PUT/PATCH 提供請求主體範例
- [ ] 記載所有可能的回應代碼與範例
- [ ] 指定每個端點的身份驗證需求
- [ ] 記載速率限制
- [ ] 記載分頁參數
- [ ] 記載錯誤回應格式與範例

### OpenAPI 範例

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

### 傳輸安全

| 要求 | 標準 |
|------|------|
| **HTTPS** | 所有 API 端點皆為必要 |
| **TLS 版本** | TLS 1.2 最低要求，TLS 1.3 建議 |
| **HSTS** | 包含 `Strict-Transport-Security` 標頭 |
| **憑證** | 有效的憑證，生產環境不使用自簽憑證 |

### CORS 設定

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

| 規則 | 要求 |
|------|------|
| **不使用萬用字元（`*`）搭配 credentials** | 指定確切的來源 |
| **限制方法** | 僅允許需要的 HTTP 方法 |
| **限制標頭** | 僅允許需要的自訂標頭 |
| **預檢快取** | 設定 `Max-Age` 以減少 OPTIONS 請求 |

### 輸入驗證

| 規則 | 實作方式 |
|------|----------|
| **驗證所有輸入** | 伺服器端驗證所有參數 |
| **使用允許清單** | 根據已知的正確模式驗證 |
| **限制請求大小** | 設定 `Content-Length` 限制（例如 1 MB） |
| **消毒輸出** | 防止回應中的注入攻擊 |
| **參數化查詢** | 絕不將使用者輸入串接到查詢中 |

### API 安全標頭

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store
Content-Security-Policy: default-src 'none'
```

---

## 快速參考卡

### URL 模式

```
[VERB] https://api.{domain}/v{N}/{resources}/{id}/{sub-resources}/{id}
```

### 回應結構

```
成功 → { data, meta, links }
錯誤 → { type, title, status, detail, errors, traceId }
```

### 必要標頭

| 方向 | 標頭 | 值 |
|------|------|-----|
| 請求 | `Content-Type` | `application/json` |
| 請求 | `Accept` | `application/json` |
| 請求 | `Authorization` | `Bearer {token}` |
| 回應 | `X-RateLimit-Limit` | `1000` |
| 回應 | `X-RateLimit-Remaining` | `994` |
| 回應 | `X-Request-ID` | `req-abc-123` |

### HTTP 動詞速查表

| 動作 | 動詞 | URL | 狀態碼 |
|------|------|-----|--------|
| 列表 | GET | `/users` | 200 |
| 讀取 | GET | `/users/123` | 200 |
| 建立 | POST | `/users` | 201 |
| 完整更新 | PUT | `/users/123` | 200 |
| 部分更新 | PATCH | `/users/123` | 200 |
| 刪除 | DELETE | `/users/123` | 204 |

---

## 相關標準

- [錯誤碼標準](error-code-standards.md) - 錯誤碼慣例與目錄
- [安全標準](security-standards.md) - 身份驗證、授權與安全實踐
- [日誌標準](logging-standards.md) - API 請求/回應日誌
- [測試標準](testing-standards.md) - API 測試策略
- [文件撰寫標準](documentation-writing-standards.md) - 撰寫 API 文件

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-18 | 初始版本 |

---

## 參考資料

- [OpenAPI Specification](https://www.openapis.org/)
- [JSON:API Specification](https://jsonapi.org/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [RFC 7231 — HTTP/1.1 Semantics and Content](https://datatracker.ietf.org/doc/html/rfc7231)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
