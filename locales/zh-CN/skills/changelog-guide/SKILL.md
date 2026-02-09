---
source: ../../../../skills/changelog-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  根据 Keep a Changelog 格式产生和维护 CHANGELOG.md 条目。
  使用时机：更新变更日志、版本发布、记录变更。
  关键字：changelog, CHANGELOG.md, keep a changelog, 变更日志, 版本记录。
---

# 变更日志助手

> **语言**: [English](../../../../skills/changelog-guide/SKILL.md) | 简体中文

根据 Keep a Changelog 格式产生和维护 CHANGELOG.md 条目。

## 工作流程

1. **分析 git log** - 使用 `git log` 读取上次发布以来的提交历史
2. **分类变更** - 将提交对应到变更日志分类
3. **产生条目** - 为每个变更撰写用户友好的描述
4. **更新 CHANGELOG.md** - 将条目插入 [Unreleased] 或版本区段

## 变更分类

| 分类 | 使用时机 | When to Use | 对应提交类型 |
|------|---------|-------------|-------------|
| **Added** | 新功能 | New features | `feat` |
| **Changed** | 修改既有功能 | Modifications to existing features | `perf`, `BREAKING CHANGE` |
| **Deprecated** | 即将移除的功能 | Features to be removed | -- |
| **Removed** | 已移除的功能 | Removed features | `BREAKING CHANGE` |
| **Fixed** | 错误修复 | Bug fixes | `fix` |
| **Security** | 安全性修补 | Security patches | `security` |

## 条目格式

```markdown
## [Unreleased]
### Added
- Add user dashboard with customizable widgets (#123)
### Changed
- **BREAKING**: Change API response format from XML to JSON (#789)
### Fixed
- Fix memory leak when processing large files (#456)
```

### 撰写指南

- 为**用户**而非开发者撰写 | Write for users, not developers
- 聚焦**影响**而非实现 | Focus on impact, not implementation
- 附上 issue/PR 编号 | Include issue/PR references
- 用 **BREAKING** 标记破坏性变更 | Mark breaking changes with BREAKING prefix

## 使用方式

- `/changelog` - 分析近期提交并产生变更日志条目
- 也可通过 `/release changelog [version]` 使用

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[changelog-standards.md](../../../../core/changelog-standards.md)
