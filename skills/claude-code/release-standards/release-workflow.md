# Release Workflow Guide

> **Language**: English | [繁體中文](../../../locales/zh-TW/skills/claude-code/release-standards/release-workflow.md)

**Version**: 2.2.0
**Last Updated**: 2026-01-26
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

> **Workflow Philosophy**: Alpha for internal testing, Beta for public release. This ensures thorough validation before each stage.

```
┌─────────────────────────────────────────────────────────────────┐
│  Alpha (Internal)  →  Beta (Public)  →  Stable (Production)    │
│  X.Y.Z-alpha.N        X.Y.Z-beta.N      X.Y.Z                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase A: Alpha Release (Internal Testing)

#### Step 1: Prepare Release Branch

```bash
# Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# Check git status (should be clean)
git status
```

#### Step 2: Update to Alpha Version

```bash
# For npm projects
npm version X.Y.Z-alpha.1 --no-git-tag-version

# For other projects, update version file manually
# Update all project-specific version files (see CLAUDE.md)
```

#### Step 3: Update CHANGELOG

```markdown
## [X.Y.Z-alpha.1] - YYYY-MM-DD

> ⚠️ **Alpha Release**: Internal testing only.

### Added
- New feature descriptions

### Changed
- Change descriptions
```

#### Step 4: Run All Tests

```bash
# Run automated tests
npm test  # or your project's test command

# Run linting
npm run lint  # or your project's lint command

# Run pre-release checks (if available)
./scripts/pre-release-check.sh  # or .\scripts\pre-release-check.ps1
```

#### Step 5: Internal Verification

Before proceeding, manually verify:

- [ ] **Build verification**: Application builds successfully
- [ ] **Smoke test**: Core functionality works as expected
- [ ] **Version display**: Version shows `X.Y.Z-alpha.N`
- [ ] **Known issues**: Documented for team reference

> ⚠️ **Stop here if any verification fails.** Fix issues and increment alpha (alpha.2, alpha.3...).

#### Step 6: Commit Alpha (Optional: Local Only)

```bash
# Commit changes (can be local-only for internal testing)
git add .
git commit -m "chore(release): X.Y.Z-alpha.1"

# Optional: Push for CI/CD testing
git push origin main
```

---

### Phase B: Beta Release (Public Testing)

#### Step 7: Promote Alpha to Beta

After internal testing passes:

```bash
# Update version from alpha to beta
npm version X.Y.Z-beta.1 --no-git-tag-version

# Update all project-specific version files
```

#### Step 8: Update CHANGELOG for Beta

```markdown
## [X.Y.Z-beta.1] - YYYY-MM-DD

> ⚠️ **Beta Release**: For testing. Install with `npm install <package>@beta`

### Added
- New feature descriptions

### Fixed
- Issues found during alpha testing
```

#### Step 9: Final Verification

- [ ] All alpha issues resolved
- [ ] Version displays `X.Y.Z-beta.1`
- [ ] CHANGELOG updated with beta notes

#### Step 10: Commit and Tag Beta

```bash
# Commit changes
git add .
git commit -m "chore(release): X.Y.Z-beta.1"

# Create and push tag
git tag vX.Y.Z-beta.1
git push origin main --tags
```

#### Step 11: Create Beta Release

Create a GitHub/GitLab release:
- Tag: `vX.Y.Z-beta.1`
- Title: `vX.Y.Z-beta.1 - [Release Name]`
- ✅ Mark as **pre-release**
- Add release notes from CHANGELOG

#### Step 12: Verify Beta Publication

```bash
# For npm packages
npm view <package-name> dist-tags
# Should show: beta: X.Y.Z-beta.1

# Test installation
npm install -g <package-name>@beta

# Verify version
<command> --version  # Should show X.Y.Z-beta.1
```

---

### Phase C: Stable Release (Production)

After beta testing is complete, follow the same pattern:
1. Update version to `X.Y.Z` (remove `-beta.N`)
2. Update CHANGELOG (remove beta warning)
3. Commit, tag, push
4. Create GitHub release (NOT marked as pre-release)
5. Verify `@latest` tag on npm

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

### Before Alpha Release (Internal)

- [ ] On correct branch (main)
- [ ] Git working directory clean
- [ ] Version updated to `X.Y.Z-alpha.N`
- [ ] All tests passing
- [ ] Linting passing
- [ ] Build successful
- [ ] Core functionality works (smoke test)

### Before Beta Release (Public)

- [ ] Alpha testing completed
- [ ] All alpha issues resolved
- [ ] Version updated to `X.Y.Z-beta.N`
- [ ] CHANGELOG updated with beta notes
- [ ] Known issues documented
- [ ] Pre-release check script passes

### Before Stable Release (Production)

- [ ] Beta testing completed
- [ ] All beta feedback addressed
- [ ] No critical bugs
- [ ] Version updated to `X.Y.Z`
- [ ] CHANGELOG finalized (beta warning removed)
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
| 2.2.0 | 2026-01-26 | Add Alpha→Beta→Stable three-phase workflow pattern |
| 2.1.0 | 2026-01-26 | Adopt "version first" workflow: update version → test → verify → release |
| 2.0.0 | 2026-01-14 | Refactor to universal guide, move project-specific content to CLAUDE.md |
| 1.0.0 | 2026-01-02 | Initial release workflow guide |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
