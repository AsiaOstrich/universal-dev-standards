---
source: skills/documentation-guide/documentation-structure.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 文件结构參考

> **语言**: [English](../../../../skills/documentation-guide/documentation-structure.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供项目文件结构和文件組織的參考指南。

---

## 标准项目结构

```
project-root/
├── README.md                    # 项目概述（必需）
├── CONTRIBUTING.md              # 貢獻指南
├── CHANGELOG.md                 # 版本历史
├── LICENSE                      # 授权文件
├── docs/                        # 详细文件
│   ├── index.md                 # 文件索引
│   ├── getting-started.md       # 快速入門指南
│   ├── architecture.md          # 系统架構
│   ├── api-reference.md         # API 文件
│   ├── deployment.md            # 部署指南
│   └── troubleshooting.md       # 常見問題
└── examples/                    # 程序码範例
    ├── basic-usage/
    └── README.md
```

---

## 不同项目类型的文件需求

| 文件 | 新项目 | 重構 | 迁移 | 維護 |
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

## 文件命名慣例

### 根目录文件

使用**大写**以便 GitHub/GitLab 自动識别：

| 文件 | 原因 |
|------|------|
| `README.md` | GitHub 自动在倉庫页面顯示 |
| `CONTRIBUTING.md` | GitHub 在建立 PR 时自动連結 |
| `CHANGELOG.md` | Keep a Changelog 慣例 |
| `LICENSE` | GitHub 自动偵测授权类型 |
| `CODE_OF_CONDUCT.md` | GitHub 社群标准 |
| `SECURITY.md` | GitHub 安全性公告 |

### docs/ 目录文件

使用**小写短橫线**以利 URL 友善性：

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
├── GettingStarted.md  # PascalCase 不適合 URL
├── API_Reference.md   # snake_case 不一致
└── User Guide.md      # 空格会導致 URL 問題
```

---

## 文件範本

### README.md 範本

```markdown
# Project Name

簡短的一行描述。

## 功能特色

- 功能 1
- 功能 2
- 功能 3

## 安裝

```bash
npm install project-name
```

## 快速入門

```javascript
const lib = require('project-name');
lib.doSomething();
```

## 文件

完整文件請參阅 [docs/](docs/)。

## 貢獻

請參阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 授权

[License Name](LICENSE)
```

### CONTRIBUTING.md 範本

```markdown
# 貢獻指南

## 开发環境设置

```bash
git clone https://github.com/org/repo
cd repo
npm install
```

## 工作流程

1. Fork 此倉庫
2. 建立功能分支：`git checkout -b feature/my-feature`
3. 遵循[提交标准](commit-message-format-link)提交变更
4. 推送分支：`git push origin feature/my-feature`
5. 建立 pull request

## 编码标准

- 遵循项目風格指南
- 提交前执行 `npm run lint`
- 确保测试通過：`npm test`

## 程序码审查流程

所有提交在合併前都需要审查。
```

### CHANGELOG.md 範本

```markdown
# Changelog

所有重要变更都將记录在此文件中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### Added
- 新功能

## [1.0.0] - YYYY-MM-DD

### Added
- 初始發布

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
2. 安裝
3. 基本设置
4. 第一个範例
5. 下一步

### architecture.md 结构

1. 概述
2. 系统元件
3. 数据流
4. 设计决策
5. 技術堆疊
6. 安全架構

### api-reference.md 结构

1. API 概述
2. 验证
3. 端点（依資源分組）
4. 请求/响应範例
5. 错误代码
6. 速率限制

### deployment.md 结构

1. 先决条件
2. 環境设置
3. 设置
4. 部署步骤
5. 验证
6. 回滾程序
7. 監控

### troubleshooting.md 结构

```markdown
## Problem: [Error Name]

**症状**:
- 使用者看到的現象描述

**原因**:
- 發生此問題的原因

**解决方案**:
- 逐步修復步骤

**预防**:
- 未來如何避免
```

---

## 文件品质检查清单

### 完整性

- [ ] 列出先决条件
- [ ] 记录所有步骤
- [ ] 描述预期結果
- [ ] 涵蓋错误情境

### 可读性

- [ ] 清晰、簡潔的语言
- [ ] 簡短段落（≤5 句）
- [ ] 包含程序码範例
- [ ] 適當使用截图/图表

### 准确性

- [ ] 测试過程序码範例
- [ ] 截图是最新的
- [ ] 版本号码正确
- [ ] 連結有效

### 可維護性

- [ ] 清晰的章节標題
- [ ] 邏辑性組織
- [ ] 易於更新
- [ ] 版本与软体一致

---

## 交叉引用指南

### 何时連結

| 情况 | 动作 |
|-----------|--------|
| 提及其他文件 | 新增連結 |
| 引用 API 端点 | 連結到 api-reference.md |
| 討論架構 | 連結到 architecture.md |
| 新增文件 | 更新 index.md |

### 參考文獻區段

每份文件都应該以此結尾：

```markdown
## References

- [Related Document](path/to/doc.md)
- [Architecture Overview](architecture.md)
- [API Reference](api-reference.md)
```

---

## 相关标准

- [Documentation Structure](../../../../core/documentation-structure.md)
- [Documentation Writing Standards](../../../../core/documentation-writing-standards.md)
- [README Template](./readme-template.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节 (目的、相关标准、版本历史、授权) |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
