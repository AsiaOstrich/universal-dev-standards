---
source: skills/claude-code/release-standards/changelog-format.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 变更日志格式指南

> **语言**: [English](../../../../../skills/claude-code/release-standards/changelog-format.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供撰写和格式化变更日志档案的指南。

此标准遵循 [Keep a Changelog](https://keepachangelog.com/) 格式。

## 档案结构

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New features not yet released

## [1.2.0] - 2025-12-15

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

---

## 分类

| 分类 | 用途 | 何时使用 |
|----------|-------|-------------|
| **Added** | 新功能 | 为使用者提供的新功能 |
| **Changed** | 修改 | 现有功能的变更 |
| **Deprecated** | 即将移除 | 即将被移除的功能 |
| **Removed** | 已移除功能 | 在此版本中移除的功能 |
| **Fixed** | 错误修复 | 任何错误修复 |
| **Security** | 安全性修补 | 漏洞修复 |

---

## 版本标题格式

```markdown
## [VERSION] - YYYY-MM-DD
```

**范例**:
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [Unreleased]
```

---

## 条目格式

```markdown
- [Action verb] [what changed] ([reference])
```

**范例**:
```markdown
### Added
- Add user dashboard with customizable widgets (#123)
- Add support for PostgreSQL 15 (PR #456)

### Changed
- **BREAKING**: Change API response format from XML to JSON (#789)
- Update minimum Node.js version to 18.0 (#101)

### Fixed
- Fix memory leak when processing large files (#112)
- Fix incorrect date formatting in reports (#134)
```

---

## 破坏性变更

使用 **BREAKING** 前缀清楚标记破坏性变更:

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

---

## 安全性公告

如果可用，请包含严重程度和 CVE:

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## 提交讯息与变更日志对应

| 提交类型 | 变更日志分类 | 备注 |
|-------------|-------------------|-------|
| `feat` | **Added** | 新功能 |
| `fix` | **Fixed** | 错误修复 |
| `perf` | **Changed** | 效能改善 |
| `refactor` | *(通常省略)* | 内部变更 |
| `docs` | *(通常省略)* | 仅文件 |
| `test` | *(通常省略)* | 仅测试 |
| `chore` | *(通常省略)* | 维护 |
| `BREAKING CHANGE` | **Changed** 或 **Removed** | 使用 **BREAKING** 前缀 |
| `security` | **Security** | 安全性修补 |
| `deprecate` | **Deprecated** | 弃用通知 |

---

## 排除规则

以下项目**不应**记录在变更日志中:

| 分类 | 范例 | 原因 |
|----------|----------|--------|
| 建置输出 | `dist/`, `build/`, `bin/` | 产生的档案 |
| 相依套件 | `node_modules/`, lock files | 自动管理 |
| 本地设定 | `.env`, `*.local.json` | 环境特定 |
| IDE 设定 | `.vscode/`, `.idea/` | 开发者偏好 |
| 内部重构 | 程式码风格、变数名称 | 无使用者影响 |

---

## 撰写技巧

### 为使用者撰写，而非开发者

| 良好范例 | 不良范例 |
|------|-----|
| Add dark mode theme option | Implement ThemeProvider with context |
| Fix login timeout on slow networks | Fix race condition in AuthService |
| Improve page load speed by 40% | Optimize SQL queries with indexes |

---

## 多语言支援

### 双语条目

```markdown
## [1.2.0] - 2025-12-15

### Added | 新增
- Add dark mode support
  新增深色模式支援
- Add CSV export feature
  新增 CSV 汇出功能

### Fixed | 修复
- Fix login timeout issue
  修复登入逾时问题
```

---

## 自动化

### conventional-changelog

```bash
# Install
npm install -g conventional-changelog-cli

# Generate (append to existing)
conventional-changelog -p angular -i CHANGELOG.md -s
```

### semantic-release

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git"
  ]
}
```

---

## 相关标准

- [Changelog Standards](../../../../../core/changelog-standards.md)
- [Semantic Versioning Guide](./semantic-versioning.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增: 标准章节 (目的、相关标准、版本历史、授权条款) |

---

## 授权条款

本文件依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
