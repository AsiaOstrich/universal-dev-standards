# Release Workflow Guide

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/release-standards/release-workflow.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-02
**Applicability**: Universal Development Standards Project

---

## Purpose

This document provides a complete step-by-step release workflow for the Universal Development Standards project, including version management, npm publishing, GitHub releases, and dist-tag handling.

---

## Release Types

### 1. Beta Release (Testing Version)

**When to use:**
- Testing new features before stable release
- Gathering feedback from early adopters
- Validating bug fixes before production

**Version pattern:** `X.Y.Z-beta.N` (e.g., `3.2.1-beta.1`)

**npm tag:** `@beta`

**Installation:** `npm install -g universal-dev-standards@beta`

---

### 2. Stable Release (Production Version)

**When to use:**
- All features tested and verified
- Ready for production use
- All tests passing

**Version pattern:** `X.Y.Z` (e.g., `3.2.1`)

**npm tag:** `@latest`

**Installation:** `npm install -g universal-dev-standards`

---

### 3. Alpha Release (Early Testing)

**When to use:**
- Very early testing, unstable features
- Internal team testing only

**Version pattern:** `X.Y.Z-alpha.N` (e.g., `3.3.0-alpha.1`)

**npm tag:** `@alpha`

**Installation:** `npm install -g universal-dev-standards@alpha`

---

### 4. Release Candidate (Pre-release)

**When to use:**
- Final testing before stable release
- No new features, only bug fixes

**Version pattern:** `X.Y.Z-rc.N` (e.g., `3.2.1-rc.1`)

**npm tag:** `@rc`

**Installation:** `npm install -g universal-dev-standards@rc`

---

## Complete Release Workflow

### Workflow A: Beta Release

```bash
# 1. Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# 2. Ensure all tests pass
cd cli
npm test
npm run lint

# 3. Update version number to beta
npm version 3.2.1-beta.1

# 4. Update CHANGELOG.md
# - Add entry under [Unreleased] section
# - Create new section: ## [3.2.1-beta.1] - YYYY-MM-DD
# - Move changes from [Unreleased] to the new section

# 5. Commit changes (if CHANGELOG updated manually)
git add CHANGELOG.md cli/package.json cli/package-lock.json
git commit -m "chore(release): bump version to 3.2.1-beta.1"

# 6. Create and push git tag
git tag v3.2.1-beta.1
git push origin main --tags

# 7. Create GitHub Release
# - Go to: https://github.com/AsiaOstrich/universal-dev-standards/releases/new
# - Tag: v3.2.1-beta.1
# - Title: v3.2.1-beta.1 - [Feature Name] (Beta)
# - Mark as "Pre-release"
# - Description: Use template from .github/RELEASE_v3.2.1-beta.1.md
# - Click "Publish release"

# 8. GitHub Actions automatically publishes to npm with @beta tag
# - Workflow: .github/workflows/publish.yml
# - Automatic tag detection: version contains "-beta." → @beta tag
# - No manual npm publish needed

# 9. Verify npm publication
npm view universal-dev-standards dist-tags
# Expected: { latest: '3.2.0', beta: '3.2.1-beta.1' }

# 10. Test installation
npm install -g universal-dev-standards@beta
uds --version  # Should show 3.2.1-beta.1
```

---

### Workflow B: Stable Release (from Beta)

```bash
# 1. Ensure beta testing is complete and all issues resolved
# 2. Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# 3. Ensure all tests pass
cd cli
npm test
npm run lint

# 4. Update version number to stable
npm version 3.2.1

# 5. Update CHANGELOG.md
# - Move changes from [3.2.1-beta.1] to [3.2.1]
# - Update date to release date
# - Remove beta-specific notes

# 6. Commit changes
git add CHANGELOG.md cli/package.json cli/package-lock.json
git commit -m "chore(release): bump version to 3.2.1"

# 7. Create and push git tag
git tag v3.2.1
git push origin main --tags

# 8. Create GitHub Release
# - Go to: https://github.com/AsiaOstrich/universal-dev-standards/releases/new
# - Tag: v3.2.1
# - Title: v3.2.1 - [Feature Name]
# - Mark as "Latest release"
# - Description: Final release notes
# - Click "Publish release"

# 9. GitHub Actions automatically publishes to npm with @latest tag
# - Workflow: .github/workflows/publish.yml
# - Automatic tag detection: no prerelease identifier → @latest tag
# - No manual npm publish needed

# 10. Verify npm publication
npm view universal-dev-standards dist-tags
# Expected: { latest: '3.2.1', beta: '3.2.1-beta.1' }

# 11. Test installation
npm install -g universal-dev-standards
uds --version  # Should show 3.2.1
```

