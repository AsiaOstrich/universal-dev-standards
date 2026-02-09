---
source: ../../../../skills/release-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-02-10
status: current
description: |
  引导遵循语义化版本和变更日志最佳实践的发布流程。
  使用时机：版本发布、版本管理、变更日志更新。
  关键字：release, version, semver, changelog, 发布, 版本, 语义化。
---

# 发布助手

> **语言**: [English](../../../../skills/release-standards/SKILL.md) | 简体中文

引导遵循语义化版本和变更日志最佳实践的发布流程。

## 子命令

| 子命令 | 说明 | Description |
|--------|------|-------------|
| `start` | 开始发布流程 | Start a release branch/process |
| `finish` | 完成发布（标签、合并） | Finalize release (tag, merge) |
| `changelog` | 产生或更新变更日志 | Generate or update CHANGELOG.md |
| `check` | 执行发布前检查 | Run pre-release verification |

## 版本类型

| 类型 | 格式 | npm Tag | 用途 |
|------|------|---------|------|
| 正式版 | `X.Y.Z` | `@latest` | Stable |
| 公开测试 | `X.Y.Z-beta.N` | `@beta` | Beta |
| 内部测试 | `X.Y.Z-alpha.N` | `@alpha` | Alpha |
| 候选版本 | `X.Y.Z-rc.N` | `@rc` | RC |

## 工作流程

1. **决定版本** - 根据变更决定版本类型（MAJOR/MINOR/PATCH）
2. **更新版本文件** - 更新 package.json 和相关版本引用
3. **更新 CHANGELOG** - 将 [Unreleased] 条目移至新版本区段
4. **执行发布前检查** - 验证测试、lint 和标准合规
5. **建立 git tag** - 使用 `vX.Y.Z` 格式标签
6. **提交并推送** - 提交版本更新并推送标签

### 版本递增规则

| 变更类型 | 递增 | 范例 |
|---------|------|------|
| 破坏性变更 | MAJOR | 1.9.5 → 2.0.0 |
| 新功能（向下兼容） | MINOR | 2.3.5 → 2.4.0 |
| 错误修复（向下兼容） | PATCH | 3.1.2 → 3.1.3 |

## 使用方式

- `/release start 1.2.0` - 开始 v1.2.0 的发布流程
- `/release changelog 1.2.0` - 更新 v1.2.0 的 CHANGELOG
- `/release finish 1.2.0` - 完成并标签 v1.2.0
- `/release check` - 执行发布前验证

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[versioning.md](../../../../core/versioning.md)
