---
description: "[UDS] Guide API design following REST, GraphQL and gRPC best practices"
allowed-tools: Read, Grep, Glob
argument-hint: "[API endpoint or module | API 端點或模組]"
---

# API Design Assistant | API 設計助手

Guide API design following REST, GraphQL and gRPC best practices.

引導 API 設計，遵循 REST、GraphQL 和 gRPC 最佳實踐。

## Workflow | 工作流程

```
DEFINE ──► DESIGN ──► VALIDATE ──► DOCUMENT
```

1. **Define** — Gather requirements, identify resources and operations
2. **Design** — Design endpoints, request/response schemas, error codes
3. **Validate** — Check consistency, naming conventions, versioning
4. **Document** — Generate API documentation

## Usage | 使用方式

- `/api-design` - Start interactive API design session
- `/api-design /users` - Design API for specific resource
- `/api-design --graphql` - Design using GraphQL approach

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/api-design` | 詢問 API 需求和目標資源，進入 DEFINE 階段 |
| `/api-design <resource>` | 以指定資源為目標，進入 DEFINE |
| `/api-design --graphql` | 使用 GraphQL 方法設計 |

### Interaction Script | 互動腳本

#### DEFINE Phase
1. 收集 API 需求（目標使用者、資源、操作）
2. 確認 API 風格（REST / GraphQL / gRPC）

🛑 **STOP**: 需求確認後等待使用者確認進入 DESIGN

#### DESIGN Phase
1. 設計端點/schema
2. 定義 request/response 格式
3. 設計錯誤碼和狀態碼
4. 展示設計結果

🛑 **STOP**: 設計展示後等待使用者確認

#### VALIDATE Phase
1. 檢查命名一致性、RESTful 慣例
2. 驗證版本策略
3. 展示驗證報告

#### DOCUMENT Phase
1. 生成 API 文件（OpenAPI / GraphQL Schema）

🛑 **STOP**: 文件生成後等待使用者確認寫入

### Stop Points | 停止點

| Phase | Stop Point | 等待內容 |
|-------|-----------|---------|
| DEFINE | 需求確認後 | 確認進入 DESIGN |
| DESIGN | 設計展示後 | 確認設計方案 |
| DOCUMENT | 文件生成後 | 確認寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無法判斷 API 風格 | 列出選項（REST/GraphQL/gRPC），請使用者選擇 |
| 資源命名不符慣例 | 建議修正，展示命名規則 |

## Reference | 參考

- Full standard: [api-design-assistant](../api-design-assistant/SKILL.md)
- Core guide: [api-design-standards](../../core/api-design-standards.md)
