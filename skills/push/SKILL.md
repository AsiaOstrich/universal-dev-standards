---
name: push
scope: universal
description: |
  AI-assisted safety layer for git push operations with quality gates and collaboration guardrails.
  Use when: pushing commits, force pushing, pushing to protected branches, pushing feature branches.
  Keywords: git push, force push, protected branch, quality gate, push receipt, PR automation, 推送, 保護分支, 品質閘門.
allowed-tools: Read, Bash(git:*), Bash(npm:*), Bash(pnpm:*), Bash(yarn:*), Bash(bun:*)
argument-hint: "[--force] [--target <branch>] [--skip-gates] [--no-pr]"
---
# Push Assistant | 推送助手

> **Language**: English | 繁體中文

**Version**: 2.0.0
**Created**: 2026-04-23
**Applicability**: Claude Code Skills

---

AI-assisted safety layer for `git push`. Detects protected branches, enforces force-push guardrails, runs pre-push quality gates, outputs a structured push receipt, and integrates with PR automation.

`git push` 的 AI 輔助安全層。偵測保護分支、強制 force-push 護欄、執行 pre-push 品質 gate、輸出結構化推送收據，並整合 PR 自動化。

## Core Standard | 核心標準

This skill implements [`.standards/push-standards.ai.yaml`](../../.standards/push-standards.ai.yaml).

---

## Workflow | 執行工作流程

When `/push` is invoked, Claude executes the following steps natively:

