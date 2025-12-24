# Changelog Standards
# 變更日誌標準

**Version**: 1.0.2
**Last Updated**: 2025-12-24
**Applicability**: All software projects with versioned releases
**適用範圍**: 所有有版本發布的軟體專案

---

## Purpose | 目的

This standard defines how to write and maintain a CHANGELOG.md file to communicate changes clearly to users, maintainers, and projects that reference this repository.

本標準定義如何撰寫和維護 CHANGELOG.md 檔案，以清楚地向使用者、維護者以及引用此儲存庫的專案傳達變更內容。

**Key Benefits | 主要效益**:
- Users can quickly understand what changed between versions
- Dependent projects can assess upgrade impact
- Teams can track release history systematically
- 使用者可快速了解版本間的變更
- 相依專案可評估升級影響
- 團隊可系統性追蹤發布歷史

**Relationship to Other Standards | 與其他標準的關係**:
- Complements [versioning.md](versioning.md) which defines version numbering
- Integrates with [git-workflow.md](git-workflow.md) release process
- Maps from [commit-message-guide.md](commit-message-guide.md) commit types
- 補充 [versioning.md](versioning.md) 所定義的版本編號
- 整合 [git-workflow.md](git-workflow.md) 的發布流程
- 對應 [commit-message-guide.md](commit-message-guide.md) 的提交類型

---

## Core Principles | 核心原則

| Principle | Description | 說明 |
|-----------|-------------|------|
| **User-Centric** | Write for users, not developers | 為使用者撰寫，而非開發者 |
| **Consistent** | Use standard categories and format | 使用標準分類和格式 |
| **Complete** | Document all notable changes | 記錄所有值得注意的變更 |
| **Timely** | Update before each release | 在每次發布前更新 |
| **Traceable** | Link to issues, PRs, or commits | 連結到議題、PR 或提交 |

---

## Format Standards | 格式規範

