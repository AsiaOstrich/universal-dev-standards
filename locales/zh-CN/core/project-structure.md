---
source: ../../../core/project-structure.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: d7c93796b9e4
status: current
---

# 项目结构标准

**版本**: 1.2.0
**最后更新**: 2026-03-04
**适用范围**: 所有软件项目
**范围**: 部分
**行业标准**: Maven Standard Directory Layout
**参考资料**: [github.com](https://github.com/golang-standards/project-layout)

**English** | [繁體中文](../../zh-TW/core/project-structure.md)

---

## 目的

本标准定义了除文档文件之外的项目目录结构规范。它涵盖了工具、构建输出的通用目录以及特定语言的规范。

---

## 通用项目目录

### 推荐目录结构

```
project-root/
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # License file
│
├── .standards/ or .claude/      # Development standards
│   └── ...
│
├── docs/                        # Documentation
│   └── ...
│
├── src/                         # Source code (language-dependent)
│   └── ...
│
├── tests/                       # Test files (if separate from src)
│   └── ...
│
├── tools/                       # Development/deployment scripts
│   ├── deployment/              # Deployment scripts
│   ├── migration/               # Database migration tools
│   └── scripts/                 # Utility scripts
│
├── examples/                    # Usage examples
│   └── ...
│
├── dist/                        # Build output (gitignored)
├── build/                       # Compiled artifacts (gitignored)
└── publish/                     # Release packages (partially gitignored)
```

---

## 目录定义

### 源代码与构建目录

| 目录 | 用途 | gitignore？ | 备注 |
|-----------|---------|------------|-------|
| `src/` | 源代码 | 否 | 视语言而定；参见下文规范 |
| `lib/` | 库/依赖代码 | 视情况而定 | Vendored 依赖可能会被提交 |
| `dist/` | 分发/构建输出 | **是** | 生成的文件，切勿提交 |
| `build/` | 编译产物 | **是** | 中间构建文件 |
| `out/` | 输出目录 | **是** | dist/build 的替代方案 |
| `bin/` | 二进制可执行文件 | **是** | 编译后的二进制文件 |
| `obj/` | 目标文件 | **是** | .NET 中间文件 |

### 工具与脚本目录

| 目录 | 用途 | gitignore？ | 备注 |
|-----------|---------|------------|-------|
| `tools/` | 开发/部署工具 | 否 | Shell 脚本、Python 工具等 |
| `scripts/` | 构建/CI 脚本 | 否 | 通常位于根目录下或 tools/ 下 |
| `.github/` | GitHub 特定配置 | 否 | Actions、模板、工作流 |
| `.gitlab/` | GitLab 特定配置 | 否 | CI 模板 |

### 数据与配置目录

| 目录 | 用途 | gitignore？ | 备注 |
|-----------|---------|------------|-------|
| `data/` | 测试/种子数据 | 视情况而定 | 大文件应当被 gitignore |
| `config/` | 配置文件 | 视情况而定 | 机密信息必须被 gitignore |
| `assets/` | 静态资源 | 否 | 图像、模板等 |
| `resources/` | 资源文件 | 否 | assets/ 的替代方案 |

### 发布与发布包目录

| 目录 | 用途 | gitignore？ | 备注 |
|-----------|---------|------------|-------|
| `publish/` | 发布包 | 部分 | 可保留发布说明，gitignore 二进制文件 |
| `release/` | 发布产物 | **是** | 生成的发布文件 |
| `packages/` | Monorepo 包 | 否 | 用于 monorepo 项目 |

---

## 语言特定规范

### .NET / C#

```
project-root/
├── ProjectName.sln              # Solution file at root
├── ProjectName/                 # Main project
│   ├── ProjectName.csproj
│   ├── Program.cs
│   ├── Controllers/
│   └── ...
├── ProjectName.Domain/          # Domain layer (Clean Architecture)
├── ProjectName.Application/     # Application layer
├── ProjectName.Infrastructure/  # Infrastructure layer
├── ProjectName.Tests/           # Test project
└── docs/
```

**规范**: 项目是根目录的子目录，不在 `src/` 下。解决方案文件（`.sln`）保留在根目录下。

---

### Node.js / TypeScript

```
project-root/
├── package.json
├── tsconfig.json               # If TypeScript
├── src/                        # Source code
│   ├── index.ts
│   ├── controllers/
│   └── services/
├── dist/                       # Compiled output (gitignored)
├── tests/ or __tests__/        # Test files
├── node_modules/               # Dependencies (gitignored)
└── docs/
```

**规范**: 源代码放在 `src/` 中，编译输出放在 `dist/` 中。测试可以放在 `tests/`、`__tests__/`，或与源代码同目录放置。

---

### Python

```
project-root/
├── pyproject.toml or setup.py
├── src/                        # src-layout (recommended)
│   └── package_name/
│       ├── __init__.py
│       └── module.py
├── tests/
│   └── test_module.py
├── docs/
├── .venv/                      # Virtual environment (gitignored)
└── dist/                       # Built packages (gitignored)
```

**规范**: 库建议使用 src 布局（`src/package_name/`）。对于应用程序，扁平布局（根目录下的 `package_name/`）是可接受的。

---

### Java / Maven

```
project-root/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
├── target/                     # Build output (gitignored)
└── docs/
```

**规范**: Maven 标准目录布局。切勿偏离。

---

### Go

```
project-root/
├── go.mod
├── go.sum
├── main.go                     # Or cmd/app/main.go for multiple binaries
├── cmd/                        # Application entry points
│   └── myapp/
│       └── main.go
├── pkg/                        # Public library code
│   └── mylib/
├── internal/                   # Private application code
│   └── ...
├── api/                        # API definitions (protobuf, OpenAPI)
└── docs/
```

**规范**: 二进制文件使用 `cmd/`，私有代码使用 `internal/`，公开库使用 `pkg/`。

---

## Monorepo 结构

适用于包含多个包/应用程序的项目：

```
project-root/
├── package.json                # Root package.json (if using npm/yarn workspaces)
├── packages/                   # Shared packages
│   ├── shared-utils/
│   ├── ui-components/
│   └── api-client/
├── apps/                       # Applications
│   ├── web/
│   ├── mobile/
│   └── api-server/
├── tools/                      # Shared build tools
├── docs/                       # Shared documentation
└── README.md
```

---

## Monorepo vs Polyrepo 决策指南

### 决策矩阵

使用此矩阵确定哪种方式适合您的项目：

| 因素 | Monorepo 适合 | Polyrepo 适合 |
|------|---------------|---------------|
| **代码共享** | 高（共享库、组件） | 低（独立服务） |
| **团队结构** | 单一团队或紧密协作 | 自治团队 |
| **发布节奏** | 协调发布 | 独立发布 |
| **CI/CD 复杂度** | 可接受统一管线 | 需要隔离管线 |
| **仓库大小** | < 5GB，< 100万文件 | 大型资产、长历史 |
| **依赖管理** | 集中式版本控制 | 允许团队特定版本 |
| **工具投入** | 愿意投入工具 | 偏好简单 git 工作流 |

### 决策流程图

```
┌─────────────────────────────────────────┐
│ Do multiple projects share significant  │
│ code or dependencies?                   │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
       YES              NO
        │               │
        ▼               ▼
┌───────────────┐ ┌─────────────────────┐
│ Consider      │ │ Do teams need       │
│ MONOREPO      │ │ release independence│
└───────┬───────┘ └──────────┬──────────┘
        │                    │
        ▼            ┌───────┴───────┐
┌───────────────┐    ▼               ▼
│ Can you invest│   YES              NO
│ in tooling?   │    │               │
└───────┬───────┘    ▼               ▼
        │      ┌──────────┐   ┌──────────┐
┌───────┴───────┐│ POLYREPO │   │ MONOREPO │
▼               ▼└──────────┘   │ may work │
YES            NO               └──────────┘
│               │
▼               ▼
┌──────────┐  ┌──────────┐
│ MONOREPO │  │ POLYREPO │
│ (full)   │  │ (simpler)│
└──────────┘  └──────────┘
```

---

## Monorepo 工具比较

### 工具选择矩阵

| 功能 | Turborepo | Nx | Lerna | Rush |
|------|-----------|----|----|------|
| **主要用途** | 任务执行 | 完整框架 | 发布 | 企业级 |
| **学习曲线** | 低 | 中高 | 低 | 高 |
| **构建速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **远程缓存** | ✅ 内置 | ✅ Nx Cloud | ❌ 手动 | ✅ 内置 |
| **代码生成** | ❌ | ✅ 丰富 | ❌ | ❌ |
| **受影响检测** | ✅ | ✅ | ✅ | ✅ |
| **框架支持** | 框架无关 | React、Angular 等 | 任意 | 任意 |
| **维护方** | Vercel | Nrwl | Lerna-Lite fork | Microsoft |
| **最适合** | 中小型团队 | 大型团队、企业 | 简单发布 | 企业规模 |

### 快速选择指南

**选择 Turborepo 当**：
- 您希望最小化配置
- 主要需求是带缓存的快速构建
- 团队规模较小到中等（< 50 名开发者）
- 您更偏好约定优于配置

**选择 Nx 当**：
- 您需要代码生成和脚手架
- 您希望拥有内置的框架集成
- 团队规模较大或达到企业级
- 您需要高级依赖图可视化

**选择 Lerna 当**：
- 主要需求是 npm 包发布
- 您希望使用简单、熟悉的工具
- 您正在从独立包进行迁移

**选择 Rush 当**：
- 您处于企业级环境中
- 您需要严格的依赖隔离
- 您拥有复杂的审批工作流
- 您在大规模使用 pnpm

### Turborepo 示例

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**", "test/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Nx 示例

```json
// nx.json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts"]
  },
  "defaultBase": "main"
}
```

---

## Workspace 配置

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### Yarn Workspaces

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "yarn workspaces foreach -pt run build",
    "test": "yarn workspaces foreach run test"
  }
}
```

### npm Workspaces

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present"
  }
}
```

