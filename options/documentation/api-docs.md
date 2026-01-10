# API Documentation

> **Language**: English | [繁體中文](../../locales/zh-TW/options/documentation/api-docs.md)

**Parent Standard**: [Documentation Structure](../../core/documentation-structure.md)

---

## Overview

API documentation provides structured reference materials for developers integrating with your APIs. It covers endpoint specifications, authentication, request/response formats, and error handling.

## Best For

- REST APIs
- GraphQL APIs
- SDK/Library documentation
- Public APIs
- Developer portals

## Documentation Formats

### OpenAPI (Swagger)

| Aspect | Details |
|--------|---------|
| **Versions** | 3.0, 3.1 |
| **File Types** | `.yaml`, `.json` |
| **Best For** | REST APIs |
| **Tools** | Swagger UI, Redoc, Stoplight |

### GraphQL Schema

| Aspect | Details |
|--------|---------|
| **File Types** | `.graphql`, `.gql` |
| **Best For** | GraphQL APIs |
| **Tools** | GraphQL Playground, Apollo Studio |

### AsyncAPI

| Aspect | Details |
|--------|---------|
| **Versions** | 2.x, 3.x |
| **Best For** | Event-driven APIs |
| **Tools** | AsyncAPI Studio |

## OpenAPI Structure Example

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

## Documentation Elements

### Required

- Endpoint URL
- HTTP method
- Request parameters
- Response format
- Error codes
- Authentication

### Recommended

- Code examples (multiple languages)
- Rate limits
- Pagination details
- Changelog/versioning

### Optional

- Try-it-out console
- SDKs
- Postman collections

## Endpoint Documentation Example

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

## Tools

### Generators

| Tool | Purpose |
|------|---------|
| swagger-codegen | Generate client SDKs |
| openapi-generator | Generate client/server code |
| typedoc | Generate TypeScript docs |

### Hosting

| Tool | Type |
|------|------|
| Swagger UI | Self-hosted |
| Redoc | Self-hosted |
| ReadMe | SaaS |
| Stoplight | SaaS |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Document all endpoints | Document every public endpoint | Required |
| Include examples | Include request and response examples | Required |
| Document errors | List all possible error responses | Required |
| Version sync | Keep docs in sync with API version | Required |
| Auth first | Document authentication before endpoints | Recommended |

## Related Options

- [Markdown Docs](./markdown-docs.md) - Plain Markdown documentation
- [Wiki Style](./wiki-style.md) - Wiki-style collaborative docs

---

## References

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger](https://swagger.io/)
- [AsyncAPI](https://www.asyncapi.com/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
