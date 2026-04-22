---
source: ../../../../skills/commands/sdd-retro.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

---
description: [UDS] Create retroactive specs for untracked feat/fix commits
allowed-tools: Read, Write, Grep, Glob, Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(mkdir:*)
argument-hint: "[--since=<date> | --last=<N> | 自动扫描]"
---

# Retroactive Spec Generator | 追溯 Spec 生成器

Create lightweight specification documents for past changes that were committed without spec tracking.

为过去未追踪 spec 的已提交变更，创建轻量规格文件。

## Workflow | 工作流程

1. **扫描** — 在 `git log` 中搜索消息中没有 `Refs:` 的 `feat`/`fix` commits
2. **分组** — 按 scope 将相关 commits 聚类
3. **生成** — 使用标准 SDD 格式创建追溯 spec，状态为 `Status: Draft`
4. **确认** — 展示给用户审查后再写入 `docs/specs/`

## Options | 选项

| Option | Description | 说明 |
|--------|-------------|------|
| `--since=2026-01-01` | Only scan commits after date | 仅扫描指定日期后的 commits |
| `--last=20` | Only scan last N commits | 仅扫描最近 N 笔 commits |
| (no args) | Scan all feat/fix commits | 扫描所有 feat/fix commits |

## Usage | 使用方式

```
/sdd-retro              # 扫描所有未追踪的 commits
/sdd-retro --since=2026-01-01
/sdd-retro --last=10
```

## Reference | 参考

- SDD workflow: [sdd command](sdd.md)
- Commit standards: [commit command](commit.md)
- Spec: [SPEC-011](../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)
