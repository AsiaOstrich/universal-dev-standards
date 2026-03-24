---
description: [UDS] Create retroactive specs for untracked feat/fix commits
allowed-tools: Read, Write, Grep, Glob, Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(mkdir:*)
argument-hint: "[--since=<date> | --last=<N> | 自動掃描]"
---

# Retroactive Spec Generator | 追溯 Spec 產生器

Create lightweight specification documents for past changes that were committed without spec tracking.

為過去未追蹤 spec 的已提交變更，建立輕量規格文件。

## Workflow | 工作流程

1. **Scan** — Search `git log` for `feat`/`fix` commits without `Refs:` in their message
2. **Group** — Cluster related commits by scope
3. **Generate** — Create retroactive spec using standard SDD format with `Status: Draft`
4. **Confirm** — Present to user for review before writing to `docs/specs/`

## Options | 選項

| Option | Description | 說明 |
|--------|-------------|------|
| `--since=2026-01-01` | Only scan commits after date | 僅掃描指定日期後的 commits |
| `--last=20` | Only scan last N commits | 僅掃描最近 N 筆 commits |
| (no args) | Scan all feat/fix commits | 掃描所有 feat/fix commits |

## Usage | 使用方式

```
/sdd-retro              # Scan all untracked commits
/sdd-retro --since=2026-01-01
/sdd-retro --last=10
```

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/sdd-retro` | 掃描所有 feat/fix commits（無 `Refs:` footer），顯示摘要 |
| `/sdd-retro --since=<date>` | 僅掃描指定日期後的 commits |
| `/sdd-retro --last=<N>` | 僅掃描最近 N 筆 commits |

### Interaction Script | 互動腳本

1. 執行 `git log` 掃描符合條件的 commits
2. 過濾已有 `Refs: SPEC-` 的 commits
3. 依 scope 分群相關 commits

**Decision: 掃描結果**
- IF 無未追蹤的 commits → 告知使用者「所有 feat/fix commits 都已追蹤」，結束
- IF 有未追蹤的 commits → 顯示分群清單，問使用者要為哪些群組建立 retro spec
- ELSE → 顯示清單供選擇

🛑 **STOP**: 掃描結果展示後等待使用者選擇要追蹤的群組

4. 為使用者選定的群組生成 retro spec（使用 SDD 格式，status: Archived）
5. 展示生成的 spec 內容

🛑 **STOP**: 展示 spec 內容後等待使用者確認寫入檔案

6. 寫入 `docs/specs/` 並建議更新原 commits 的 footer（如有需要）

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 掃描結果展示後 | 使用者選擇要追蹤哪些群組 |
| Spec 內容生成後 | 確認寫入檔案 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 不在 git 倉庫中 | 告知使用者需要在 git 倉庫中執行 |
| git log 無結果 | 告知無符合條件的 commits |
| `docs/specs/` 目錄不存在 | 自動建立目錄 |
| commit message 格式不符合 Conventional Commits | 標記為 `[Unknown]` scope，仍嘗試分析 |

## Reference | 參考

- SDD workflow: [sdd command](sdd.md)
- Commit standards: [commit command](commit.md)
- Spec: [SPEC-011](../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)
