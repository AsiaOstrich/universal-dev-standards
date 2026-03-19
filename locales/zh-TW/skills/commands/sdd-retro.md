---
source: ../../../../skills/commands/sdd-retro.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Create retroactive specs for untracked feat/fix commits
allowed-tools: Read, Write, Grep, Glob, Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(mkdir:*)
argument-hint: "[--since=<date> | --last=<N> | 自動掃描]"
---

# 追溯 Spec 產生器

> **Language**: [English](../../../../skills/commands/sdd-retro.md) | 繁體中文

為過去未追蹤 spec 的已提交變更，建立輕量規格文件。

## 工作流程

1. **掃描** — 搜尋 `git log` 中訊息不含 `Refs:` 的 `feat`/`fix` commits
2. **分組** — 依 scope 將相關 commits 聚類
3. **產生** — 使用標準 SDD 格式建立追溯規格，`Status: Draft`
4. **確認** — 在寫入 `docs/specs/` 前呈現給使用者審查

## 選項

| 選項 | 說明 |
|------|------|
| `--since=2026-01-01` | 僅掃描指定日期後的 commits |
| `--last=20` | 僅掃描最近 N 筆 commits |
| （無引數） | 掃描所有 feat/fix commits |

## 使用方式

```
/sdd-retro              # 掃描所有未追蹤的 commits
/sdd-retro --since=2026-01-01
/sdd-retro --last=10
```

## 參考

- SDD 工作流程：[sdd 指令](sdd.md)
- Commit 規範：[commit 指令](commit.md)
- 規格：[SPEC-011](../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)
