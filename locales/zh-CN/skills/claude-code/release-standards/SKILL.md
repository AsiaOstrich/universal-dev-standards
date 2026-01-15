---
source: skills/claude-code/release-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-02
status: current
name: release-standards
description: |
  語意化版本控制和变更日誌格式化的软体發布标准。
  使用时机：准备發布、更新版本号、撰写变更日誌。
  关鍵字：version, release, changelog, semver, major, minor, patch, 版本, 發布, 变更日誌。
---

# 發布标准

> **语言**: [English](../../../../../skills/claude-code/release-standards/SKILL.md) | 简体中文

**版本**: 1.1.0
**最後更新**: 2026-01-02
**適用範圍**: Claude Code Skills

---

## 目的

本技能提供語意化版本控制和变更日誌格式化标准。

## 快速參考

### 語意化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### 版本递增規則

| 組成部分 | 何时递增 | 範例 |
|-----------|-------------------|----------|
| **MAJOR** | 重大变更 | 1.9.5 → 2.0.0 |
| **MINOR** | 新功能（向後相容） | 2.3.5 → 2.4.0 |
| **PATCH** | 错误修復（向後相容） | 3.1.2 → 3.1.3 |

### 预發布識别符

| 識别符 | 穩定性 | 目標受眾 |
|------------|-----------|----------|
| `alpha` | 不穩定 | 內部团队 |
| `beta` | 大致穩定 | 早期採用者 |
| `rc` | 穩定 | Beta 测试者 |

### CHANGELOG 分类

| 分类 | 用途 |
|----------|-------|
| **Added** | 新功能 |
| **Changed** | 現有功能的变更 |
| **Deprecated** | 即將移除的功能 |
| **Removed** | 已移除的功能 |
| **Fixed** | 错误修復 |
| **Security** | 安全性漏洞修復 |

## 详细指南

完整标准請參阅：
- [語意化版本控制指南](./semantic-versioning.md)
- [变更日誌格式](./changelog-format.md)
- [發布流程指南](./release-workflow.md) - 本项目完整發布流程

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

使用 **BREAKING** 前綴標记重大变更：

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

## 配置檢测

本技能支援项目特定配置。

### 檢测順序

1. 检查 `CONTRIBUTING.md` 中的「Disabled Skills」段落
   - 如果列出此技能，則該项目停用此技能
2. 检查 `CONTRIBUTING.md` 中的「Release Standards」段落
3. 如果未找到，**预设使用語意化版本控制和 Keep a Changelog 格式**

### 首次设置

如果未找到配置且上下文不明确：

1. 詢問使用者：「此项目尚未配置發布标准。您想使用語意化版本控制嗎？」
2. 使用者选择後，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Release Standards

### Versioning
This project uses **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Changelog
This project follows **Keep a Changelog** format.
```

### 配置範例

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

- [版本控制](../../core/versioning.md)
- [变更日誌标准](../../core/changelog-standards.md)
- [Git 工作流程](../../core/git-workflow.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.1.0 | 2026-01-02 | 新增：發布流程指南，包含完整發布流程 |
| 1.0.0 | 2025-12-24 | 新增：标准段落（目的、相关标准、版本历史、授权条款） |

---

## 授权条款

本技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