---

### Workflow C: Direct Stable Release (Skip Beta)

```bash
# Use this only for minor fixes or when beta testing is not needed

# 1. Follow Workflow B steps 1-11
# 2. No beta version needed, go directly to stable
```

---

## npm dist-tag Strategy

The project uses automatic tag detection in `.github/workflows/publish.yml`:

| Version Pattern | npm Tag | Install Command | Automatic? |
|----------------|---------|-----------------|------------|
| `X.Y.Z` | `latest` | `npm install -g universal-dev-standards` | ✅ Yes |
| `X.Y.Z-beta.N` | `beta` | `npm install -g universal-dev-standards@beta` | ✅ Yes |
| `X.Y.Z-alpha.N` | `alpha` | `npm install -g universal-dev-standards@alpha` | ✅ Yes |
| `X.Y.Z-rc.N` | `rc` | `npm install -g universal-dev-standards@rc` | ✅ Yes |

### How It Works

The GitHub Actions workflow automatically:

1. Reads the version from `cli/package.json`
2. Detects the version type using regex patterns
3. Publishes to npm with the correct tag

**Implementation:** `.github/workflows/publish.yml` lines 39-60

---

## Troubleshooting: Manual dist-tag Correction

### Problem: Wrong Tag After Manual npm Publish

If you accidentally published with the wrong tag (e.g., beta version tagged as `@latest`):

```bash
# 1. Login to npm (if not already)
npm login

# 2. Correct the tags
npm dist-tag add universal-dev-standards@3.2.0 latest      # Restore previous stable to @latest
npm dist-tag add universal-dev-standards@3.2.1-beta.1 beta # Tag beta version as @beta

# 3. Verify correction
npm view universal-dev-standards dist-tags
# Expected: { latest: '3.2.0', beta: '3.2.1-beta.1' }
```

### Problem: Need to Revert a Release

```bash
# Option 1: Deprecate the version
npm deprecate universal-dev-standards@3.2.1-beta.1 "Please use 3.2.1-beta.2 instead"

# Option 2: Unpublish (only within 72 hours, use with caution)
npm unpublish universal-dev-standards@3.2.1-beta.1

# Option 3: Publish a new patch version
npm version 3.2.2
# Then follow normal release workflow
```

---

## CHANGELOG Update Guidelines

### Format for Beta Releases

```markdown
## [Unreleased]

## [3.2.1-beta.1] - 2026-01-02

> ⚠️ **Beta Release**: This is a beta version for testing. Please report any issues before the stable release.

### Added
- **CLI**: Add Plugin Marketplace support to Skills installation flow

### Fixed
- **CLI**: Fix wildcard path handling in standards registry causing 404 errors
- **CLI**: Fix process hanging after init/configure/update commands

### Testing
- ✅ All 68 unit tests passing
- ✅ ESLint checks passing
```

### Format for Stable Releases

```markdown
## [Unreleased]

## [3.2.1] - 2026-01-02

### Added
- **CLI**: Add Plugin Marketplace support to Skills installation flow
  - New "Plugin Marketplace (推薦)" option in Skills installation prompt
  - CLI tracks marketplace-installed Skills without attempting local installation
  - `uds check` command displays marketplace installation status

### Fixed
- **CLI**: Fix wildcard path handling causing 404 errors when downloading templates
- **CLI**: Fix process hanging after init/configure/update commands
```

---

## Pre-release Checklist

### Before Creating Any Release

- [ ] All tests passing (`npm test`)
- [ ] Linting passing (`npm run lint`)
- [ ] CHANGELOG.md updated with all changes
- [ ] Version number updated in `cli/package.json`
- [ ] All related files synchronized (if core standards changed)
- [ ] Git working directory clean (`git status`)

