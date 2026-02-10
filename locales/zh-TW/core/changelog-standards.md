---
source: ../../../core/changelog-standards.md
source_version: 1.0.2
translation_version: 1.0.2
last_synced: 2025-12-30
status: current
---

> **Language**: [English](../../../core/changelog-standards.md) | 繁體中文

# 變更日誌標準

**版本**: 1.0.2
**最後更新**: 2025-12-24
**適用範圍**: 所有有版本發布的軟體專案

---

## 目的

本標準定義如何撰寫和維護 CHANGELOG.md 檔案，以清楚地向使用者、維護者以及引用此儲存庫的專案傳達變更內容。

**主要效益**:
- 使用者可快速了解版本間的變更
- 相依專案可評估升級影響
- 團隊可系統性追蹤發布歷史

**與其他標準的關係**:
- 補充 [versioning.md](versioning.md) 所定義的版本編號
- 整合 [git-workflow.md](git-workflow.md) 的發布流程
- 對應 [commit-message-guide.md](commit-message-guide.md) 的提交類型

---

## 核心原則

| 原則 | 說明 |
|------|------|
| **以使用者為中心** | 為使用者撰寫，而非開發者 |
| **一致性** | 使用標準分類和格式 |
| **完整性** | 記錄所有值得注意的變更 |
| **及時性** | 在每次發布前更新 |
| **可追溯性** | 連結到議題、PR 或提交 |

---

## 格式規範

