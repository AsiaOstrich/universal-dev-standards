---
description: |
  将现有代码反向工程成 SDD 规格文档。
  使用时机：分析旧有代码、为未文档化的系统撰写文档、从现有实作提取规格。
  关键字：reverse engineering, legacy code, documentation, spec extraction, code archaeology, 反向工程, 旧有代码, 规格提取。
source: ../../../../skills/reverse-engineer/guide.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-10-16
source_hash: a97db6ef1238
status: current
---

# 系统考古指南 —— 跨 3 个维度的反向工程

> **语言**: [English](../../../../skills/reverse-engineer/guide.md) | [繁體中文](../../../zh-TW/skills/reverse-engineer/guide.md) | 简体中文

**版本**：2.0.0
**最后更新**：2026-02-12
**适用范围**：Claude Code Skills

> **核心标准**：此技能实现[反向工程标准](../../core/reverse-engineering-standards.md)。如需任何 AI 工具皆可访问的完整方法论文档，请参阅核心标准。

---

## 目的

此技能提供了一个**系统考古框架**，用于跨三个维度——**逻辑**（Logic）、**数据**（Data）和**运行环境**（Runtime）——对既有系统进行反向工程，并在严格遵循反幻觉合规性的前提下生成全面的 SDD 规格文档。

## 快速参考

### 系统考古框架

```
┌──────────────────────────────────────────────────────────────────┐
│                   System Archeology Framework                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Dimension 1: DATA (/reverse data)                                │
│      ├─ DB schemas, ORM models, migrations                       │
│      ├─ Entity-relationship mapping                               │
│      └─ Output: Data Model Spec                                   │
│                                                                    │
│  Dimension 2: RUNTIME (/reverse runtime)                          │
│      ├─ Configs, env vars, feature flags                          │
│      ├─ Docker/K8s topology, CI/CD pipelines                     │
│      └─ Output: Runtime Baseline                                  │
│                                                                    │
│  Dimension 3: LOGIC (/reverse spec)                               │
│      ├─ APIs, modules, data flows, tests                          │
│      ├─ Enriched with Data + Runtime context                      │
│      └─ Output: SPEC-XXX.md                                       │
│                                                                    │
│  /reverse (no subcommand) = All 3 dimensions → Full Report       │
│                                                                    │
│  Human Review:                                                     │
│      ├─ Verify [Confirmed] / [Inferred] / [Unknown] labels       │
│      ├─ Add Motivation, Risk Assessment, Business Context         │
│      └─ Approve spec via /sdd                                     │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 可提取与不可提取的内容

| 方面 | 可提取 | 确定性 | 备注 |
|------|--------|--------|------|
| **API 端点** | ✅ 是 | [Confirmed] | 路由定义、HTTP 方法 |
| **数据模型** | ✅ 是 | [Confirmed] | 类型、接口、Schema |
| **函数签名** | ✅ 是 | [Confirmed] | 参数、返回类型 |
| **测试用例** | ✅ 是 | [Confirmed] | → 验收条件 |
| **依赖项** | ✅ 是 | [Confirmed] | 包引用 |
| **行为模式** | ⚠️ 部分 | [Inferred] | 来自代码分析 |
| **动机/原因** | ❌ 否 | [Unknown] | 需要人工输入 |
| **业务上下文** | ❌ 否 | [Unknown] | 需要人工输入 |
| **风险评估** | ❌ 否 | [Unknown] | 需要领域专业知识 |
| **权衡决策** | ❌ 否 | [Unknown] | 缺失历史上下文 |

## 核心原则

### 1. 反幻觉合规

**关键**：此技能必须严格遵守[反幻觉标准](../../core/anti-hallucination.md)。

#### 确定性标签（来自统一标签系统）

此技能使用**确定性标签**分析既有代码。完整标签参考请参阅[反幻觉标准](../../core/anti-hallucination.md#certainty-classification-tags)。

| 标签 | 使用时机 | 示例 |
|------|----------|------|
| `[Confirmed]` | 来自代码/测试的直接证据 | 位于 `src/api/users.ts:15` 的 API 端点 |
| `[Inferred]` | 来自模式的逻辑推导 | “根据构造函数模式，可能使用了依赖注入” |
| `[Unknown]` | 无法从代码中确定 | 动机、业务需求 |
| `[Need Confirmation]` | 需要人工验证 | 设计意图、边界情况处理 |

#### 来源标注

每一个提取的项都必须包含来源标注：

```markdown
## API Design

