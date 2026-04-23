# Push Option: Team Mode | 多人協作模式

> **Language**: English | 繁體中文

**Parent Standard**: [Push Standards](../../.standards/push-standards.ai.yaml)

---

## Overview | 概述

Team mode is the **default** push option, designed for collaborative repositories where multiple contributors work together. It enforces full collaboration guardrails to protect shared branches and ensure code quality.

多人協作模式是**預設**推送選項，適合多位貢獻者共同協作的 repo。啟用完整的協作護欄，保護共用分支並確保程式碼品質。

## When to Use | 適用場景

- Team projects with 2+ contributors
- Open source repositories accepting external contributions
- Projects using protected branch policies
- Any repository requiring code review before merge

適用於：
- 2 位以上貢獻者的團隊專案
- 接受外部貢獻的開源 repo
- 使用保護分支策略的專案
- 任何合併前需要 code review 的 repo

## Configuration | 設定

```yaml
# uds.project.yaml
push:
  repo_mode: team
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
  auto_pr: true
```

## Behavior | 行為說明

### Protected Branch Detection | 保護分支偵測

- **Enabled**: Full detection with explicit user confirmation required
- Displays warning banner with branch name and pending commits
- Aborts immediately if user does not confirm

啟用完整偵測，推送前必須明確確認。顯示警告橫幅含分支名稱與待推送 commit，使用者未確認則立即中止。

### Force-Push Guardrail | Force-Push 護欄

- **Enabled**: Full guardrail with confirmation text required
- Shows count and authors of commits that will be overwritten on remote
- User must type `yes, force push` to proceed
- Records `force_push: true` in push receipt

啟用完整護欄，需輸入確認文字。顯示將被覆蓋的 commit 數量與作者，使用者必須輸入 `yes, force push` 才可繼續，並記錄於 push receipt。

### Pre-Push Quality Gates | Pre-Push 品質 Gate

- **Default gates**: `lint`, `test`
- Runs in sequence; push aborts on any gate failure
- Gate failure message includes suggested fix
- `--skip-gates` flag marks `gates_skipped: true` in receipt

預設執行 `lint` 和 `test`。依序執行，任一 gate 失敗即中止推送並提示修復建議。使用 `--skip-gates` 旗標時，收據記錄 `gates_skipped: true`。

### PR Automation Integration | PR 自動化整合

- **Enabled**: Prompts after push to non-protected branch
- Checks if an open PR exists for the current branch
- If no PR found: prompts user to run `pr-automation-assistant`
- Skipped when `--no-pr` flag is used

啟用 PR 整合。推送到非保護分支後，檢查是否已有開啟的 PR。若無 PR 則提示執行 `pr-automation-assistant`。使用 `--no-pr` 旗標可跳過。

### Push Receipt | 推送收據

- **Output**: `console` (printed to terminal after push)
- Contains: branch, commit SHA, gates passed, force_push flag, timestamp

輸出到終端機（console）。包含：分支、commit SHA、通過的 gate 列表、force_push 旗標、時間戳記。

## Example Output | 範例輸出

```
╔══════════════════════════════════════════╗
║  Push Assistant — Team Mode              ║
╚══════════════════════════════════════════╝

✓ Gates passed: lint, test
✓ Push complete: origin/feature/my-feature

── Push Receipt ───────────────────────────
  branch:       feature/my-feature
  commit_sha:   a1b2c3d
  gates_passed: [lint, test]
  gates_skipped: false
  force_push:   false
  timestamp:    2026-04-23T10:00:00Z
  target_remote: origin
───────────────────────────────────────────

💡 No open PR found for this branch.
   Run /pr-automation-assistant to create one?
```

## Related Options | 相關選項

- [Single Owner Mode](./single-owner-mode.md) — Reduced friction for personal repos

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
