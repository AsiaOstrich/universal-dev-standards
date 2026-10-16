---
source: ../../../core/changelog-standards.md
source_version: 1.0.2
translation_version: 1.0.2
last_synced: 2026-10-16
source_hash: bb36e2ce7d8f
status: current
---

# 变更日志标准

> **语言**: [English](../../../core/changelog-standards.md) | [繁體中文](../../zh-TW/core/changelog-standards.md) | 简体中文

**版本**: 1.0.2
**最后更新**: 2025-12-24
**适用范围**: 所有具有版本化发布周期的软件项目
**范畴**: universal
**行业标准**: Keep a Changelog 1.1.0
**参考**: [keepachangelog.com](https://keepachangelog.com/)

---

## 目的

本标准定义如何编写与维护 CHANGELOG.md 文件，以便向用户、维护者以及引用此代码仓库的项目清晰传达变更。

**核心收益**:
- 用户可以快速了解版本之间的变更
- 依赖项目可以评估升级影响
- 团队可以系统化跟踪发布历史

**与其他标准的关系**:
- 补充定义版本编号的 [versioning.md](versioning.md)
- 与 [git-workflow.md](git-workflow.md) 发布流程整合
- 映射自 [commit-message-guide.md](commit-message-guide.md) 中的提交类型

---

## 核心原则

| 原则 | 说明 |
|------|------|
| **以用户为中心** | 面向用户编写，而非面向开发者 |
| **一致** | 使用标准分类与格式 |
| **完整** | 记录所有值得注意的变更 |
| **及时** | 在每次发布前更新 |
| **可追溯** | 链接到 issue、PR 或 commit |

---

## 格式标准

本标准遵循 [Keep a Changelog](https://keepachangelog.com/) 格式。

### 文件结构

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

### 变更分类

| 分类 | 用途 | 何时使用 |
|------|------|----------|
| **Added** | 新功能 | 针对用户的新功能 |
| **Changed** | 修改 | 现有功能的变更 |
| **Deprecated** | 即将移除 | 未来将被移除的功能 |
| **Removed** | 移除功能 | 在此版本中移除的功能 |
| **Fixed** | 缺陷修复 | 任何 bug 修复 |
| **Security** | 安全补丁 | 漏洞修复 |

### 版本标题格式

```markdown
## [VERSION] - YYYY-MM-DD
```

**示例**:
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [Unreleased]
```

---

## 编写指南

### 面向用户编写，而非面向开发者

聚焦于**改变了什么**以及**对用户有何影响**，而非实现细节。

| ✅ 好 | ❌ 差 | 原因 |
|-------|-------|------|
| Add dark mode theme option | Implement ThemeProvider with context | 面向用户的收益 |
| Fix login timeout on slow networks | Fix race condition in AuthService | 影响描述 |
| Support CSV export for reports | Add CSVExporter class | 功能描述 |
| Improve page load speed by 40% | Optimize SQL queries with indexes | 可衡量的成果 |

### 条目格式

每个条目应遵循此模式：

```markdown
- [Action verb] [what changed] ([reference])
```

**示例**:
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

### 破坏性变更

使用 **BREAKING** 前缀清晰标注破坏性变更：

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

### 安全通告

对于安全修复，请在可用时包含严重程度和 CVE：

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## Commit 到 Changelog 的映射

将 Conventional Commits 类型映射到 CHANGELOG 分类：

| Commit 类型 | CHANGELOG 分类 | 备注 |
|-------------|----------------|------|
| `feat` | **Added** | 新功能 |
| `fix` | **Fixed** | 缺陷修复 |
| `perf` | **Changed** | 性能改进 |
| `refactor` | *(通常忽略)* | 内部变更，对用户无影响 |
| `docs` | *(通常忽略)* | 仅文档 |
| `style` | *(通常忽略)* | 仅代码样式 |
| `test` | *(通常忽略)* | 仅测试 |
| `chore` | *(通常忽略)* | 日常维护 |
| `BREAKING CHANGE` | **Changed** 或 **Removed** | 带 **BREAKING** 前缀 |
| `security` | **Security** | 安全补丁 |
| `deprecate` | **Deprecated** | 弃用通知 |

**注意**: 并非所有 commit 都需要 CHANGELOG 条目。聚焦于面向用户的变更。

---

## Git 工作流集成

### 何时更新 CHANGELOG

| 工作流 | 何时更新 | 分支 |
|----------|----------------|--------|
| **GitFlow** | 发布准备期间 | `release/*` |
| **GitHub Flow** | 合并到 main 之前 | 特性分支 |
| **Trunk-Based** | 打发布标签之前 | `main` |

### GitFlow 发布流程

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

### 未发布区段管理

在开发期间，将条目添加到 `[Unreleased]`：

```markdown
## [Unreleased]

### Added
- Add feature X (#123)

### Fixed
- Fix bug Y (#456)
```

在发布时，移动到版本化区段：

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

## CHANGELOG 与发布说明对比

| 方面 | CHANGELOG | 发布说明 |
|--------|-----------|---------------|
| **受众** | 开发者、技术用户 | 所有用户、利益相关者 |
| **详细程度** | 全面、技术性 | 亮点、摘要 |
| **格式** | 结构化 markdown 文件 | GitHub Release、博客文章 |
| **更新频率** | 每次 commit/PR | 每次发布 |
| **位置** | 仓库中的 `CHANGELOG.md` | GitHub Releases、网站 |

### 何时两者兼用

- **库/软件包**：CHANGELOG 通常已足够
- **应用程序**：针对不同受众考虑两者兼用
- **企业产品**：针对客户提供发布说明，针对开发者提供 CHANGELOG

---

## 自动化

### conventional-changelog

从 Conventional Commits 生成 CHANGELOG：

```bash
# Install
npm install -g conventional-changelog-cli

# Generate (append to existing)
conventional-changelog -p angular -i CHANGELOG.md -s

# Generate (overwrite)
conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

### semantic-release

全自动版本控制与 CHANGELOG：

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

### GitHub Actions 示例

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

## 多语言支持

对于需要双语变更日志的项目：

### 选项 A：包含双语条目的单个文件

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

### 选项 B：分开的文件

```
CHANGELOG.md          # English (primary)
CHANGELOG.zh-TW.md    # Traditional Chinese
```

**建议**：小型项目使用选项 A，大型国际化项目使用选项 B。

---

## AI 友好格式

为帮助 AI 助手解析并生成 CHANGELOG 条目：

1. **使用一致的结构** - 每个条目使用相同格式
2. **包含引用** - 提供 Issue/PR 编号作为上下文
3. **使用标准分类** - Keep a Changelog 分类
4. **明确的破坏性变更标记** - **BREAKING** 前缀
5. **日期格式** - ISO 8601 (YYYY-MM-DD)

---

## 模板

### 基础 CHANGELOG.md 模板

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

### 双语模板

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

## 排除规则

> **另请参阅**：有关完整的排除规则，请参阅 [versioning.md](versioning.md#exclusion-rules)。

### 核心原则

**项目的 `.gitignore` 中列出的任何文件或目录均不得记录在 CHANGELOG 中。**

### 类别

以下变更**不得**记录在 CHANGELOG 中：

| 类别 | 示例 | 原因 |
|----------|----------|--------|
| **构建输出** | `dist/`, `build/`, `bin/`, `obj/` | 生成的文件 |
| **依赖项** | `node_modules/`, `packages/`, lock files | 自动管理 |
| **本地配置** | `.env`, `*.local.json`, `appsettings.*.local.json` | 特定于环境 |
| **IDE 设置** | `.vscode/`, `.idea/`, `.cursor/` | 开发者偏好 |
| **AI 工作区** | `.claude/`, `.ai/` | 本地开发辅助工具 |
| **机密信息** | `*.pem`, `*.key`, `credentials.*` | 安全敏感 |
| **内部重构** | 代码风格、变量名 | 对用户无影响 |

### 验证

```bash
# Check .gitignore exclusions before generating CHANGELOG
cat .gitignore | grep -E "^[^#*]" | head -20

# Verify recorded paths exist in version control
git ls-files | grep -E "path/to/file"
```

**注意**：每个项目都应根据自身的 `.gitignore` 来确定排除项。上表仅提供常见示例。

---

## 示例

### 库项目

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

### 应用程序项目

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

## 常见错误

| ❌ 错误 | ✅ 正确 | 问题 |
|-----------|-----------|-------|
| 没有日期 | 包含日期 | 无法追踪时间线 |
| 缺少链接 | 添加版本链接 | 无法查看差异（diff） |
| 内部术语 | 用户友好的语言 | 用户无法理解 |
| 技术性过强 | 关注影响 | 缺少“那又如何”（实际价值） |
| 不完整 | 列出所有重要变更 | 用户会遗漏重要信息 |
| 未分类 | 使用标准类别 | 难以快速浏览 |

---

## 项目配置

在 `CONTRIBUTING.md` 中记录您的 CHANGELOG 实践规范：

```markdown
## Changelog Guidelines

- Update CHANGELOG.md for all user-facing changes
- Add entries to [Unreleased] section during development
- Use standard categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Reference issue/PR numbers: `Fix bug (#123)`
- Mark breaking changes with **BREAKING** prefix
```

---

## 相关标准

- [版本标准](versioning.md) - 语义化版本标准
- [提交消息指南](commit-message-guide.md) - 提交消息规范
- [Git 工作流标准](git-workflow.md) - Git 工作流标准
- [部署标准](deployment-standards.md) - 记录已部署的变更

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.2 | 2025-12-24 | 新增：相关标准章节 |
| 1.0.1 | 2025-12-16 | 将排除规则与 versioning.md 对齐，添加交叉引用 |
| 1.0.0 | 2025-12-15 | 初始变更日志标准 |

---

## 参考资料

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [semantic-release](https://github.com/semantic-release/semantic-release)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
