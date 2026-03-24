---
source: ../../../../skills/api-design-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: |
  引导 API 设计，遵循 REST、GraphQL 和 gRPC 最佳实践。
  使用时机：设计 API、审查端点、API 版本决策。
  关键字：API, REST, GraphQL, gRPC, endpoint, versioning, 接口设计。
---

# API 设计助手

> **语言**: [English](../../../../skills/api-design-assistant/SKILL.md) | 简体中文

引导 API 设计，遵循 REST、GraphQL 和 gRPC 最佳实践。

## 快速参考 — REST 惯例

### HTTP 方法

| 方法 | 用途 | 幂等性 |
|------|------|--------|
| GET | 读取资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 替换资源 | 是 |
| PATCH | 部分更新 | 否 |
| DELETE | 删除资源 | 是 |

### 状态码

| 代码 | 说明 |
|------|------|
| 200 | 成功 |
| 201 | 已创建 |
| 204 | 无内容（删除成功） |
| 400 | 请求格式错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 验证失败 |
| 429 | 请求过多（限流） |
| 500 | 服务器内部错误 |

### URL 命名规则

| 模式 | 示例 | 说明 |
|------|------|------|
| 集合 | `/users` | 资源集合 |
| 单一资源 | `/users/{id}` | 单一资源 |
| 子资源 | `/users/{id}/orders` | 子资源 |
| 动作 | `/users/{id}/activate` | 动作（仅限 POST） |

## 设计工作流程

```
DEFINE ──► DESIGN ──► VALIDATE ──► DOCUMENT
```

### 1. Define — 定义需求
厘清使用者、使用场景、数据模型和非功能性需求。

### 2. Design — 设计端点
套用 RESTful 惯例、定义请求/响应 Schema、规划版本策略。

### 3. Validate — 验证一致性
检查命名一致性、错误格式统一、分页模式。

### 4. Document — 生成文档
产出 OpenAPI/Swagger 规格或 GraphQL Schema 文档。

## 版本策略

| 策略 | 示例 | 优点 |
|------|------|------|
| URL 路径 | `/v1/users` | 简单、明确 |
| Header | `Accept: application/vnd.api+json;v=1` | URL 干净 |
| Query | `/users?version=1` | 容易测试 |

## 使用方式

- `/api-design` - 交互式 API 设计引导
- `/api-design /users` - 审查特定端点设计
- `/api-design --graphql` - GraphQL Schema 设计引导

## 下一步引导

`/api-design` 完成后，AI 助手应建议：

> **API 设计完成。建议下一步：**
> - 执行 `/sdd` 建立正式规格文档
> - 执行 `/testing` 规划 API 测试策略
> - 执行 `/docs` 生成 API 文档
> - 审查安全性 → 执行 `/security`

## 参考

- 核心规范：[api-design-standards.md](../../../../core/api-design-standards.md)