### Step 1: Detect Protected Branch
Run `git rev-parse --abbrev-ref HEAD` to get current branch.
Compare against `protected_branches` list (default: main, master, release/*, hotfix/*).
If protected: show warning + pending commits, require explicit user confirmation before proceeding.

### Step 2: Detect Force Push
If `--force` or `--force-with-lease` flag detected:
Run `git log origin/<branch>..HEAD --oneline` to find commits that will be overwritten.
Show count and author list. Require user to type `yes, force push` to proceed.

### Step 3: Run Pre-Push Quality Gates
Run each configured gate in sequence using Bash tool:
- `lint`: detect and run project lint command
- `test`: detect and run project test command
- `type-check` (optional): TypeScript type check
- `ac-coverage` (optional): acceptance criteria coverage
- `security-scan` (optional): security vulnerability scan

If any required gate fails: abort with error message.

### Step 4: Execute Push
Run `git push <remote> <branch> [--force]`.
If push fails: show git error and suggest remediation.

### Step 5: Emit Push Receipt
Output structured receipt to console (and optionally to `~/.uds/push-history.jsonl`):
```json
{
  "branch": "<branch>",
  "commit_sha": "<sha>",
  "gates_passed": ["lint", "test"],
  "force_push": false,
  "timestamp": "<ISO8601>",
  "target_remote": "origin"
}
```

### Step 6: PR Integration
If `auto_pr=true` AND `repo_mode=team` AND no open PR exists for this branch:
Suggest running `/pr-automation-assistant` to create a Pull Request.

---

## Features | 功能說明

### 1. Push Target Risk Detection | 推送目標風險偵測

Before pushing, the assistant detects whether the target branch is a protected branch (e.g., `main`, `master`, `release/*`, `hotfix/*`).

推送前偵測目標分支是否為保護分支（例如 `main`、`master`、`release/*`、`hotfix/*`）。

- Displays a **warning** with branch name and commit list
- Requires explicit user confirmation before proceeding
- Aborts push if user does not confirm

### 2. Force-Push Guardrails | Force-Push 護欄

When `--force` is detected, shows the impact before allowing execution.

偵測到 `--force` 時，推送前顯示影響範圍。

- Calculates commits that will be overwritten on remote
- Shows count and authors of overwritten commits
- Requires user to type a confirmation string (`yes, force push`)
- Records `force_push: true` in the push receipt

### 3. Pre-Push Quality Gates | Pre-Push 品質 Gate

Runs configured quality gates in sequence before pushing.

推送前依序執行已設定的品質 gate。

| Gate | Description | 說明 |
|------|-------------|------|
| `lint` | Run project lint command | 執行 lint 檢查 |
| `test` | Run project test command | 執行測試 |
| `type-check` | TypeScript type checking (optional) | TypeScript 型別檢查（選用） |
| `ac-coverage` | Acceptance criteria coverage check (optional) | AC 覆蓋率檢查（選用） |
| `security-scan` | Security vulnerability scan (optional) | 安全掃描（選用） |

### 4. Push Receipt | 推送收據

After a successful push, outputs a structured receipt for audit trail purposes.

推送成功後輸出結構化收據，供稽核追蹤使用。

```json
{
  "branch": "feature/my-feature",
  "commit_sha": "a1b2c3d",
  "gates_passed": ["lint", "test"],
  "gates_skipped": false,
  "force_push": false,
  "timestamp": "2026-04-23T10:00:00Z",
  "target_remote": "origin"
}
```

Optionally appended to `~/.uds/push-history.jsonl` for persistent audit trail.

可選擇附加到 `~/.uds/push-history.jsonl` 以持久化稽核追蹤。

### 5. PR Automation Integration | PR 自動化整合入口

After pushing a feature branch, prompts user to create a Pull Request if none exists.

推送 feature branch 後，若尚無 PR，提示使用者建立 Pull Request。

- Checks if an open PR exists for the branch
- Prompts user to run `pr-automation-assistant`
- Skipped in `single-owner` repo mode or when `--no-pr` flag is used

---

## Usage | 使用方式

```bash
# Standard push (runs quality gates automatically)
/push

# Push with force (shows overwritten commits, requires confirmation)
/push --force

# Push to a specific remote branch
/push --target main

# Skip quality gates (emergency use)
/push --skip-gates

# Push without PR prompt
/push --no-pr

# Force push without PR prompt (e.g., updating a personal branch)
/push --force --no-pr
```

## Arguments | 參數說明

| Argument | Description | 說明 |
|----------|-------------|------|
| `--force` | Enable force push with guardrail checks | 啟用 force push，含護欄確認 |
| `--target <branch>` | Specify target remote branch explicitly | 明確指定目標遠端分支 |
| `--skip-gates` | Skip pre-push quality gates (emergency only) | 跳過品質 gate（僅緊急情況） |
| `--no-pr` | Suppress PR automation prompt after push | 推送後不提示建立 PR |

---

## Configuration | 設定

Configure via `uds.project.yaml`:

```yaml
push:
  repo_mode: team           # "team" | "single-owner"
  protected_branches:
    - main
    - master
    - "release/*"
    - "hotfix/*"
  push_gates:
    default:
      - lint
      - test
    optional:
      - type-check
      - ac-coverage
      - security-scan
  receipt:
    output: console          # "console" | "file" | "both"
    file_path: "~/.uds/push-history.jsonl"
  auto_pr: true              # prompt to create PR after push to non-protected branch
```

### Options | 選項模式

| Option File | Mode | Description | 說明 |
|-------------|------|-------------|------|
| [`options/push/team-mode.md`](../../options/push/team-mode.md) | `team` | Full collaboration guardrails (default) | 完整協作護欄（預設） |
| [`options/push/single-owner-mode.md`](../../options/push/single-owner-mode.md) | `single-owner` | Reduced friction for personal repos | 個人 repo 低摩擦模式 |

---

## Next Steps Guidance | 下一步引導

After `/push` completes, the AI assistant should suggest:

> **推送完成。建議下一步 / Push complete. Suggested next steps:**
> - 執行 `/pr-automation-assistant` 建立或更新 Pull Request ⭐ **Recommended / 推薦** — 確保協作流程完整 / Ensure complete collaboration workflow
> - 執行 `/checkin` 確認程式碼簽入品質 — 下次提交前的品質確認 / Quality verification before next commit
> - 查看 `~/.uds/push-history.jsonl` 確認推送紀錄 — 稽核追蹤 / Audit trail verification

---

## Related Standards | 相關標準

- [Push Standards](.standards/push-standards.ai.yaml) — Core push safety rules
- [Git Workflow](../../.standards/git-workflow.ai.yaml) — Branching strategy
- [Commit Message](../../.standards/commit-message.ai.yaml) — Commit conventions
- [PR Automation](../pr-automation-assistant/SKILL.md) — Pull Request automation

---

## Version History | 版本歷程

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-04-28 | Restore workflow execution steps (DevAP decomposition XSPEC-097); remove deprecation notice |
| 1.0.0 | 2026-04-23 | Initial release — XSPEC-081 Phase 1 |

---

## License | 授權

This skill is released under [MIT License](https://opensource.org/licenses/MIT) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
