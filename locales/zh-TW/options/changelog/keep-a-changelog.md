---
source: options/changelog/keep-a-changelog.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Keep a Changelog

> **語言**: [English](../../../../options/changelog/keep-a-changelog.md) | 繁體中文

**上層標準**: [Changelog Standards](../../core/changelog-standards.md)

---

## 概觀

Keep a Changelog 是維護人類可讀變更日誌的標準格式。它強調清晰與一致性，讓使用者與開發者能輕鬆理解各版本之間有哪些變更。

## 最適用於

- 開源專案
- 需要人類可讀變更日誌的專案
- 遵循 Semantic Versioning 的專案
- 手動發行管理
- 重視精心撰寫之發行說明的專案

## 格式結構

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

## 變更類型

| 類型 | 順序 | 描述 |
|------|-------|-------------|
| **Added** | 1 | 新增功能 |
| **Changed** | 2 | 既有功能的變更 |
| **Deprecated** | 3 | 即將移除的功能 |
| **Removed** | 4 | 已移除的功能 |
| **Fixed** | 5 | 錯誤修正 |
| **Security** | 6 | 安全漏洞修正 |

## 核心原則

1. **變更日誌是寫給人看的** - 不是機器產生的 commit 傾印
2. **每個版本都有區段** - 即使沒有變更
3. **依類型分組** - 使用標準變更類型
4. **日期採 ISO 格式** - 使用 YYYY-MM-DD
5. **最新在前** - 反向時間順序排列
6. **Unreleased 區段** - 追蹤進行中的變更

## 範例條目

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

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| 使用 [Unreleased] | 開發期間新增條目 | Required |
| 發行時移動 | 將條目移至帶日期的版本區段 | Required |
| 反向時間順序 | 最新版本置於頂部 | Required |
| 連結版本 | 在檔案底部加入 diff 連結 | Recommended |
| ISO 日期 | 使用 YYYY-MM-DD 格式 | Required |

## 與自動產生方式的比較

| 面向 | Keep a Changelog | 自動產生 |
|--------|-----------------|----------------|
| 投入心力 | 高（手動撰寫） | 低（自動化） |
| 一致性 | 不一（人工撰寫） | 高（基於範本） |
| 細節層級 | 功能層級（精心整理） | commit 層級 |
| 前置條件 | 無 | Conventional Commits |
| 最適用於 | 里程碑發行 | 頻繁發行 |

## 相關選項

- [Auto-Generated Changelog](./auto-generated.md) - 用於自動化變更日誌產生

---

## 參考資料

- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
