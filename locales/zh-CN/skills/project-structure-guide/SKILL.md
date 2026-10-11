---
source: ../../../../skills/project-structure-guide/SKILL.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-10-11
source_hash: 0c1ad1961de0
status: current
description: |
  依各语言的最佳实践组织项目目录结构的指南。
  Use when: 创建项目、重整结构、新增模块、配置构建流程、决定文件该放哪里。
  Not for: 专门为 AI 导览而设计的结构——请用 /ai-friendly-architecture；原地重整既有代码——请用 /refactor。
  Keywords: project, structure, directory, layout, gitignore, scaffold, file placement, utils, helpers, shared, 项目结构, 目录布局, 文件摆放.
---

# 项目结构指南

> **Language**: [English](../../../../skills/project-structure-guide/SKILL.md) | 简体中文

**版本**：1.1.0
**最后更新**：2026-03-04
**适用性**：Claude Code Skills

---

## 目的

此技能提供根据语言和框架惯例组织项目的指引，协助建立一致、可维护的目录布局。

# [Physical Binding]
## 现实检查（Reality Check）
在确认项目结构有效之前，你**必须**：
1. 执行验证器：`uds check --standard project-structure`
2. 若 exit_code != 0：
   - 阅读错误信息（例如 "Missing required directories"）。
   - 向用户报告违规之处。
   - 建议具体的修复命令（`mkdir ...`）。
   - 修复后**重新**执行验证。

## 触发时机

在以下情况使用此技能：
- 创建新项目
- 重组现有项目结构
- 新增模块或功能
- 设置构建配置
- 创建 .gitignore 文件
- 决定文件的放置位置（代码、文档、配置、资源）
- 在 utils/、helpers/、shared/、lib/ 或 internal/ 之间做选择
- 放置开发中间产物（头脑风暴、RFC、POC、技术调查）

## 支持的语言

| 语言 | 框架/模式 |
|------|-----------|
| Node.js | Express、NestJS、Next.js |
| Python | Django、Flask、FastAPI |
| Java | Spring Boot、Maven、Gradle |
| .NET | ASP.NET Core、Console |
| Go | 标准布局、cmd/pkg |
| Rust | Binary、Library、Workspace |
| Kotlin | Gradle、Android、Multiplatform |
| PHP | Laravel、Symfony、PSR-4 |
| Ruby | Rails、Gem、Sinatra |
| Swift | SPM、iOS App、Vapor |

## 常见结构模式

### 标准目录

```
project-root/
├── src/              # 源代码
├── tests/            # 测试文件
├── docs/             # 文档
├── tools/            # 构建/部署脚本
├── examples/         # 使用示例
├── config/           # 配置文件
└── .github/          # GitHub 配置
```

### 构建输出（始终 gitignore）

```
dist/                 # 发布输出
build/                # 编译产物
out/                  # 输出目录
bin/                  # 二进制可执行文件
```

## 语言特定指南

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

## 快速操作

### 创建项目结构

当被要求创建项目时：
1. 询问语言/框架
2. 生成适当的目录结构
3. 创建必要的配置文件
4. 生成 .gitignore

### 审查结构

审查现有结构时：
1. 检查语言惯例
2. 验证 gitignore 模式
3. 建议改进
4. 识别放错位置的文件

## 规则

1. **遵循语言惯例** - 每种语言都有既定模式
2. **分离关注点** - 将源代码、测试、文档分开
3. **Gitignore 构建输出** - 永不提交 dist/、build/、out/
4. **一致命名** - 使用语言适当的命名风格
5. **配置在根目录** - 将配置文件放在项目根目录
6. **辨析目录术语** - utils/（无状态、通用）、helpers/（层级绑定）、shared/（跨模块）、lib/（包装依赖）
7. **工作文档放 docs/working/** - 头脑风暴、RFC、POC、技术调查放在 docs/working/ 并进行生命周期管理
8. **生成代码分离** - 放在 src/generated/{type}/，永不与手写代码混合

## 下一步引导

`/project-structure` 完成后，AI 助手应建议：

> **项目结构已创建或审查完成。建议下一步：**
> - 执行 `/sdd` 开始规格驱动开发，将项目结构纳入正式规格 ⭐ **推荐** — 确保结构决策有规格追踪
> - 执行 `/docs` 生成项目文档（README、ARCHITECTURE.md 等） — 让结构决策有文档记录
> - 执行 `/ai-friendly-architecture` 设置 AI 上下文配置 — 让 AI 助手更好地理解项目结构

---

## 相关标准

- [各语言的项目结构](./language-patterns.md) — 按语言列出的实际目录布局（Node.js/TypeScript、Python、Go 等）。要为某个特定语言安排项目结构时读它。
- [核心：项目结构](../../../../core/project-structure.md)
- [核心：文档结构](../../../../core/documentation-structure.md)
- [指南：文件归档决策指南](../../../../core/guides/file-placement-guide.md)
- [AI：项目结构选项](../../../../ai/options/project-structure/)
