---
source: ../../../core/project-structure.md
source_version: 1.0.1
translation_version: 1.0.1
last_synced: 2026-01-08
status: current
---

> **语言**: [English](../../../core/project-structure.md) | [繁體中文](../../zh-TW/core/project-structure.md) | 简体中文

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

## 相关标准

- [文档结构](documentation-structure.md)
- [Git 工作流程](git-workflow.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
