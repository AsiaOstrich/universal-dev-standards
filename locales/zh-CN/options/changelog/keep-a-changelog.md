---
source: options/changelog/keep-a-changelog.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Keep a Changelog

> **语言**: [English](../../../../options/changelog/keep-a-changelog.md) | 简体中文

**上层标准**: [Changelog Standards](../../core/changelog-standards.md)

---

## 概览

Keep a Changelog 是维护人类可读变更日志的标准格式。它强调清晰与一致性，让用户与开发者能轻松理解各版本之间有哪些变更。

## 最适用于

- 开源项目
- 需要人类可读变更日志的项目
- 遵循 Semantic Versioning 的项目
- 手动发布管理
- 重视精心撰写之发布说明的项目

## 格式结构

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security vulnerability fixes
```

## 变更类型

| 类型 | 顺序 | 描述 |
|------|-------|-------------|
| **Added** | 1 | 新增功能 |
| **Changed** | 2 | 既有功能的变更 |
| **Deprecated** | 3 | 即将移除的功能 |
| **Removed** | 4 | 已移除的功能 |
| **Fixed** | 5 | 错误修复 |
| **Security** | 6 | 安全漏洞修复 |

## 核心原则

1. **变更日志是写给人看的** - 不是机器产生的 commit 转储
2. **每个版本都有区段** - 即使没有变更
3. **按类型分组** - 使用标准变更类型
4. **日期采用 ISO 格式** - 使用 YYYY-MM-DD
5. **最新在前** - 反向时间顺序排列
6. **Unreleased 区段** - 追踪进行中的变更

## 示例条目

```markdown
## [1.2.0] - 2025-01-15

### Added
- User authentication with OAuth2 support (#123)
- Dark mode theme option (#145)

### Changed
- Updated API response format for consistency

### Fixed
- Login timeout issue on slow networks (#156)

### Security
- Updated dependencies to patch CVE-2025-1234

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| 使用 [Unreleased] | 开发期间新增条目 | Required |
| 发布时移动 | 将条目移至带日期的版本区段 | Required |
| 反向时间顺序 | 最新版本置于顶部 | Required |
| 链接版本 | 在文件底部加入 diff 链接 | Recommended |
| ISO 日期 | 使用 YYYY-MM-DD 格式 | Required |

## 与自动生成方式的比较

| 方面 | Keep a Changelog | 自动生成 |
|--------|-----------------|----------------|
| 投入精力 | 高（手动撰写） | 低（自动化） |
| 一致性 | 不一（人工撰写） | 高（基于模板） |
| 细节层级 | 功能层级（精心整理） | commit 层级 |
| 前置条件 | 无 | Conventional Commits |
| 最适用于 | 里程碑发布 | 频繁发布 |

## 相关选项

- [Auto-Generated Changelog](./auto-generated.md) - 用于自动化变更日志生成

---

## 参考资料

- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/)

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
