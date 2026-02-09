---
source: ../../../../skills/changelog-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  根據 Keep a Changelog 格式產生和維護 CHANGELOG.md 條目。
  使用時機：更新變更日誌、版本發布、記錄變更。
  關鍵字：changelog, CHANGELOG.md, keep a changelog, 變更日誌, 版本紀錄。
---

# 變更日誌助手

> **語言**: [English](../../../../skills/changelog-guide/SKILL.md) | 繁體中文

根據 Keep a Changelog 格式產生和維護 CHANGELOG.md 條目。

## 工作流程

1. **分析 git log** - 使用 `git log` 讀取上次發布以來的提交歷史
2. **分類變更** - 將提交對應到變更日誌分類
3. **產生條目** - 為每個變更撰寫使用者友善的描述
4. **更新 CHANGELOG.md** - 將條目插入 [Unreleased] 或版本區段

## 變更分類

| 分類 | 使用時機 | When to Use | 對應提交類型 |
|------|---------|-------------|-------------|
| **Added** | 新功能 | New features | `feat` |
| **Changed** | 修改既有功能 | Modifications to existing features | `perf`, `BREAKING CHANGE` |
| **Deprecated** | 即將移除的功能 | Features to be removed | -- |
| **Removed** | 已移除的功能 | Removed features | `BREAKING CHANGE` |
| **Fixed** | 錯誤修復 | Bug fixes | `fix` |
| **Security** | 安全性修補 | Security patches | `security` |

## 條目格式

```markdown
## [Unreleased]
### Added
- Add user dashboard with customizable widgets (#123)
### Changed
- **BREAKING**: Change API response format from XML to JSON (#789)
### Fixed
- Fix memory leak when processing large files (#456)
```

### 撰寫指南

- 為**使用者**而非開發者撰寫 | Write for users, not developers
- 聚焦**影響**而非實作 | Focus on impact, not implementation
- 附上 issue/PR 編號 | Include issue/PR references
- 用 **BREAKING** 標記破壞性變更 | Mark breaking changes with BREAKING prefix

## 使用方式

- `/changelog` - 分析近期提交並產生變更日誌條目
- 也可透過 `/release changelog [version]` 使用

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[changelog-standards.md](../../../../core/changelog-standards.md)
