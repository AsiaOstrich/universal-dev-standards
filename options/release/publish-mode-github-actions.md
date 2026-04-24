# Release Option: GitHub Actions Publish Mode | GitHub Actions 發布模式

> **Language**: English | 繁體中文

**Parent Standard**: [Release Standards](../../.standards/release-standards.ai.yaml)

---

## Overview | 概述

GitHub Actions publish mode automates npm publishing through CI/CD. Instead of running `npm publish` locally, a GitHub Release creation event triggers the publish workflow, which uses an `NPM_TOKEN` repository secret to publish securely and reproducibly.

GitHub Actions 發布模式透過 CI/CD 自動化 npm 發布流程。不在本地執行 `npm publish`，而是透過建立 GitHub Release 觸發 publish workflow，使用儲存在 repository 的 `NPM_TOKEN` secret 進行安全且可重現的發布。

## When to Use | 適用場景

- npm packages hosted in GitHub repositories
- Projects with a `publish.yml` (or similar) GitHub Actions workflow
- Single-owner or small-team repos using GitHub Actions for CD
- Any project where `NPM_TOKEN` is stored as a GitHub repository secret

適用於：
- 託管在 GitHub 上的 npm 套件
- 有 `publish.yml` 或類似 GitHub Actions workflow 的專案
- 使用 GitHub Actions 做 CD 的個人或小型團隊 repo
- 將 `NPM_TOKEN` 存為 GitHub repository secret 的任何專案

## Release Finish Sequence | 發布完成流程

```
1. bump version      scripts/bump-version.sh vX.Y.Z   (or npm version X.Y.Z)
2. update CHANGELOG  add [X.Y.Z] section, clear [Unreleased]
3. commit + tag      git commit -m "chore: release vX.Y.Z"
                     git tag vX.Y.Z
4. push              git push origin main vX.Y.Z
5. create release    gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."
                     ↳ triggers publish.yml → npm publish (via NPM_TOKEN)
```

> **重要**：**不要**手動執行 `npm publish`。`gh release create` 是唯一的觸發點，GitHub Actions 負責實際的 npm 發布。

## Configuration | 設定

```yaml
# uds.project.yaml (or project config)
release:
  publish_mode: github-actions
  publish_trigger: gh_release_create
  tag_format: "v{semver}"
```

## Behavior | 行為說明

### Version Tagging | 版本標記

- Tag format: `vX.Y.Z` (e.g. `v5.2.0`)
- Push tag alongside commit: `git push origin main vX.Y.Z`
- GitHub Release title: same as tag (e.g. `v5.2.0`)

標籤格式為 `vX.Y.Z`。Tag 與 commit 一起推送。GitHub Release 標題與 tag 相同。

### GitHub Release Creation | 建立 GitHub Release

```bash
gh release create v5.2.0 --title "v5.2.0" --notes "$(cat <<'EOF'
## What's Changed
- Added: publish-mode-github-actions release option
- Fixed: Windows path separator in directory-mapper tests
EOF
)"
```

`gh release create` 會觸發 `release: published` 事件，啟動 publish workflow。

### npm Tag Mapping | npm Tag 對應

| Version Pattern | npm Tag |
|----------------|---------|
| `5.2.0` (stable) | `latest` |
| `5.2.0-beta.1` | `next` (or custom pre-release tag) |
| `5.2.0-alpha.1` | pre-release tag |

### Publish Workflow | 發布 Workflow

The publish workflow (`.github/workflows/publish.yml`) is triggered by `release: published` and runs `npm publish` using `NPM_TOKEN`:

```yaml
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Local Verification Before Release | 發布前本地驗證

```bash
npm test          # run full test suite
npm run build     # verify build succeeds (if applicable)
# verify package.json version matches intended tag
```

所有本地驗證通過後，才執行 `gh release create`。

## Example Output | 範例輸出

```
$ gh release create v5.2.0 --title "v5.2.0" --notes "..."
https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v5.2.0

# GitHub Actions publish.yml triggered automatically
# ✓ Workflow: publish.yml (release: published)
# ✓ npm publish → npmjs.org (latest tag)
```

## Comparison with Manual Mode | 與手動發布模式比較

| Feature | GitHub Actions Mode | Manual Mode | 說明 |
|---------|--------------------:|:-----------:|------|
| Publish command | Not run locally | `npm publish` | 發布指令 |
| Publish trigger | `gh release create` | Direct CLI call | 觸發方式 |
| NPM token location | GitHub secret | Local `.npmrc` / env | Token 位置 |
| Audit trail | GitHub Actions log | Terminal only | 稽核記錄 |
| Reproducibility | Full CI isolation | Local environment | 可重現性 |
| Release notes | GitHub Release page | None | 發布說明 |

## Related Options | 相關選項

- [Single Owner Push Mode](../push/single-owner-mode.md) — Reduced-friction push for personal repos

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
