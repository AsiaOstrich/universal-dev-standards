# Semantic Versioning Standard
# 語義化版本標準

**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Applicability**: All software projects with versioned releases
**適用範圍**: 所有有版本發布的軟體專案

---

## Purpose | 目的

This standard defines how to version software releases using Semantic Versioning (SemVer) to communicate changes clearly to users and maintainers.

本標準定義如何使用語義化版本 (SemVer) 為軟體發布編號，以清楚地向使用者和維護者傳達變更。

---

## Semantic Versioning Format | 語義化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

例如:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### Components | 組成元素

| Component | Purpose | When to Increment |
|-----------|---------|-------------------|
| **MAJOR** | Breaking changes | Incompatible API changes |
| **MINOR** | New features | Backward-compatible functionality |
| **PATCH** | Bug fixes | Backward-compatible bug fixes |
| **PRERELEASE** | Pre-release identifier | Alpha, beta, rc versions |
| **BUILD** | Build metadata | Build number, commit hash |

---

## Incrementing Rules | 遞增規則

### MAJOR Version (X.0.0)

**Increment when** | 遞增時機:
- Breaking API changes
- Removing deprecated features
- Major architecture changes
- Incompatible behavior changes

**Examples | 範例**:
```
1.9.5 → 2.0.0  # Remove deprecated API
3.2.1 → 4.0.0  # Change return type of public method
```

**Guidelines | 指引**:
- Reset MINOR and PATCH to 0
- Document migration guide
- Provide deprecation warnings in previous MINOR versions

---

### MINOR Version (x.Y.0)

**Increment when** | 遞增時機:
- Adding new features (backward-compatible)
- Deprecating features (not removing)
- Substantial internal improvements
- New public APIs

**Examples | 範例**:
```
2.3.5 → 2.4.0  # Add new API endpoint
1.12.0 → 1.13.0  # Add optional parameter to existing function
```

**Guidelines | 指引**:
- Reset PATCH to 0
- Existing functionality unchanged
- New features are opt-in

---

### PATCH Version (x.y.Z)

**Increment when** | 遞增時機:
- Bug fixes (no new features)
- Security patches
- Documentation corrections
- Internal refactoring (no API changes)

**Examples | 範例**:
```
3.1.2 → 3.1.3  # Fix null pointer exception
2.0.0 → 2.0.1  # Security vulnerability patch
```

**Guidelines | 指引**:
- No new functionality
- No API changes
- Safe to update immediately

---

## Pre-release Versions | 預發布版本

Format: `MAJOR.MINOR.PATCH-PRERELEASE`

### Pre-release Identifiers | 預發布識別碼

| Identifier | Purpose | Stability | Audience |
|------------|---------|-----------|----------|
| `alpha` | Early testing | Unstable | Internal team |
| `beta` | Feature complete | Mostly stable | Early adopters |
| `rc` (release candidate) | Final testing | Stable | Beta testers |

### Examples | 範例

```
1.0.0-alpha.1       # First alpha release
1.0.0-alpha.2       # Second alpha release
1.0.0-beta.1        # First beta release
1.0.0-beta.2        # Second beta release
1.0.0-rc.1          # Release candidate 1
1.0.0               # Stable release
```

### Ordering | 排序

Pre-releases are ordered lexicographically:
```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## Build Metadata | 建置元資料

Format: `MAJOR.MINOR.PATCH+BUILD`

### Examples | 範例

```
1.0.0+20250112            # Date-based build
2.3.1+001                 # Sequential build number
3.0.0+sha.5114f85         # Git commit hash
1.2.0-beta.1+exp.sha.5114f85  # Combined pre-release and build
```

### Guidelines | 指引

- Build metadata SHOULD NOT affect version precedence
- Use for CI/CD tracking
- Include in artifacts but not in version comparison

---

## Initial Development | 初始開發

### Version 0.x.x

```
0.1.0  # Initial development release
0.2.0  # Add features
0.3.0  # Add more features
...
1.0.0  # First stable release
```

**Guidelines | 指引**:
- Major version 0 indicates development phase
- API may change frequently
- Breaking changes allowed in MINOR versions
- Move to 1.0.0 when API is stable

---

## Version Lifecycle | 版本生命週期

### Example Release Cycle | 發布週期範例

```
Development Phase:
0.1.0 → 0.2.0 → 0.9.0

First Stable Release:
1.0.0

Feature Additions:
1.0.0 → 1.1.0 → 1.2.0

Bug Fixes:
1.2.0 → 1.2.1 → 1.2.2

Next Major Release:
1.2.2 → 2.0.0-alpha.1 → 2.0.0-beta.1 → 2.0.0-rc.1 → 2.0.0
```

---

## Changelog Integration | 變更日誌整合

### CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New feature X
- New API endpoint Y

### Changed
- Updated dependency Z to v3.0

### Deprecated
- Method A will be removed in v3.0

### Removed
- Old API endpoint B

### Fixed
- Bug fix for issue #123

### Security
- Security vulnerability patch

## [2.1.0] - 2025-11-12

### Added
- OAuth2 authentication support
- Email notification system

### Fixed
- Memory leak in user session cache

## [2.0.0] - 2025-10-01

### Changed
- **BREAKING**: User API response format

### Removed
- **BREAKING**: Deprecated v1 endpoints

## [1.5.2] - 2025-09-15

### Fixed
- Null pointer exception in payment module

[Unreleased]: https://github.com/user/repo/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/user/repo/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/user/repo/compare/v1.5.2...v2.0.0
[1.5.2]: https://github.com/user/repo/releases/tag/v1.5.2
```

