---
source: options/documentation/api-docs.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# API Documentation

> **語言**: [English](../../../../options/documentation/api-docs.md) | 繁體中文

**Parent Standard**: [Documentation Structure](../../core/documentation-structure.md)

---

## 概觀

API 文件為整合你 API 的開發者提供結構化的參考資料。它涵蓋 endpoint 規格、authentication、request/response 格式以及錯誤處理。

## 最適用於

- REST APIs
- GraphQL APIs
- SDK／Library 文件
- 公開 API
- 開發者入口網站

## 文件格式

### OpenAPI (Swagger)

| 面向 | 細節 |
|--------|---------|
| **Versions** | 3.0、3.1 |
| **File Types** | `.yaml`、`.json` |
| **Best For** | REST APIs |
| **Tools** | Swagger UI、Redoc、Stoplight |

### GraphQL Schema

| 面向 | 細節 |
|--------|---------|
| **File Types** | `.graphql`、`.gql` |
| **Best For** | GraphQL APIs |
| **Tools** | GraphQL Playground、Apollo Studio |

### AsyncAPI

| 面向 | 細節 |
|--------|---------|
| **Versions** | 2.x、3.x |
| **Best For** | 事件驅動 API |
| **Tools** | AsyncAPI Studio |

## OpenAPI 結構範例

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

## 文件元素

### Required

- Endpoint URL
- HTTP method
- Request 參數
- Response 格式
- Error codes
- Authentication

### Recommended

- 程式碼範例（多種語言）
- Rate limits
- 分頁細節
- Changelog／versioning

### Optional

- Try-it-out console
- SDKs
- Postman collections

## Endpoint 文件範例

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
| swagger-codegen | 產生 client SDKs |
| openapi-generator | 產生 client／server 程式碼 |
| typedoc | 產生 TypeScript 文件 |

### Hosting

| Tool | 類型 |
|------|------|
| Swagger UI | 自架 |
| Redoc | 自架 |
| ReadMe | SaaS |
| Stoplight | SaaS |

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| Document all endpoints | 為每一個公開 endpoint 撰寫文件 | Required |
| Include examples | 納入 request 與 response 範例 | Required |
| Document errors | 列出所有可能的 error response | Required |
| Version sync | 讓文件與 API 版本保持同步 | Required |
| Auth first | 在 endpoint 之前先記錄 authentication | Recommended |

## 相關選項

- [Markdown Docs](./markdown-docs.md) - 純 Markdown 文件
- [Wiki Style](./wiki-style.md) - Wiki 風格的協作文件

---

## 參考資料

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger](https://swagger.io/)
- [AsyncAPI](https://www.asyncapi.com/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
