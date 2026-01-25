# [PUBLISH-00] npm Release Specification / npm 發布規格

**Version**: 1.0.0
**Last Updated**: 2026-01-25
**Status**: Approved
**Spec ID**: PUBLISH-00

---

## Summary

This specification defines the automated npm release process for the UDS CLI package. The system handles version type detection, npm tag assignment, pre-release validation, and GitHub Actions integration for automated publishing.

本規格定義 UDS CLI 套件的自動化 npm 發布流程。該系統處理版本類型偵測、npm 標籤分配、發布前驗證，以及與 GitHub Actions 整合的自動發布。

---

## Motivation

### Problem Statement / 問題陳述

1. Manual npm publishing is error-prone (wrong tags, missing validations)
2. Version type detection requires consistent regex patterns
3. Pre-release checks must all pass before publishing
4. Rollback procedures need standardization

### Solution / 解決方案

An automated release system that:
- Automatically detects version type from `package.json`
- Assigns correct npm dist-tag (`@latest`, `@beta`, `@alpha`, `@rc`)
- Runs comprehensive pre-release checks via CI/CD
- Provides rollback mechanisms for failed releases

---

## Detailed Design

### Source Files

| File | Purpose |
|------|---------|
| `.github/workflows/publish.yml` | GitHub Actions workflow |
| `cli/package.json` | Version source of truth |
| `scripts/pre-release-check.sh` | Pre-release validation script |

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      npm Release Automation                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TRIGGER                                                            │
│  └── GitHub Release created with tag vX.Y.Z[-prerelease]          │
│                                                                     │
│  VERSION DETECTION                                                  │
│  └── Regex patterns on package.json version                        │
│       ├── X.Y.Z-beta.N  → tag: @beta                               │
│       ├── X.Y.Z-alpha.N → tag: @alpha                              │
│       ├── X.Y.Z-rc.N    → tag: @rc                                 │
│       └── X.Y.Z         → tag: @latest                             │
│                                                                     │
│  PRE-RELEASE CHECKS (7 checks)                                      │
│  ├── 1. Git working directory clean                                │
│  ├── 2. Version sync across 6 files                                │
│  ├── 3. Standards sync                                             │
│  ├── 4. Translation sync                                           │
│  ├── 5. Install scripts sync                                       │
│  ├── 6. Linting passes                                             │
│  └── 7. All tests pass                                             │
│                                                                     │
│  PUBLISH                                                            │
│  └── npm publish --tag <detected-tag>                              │
│                                                                     │
│  VERIFICATION                                                       │
│  └── npm view universal-dev-standards dist-tags                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Version Type Detection

```javascript
// Version regex patterns
const VERSION_PATTERNS = {
  beta: /-beta\.\d+$/,
  alpha: /-alpha\.\d+$/,
  rc: /-rc\.\d+$/,
  stable: /^\d+\.\d+\.\d+$/
};

function detectVersionType(version) {
  if (VERSION_PATTERNS.beta.test(version)) return 'beta';
  if (VERSION_PATTERNS.alpha.test(version)) return 'alpha';
  if (VERSION_PATTERNS.rc.test(version)) return 'rc';
  return 'latest';
}
```

### Version Files (UDS-Specific)

The following 6 files must be synchronized for each release:

| File | Field | Required For |
|------|-------|--------------|
| `cli/package.json` | `"version"` | All releases |
| `cli/standards-registry.json` | `"version"` (3 places) | All releases |
| `.claude-plugin/plugin.json` | `"version"` | All releases |
| `.claude-plugin/marketplace.json` | `"version"` | All releases |
| `README.md` | `**Version**:` | Stable releases only |

### npm dist-tag Strategy

| Version Pattern | npm Tag | Install Command |
|-----------------|---------|-----------------|
| `X.Y.Z` | `latest` | `npm install universal-dev-standards` |
| `X.Y.Z-beta.N` | `beta` | `npm install universal-dev-standards@beta` |
| `X.Y.Z-alpha.N` | `alpha` | `npm install universal-dev-standards@alpha` |
| `X.Y.Z-rc.N` | `rc` | `npm install universal-dev-standards@rc` |

### Pre-release Check Script

