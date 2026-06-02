---
name: push
source: ../../../../skills/push/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-02
source_hash: b7812535483c
scope: universal
description: |
  [UDS] AI 輔助 git push 安全層：品質閘門 + 協作護欄。
  Use when: pushing commits, force pushing, pushing to protected branches, pushing feature branches.
  Keywords: git push, force push, protected branch, quality gate, push receipt, PR automation, 推送, 保護分支, 品質閘門.
allowed-tools: Read, Bash(git:*), Bash(npm:*), Bash(pnpm:*), Bash(yarn:*), Bash(bun:*)
argument-hint: "[--force] [--target <branch>] [--skip-gates] [--no-pr]"
---

# 推送助手

> **語言**: [English](../../../../skills/push/SKILL.md) | 繁體中文

**版本**：2.0.0
**建立日期**：2026-04-23
**適用範圍**：Claude Code Skills

---

`git push` 的 AI 輔助安全層。偵測保護分支、強制 force-push 護欄、執行 pre-push 品質閘門、輸出結構化推送收據，並整合 PR 自動化。

## 核心標準

本 Skill 實作 [`.standards/push-standards.ai.yaml`](../../../../.standards/push-standards.ai.yaml)。

---

## 執行工作流程

呼叫 `/push` 後，Claude 原生依序執行以下步驟：

### Step 1：偵測保護分支
執行 `git rev-parse --abbrev-ref HEAD` 取得目前分支。
比對 `protected_branches` 清單（預設：main、master、release/*、hotfix/*）。
若為保護分支：顯示警告 + 待推送的 commit 列表，需使用者明確確認才能繼續。

### Step 2：偵測 Force Push
若偵測到 `--force` 或 `--force-with-lease`：
執行 `git log origin/<branch>..HEAD --oneline` 找出將被覆蓋的 commits。
顯示數量與作者列表。需要使用者輸入 `yes, force push` 才能繼續。

### Step 3：執行 Pre-Push 品質閘門
依序使用 Bash tool 執行每個已設定的閘門：
- `lint`：偵測並執行專案 lint 指令
- `test`：偵測並執行專案測試指令
- `type-check`（選用）：TypeScript 型別檢查
- `ac-coverage`（選用）：驗收條件覆蓋率
- `security-scan`（選用）：安全漏洞掃描

若任何必要閘門失敗：中止並顯示錯誤訊息。

### Step 4：執行推送
執行 `git push <remote> <branch> [--force]`。
若推送失敗：顯示 git 錯誤並建議修正方式。

### Step 5：發出推送收據
將結構化收據輸出到 console（可選擇寫入 `~/.uds/push-history.jsonl`）：
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

### Step 6：PR 整合
若 `auto_pr=true` **且** `repo_mode=team` **且**該分支無 open PR：
建議使用者執行 `/pr-automation-assistant` 建立 Pull Request。

---

## 功能說明

### 1. 推送目標風險偵測

推送前偵測目標分支是否為保護分支（例如 `main`、`master`、`release/*`、`hotfix/*`）。

- 顯示**警告**，列出分支名稱與 commit 清單
- 需要使用者明確確認才能繼續
- 使用者未確認則中止推送

### 2. Force-Push 護欄

偵測到 `--force` 時，推送前顯示影響範圍。

- 計算遠端將被覆蓋的 commits
- 顯示被覆蓋 commits 的數量與作者
- 要求使用者輸入確認字串（`yes, force push`）
- 在推送收據中記錄 `force_push: true`

### 3. Pre-Push 品質閘門

推送前依序執行已設定的品質閘門。

| 閘門 | 說明 |
|------|------|
| `lint` | 執行 lint 檢查 |
| `test` | 執行測試 |
| `type-check` | TypeScript 型別檢查（選用） |
| `ac-coverage` | AC 覆蓋率檢查（選用） |
| `security-scan` | 安全掃描（選用） |

### 4. 推送收據

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

可選擇附加到 `~/.uds/push-history.jsonl` 以持久化稽核追蹤。

### 5. PR 自動化整合入口

推送 feature branch 後，若尚無 PR，提示使用者建立 Pull Request。

- 檢查該分支是否已有 open PR
- 提示使用者執行 `pr-automation-assistant`
- 在 `single-owner` repo 模式或使用 `--no-pr` 旗標時跳過

---

## 使用方式

```bash
# 標準推送（自動執行品質閘門）
/push

# Force push（顯示被覆蓋 commits，需要確認）
/push --force

# 推送到指定的遠端分支
/push --target main

# 跳過品質閘門（緊急情況）
/push --skip-gates

# 推送但不提示建立 PR
/push --no-pr

# Force push 且不提示建立 PR（例如更新個人分支）
/push --force --no-pr
```

## 參數說明

| 參數 | 說明 |
|------|------|
| `--force` | 啟用 force push，含護欄確認 |
| `--target <branch>` | 明確指定目標遠端分支 |
| `--skip-gates` | 跳過品質閘門（僅緊急情況） |
| `--no-pr` | 推送後不提示建立 PR |

---

## 設定

透過 `uds.project.yaml` 設定：

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
  auto_pr: true              # 推送到非保護分支後是否提示建立 PR
```

### 選項模式

| Option 檔案 | 模式 | 說明 |
|-------------|------|------|
| [`options/push/team-mode.md`](../../../../options/push/team-mode.md) | `team` | 完整協作護欄（預設） |
| [`options/push/single-owner-mode.md`](../../../../options/push/single-owner-mode.md) | `single-owner` | 個人 repo 低摩擦模式 |

---

## 下一步引導

`/push` 完成後，AI 助手應建議：

> **推送完成。建議下一步：**
> - 執行 `/pr-automation-assistant` 建立或更新 Pull Request ⭐ **推薦** — 確保協作流程完整
> - 執行 `/checkin` 確認程式碼簽入品質 — 下次提交前的品質確認
> - 查看 `~/.uds/push-history.jsonl` 確認推送紀錄 — 稽核追蹤

---

## 相關標準

- [Push Standards](../../../../.standards/push-standards.ai.yaml) — 核心推送安全規則
- [Git Workflow](../../../../.standards/git-workflow.ai.yaml) — 分支策略
- [Commit Message](../../../../.standards/commit-message.ai.yaml) — Commit 慣例
- [PR Automation](../pr-automation-assistant/SKILL.md) — Pull Request 自動化

---

## 版本歷程

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 還原 workflow 執行步驟（XSPEC-097 採用層解耦）；移除棄用通知 |
| 1.0.0 | 2026-04-23 | 初始版本 — XSPEC-081 Phase 1 |

---

## 授權

本 Skill 採用 [MIT License](https://opensource.org/licenses/MIT) 與 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 雙重授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
