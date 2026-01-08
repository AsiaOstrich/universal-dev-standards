---
source: skills/claude-code/documentation-guide/documentation-structure.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 文件结构参考

> **语言**: [English](../../../../../skills/claude-code/documentation-guide/documentation-structure.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供专案文件结构和档案组织的参考指南。

---

## 标准专案结构

```
project-root/
├── README.md                    # 专案概述（必需）
├── CONTRIBUTING.md              # 贡献指南
├── CHANGELOG.md                 # 版本历史
├── LICENSE                      # 授权档案
├── docs/                        # 详细文件
│   ├── index.md                 # 文件索引
│   ├── getting-started.md       # 快速入门指南
│   ├── architecture.md          # 系统架构
│   ├── api-reference.md         # API 文件
│   ├── deployment.md            # 部署指南
│   └── troubleshooting.md       # 常见问题
└── examples/                    # 程式码范例
    ├── basic-usage/
    └── README.md
```

---

## 不同专案类型的文件需求

| 文件 | 新专案 | 重构 | 迁移 | 维护 |
|------|:------:|:----:|:----:|:----:|
| **README.md** | ✅ | ✅ | ✅ | ✅ |
| **CONTRIBUTING.md** | ⚪ | ✅ | ✅ | ⚪ |
| **CHANGELOG.md** | ✅ | ✅ | ✅ | ✅ |
| **LICENSE** | ✅ | ✅ | ✅ | ✅ |
| **docs/architecture.md** | ✅ | ✅ | ✅ | ⚪ |
| **docs/api-reference.md** | ⚪ | ✅ | ✅ | ⚪ |
| **docs/deployment.md** | ✅ | ✅ | ✅ | ⚪ |

**图例**: ✅ 必需 | ⚪ 建议 | ❌ 不需要

---

## 档案命名惯例

### 根目录档案

使用**大写**以便 GitHub/GitLab 自动识别：

| 档案 | 原因 |
|------|------|
| `README.md` | GitHub 自动在仓库页面显示 |
| `CONTRIBUTING.md` | GitHub 在建立 PR 时自动连结 |
| `CHANGELOG.md` | Keep a Changelog 惯例 |
| `LICENSE` | GitHub 自动侦测授权类型 |
| `CODE_OF_CONDUCT.md` | GitHub 社群标准 |
| `SECURITY.md` | GitHub 安全性公告 |

### docs/ 目录档案

使用**小写短横线**以利 URL 友善性：

✅ **正确**：
```
docs/
├── index.md
├── getting-started.md
├── api-reference.md
└── user-guide.md
```

❌ **错误**：
```
docs/
├── INDEX.md           # 大小写不一致
├── GettingStarted.md  # PascalCase 不适合 URL
├── API_Reference.md   # snake_case 不一致
└── User Guide.md      # 空格会导致 URL 问题
```

---

## 文件范本

### README.md 范本

```markdown
# Project Name

简短的一行描述。

## 功能特色

- 功能 1
- 功能 2
- 功能 3

## 安装

```bash
npm install project-name
```

## 快速入门

```javascript
const lib = require('project-name');
lib.doSomething();
```

## 文件

完整文件请参阅 [docs/](docs/)。

## 贡献

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 授权

[License Name](LICENSE)
```

### CONTRIBUTING.md 范本

```markdown
# 贡献指南

## 开发环境设定

```bash
git clone https://github.com/org/repo
cd repo
npm install
```

## 工作流程

1. Fork 此仓库
2. 建立功能分支：`git checkout -b feature/my-feature`
3. 遵循[提交标准](commit-message-format-link)提交变更
4. 推送分支：`git push origin feature/my-feature`
5. 建立 pull request

## 编码标准

- 遵循专案风格指南
- 提交前执行 `npm run lint`
- 确保测试通过：`npm test`

## 程式码审查流程

所有提交在合并前都需要审查。
```

### CHANGELOG.md 范本

```markdown
# Changelog

所有重要变更都将记录在此档案中。

格式基于 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### Added
- 新功能

## [1.0.0] - YYYY-MM-DD

### Added
- 初始发布

[Unreleased]: https://github.com/org/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

---

## docs/ 结构

### index.md - 文件中心

```markdown
# Documentation Index

## Getting Started
- [Quick Start](getting-started.md)
- [Installation](installation.md)

## Guides
- [User Guide](user-guide.md)
- [Developer Guide](developer-guide.md)

## Reference
- [API Reference](api-reference.md)
- [Configuration](configuration.md)

## Operations
- [Deployment](deployment.md)
- [Troubleshooting](troubleshooting.md)
```

### getting-started.md 结构

1. 先决条件
2. 安装
3. 基本设定
4. 第一个范例
5. 下一步

### architecture.md 结构

1. 概述
2. 系统元件
3. 资料流
4. 设计决策
5. 技术堆叠
6. 安全架构

### api-reference.md 结构

1. API 概述
2. 验证
3. 端点（依资源分组）
4. 请求/回应范例
5. 错误代码
6. 速率限制

### deployment.md 结构

1. 先决条件
2. 环境设定
3. 设定
4. 部署步骤
5. 验证
6. 回滚程序
7. 监控

### troubleshooting.md 结构

```markdown
## Problem: [Error Name]

**症状**:
- 使用者看到的现象描述

**原因**:
- 发生此问题的原因

**解决方案**:
- 逐步修复步骤

**预防**:
- 未来如何避免
```

---

## 文件品质检查清单

### 完整性

- [ ] 列出先决条件
- [ ] 记录所有步骤
- [ ] 描述预期结果
- [ ] 涵盖错误情境

### 可读性

- [ ] 清晰、简洁的语言
- [ ] 简短段落（≤5 句）
- [ ] 包含程式码范例
- [ ] 适当使用截图/图表

### 准确性

- [ ] 测试过程式码范例
- [ ] 截图是最新的
- [ ] 版本号码正确
- [ ] 连结有效

### 可维护性

- [ ] 清晰的章节标题
- [ ] 逻辑性组织
- [ ] 易于更新
- [ ] 版本与软体一致

---

## 交叉引用指南

### 何时连结

| 情况 | 动作 |
|-----------|--------|
| 提及其他文件 | 新增连结 |
| 引用 API 端点 | 连结到 api-reference.md |
| 讨论架构 | 连结到 architecture.md |
| 新增文件 | 更新 index.md |

### 参考文献区段

每份文件都应该以此结尾：

```markdown
## References

- [Related Document](path/to/doc.md)
- [Architecture Overview](architecture.md)
- [API Reference](api-reference.md)
```

---

## 相关标准

- [Documentation Structure](../../../../../core/documentation-structure.md)
- [Documentation Writing Standards](../../../../../core/documentation-writing-standards.md)
- [README Template](./readme-template.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节 (目的、相关标准、版本历史、授权) |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
