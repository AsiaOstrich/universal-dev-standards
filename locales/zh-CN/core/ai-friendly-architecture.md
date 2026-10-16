---
source: ../../../core/ai-friendly-architecture.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 7381f66445c3
status: current
---

# AI 友好架构标准

> **语言**: [English](../../../core/ai-friendly-architecture.md) | [繁體中文](../../zh-TW/core/ai-friendly-architecture.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-21
**适用范围**: 所有与 AI 助手协作的软件项目
**范围**: 通用
**行业标准**: 无（新兴 AI 协作实践）

---

## 目的

本标准定义能最大化 AI 辅助开发效能的架构与文档实践。遵循这些指南，项目将更容易被 AI 工具分析、理解和修改，同时保持人类可读性。

**参考概念**:
- RLM（递归语言模型）上下文管理原则
- 考虑 Token 的文档设计
- 支持 AI 理解的模块化架构

---

## 目录

1. [核心原则](#core-principles)
2. [模块设计标准](#module-design-standards)
3. [上下文边界标记](#context-boundary-markers)
4. [文档分层](#documentation-layering)
5. [元数据标准](#metadata-standards)
6. [查询接口设计](#query-interface-design)
7. [AI 上下文配置](#ai-context-configuration)
8. [反模式](#anti-patterns)
9. [实施清单](#implementation-checklist)

---

## 核心原则

### 1. 明确胜过隐含

AI 助手在行为和结构明确记录时表现最佳，而非依赖惯例推测。

```
┌─────────────────────────────────────────────────────────────┐
│                 Explicit vs Implicit                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ IMPLICIT (Hard for AI)                                  │
│  └── Magic naming conventions                               │
│  └── Undocumented folder structures                         │
│  └── Convention-based routing                               │
│  └── Assumed knowledge of framework behavior                │
│                                                              │
│  ✅ EXPLICIT (AI-Friendly)                                  │
│  └── Documented module responsibilities                     │
│  └── Clear entry point annotations                          │
│  └── Explicit dependency declarations                       │
│  └── Self-documenting configuration files                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 分层上下文

以层次结构组织文档，让 AI 可以根据任务复杂度访问适当的详细程度。

```
┌─────────────────────────────────────────────────────────────┐
│               Context Layering Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Quick Reference (< 500 tokens)                    │
│  └── One-liner descriptions                                 │
│  └── API signatures only                                    │
│  └── Key entry points                                       │
│                                                              │
│  Layer 2: Detailed Guide (< 5,000 tokens)                   │
│  └── Full API documentation                                 │
│  └── Usage examples                                         │
│  └── Configuration options                                  │
│                                                              │
│  Layer 3: Full Examples (unlimited)                         │
│  └── Complete implementation examples                       │
│  └── Edge case documentation                                │
│  └── Migration guides                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. 语义边界

设计清晰的模块边界，让 AI 可以独立分析组件，而不需要完整项目上下文。

### 4. 可探索的结构

确保项目结构可以通过分析配置文件和入口点来理解，而不需阅读所有源代码。

---

## 模块设计标准

### 模块级别单一职责

每个模块应有明确定义的单一目的，可以用一句话总结。

```
┌─────────────────────────────────────────────────────────────┐
│              Module Header Template                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /**                                                         │
│   * @module auth                                             │
│   * @description Handles user authentication and session    │
│   *              management for the application.            │
│   *                                                          │
│   * @responsibility Authentication and authorization         │
│   * @dependencies [database, crypto, config]                │
│   * @exports {login, logout, verify, refreshToken}          │
│   * @entrypoint ./index.ts                                  │
│   */                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 明确的输入/输出契约

每个公开接口都应有明确的类型定义或文档说明。

| 元素 | 要求 | 示例 |
|---------|-------------|---------|
| 函数参数 | 类型 + 描述 | `@param {string} email - User's email address` |
| 返回值 | 类型 + 可能值 | `@returns {Promise<User \| null>}` |
| 副作用 | 明确记录 | `@sideeffect Writes to database` |
| 错误条件 | 所有可能错误 | `@throws {AuthError} Invalid credentials` |

### 明确的依赖声明

依赖应在模块级别声明，而非隐藏在实现细节中。

**JavaScript/TypeScript:**
```javascript
// module: src/auth/index.ts
// dependencies: [database, crypto, config]
import { db } from '../database';
import { hash } from '../crypto';
import { config } from '../config';
```

**Python:**
```python
# module: src/auth/__init__.py
# dependencies: [database, crypto, config]
from ..database import db
from ..crypto import hash_password
from ..config import settings
```

---

## 上下文边界标记

### 模块头部注释

使用 AI 可以解析的标准化头部注释，以便快速理解模块。

```javascript
/**
 * ═══════════════════════════════════════════════════════════
 * MODULE: Payment Processing
 * ═══════════════════════════════════════════════════════════
 *
 * PURPOSE: Handles all payment-related operations including
 *          processing, refunds, and subscription management.
 *
 * DEPENDENCIES:
 *   - stripe: Payment gateway integration
 *   - database: Transaction storage
 *   - events: Payment event publishing
 *
 * EXPORTS:
 *   - processPayment(amount, method): Process single payment
 *   - refund(transactionId): Issue refund
 *   - createSubscription(plan): Start subscription
 *
 * CONFIGURATION:
 *   - STRIPE_SECRET_KEY: Required
 *   - PAYMENT_WEBHOOK_SECRET: Required
 *
 * ═══════════════════════════════════════════════════════════
 */
```

### 小节分隔符

在大型文件中使用一致的小节分隔符：

```javascript
// ============================================================
// SECTION: Validation Helpers
// ============================================================

// ... validation code ...

// ============================================================
// SECTION: API Handlers
// ============================================================

// ... handler code ...
```

---

## 文档分层

### 第一层：快速参考（< 500 tokens）

在每个主要模块创建 `QUICK-REF.md`：

```markdown
# Auth Module - Quick Reference

## Purpose
User authentication and session management.

## Key Functions
- `login(email, password)` → `Promise<Session>`
- `logout(sessionId)` → `void`
- `verify(token)` → `Promise<User | null>`

## Configuration
- `AUTH_SECRET`: JWT signing secret
- `SESSION_DURATION`: Session lifetime (default: 24h)

## Entry Point
`src/auth/index.ts`
```

### 第二层：详细指南（< 5,000 tokens）

包含完整文档的主要 `README.md`：

```markdown
# Authentication Module

## Overview
[2-3 paragraph description]

## Architecture
[Diagram or description of internal structure]

## API Reference
[Full function signatures with parameters]

## Configuration Options
[All configuration with defaults and descriptions]

## Usage Examples
[Common use cases with code samples]

## Error Handling
[Error types and handling strategies]
```

### 第三层：完整范例（无限制）

包含完整实现的独立 `examples/` 目录：

```
auth/
├── QUICK-REF.md          # Level 1
├── README.md             # Level 2
└── examples/             # Level 3
    ├── basic-login.ts
    ├── oauth-integration.ts
    └── custom-middleware.ts
```

---

## 元数据标准

### 包元数据扩展

使用与 AI 相关的元数据扩展标准包文件：

**package.json (JavaScript/TypeScript):**
```json
{
  "name": "my-project",
  "ai-context": {
    "entryPoints": ["src/index.ts", "src/api/index.ts"],
    "modules": {
      "auth": "src/auth/",
      "api": "src/api/",
      "database": "src/db/"
    },
    "ignorePatterns": ["node_modules", "dist", "coverage"],
    "quickRef": "docs/QUICK-REF.md"
  }
}
```

**pyproject.toml (Python):**
```toml
[tool.ai-context]
entry_points = ["src/main.py", "src/api/__init__.py"]
modules = { auth = "src/auth/", api = "src/api/" }
ignore_patterns = ["__pycache__", ".venv", "*.pyc"]
quick_ref = "docs/QUICK-REF.md"
```

### .ai-context.yaml 配置

专用的 AI 上下文配置文件：

```yaml
# .ai-context.yaml - AI Context Configuration
version: 1.0.0

project:
  name: my-project
  type: web-app  # web-app | library | cli | api | monorepo
  primary-language: typescript

modules:
  - name: auth
    path: src/auth/
    entry: index.ts
    description: Authentication and authorization
    dependencies: [database, crypto]
    priority: high

  - name: api
    path: src/api/
    entry: routes.ts
    description: REST API endpoints
    dependencies: [auth, database]
    priority: high

  - name: utils
    path: src/utils/
    entry: index.ts
    description: Shared utility functions
    dependencies: []
    priority: low

analysis-hints:
  entry-points:
    - src/main.ts
    - src/index.ts
  ignore-patterns:
    - node_modules
    - dist
    - coverage
    - "*.test.ts"
  architecture-type: layered  # layered | microservices | modular | monolith

documentation:
  quick-ref: docs/QUICK-REF.md
  detailed: docs/ARCHITECTURE.md
  examples: docs/examples/

context-strategy:
  max-chunk-size: 50000
  overlap: 500
  analysis-pattern: hierarchical
```

---

## 查询接口设计

### 结构化 API 文档格式

设计易于查询的 API 文档：

```markdown
## API: createUser

**Endpoint**: `POST /api/users`
**Module**: `src/api/users.ts:45`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | Min 8 characters |
| name | string | No | Display name |

### Response
```json
{
  "id": "string",
  "email": "string",
  "createdAt": "ISO8601"
}
```

### Errors
| Code | Condition |
|------|-----------|
| 400 | Invalid email format |
| 409 | Email already exists |

### Example
```javascript
const user = await api.createUser({
  email: 'user@example.com',
  password: 'securePassword123'
});
```
```

### 可搜索的代码注释

使用 AI 可以搜索的一致注释模式：

```javascript
// @ai-hint: This function is performance-critical
// @ai-complexity: O(n log n)
// @ai-dependencies: [sortUtils, comparators]
function sortLargeDataset(data) {
  // ...
}

// @ai-security: Validates user input
// @ai-validation: email, password strength
function validateRegistration(input) {
  // ...
}
```

---

## AI 上下文配置

### 推荐目录结构

```
project/
├── .ai-context.yaml          # AI context configuration
├── docs/
│   ├── QUICK-REF.md          # Level 1 documentation
│   ├── ARCHITECTURE.md       # Level 2 documentation
│   └── examples/             # Level 3 documentation
├── src/
│   ├── auth/
│   │   ├── index.ts          # Entry point with module header
│   │   ├── QUICK-REF.md      # Module-level quick reference
│   │   └── README.md         # Module documentation
│   ├── api/
│   │   ├── index.ts
│   │   └── README.md
│   └── index.ts              # Application entry point
└── CLAUDE.md / INSTRUCTIONS.md  # AI instruction file
```

### 上下文优先级指南

当 AI 上下文受限时，按以下优先级处理：

| 优先级 | 内容类型 | 原因 |
|--------|----------|------|
| 1 | 进入点 | 理解应用程序结构 |
| 2 | .ai-context.yaml | 模块映射与依赖 |
| 3 | QUICK-REF 文件 | 快速理解 API |
| 4 | 修改过的文件 | 与任务直接相关 |
| 5 | 依赖链 | 变更的上下文 |

---

## 反模式

### ❌ 应避免的模式

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| **魔术字符串** | AI 无法追踪常量 | 使用有文档的类型常量 |
| **隐含路由** | 隐藏行为 | 明确记录路由映射 |
| **全局状态** | 不可预测的依赖 | 依赖注入，明确连接 |
| **循环依赖** | 上下文混乱 | 清楚的层次依赖 |
| **巨大文件** | 上下文溢出 | 分割成专注的模块 |
| **约定优于文档** | 假定知识已知 | 明确的文档记录 |

### ❌ 文档反模式

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| **过时文档** | 误导 AI | 保持文档与代码同步 |
| **仅自动生成** | 缺少上下文 | 补充人工编写的上下文 |
| **无示例** | 用法模糊 | 包含可运行的示例 |
| **大段文字** | 难以解析 | 使用结构化格式 |

---

## 实施清单

### 快速开始（< 1 小时）

- [ ] 创建 `.ai-context.yaml` 包含模块清单
- [ ] 在项目根目录新增 `QUICK-REF.md`
- [ ] 在 README 中记录进入点
- [ ] 在主要文件中新增模块头部

### 标准实施（< 1 天）

- [ ] 完成 `.ai-context.yaml` 配置
- [ ] 为每个主要模块新增 `QUICK-REF.md`
- [ ] 记录所有公开 API 的类型信息
- [ ] 在大型文件中新增区段分隔
- [ ] 创建依赖文档

### 完整实施（< 1 周）

- [ ] 所有模块的三层文档
- [ ] 可搜索的代码注释
- [ ] 使用案例的范例目录
- [ ] 架构图
- [ ] 集成 CI 进行文档验证

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-21 | 初始版本 |

---

## 相关标准

- [项目结构](./project-structure.md) - 目录组织
- [文档结构](./documentation-structure.md) - 文档组织
- [反幻觉](./anti-hallucination.md) - AI 准确性标准

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