### User Authentication
[Confirmed] POST /api/auth/login endpoint accepts email and password
- [Source: Code] src/controllers/AuthController.ts:25-45
- [Source: Code] src/routes/auth.ts:8

### Session Management
[Inferred] Sessions expire after 24 hours based on JWT expiry configuration
- [Source: Code] src/config/auth.ts:12 - TOKEN_EXPIRY=86400
- [Source: Knowledge] Standard JWT expiry interpretation (⚠️ Verify intent)
```

### 2. 渐进式披露

从高层架构开始，然后逐步深入：

1. **系统概述**：入口点、主要组件
2. **组件详情**：各个独立模块及其职责
3. **实现细节**：算法、数据流

### 3. 测试到需求的映射

从测试中提取验收条件：

```javascript
// Test file: src/tests/auth.test.ts
describe('Authentication', () => {
  it('should return 401 for invalid credentials', () => {...});
  it('should issue JWT token on successful login', () => {...});
  it('should refresh token before expiry', () => {...});
});
```

转换为：

```markdown
## Acceptance Criteria
[Inferred] From test analysis (src/tests/auth.test.ts):
- [ ] Return 401 status code for invalid credentials
- [ ] Issue JWT token on successful login
- [ ] Support token refresh before expiry
```

## 工作流阶段

### 阶段 1：代码扫描

**输入**：文件路径或目录
**输出**：代码结构分析

**操作**：
1. 识别入口点（主函数、API 路由、事件处理程序）
2. 梳理模块依赖关系
3. 提取类型定义和接口
4. 列出配置来源

### 阶段 2：测试分析

**输入**：测试文件
**输出**：候选验收条件

**操作**：
1. 解析测试用例名称
2. 提取 Given-When-Then 模式（若为 BDD 风格）
3. 识别边界条件
4. 记录覆盖率缺口

### 阶段 3：缺口识别

**输入**：代码 + 测试分析
**输出**：需要人工输入的未知项清单

**必要的人工输入**：
- [ ] 动机：为什么构建此功能？
- [ ] 用户故事：谁使用此功能，出于什么目的？
- [ ] 风险：可能出现什么问题？
- [ ] 权衡：为什么选择这种方法而不是替代方案？
- [ ] 范围外：明确排除了什么？

### 阶段 4：规格生成

**输入**：所有分析结果
**输出**：规格文档草稿

**模板**：使用 [reverse-spec-template.md](../../templates/reverse-spec-template.md)

### 阶段 5：人工审查

**输入**：规格草稿
**输出**：验证后的规格

**审查清单**：
- [ ] 所有 `[Confirmed]` 项均已验证准确
- [ ] 所有 `[Inferred]` 项均已验证或更正
- [ ] 所有 `[Unknown]` 项均已由人工填写
- [ ] 来源引用已核对
- [ ] 已补充业务上下文

## 示例

### 示例 1：API 端点提取

**输入代码**（`src/controllers/UserController.ts`）：
```typescript
export class UserController {
  @Get('/users/:id')
  @Authorize('admin', 'user')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }
}
```

**提取的规格**：
```markdown
## API Endpoints

### GET /users/:id
[Confirmed] Retrieves a user by ID
- [Source: Code] src/controllers/UserController.ts:3-7

**Authorization**: [Confirmed] Requires 'admin' or 'user' role
- [Source: Code] @Authorize decorator at line 4

**Parameters**:
- `id` (path, required): User identifier [Confirmed]

**Response**: [Confirmed] Returns User object
- [Source: Code] Return type at line 5

**Error Handling**: [Unknown] Error responses not evident from code
```

### 示例 2：测试转换为验收标准

**输入测试**（`src/tests/cart.test.ts`）：
```typescript
describe('Shopping Cart', () => {
  it('should add item to empty cart', () => {...});
  it('should increment quantity for duplicate items', () => {...});
  it('should not exceed maximum quantity of 99', () => {...});
  it('should calculate total with tax', () => {...});
});
```

**提取的验收标准**：
```markdown
## Acceptance Criteria

[Inferred] From test analysis (src/tests/cart.test.ts):
- [ ] Can add item to empty cart (line 2)
- [ ] Increments quantity for duplicate items (line 3)
- [ ] Maximum quantity limit: 99 items (line 4)
- [ ] Total calculation includes tax (line 5)

