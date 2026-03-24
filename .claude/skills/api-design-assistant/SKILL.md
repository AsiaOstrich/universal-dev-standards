---
source: ../../../../skills/api-design-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: "[UDS] 引導 API 設計，遵循 REST、GraphQL 和 gRPC 最佳實踐"
name: api-design
allowed-tools: Read, Grep, Glob
scope: universal
argument-hint: "[API endpoint or module | API 端點或模組]"
---

# API 設計助手

> **語言**: [English](../../../../skills/api-design-assistant/SKILL.md) | 繁體中文

引導 API 設計，遵循 REST、GraphQL 和 gRPC 最佳實踐。

## 快速參考 — REST 慣例

### HTTP 方法

| 方法 | 用途 | 冪等性 |
|------|------|--------|
| GET | 讀取資源 | 是 |
| POST | 建立資源 | 否 |
| PUT | 替換資源 | 是 |
| PATCH | 部分更新 | 否 |
| DELETE | 刪除資源 | 是 |

### 狀態碼

| 代碼 | 說明 |
|------|------|
| 200 | 成功 |
| 201 | 已建立 |
| 204 | 無內容（刪除成功） |
| 400 | 請求格式錯誤 |
| 401 | 未認證 |
| 403 | 無權限 |
| 404 | 資源不存在 |
| 409 | 資源衝突 |
| 422 | 驗證失敗 |
| 429 | 請求過多（限流） |
| 500 | 伺服器內部錯誤 |

### URL 命名規則

| 模式 | 範例 | 說明 |
|------|------|------|
| 集合 | `/users` | 資源集合 |
| 單一資源 | `/users/{id}` | 單一資源 |
| 子資源 | `/users/{id}/orders` | 子資源 |
| 動作 | `/users/{id}/activate` | 動作（僅限 POST） |

## 設計工作流程

```
DEFINE ──► DESIGN ──► VALIDATE ──► DOCUMENT
```

### 1. Define — 定義需求
釐清使用者、使用情境、資料模型和非功能性需求。

### 2. Design — 設計端點
套用 RESTful 慣例、定義請求/回應 Schema、規劃版本策略。

### 3. Validate — 驗證一致性
檢查命名一致性、錯誤格式統一、分頁模式。

### 4. Document — 產生文件
產出 OpenAPI/Swagger 規格或 GraphQL Schema 文件。

## 版本策略

| 策略 | 範例 | 優點 |
|------|------|------|
| URL 路徑 | `/v1/users` | 簡單、明確 |
| Header | `Accept: application/vnd.api+json;v=1` | URL 乾淨 |
| Query | `/users?version=1` | 容易測試 |

## 使用方式

- `/api-design` - 互動式 API 設計引導
- `/api-design /users` - 審查特定端點設計
- `/api-design --graphql` - GraphQL Schema 設計引導

## 下一步引導

`/api-design` 完成後，AI 助手應建議：

> **API 設計完成。建議下一步：**
> - 執行 `/sdd` 建立正式規格文件
> - 執行 `/testing` 規劃 API 測試策略
> - 執行 `/docs` 產生 API 文件
> - 審查安全性 → 執行 `/security`

## 參考

- 核心規範：[api-design-standards.md](../../../../core/api-design-standards.md)
