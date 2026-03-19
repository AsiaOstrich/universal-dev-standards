---
source: ../../../../skills/commands/changelog.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: changelog
description: "[UDS] Generate and maintain CHANGELOG.md entries"
---

# 变更日志助手

根据 Keep a Changelog 格式生成和维护 CHANGELOG.md 条目。

## 用法

```bash
/changelog
```

## 工作流程

1. **分析 git 日志** - 使用 `git log` 读取上次发布以来的提交历史
2. **分类变更** - 将提交映射到变更日志分类
3. **生成条目** - 为每个变更撰写面向用户的描述
4. **更新 CHANGELOG.md** - 将条目插入 [Unreleased] 或版本化区段

## 变更分类

| 分类 | 使用时机 | Commit 类型 |
|------|----------|-------------|
| **Added** | 新功能 | `feat` |
| **Changed** | 修改既有功能 | `perf`, `BREAKING CHANGE` |
| **Deprecated** | 即将移除的功能 | -- |
| **Removed** | 已移除的功能 | `BREAKING CHANGE` |
| **Fixed** | 错误修复 | `fix` |
| **Security** | 安全性修补 | `security` |

## 条目格式

```markdown
## [Unreleased]

### Added
- Add user dashboard with customizable widgets (#123)

### Fixed
- Fix memory leak when processing large files (#456)
```

### 撰写指南

- 为**用户**而非开发者撰写
- 聚焦**影响**而非实现
- 附上 issue/PR 编号
- 用 **BREAKING** 标记破坏性变更

## 参考

*   [Changelog Guide Skill](../changelog-guide/SKILL.md)
*   [Core Standard](../../core/changelog-standards.md)
