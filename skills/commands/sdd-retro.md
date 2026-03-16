---
description: [UDS] Create retroactive specs for untracked feat/fix commits
allowed-tools: Read, Write, Grep, Glob, Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(mkdir:*)
argument-hint: "[--since=<date> | --last=<N> | 自動掃描]"
---

# Retroactive Spec Generator | 追溯 Spec 產生器

Create lightweight specification documents for past changes that were committed without spec tracking.

為過去未追蹤 spec 的已提交變更，建立輕量規格文件。

## When to Use | 使用時機

- After emergency hotfixes that skipped the `/sdd` workflow
- To document accumulated feat/fix commits that lack spec references
- During project audits or release preparation

## Workflow | 工作流程

1. **Scan** — Search `git log` for `feat` and `fix` commits without `Refs: SPEC-` in their message
2. **Group** — Cluster related commits by scope or feature area
3. **Generate** — Create retroactive spec templates with data extracted from commits
4. **Confirm** — Present specs to user for review before writing
5. **Write** — Save confirmed specs to `docs/specs/retro/`

## Scan Criteria | 掃描條件

```
git log --oneline --all --grep="^feat" --grep="^fix" --extended-regexp
```

Filter out commits that already contain `Refs: SPEC-` in the full message body.

### Options | 選項

| Option | Description | 說明 |
|--------|-------------|------|
| `--since=2026-01-01` | Only scan commits after date | 僅掃描指定日期後的 commits |
| `--last=20` | Only scan last N commits | 僅掃描最近 N 筆 commits |
| (no args) | Scan all feat/fix commits | 掃描所有 feat/fix commits |

## Retroactive Spec Template | 追溯 Spec 模板

Generate specs using this simplified template:

```markdown
# Retroactive: [Feature/Fix Name]

> **Status**: Archived
> **Type**: retroactive
> **Date**: YYYY-MM-DD
> **Commits**: [SHA list with links]

---

## Change Summary | 變更摘要

[Auto-extracted from commit messages]

## Impact Assessment | 影響評估

| Metric | Value |
|--------|-------|
| Files modified | N |
| Lines changed | +X / -Y |
| New tests added | Yes / No |
| Breaking changes | Yes / No |

## Related Commits | 相關 Commits

| SHA | Type | Message |
|-----|------|---------|
| abc1234 | feat | Add feature X |
| def5678 | fix | Fix edge case in X |
```

## Output Directory | 輸出目錄

Retroactive specs are written to `docs/specs/retro/`:

```
docs/specs/retro/
├── RETRO-001-feature-name.md
├── RETRO-002-bugfix-name.md
└── ...
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/sdd-retro` | Scan all untracked commits | 掃描所有未追蹤 commits |
| `/sdd-retro --since=2026-01-01` | Scan commits since date | 掃描指定日期後 commits |
| `/sdd-retro --last=10` | Scan last 10 commits | 掃描最近 10 筆 commits |

## Example Output | 輸出範例

```
Scanning git history for untracked feat/fix commits...

Found 5 untracked commits:

Group 1: CLI Config Enhancement
  - abc1234 feat(cli): add config subcommand
  - def5678 fix(cli): resolve config path issue
  → Suggested spec: RETRO-001-cli-config-enhancement.md

Group 2: Translation System
  - 111aaaa feat(i18n): add zh-TW support
  → Suggested spec: RETRO-002-translation-system.md

Generate retroactive specs? [Y/n]
```

## Reference | 參考

- SDD workflow: [sdd command](sdd.md)
- Commit standards: [commit command](commit.md)
- Spec: [SPEC-011](../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)
