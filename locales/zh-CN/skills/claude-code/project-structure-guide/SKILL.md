---
source: ../../../../../skills/claude-code/project-structure-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 专案结构指南

遵循语言特定最佳实践组织专案目录的技能。

## 说明

此技能提供根据语言和框架惯例建构专案的指引，协助建立一致、可维护的目录布局。

## 触发时机

在以下情况使用此技能：
- 建立新专案
- 重组现有专案结构
- 新增模组或功能
- 设定建构配置
- 建立 .gitignore 档案

## 支援的语言

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
├── src/              # 原始码
├── tests/            # 测试档案
├── docs/             # 文件
├── tools/            # 建构/部署脚本
├── examples/         # 使用范例
├── config/           # 配置档案
└── .github/          # GitHub 配置
```

### 建构输出（始终 gitignore）

```
dist/                 # 发布输出
build/                # 编译产物
out/                  # 输出目录
bin/                  # 二进位执行档
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

### 建立专案结构

当被要求建立专案时：
1. 询问语言/框架
2. 生成适当的目录结构
3. 建立必要的配置档案
4. 生成 .gitignore

### 审查结构

审查现有结构时：
1. 检查语言惯例
2. 验证 gitignore 模式
3. 建议改进
4. 识别放错位置的档案

## 规则

1. **遵循语言惯例** - 每种语言都有既定模式
2. **分离关注点** - 将原始码、测试、文件分开
3. **Gitignore 建构输出** - 永不提交 dist/、build/、out/
4. **一致命名** - 使用语言适当的命名风格
5. **配置在根目录** - 将配置档案放在专案根目录

## 相关标准

- [核心：专案结构](../../../core/project-structure.md)
- [AI：专案结构选项](../../../ai/options/project-structure/)

## 版本

- **版本**：1.0.0
- **最后更新**：2025-12-30
