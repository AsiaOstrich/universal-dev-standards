---
source: ../../../core/documentation-structure.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-01-24
status: current
---

> **语言**: [English](../../../core/documentation-structure.md) | [简体中文](../../zh-TW/core/documentation-structure.md) | 简体中文

# 文档结构标准

**版本**: 1.3.0
**最后更新**: 2026-01-24
**适用范围**: 所有需要文档的软件项目

---

## 目的

本标准定义项目文档的组织结构和命名规范，确保文档的一致性和可发现性。

---

## 目录结构

### 推荐结构

```
project/
├── README.md              # 项目概述
├── CHANGELOG.md           # 版本变更记录
├── CONTRIBUTING.md        # 贡献指南
├── LICENSE                # 许可证
├── docs/
│   ├── getting-started.md # 快速入门
│   ├── installation.md    # 安装指南
│   ├── configuration.md   # 配置说明
│   ├── specs/             # 规格文档
│   │   ├── README.md      # 规格索引
│   │   ├── system/        # 系统设计规格
│   │   └── {component}/   # 组件规格
│   ├── api/               # API 文档
│   │   └── README.md
│   ├── guides/            # 使用指南
│   │   └── README.md
│   └── architecture/      # 架构文档
│       └── README.md
└── examples/              # 示例代码
    └── README.md
```

---

## 文件命名

### 规范

| 规则 | 示例 |
|------|------|
| 使用小写字母 | getting-started.md |
| 使用连字符分隔 | api-reference.md |
| 有意义的名称 | configuration.md |
| 避免特殊字符 | ❌ api_v2(new).md |

### 常用文件名

| 文件 | 用途 |
|------|------|
| README.md | 目录/项目说明 |
| CHANGELOG.md | 版本变更 |
| CONTRIBUTING.md | 贡献指南 |
| LICENSE | 许可证 |
| SECURITY.md | 安全政策 |
| CODE_OF_CONDUCT.md | 行为准则 |

---

## README 模板

### 基本结构

```markdown
# 项目名称

简短描述项目用途。

## 功能

- 功能 1
- 功能 2

## 安装

```bash
npm install package-name
```

## 使用

```javascript
const pkg = require('package-name');
pkg.doSomething();
```

## 文档

详细文档请参阅 [docs/](docs/)。

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
```

---

## Markdown 风格

### 标题

```markdown
# 一级标题（仅用于文档标题）
## 二级标题
### 三级标题
```

### 代码块

````markdown
```javascript
const example = 'code';
```
````

### 链接

```markdown
[显示文本](url)
[相对链接](../other-doc.md)
```

---

## 快速参考卡

### 必要文件

| 文件 | 必要性 |
|------|-------|
| README.md | 必要 |
| LICENSE | 必要 |
| CHANGELOG.md | 推荐 |
| CONTRIBUTING.md | 推荐 |

### 命名检查清单

- [ ] 使用小写字母
- [ ] 使用连字符分隔单词
- [ ] 名称描述内容
- [ ] 无特殊字符

---

## 规格文档

### 目的

规格文档定义**实作前**的设计与实作细节。

| 类型 | 目的 | 位置 |
|------|------|------|
| **规格** | 定义要建什么及如何建 | `docs/specs/` |
| **文档** | 说明建了什么 | `docs/` |

### 规格目录结构

```
docs/specs/
├── README.md               # 规格索引
├── system/                 # 系统设计规格
└── {component}/            # 组件规格
    ├── design/             # 设计规格
    └── {module}/           # 实作规格
```

---

## 相关标准

- [API 文档标准](api-documentation-standards.md)
- [变更日志标准](changelog-standards.md)
- [规格驱动开发](spec-driven-development.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.3.0 | 2026-01-24 | 新增规格文档标准 |
| 1.0.0 | 2025-12-30 | 初始版本 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
