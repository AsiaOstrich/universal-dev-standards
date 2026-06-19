---
source: options/documentation/markdown-docs.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Markdown 文档

> **语言**: [English](../../../../options/documentation/markdown-docs.md) | 简体中文

**上层标准**: [Documentation Structure](../../core/documentation-structure.md)

---

## 概览

纯 Markdown 文档是一种简单、可移植的项目文档方式。文件直接存储在仓库中，以 Git 进行版本控制，并可在 GitHub 和 GitLab 等平台上原生呈现。

## 最适用于

- 开源项目
- 托管于 GitHub/GitLab 的项目
- 以开发者为中心的文档
- 想要简单、可移植文档的项目
- 中小型项目

## 文件结构

### 根目录文件

| File | Required | 用途 |
|------|----------|---------|
| `README.md` | Yes | 项目概览、快速开始 |
| `CONTRIBUTING.md` | No | 贡献指南 |
| `CHANGELOG.md` | No | 版本历史 |
| `LICENSE` | Yes | 许可证文件 |

### docs/ 文件夹

**位置：** `docs/`
**命名约定：** lowercase-kebab-case

#### 常见文件

- `getting-started.md`
- `installation.md`
- `configuration.md`
- `api-reference.md`
- `troubleshooting.md`
- `faq.md`

#### 子目录

| Directory | 用途 |
|-----------|---------|
| `guides/` | 操作指南 |
| `tutorials/` | 分步教程 |
| `reference/` | API 与配置参考 |
| `ADR/` | 架构决策记录 |

## README 模板

```markdown
# Project Name

Brief description of the project.

## Features

- Feature 1
- Feature 2

## Installation

npm install project-name

## Quick Start

import { something } from 'project-name';

## Documentation

See [docs/](./docs/) for full documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
```

## Markdown 最佳实践

- 使用 ATX 样式标题（`#`、`##`、`###`）
- 在标题前后加入空行
- 使用指定语言的 fenced code block
- 将每行控制在 120 字符以内
- 对重复的 URL 使用 reference-style 链接

## 工具

| Tool | 用途 |
|------|---------|
| markdownlint | Lint markdown 文件 |
| markdown-link-check | 检查失效链接 |
| docsify | 生成文档网站 |
| mkdocs | 静态网站生成器 |

## 规则

| 规则 | 说明 | 优先级 |
|------|-------------|----------|
| 根目录大写 | 根目录文档使用 UPPERCASE（README、CONTRIBUTING） | Required |
| docs lowercase-kebab | docs/ 文件使用 lowercase-kebab-case | Required |
| 相对链接 | 内部链接使用相对路径 | Required |
| 包含示例 | 为所有功能包含代码示例 | Recommended |

## 与其他方式的比较

| 方面 | 仓库内 Markdown | Wiki | 外部文档网站 |
|--------|------------------|------|-------------------|
| 版本控制 | 以 Git 为基础 | 内置 | 视平台而定 |
| 编辑 | 需要 Git | WYSIWYG／简易 | 不一定 |
| 离线访问 | 完整 | 有限 | 有限 |
| 搜索 | GitHub 搜索 | 内置 | 不一定 |

## 相关选项

- [API Docs](./api-docs.md) - API 参考文档
- [Wiki Style](./wiki-style.md) - Wiki 风格协作文档

---

## 参考资料

- [CommonMark](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Docsify](https://docsify.js.org/)
- [MkDocs](https://www.mkdocs.org/)

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
