---
source: options/changelog/auto-generated.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 自动生成的 Changelog

> **语言**: [English](../../../../options/changelog/auto-generated.md) | 简体中文

**上层标准**: [Changelog Standards](../../core/changelog-standards.md)

---

## 概览

自动生成的 changelog 是使用解析 Conventional Commits 的工具，从 commit 历史自动创建而来。此做法可减少人工工作，并确保 commit 与 changelog 条目之间的一致性。

## 最适用于

- 使用 Conventional Commits 的项目
- CI/CD 自动化发行
- 频繁的发行周期
- 偏好自动化而非手动编辑的团队
- 含多个软件包的 Monorepo

## 先决条件

- 所有 commit 均采用 Conventional Commits 格式
- 一致的 commit message 结构
- CI/CD pipeline 集成

## 工具

| 工具 | 平台 | 命令 | 配置文件 |
|------|----------|---------|-------------|
| **conventional-changelog** | Node.js | `npx conventional-changelog -p angular -i CHANGELOG.md -s` | `.changelogrc` |
| **semantic-release** | Node.js | `npx semantic-release` | `.releaserc` |
| **git-cliff** | Rust | `git cliff -o CHANGELOG.md` | `cliff.toml` |
| **release-please** | GitHub Action | GitHub workflow | `release-please-config.json` |

## Commit 对应 Changelog

| Commit 类型 | Changelog 区段 |
|-------------|-------------------|
| `feat` | Added |
| `fix` | Fixed |
| `perf` | Changed |
| `refactor` | Changed |
| `docs` | Documentation |
| `chore` | Maintenance |
| `BREAKING CHANGE` | Breaking Changes |

## 配置示例

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

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| 使用 Conventional Commits | 将 commit 格式化以便正确解析 | Required |
| 使用 scope 进行分组 | scope 有助于将相关变更分组 | Recommended |
| BREAKING CHANGE footer | 为重大变更加上 footer | Required |
| 配置 CI/CD | 自动化 changelog 生成 | Recommended |

## 与手动方式的比较

| 方面 | 自动生成 | 手动（Keep a Changelog） |
|--------|---------------|---------------------------|
| 工作量 | 低（自动化） | 高（人工撰写） |
| 一致性 | 高（以模板为基础） | 不一（人工撰写） |
| 详细程度 | Commit 级别 | 功能级别（经整理） |
| 先决条件 | Conventional Commits | 无 |
| 最适用于 | 频繁发行 | 里程碑发行 |

## 工作流程集成

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

## 相关选项

- [Keep a Changelog](./keep-a-changelog.md) - 用于手动维护 changelog

---

## 参考资料

- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Git Cliff](https://git-cliff.org/)
- [Release Please](https://github.com/googleapis/release-please)

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
