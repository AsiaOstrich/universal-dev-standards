# Release Workflow Guide

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/release-standards/release-workflow.md)

**Version**: 2.0.0
**Last Updated**: 2026-01-14
**Applicability**: All software projects using semantic versioning

---

## Purpose

This document provides a universal release workflow guide applicable to any software project. It covers version management, release types, and standard publishing workflows.

> **Note**: For project-specific configurations (additional version files, translation sync, custom verification scripts), define them in your project's `CLAUDE.md` file.

---

## Release Types

### 1. Beta Release (Testing Version)

**When to use:**
- Testing new features before stable release
- Gathering feedback from early adopters
- Validating bug fixes before production

**Version pattern:** `X.Y.Z-beta.N` (e.g., `3.2.1-beta.1`)

**npm tag:** `@beta`

---

### 2. Stable Release (Production Version)

**When to use:**
- All features tested and verified
- Ready for production use
- All tests passing

**Version pattern:** `X.Y.Z` (e.g., `3.2.1`)

**npm tag:** `@latest`

---

### 3. Alpha Release (Early Testing)

**When to use:**
- Very early testing, unstable features
- Internal team testing only

**Version pattern:** `X.Y.Z-alpha.N` (e.g., `3.3.0-alpha.1`)

**npm tag:** `@alpha`

---

### 4. Release Candidate (Pre-release)

**When to use:**
- Final testing before stable release
- No new features, only bug fixes

**Version pattern:** `X.Y.Z-rc.N` (e.g., `3.2.1-rc.1`)

**npm tag:** `@rc`

---

## Standard Release Workflow

### Step 1: Pre-release Checks

```bash
# Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# Run tests
npm test  # or your project's test command

# Run linting
npm run lint  # or your project's lint command

# Check git status
git status  # Should be clean
```

### Step 2: Update Version

```bash
# For npm projects
npm version X.Y.Z        # Stable
npm version X.Y.Z-beta.N # Beta

# For other projects, update version file manually
```

### Step 3: Update CHANGELOG

Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature descriptions

### Changed
- Change descriptions

### Fixed
- Bug fix descriptions
```

### Step 4: Commit and Tag

```bash
# Commit changes
git add .
git commit -m "chore(release): X.Y.Z"

# Create and push tag
git tag vX.Y.Z
git push origin main --tags
```

### Step 5: Create Release

Create a GitHub/GitLab release:
- Tag: `vX.Y.Z`
- Title: `vX.Y.Z - [Release Name]`
- Mark as pre-release if beta/alpha/rc
- Add release notes from CHANGELOG

### Step 6: Verify Publication

```bash
# For npm packages
npm view <package-name> dist-tags

# Test installation
npm install -g <package-name>@<version>
```

---

## npm dist-tag Strategy

| Version Pattern | npm Tag | Install Command |
|----------------|---------|-----------------|
| `X.Y.Z` | `latest` | `npm install <package>` |
| `X.Y.Z-beta.N` | `beta` | `npm install <package>@beta` |
| `X.Y.Z-alpha.N` | `alpha` | `npm install <package>@alpha` |
| `X.Y.Z-rc.N` | `rc` | `npm install <package>@rc` |

### Automatic Tag Detection

For CI/CD automation, detect version type using regex:

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

## CHANGELOG Format

### Beta Release Format

```markdown
## [X.Y.Z-beta.N] - YYYY-MM-DD

> ⚠️ **Beta Release**: This is a beta version for testing.

### Added
- Feature description

### Fixed
- Bug fix description
```

### Stable Release Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Feature description with details

### Changed
- Change description

### Fixed
- Bug fix description
```

---

## Version Numbering Strategy

Follow [Semantic Versioning](https://semver.org/):

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking changes | MAJOR | 2.9.5 → 3.0.0 |
| New features (backward-compatible) | MINOR | 3.1.5 → 3.2.0 |
| Bug fixes (backward-compatible) | PATCH | 3.2.0 → 3.2.1 |
| Pre-release | Add suffix | 3.2.1 → 3.2.1-beta.1 |

---

## Troubleshooting

### Wrong npm Tag

If you published with the wrong tag:

```bash
npm dist-tag add <package>@<version> <correct-tag>
```

### Need to Revert a Release

```bash
# Option 1: Deprecate
npm deprecate <package>@<version> "Please use <new-version> instead"

# Option 2: Unpublish (within 72 hours only)
npm unpublish <package>@<version>

# Option 3: Publish patch version
npm version patch
```

---

## Pre-release Checklist

### Universal Checks

- [ ] All tests passing
- [ ] Linting passing
- [ ] Git working directory clean
- [ ] CHANGELOG updated
- [ ] On correct branch (main for stable)

### Before Beta Release

- [ ] Universal checks completed
- [ ] Known issues documented

### Before Stable Release

- [ ] Universal checks completed
- [ ] Beta testing completed (if applicable)
- [ ] No critical bugs
- [ ] Migration guide created (if breaking changes)

---

## Project-Specific Configuration

For project-specific release requirements, define them in your `CLAUDE.md` file:

```markdown
## Release Process (Project-Specific)

### Additional Version Files
- `path/to/file1.json` - description
- `path/to/file2.json` - description

### Pre-release Scripts
# macOS / Linux
./scripts/your-pre-release-check.sh

# Windows PowerShell
.\scripts\your-pre-release-check.ps1

### Additional Verification
- Custom verification step 1
- Custom verification step 2
```

This allows AI assistants to automatically apply project-specific rules when executing the `/release` command.

---

## AI Assistant Guidelines

When helping with releases:

1. **Identify release type:** Ask if beta, alpha, rc, or stable
2. **Run pre-release checks:** Tests, linting, git status
3. **Check for project-specific rules:** Read `CLAUDE.md` for additional requirements
4. **Update version:** Use appropriate version command
5. **Update CHANGELOG:** Follow standard format
6. **Create git tag:** Format `v{VERSION}`
7. **Create release:** GitHub/GitLab release
8. **Verify publication:** Check dist-tags and test installation

---

## Related Documentation

- [Semantic Versioning Guide](./semantic-versioning.md)
- [Changelog Format](./changelog-format.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-14 | Refactor to universal guide, move project-specific content to CLAUDE.md |
| 1.0.0 | 2026-01-02 | Initial release workflow guide |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
