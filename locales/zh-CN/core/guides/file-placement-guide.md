---
source: ../../../../core/guides/file-placement-guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: ed790154a974
status: current
---

# 文件归档决策指南

> **语言**: [English](../../../../core/guides/file-placement-guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-04
**适用范围**: 所有软件项目
**范围**: universal
**上层规范**: [项目结构](../project-structure.md)、[文档结构](../documentation-structure.md)

---

## 目的

本指南回答：**「这个文件该放哪里？」**

提供主决策树、反向查询索引、代码组织深入辨析、以及开发中间产物生命周期管理。当你不确定新文件该放在项目的哪个位置时，使用本指南。

关于标准目录定义，请参阅上方链接的上层规范。本指南聚焦于**决策过程**，而非目录清单。

---

## 1. 主决策树

从这里开始。识别文件的主要分类，然后沿着分支进行。

```
What kind of file are you placing?
│
├── CODE (source, test, script, generated)
│   ├── Application logic? → src/{module}/
│   ├── Test file? → tests/ (or alongside source, per language convention)
│   ├── Script/tool? → tools/ or scripts/
│   ├── Generated code? → src/generated/{type}/
│   └── Utility/helper? → See §3 Code Organization Deep Dive
│
├── DOCUMENTATION (formal, working, reference)
│   ├── Formal (stable, versioned)?
│   │   ├── Architecture decision → docs/ADR/NNN-title.md
│   │   ├── Specification → docs/specs/
│   │   ├── API reference → docs/api-reference.md
│   │   ├── User guide → docs/
│   │   └── Flow/diagram → docs/flows/ or docs/diagrams/
│   └── Working (in-progress, temporary)?
│       ├── Brainstorm → docs/working/brainstorms/
│       ├── RFC → docs/working/rfcs/
│       ├── Investigation → docs/working/investigations/
│       ├── POC → docs/working/poc/{name}/
│       └── Meeting notes → docs/working/meeting-notes/
│
├── CONFIGURATION
│   ├── Tool config (linter, formatter, bundler) → Project root /
│   ├── App runtime config → config/ or src/config/
│   ├── Environment variables → .env (gitignored)
│   ├── CI/CD pipeline → .github/workflows/ or .gitlab-ci.yml
│   └── Infrastructure as Code → infra/ or deploy/
│
└── ASSET (static files, media)
    ├── Web public assets → public/ or static/
    ├── Source assets (needs processing) → assets/ or src/assets/
    └── Documentation images → docs/images/ or docs/diagrams/
```

---

## 2. 反向查询索引

按文件类型查找其目的地。

### 代码文件

| 文件类型 | 目的地 | 说明 |
|---------|--------|------|
| 工具函数 | `src/utils/` | 无状态、通用、跨模块 |
| 辅助函数 | `{layer}/helpers/` | 层级特定（例如 `tests/helpers/`） |
| 中间件 | `src/middleware/` | HTTP/请求管线处理器 |
| 类型定义 | `src/types/` 或 `shared/types/` | 全局类型放 shared/，模块类型放 module/ |
| 常量 | `src/constants/` 或 `shared/constants/` | 不变的配置值 |
| 测试夹具 | `tests/fixtures/` | 测试数据文件 |
| 测试辅助 | `tests/helpers/` | 测试特定的工具函数 |
| 数据库迁移 | `migrations/` 或 `db/migrations/` | 数据库 schema 变更 |
| 种子数据 | `db/seeds/` 或 `seeds/` | 数据库种子脚本 |
| 路由定义 | `src/routes/` | API/页面路由处理器 |
| 配置模块 | `src/config/` | 运行时配置加载器 |
| 生成的 API 客户端 | `src/generated/api/` | 从 OpenAPI/GraphQL 自动生成 |
| 生成的数据库类型 | `src/generated/db/` | 从 ORM schema 自动生成 |
| 生成的 protobuf | `src/generated/proto/` | 从 .proto 文件自动生成 |
| 脚本/工具 | `tools/` 或 `scripts/` | 构建、部署、维护脚本 |
| 构建配置 | 项目根目录 | `webpack.config.js`、`vite.config.ts` 等 |
| 入口点 | `src/index.*` 或 `src/main.*` | 应用程序入口文件 |

### 文档文件

| 文件类型 | 目的地 | 说明 |
|---------|--------|------|
| ADR | `docs/ADR/NNN-title.md` | 编号、永久 |
| 规格 | `docs/specs/` | 按类别组织 |
| 头脑风暴 | `docs/working/brainstorms/` | 日期前缀、临时 |
| RFC | `docs/working/rfcs/RFC-NNN-title.md` | 编号、生命周期管理 |
| 技术调查 | `docs/working/investigations/` | 技术研究、日期前缀 |
| POC 报告 | `docs/working/poc/{name}/` | 子目录含 README.md |
| 会议记录 | `docs/working/meeting-notes/` | 日期前缀 |
| 流程文档 | `docs/flows/` | 流程与数据流 |
| 架构图 | `docs/diagrams/` | .mmd、.puml、.drawio 文件 |
| 疑难排解 | `docs/troubleshooting.md` | 常见问题与解决方案 |
| CHANGELOG | 根目录 `/CHANGELOG.md` | Keep a Changelog 格式 |
| README | 根目录 `/README.md` 或目录 `README.md` | 每个重要目录都应有一个 |

### 基础设施与配置文件

| 文件类型 | 目的地 | 说明 |
|---------|--------|------|
| Dockerfile | 根目录 `/` 或 `deploy/` | 单服务：根目录；多服务：deploy/ |
| docker-compose.yml | 根目录 `/` 或 `deploy/` | 开发 vs 生产 compose 文件 |
| CI 管线 | `.github/workflows/` | GitHub Actions YAML |
| .env 文件 | 根目录 `/`（gitignored） | 环境特定变量 |
| IDE 设置 | 根目录 `/`（多数 gitignored） | `.vscode/`、`.idea/` |
| Git hooks | `.husky/` 或 `.githooks/` | Pre-commit、pre-push 脚本 |
| 许可证 | 根目录 `/LICENSE` | 大写，无扩展名 |
| IaC（Terraform） | `infra/` | Terraform、Pulumi、CloudFormation |
| Kubernetes manifests | `deploy/k8s/` 或 `infra/k8s/` | 部署 manifests |

---

## 3. 代码组织深入辨析

### utils/ vs helpers/ vs shared/ vs common/ vs lib/ vs internal/

这是最常见的混淆来源。以下是完整辨析：

#### 快速参考

| 目录 | 关键特征 | 示例内容 |
|------|---------|---------|
| `utils/` | **无状态 + 通用** | `formatDate()`、`slugify()`、`retry()` |
| `helpers/` | **层级绑定** | `tests/helpers/mockUser()`、`views/helpers/formatCurrency()` |
| `shared/` | **跨模块边界** | `shared/types/User.ts`、`shared/constants/` |
| `common/` | shared/ 的别名 | 避免使用；建议用 `shared/` 以求清晰 |
| `lib/` | **包装依赖** | `lib/http-client/`（包装 axios）、`lib/logger/` |
| `internal/` | **包私有**（Go 惯例） | `internal/parser/`（模块外部无法 import） |

#### 决策图

```
                    ┌─────────────────────┐
                    │   New shared code    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Is it stateless and  │
                    │ has no business      │
                    │ logic?               │
                    └──────────┬──────────┘
                          YES/ \NO
                           /     \
              ┌───────────▼┐   ┌─▼───────────────┐
              │ Reusable   │   │ Used by 2+       │
              │ across the │   │ modules?          │
              │ project?   │   └──────┬───────────┘
              └─────┬──────┘     YES/ \NO
                YES/ \NO          /     \
                 /     \   ┌─────▼──┐  ┌─▼──────────────┐
          ┌─────▼──┐  ┌─▼─────┐│shared/│  │ Wrapping a     │
          │utils/  │  │Tied to││       │  │ third-party    │
          │        │  │layer? │└────────┘  │ dependency?    │
          └────────┘  └──┬───┘            └──────┬─────────┘
                    YES/ \NO                YES/ \NO
                     /     \                 /     \
              ┌─────▼───┐  ┌▼────────┐┌────▼──┐  ┌─▼──────────┐
              │helpers/  │  │module/  ││lib/   │  │owning      │
              │(in layer)│  │        │└───────┘  │module/      │
              └──────────┘  └────────┘           └─────────────┘
```

#### 详细标准

**`utils/`** — 纯工具函数
- 无副作用、无状态、无业务逻辑
- 可以被提取为 npm 包 / pip 包
- 示例：`formatDate()`、`deepClone()`、`slugify()`、`retry()`
- 反模式：`utils/userService.js`（有业务逻辑 → 属于 `services/`）

**`helpers/`** — 情境特定辅助
- 绑定特定层级或领域
- 通常放在层级目录内：`tests/helpers/`、`views/helpers/`
- 很少在 `src/helpers/`（如果需要在 src 层级，可能是 `utils/`）
- 示例：`tests/helpers/createMockUser()`、`views/helpers/formatPrice()`

**`shared/`** — 跨模块共用代码
- 被 2 个以上模块使用
- 可包含类型、常量、验证规则或简单服务
- 有明确的模块边界（消费者从 `shared/` import）
- 示例：`shared/types/User.ts`、`shared/validation/email.ts`

**`lib/`** — 包装/Vendored 库
- 包装第三方依赖并加入项目特定默认值
- 提供稳定的内部接口，即使外部库变更
- 示例：`lib/http-client/`（包装 axios）、`lib/logger/`（包装 winston）

**`internal/`** — 包私有（Go 惯例）
- Go 特定：`internal/` 下的代码无法被外部包 import
- 其他语言：改用访问修饰符或模块边界
- 示例：`internal/parser/`、`internal/codec/`

---

## 4. 开发中间产物生命周期

工作文件从创建到毕业（或归档）遵循一个生命周期。

### 状态图

```
  ┌──────────┐
  │  draft   │ ← Initial creation
  └────┬─────┘
       │ Start active work
  ┌────▼─────┐
  │  active  │ ← Under discussion / development
  └────┬─────┘
       │
  ┌────┴─────────────────┐
  │                      │
  ▼                      ▼
┌──────────┐      ┌──────────┐
│graduated │      │ archived │
│          │      │          │
└──────────┘      └──────────┘
Creates formal     No longer
document           relevant
```

### 毕业路径

| 来源 | 目的地 | 触发条件 |
|------|--------|---------|
| 头脑风暴 | 规格（`docs/specs/`） | 想法固化为需求 |
| RFC | ADR（`docs/ADR/`） | 决策完成并被接受 |
| 技术调查 | ADR 或知识库 | 找到根因，需要决策 |
| POC | 功能实现 | POC 验证通过，开始构建 |
| 会议记录 | 行动项目（在 issue tracker 中） | 决策已提取 |

### 保留指南

| 状态 | 保留期限 |
|------|---------|
| `draft` | 不活跃 3 个月后自动归档 |
| `active` | 保留直到解决 |
| `graduated` | 永久保留（历史参考） |
| `archived` | 每年审查，不再有用则删除 |

---

## 5. 迁移指南

如果你的项目有文件在非标准位置，遵循此流程：

### 步骤 1：盘点

列出所有可能放错位置的文件：

```bash
# Find files at unexpected depths
find . -maxdepth 1 -name "*.md" ! -name "README.md" ! -name "CONTRIBUTING.md" \
  ! -name "CHANGELOG.md" ! -name "LICENSE" ! -name "SECURITY.md" ! -name "CODE_OF_CONDUCT.md"

# Find orphaned docs not in docs/
find . -name "*.md" -not -path "./docs/*" -not -path "./node_modules/*" \
  -not -path "./.git/*" | head -20
```

### 步骤 2：分类

使用反向查询索引（§2）确定每个文件的正确目的地。

### 步骤 3：移动

```bash
# Create target directories
mkdir -p docs/working/{brainstorms,investigations,rfcs,meeting-notes,poc}
mkdir -p src/generated

# Move files (update imports/references after)
git mv old/path/file.md new/path/file.md
```

### 步骤 4：更新引用

移动文件后，更新所有引用：
- 代码中的 import 路径
- 文档中的链接
- CI/CD 管线路径
- IDE 配置路径

---

## 6. 反模式

### ❌ 根目录杂乱

```
❌ project/
   ├── package.json
   ├── brainstorm.md          # Should be in docs/working/brainstorms/
   ├── investigation-oom.md   # Should be in docs/working/investigations/
   ├── TODO.md                # Should be in issue tracker
   └── notes.md               # Should be in docs/working/
```

### ❌ docs/ 作为垃圾桶

```
❌ docs/
   ├── architecture.md        # ✓ Correct
   ├── brainstorm-2024.md     # → docs/working/brainstorms/
   ├── meeting-jan-15.md      # → docs/working/meeting-notes/
   ├── poc-redis.md           # → docs/working/poc/redis/
   └── random-thoughts.md     # → docs/working/brainstorms/ or delete
```

### ❌ utils/ 作为万能桶

```
❌ src/utils/
   ├── formatDate.js          # ✓ Correct (pure utility)
   ├── userService.js         # → src/services/ (has business logic)
   ├── database.js            # → src/config/ or lib/ (infrastructure)
   └── authMiddleware.js      # → src/middleware/ (layer-specific)
```

### ❌ 目录没有 README

```
❌ docs/working/poc/redis-cache/
   ├── benchmark-results.txt
   ├── test-script.sh
   └── (no README.md — what was the conclusion?)

✅ docs/working/poc/redis-cache/
   ├── README.md              # Purpose, findings, conclusion, next steps
   ├── benchmark-results.txt
   └── test-script.sh
```

### ❌ 生成代码与源代码混杂

```
❌ src/
   ├── api-client.ts          # Hand-written
   ├── api-client.generated.ts # Generated — hard to tell apart
   └── models/
       ├── User.ts            # Hand-written
       └── User.generated.ts  # Generated

✅ src/
   ├── api-client.ts
   ├── models/User.ts
   └── generated/
       ├── api-client.ts      # Clearly separated
       └── models/User.ts
```

---

## 相关标准

- [项目结构标准](../project-structure.md) — 标准目录定义
- [文档结构标准](../documentation-structure.md) — 文档目录规则
- [代码提交标准](../checkin-standards.md) — 提交前验证
- [AI 友善架构](../ai-friendly-architecture.md) — AI 协作的结构

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-04 | 初始文件归档决策指南 |

---

## 许可证

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
