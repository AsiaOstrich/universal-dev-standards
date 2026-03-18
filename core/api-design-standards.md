# API Design Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/api-design-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-18
**Applicability**: All software projects
**Scope**: universal
**Industry Standards**: OpenAPI 3.x, JSON:API 1.1, Google API Design Guide, RFC 7231 (HTTP Semantics)
**References**: [openapis.org](https://www.openapis.org/), [jsonapi.org](https://jsonapi.org/), [Google API Design Guide](https://cloud.google.com/apis/design), [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231)

---

## Purpose

This standard defines comprehensive guidelines for designing, building, and maintaining APIs. It covers REST, GraphQL, and gRPC paradigms, providing consistent patterns for resource naming, versioning, pagination, error handling, authentication, and documentation.

**Reference Standards**:
- [OpenAPI Specification 3.x](https://spec.openapis.org/oas/v3.1.0)
- [JSON:API 1.1](https://jsonapi.org/format/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [RFC 7231 — HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc7231)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)

---

## REST Design Principles

### Resource Naming

| Rule | Correct | Incorrect |
|------|---------|-----------|
| **Use nouns, not verbs** | `/users` | `/getUsers` |
| **Use plural nouns** | `/articles` | `/article` |
| **Use kebab-case** | `/user-profiles` | `/userProfiles`, `/user_profiles` |
| **Use lowercase** | `/orders` | `/Orders` |
| **Nest for relationships** | `/users/123/orders` | `/getUserOrders?userId=123` |
| **Max 2 nesting levels** | `/users/123/orders` | `/users/123/orders/456/items/789/details` |

### HTTP Verbs

| Verb | Purpose | Request Body | Idempotent | Safe |
|------|---------|-------------|------------|------|
| **GET** | Retrieve resource(s) | No | Yes | Yes |
| **POST** | Create new resource | Yes | No | No |
| **PUT** | Full replacement of resource | Yes | Yes | No |
| **PATCH** | Partial update of resource | Yes | No | No |
| **DELETE** | Remove resource | Optional | Yes | No |
| **HEAD** | Same as GET without body | No | Yes | Yes |
| **OPTIONS** | Describe communication options | No | Yes | Yes |

### HTTP Status Codes

#### Success (2xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200 OK** | General success | GET, PUT, PATCH, DELETE with body |
| **201 Created** | Resource created | POST (include `Location` header) |
| **202 Accepted** | Request accepted for async processing | Long-running operations |
| **204 No Content** | Success with no body | DELETE, PUT with no response body |

#### Client Errors (4xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| **400 Bad Request** | Malformed request | Invalid JSON, missing required fields |
| **401 Unauthorized** | Authentication required | No token, expired token |
| **403 Forbidden** | Insufficient permissions | Valid token, wrong role |
| **404 Not Found** | Resource does not exist | Invalid resource ID |
| **405 Method Not Allowed** | HTTP method not supported | POST to read-only endpoint |
| **409 Conflict** | State conflict | Duplicate creation, version conflict |
| **422 Unprocessable Entity** | Validation error | Valid JSON but fails business rules |
| **429 Too Many Requests** | Rate limit exceeded | Include `Retry-After` header |

#### Server Errors (5xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| **500 Internal Server Error** | Unexpected server error | Unhandled exceptions |
| **502 Bad Gateway** | Upstream service error | Dependency failure |
| **503 Service Unavailable** | Temporarily unavailable | Maintenance, overload |
| **504 Gateway Timeout** | Upstream timeout | Dependency timeout |

---

## URL Structure

### Base URL Format

```
https://api.example.com/v1/resources
```

| Component | Convention | Example |
|-----------|-----------|---------|
| **Protocol** | Always HTTPS | `https://` |
| **Subdomain** | `api.` prefix | `api.example.com` |
| **Version** | Path prefix | `/v1/` |
| **Resource** | Plural noun, kebab-case | `/user-profiles` |

### Resource Hierarchy

```
# Collection
GET /users

# Specific resource
GET /users/123

# Sub-resource collection (1 level nesting)
GET /users/123/orders

# Specific sub-resource (2 level nesting — maximum)
GET /users/123/orders/456

# Avoid deeper nesting — use top-level with filters
GET /order-items?order_id=456
```

### Actions on Resources

For non-CRUD operations, use sub-resource actions:

```
# Acceptable action patterns
POST /users/123/activate
POST /orders/456/cancel
POST /reports/generate

# Avoid verb-based URLs
POST /activateUser          # Wrong
POST /cancelOrder           # Wrong
```

---

## API Versioning Strategies

### Comparison Matrix

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URL Path** | `/v1/users` | Explicit, easy to route, cacheable | URL pollution, harder migration |
| **Header** | `Accept-Version: v1` | Clean URLs | Hidden, harder to test in browser |
| **Query Param** | `/users?v=1` | Easy to add | Easily overlooked, caching issues |
| **Content Negotiation** | `Accept: application/vnd.api.v1+json` | Standards-based | Complex, hard to discover |

### Decision Guide

```
Do you need to support multiple versions concurrently?
├── Yes → URL Path versioning (most explicit)
└── No  → Do you prioritize clean URLs?
          ├── Yes → Header versioning
          └── No  → URL Path versioning (simpler)
```

### Recommended: URL Path Versioning

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

### Version Lifecycle

| Phase | Duration | Action |
|-------|----------|--------|
| **Current** | Active development | Full support, new features |
| **Supported** | 6-12 months after successor | Bug fixes, security patches only |
| **Deprecated** | 3-6 months notice | Sunset header, migration guide |
| **Retired** | After deprecation period | Return 410 Gone with migration info |

### Deprecation Headers

```http
Sunset: Sat, 01 Jan 2028 00:00:00 GMT
Deprecation: true
Link: <https://api.example.com/v2/docs>; rel="successor-version"
```

---

## Request/Response Standards

### Content Headers

```http
# Request
Content-Type: application/json
Accept: application/json

# Response
Content-Type: application/json; charset=utf-8
```

### JSON Naming Convention

| Convention | Use In | Example |
|------------|--------|---------|
| **camelCase** | JSON properties | `firstName`, `createdAt` |
| **kebab-case** | URL paths | `/user-profiles` |
| **snake_case** | Query parameters | `?sort_by=created_at` |

### Standard Response Envelope

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

### Collection Response Envelope

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

### Date/Time Format

- Always use **ISO 8601** format: `2026-03-18T10:30:00Z`
- Always use **UTC** timezone in API responses
- Accept timezone-aware input, convert to UTC for storage

---

## Pagination

### Strategy Comparison

| Strategy | Best For | Pros | Cons |
|----------|----------|------|------|
| **Offset-based** | Simple lists, UI with page numbers | Easy to implement, jump to page | Inconsistent with mutations, slow on large datasets |
| **Cursor-based** | Real-time feeds, large datasets | Consistent, performant | Cannot jump to page, opaque cursor |
| **Keyset-based** | Sorted large datasets | Very performant | Requires stable sort key |

### Offset-based Pagination

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

### Cursor-based Pagination

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

### Default Values

| Parameter | Default | Maximum |
|-----------|---------|---------|
| `page` | 1 | - |
| `limit` / `page_size` | 20 | 100 |
| `cursor` | null (start) | - |

---

## Filtering, Sorting, and Field Selection

### Filtering

```
# Simple equality
GET /v1/users?status=active

# Bracket notation (recommended for complex filters)
GET /v1/users?filter[status]=active&filter[role]=admin

# Range filters
GET /v1/orders?filter[created_at][gte]=2026-01-01&filter[created_at][lte]=2026-03-18

# Multiple values (comma-separated)
GET /v1/users?filter[role]=admin,editor
```

### Sorting

```
# Ascending (default)
GET /v1/users?sort=created_at

# Descending (prefix with -)
GET /v1/users?sort=-created_at

# Multiple sort fields (comma-separated)
GET /v1/users?sort=-created_at,last_name
```

### Field Selection (Sparse Fieldsets)

```
# Select specific fields
GET /v1/users?fields=id,first_name,email

# Per-resource-type fields (JSON:API style)
GET /v1/articles?fields[article]=title,body&fields[author]=name
```

### Search

```
# Full-text search
GET /v1/users?q=john+doe

# Scoped search
GET /v1/users?search[name]=john&search[email]=example.com
```

---

## Authentication Patterns

### Decision Matrix

| Method | Use Case | Complexity | Security Level |
|--------|----------|-----------|----------------|
| **API Key** | Server-to-server, internal APIs | Low | Medium |
| **OAuth 2.0** | Third-party access, user delegation | High | High |
| **JWT Bearer** | Stateless auth, microservices | Medium | High |
| **mTLS** | Service mesh, zero-trust | High | Very High |

### API Key

```http
# Header (preferred)
Authorization: ApiKey sk_live_abc123def456

# Query parameter (avoid — logged in server logs)
GET /v1/users?api_key=sk_live_abc123def456
```

### OAuth 2.0 Flows

| Flow | Use Case | Client Type |
|------|----------|-------------|
| **Authorization Code + PKCE** | Web apps, mobile apps | Public |
| **Client Credentials** | Machine-to-machine | Confidential |
| **Device Code** | IoT, CLI tools | Public (input-constrained) |
| **Refresh Token** | Long-lived sessions | Any |

### JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Best Practices:**

| Rule | Requirement |
|------|-------------|
| **Algorithm** | RS256 or ES256 (asymmetric) |
| **Access token TTL** | 15 minutes maximum |
| **Refresh token TTL** | 7-30 days |
| **Payload** | Never include sensitive data (passwords, PII) |
| **Validation** | Always verify signature, issuer, audience, expiry |
| **Revocation** | Maintain a token blacklist or use short-lived tokens |

---

## Rate Limiting

### Standard Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset: 1711036800
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `Retry-After` | Seconds to wait before retrying (on 429) |

### Rate Limit Tiers

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| **Free** | 100 requests | 1 hour | Public/anonymous |
| **Basic** | 1,000 requests | 1 hour | Authenticated users |
| **Pro** | 10,000 requests | 1 hour | Paying customers |
| **Enterprise** | Custom | Custom | Negotiated SLAs |

### 429 Response

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

### Rate Limiting Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Fixed Window** | Count requests in fixed time slots | Simple implementations |
| **Sliding Window** | Rolling window of time | More accurate limiting |
| **Token Bucket** | Refill tokens at a steady rate | Burst tolerance |
| **Leaky Bucket** | Process requests at a constant rate | Smooth traffic |

---

## Error Response Format

### RFC 7807 Problem Details

All error responses MUST follow the [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) Problem Details format:

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

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | URI | Reference to error documentation |
| `title` | string | Short, human-readable summary |
| `status` | integer | HTTP status code |
| `detail` | string | Human-readable explanation specific to this occurrence |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `instance` | URI | URI of the request that caused the error |
| `errors` | array | Field-level validation errors |
| `traceId` | string | Request trace identifier for debugging |

### Common Error Types

```json
// Authentication Error (401)
{
  "type": "https://api.example.com/errors/authentication-required",
  "title": "Authentication Required",
  "status": 401,
  "detail": "A valid access token is required to access this resource."
}

// Authorization Error (403)
{
  "type": "https://api.example.com/errors/insufficient-permissions",
  "title": "Insufficient Permissions",
  "status": 403,
  "detail": "You do not have permission to delete this resource."
}

// Not Found (404)
{
  "type": "https://api.example.com/errors/resource-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with ID '999' does not exist."
}
```

---

## GraphQL Design Principles

### Schema Design

```graphql
# Use PascalCase for types
type User {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  createdAt: DateTime!
  orders(first: Int, after: String): OrderConnection!
}

# Use descriptive input types
input CreateUserInput {
  firstName: String!
  lastName: String!
  email: String!
}

# Use verb prefixes for mutations
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

# Payload types with userErrors
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

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Types** | PascalCase | `UserProfile` |
| **Fields** | camelCase | `firstName` |
| **Enums** | SCREAMING_SNAKE_CASE | `ORDER_STATUS` |
| **Enum values** | SCREAMING_SNAKE_CASE | `IN_PROGRESS` |
| **Mutations** | verb + noun | `createUser`, `updateOrder` |
| **Queries** | noun or noun phrase | `user`, `allUsers` |
| **Input types** | action + noun + `Input` | `CreateUserInput` |
| **Payload types** | action + noun + `Payload` | `CreateUserPayload` |

### Relay-style Pagination (Connections)

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

### Error Handling

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

## gRPC Service Design

### Proto File Conventions

```protobuf
syntax = "proto3";

package example.user.v1;

option go_package = "example.com/api/user/v1;userv1";
option java_package = "com.example.api.user.v1";

// UserService manages user accounts.
service UserService {
  // GetUser returns a single user by ID.
  rpc GetUser(GetUserRequest) returns (GetUserResponse);

  // ListUsers returns a paginated list of users.
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);

  // CreateUser creates a new user account.
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);

  // UpdateUser updates an existing user.
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);

  // DeleteUser removes a user account.
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

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Package** | `company.service.version` | `example.user.v1` |
| **Service** | PascalCase + `Service` | `UserService` |
| **RPC methods** | PascalCase verb + noun | `GetUser`, `ListUsers` |
| **Messages** | PascalCase | `GetUserRequest` |
| **Fields** | snake_case | `user_id`, `first_name` |
| **Enums** | PascalCase type, UPPER values | `Status`, `ACTIVE` |

### gRPC Error Codes Mapping

| gRPC Code | HTTP Equivalent | Description |
|-----------|----------------|-------------|
| `OK` | 200 | Success |
| `INVALID_ARGUMENT` | 400 | Client specified invalid argument |
| `UNAUTHENTICATED` | 401 | Missing or invalid authentication |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource already exists |
| `FAILED_PRECONDITION` | 412 | Operation rejected due to system state |
| `RESOURCE_EXHAUSTED` | 429 | Rate limit or quota exceeded |
| `INTERNAL` | 500 | Internal server error |
| `UNAVAILABLE` | 503 | Service unavailable |
| `DEADLINE_EXCEEDED` | 504 | Operation timed out |

---

## API Documentation Requirements

### OpenAPI Specification Requirements

Every REST API MUST have an OpenAPI 3.x specification that includes:

| Section | Required | Description |
|---------|----------|-------------|
| `info` | Yes | Title, version, description, contact |
| `servers` | Yes | Base URLs for all environments |
| `paths` | Yes | All endpoints with operations |
| `components/schemas` | Yes | All request/response schemas |
| `components/securitySchemes` | Yes | Authentication methods |
| `security` | Yes | Default security requirements |
| `tags` | Recommended | Logical grouping of endpoints |

### Documentation Checklist

- [ ] Every endpoint has a summary and description
- [ ] All parameters are documented with types, examples, and constraints
- [ ] Request body examples provided for POST/PUT/PATCH
- [ ] All possible response codes documented with examples
- [ ] Authentication requirements specified per endpoint
- [ ] Rate limiting documented
- [ ] Pagination parameters documented
- [ ] Error response format documented with examples

### OpenAPI Example

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

## Security Considerations

### Transport Security

| Requirement | Standard |
|-------------|----------|
| **HTTPS** | Mandatory for all API endpoints |
| **TLS Version** | TLS 1.2 minimum, TLS 1.3 preferred |
| **HSTS** | Include `Strict-Transport-Security` header |
| **Certificate** | Valid, not self-signed in production |

### CORS Configuration

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

| Rule | Requirement |
|------|-------------|
| **Never use wildcard (`*`)** with credentials | Specify exact origins |
| **Limit methods** | Only allow needed HTTP methods |
| **Limit headers** | Only allow needed custom headers |
| **Pre-flight caching** | Set `Max-Age` to reduce OPTIONS requests |

### Input Validation

| Rule | Implementation |
|------|----------------|
| **Validate all input** | Server-side validation for all parameters |
| **Use allowlists** | Validate against known-good patterns |
| **Limit request size** | Set `Content-Length` limits (e.g., 1 MB) |
| **Sanitize output** | Prevent injection in responses |
| **Parameterized queries** | Never concatenate user input into queries |

### Security Headers for APIs

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store
Content-Security-Policy: default-src 'none'
```

---

## Quick Reference Card

### URL Pattern

```
[VERB] https://api.{domain}/v{N}/{resources}/{id}/{sub-resources}/{id}
```

### Response Structure

```
Success → { data, meta, links }
Error   → { type, title, status, detail, errors, traceId }
```

### Essential Headers

| Direction | Header | Value |
|-----------|--------|-------|
| Request | `Content-Type` | `application/json` |
| Request | `Accept` | `application/json` |
| Request | `Authorization` | `Bearer {token}` |
| Response | `X-RateLimit-Limit` | `1000` |
| Response | `X-RateLimit-Remaining` | `994` |
| Response | `X-Request-ID` | `req-abc-123` |

### HTTP Verb Cheat Sheet

| Action | Verb | URL | Status |
|--------|------|-----|--------|
| List | GET | `/users` | 200 |
| Read | GET | `/users/123` | 200 |
| Create | POST | `/users` | 201 |
| Full Update | PUT | `/users/123` | 200 |
| Partial Update | PATCH | `/users/123` | 200 |
| Delete | DELETE | `/users/123` | 204 |

---

## Related Standards

- [Error Code Standards](error-code-standards.md) - Error code conventions and catalogs
- [Security Standards](security-standards.md) - Authentication, authorization, and security practices
- [Logging Standards](logging-standards.md) - API request/response logging
- [Testing Standards](testing-standards.md) - API testing strategies
- [Documentation Writing Standards](documentation-writing-standards.md) - Writing API documentation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial release |

---

## References

- [OpenAPI Specification](https://www.openapis.org/)
- [JSON:API Specification](https://jsonapi.org/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [RFC 7231 — HTTP/1.1 Semantics and Content](https://datatracker.ietf.org/doc/html/rfc7231)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
