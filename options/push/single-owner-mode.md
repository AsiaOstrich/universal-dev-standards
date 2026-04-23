# Push Option: Single Owner Mode | 單人 Repo 模式

> **Language**: English | 繁體中文

**Parent Standard**: [Push Standards](../../.standards/push-standards.ai.yaml)

---

## Overview | 概述

Single owner mode is designed for personal repositories or projects owned and maintained by a single developer. It reduces friction by removing collaboration-specific guardrails while maintaining essential safety checks for protected branches.

單人 Repo 模式適合個人 repo 或由單一開發者擁有並維護的專案。移除協作專用護欄以降低操作摩擦，同時保留保護分支的基本安全檢查。

## When to Use | 適用場景

- Personal repositories with sole ownership
- Solo open source projects (single maintainer, no external contributors)
- Forked repositories used for personal experimentation
- Any repository where no code review workflow is needed

適用於：
- 個人擁有的私人 repo
- 單人維護的開源專案（無外部貢獻者）
- 個人實驗用的 fork repo
- 不需要 code review 流程的任何 repo

## Configuration | 設定

```yaml
# uds.project.yaml
push:
  repo_mode: single-owner
  protected_branches:
    - main
    - master
    - "release/*"
    - "hotfix/*"
  push_gates:
    default:
      - lint
      - test
  receipt:
    output: console
  auto_pr: false
```

## Behavior | 行為說明

### Protected Branch Detection | 保護分支偵測

- **Enabled**: Detection active, but no mandatory confirmation text required
- Displays a concise warning with branch name and pending commit count
- User may proceed directly without typing a confirmation string
- Aborts only if user explicitly cancels

仍啟用偵測，但不強制要求確認文字。顯示簡潔警告含分支名稱與待推送 commit 數量，使用者可直接繼續，不需輸入確認字串。僅在使用者明確取消時中止。

### Force-Push Guardrail | Force-Push 護欄

- **Reduced**: Warning displayed but no confirmation text required
- Shows count of commits that will be overwritten (no author breakdown)
- User may proceed after acknowledging the warning
- Records `force_push: true` in push receipt

降低護欄強度：顯示警告但不需輸入確認文字。顯示將被覆蓋的 commit 數量（不顯示作者明細），使用者確認警告後可繼續。Push receipt 仍記錄 `force_push: true`。

### Pre-Push Quality Gates | Pre-Push 品質 Gate

- **Default gates**: `lint`, `test` (same as team mode)
- Runs in sequence; push aborts on any gate failure
- `--skip-gates` flag marks `gates_skipped: true` in receipt

預設執行 `lint` 和 `test`（與 team mode 相同）。依序執行，任一 gate 失敗即中止推送。使用 `--skip-gates` 旗標時，收據記錄 `gates_skipped: true`。

### PR Automation Integration | PR 自動化整合

- **Disabled**: No PR prompts after push
- `auto_pr` is set to `false` by default in this mode
- Use `gh pr create` manually if needed

PR 整合**停用**。推送後不提示建立 PR。此模式預設 `auto_pr: false`。如需建立 PR，請手動執行 `gh pr create`。

### Push Receipt | 推送收據

- **Output**: `console` (printed to terminal after push)
- Contains: branch, commit SHA, gates passed, force_push flag, timestamp

輸出到終端機（console）。包含：分支、commit SHA、通過的 gate 列表、force_push 旗標、時間戳記。

## Example Output | 範例輸出

```
╔══════════════════════════════════════════╗
║  Push Assistant — Single Owner Mode      ║
╚══════════════════════════════════════════╝

✓ Gates passed: lint, test
✓ Push complete: origin/main

── Push Receipt ───────────────────────────
  branch:       main
  commit_sha:   d4e5f6a
  gates_passed: [lint, test]
  gates_skipped: false
  force_push:   false
  timestamp:    2026-04-23T10:00:00Z
  target_remote: origin
───────────────────────────────────────────
```

## Comparison with Team Mode | 與多人協作模式比較

| Feature | Team Mode | Single Owner Mode | 說明 |
|---------|-----------|-------------------|------|
| Protected branch detection | Full + confirmation required | Warning only | 保護分支偵測 |
| Force-push guardrail | Confirmation text required | Warning only | Force-push 護欄 |
| Pre-push quality gates | lint + test | lint + test | 品質 gate |
| PR automation prompt | Enabled | Disabled | PR 自動化提示 |
| Push receipt | Console | Console | 推送收據 |

## Related Options | 相關選項

- [Team Mode](./team-mode.md) — Full collaboration guardrails for multi-contributor repos

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