### Documentation Sync Checklist

When Skills or core standards are added/modified, verify these files are updated:

- [ ] `skills/README.md` - Skills count and list accurate
- [ ] `skills/INTEGRATION-GUIDE.md` - Skills count accurate
- [ ] `skills/claude-code/README.md` - Installation instructions and Skills list accurate
- [ ] `README.md` - Skills count and list accurate (see "Standards Coverage" section)
- [ ] Run translation sync check: `./scripts/check-translation-sync.sh`
- [ ] `locales/zh-TW/` corresponding files updated:
  - [ ] `locales/zh-TW/skills/README.md`
  - [ ] `locales/zh-TW/skills/INTEGRATION-GUIDE.md`
  - [ ] `locales/zh-TW/skills/claude-code/README.md`

### Before Beta Release

- [ ] Pre-release checklist completed
- [ ] Beta testing plan documented
- [ ] Known issues documented in release notes
- [ ] Beta testers identified and notified

### Before Stable Release

- [ ] Pre-release checklist completed
- [ ] Beta testing completed (if applicable)
- [ ] All beta feedback addressed
- [ ] No critical or high-priority bugs
- [ ] Documentation updated
- [ ] Migration guide created (if breaking changes)

---

## Version Numbering Strategy

Follow semantic versioning:

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking changes | MAJOR | 2.9.5 → 3.0.0 |
| New features (backward-compatible) | MINOR | 3.1.5 → 3.2.0 |
| Bug fixes (backward-compatible) | PATCH | 3.2.0 → 3.2.1 |
| Beta releases | Add `-beta.N` | 3.2.1 → 3.2.1-beta.1 |
| Alpha releases | Add `-alpha.N` | 3.3.0 → 3.3.0-alpha.1 |
| Release candidates | Add `-rc.N` | 3.2.1 → 3.2.1-rc.1 |

---

## CI/CD Automation

### GitHub Actions Workflow

The project uses `.github/workflows/publish.yml` for automated publishing:

**Trigger:** Creating a GitHub Release (any tag)

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies (`npm ci`)
4. Verify CLI (`node bin/uds.js --version`)
5. **Determine npm tag** (automatic version detection)
6. Publish to npm with correct tag

**Version Detection Logic:**
```bash
VERSION=$(node -p "require('./package.json').version")

if [[ $VERSION =~ -beta\. ]]; then
  TAG=beta
elif [[ $VERSION =~ -alpha\. ]]; then
  TAG=alpha
elif [[ $VERSION =~ -rc\. ]]; then
  TAG=rc
else
  TAG=latest
fi

npm publish --tag $TAG
```

---

## Related Documentation

- [Semantic Versioning Guide](./semantic-versioning.md)
- [Changelog Format](./changelog-format.md)
- [MAINTENANCE.md](../../../MAINTENANCE.md) - Workflow 6: Release a New Version
- [.github/workflows/publish.yml](../../../.github/workflows/publish.yml)

---

## AI Assistant Guidelines

When asked to help with releases, AI assistants should:

1. **Identify release type:** Ask if this is beta, alpha, rc, or stable
2. **Run pre-release checks:** Tests, linting, git status
3. **Update version:** Use `npm version` with correct format
4. **Update CHANGELOG:** Follow the format for the release type
5. **Create git tag:** Format `v{VERSION}`
6. **Remind about GitHub Release:** User must create manually
7. **Verify after release:** Check npm dist-tags
8. **Never manually run `npm publish`:** GitHub Actions handles this

### Example Interaction

```
User: "我想發布 beta 版本"

AI:
我會協助你準備 beta 版本發布。請確認：

1. 這是哪個版本號？（例如：3.2.1-beta.1）
2. 主要包含哪些變更？

完成確認後，我會：
1. 執行測試和檢查
2. 更新版本號和 CHANGELOG
3. 建立 git tag
4. 提供 GitHub Release 建立指示
5. GitHub Actions 會自動發布到 npm 並標記為 @beta
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-02 | Initial release workflow guide |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
