# Auto-Generated Changelog

> **Language**: English | [繁體中文](../../locales/zh-TW/options/changelog/auto-generated.md)

**Parent Standard**: [Changelog Standards](../../core/changelog-standards.md)

---

## Overview

Auto-generated changelogs are created automatically from commit history using tools that parse Conventional Commits. This approach reduces manual effort and ensures consistency between commits and changelog entries.

## Best For

- Projects using Conventional Commits
- CI/CD automated releases
- Frequent release cycles
- Teams preferring automation over manual editing
- Monorepos with multiple packages

## Prerequisites

- Conventional Commits format for all commits
- Consistent commit message structure
- CI/CD pipeline integration

## Tools

| Tool | Platform | Command | Config File |
|------|----------|---------|-------------|
| **conventional-changelog** | Node.js | `npx conventional-changelog -p angular -i CHANGELOG.md -s` | `.changelogrc` |
| **semantic-release** | Node.js | `npx semantic-release` | `.releaserc` |
| **git-cliff** | Rust | `git cliff -o CHANGELOG.md` | `cliff.toml` |
| **release-please** | GitHub Action | GitHub workflow | `release-please-config.json` |

## Commit to Changelog Mapping

| Commit Type | Changelog Section |
|-------------|-------------------|
| `feat` | Added |
| `fix` | Fixed |
| `perf` | Changed |
| `refactor` | Changed |
| `docs` | Documentation |
| `chore` | Maintenance |
| `BREAKING CHANGE` | Breaking Changes |

## Example Configuration

### conventional-changelog

```json
// .changelogrc
{
  "preset": "angular",
  "releaseCount": 0
}
```

### git-cliff

```toml
# cliff.toml
[changelog]
header = "# Changelog\n\n"
body = """
{% for group, commits in commits | group_by(attribute="group") %}
### {{ group | upper_first }}
{% for commit in commits %}
- {{ commit.message | upper_first }}
{%- endfor %}
{% endfor %}
"""
```

### semantic-release

```json
// .releaserc
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Use Conventional Commits | Format commits for proper parsing | Required |
| Use scope for grouping | Scope helps group related changes | Recommended |
| BREAKING CHANGE footer | Add footer for breaking changes | Required |
| Configure CI/CD | Automate changelog generation | Recommended |

## Comparison with Manual

| Aspect | Auto-Generated | Manual (Keep a Changelog) |
|--------|---------------|---------------------------|
| Effort | Low (automated) | High (manual writing) |
| Consistency | High (template-based) | Varies (human written) |
| Detail Level | Commit-level | Feature-level (curated) |
| Prerequisites | Conventional Commits | None |
| Best For | Frequent releases | Milestone releases |

## Workflow Integration

```yaml
# GitHub Actions example
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        run: npx conventional-changelog -p angular -i CHANGELOG.md -s

      - name: Commit Changelog
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add CHANGELOG.md
          git commit -m "docs: update changelog" || true
          git push
```

## Related Options

- [Keep a Changelog](./keep-a-changelog.md) - For manual changelog maintenance

---

## References

- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Git Cliff](https://git-cliff.org/)
- [Release Please](https://github.com/googleapis/release-please)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