---

## 基于包的架构

### 概念

基于包的架构按**功能边界**而非技术层次组织代码。每个包都是具有清晰接口的自包含单元。

```
Traditional (Layer-based)          Package-based (Feature-based)
─────────────────────────          ────────────────────────────
src/                               packages/
├── controllers/                   ├── authentication/
│   ├── userController.js         │   ├── api/
│   └── orderController.js        │   ├── domain/
├── services/                      │   ├── infrastructure/
│   ├── userService.js            │   └── index.ts
│   └── orderService.js           ├── orders/
├── models/                        │   ├── api/
│   ├── user.js                   │   ├── domain/
│   └── order.js                  │   ├── infrastructure/
└── repositories/                  │   └── index.ts
    ├── userRepository.js         └── shared/
    └── orderRepository.js            ├── database/
                                      └── utils/
```

### 好处

| 好处 | 说明 |
|---------|-------------|
| **清晰边界** | 每个包有明确的公开 API |
| **独立测试** | 可隔离测试包 |
| **并行开发** | 团队可在不同包上工作 |
| **选择性部署** | 只部署变更的包 |
| **代码所有权** | 每个包具有明确的所有权 |

### 包结构模板

```
packages/feature-name/
├── package.json          # Package metadata
├── tsconfig.json         # TypeScript config (if applicable)
├── src/
│   ├── index.ts          # Public API exports
│   ├── api/              # External interfaces (REST, GraphQL, etc.)
│   ├── domain/           # Business logic
│   │   ├── entities/
│   │   ├── services/
│   │   └── events/
│   └── infrastructure/   # External integrations
│       ├── database/
│       └── external-services/
├── tests/
│   ├── unit/
│   └── integration/
└── README.md             # Package documentation
```

