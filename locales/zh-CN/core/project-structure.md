---
source: ../../../core/project-structure.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-03-04
status: current
---

> **语言**: [English](../../../core/project-structure.md) | [简体中文](../../zh-TW/core/project-structure.md) | 简体中文

# 项目结构标准

**版本**: 1.2.0
**最后更新**: 2026-03-04
**适用范围**: 所有软件项目

---

## 目的

本标准定义项目目录结构的通用规范，确保代码组织的一致性和可维护性。

---

## 通用结构

### 推荐布局

```
project-root/
├── src/              # 源代码
├── tests/            # 测试文件
├── docs/             # 文档
├── tools/            # 构建/部署脚本
│   ├── deployment/
│   ├── migration/
│   └── scripts/
├── examples/         # 使用示例
├── config/           # 配置文件
├── .github/          # GitHub 配置
└── .gitignore
```

---

## 构建输出（始终 gitignore）

| 目录 | 用途 |
|------|------|
| dist/ | 分发输出 |
| build/ | 编译产物 |
| out/ | 输出目录 |
| bin/ | 二进制文件 |

---

## 语言特定结构

### Node.js

```
project/
├── src/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── models/
├── tests/
├── package.json
└── .gitignore
```

### Python

```
project/
├── src/
│   └── package_name/
│       ├── __init__.py
│       └── main.py
├── tests/
├── pyproject.toml
└── .gitignore
```

### Go

```
project/
├── cmd/
│   └── appname/
│       └── main.go
├── internal/
├── pkg/
├── go.mod
└── .gitignore
```

### Java/Kotlin

```
project/
├── src/
│   ├── main/
│   │   └── java/
│   └── test/
│       └── java/
├── build.gradle
└── .gitignore
```

---

## Gitignore 模式

### 通用模式

```gitignore
# 构建输出
dist/
build/
out/
bin/

# 环境文件
.env
.env.*

# IDE
.idea/
.vscode/
*.swp

# 操作系统
.DS_Store
Thumbs.db
```

### 语言特定

| 语言 | 模式 |
|------|------|
| Node.js | node_modules/, *.log |
| Python | __pycache__/, *.pyc, .venv/ |
| Go | vendor/ |
| Java | *.class, target/ |
| .NET | bin/, obj/ |

---

## 快速参考卡

### 标准目录

| 目录 | 用途 | Gitignore |
|------|------|-----------|
| src/ | 源代码 | 否 |
| tests/ | 测试文件 | 否 |
| docs/ | 文档 | 否 |
| dist/ | 构建输出 | 是 |
| build/ | 编译产物 | 是 |
| node_modules/ | 依赖 | 是 |

### 检查清单

- [ ] 遵循语言规范
- [ ] 源代码和测试分离
- [ ] 构建输出已 gitignore
- [ ] 配置文件在根目录
- [ ] 有 README.md

---

## Monorepo vs Polyrepo 决策指南

### 决策矩阵

| 因素 | Monorepo 适合 | Polyrepo 适合 |
|------|-------------|--------------||
| **代码共享** | 高（共用库、组件） | 低（独立服务） |
| **团队结构** | 单一团队或紧密协作 | 自治团队 |
| **发布节奏** | 协调发布 | 独立发布 |
| **CI/CD 复杂度** | 可接受统一管道 | 需要隔离管道 |
| **仓库大小** | < 5GB，< 100万文件 | 大型资产、长历史 |

### 快速选择指南

**选择 Monorepo 当**:
- 多个项目共享大量代码或依赖
- 团队愿意投资于工具

**选择 Polyrepo 当**:
- 团队需要发布独立性
- 各项目完全独立

---

## Monorepo 工具比较

| 功能 | Turborepo | Nx | Lerna | Rush |
|------|-----------|----|----|------|
| **主要用途** | 任务执行 | 完整框架 | 发布 | 企业级 |
| **学习曲线** | 低 | 中高 | 低 | 高 |
| **构建速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **远程缓存** | ✅ 内置 | ✅ Nx Cloud | ❌ 手动 | ✅ 内置 |
| **代码生成** | ❌ | ✅ 丰富 | ❌ | ❌ |
| **最适合** | 小中型团队 | 大型团队、企业 | 简单发布 | 企业规模 |

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

### Yarn Workspaces

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

---

## 基于包的架构

### 概念

基于包的架构按**功能边界**而非技术层次组织代码。每个包是独立的单元，有清晰的接口。

```
传统（分层）                    基于包（按功能）
─────────────                  ────────────────
src/                           packages/
├── controllers/               ├── authentication/
├── services/                  │   ├── api/
├── models/                    │   ├── domain/
└── repositories/              │   └── infrastructure/
                               ├── orders/
                               └── shared/
```

