---
source: skills/claude-code/release-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-02
status: current
name: release-standards
description: |
  语意化版本控制和变更日志格式化的软体发布标准。
  使用时机：准备发布、更新版本号、撰写变更日志。
  关键字：version, release, changelog, semver, major, minor, patch, 版本, 发布, 变更日志。
---

# 发布标准

> **语言**: [English](../../../../../skills/claude-code/release-standards/SKILL.md) | 繁体中文

**版本**: 1.1.0
**最后更新**: 2026-01-02
**适用范围**: Claude Code Skills

---

## 目的

本技能提供语意化版本控制和变更日志格式化标准。

## 快速参考

### 语意化版本格式

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
| **MINOR** | 新功能（向后相容） | 2.3.5 → 2.4.0 |
| **PATCH** | 错误修复（向后相容） | 3.1.2 → 3.1.3 |

### 预发布识别符

| 识别符 | 稳定性 | 目标受众 |
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
- [语意化版本控制指南](./semantic-versioning.md)
- [变更日志格式](./changelog-format.md)
- [发布流程指南](./release-workflow.md) - 本专案完整发布流程

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

本技能支援专案特定配置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的「Disabled Skills」段落
   - 如果列出此技能，则该专案停用此技能
2. 检查 `CONTRIBUTING.md` 中的「Release Standards」段落
3. 如果未找到，**预设使用语意化版本控制和 Keep a Changelog 格式**

### 首次设定

如果未找到配置且上下文不明确：

1. 询问使用者：「此专案尚未配置发布标准。您想使用语意化版本控制吗？」
2. 使用者选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Release Standards

### Versioning
This project uses **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Changelog
This project follows **Keep a Changelog** format.
```

### 配置范例

在专案的 `CONTRIBUTING.md` 中：

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

- [版本控制](../../core/versioning.md)
- [变更日志标准](../../core/changelog-standards.md)
- [Git 工作流程](../../core/git-workflow.md)

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
