# Semantic Versioning Standard

> **Language**: English | [繁體中文](../locales/zh-TW/core/versioning.md)

**Version**: 1.2.0
**Last Updated**: 2025-12-30
**Applicability**: All software projects with versioned releases
**Scope**: universal
**Industry Standards**: Semantic Versioning 2.0.0
**References**: [semver.org](https://semver.org/)

---

## Purpose

This standard defines how to version software releases using Semantic Versioning (SemVer) to communicate changes clearly to users and maintainers.

---

## Semantic Versioning Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### Components

| Component | Purpose | When to Increment |
|-----------|---------|-------------------|
| **MAJOR** | Breaking changes | Incompatible API changes |
| **MINOR** | New features | Backward-compatible functionality |
| **PATCH** | Bug fixes | Backward-compatible bug fixes |
| **PRERELEASE** | Pre-release identifier | Alpha, beta, rc versions |
| **BUILD** | Build metadata | Build number, commit hash |

---

## Incrementing Rules

### MAJOR Version (X.0.0)

**Increment when**:
- Breaking API changes
- Removing deprecated features
- Major architecture changes
- Incompatible behavior changes

**Examples**:
```
1.9.5 → 2.0.0  # Remove deprecated API
3.2.1 → 4.0.0  # Change return type of public method
```

**Guidelines**:
- Reset MINOR and PATCH to 0
- Document migration guide
- Provide deprecation warnings in previous MINOR versions

---

### MINOR Version (x.Y.0)

**Increment when**:
- Adding new features (backward-compatible)
- Deprecating features (not removing)
- Substantial internal improvements
- New public APIs

**Examples**:
```
2.3.5 → 2.4.0  # Add new API endpoint
1.12.0 → 1.13.0  # Add optional parameter to existing function
```

**Guidelines**:
- Reset PATCH to 0
- Existing functionality unchanged
- New features are opt-in

---

### PATCH Version (x.y.Z)

**Increment when**:
- Bug fixes (no new features)
- Security patches
- Documentation corrections
- Internal refactoring (no API changes)

**Examples**:
```
3.1.2 → 3.1.3  # Fix null pointer exception
2.0.0 → 2.0.1  # Security vulnerability patch
```

**Guidelines**:
- No new functionality
- No API changes
- Safe to update immediately

---

## Pre-release Versions

Format: `MAJOR.MINOR.PATCH-PRERELEASE`

### Pre-release Identifiers

| Identifier | Purpose | Stability | Audience |
|------------|---------|-----------|----------|
| `alpha` | Early testing | Unstable | Internal team |
| `beta` | Feature complete | Mostly stable | Early adopters |
| `rc` (release candidate) | Final testing | Stable | Beta testers |

### Examples

```
1.0.0-alpha.1       # First alpha release
1.0.0-alpha.2       # Second alpha release
1.0.0-beta.1        # First beta release
1.0.0-beta.2        # Second beta release
1.0.0-rc.1          # Release candidate 1
1.0.0               # Stable release
```

### Ordering

Pre-releases are ordered lexicographically:
```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## Build Metadata

Format: `MAJOR.MINOR.PATCH+BUILD`

### Examples

```
1.0.0+20250112            # Date-based build
2.3.1+001                 # Sequential build number
3.0.0+sha.5114f85         # Git commit hash
1.2.0-beta.1+exp.sha.5114f85  # Combined pre-release and build
```

### Guidelines

- Build metadata SHOULD NOT affect version precedence
- Use for CI/CD tracking
- Include in artifacts but not in version comparison

---

## Initial Development

### Version 0.x.x

```
0.1.0  # Initial development release
0.2.0  # Add features
0.3.0  # Add more features
...
1.0.0  # First stable release
```

**Guidelines**:
- Major version 0 indicates development phase
- API may change frequently
- Breaking changes allowed in MINOR versions
- Move to 1.0.0 when API is stable

---

## Version Lifecycle

### Example Release Cycle

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

## Changelog Integration

> **See Also**: For comprehensive CHANGELOG writing guidelines, format templates, and examples, see [changelog-standards.md](changelog-standards.md).

### CHANGELOG.md Quick Reference

CHANGELOG files should follow the [Keep a Changelog](https://keepachangelog.com/) format with these categories:

| Category | Use For |
|----------|---------|
| `Added` | New features |
| `Changed` | Changes to existing functionality |
| `Deprecated` | Features to be removed in future |
| `Removed` | Removed features |
| `Fixed` | Bug fixes |
| `Security` | Security vulnerability patches |

**Breaking Changes**: Prefix with `**BREAKING**:` to ensure visibility.

For complete format templates and examples, refer to [changelog-standards.md](changelog-standards.md).

### Exclusion Rules

CHANGELOG should NOT record the following types of changes:

#### 1. Directories Excluded by `.gitignore`

Directories excluded from version control will not be committed, so they should not be recorded in CHANGELOG.

**Principle**: Any directories or files listed in the project's `.gitignore` should not be recorded in CHANGELOG.

**Common Exclusion Categories (Examples)**:

| Category | Common Directories/Files | Reason |
|----------|-------------------------|--------|
| AI Collaboration Tools | `.claude/`, `.cursor/`, `.ai/` | Local development aids, not in version control |
| Development Standards | `.standards/`, `docs/internal/` | Local standard docs, not in version control |
| Build Outputs | `dist/`, `build/`, `out/` | Build artifacts, not in version control |
| Large Data | `data/`, `datasets/` | Data files, not in version control |

**Verification Method**:

**macOS / Linux:**
```bash
# Before generating CHANGELOG, check project's .gitignore exclusions
cat .gitignore | grep -E "^[^#*]" | head -20
```

**Windows PowerShell:**
```powershell
# Before generating CHANGELOG, check project's .gitignore exclusions
Get-Content .gitignore | Where-Object { $_ -match "^[^#*]" } | Select-Object -First 20
```

**Note**: Each project should determine exclusions based on its own `.gitignore` settings. The table above is just a common example.

#### 2. Build Artifacts and Temporary Files

The following types of changes should also not be recorded:

- `bin/`, `obj/`, `Release/`, `Debug/` and other build outputs
- `*.log`, `*.tmp` and other temporary files
- `node_modules/`, `packages/` and other dependency directories

#### 3. Environment and Configuration Files (Sensitive Data)

Files containing sensitive data should not be recorded:

- `*.env`, `.env.*` environment variable files
- `*.local.json`, `*.local.yaml` local configuration files (e.g., .NET's `appsettings.*.local.json`)
- `*.pem`, `*.key`, `*.p12` key and certificate files
- `credentials.*`, `secrets.*` credential files

### Best Practice

When generating CHANGELOG, follow this process:

1. **List changed commits**

   **macOS / Linux / Windows (Git):**
   ```bash
   git log main..HEAD --oneline
   ```

2. **Exclude commits that don't need recording**
   - Commits containing "gitignore", "version control", or "misc(version control)" types
   - Commits that only modify excluded directories

3. **Categorize records**
   - Only record actual code or documentation changes that will be committed to the repository
   - Ensure all recorded file paths exist in the repository

4. **Verify records**

   **macOS / Linux:**
   ```bash
   # Verify that recorded paths exist in the repository
   git ls-files | grep -E "path/to/file"
   ```

   **Windows PowerShell:**
   ```powershell
   # Verify that recorded paths exist in the repository
   git ls-files | Select-String -Pattern "path/to/file"
   ```

---

## Release Process

### Overview

The complete Release process includes 5 phases:

1. **Pre-release Diagnosis** - Mandatory
2. **Environment Preparation**
3. **Package Generation**
4. **Deployment Execution**
5. **Post-release Verification**

### Phase 1: Pre-release Diagnosis - Mandatory

**Purpose**: Assess the target server's environment status before generating the upgrade package

**Check Items**:
- System tool versions
- Required drivers
- Disk space
- Database connectivity
- Application version
- Configuration completeness

**Pass Conditions** (Quality Gate):
- All required tools installed
- Sufficient disk space (at least 500MB)
- Database connection normal
- No system-level errors

**Failure Handling**:
- If diagnosis fails, execute Environment Preparation (Phase 2)
- Re-execute diagnosis after fixes
- Must not skip diagnosis and proceed directly to packaging

---

### Phase 2: Environment Preparation

**Purpose**: Install missing tools and drivers according to diagnosis report results

**Verification Standards**:
- All diagnosis items passed
- Database connection test successful
- Verification tools show no errors

---

### Phase 3: Package Generation

**Purpose**: Generate upgrade package containing the latest version

**Execution Steps**:
```bash
# 1. Confirm current branch and version
git branch
git describe --tags

# 2. Generate upgrade package (using project-provided packaging script)
./tools/generate-upgrade-package.sh -v v1.2.1 -o ./dist

# 3. Verify upgrade package contents
tar -tzf dist/upgrade-package-*.tar.gz | head -20
```

#### Upgrade Package Naming

**Format**: `{PROJECT}-upgrade-v{VERSION}-{DATE}.tar.gz`

| Element | Description | Examples |
|---------|-------------|----------|
| `{PROJECT}` | Project name (replace with actual project name) | `my-app`, `api-server` |
| `{VERSION}` | Version number (consistent with Git tag) | `1.2.1`, `2.0.0-beta.1` |
| `{DATE}` | Packaging date (YYYYMMDD) | `20251128` |

**Examples** (replace `{PROJECT}` with your project name):
```
{PROJECT}-upgrade-v1.2.1-20251127.tar.gz
{PROJECT}-upgrade-v2.0.0-beta.1-20251201.tar.gz
```

---

### Phase 4: Deployment Execution

**Purpose**: Execute upgrade on target server

**Execution Steps**:
```bash
# 1. Upload upgrade package to target server
scp upgrade-package-*.tar.gz user@target:/tmp/

# 2. Extract upgrade package
cd /tmp
tar -xzf upgrade-package-*.tar.gz
cd upgrade-package-*/

# 3. Dry-run test (strongly recommended)
sudo ./upgrade.sh --dry-run

# 4. Actual upgrade
sudo ./upgrade.sh
```

**Deployment Verification**:
- Backup created
- Service stopped successfully
- Files deployed successfully
- Schema migration successful (if applicable)
- Service started successfully

---

### Phase 5: Post-release Verification

**Purpose**: Confirm upgrade success and application running normally

**Check Items**:
```bash
# 1. Check service status
systemctl status your-service

# 2. Check application version
curl http://localhost:PORT/api/version

# 3. Check logs for no errors
tail -100 /path/to/app.log | grep -i error
```

**Success Criteria**:
- Service running normally
- API returns correct version number
- No fatal errors in logs
- Functionality verification passed

---

### Release Checklist

**Pre-release (Diagnosis and Preparation)**:
- [ ] Execute server diagnosis
- [ ] Diagnosis report passes all check items
- [ ] Environment preparation completed (if missing)
- [ ] Environment verification tools passed

**Release (Packaging and Deployment)**:
- [ ] Upgrade package generated successfully
- [ ] Upgrade package contents verified
- [ ] Dry-run test no anomalies
- [ ] Backup plan prepared
- [ ] Rollback plan prepared

**Post-release (Verification and Monitoring)**:
- [ ] Service started successfully
- [ ] Version number correct
- [ ] Functionality verification passed
- [ ] No anomalies in logs

---

### Quality Gates

The following checkpoints **must pass**, otherwise cannot proceed to next phase:

| Phase | Gate | Failure Handling |
|-------|------|------------------|
| **Diagnosis** | Diagnosis report no errors | Environment preparation |
| **Preparation** | Verification tools passed | Fix and re-verify |
| **Packaging** | Upgrade package structure complete | Re-package |
| **Deployment** | Dry-run no anomalies | Analyze logs and fix |
| **Verification** | Service running normally | Rollback |

---

### Rollback Plan

If upgrade fails, execute the following rollback steps:

```bash
# 1. Stop service
sudo systemctl stop your-service

# 2. Restore backup
BACKUP_PATH="/path/to/backup-$(date +%Y%m%d)"
sudo rm -rf /path/to/app
sudo mv "$BACKUP_PATH" /path/to/app

# 3. Restart service
sudo systemctl start your-service

# 4. Verify rollback success
sudo systemctl status your-service
```

---

### Compliance

**Mandatory Requirements**:
- Must not skip diagnosis phase
- Must not skip dry-run test
- Must retain diagnosis report
- Must prepare rollback plan

**Audit Trail**:
- All Release documentation retained for at least 12 months
- Diagnosis report associated with Git Tag
- Upgrade logs preserved completely

---

## Version Tagging in Git

### Creating Tags

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

### Tag Naming Convention

```
v1.0.0          ✅ Recommended (with 'v' prefix)
1.0.0           ✅ Acceptable (without 'v')
version-1.0.0   ❌ Avoid (too verbose)
1.0             ❌ Avoid (incomplete version)
```

---

## Automation Tools

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

## Dependency Version Ranges

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

**Recommendations**:
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

## Breaking Change Communication

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

### 2. API Versioning Strategies

Choose an API versioning strategy based on your needs:

| Strategy | Format | Pros | Cons |
|----------|--------|------|------|
| URL Path | `/api/v1/users` | Clear, easy routing | URL pollution |
| Query Parameter | `/api/users?version=1` | Optional versioning | Cache issues |
| Header | `Accept: application/vnd.api.v1+json` | Clean URLs | Less visible |
| Content Negotiation | `Accept: application/vnd.api+json;version=1` | RESTful | Complex |

**Recommended**: URL Path versioning for most APIs (clearest for developers).

### 3. Deprecation Timeline

Follow this timeline when deprecating API features:

```
v1.0.0 - Feature introduced
v1.5.0 - Deprecation warning added (minimum N-1 version)
v2.0.0 - Feature removed (document in migration guide)
```

**Deprecation Period Guidelines**:

| API Type | Minimum Deprecation Period |
|----------|---------------------------|
| Internal API | 1 minor version |
| Partner API | 2 minor versions + 3 months |
| Public API | 2 minor versions + 6 months |
| Critical Infrastructure | 1 year minimum |

### 4. Backward Compatibility Checklist

Before releasing, verify these backward compatibility rules:

**DO NOT break (without major version bump)**:
- [ ] Remove public API endpoints
- [ ] Remove required request fields
- [ ] Add required request fields
- [ ] Change response field types
- [ ] Change error code meanings
- [ ] Remove response fields consumers depend on

**Safe changes (minor/patch version)**:
- [ ] Add optional request fields
- [ ] Add new response fields
- [ ] Add new endpoints
- [ ] Add new error codes
- [ ] Improve error messages
- [ ] Performance improvements

### 5. Migration Guide (N Version)

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

## Project Configuration

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

## Version Comparison

### Precedence Rules

```
1.0.0 < 2.0.0 < 2.1.0 < 2.1.1

1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0

1.0.0 < 1.0.0+001 (build metadata ignored in precedence)
```

### Comparison in Code

```javascript
// JavaScript (using semver package)
const semver = require('semver');

semver.gt('1.2.3', '1.2.2');  // true
semver.satisfies('1.2.3', '^1.0.0');  // true
semver.major('2.3.1');  // 2
```

---

## Common Questions

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

## Related Standards

- [Changelog Standards](changelog-standards.md)
- [Git Workflow Standards](git-workflow.md)
- [Commit Message Guide](commit-message-guide.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2025-12-30 | Added: API Versioning Strategies, Deprecation Timeline, Backward Compatibility Checklist |
| 1.1.3 | 2025-12-24 | Added: Related Standards section |
| 1.1.2 | 2025-12-11 | Improved: Upgrade package naming example to use generic placeholders instead of hardcoded project names |
| 1.1.1 | 2025-12-04 | Refactored: CHANGELOG exclusion rules to be more generic (removed project-specific directories) |
| 1.1.0 | 2025-12-04 | Added: CHANGELOG exclusion rules, Release Process section |
| 1.0.0 | 2025-11-12 | Initial versioning standard |

---

## References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Calendar Versioning](https://calver.org/) (alternative scheme)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
