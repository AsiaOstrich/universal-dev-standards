---
source: ../../core/project-structure.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-24
status: current
---

> **语言**: [English](../../core/project-structure.md) | [简体中文](../../zh-TW/core/project-structure.md) | 简体中文

# 项目结构标准

**版本**: 1.0.0
**最后更新**: 2025-12-30
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

## 相关标准

- [文档结构标准](documentation-structure.md) - 文档结构标准
- [代码签入标准](checkin-standards.md) - 代码签入标准

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
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