### 公开 API 设计

```typescript
// packages/authentication/src/index.ts
// Only export what other packages need

// Domain types
export type { User, AuthToken, AuthResult } from './domain/types';

// Service interfaces
export { AuthService } from './domain/services/auth-service';

// API handlers (if needed by other packages)
export { createAuthRouter } from './api/routes';

// Do NOT export internal implementation details
// ❌ export { hashPassword } from './infrastructure/crypto';
```

### 包间依赖

```json
// packages/orders/package.json
{
  "name": "@myorg/orders",
  "version": "1.0.0",
  "dependencies": {
    "@myorg/authentication": "workspace:*",
    "@myorg/shared": "workspace:*"
  }
}
```

---

## IDE 与编辑器产物

### 应加入 Gitignore 的常见产物

```gitignore
# IDE - JetBrains (IntelliJ, Rider, WebStorm)
.idea/
*.iml

# IDE - Visual Studio
.vs/
*.user
*.suo

# IDE - VS Code (optional, some teams commit .vscode/)
.vscode/
!.vscode/settings.json    # May commit shared settings
!.vscode/extensions.json  # May commit recommended extensions

# IDE - Eclipse
.project
.classpath
.settings/

# macOS
.DS_Store

# Windows
Thumbs.db
desktop.ini
```