[Unknown] Tax calculation rules not specified in tests
[Need Confirmation] What happens when cart exceeds 99 items? (reject or cap?)
```

## 与其他技能的集成

### 与 /sdd（规格驱动开发）

1. 使用 `/reverse-sdd` 生成反向工程规格
2. 审查并填写 `[Unknown]` 部分
3. 使用 `/sdd review` 验证完整性
4. 按照常规 SDD 工作流进行增强

### 与 /tdd（测试驱动开发）

1. 提取现有测试模式
2. 识别测试覆盖率缺口
3. 使用 `/tdd` 添加缺失的测试
4. 用新的验收标准更新规格

### 与 /bdd（行为驱动开发）

1. 将提取的验收标准转换为 Gherkin 格式
2. 使用 `/bdd` 形式化场景
3. 与利益相关者验证场景

## 数据维度指南（`/reverse data`）

### 扫描目标

| 来源 | 查找内容 | 确定性 |
|------|---------|--------|
| `schema.prisma` / `*.schema.*` | 模型、字段、关联、枚举 | [已确认] |
| `migrations/` / `*.migration.*` | Schema 演化历史 | [已确认] |
| `models/` / `entities/` | ORM 模型定义 | [已确认] |
| `knexfile.*` / `sequelize` 配置 | 数据库连接、方言 | [已确认] |
| `seeds/` / `fixtures/` | 测试数据、默认值 | [已确认] |
| `docker-compose.yml`（db 服务） | 数据库引擎、端口、数据卷 | [已确认] |
| 代码模式（`.findBy`、`.save`） | 隐式关联 | [推断] |
| 未找到 schema 文件 | 可能为无模式/NoSQL | [未知] |

### 输出模板：数据模型规格

```markdown
# Data Model Spec — [Project Name]

## Entities

### User
[Confirmed] Source: schema.prisma:5-15
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto | — |
| email | String | Unique, Not Null | — |
| role | Enum(admin,user) | Default: user | — |

### Order
[Confirmed] Source: models/Order.ts:3-20
...

## Relationships
[Confirmed] User 1:N Order (FK: order.userId → user.id)
[Inferred] Order M:N Product (join table: order_items — from code pattern)

## Migration History
| Version | Date | Description | Source |
|---------|------|-------------|--------|
| 001 | 2024-03-01 | Initial schema | migrations/001_init.ts |
| 002 | 2024-06-15 | Add role to user | migrations/002_add_role.ts |

## Data Flow Paths
- Write: API → Service → Repository → DB
- Read: DB → Repository → Service → Serializer → API
```

---

## 运行时维度指南（`/reverse runtime`）

### 扫描目标

| 来源 | 查找内容 | 确定性 |
|------|---------|--------|
| `.env.example` / `.env.template` | 环境变量名称 | [已确认] |
| `docker-compose.yml` | 服务、端口、依赖项 | [已确认] |
| `Dockerfile` | 基础镜像、构建步骤、暴露端口 | [已确认] |
| `k8s/` / Helm charts | 部署拓扑 | [已确认] |
| CI/CD 文件（`.github/`、`.gitlab-ci.yml`） | 构建/部署流水线 | [已确认] |
| 配置文件（`*.config.*`） | 功能标志、配置层级 | [已确认] |
| 日志文件（仅模式） | 错误模式、日志级别 | [推断] |
| 监控端点（`/health`、`/metrics`） | 可观测性暴露面 | [已确认] |

### 安全规则

- **绝不**输出来自 `.env`、机密、API 密钥或密码的实际值
- 仅列出变量**名称**并推断其**用途**
- 将任何敏感配置标记为 `[REDACTED]`

### 输出模板：运行时基线

```markdown
# Runtime Baseline — [Project Name]

## Environment Variables
| Variable | Purpose | Required | Source |
|----------|---------|----------|--------|
| DATABASE_URL | DB connection string | Yes | .env.example:1 |
| JWT_SECRET | Token signing key | Yes | .env.example:3 |
| REDIS_URL | Cache connection | No | .env.example:5 |
| FEATURE_NEW_UI | Feature flag | No | config/features.ts:12 |

## External Dependencies
| Service | Protocol | Purpose | Source |
|---------|----------|---------|--------|
| PostgreSQL 15 | TCP:5432 | Primary database | docker-compose.yml:8 |
| Redis 7 | TCP:6379 | Session cache | docker-compose.yml:15 |
| Stripe API | HTTPS | Payment processing | [Inferred] src/services/payment.ts:3 |

## Deployment Topology
[Confirmed] Source: docker-compose.yml
- app (Node.js 20) → port 3000
- db (PostgreSQL 15) → port 5432
- redis (Redis 7) → port 6379

