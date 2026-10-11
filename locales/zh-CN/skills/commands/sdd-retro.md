---
source: ../../../../skills/commands/sdd-retro.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 34792a9bf741
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

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/sdd-retro` | 扫描所有 feat/fix commits（无 `Refs:` footer），显示摘要 |
| `/sdd-retro --since=<date>` | 仅扫描指定日期后的 commits |
| `/sdd-retro --last=<N>` | 仅扫描最近 N 笔 commits |

### Interaction Script | 交互脚本

1. 执行 `git log` 扫描符合条件的 commits
2. 过滤已有 `Refs: SPEC-` 的 commits
3. 依 scope 分组相关 commits

**Decision: 扫描结果**
- IF 无未追踪的 commits → 告知用户“所有 feat/fix commits 都已追踪”，结束
- IF 有未追踪的 commits → 显示分组清单，询问用户要为哪些分组创建 retro spec
- ELSE → 显示清单供选择

🛑 **STOP**: 扫描结果展示后等待用户选择要追踪的分组

4. 为用户选定的分组生成 retro spec（使用 SDD 格式，status: Archived）
5. 展示生成的 spec 内容

🛑 **STOP**: 展示 spec 内容后等待用户确认写入文件

6. 写入 `docs/specs/` 并建议更新原 commits 的 footer（如有需要）

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 扫描结果展示后 | 用户选择要追踪哪些分组 |
| Spec 内容生成后 | 确认写入文件 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 不在 git 仓库中 | 告知用户需要在 git 仓库中执行 |
| git log 无结果 | 告知无符合条件的 commits |
| `docs/specs/` 目录不存在 | 自动创建目录 |
| commit message 格式不符合 Conventional Commits | 标记为 `[Unknown]` scope，仍尝试分析 |

## Reference | 参考

- SDD workflow: [sdd command](sdd.md)
- Commit standards: [commit command](commit.md)
- Spec: [SPEC-011](../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)