### 检测未提交的产物

在提交之前，确认未跟踪任何 IDE 产物：

```bash
# Check for common IDE artifacts in git
git ls-files | grep -E '^\$|^\.idea|^\.vs/|\.user$|\.suo$'
```

**已知问题**：VSCode 变量展开错误可能会创建类似 `${workspaceFolder}/` 的目录。如果发现，请将其删除：

```bash
# Remove if exists and not tracked
rm -rf '${workspaceFolder}'
```

---

## 源代码组织术语

### 目录用途指南

组织源代码时，这些目录具有不同的用途：

| 目录 | 用途 | 何时使用 | 无状态？ | 可复用范围 |
|------|------|---------|----------|-----------|
| `utils/` | 纯工具函数 | 无状态、无业务逻辑、跨模块可复用 | 是 | 全局 |
| `helpers/` | 上下文特定辅助 | 绑定到特定层级（测试、视图、控制器） | 不一定 | 层级特定 |
| `shared/` | 跨模块共享代码 | 供 2 个以上模块使用，可能有包边界 | 不一定 | 跨模块 |
| `common/` | shared/ 的别名 | 较不推荐；建议使用 `shared/` 代替 | 不一定 | 跨模块 |
| `lib/` | 封装/vendored 库 | 封装第三方依赖、内部库 | 不一定 | 项目级别 |
| `internal/` | 私有模块代码（Go 惯例） | 模块/包内部，不对外暴露给使用者 | 不一定 | 包内部 |

### 决策流程

```
Is it stateless and has no business logic?
├── YES: Is it reusable across the entire project?
│   ├── YES → utils/
│   └── NO: Is it tied to a specific layer (tests, views)?
│       ├── YES → helpers/  (e.g., tests/helpers/, views/helpers/)
│       └── NO → Place in the module that uses it
└── NO: Is it used by 2+ modules?
    ├── YES → shared/
    └── NO: Is it wrapping a third-party dependency?
        ├── YES → lib/
        └── NO → Place in the owning module
```

### 示例

```
src/
├── utils/              # formatDate(), slugify(), deepClone()
├── helpers/            # (uncommon at src/ level; prefer layer-specific)
├── shared/
│   ├── types/          # Cross-module TypeScript types
│   └── constants/      # Shared constants
├── lib/
│   └── http-client/    # Wrapped axios with project defaults
└── modules/
    └── auth/
        └── helpers/    # Auth-specific helper functions
```

---

## 配置文件归属

### 标准位置

| 分类 | 位置 | 示例 |
|------|------|------|
| **根目录配置** | 项目根目录 `/` | `package.json`, `tsconfig.json`, `pyproject.toml`, `.eslintrc.json` |
| **应用程序配置** | `config/` 或 `src/config/` | 数据库配置、特性标志、应用程序设置 |
| **环境变量** | `.env` 文件（gitignored） | `.env`, `.env.local`, `.env.production` |
| **CI/CD** | `.github/workflows/` 或 `.gitlab-ci.yml` | CI 管线定义 |
| **基础设施** | `infra/` 或 `deploy/` | Terraform、Kubernetes manifests、Docker Compose |
| **IDE/编辑器** | 根目录（多数 gitignored） | `.vscode/`, `.idea/`, `.editorconfig` |

