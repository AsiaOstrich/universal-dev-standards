---
source: skills/release-standards/changelog-format.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 變更日誌格式指南

> **語言**: [English](../../../../skills/release-standards/changelog-format.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供撰寫和格式化變更日誌檔案的指南。

此標準遵循 [Keep a Changelog](https://keepachangelog.com/) 格式。

## 檔案結構

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New features not yet released

## [1.2.0] - 2025-12-15

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

---

## 分類

| 分類 | 用途 | 何時使用 |
|----------|-------|-------------|
| **Added** | 新功能 | 為使用者提供的新功能 |
| **Changed** | 修改 | 現有功能的變更 |
| **Deprecated** | 即將移除 | 即將被移除的功能 |
| **Removed** | 已移除功能 | 在此版本中移除的功能 |
| **Fixed** | 錯誤修復 | 任何錯誤修復 |
| **Security** | 安全性修補 | 漏洞修復 |

---

## 版本標題格式

```markdown
## [VERSION] - YYYY-MM-DD
```

**範例**:
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [Unreleased]
```

---

## 條目格式

```markdown
- [Action verb] [what changed] ([reference])
```

**範例**:
```markdown
### Added
- Add user dashboard with customizable widgets (#123)
- Add support for PostgreSQL 15 (PR #456)

### Changed
- **BREAKING**: Change API response format from XML to JSON (#789)
- Update minimum Node.js version to 18.0 (#101)

### Fixed
- Fix memory leak when processing large files (#112)
- Fix incorrect date formatting in reports (#134)
```

---

## 破壞性變更

使用 **BREAKING** 前綴清楚標記破壞性變更:

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

---

## 安全性公告

如果可用，請包含嚴重程度和 CVE:

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## 提交訊息與變更日誌對應

| 提交類型 | 變更日誌分類 | 備註 |
|-------------|-------------------|-------|
| `feat` | **Added** | 新功能 |
| `fix` | **Fixed** | 錯誤修復 |
| `perf` | **Changed** | 效能改善 |
| `refactor` | *(通常省略)* | 內部變更 |
| `docs` | *(通常省略)* | 僅文件 |
| `test` | *(通常省略)* | 僅測試 |
| `chore` | *(通常省略)* | 維護 |
| `BREAKING CHANGE` | **Changed** 或 **Removed** | 使用 **BREAKING** 前綴 |
| `security` | **Security** | 安全性修補 |
| `deprecate` | **Deprecated** | 棄用通知 |

---

## 排除規則

以下項目**不應**記錄在變更日誌中:

| 分類 | 範例 | 原因 |
|----------|----------|--------|
| 建置輸出 | `dist/`, `build/`, `bin/` | 產生的檔案 |
| 相依套件 | `node_modules/`, lock files | 自動管理 |
| 本地設定 | `.env`, `*.local.json` | 環境特定 |
| IDE 設定 | `.vscode/`, `.idea/` | 開發者偏好 |
| 內部重構 | 程式碼風格、變數名稱 | 無使用者影響 |

---

## 撰寫技巧

### 為使用者撰寫，而非開發者

| 良好範例 | 不良範例 |
|------|-----|
| Add dark mode theme option | Implement ThemeProvider with context |
| Fix login timeout on slow networks | Fix race condition in AuthService |
| Improve page load speed by 40% | Optimize SQL queries with indexes |

---

## 多語言支援

### 雙語條目

```markdown
## [1.2.0] - 2025-12-15

### Added | 新增
- Add dark mode support
  新增深色模式支援
- Add CSV export feature
  新增 CSV 匯出功能

### Fixed | 修復
- Fix login timeout issue
  修復登入逾時問題
```

---

## 自動化

### conventional-changelog

```bash
# Install
npm install -g conventional-changelog-cli

# Generate (append to existing)
conventional-changelog -p angular -i CHANGELOG.md -s
```

### semantic-release

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git"
  ]
}
```

---

## 相關標準

- [Changelog Standards](../../../../core/changelog-standards.md)
- [Semantic Versioning Guide](./semantic-versioning.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增: 標準章節 (目的、相關標準、版本歷史、授權條款) |

---

## 授權條款

本文件依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
