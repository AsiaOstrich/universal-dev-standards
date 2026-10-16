---
source: ../../../../skills/release-standards/guide.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-16
source_hash: d03e1fe37053
status: current
description: |
  語意化版本控制和变更日誌格式化的软体發布标准。
  使用时机：准备發布、更新版本号、撰写变更日誌。
  关鍵字：version, release, changelog, semver, major, minor, patch, 版本, 發布, 变更日誌。
---

# 发布标准

> **语言**: [English](../../../../skills/release-standards/guide.md) | [繁體中文](../../../zh-TW/skills/release-standards/guide.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-01-02
**适用范围**: Claude Code Skills

---

> **核心标准**: 本技能实现 [版本控制](../../core/versioning.md)。有关完整的方法论文档，请参阅核心标准。

## 目的

本技能提供语义化版本控制和变更日志格式化标准。

## 快速参考

### 语义化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### 版本递增规则

| 组成部分 | 何时递增 | 范例 |
|-----------|-------------------|----------|
| **MAJOR** | 重大变更 | 1.9.5 → 2.0.0 |
| **MINOR** | 新功能（向后兼容） | 2.3.5 → 2.4.0 |
| **PATCH** | 错误修复（向后兼容） | 3.1.2 → 3.1.3 |

### 预发布标识符

| 标识符 | 稳定性 | 目标受众 |
|------------|-----------|----------|
| `alpha` | 不稳定 | 内部团队 |
| `beta` | 大致稳定 | 早期采用者 |
| `rc` | 稳定 | Beta 测试者 |

### CHANGELOG 分类

| 分类 | 用途 |
|----------|-------|
| **Added** | 新功能 |
| **Changed** | 现有功能的变更 |
| **Deprecated** | 即将移除的功能 |
| **Removed** | 已移除的功能 |
| **Fixed** | 错误修复 |
| **Security** | 安全性漏洞修复 |

## 详细指南

完整标准请参阅：
- [语义化版本控制指南](./semantic-versioning.md)
- [变更日志格式](./changelog-format.md)
- [发布流程指南](./release-workflow.md) - 本项目完整发布流程

### AI 优化格式（Token 高效）

对于 AI 助手，使用 YAML 格式文件可减少 Token 消耗：
- 变更日志：`ai/standards/changelog.ai.yaml`

## CHANGELOG 条目格式

```markdown
## [VERSION] - YYYY-MM-DD

### Added
- Add user dashboard with customizable widgets (#123)

### Changed
- **BREAKING**: Change API response format from XML to JSON

### Fixed
- Fix memory leak when processing large files (#456)

### Security
- Fix SQL injection vulnerability (CVE-2025-12345)
```

## 重大变更

使用 **BREAKING** 前缀标记重大变更：

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()`, use `getUser()` instead
```

## Git 标签

```bash
# Create annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push tag to remote
git push origin v1.2.0
```

## 版本排序

```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## 配置检测

本技能支持项目特定配置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的“Disabled Skills”段落
   - 如果列出此技能，则该项目停用此技能
2. 检查 `CONTRIBUTING.md` 中的“Release Standards”段落
3. 如果未找到，**默认使用语义化版本控制和 Keep a Changelog 格式**

### 首次设置

如果未找到配置且上下文不明确：

1. 询问用户：“此项目尚未配置发布标准。您想使用语义化版本控制吗？”
2. 用户选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Release Standards

### Versioning
This project uses **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Changelog
This project follows **Keep a Changelog** format.
```

### 配置示例

在项目的 `CONTRIBUTING.md` 中：

```markdown
## Release Standards

### Versioning
This project uses **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Changelog
This project follows **Keep a Changelog** format.

### Release Process
1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag with `v` prefix (e.g., v1.2.0)
4. Push tag to trigger release workflow
```

---

## 相关标准

- [版本控制](../../core/versioning.md) - 核心语义化版本控制标准
- [变更日志标准](../../core/changelog-standards.md) - Keep a Changelog 格式
- [Git 工作流程](../../core/git-workflow.md) - Git 标签与发布分支

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.1.0 | 2026-01-02 | 新增：发布流程指南，包含完整发布流程 |
| 1.0.0 | 2025-12-24 | 新增：标准段落（目的、相关标准、版本历史、授权条款） |

---

## 授权条款

本技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