### 决策规则

1. **工具配置** → 项目根目录（工具预期在此）
2. **应用程序运行时配置** → `config/` 或 `src/config/`
3. **机密信息** → `.env` 文件，**永远 gitignored**
4. **CI/CD** → 平台特定目录（`.github/`、`.gitlab/`）
5. **基础设施即代码** → `infra/` 或 `deploy/`

---

## 生成代码归属

### 标准位置

| 类型 | 位置 | Gitignore？ |
|------|------|------------|
| **API 客户端 stubs** | `src/generated/` | 视工作流程而定 |
| **Protobuf/gRPC** | `src/generated/proto/` | 是（从 .proto 重新生成） |
| **数据库类型** (ORM) | `src/generated/db/` | 视 ORM 而定 |
| **OpenAPI 类型** | `src/generated/api/` | 视工作流程而定 |
| **构建产物** | `dist/`, `build/` | 是 |
| **编译资源** | `out/`, `bin/` | 是 |

### 规则

1. **永远分离**生成代码与手写代码
2. **使用 `src/generated/`** 作为标准父目录
3. **可重现则 gitignore** — 如果代码可从源文件（`.proto`、`.graphql`、schema）重新生成，则 gitignore 它
4. **关键则提交** — 如果生成工具不在 CI 中或生成具有非确定性，则提交输出
5. **永远不编辑生成文件** — 添加头部注释：`// DO NOT EDIT — generated by [tool]`

---

## 反模式

### ❌ 避免这些模式

1. **无目的的嵌套 src 目录**
   ```
   ❌ project/src/src/main/...
   ```

2. **将构建输出与源代码混合**
   ```
   ❌ src/
       ├── app.ts
       └── app.js      # Compiled file mixed with source
   ```

3. **在没有 monorepo 结构的情况下，在一个代码仓库中放置多个无关项目**
   ```
   ❌ project/
       ├── backend/    # Unrelated project
       └── frontend/   # Another unrelated project
       # No shared tooling, no workspace config
   ```

4. **提交生成的文件**
   ```
   ❌ dist/ tracked in git
   ❌ node_modules/ tracked in git
   ```

5. **代码仓库中包含机密信息**
   ```
   ❌ config/secrets.json committed
   ❌ .env with real credentials committed
   ```

---

## 验证检查清单

在提交之前，请验证：

- [ ] 构建输出（`dist/`、`build/`、`bin/`、`obj/`）已 gitignore
- [ ] 依赖项（`node_modules/`、`.venv/`、`vendor/`）已 gitignore
- [ ] IDE 产物（`.idea/`、`.vs/`）已 gitignore
- [ ] 提交的文件中没有机密信息
- [ ] 源码结构遵循语言规范
- [ ] 没有异常目录（例如 `${workspaceFolder}/`）

---

## 相关标准

- [文档结构标准](documentation-structure.md)
- [代码签入标准](checkin-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-03-04 | 新增：源代码组织术语（utils/helpers/shared/lib）、配置文件归属、生成代码归属 |
| 1.1.0 | 2026-01-24 | 新增：Monorepo vs Polyrepo 决策指南、Monorepo 工具比较（Turborepo、Nx、Lerna、Rush）、Workspace 配置示例、基于包的架构 |
| 1.0.1 | 2025-12-24 | 新增：相关标准章节 |
| 1.0.0 | 2025-12-11 | 初始项目结构标准 |

---

## 参考资料

- [.NET Project Structure](https://docs.microsoft.com/en-us/dotnet/core/porting/project-structure)
- [Node.js Project Structure Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python Packaging User Guide](https://packaging.python.org/en/latest/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- [Turborepo 文档](https://turbo.build/repo/docs) - 现代 JavaScript/TypeScript monorepo 构建系统
- [Nx 文档](https://nx.dev/getting-started/intro) - 具备高级特性的智能 monorepo 工具
- [pnpm Workspaces](https://pnpm.io/workspaces) - 快速、高效节省磁盘空间的包管理器 workspaces
- [Monorepo Explained](https://monorepo.tools/) - Monorepo 工具全面指南

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
