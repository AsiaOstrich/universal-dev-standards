# Changelog Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/changelog-standards.md)

**Version**: 1.0.2
**Last Updated**: 2025-12-24
**Applicability**: All software projects with versioned releases
**Scope**: universal
**Industry Standards**: Keep a Changelog 1.1.0
**References**: [keepachangelog.com](https://keepachangelog.com/)

---

## Purpose

This standard defines how to write and maintain a CHANGELOG.md file to communicate changes clearly to users, maintainers, and projects that reference this repository.

**Key Benefits**:
- Users can quickly understand what changed between versions
- Dependent projects can assess upgrade impact
- Teams can track release history systematically

**Relationship to Other Standards**:
- Complements [versioning.md](versioning.md) which defines version numbering
- Integrates with [git-workflow.md](git-workflow.md) release process
- Maps from [commit-message-guide.md](commit-message-guide.md) commit types

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **User-Centric** | Write for users, not developers |
| **Consistent** | Use standard categories and format |
| **Complete** | Document all notable changes |
| **Timely** | Update before each release |
| **Traceable** | Link to issues, PRs, or commits |

---

## Format Standards

This standard follows [Keep a Changelog](https://keepachangelog.com/) format.

### File Structure

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

### Change Categories

| Category | Usage | When to Use |
|----------|-------|-------------|
| **Added** | New features | New functionality for users |
| **Changed** | Modifications | Changes in existing functionality |
| **Deprecated** | Soon to be removed | Features that will be removed |
| **Removed** | Removed features | Features removed in this version |
| **Fixed** | Bug fixes | Any bug fixes |
| **Security** | Security patches | Vulnerability fixes |

### Version Header Format

```markdown
## [VERSION] - YYYY-MM-DD
```

**Examples**:
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [Unreleased]
```

---

## Writing Guidelines

### Write for Users, Not Developers

Focus on **what changed** and **how it affects users**, not implementation details.

| ✅ Good | ❌ Bad | Why |
|---------|--------|-----|
| Add dark mode theme option | Implement ThemeProvider with context | User-facing benefit |
| Fix login timeout on slow networks | Fix race condition in AuthService | Impact description |
| Support CSV export for reports | Add CSVExporter class | Feature description |
| Improve page load speed by 40% | Optimize SQL queries with indexes | Measurable outcome |

### Entry Format

Each entry should follow this pattern:

```markdown
- [Action verb] [what changed] ([reference])
```

**Examples**:
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

### Breaking Changes

Mark breaking changes clearly with **BREAKING** prefix:

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()` method, use `getUser()` instead
- **BREAKING**: Change configuration file format from YAML to TOML

### Removed
- **BREAKING**: Remove support for Node.js 14
```

### Security Advisories

For security fixes, include severity and CVE if available:

```markdown
### Security
- Fix SQL injection vulnerability in search endpoint (HIGH, CVE-2025-12345)
- Fix XSS vulnerability in comment rendering (MEDIUM)
- Update dependency `lodash` to patch prototype pollution (LOW)
```

---

## Commit to Changelog Mapping

Map Conventional Commits types to CHANGELOG categories:

| Commit Type | CHANGELOG Category | Notes |
|-------------|-------------------|-------|
| `feat` | **Added** | New features |
| `fix` | **Fixed** | Bug fixes |
| `perf` | **Changed** | Performance improvements |
| `refactor` | *(usually omit)* | Internal changes, no user impact |
| `docs` | *(usually omit)* | Documentation only |
| `style` | *(usually omit)* | Code style only |
| `test` | *(usually omit)* | Test only |
| `chore` | *(usually omit)* | Maintenance |
| `BREAKING CHANGE` | **Changed** or **Removed** | With **BREAKING** prefix |
| `security` | **Security** | Security patches |
| `deprecate` | **Deprecated** | Deprecation notices |

**Note**: Not all commits need CHANGELOG entries. Focus on user-facing changes.

---

## Git Workflow Integration

### When to Update CHANGELOG

| Workflow | When to Update | Branch |
|----------|----------------|--------|
| **GitFlow** | During release preparation | `release/*` |
| **GitHub Flow** | Before merging to main | Feature branch |
| **Trunk-Based** | Before tagging release | `main` |

### GitFlow Release Process

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

### Unreleased Section Management

During development, add entries to `[Unreleased]`:

```markdown
## [Unreleased]

### Added
- Add feature X (#123)

### Fixed
- Fix bug Y (#456)
```

At release time, move to versioned section:

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

## CHANGELOG vs Release Notes

| Aspect | CHANGELOG | Release Notes |
|--------|-----------|---------------|
| **Audience** | Developers, technical users | All users, stakeholders |
| **Detail Level** | Comprehensive, technical | Highlights, summaries |
| **Format** | Structured markdown file | GitHub Release, blog post |
| **Update Frequency** | Every commit/PR | Each release |
| **Location** | `CHANGELOG.md` in repo | GitHub Releases, website |

### When to Use Both

- **Libraries/Packages**: CHANGELOG is often sufficient
- **Applications**: Consider both for different audiences
- **Enterprise Products**: Release Notes for customers, CHANGELOG for developers

---

## Automation

### conventional-changelog

Generate CHANGELOG from Conventional Commits:

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

### GitHub Actions Example

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

## Multi-Language Support

For projects requiring bilingual changelogs:

### Option A: Single File with Bilingual Entries

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

### Option B: Separate Files

```
CHANGELOG.md          # English (primary)
CHANGELOG.zh-TW.md    # Traditional Chinese
```

**Recommendation**: Use Option A for smaller projects, Option B for larger international projects.

---

## AI-Friendly Format

To help AI assistants parse and generate CHANGELOG entries:

1. **Use consistent structure** - Same format for every entry
2. **Include references** - Issue/PR numbers for context
3. **Use standard categories** - Keep a Changelog categories
4. **Clear breaking change markers** - **BREAKING** prefix
5. **Date format** - ISO 8601 (YYYY-MM-DD)

---

## Templates

### Basic CHANGELOG.md Template

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

### Bilingual Template

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

## Exclusion Rules

> **See Also**: For comprehensive exclusion rules, see [versioning.md](versioning.md#exclusion-rules).

### Core Principle

**Any file or directory listed in the project's `.gitignore` should NOT be recorded in CHANGELOG.**

### Categories

The following changes should **NOT** be recorded in CHANGELOG:

| Category | Examples | Reason |
|----------|----------|--------|
| **Build outputs** | `dist/`, `build/`, `bin/`, `obj/` | Generated files |
| **Dependencies** | `node_modules/`, `packages/`, lock files | Auto-managed |
| **Local config** | `.env`, `*.local.json`, `appsettings.*.local.json` | Environment-specific |
| **IDE settings** | `.vscode/`, `.idea/`, `.cursor/` | Developer preference |
| **AI workspace** | `.claude/`, `.ai/` | Local development aids |
| **Secrets** | `*.pem`, `*.key`, `credentials.*` | Security-sensitive |
| **Internal refactoring** | Code style, variable names | No user impact |

### Verification

```bash
# Check .gitignore exclusions before generating CHANGELOG
cat .gitignore | grep -E "^[^#*]" | head -20

# Verify recorded paths exist in version control
git ls-files | grep -E "path/to/file"
```

**Note**: Each project should determine exclusions based on its own `.gitignore`. The table above provides common examples only.

---

## Examples

### Library Project

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

### Application Project

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

## Common Mistakes

| ❌ Mistake | ✅ Correct | Issue |
|-----------|-----------|-------|
| No dates | Include dates | Can't track timeline |
| Missing links | Add version links | Can't view diffs |
| Internal jargon | User-friendly language | Users don't understand |
| Too technical | Focus on impact | Missing the "so what" |
| Incomplete | List all notable changes | Users miss important info |
| No categories | Use standard categories | Hard to scan |

---

## Project Configuration

Document your CHANGELOG practices in `CONTRIBUTING.md`:

```markdown
## Changelog Guidelines

- Update CHANGELOG.md for all user-facing changes
- Add entries to [Unreleased] section during development
- Use standard categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Reference issue/PR numbers: `Fix bug (#123)`
- Mark breaking changes with **BREAKING** prefix
```

---

## Related Standards

- [Versioning Standard](versioning.md) - Semantic versioning standard
- [Commit Message Guide](commit-message-guide.md) - Commit message conventions
- [Git Workflow Standards](git-workflow.md) - Git workflow standards

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.2 | 2025-12-24 | Added: Related Standards section |
| 1.0.1 | 2025-12-16 | Align exclusion rules with versioning.md, add cross-reference |
| 1.0.0 | 2025-12-15 | Initial changelog standard |

---

## References

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [semantic-release](https://github.com/semantic-release/semantic-release)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