```bash
#!/bin/bash
# scripts/pre-release-check.sh

echo "=== Pre-release Checks ==="

# 1. Git working directory
if [[ -n $(git status --porcelain) ]]; then
  echo "ERROR: Uncommitted changes detected"
  exit 1
fi

# 2. Version sync
./scripts/check-version-sync.sh || exit 1

# 3. Standards sync
./scripts/check-standards-sync.sh || exit 1

# 4. Translation sync
./scripts/check-translation-sync.sh || exit 1

# 5. Install scripts sync
./scripts/check-install-scripts-sync.sh || exit 1

# 6. Linting
cd cli && npm run lint || exit 1

# 7. Tests
npm test || exit 1

echo "=== All checks passed ==="
```

### GitHub Actions Workflow

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: cd cli && npm ci

      - name: Run pre-release checks
        run: ./scripts/pre-release-check.sh

      - name: Detect version type
        id: version
        run: |
          VERSION=$(node -p "require('./cli/package.json').version")
          if [[ $VERSION =~ -beta\. ]]; then TAG=beta
          elif [[ $VERSION =~ -alpha\. ]]; then TAG=alpha
          elif [[ $VERSION =~ -rc\. ]]; then TAG=rc
          else TAG=latest
          fi
          echo "tag=$TAG" >> $GITHUB_OUTPUT
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Publish to npm
        run: cd cli && npm publish --tag ${{ steps.version.outputs.tag }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Verify publication
        run: npm view universal-dev-standards dist-tags
```

### Rollback Procedures

#### Wrong npm Tag

```bash
npm dist-tag add universal-dev-standards@<version> <correct-tag>
```

#### Need to Deprecate

```bash
npm deprecate universal-dev-standards@<version> "Please use <new-version> instead"
```

#### Unpublish (within 72 hours)

```bash
npm unpublish universal-dev-standards@<version>
```

---

## Acceptance Criteria

### AC-1: Automatic Version Type Detection

**Given** a version string from `package.json`
**When** version type detection is performed
**Then**
  - `3.2.1-beta.1` → detected as `beta`, tag `@beta`
  - `3.2.1-alpha.5` → detected as `alpha`, tag `@alpha`
  - `3.2.1-rc.2` → detected as `rc`, tag `@rc`
  - `3.2.1` → detected as `stable`, tag `@latest`
  - `3.2.0` → detected as `stable`, tag `@latest`

### AC-2: Correct npm Tag Assignment

**Given** a detected version type
**When** npm publish is executed
**Then**
  - Beta versions are published with `--tag beta`
  - Alpha versions are published with `--tag alpha`
  - RC versions are published with `--tag rc`
  - Stable versions are published with `--tag latest`
  - `npm view universal-dev-standards dist-tags` shows correct assignment

### AC-3: Pre-release Checks All Pass Before Publish

**Given** a release is triggered
**When** the publish workflow runs
**Then**
  - All 7 pre-release checks must pass
  - If any check fails, publish is aborted
  - Failure reason is clearly reported
  - No partial publish state

### AC-4: Rollback Mechanism Works Correctly

**Given** a published release needs to be reverted
**When** rollback procedures are executed
**Then**
  - `npm dist-tag add` successfully reassigns tags
  - `npm deprecate` marks version as deprecated
  - `npm unpublish` removes version (if within 72h window)
  - Users are notified via deprecation message

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| GitHub Actions | CI/CD automation |
| npm registry | Package publication |
| Node.js 20+ | Runtime for publish script |
| Bash scripts | Pre-release validation |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Wrong tag assignment | Low | High | Automated detection + verification |
| Pre-release check bypass | Low | High | Required CI/CD step |
| npm token leak | Low | Critical | GitHub Secrets, rotation |
| Partial publish failure | Low | Medium | Atomic workflow steps |

---

## Related Specifications

- [Release Workflow Guide](../../../../skills/claude-code/release-standards/release-workflow.md) - High-level release process
- [Semantic Versioning](../../../../skills/claude-code/release-standards/semantic-versioning.md) - Version numbering rules
- [Changelog Format](../../../../skills/claude-code/release-standards/changelog-format.md) - CHANGELOG standards

---

## Implementation Notes

### Required Secrets

| Secret | Purpose | Rotation |
|--------|---------|----------|
| `NPM_TOKEN` | npm publish authentication | Annually |

### Manual Override

In exceptional cases, manual publish is possible:

```bash
# Ensure all checks pass first
./scripts/pre-release-check.sh

# Manual publish with explicit tag
cd cli
npm publish --tag beta  # or latest, alpha, rc
```

### Post-publish Verification

```bash
# Check dist-tags
npm view universal-dev-standards dist-tags

# Test installation
npm install -g universal-dev-standards@<version>
uds --version
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
