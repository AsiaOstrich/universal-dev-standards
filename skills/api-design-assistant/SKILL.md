---
name: api-design
scope: universal
description: |
  Guide API design following REST, GraphQL, and gRPC best practices.
  Use when: designing APIs, reviewing endpoints, API versioning decisions.
  Keywords: API, REST, GraphQL, gRPC, endpoint, versioning, 介面設計.
allowed-tools: Read, Grep, Glob
argument-hint: "[API endpoint or module | API 端點或模組]"
---

# API Design Assistant | API 設計助手

Guide API design following REST, GraphQL, and gRPC best practices.

引導 API 設計，遵循 REST、GraphQL 和 gRPC 最佳實踐。

## Quick Reference — REST Conventions | 快速參考

### HTTP Methods | HTTP 方法

| Method | Purpose | Idempotent | 用途 |
|--------|---------|------------|------|
| GET | Read resource | Yes | 讀取資源 |
| POST | Create resource | No | 建立資源 |
| PUT | Replace resource | Yes | 替換資源 |
| PATCH | Partial update | No | 部分更新 |
| DELETE | Remove resource | Yes | 刪除資源 |

### Status Codes | 狀態碼

| Code | Meaning | 說明 |
|------|---------|------|
| 200 | OK | 成功 |
| 201 | Created | 已建立 |
| 204 | No Content | 無內容（刪除成功） |
| 400 | Bad Request | 請求格式錯誤 |
| 401 | Unauthorized | 未認證 |
| 403 | Forbidden | 無權限 |
| 404 | Not Found | 資源不存在 |
| 409 | Conflict | 資源衝突 |
| 422 | Unprocessable Entity | 驗證失敗 |
| 429 | Too Many Requests | 請求過多（限流） |
| 500 | Internal Server Error | 伺服器內部錯誤 |

### URL Naming | URL 命名規則

| Pattern | Example | 說明 |
|---------|---------|------|
| Collection | `/users` | 資源集合 |
| Singleton | `/users/{id}` | 單一資源 |
| Sub-resource | `/users/{id}/orders` | 子資源 |
| Action | `/users/{id}/activate` | 動作（僅限 POST） |

## Design Workflow | 設計工作流程

```
DEFINE ──► DESIGN ──► VALIDATE ──► DOCUMENT
```

### 1. Define — Identify Requirements | 定義需求
Clarify consumers, use cases, data models, and non-functional requirements.

釐清使用者、使用情境、資料模型和非功能性需求。

### 2. Design — Structure Endpoints | 設計端點
Apply RESTful conventions, define request/response schemas, plan versioning.

套用 RESTful 慣例、定義請求/回應 Schema、規劃版本策略。

### 3. Validate — Review Consistency | 驗證一致性
Check naming consistency, error format uniformity, pagination patterns.

檢查命名一致性、錯誤格式統一、分頁模式。

### 4. Document — Generate Specs | 產生文件
Produce OpenAPI/Swagger specs or GraphQL schema documentation.

產出 OpenAPI/Swagger 規格或 GraphQL Schema 文件。

## Versioning Strategy | 版本策略

| Strategy | Example | Pros | 優點 |
|----------|---------|------|------|
| URL Path | `/v1/users` | Simple, explicit | 簡單、明確 |
| Header | `Accept: application/vnd.api+json;v=1` | Clean URLs | URL 乾淨 |
| Query | `/users?version=1` | Easy to test | 容易測試 |

## Usage | 使用方式

```
/api-design              - Interactive API design guide | 互動式 API 設計引導
/api-design /users       - Review specific endpoint design | 審查特定端點設計
/api-design --graphql    - GraphQL schema design guide | GraphQL Schema 設計引導
```

## Next Steps Guidance | 下一步引導

After `/api-design` completes, the AI assistant should suggest:

> **API 設計完成。建議下一步 / API design complete. Suggested next steps:**
> - 執行 `/sdd` 建立正式規格文件 — Create formal specification
> - 執行 `/testing` 規劃 API 測試策略 — Plan API testing strategy
> - 執行 `/docs` 產生 API 文件 — Generate API documentation
> - 審查安全性 → 執行 `/security` — Review security → Run `/security`

## Reference | 參考

- Core standard: [api-design-standards.md](../../core/api-design-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-23 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
