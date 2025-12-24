# Semantic Versioning Guide

## Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
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

## MAJOR Version (X.0.0)

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

## MINOR Version (x.Y.0)

**Increment when**:
- Adding new features (backward-compatible)
- Deprecating features (not removing)
- Substantial internal improvements
- New public APIs

**Examples**:
```
2.3.5 → 2.4.0  # Add new API endpoint
1.12.0 → 1.13.0  # Add optional parameter
```

**Guidelines**:
- Reset PATCH to 0
- Existing functionality unchanged
- New features are opt-in

---

## PATCH Version (x.y.Z)

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

### Identifiers

| Identifier | Purpose | Stability | Audience |
|------------|---------|-----------|----------|
| `alpha` | Early testing | Unstable | Internal team |
| `beta` | Feature complete | Mostly stable | Early adopters |
| `rc` | Final testing | Stable | Beta testers |

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

```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## Build Metadata

### Examples

```
1.0.0+20250112            # Date-based build
2.3.1+001                 # Sequential build number
3.0.0+sha.5114f85         # Git commit hash
```

**Note**: Build metadata does NOT affect version precedence.

---

## Initial Development (0.x.x)

```
0.1.0  # Initial development release
0.2.0  # Add features
0.9.0  # Approaching stability
1.0.0  # First stable release
```

**Guidelines**:
- Major version 0 indicates development phase
- API may change frequently
- Breaking changes allowed in MINOR versions
- Move to 1.0.0 when API is stable

---

## Version Lifecycle Example

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

## Git Tagging

### Creating Tags

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0"

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

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
