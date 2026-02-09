---
source: ../../../../skills/commit-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  根据 Conventional Commits 规范产生格式正确的 commit message。
  使用时机：提交代码、撰写 commit message、检查提交格式。
  关键字：commit, conventional commits, 提交, 消息, feat, fix, refactor。
---

# Commit Message 助手

> **语言**: [English](../../../../skills/commit-standards/SKILL.md) | 简体中文

根据 staged 的变更，产生符合 Conventional Commits 格式的 commit message。

## 工作流程

1. **检查状态** - 执行 `git status` 和 `git diff --staged` 了解变更内容
2. **分析变更** - 判断类型（feat、fix、refactor 等）和范围
3. **产生消息** - 根据以下格式建立 commit message
4. **确认并提交** - 在执行 `git commit` 前询问用户确认

### 消息格式

```
<type>(<scope>): <subject>
<body>
<footer>
```

## 提交类型

| 类型 | 使用时机 | When to Use |
|------|---------|-------------|
| `feat` | 新功能 | New feature |
| `fix` | 修复错误 | Bug fix |
| `refactor` | 重构（无功能变更） | Code refactoring |
| `docs` | 文档更新 | Documentation |
| `style` | 格式调整（无逻辑变更） | Formatting |
| `test` | 测试相关 | Tests |
| `perf` | 性能优化 | Performance |
| `chore` | 维护任务 | Maintenance |

## 规则

- **Subject**：祈使语气、不加句号、首字母大写、不超过 72 字符
- **Body**：说明**为什么**进行变更，而非仅描述变更了什么
- **Footer**：使用 `BREAKING CHANGE:` 标记破坏性变更，使用 `Fixes #123` 关联 issue

## 使用方式

- `/commit` - 自动分析 staged 的变更并建议 commit message
- `/commit fix login bug` - 根据提供的描述产生消息

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[commit-message-guide.md](../../../../core/commit-message-guide.md)
