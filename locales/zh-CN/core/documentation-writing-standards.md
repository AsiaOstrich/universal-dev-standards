---
source: ../../../core/documentation-writing-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: 9d2d83e23aef
status: current
---

# 文档编写规范

> **English** | [繁体中文](../../zh-TW/core/documentation-writing-standards.md)

**版本**: 1.2.0
**最后更新**: 2026-03-17
**适用范围**: 所有软件项目（新建、重构、迁移、维护）
**范围**: partial
**行业标准**: OpenAPI 3.1, AsyncAPI 2.6, JSON Schema 2020-12, WCAG 2.1 (文档可及性)
**参考资料**: [openapis.org](https://www.openapis.org/)

---

## 目的

本标准根据项目类型定义文档需求，并提供各类文档的详细编写指南。

**与其他标准的关系**:
- 补充 [documentation-structure.md](documentation-structure.md) 所定义的文件组织
- 本标准聚焦于**内容需求**和**项目类型映射**

---

## 项目类型与所需文档

### 文档需求矩阵

| 文档 | 新建项目 | 重构 | 迁移 | 维护 | 说明 |
|----------|:-----------:|:-----------:|:---------:|:-----------:|-------------|
| **README.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ✅ 必要 | 项目入口 |
| **ARCHITECTURE.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ⚪ 建议 | 系统架构 |
| **API.md** | ⚪ 如适用 | ✅ 必要 | ✅ 必要 | ⚪ 建议 | API 规范 |
| **DATABASE.md** | ⚪ 如适用 | ✅ 必要 | ✅ 必要 | ⚪ 建议 | 数据库架构 |
| **DEPLOYMENT.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ⚪ 建议 | 部署指南 |
| **MIGRATION.md** | ❌ 不需要 | ✅ 必要 | ✅ 必要 | ❌ 不需要 | 迁移计划 |
| **ADR/** | ⚪ 建议 | ✅ 必要 | ✅ 必要 | ⚪ 如适用 | 架构决策 |
| **CHANGELOG.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ✅ 必要 | 版本历史 |
| **CONTRIBUTING.md** | ⚪ 建议 | ⚪ 建议 | ⚪ 建议 | ⚪ 如适用 | 贡献指南 |

**图例**: ✅ 必要 | ⚪ 建议/如适用 | ❌ 不需要

---

### 项目类型说明

#### 🆕 新建项目

从零开始构建软件。

**必要文档**:
- README.md - 项目概述、快速开始
- ARCHITECTURE.md - 设计架构（开发前规划）
- DEPLOYMENT.md - 部署流程
- CHANGELOG.md - 版本历史

**建议文档**:
- API.md - 如对外提供 API
- DATABASE.md - 如使用数据库
- ADR/ - 记录重要技术决策

---

#### 🔄 重构项目

在不改变外部行为的前提下，改善既有系统的代码结构、架构或技术栈。

**必要文档**:
- README.md - 更新技术栈说明
- ARCHITECTURE.md - 新旧架构对比
- API.md - API 变更说明（如适用）
- DATABASE.md - Schema 变更说明（如适用）
- DEPLOYMENT.md - 新部署流程
- MIGRATION.md - 重构迁移计划
- ADR/ - 记录重构决策
- CHANGELOG.md - 详细变更记录

**重点**:
- MIGRATION.md 必须包含回滚计划
- ADR/ 必须记录“为何重构”及“为何采用此方案”

---

#### 🚚 迁移项目

将系统从一个环境/平台迁移到另一个（如云迁移、版本升级）。

**必要文档**:
- README.md - 新环境说明
- ARCHITECTURE.md - 新架构图
- API.md - API 兼容性说明
- DATABASE.md - 数据迁移说明
- DEPLOYMENT.md - 新环境部署
- MIGRATION.md - 迁移步骤与验证
- ADR/ - 迁移决策记录
- CHANGELOG.md - 迁移变更记录

**重点**:
- MIGRATION.md 是核心文档
- 必须包含数据迁移验证、回滚计划、集成方通知

---

#### 🔧 维护项目

既有系统的日常维护、Bug 修复、次要功能增强。

**必要文档**:
- README.md - 保持更新
- CHANGELOG.md - 记录每次变更

**建议文档**:
- 依据变更范围更新其他文档

---

## 文档语言配置

文档语言与 [commit-message-guide.md](commit-message-guide.md) 共享 `output_language` 设置。此统一设置控制项目中所有书面输出的语言。

### 语言选项

| 设置值 | 提交信息 | 文档 |
|--------------|----------------|---------------|
| `english` | 仅英文 | 仅英文 |
| `traditional-chinese` | 仅繁体中文 | 仅繁体中文 |
| `bilingual` | 英文 + 中文 | 分层双语（见下文） |

### 文档分层（双语模式）

当 `output_language` 设置为 `bilingual` 时，文档遵循三层体系：

| 层级 | 文档 | 行为 | 理由 |
|------|-----------|----------|-----------|
| **L1 — 强制** | 提交信息、CHANGELOG.md、PR 描述 | 自动双语 | 直接由语言设置控制 |
| **L2 — 建议** | README.md、CONTRIBUTING.md、ADR/ | AI 建议双语 | 开发者最常阅读 |
| **L3 — 不受影响** | ARCHITECTURE.md、API.md、DATABASE.md、DEPLOYMENT.md、MIGRATION.md | 遵循显示语言 | 技术规范；双语会增加过多冗余 |

### 双语文档格式

使用段落级双语格式，与双语提交信息正文保持一致：

- 英文段落居前，后接空行，然后是中文段落
- 代码块与表格仅编写一次（不重复）
- 章节标题使用 `|` 分隔符：`## Installation | 安装`

---

## 核心原则

> **文档是代码的延伸，应与代码同等重视。好的文档能减少沟通成本、加速新人上手、降低维护风险。**

### 文档金字塔

```
                    ┌─────────────┐
                    │   README    │  ← Entry point, quick overview
                    ├─────────────┤
                 ┌──┴─────────────┴──┐
                 │   ARCHITECTURE    │  ← System overview
                 ├───────────────────┤
              ┌──┴───────────────────┴──┐
              │  API / DATABASE / DEPLOY │  ← Technical details
              ├─────────────────────────┤
           ┌──┴─────────────────────────┴──┐
           │    ADR / MIGRATION / CHANGELOG │  ← Change history
           └───────────────────────────────┘
```

---

## 文档分类与规范

### 1. 架构文档

#### ARCHITECTURE.md

**用途**: 描述系统整体架构、模块划分、技术选型

**必要章节**:

| 章节 | 说明 | 必要性 |
|---------|-------------|----------|
| 系统概述 | 目的、范围、主要功能 | 必要 |
| 架构图 | 使用 Mermaid 或 ASCII Art | 必要 |
| 模块说明 | 职责、依赖关系 | 必要 |
| 技术栈 | 框架、语言、数据库版本 | 必要 |
| 数据流 | 主要业务流程数据流向 | 必要 |
| 部署架构 | 生产环境部署拓扑 | 建议 |
| 设计决策 | 关键决策的理由（或链接至 ADR） | 建议 |

**模板结构**:

```markdown
# 系统架构

## 1. 概述
[系统目的和范围]

## 2. 架构图
[Mermaid 或 ASCII 图]

## 3. 模块说明
### 3.1 表现层
### 3.2 业务逻辑层
### 3.3 数据访问层

## 4. 技术栈
| 类别 | 技术 | 版本 |
|----------|------------|---------|

## 5. 数据流
[主要业务流程图]

## 6. 部署架构
[部署拓扑图]
```

---

### 2. API 文档

#### API.md

**用途**: 记录外部 API 接口

**必要章节**:

| 章节 | 说明 | 必要性 |
|---------|-------------|----------|
| API 概述 | 版本、基础 URL、认证方式 | 必要 |
| 认证方式 | Token 获取、过期时间 | 必要 |
| 端点列表 | 所有 API 端点 | 必要 |
| 端点规格 | 每个端点的请求/响应格式 | 必要 |
| 错误码参考 | 错误码与说明 | 必要 |
| 代码示例 | 常见语言的代码示例 | 建议 |
| 速率限制 | API 调用频率限制 | 如适用 |

**端点规格格式**:

```markdown
### POST /api/v1/resource

描述此端点的功能。

**请求**

| 字段 | 类型 | 必要 | 说明 |
|-------|------|----------|-------------|
| field1 | string | 是 | 说明 |
| field2 | integer | 否 | 说明 |

**请求示例**
```json
{
  "field1": "value",
  "field2": 123
}
```

**响应**

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| success | boolean | 是否成功 |
| data | object | 响应数据 |

**响应示例**
```json
{
  "success": true,
  "data": {}
}
```

**错误响应**
| 代码 | 说明 |
|------|-------------|
| 400 | 错误的请求 |
| 401 | 未授权 |
```

---

### 3. 数据库文档

#### DATABASE.md

**用途**: 记录数据库结构、关联关系、索引策略

**必要章节**:

| 章节 | 说明 | 必要性 |
|---------|-------------|----------|
| 数据库概述 | 类型、版本、连接信息 | 必要 |
| ER 图 | 实体关系图 | 必要 |
| 数据表列表 | 所有数据表及用途 | 必要 |
| 数据表规格 | 每个数据表的列定义 | 必要 |
| 索引说明 | 索引策略与性能考量 | 必要 |
| 迁移脚本 | 脚本位置与执行顺序 | 必要 |
| 备份策略 | 备份频率、保留期限 | 建议 |

**数据表规格格式**:

```markdown
### TableName

数据表用途说明。

**列定义**

| 列 | 数据类型 | 可空 | 默认值 | 说明 |
|--------|-----------|----------|---------|-------------|
| id | bigint | 否 | IDENTITY | 主键 |
| name | varchar(100) | 否 | - | 名称字段 |
| status | tinyint | 否 | 0 | 状态标志 |

**索引**

| 索引名称 | 列 | 类型 | 说明 |
|------------|---------|------|-------------|
| PK_TableName | id | CLUSTERED | 主键 |
| IX_Status | status, created_at | NONCLUSTERED | 查询优化 |

**关系**

| 关联表 | 连接列 | 关系 |
|---------------|--------------|--------------|
| OtherTable | id = other_id | 1:N |
```

---

### 4. 部署文档

#### DEPLOYMENT.md

**用途**: 记录部署步骤、环境配置、故障排除

**必要章节**:

| 章节 | 说明 | 必要性 |
|---------|-------------|----------|
| 环境要求 | 硬件、软件、网络要求 | 必要 |
| 安装步骤 | 详细安装流程 | 必要 |
| 配置说明 | 配置文件参数 | 必要 |
| 验证方式 | 如何确认部署成功 | 必要 |
| 故障排除 | 常见问题与解决方案 | 必要 |
| 监控 | 健康检查、日志位置 | 建议 |
| 扩展指南 | 如何进行水平/垂直扩展 | 如适用 |

**配置文档格式**:

```markdown
### config.yaml 设置

| 参数 | 默认值 | 说明 | 示例 |
|-----------|---------|-------------|---------|
| db.host | localhost | 数据库主机 | `192.168.1.100` |
| db.port | 5432 | 数据库端口 | - |
| app.timeout | 300 | 请求超时（秒） | - |
```

---

### 5. 迁移文档

#### MIGRATION.md

**用途**: 记录迁移计划、向后兼容策略、回滚程序

**必要章节**:

| 章节 | 说明 | 必要性 |
|---------|-------------|----------|
| 迁移概述 | 目标、范围、时间表 | 必要 |
| 前提条件 | 迁移前所需的准备工作 | 必要 |
| 迁移步骤 | 详细迁移流程 | 必要 |
| 验证清单 | 迁移后验证项目 | 必要 |
| 回滚计划 | 失败时的回滚步骤 | 必要 |
| 向后兼容性 | API/数据库兼容性说明 | 必要 |
| 集成方通知 | 需要通知的外部系统 | 如适用 |

---

### 6. 架构决策记录 (ADR)

#### docs/ADR/NNN-title.md

**用途**: 记录重要的架构决策及其理由

**文件命名**: `NNN-kebab-case-title.md`（例如：`001-use-postgresql.md`）

**必要章节**:

| 章节 | 说明 | 必要性 |
|---------|-------------|----------|
| 标题 | 决策名称 | 必要 |
| 日期 | 决策日期（YYYY-MM-DD） | 必要 |
| 状态 | proposed/accepted/deprecated/superseded | 必要 |
| 决策者 | 制定或参与决策的人员 | 必要 |
| 背景 | 为何需要此决策 | 必要 |
| 决策 | 具体决策内容 | 必要 |
| 后果 | 决策的影响（正面/负面） | 必要 |
| 驱动因素 | 推动此决策的关键因素 | 建议 |
| 替代方案 | 考虑过的其他选项 | 建议 |
| 相关 ADR | 替代/被替代链接 | 如适用 |

#### ADR 生命周期

ADR 遵循具有明确状态转换的定义生命周期：

```
proposed → accepted → [deprecated | superseded]
```

| 状态 | 含义 | 转换 |
|--------|---------|------------|
| **proposed** | 讨论中，尚未决定 | → accepted 或已撤回 |
| **accepted** | 决策已生效 | → deprecated 或 superseded |
| **deprecated** | 决策不再相关 | 终态 |
| **superseded** | 被更新的 ADR 取代 | 必须链接至后续 ADR |

当 ADR 被取代时，添加一个链接到新 ADR 的 `superseded-by` 字段。新 ADR 应包含反向链接的 `supersedes` 字段。

#### 何时编写 ADR

使用此决策矩阵（影响度 × 可逆性）来确定是否需要 ADR：

| | 低影响度 | 高影响度 |
|---|:---------:|:----------:|
| **容易逆转** | ❌ 无需 ADR | ⚪ 可选 |
| **难以逆转** | ⚪ 可选 | ✅ 必须编写 ADR |

**“必须编写 ADR”的决策示例**:
- 选择数据库技术
- 采用新的框架或语言
- 定义 API 版本策略
- 更改认证机制
- 重大架构模式变更（单体架构 → 微服务）

#### ADR 模板（增强版）

```markdown
# ADR-001: [决策标题]

**日期**: YYYY-MM-DD
**状态**: proposed | accepted | deprecated | superseded
**决策者**: [参与人员列表]
**替代**: ADR-NNN（如适用）
**被替代**: ADR-NNN（如适用）

## 驱动因素

- [推动此决策的关键因素 1]
- [关键因素 2]

## 背景

[为何需要此决策。包括技术、业务和组织背景。]

## 决策

[做出的具体决策。请务必精确且无歧义。]

## 后果

### 正面影响
- 好处 1
- 好处 2

### 负面影响
- 缺点 1
- 缺点 2

## 考虑过的替代方案

### 替代方案 A: [名称]
- **优点**: ...
- **缺点**: ...
- **被拒绝原因**: ...

### 替代方案 B: [名称]
- **优点**: ...
- **缺点**: ...
- **被拒绝原因**: ...

## 参考资料

- [相关文档或外部资源]
```

---

## AI 协作文档

### 概述

现代文档必须针对人类读者与 AI 助手同时进行优化。本节提供了编写便于 AI 工具高效解析和利用的文档的指南。

### Token 感知文档设计

AI 模型存在上下文窗口限制。组织文档结构以供 LLM 高效消耗：

**文档结构原则**：

| 原则 | 说明 | 示例 |
|-----------|-------------|---------|
| **前置关键信息** | 将关键信息放在开头 | 先摘要后细节 |
| **使用清晰标题** | 层级结构有助于导航 | H1 > H2 > H3 递进 |
| **保持章节原子化** | 每个章节自成一体 | 可独立阅读 |
| **最小化冗余** | 避免重复信息 | 引用而非复制 |
| **使用结构化格式** | 优先使用表格和列表而非散文叙述 | 便于解析和提取 |

**建议文档规模**：

| 文档类型 | 目标规模 | 理由 |
|---------------|-------------|-----------|
| README | 500-1000 词 | 快速概览 |
| API 端点文档 | 每个端点 200-400 词 | 聚焦且易于扫读 |
| 架构文档 | 每个章节 1000-2000 词 | 详尽但分块清晰 |
| ADR | 300-600 词 | 聚焦决策 |

### AI 友好文档模式

**模式 1：结构化元数据块**

在文档顶部包含机器可读的元数据：

```markdown
---
title: User Authentication API
version: 2.1.0
last_updated: 2026-01-24
owner: auth-team
status: stable
dependencies:
  - user-service
  - token-service
---
```

**模式 2：清晰的章节标记**

使用 AI 能够识别的一致章节标头：

```markdown
## Overview
[Brief description of what this component/API does]

## Quick Start
[Minimal steps to get started]

## API Reference
[Detailed API documentation]

## Configuration
[Configuration options and defaults]

## Troubleshooting
[Common issues and solutions]
```

**模式 3：明确的示例**

提供带有清晰上下文的完整、可运行示例：

```markdown
### Example: Create User

**Prerequisites**:
- Valid API key
- Admin role

**Request**:
```bash
curl -X POST https://api.example.com/v1/users \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

**Response** (201 Created):
```json
{
  "id": "usr_123",
  "name": "John",
  "email": "john@example.com",
  "created_at": "2026-01-24T10:30:00Z"
}
```
```

### 面向 LLM 优化的编写规则

当编写将由 LLM 消耗（通过 RAG、上下文注入或直接阅读）的文档时，遵循以下规则以最大化理解准确度：

| 规则 | 说明 | 示例 |
|------|-------------|---------|
| **短段落** | 段落保持在 3-5 行 | 将冗长解释拆分为多个段落 |
| **术语一致** | 全文对同一概念使用相同术语 | 始终使用 "user"，而非有时用 "user" 有时用 "customer" |
| **代码附带语言标签** | 始终在围栏式代码块中指定语言 | ` ```javascript ` 而非 ` ``` ` |
| **避免代词模糊** | 跨段落引用时使用明确的名词代替 "it"、"this"、"that" | "The auth service validates..." 而非 "It validates..." |
| **上下文自给自足** | 每个 H2 章节应在不阅读前置章节的情况下即可被理解 | 包含必要的上下文或交叉引用 |
| **明确否定** | 当区分具有重要意义时，说明某物“不是”什么 | "This endpoint creates users but does NOT send welcome emails" |

### 文档分块指南

对于由检索增强生成（RAG）系统消耗的文档，组织内容结构以产生有效的分块：

- **H2 章节 ≤ 4K tokens**（约 3000 词）：每个 H2 章节应为一个自包含的分块
- **每个 H2 一个主题**：避免在单个章节中混杂无关概念
- **前置摘要**：以 1-2 句话的摘要开启每个章节

**易于检索的元数据**（可选的 YAML 前置元数据）：

```yaml
---
title: User Authentication API
scope: auth-service
difficulty: intermediate
tags: [authentication, API, OAuth2, JWT]
last_validated: 2026-03-17
---
```

这些元数据字段有助于检索系统按相关性对文档进行排序和筛选。

### 为 AI 代码生成编写文档

当文档将用于生成代码时：

**包含明确约束**：

```markdown
## Validation Rules

| Field | Type | Constraints |
|-------|------|-------------|
| email | string | Required, valid email format, max 255 chars |
| age | integer | Required, range 0-150 |
| role | string | Enum: "admin", "user", "guest" |
```

**明确错误场景**：

```markdown
## Error Responses

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Invalid email | 400 | INVALID_EMAIL | "Email format is invalid" |
| User exists | 409 | DUPLICATE_USER | "User with this email already exists" |
| Missing auth | 401 | UNAUTHORIZED | "Authentication required" |
```

**阐明业务逻辑**：

```markdown
## Discount Calculation Logic

1. Base discount = 0%
2. If customer type is "VIP", add 20%
3. If order total > $100, add 5%
4. If coupon code is valid, add coupon discount
5. Maximum total discount = 50%
6. Apply discount to subtotal (not including tax)
```

### AI 提示词集成

对于定义 AI 辅助工作流的文档：

**嵌入式提示词模板**：

```markdown
## AI Code Review Prompt

When reviewing code changes, use this prompt:

```
Review this code change for:
1. Security vulnerabilities (OWASP Top 10)
2. Performance issues
3. Error handling completeness
4. Adherence to [project-conventions.md]

Provide feedback in this format:
- 🔴 Critical: [Must fix before merge]
- 🟡 Important: [Should address]
- 🟢 Suggestion: [Nice to have]
```
```

---

## API 文档标准

### OpenAPI 3.1 合规性

对于 REST API，请使用 OpenAPI 3.1（与 JSON Schema draft 2020-12 完全对齐）：

**OpenAPI 3.1 主要特性**:

| 特性 | 描述 |
|---------|-------------|
| JSON Schema 对齐 | 与 JSON Schema 完全兼容 |
| Webhook 支持 | 原生 Webhook 文档支持 |
| `type` 数组 | 支持 `"type": ["string", "null"]` |
| 与属性同级的 `$ref` | 在同一对象中引用并扩展 |

**OpenAPI 3.1 Schema 示例**:

```yaml
openapi: 3.1.0
info:
  title: User API
  version: 2.1.0
paths:
  /users:
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    CreateUserRequest:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
```

### 用于事件驱动 API 的 AsyncAPI 2.6

对于基于消息/事件驱动的 API，请使用 AsyncAPI 2.6：

**AsyncAPI 文档示例**:

```yaml
asyncapi: 2.6.0
info:
  title: Order Events
  version: 1.0.0
channels:
  orders/created:
    publish:
      message:
        $ref: '#/components/messages/OrderCreated'
components:
  messages:
    OrderCreated:
      payload:
        type: object
        properties:
          orderId:
            type: string
          customerId:
            type: string
          totalAmount:
            type: number
          createdAt:
            type: string
            format: date-time
```

---

## 易于翻译的写作规范

对于维护多语言文档的项目，请在源文档中遵循以下写作规则，以提高翻译质量并减少翻译人员的工作量。

### 写作规则

| 规则 | 描述 | 示例 |
|------|-------------|---------|
| **完整句子** | 避免使用句子片段和电报式风格 | "The service restarts automatically." 而非 "Auto-restart." |
| **避免习语和俚语** | 使用字面、国际通用的语言 | "Easy to use" 而非 "A piece of cake" |
| **术语一致性** | 为项目术语创建并遵循词汇表 | 始终使用 "deployment"，而不是有时用 "deployment" 有时用 "release" |
| **简单句结构** | 优先使用 SVO（主-谓-宾）结构；避免嵌套从句 | "The API returns JSON." 而非 "The JSON that the API, when called correctly, returns..." |
| **指代明确** | 避免跨句子使用模棱两可的代词 | "The server processes the request." 而非 "It processes it." |

### 词汇表模板

维护一个 `glossary.md` 文件，以确保各翻译版本之间的术语一致性：

```markdown
# Project Glossary

| English Term | Definition | Translation Notes |
|-------------|------------|-------------------|
| deployment | The process of releasing software to production | 部署 (zh-TW) |
| endpoint | A specific URL path in an API | 端點 (zh-TW) |
| rollback | Reverting to a previous version | 回滾 (zh-TW) |
```

### 翻译状态 Frontmatter

在已翻译文档的头部跟踪翻译状态：

```yaml
---
translation_status: current | needs_update | in_progress
source_version: 1.2.0
source_hash: a1b2c3d4e5f6   # first 12 chars of `git hash-object <source>`
translated_by: human | machine | machine+human-review
last_synced: 2026-03-17
---
```

| 字段 | 描述 |
|-------|-------------|
| `translation_status` | 翻译是否与当前源文档相符 |
| `source_version` | 翻译所对应的源文档版本 |
| `source_hash` | 翻译时源文件的 Git 哈希值（用于精确跟踪） |
| `translated_by` | 用于质量评估的翻译方式 |
| `last_synced` | 上次同步检查的日期 |

---

## 质量标准

### 格式要求

| 项目 | 标准 |
|------|----------|
| 语言 | 英文 |
| 编码 | UTF-8 |
| 行长度 | 建议 ≤ 120 字符 |
| 图表 | 优先使用 Mermaid，次之 ASCII Art |
| 链接 | 内部链接使用相对路径 |

### 维护要求

| 项目 | 标准 |
|------|----------|
| 同步更新 | **AI 自动行为**：完成代码变更后，AI 必须检查哪些文档受到影响，并将其列出作为提醒。参见下方的 [AI 行为：文档影响自动检查](#automatic-documentation-impact-check) |
| 版本标记 | 文档顶部标记版本与更新日期 |
| 审查纳入 | 代码审查需包含文档变更 |
| 定期审查 | 每季度审查文档是否过时 |

### 文档影响自动检查

**这是 AI 的自动行为**——AI 助手在完成任何代码修改任务后，必须执行此项检查，无需等待用户询问。

**工作流程：**

1. 完成代码变更后，确定修改了哪些文件
2. 对每个被修改的文件，检查是否有任何文档引用了它（README、CLI 文档、API 文档、规格、技能、翻译）
3. 如果发现受影响的文档，追加包含**建议命令**的提醒区块：

```
---
📋 **Documentation Impact**
The following documents may need updating:
- `README.md` — describes changed CLI option `--xxx`
  → `/docs readme`
- `docs/CLI-INIT-OPTIONS.md` — references modified function `promptXxx()`
  → manual update or `/docs generate`
- `locales/zh-TW/docs/CLI-INIT-OPTIONS.md` — translation of modified source
  → `/docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW`

Or run `/docs impact` for a full analysis.
---
```

4. 如果没有受影响的文档，则静默跳过
5. **不要自动修改文档**——仅列出提醒并等待用户确认

**命令建议映射：**

| 受影响文档 | 建议命令 |
|-------------------|-------------------|
| README.md | `/docs readme` |
| API 文档 | `/docs api` |
| 生成的文档（速查表、参考） | `/docs generate` |
| 翻译文件（`locales/`） | `/docs translate <source-file> --lang <lang>` |
| 规格文件、技能文件、其他文档 | 手动更新（建议具体文件路径） |
| 多个文档受影响 | `/docs impact` 获取完整概览 |

**检查范围：**

| 文档类型 | 对照检查项 |
|--------------|---------------|
| CLI 文档（`docs/`） | 修改的函数、CLI 选项、命令 |
| 规格文件（`docs/specs/`） | 修改的接口、Schema、工作流 |
| 技能（`skills/`） | 修改的行为、标准引用 |
| 翻译（`locales/`） | 任何具有翻译的已修改源文件 |
| README、CHANGELOG | 修改的公开 API、功能、配置 |

### 审查清单

提交文档前：

- [ ] 必要章节完整
- [ ] 无过时或错误信息
- [ ] 所有链接有效
- [ ] 示例可执行/准确
- [ ] 格式符合标准

### 文档质量指标

使用领先指标和滞后指标量化文档健康度。

#### 领先指标（前瞻性）

| 指标 | 目标 | 测量方式 | 自动化 |
|--------|--------|----------------|------------|
| **覆盖率** | ≥ 90% 的公开 API 已撰写文档 | 统计已有文档的端点数与端点总数 | 自定义脚本或 API 规格 diff |
| **新鲜度** | 所有文档在 90 天内更新 | 检查文档头部的 `Last Updated` 日期 | `find` + 日期比较脚本 |
| **链接健康度** | 100% 有效链接 | 检查所有内部与外部链接 | markdown-link-check、lychee |
| **示例有效性** | 100% 的代码示例运行成功 | 提取并执行代码块 | doctest、自定义 CI 脚本 |
| **结构合规性** | 所有文档具有必要章节 | 对照章节模板进行验证 | remark-lint、自定义 linter |

#### 滞后指标（结果性）

| 指标 | 描述 | 测量方式 |
|--------|-------------|----------------|
| **支持工单减少** | 关于已有文档记录功能的问题减少 | 跟踪标记为“documentation”的支持工单 |
| **新手入职时间** | 新开发者提交第一个 PR 的时间 | 测量入职团队队列的平均值 |
| **文档相关 PR 评论** | 要求补充文档的审查评论减少 | 统计提及“docs”的 PR 审查评论数 |

#### 推荐自动化工具

| 工具 | 用途 | 集成 |
|------|---------|-------------|
| **markdown-link-check** | 验证 Markdown 文件中的链接 | Pre-commit hook、CI |
| **lychee** | 快速链接检查器（基于 Rust） | CI 流水线 |
| **remark-lint** | Markdown 风格与结构检查 | Pre-commit hook |
| **textstat** | 可读性评分（Flesch-Kincaid 等） | CI 流水线（参考建议） |
| **vale** | 文本检查（风格、语法、术语） | Pre-commit hook、CI |

---

## 文件位置规范

```
project-root/
├── README.md                    # Project entry document
├── CONTRIBUTING.md              # Contribution guide
├── CHANGELOG.md                 # Change log
├── .standards/ or .claude/      # Development standards
│   ├── documentation-writing-standards.md
│   └── ...
└── docs/                        # Documentation directory
    ├── INDEX.md                 # Documentation index
    ├── ARCHITECTURE.md          # Architecture document
    ├── API.md                   # API document
    ├── DATABASE.md              # Database document
    ├── DEPLOYMENT.md            # Deployment document
    ├── MIGRATION.md             # Migration document
    ├── ADR/                     # Architecture decision records
    │   ├── 001-xxx.md
    │   └── ...
    └── DB/                      # Database scripts
```

---

## 推荐工具

| 用途 | 工具 |
|---------|-------|
| Markdown 编辑 | VS Code + Markdown Preview Enhanced |
| 图表绘制 | Mermaid / draw.io / PlantUML |
| API 文档 | OpenAPI (Swagger) / Redoc |
| ER 图 | dbdiagram.io / DBeaver |

---

## 文档可及性

确保文档对所有用户都可访问，在适用的情况下遵循 WCAG 2.1 Level A 指南。

| 需求 | 描述 | 示例 |
|-------------|-------------|---------|
| **浅显语言** | 使用清晰、简单的语言；目标为 8 年级阅读水平 | 避免：“utilize” → 使用：“use” |
| **图片替代文字** | 为所有非装饰性图片提供描述性替代文字 | `![Architecture diagram showing three-tier layout](path/to/arch.png)` |
| **标题层级** | 使用正确的标题层级（h1→h2→h3），切勿跳级 | 不要从 `#` 直接跳到 `###` |
| **链接文字** | 使用描述性链接文字，而非“点击此处” | 避免：[click here] → 使用：[installation guide] |
| **代码块** | 使用带语言标识符的围栏式代码块 | ` ```javascript ` 而非 ` ``` ` |
| **色彩独立性** | 不要仅依赖色彩传达意义 | 在色彩旁搭配使用 ✅/❌ 图标 |

---

## 相关标准

- [文档结构标准](documentation-structure.md)
- [变更日志标准](changelog-standards.md)

---

## 参考资料

- [OpenAPI 3.1 规范](https://spec.openapis.org/oas/v3.1.0) - 最新 OpenAPI 规范
- [AsyncAPI 2.6 规范](https://www.asyncapi.com/docs/reference/specification/v2.6.0) - 事件驱动 API 文档
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) - JSON Schema 规范
- [Diátaxis 文档框架](https://diataxis.fr/) - 文档结构方法论
- [Write the Docs](https://www.writethedocs.org/guide/) - 文档社区最佳实践

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.2.0 | 2026-03-17 | 新增：增强版 ADR 模板（生命周期、决策矩阵、替代链接）、针对 LLM 优化的撰写规则、文档分块指南、利于翻译的撰写标准、文档质量指标（领先/滞后指标） |
| 1.1.0 | 2026-01-24 | 新增：AI 协作文档章节、Token 感知文档设计、API 文档标准（OpenAPI 3.1、AsyncAPI 2.6） |
| 1.0.1 | 2025-12-24 | 新增：相关标准章节 |
| 1.0.0 | 2025-12-10 | 初版文档撰写标准 |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
