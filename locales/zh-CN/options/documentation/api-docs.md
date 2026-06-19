---
source: options/documentation/api-docs.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# API Documentation

> **语言**: [English](../../../../options/documentation/api-docs.md) | 简体中文

**Parent Standard**: [Documentation Structure](../../core/documentation-structure.md)

---

## 概览

API 文档为集成你 API 的开发者提供结构化的参考资料。它涵盖 endpoint 规格、authentication、request/response 格式以及错误处理。

## 最适用于

- REST APIs
- GraphQL APIs
- SDK／Library 文档
- 公开 API
- 开发者门户

## 文档格式

### OpenAPI (Swagger)

| 方面 | 细节 |
|--------|---------|
| **Versions** | 3.0、3.1 |
| **File Types** | `.yaml`、`.json` |
| **Best For** | REST APIs |
| **Tools** | Swagger UI、Redoc、Stoplight |

### GraphQL Schema

| 方面 | 细节 |
|--------|---------|
| **File Types** | `.graphql`、`.gql` |
| **Best For** | GraphQL APIs |
| **Tools** | GraphQL Playground、Apollo Studio |

### AsyncAPI

| 方面 | 细节 |
|--------|---------|
| **Versions** | 2.x、3.x |
| **Best For** | 事件驱动 API |
| **Tools** | AsyncAPI Studio |

## OpenAPI 结构示例

```yaml
openapi: "3.1.0"
info:
  title: API Name
  version: "1.0.0"
  description: API description

servers:
  - url: https://api.example.com/v1

paths:
  /users:
    get:
      summary: List users
      responses:
        "200":
          description: Success

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
```

## 文档元素

### Required

- Endpoint URL
- HTTP method
- Request 参数
- Response 格式
- Error codes
- Authentication

### Recommended

- 代码示例（多种语言）
- Rate limits
- 分页细节
- Changelog／versioning

### Optional

- Try-it-out console
- SDKs
- Postman collections

## Endpoint 文档示例

```markdown
## Create User

Creates a new user account.

**Endpoint:** `POST /users`

**Authentication:** Bearer token required

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Email address |

### Response

{
  "id": "usr_123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-01-15T10:30:00Z"
}

### Errors

| Code | Description |
|------|-------------|
| 400 | Invalid request body |
| 409 | Email already exists |
```

## 工具

### Generators

| Tool | 用途 |
|------|---------|
| swagger-codegen | 生成 client SDKs |
| openapi-generator | 生成 client／server 代码 |
| typedoc | 生成 TypeScript 文档 |

### Hosting

| Tool | 类型 |
|------|------|
| Swagger UI | 自托管 |
| Redoc | 自托管 |
| ReadMe | SaaS |
| Stoplight | SaaS |

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| Document all endpoints | 为每一个公开 endpoint 撰写文档 | Required |
| Include examples | 纳入 request 与 response 示例 | Required |
| Document errors | 列出所有可能的 error response | Required |
| Version sync | 让文档与 API 版本保持同步 | Required |
| Auth first | 在 endpoint 之前先记录 authentication | Recommended |

## 相关选项

- [Markdown Docs](./markdown-docs.md) - 纯 Markdown 文档
- [Wiki Style](./wiki-style.md) - Wiki 风格的协作文档

---

## 参考资料

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger](https://swagger.io/)
- [AsyncAPI](https://www.asyncapi.com/)

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