本標準遵循 [Keep a Changelog](https://keepachangelog.com/) 格式。

### 檔案結構

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

## [1.1.0] - 2025-11-01

...

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/releases/tag/v1.1.0
```

### 變更分類

| 分類 | 使用時機 |
|------|----------|
| **Added** | 新功能 |
| **Changed** | 現有功能的變更 |
| **Deprecated** | 即將移除的功能 |
| **Removed** | 已移除的功能 |
| **Fixed** | 錯誤修復 |
| **Security** | 安全性修補 |

### 版本標題格式

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

## 撰寫指南

### 為使用者撰寫

聚焦於**變更內容**和**對使用者的影響**，而非實作細節。

| ✅ 好的做法 | ❌ 不好的做法 | 原因 |
|------------|--------------|------|
| 新增深色模式主題選項 | 實作 ThemeProvider context | 使用者可感知的效益 |
| 修復慢速網路的登入逾時問題 | 修復 AuthService 的競態條件 | 影響描述 |
| 支援報表的 CSV 匯出 | 新增 CSVExporter 類別 | 功能描述 |
| 頁面載入速度提升 40% | 使用索引最佳化 SQL 查詢 | 可量化的結果 |

### 條目格式

每個條目應遵循此模式：

```markdown
- [動作動詞] [變更內容] ([參考編號])
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

### 破壞性變更

使用 **BREAKING** 前綴清楚標註破壞性變更：

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

### 安全公告

對於安全修復，包含嚴重程度和 CVE（如有）：

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## 提交到變更日誌對應

將 Conventional Commits 類型對應到 CHANGELOG 分類：

| Commit 類型 | CHANGELOG 分類 | 備註 |
|-------------|----------------|------|
| `feat` | **Added** | 新功能 |
| `fix` | **Fixed** | 錯誤修復 |
| `perf` | **Changed** | 效能改進 |
| `refactor` | *(通常省略)* | 內部變更，無使用者影響 |
| `docs` | *(通常省略)* | 僅文件變更 |
| `style` | *(通常省略)* | 僅程式碼風格 |
| `test` | *(通常省略)* | 僅測試 |
| `chore` | *(通常省略)* | 維護工作 |
| `BREAKING CHANGE` | **Changed** 或 **Removed** | 加上 **BREAKING** 前綴 |
| `security` | **Security** | 安全修補 |
| `deprecate` | **Deprecated** | 棄用通知 |

**注意**：不是所有提交都需要 CHANGELOG 條目。聚焦於使用者可感知的變更。

---

## Git 工作流程整合

### 何時更新

| 工作流程 | 更新時機 | 分支 |
|----------|----------|------|
| **GitFlow** | 準備發布時 | `release/*` |
| **GitHub Flow** | 合併前 | Feature branch |
| **Trunk-Based** | 標記版本前 | `main` |

### GitFlow 發布流程

```bash
# 1. 建立 release 分支
git checkout -b release/v1.2.0 develop

# 2. 更新 CHANGELOG.md
# - 將 [Unreleased] 項目移至新版本區段
# - 新增發布日期
# - 更新比較連結

# 3. 提交變更
git add CHANGELOG.md
git commit -m "docs(changelog): update for v1.2.0"

# 4. 繼續發布流程
# 完整細節請參閱 git-workflow.md
```

### 未發布區段管理

開發期間，將條目加入 `[Unreleased]`：

```markdown
## [Unreleased]

### Added
- Add feature X (#123)

### Fixed
- Fix bug Y (#456)
```

發布時，移至版本區段：

```markdown
## [1.2.0] - 2025-12-15

### Added
- Add feature X (#123)

### Fixed
- Fix bug Y (#456)

## [1.1.0] - 2025-11-01
...
```

---

## 變更日誌 vs 發布說明

| 面向 | CHANGELOG（變更日誌） | Release Notes（發布說明） |
|------|----------------------|--------------------------|
| **對象** | 開發者、技術使用者 | 所有使用者、利害關係人 |
| **詳細程度** | 全面、技術性 | 重點摘要 |
| **格式** | 結構化 markdown 檔案 | GitHub Release、部落格文章 |
| **更新頻率** | 每次提交/PR | 每次發布 |
| **位置** | 儲存庫中的 `CHANGELOG.md` | GitHub Releases、網站 |

### 何時同時使用

- **函式庫/套件**：通常 CHANGELOG 即足夠
- **應用程式**：考慮為不同對象提供兩者
- **企業產品**：Release Notes 給客戶，CHANGELOG 給開發者

---

## 自動化

### conventional-changelog

從 Conventional Commits 生成 CHANGELOG：

```bash
# 安裝
npm install -g conventional-changelog-cli

# 生成（附加到現有檔案）
conventional-changelog -p angular -i CHANGELOG.md -s

# 生成（覆寫）
conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

### semantic-release

完全自動化的版本和 CHANGELOG：

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

### GitHub Actions 範例

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 多語言支援

對於需要雙語變更日誌的專案：

### 選項 A：單一檔案雙語條目

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

### 選項 B：分開檔案

```
CHANGELOG.md          # English (primary)
CHANGELOG.zh-TW.md    # Traditional Chinese
```

**建議**：小型專案使用選項 A，大型國際專案使用選項 B。

---

## AI 助手友善格式

為協助 AI 助手解析和產生 CHANGELOG 條目：

1. **使用一致的結構** - 每個條目相同格式
2. **包含參考** - 議題/PR 編號提供上下文
3. **使用標準分類** - Keep a Changelog 分類
4. **清楚的破壞性變更標記** - **BREAKING** 前綴
5. **日期格式** - ISO 8601 (YYYY-MM-DD)

---

## 範本

### 基本範本

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release

[Unreleased]: https://github.com/USER/REPO/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/USER/REPO/releases/tag/v1.0.0
```

### 雙語範本

```markdown
# Changelog | 變更日誌

All notable changes to this project will be documented in this file.
本專案的所有重要變更都將記錄在此檔案中。

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).
格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased] | 未發布

## [1.0.0] - YYYY-MM-DD

### Added | 新增
- Initial release
  初始發布

[Unreleased]: https://github.com/USER/REPO/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/USER/REPO/releases/tag/v1.0.0
```

---

## 排除規則

> **另見**：完整的排除規則，請參閱 [versioning.md](versioning.md#排除規則)。

### 核心原則

**任何在專案 `.gitignore` 中列出的目錄或檔案，都不應記錄在 CHANGELOG 中。**

### 分類

以下變更**不應**記錄在 CHANGELOG：

| 分類 | 範例 | 原因 |
|------|------|------|
| **建置輸出** | `dist/`, `build/`, `bin/`, `obj/` | 產生的檔案 |
| **相依套件** | `node_modules/`, `packages/`, lock files | 自動管理 |
| **本地設定** | `.env`, `*.local.json`, `appsettings.*.local.json` | 環境特定 |
| **IDE 設定** | `.vscode/`, `.idea/`, `.cursor/` | 開發者偏好 |
| **AI 工作空間** | `.claude/`, `.ai/` | 本地開發輔助 |
| **機密資訊** | `*.pem`, `*.key`, `credentials.*` | 安全敏感 |
| **內部重構** | 程式碼風格、變數名稱 | 無使用者影響 |

### 驗證

```bash
# 生成 CHANGELOG 前檢查 .gitignore 排除項目
cat .gitignore | grep -E "^[^#*]" | head -20

# 驗證記錄的路徑存在於版本控制中
git ls-files | grep -E "path/to/file"
```

**注意**：每個專案應根據自己的 `.gitignore` 設定來決定排除項目。上表僅為常見範例。

---

## 範例

### 函式庫專案

```markdown
## [2.3.0] - 2025-12-15

### Added
- Add `parseAsync()` method for non-blocking parsing (#234)
- Add TypeScript type definitions (#245)

### Changed
- **BREAKING**: Rename `parse()` to `parseSync()` (#234)
- Improve error messages with line numbers (#256)

### Deprecated
- Deprecate `legacyParse()`, use `parseSync()` instead (#234)

### Fixed
- Fix memory leak in large file processing (#267)
```

### 應用程式專案

```markdown
## [1.5.0] - 2025-12-15

### Added
- Add user dashboard with activity summary
- Add email notification preferences
- Add dark mode theme option

### Changed
- Redesign settings page for better navigation
- Improve search performance by 50%

### Fixed
- Fix incorrect date display in reports
- Fix logout not clearing session properly

### Security
- Fix XSS vulnerability in comment section (CVE-2025-1234)
```

---

## 常見錯誤

| ❌ 錯誤 | ✅ 正確 | 問題 |
|---------|---------|------|
| 無日期 | 包含日期 | 無法追蹤時間線 |
| 缺少連結 | 新增版本連結 | 無法查看差異 |
| 內部術語 | 使用者友善語言 | 使用者不理解 |
| 過於技術性 | 聚焦於影響 | 缺少「影響為何」 |
| 不完整 | 列出所有重要變更 | 使用者錯過重要資訊 |
| 無分類 | 使用標準分類 | 難以快速瀏覽 |

---

## 專案設定

在 `CONTRIBUTING.md` 中記錄您的 CHANGELOG 慣例：

```markdown
## Changelog Guidelines

- Update CHANGELOG.md for all user-facing changes
- Add entries to [Unreleased] section during development
- Use standard categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Reference issue/PR numbers: `Fix bug (#123)`
- Mark breaking changes with **BREAKING** prefix
```

---

## 相關標準

- [Versioning Standard](versioning.md) - 語義化版本標準
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範
- [Git Workflow Standards](git-workflow.md) - Git 工作流程標準

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.2 | 2025-12-24 | 新增：相關標準區段 |
| 1.0.1 | 2025-12-16 | 對齊排除規則與 versioning.md，新增交叉參考 |
| 1.0.0 | 2025-12-15 | 初始變更日誌標準 |

---

## 參考資料

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [semantic-release](https://github.com/semantic-release/semantic-release)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
