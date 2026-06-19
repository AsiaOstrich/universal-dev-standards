---
source: options/changelog/auto-generated.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 自動產生的 Changelog

> **語言**: [English](../../../../options/changelog/auto-generated.md) | 繁體中文

**上層標準**: [Changelog Standards](../../core/changelog-standards.md)

---

## 概觀

自動產生的 changelog 是使用解析 Conventional Commits 的工具，從 commit 歷史自動建立而來。此做法可減少人工作業，並確保 commit 與 changelog 條目之間的一致性。

## 最適用於

- 使用 Conventional Commits 的專案
- CI/CD 自動化發行
- 頻繁的發行週期
- 偏好自動化而非手動編輯的團隊
- 含多個套件的 Monorepo

## 先決條件

- 所有 commit 均採用 Conventional Commits 格式
- 一致的 commit message 結構
- CI/CD pipeline 整合

## 工具

| 工具 | 平台 | 命令 | 設定檔 |
|------|----------|---------|-------------|
| **conventional-changelog** | Node.js | `npx conventional-changelog -p angular -i CHANGELOG.md -s` | `.changelogrc` |
| **semantic-release** | Node.js | `npx semantic-release` | `.releaserc` |
| **git-cliff** | Rust | `git cliff -o CHANGELOG.md` | `cliff.toml` |
| **release-please** | GitHub Action | GitHub workflow | `release-please-config.json` |

## Commit 對應 Changelog

| Commit 類型 | Changelog 區段 |
|-------------|-------------------|
| `feat` | Added |
| `fix` | Fixed |
| `perf` | Changed |
| `refactor` | Changed |
| `docs` | Documentation |
| `chore` | Maintenance |
| `BREAKING CHANGE` | Breaking Changes |

## 設定範例

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

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| 使用 Conventional Commits | 將 commit 格式化以便正確解析 | Required |
| 使用 scope 進行分組 | scope 有助於將相關變更分組 | Recommended |
| BREAKING CHANGE footer | 為重大變更加上 footer | Required |
| 設定 CI/CD | 自動化 changelog 產生 | Recommended |

## 與手動方式的比較

| 面向 | 自動產生 | 手動（Keep a Changelog） |
|--------|---------------|---------------------------|
| 工作量 | 低（自動化） | 高（人工撰寫） |
| 一致性 | 高（以範本為基礎） | 不一（人工撰寫） |
| 詳細程度 | Commit 層級 | 功能層級（經整理） |
| 先決條件 | Conventional Commits | 無 |
| 最適用於 | 頻繁發行 | 里程碑發行 |

## 工作流程整合

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

## 相關選項

- [Keep a Changelog](./keep-a-changelog.md) - 用於手動維護 changelog

---

## 參考資料

- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Git Cliff](https://git-cliff.org/)
- [Release Please](https://github.com/googleapis/release-please)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