## Health & Monitoring
[Confirmed] GET /health → src/routes/health.ts:5
[Inferred] No metrics endpoint found — consider adding /metrics

## CI/CD Pipeline
[Confirmed] Source: .github/workflows/ci.yml
- Trigger: push to main, PR
- Steps: lint → test → build → deploy
```

---

## 完整反向工程管道

反向工程技能支持完整的 SDD → BDD → TDD 管道：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Complete Reverse Engineering Pipeline                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Code + Tests                                                          │
│        │                                                                │
│        ▼                                                                │
│   /reverse-sdd                                                         │
│        │                                                                │
│        └─→ Generate SPEC-XXX with Acceptance Criteria                   │
│                │                                                        │
│                ▼                                                        │
│   /reverse-bdd                                                          │
│        │                                                                │
│        ├─→ AC → Gherkin scenario conversion                             │
│        ├─→ Auto-transform bullet points to Given-When-Then              │
│        └─→ Generate .feature files                                      │
│                │                                                        │
│                ▼                                                        │
│   /reverse-tdd                                                          │
│        │                                                                │
│        ├─→ Analyze existing unit tests                                  │
│        └─→ Generate coverage report with gaps                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 管道命令

| 命令 | 输入 | 输出 | 目的 |
|---------|-------|--------|---------|
| `/reverse-sdd` | 代码目录 | SPEC-XXX.md | 从代码提取需求 |
| `/reverse-bdd` | SPEC 文件 | .feature 文件 | 将 AC 转换为 Gherkin 场景 |
| `/reverse-tdd` | .feature 文件 | 覆盖率报告 | 将场景映射到单元测试 |

### 使用示例

```bash
# Step 1: Reverse engineer code to SDD specification
/reverse-sdd src/auth/

# Step 2: Transform acceptance criteria to BDD scenarios
/reverse-bdd specs/SPEC-AUTH.md

# Step 3: Analyze test coverage against BDD scenarios
/reverse-tdd features/auth.feature
```

### 详细指南

- [BDD 提取工作流程](./bdd-extraction.md) - AC → Gherkin 转换详细指南
- [TDD 分析工作流程](./tdd-analysis.md) - BDD → TDD 覆盖率分析详细指南

## 应避免的反模式

### ❌ 不要这样做

1. **捏造动机**
   - 错误：“此功能是为了改善用户体验而构建的”
   - 正确：“[未知] 动机需要人类输入”

2. **假设需求**
   - 错误：“系统需要 SSO 支持”
   - 正确：“[需确认] 代码中发现 SSO 配置 - 这是需求吗？”

3. **推测未读取的代码**
   - 错误：“PaymentService 处理 Stripe 集成”
   - 正确：“[未知] PaymentService 功能 - 需要读取 src/services/PaymentService.ts”

4. **呈现选项时未标明不确定性**
   - 错误：“代码使用 Redis 进行缓存”
   - 正确：“[已确认] Redis 客户端配置于 src/config/cache.ts:5”

## 最佳实践

### 应该做的

- ✅ 在做出陈述前阅读所有相关文件
- ✅ 为每条陈述标记确定性级别
- ✅ 包含带有 file:line 的来源引用
- ✅ 清晰列出需要人类输入的内容
- ✅ 保留原始代码注释作为上下文

### 不应该做的

- ❌ 假设动机或业务上下文
- ❌ 将推断呈现为已确认的事实
- ❌ 跳过来源归属标注
- ❌ 为未读取的代码生成规格
- ❌ 在没有人类输入的情况下填写 `[未知]` 部分

---

## 配置检测

此技能会自动检测项目配置：

1. 检查是否存在 `specs/` 目录
2. 检查 SDD 工具（OpenSpec、Spec Kit）
3. 检测用于提取验收标准的测试框架
4. 识别代码模式（MVC、DDD 等）

---

## 相关标准

- [反向工程标准](../../core/reverse-engineering-standards.md) - **核心方法论标准（主要参考）**
- [规格驱动开发](../../core/spec-driven-development.md) - 输出格式与审查流程
- [反幻觉指南](../../core/anti-hallucination.md) - 基于证据的分析要求
- [代码审查清单](../../core/code-review-checklist.md) - 审查指南

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 2.0.0 | 2026-02-12 | 重大：3 维系统考古（逻辑 + 数据 + 运行时） |
| 1.2.0 | 2026-01-25 | 新增：对统一标签系统的引用 |
| 1.1.0 | 2026-01-19 | 新增 BDD/TDD 管道集成；新增核心标准参考 |
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 授权

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可证发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