### 好处

| 好处 | 说明 |
|------|------|
| **清晰边界** | 每个包有明确的公开 API |
| **独立测试** | 可隔离测试包 |
| **并行开发** | 团队可在不同包上工作 |
| **选择性部署** | 只部署变更的包 |

---

## 源代码组织术语

### 目录用途指南

组织源代码时，以下目录具有不同用途：

| 目录 | 用途 | 何时使用 | 无状态？ | 可重用范围 |
|------|------|---------|----------|-----------|
| `utils/` | 纯工具函数 | 无状态、无业务逻辑、跨模块可重用 | 是 | 全局 |
| `helpers/` | 情境特定辅助 | 绑定特定层级（测试、视图、控制器） | 不一定 | 层级特定 |
| `shared/` | 跨模块共用代码 | 2+ 模块使用、可能有包边界 | 不一定 | 跨模块 |
| `common/` | shared/ 的别名 | 较不推荐；建议使用 `shared/` | 不一定 | 跨模块 |
| `lib/` | 包装/vendored 库 | 包装第三方依赖、内部库 | 不一定 | 项目级别 |
| `internal/` | 包私有代码（Go 惯例） | 模块/包内部，不对外暴露 | 不一定 | 包内部 |

### 决策流程

```
是否无状态且无业务逻辑？
├── 是：在整个项目中可重用吗？
│   ├── 是 → utils/
│   └── 否：绑定特定层级（测试、视图）？
│       ├── 是 → helpers/（例如 tests/helpers/、views/helpers/）
│       └── 否 → 放在使用它的模块中
└── 否：被 2+ 模块使用？
    ├── 是 → shared/
    └── 否：是否包装第三方依赖？
        ├── 是 → lib/
        └── 否 → 放在拥有它的模块中
```

### 示例

```
src/
├── utils/              # formatDate()、slugify()、deepClone()
├── helpers/            # （在 src/ 层级不常见；建议使用层级特定的）
├── shared/
│   ├── types/          # 跨模块 TypeScript 类型
│   └── constants/      # 共用常量
├── lib/
│   └── http-client/    # 包装 axios 并加入项目默认
└── modules/
    └── auth/
        └── helpers/    # Auth 特定的辅助函数
```

---

## 配置文件归属

### 标准位置

| 分类 | 位置 | 示例 |
|------|------|------|
| **根目录配置** | 项目根目录 `/` | `package.json`、`tsconfig.json`、`pyproject.toml`、`.eslintrc.json` |
| **应用程序配置** | `config/` 或 `src/config/` | 数据库配置、功能标志、应用程序设置 |
| **环境变量** | `.env` 文件（gitignored） | `.env`、`.env.local`、`.env.production` |
| **CI/CD** | `.github/workflows/` 或 `.gitlab-ci.yml` | CI 管线定义 |
| **基础设施** | `infra/` 或 `deploy/` | Terraform、Kubernetes manifests、Docker Compose |
| **IDE/编辑器** | 根目录（多数 gitignored） | `.vscode/`、`.idea/`、`.editorconfig` |

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
| **数据库类型**（ORM） | `src/generated/db/` | 视 ORM 而定 |
| **OpenAPI 类型** | `src/generated/api/` | 视工作流程而定 |
| **构建产物** | `dist/`、`build/` | 是 |
| **编译资源** | `out/`、`bin/` | 是 |

### 规则

1. **永远分离**生成代码与手写代码
2. **使用 `src/generated/`** 作为标准父目录
3. **可重现则 gitignore** — 如果可从源文件（`.proto`、`.graphql`、schema）重新生成，则 gitignore
4. **关键则提交** — 如果生成工具不在 CI 中或生成结果非确定性的，则提交输出
5. **永远不编辑生成文件** — 加入头部注释：`// DO NOT EDIT — generated by [tool]`

---

## 相关标准

- [文档结构标准](documentation-structure.md) - 文档结构标准
- [代码签入标准](checkin-standards.md) - 代码签入标准

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-03-04 | 新增：源代码组织术语（utils/helpers/shared/lib）、配置文件归属、生成代码归属 |
| 1.1.0 | 2026-01-24 | 新增：Monorepo vs Polyrepo 决策指南、Monorepo 工具比较、Workspace 配置、基于包的架构 |
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
- [Nx 文档](https://nx.dev/getting-started/intro) - 智能 monorepo 工具
- [pnpm Workspaces](https://pnpm.io/workspaces) - 快速、高效的包管理器 workspaces
- [Monorepo Explained](https://monorepo.tools/) - Monorepo 工具全面指南

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
