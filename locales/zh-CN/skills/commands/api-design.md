---
source: ../../../../skills/commands/api-design.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide API design following REST, GraphQL and gRPC best practices"
allowed-tools: Read, Grep, Glob
argument-hint: "[API endpoint or module | API 端点或模块]"
---

# API Design Assistant | API 设计助手

Guide API design following REST, GraphQL and gRPC best practices.

引导 API 设计，遵循 REST、GraphQL 和 gRPC 最佳实践。

## Workflow | 工作流程

```
DEFINE ──► DESIGN ──► VALIDATE ──► DOCUMENT
```

1. **Define** — 收集需求，识别资源和操作
2. **Design** — 设计端点、请求/响应 schema、错误码
3. **Validate** — 检查一致性、命名规范、版本控制
4. **Document** — 生成 API 文档

## Usage | 使用方式

- `/api-design` - 启动交互式 API 设计会话
- `/api-design /users` - 为特定资源设计 API
- `/api-design --graphql` - 使用 GraphQL 方法设计

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/api-design` | 询问 API 需求和目标资源，进入 DEFINE 阶段 |
| `/api-design <resource>` | 以指定资源为目标，进入 DEFINE |
| `/api-design --graphql` | 使用 GraphQL 方法设计 |

### Interaction Script | 交互脚本

#### DEFINE Phase
1. 收集 API 需求（目标用户、资源、操作）
2. 确认 API 风格（REST / GraphQL / gRPC）

**STOP**: 需求确认后等待用户确认进入 DESIGN

#### DESIGN Phase
1. 设计端点/schema
2. 定义 request/response 格式
3. 设计错误码和状态码
4. 展示设计结果

**STOP**: 设计展示后等待用户确认

#### VALIDATE Phase
1. 检查命名一致性、RESTful 惯例
2. 验证版本策略
3. 展示验证报告

#### DOCUMENT Phase
1. 生成 API 文档（OpenAPI / GraphQL Schema）

**STOP**: 文档生成后等待用户确认写入

### Stop Points | 停止点

| 阶段 | 停止点 | 等待内容 |
|------|--------|---------|
| DEFINE | 需求确认后 | 确认进入 DESIGN |
| DESIGN | 设计展示后 | 确认设计方案 |
| DOCUMENT | 文档生成后 | 确认写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法判断 API 风格 | 列出选项（REST/GraphQL/gRPC），请用户选择 |
| 资源命名不符惯例 | 建议修正，展示命名规则 |

## Reference | 参考

- Full standard: [api-design-assistant](../api-design-assistant/SKILL.md)
- Core guide: [api-design-standards](../../core/api-design-standards.md)