This standard follows [Keep a Changelog](https://keepachangelog.com/) format.

本標準遵循 [Keep a Changelog](https://keepachangelog.com/) 格式。

### File Structure | 檔案結構

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

### Change Categories | 變更分類

| Category | Usage | When to Use | 使用時機 |
|----------|-------|-------------|----------|
| **Added** | New features | New functionality for users | 新功能 |
| **Changed** | Modifications | Changes in existing functionality | 現有功能的變更 |
| **Deprecated** | Soon to be removed | Features that will be removed | 即將移除的功能 |
| **Removed** | Removed features | Features removed in this version | 已移除的功能 |
| **Fixed** | Bug fixes | Any bug fixes | 錯誤修復 |
| **Security** | Security patches | Vulnerability fixes | 安全性修補 |

### Version Header Format | 版本標題格式

```markdown
## [VERSION] - YYYY-MM-DD
```

**Examples | 範例**:
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [Unreleased]
```

---

## Writing Guidelines | 撰寫指南

### Write for Users, Not Developers | 為使用者撰寫

Focus on **what changed** and **how it affects users**, not implementation details.

聚焦於**變更內容**和**對使用者的影響**，而非實作細節。

| ✅ Good | ❌ Bad | Why | 原因 |
|---------|--------|-----|------|
| Add dark mode theme option | Implement ThemeProvider with context | User-facing benefit | 使用者可感知的效益 |
| Fix login timeout on slow networks | Fix race condition in AuthService | Impact description | 影響描述 |
| Support CSV export for reports | Add CSVExporter class | Feature description | 功能描述 |
| Improve page load speed by 40% | Optimize SQL queries with indexes | Measurable outcome | 可量化的結果 |

### Entry Format | 條目格式

Each entry should follow this pattern:

每個條目應遵循此模式：

```markdown
- [Action verb] [what changed] ([reference])
```

**Examples | 範例**:
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

### Breaking Changes | 破壞性變更

Mark breaking changes clearly with **BREAKING** prefix:

使用 **BREAKING** 前綴清楚標註破壞性變更：

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

### Security Advisories | 安全公告

For security fixes, include severity and CVE if available:

對於安全修復，包含嚴重程度和 CVE（如有）：

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## Commit to Changelog Mapping | 提交到變更日誌對應

Map Conventional Commits types to CHANGELOG categories:

將 Conventional Commits 類型對應到 CHANGELOG 分類：

| Commit Type | CHANGELOG Category | Notes | 備註 |
|-------------|-------------------|-------|------|
| `feat` | **Added** | New features | 新功能 |
| `fix` | **Fixed** | Bug fixes | 錯誤修復 |
| `perf` | **Changed** | Performance improvements | 效能改進 |
| `refactor` | *(usually omit)* | Internal changes, no user impact | 內部變更，無使用者影響 |
| `docs` | *(usually omit)* | Documentation only | 僅文件變更 |
| `style` | *(usually omit)* | Code style only | 僅程式碼風格 |
| `test` | *(usually omit)* | Test only | 僅測試 |
| `chore` | *(usually omit)* | Maintenance | 維護工作 |
| `BREAKING CHANGE` | **Changed** or **Removed** | With **BREAKING** prefix | 加上 **BREAKING** 前綴 |
| `security` | **Security** | Security patches | 安全修補 |
| `deprecate` | **Deprecated** | Deprecation notices | 棄用通知 |

**Note | 注意**: Not all commits need CHANGELOG entries. Focus on user-facing changes.

**注意**：不是所有提交都需要 CHANGELOG 條目。聚焦於使用者可感知的變更。

---

## Git Workflow Integration | Git 工作流程整合

### When to Update CHANGELOG | 何時更新

| Workflow | When to Update | Branch | 更新時機 |
|----------|----------------|--------|----------|
| **GitFlow** | During release preparation | `release/*` | 準備發布時 |
| **GitHub Flow** | Before merging to main | Feature branch | 合併前 |
| **Trunk-Based** | Before tagging release | `main` | 標記版本前 |

### GitFlow Release Process | GitFlow 發布流程

```bash
# 1. Create release branch
git checkout -b release/v1.2.0 develop

# 2. Update CHANGELOG.md
# - Move [Unreleased] items to new version section
# - Add release date
# - Update comparison links

# 3. Commit changes
git add CHANGELOG.md
git commit -m "docs(changelog): update for v1.2.0"

# 4. Continue with release process
# See git-workflow.md for full details
```

### Unreleased Section Management | 未發布區段管理

During development, add entries to `[Unreleased]`:

開發期間，將條目加入 `[Unreleased]`：

```markdown
## [Unreleased]

### Added
- Add feature X (#123)

### Fixed
- Fix bug Y (#456)
```

At release time, move to versioned section:

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

## CHANGELOG vs Release Notes | 變更日誌 vs 發布說明

| Aspect | CHANGELOG | Release Notes |
|--------|-----------|---------------|
| **Audience** | Developers, technical users | All users, stakeholders |
| **Detail Level** | Comprehensive, technical | Highlights, summaries |
| **Format** | Structured markdown file | GitHub Release, blog post |
| **Update Frequency** | Every commit/PR | Each release |
| **Location** | `CHANGELOG.md` in repo | GitHub Releases, website |

| 面向 | CHANGELOG（變更日誌） | Release Notes（發布說明） |
|------|----------------------|--------------------------|
| **對象** | 開發者、技術使用者 | 所有使用者、利害關係人 |
| **詳細程度** | 全面、技術性 | 重點摘要 |
| **格式** | 結構化 markdown 檔案 | GitHub Release、部落格文章 |
| **更新頻率** | 每次提交/PR | 每次發布 |
| **位置** | 儲存庫中的 `CHANGELOG.md` | GitHub Releases、網站 |

### When to Use Both | 何時同時使用

- **Libraries/Packages**: CHANGELOG is often sufficient
- **Applications**: Consider both for different audiences
- **Enterprise Products**: Release Notes for customers, CHANGELOG for developers
- **函式庫/套件**：通常 CHANGELOG 即足夠
- **應用程式**：考慮為不同對象提供兩者
- **企業產品**：Release Notes 給客戶，CHANGELOG 給開發者

---

## Automation | 自動化

### conventional-changelog

Generate CHANGELOG from Conventional Commits:

從 Conventional Commits 生成 CHANGELOG：

```bash
# Install
npm install -g conventional-changelog-cli

# Generate (append to existing)
conventional-changelog -p angular -i CHANGELOG.md -s

# Generate (overwrite)
conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

### semantic-release

Fully automated versioning and CHANGELOG:

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

### GitHub Actions Example | GitHub Actions 範例

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

## Multi-Language Support | 多語言支援

For projects requiring bilingual changelogs:

對於需要雙語變更日誌的專案：

### Option A: Single File with Bilingual Entries | 選項 A：單一檔案雙語條目

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

### Option B: Separate Files | 選項 B：分開檔案

```
CHANGELOG.md          # English (primary)
CHANGELOG.zh-TW.md    # Traditional Chinese
```

**Recommendation | 建議**: Use Option A for smaller projects, Option B for larger international projects.

**建議**：小型專案使用選項 A，大型國際專案使用選項 B。

---

## AI-Friendly Format | AI 助手友善格式

To help AI assistants parse and generate CHANGELOG entries:

為協助 AI 助手解析和產生 CHANGELOG 條目：

1. **Use consistent structure** - Same format for every entry
2. **Include references** - Issue/PR numbers for context
3. **Use standard categories** - Keep a Changelog categories
4. **Clear breaking change markers** - **BREAKING** prefix
5. **Date format** - ISO 8601 (YYYY-MM-DD)

1. **使用一致的結構** - 每個條目相同格式
2. **包含參考** - 議題/PR 編號提供上下文
3. **使用標準分類** - Keep a Changelog 分類
4. **清楚的破壞性變更標記** - **BREAKING** 前綴
5. **日期格式** - ISO 8601 (YYYY-MM-DD)

---

## Templates | 範本

### Basic CHANGELOG.md Template | 基本範本

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

### Bilingual Template | 雙語範本

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

## Exclusion Rules | 排除規則

> **See Also | 另見**: For comprehensive exclusion rules, see [versioning.md](versioning.md#exclusion-rules--排除規則).
>
> **另見**：完整的排除規則，請參閱 [versioning.md](versioning.md#exclusion-rules--排除規則)。

### Core Principle | 核心原則

**Any file or directory listed in the project's `.gitignore` should NOT be recorded in CHANGELOG.**

**任何在專案 `.gitignore` 中列出的目錄或檔案，都不應記錄在 CHANGELOG 中。**

### Categories | 分類

The following changes should **NOT** be recorded in CHANGELOG:

以下變更**不應**記錄在 CHANGELOG：

| Category | Examples | Reason | 原因 |
|----------|----------|--------|------|
| **Build outputs** | `dist/`, `build/`, `bin/`, `obj/` | Generated files | 產生的檔案 |
| **Dependencies** | `node_modules/`, `packages/`, lock files | Auto-managed | 自動管理 |
| **Local config** | `.env`, `*.local.json`, `appsettings.*.local.json` | Environment-specific | 環境特定 |
| **IDE settings** | `.vscode/`, `.idea/`, `.cursor/` | Developer preference | 開發者偏好 |
| **AI workspace** | `.claude/`, `.ai/` | Local development aids | 本地開發輔助 |
| **Secrets** | `*.pem`, `*.key`, `credentials.*` | Security-sensitive | 安全敏感 |
| **Internal refactoring** | Code style, variable names | No user impact | 無使用者影響 |

### Verification | 驗證

```bash
# Check .gitignore exclusions before generating CHANGELOG
cat .gitignore | grep -E "^[^#*]" | head -20

# Verify recorded paths exist in version control
git ls-files | grep -E "path/to/file"
```

**Note**: Each project should determine exclusions based on its own `.gitignore`. The table above provides common examples only.

**注意**：每個專案應根據自己的 `.gitignore` 設定來決定排除項目。上表僅為常見範例。

---

## Examples | 範例

### Library Project | 函式庫專案

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

### Application Project | 應用程式專案

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

## Common Mistakes | 常見錯誤

| ❌ Mistake | ✅ Correct | Issue | 問題 |
|-----------|-----------|-------|------|
| No dates | Include dates | Can't track timeline | 無法追蹤時間線 |
| Missing links | Add version links | Can't view diffs | 無法查看差異 |
| Internal jargon | User-friendly language | Users don't understand | 使用者不理解 |
| Too technical | Focus on impact | Missing the "so what" | 缺少「影響為何」 |
| Incomplete | List all notable changes | Users miss important info | 使用者錯過重要資訊 |
| No categories | Use standard categories | Hard to scan | 難以快速瀏覽 |

---

## Project Configuration | 專案設定

Document your CHANGELOG practices in `CONTRIBUTING.md`:

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

## Related Standards | 相關標準

- [Versioning Standard](versioning.md) - 語義化版本標準
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範
- [Git Workflow Standards](git-workflow.md) - Git 工作流程標準

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.2 | 2025-12-24 | Added: Related Standards section |
| 1.0.1 | 2025-12-16 | Align exclusion rules with versioning.md, add cross-reference |
| 1.0.0 | 2025-12-15 | Initial changelog standard |

---

## References | 參考資料

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [semantic-release](https://github.com/semantic-release/semantic-release)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