---

## Version Tagging in Git | Git 版本標籤

### Creating Tags | 建立標籤

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0"

# Tag with detailed message
git tag -a v2.0.0 -m "Release version 2.0.0

Major changes:
- New authentication system
- Redesigned API
- Performance improvements"

# Push tag to remote
git push origin v1.2.0

# Push all tags
git push origin --tags
```

### Tag Naming Convention | 標籤命名慣例

```
v1.0.0          ✅ Recommended (with 'v' prefix)
1.0.0           ✅ Acceptable (without 'v')
version-1.0.0   ❌ Avoid (too verbose)
1.0             ❌ Avoid (incomplete version)
```

---

## Automation Tools | 自動化工具

### standard-version (Node.js)

```bash
# Install
npm install --save-dev standard-version

# Add to package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# Create release
npm run release              # Auto-increment based on commits
npm run release -- --release-as minor  # Force minor version
npm run release -- --release-as 2.0.0  # Specific version
```

### semantic-release (Node.js)

```bash
# Install
npm install --save-dev semantic-release

# Configure in .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

---

## Dependency Version Ranges | 依賴版本範圍

### npm (package.json)

```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exact version
    "patch": "~1.2.3",          // >=1.2.3 <1.3.0
    "minor": "^1.2.3",          // >=1.2.3 <2.0.0
    "range": ">=1.2.3 <2.0.0",  // Explicit range
    "latest": "*"               // ❌ Avoid - any version
  }
}
```

**Recommendations | 建議**:
- Use `^` for most dependencies (minor updates)
- Use `~` for conservative updates (patch only)
- Use exact versions for critical dependencies
- Never use `*` in production

---

### .NET (csproj)

```xml
<ItemGroup>
  <!-- Exact version -->
  <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />

  <!-- Minimum version -->
  <PackageReference Include="Microsoft.Extensions.Logging" Version="[8.0.0,)" />

  <!-- Version range -->
  <PackageReference Include="AutoMapper" Version="[12.0.0,13.0.0)" />
</ItemGroup>
```

---

## Breaking Change Communication | 破壞性變更溝通

### 1. Deprecation Warnings (N-1 Version)

```javascript
// Version 1.5.0 - Add deprecation warning
/**
 * @deprecated Use authenticateV2() instead. Will be removed in v2.0.0
 */
function authenticate(username, password) {
  console.warn('[DEPRECATED] authenticate() will be removed in v2.0.0. Use authenticateV2()');
  return authenticateV2(username, password);
}
```

### 2. Migration Guide (N Version)

```markdown
# Migration Guide: v1.x to v2.0

## Breaking Changes

### 1. authenticate() removed

**Before (v1.x)**:
```javascript
const token = await authenticate('user', 'pass');
```

**After (v2.0)**:
```javascript
const token = await authenticateV2({ username: 'user', password: 'pass' });
```

### 2. API response format changed

**Before (v1.x)**:
```json
{ "data": { "user": {...} } }
```

**After (v2.0)**:
```json
{ "user": {...} }
```

Update your code:
```javascript
// Before
const user = response.data.user;

// After
const user = response.user;
```
```

---

## Project Configuration | 專案設定

### Document in README.md

```markdown
## Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

### Version Format
`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

### Release Cycle
- **Major releases**: Annually (breaking changes)
- **Minor releases**: Quarterly (new features)
- **Patch releases**: As needed (bug fixes)

### Support Policy
- Latest major version: Full support
- Previous major version: Security fixes only (1 year)
- Older versions: No support

### Changelog
See [CHANGELOG.md](CHANGELOG.md) for release history.
```

---

## Version Comparison | 版本比較

### Precedence Rules | 優先級規則

```
1.0.0 < 2.0.0 < 2.1.0 < 2.1.1

1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0

1.0.0 < 1.0.0+001 (build metadata ignored in precedence)
```

### Comparison in Code | 程式碼中比較

```javascript
// JavaScript (using semver package)
const semver = require('semver');

semver.gt('1.2.3', '1.2.2');  // true
semver.satisfies('1.2.3', '^1.0.0');  // true
semver.major('2.3.1');  // 2
```

---

## Common Questions | 常見問題

### Q: When should I release 1.0.0?

**A**: When your API is stable and you're ready to commit to backward compatibility.

---

### Q: Should I bump MAJOR for internal breaking changes?

**A**: No, only for public API changes. Internal refactoring is PATCH or MINOR.

---

### Q: Can I skip versions?

**A**: Yes, but not recommended. Use sequential versioning for clarity.

---

### Q: How do I version libraries vs applications?

**A**:
- **Libraries**: Strictly follow SemVer (API matters)
- **Applications**: Can be more flexible (user experience matters)

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-12 | Initial versioning standard |

---

## References | 參考資料

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Calendar Versioning](https://calver.org/) (alternative scheme)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
