---
description: [UDS] Generate commit messages following Conventional Commits standard
allowed-tools: Read, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
argument-hint: "[description of changes | 變更描述]"
---

# Commit Message Assistant | Commit Message 助手

Generate well-formatted commit messages following the Conventional Commits standard.

根據 staged 的變更，產生符合 Conventional Commits 格式的 commit message。

## Pre-Flight Checks | 前置檢查

Before generating a commit, the AI assistant MUST run these checks:

在產生 commit 前，AI 助手必須執行以下檢查：

| Check | Command | On Failure |
|-------|---------|------------|
| Staged changes exist | `git diff --cached --stat` | → Guide user to `git add` |
| No merge conflicts | `grep -r "<<<<<<< " --include="*.{js,ts,md,yaml}" .` | → Resolve conflicts first |
| Tests pass (if feat/fix) | `cd cli && npm run test:unit` (or project test cmd) | → Fix tests before committing |
| Spec reference (feat/fix) | Check `docs/specs/SPEC-*.md` for active specs | → Suggest `Refs: SPEC-XXX` in footer |

### Spec Tracking Gate | Spec 追蹤閘門

For `feat` and `fix` type commits:
1. **Check**: `ls docs/specs/SPEC-*.md 2>/dev/null` — any active specs?
2. **If specs exist**: Suggest adding `Refs: SPEC-XXX` to commit footer
3. **If no specs and change is significant** (>3 files or new API): Suggest creating a spec via `/sdd`
4. **Mode**: This is advisory (non-blocking) — user can always proceed without a spec reference

對於 `feat` 和 `fix` 類型的提交：
1. **檢查**：是否有活躍的規格？
2. **如果有規格**：建議在 footer 加入 `Refs: SPEC-XXX`
3. **如果沒有規格且變更顯著**：建議透過 `/sdd` 建立規格
4. **模式**：這是建議性的（非阻斷）— 使用者可以不引用規格

---

## Workflow | 工作流程

1. **Check status** - Run `git status` and `git diff --staged` to understand changes
2. **Analyze changes** - Determine the type (feat, fix, refactor, etc.) and scope
3. **Spec tracking assessment** - Evaluate whether this change needs a spec (see below)
4. **Generate message** - Create a commit message following the format:
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
5. **Confirm and commit** - Ask user to confirm before executing `git commit`

## Spec Tracking Assessment | Spec 追蹤評估

For `feat`/`fix` commits, evaluate whether a spec should be created or linked. Suggest a spec when: many files changed (>3), public API signatures modified, or significant new functionality. Skip for `docs`/`style`/`chore`/`test` types.

If a spec is linked, add `Refs: SPEC-XXX` to the commit footer. This is advisory — the user can always ignore.

## Commit Types | 提交類型

| Type | When to Use | 使用時機 |
|------|-------------|---------|
| `feat` | New feature | 新功能 |
| `fix` | Bug fix | 修復錯誤 |
| `refactor` | Code refactoring | 重構 |
| `docs` | Documentation | 文件更新 |
| `style` | Formatting | 格式調整 |
| `test` | Tests | 測試相關 |
| `perf` | Performance | 效能優化 |
| `chore` | Maintenance | 維護任務 |

## Usage | 使用方式

- `/commit` - Auto-analyze changes and suggest commit message
- `/commit fix login bug` - Generate message based on provided description

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action | AI 行為 |
|-------|-----------|--------|
| `/commit` | 執行 Pre-Flight Checks → 分析 staged 變更 → 產生 commit message → 等待確認 | Run checks, analyze, generate, confirm |
| `/commit <description>` | 以描述為基礎，結合 staged diff 產生 commit message → 等待確認 | Use description + diff to generate message |

### Interaction Script | 互動腳本

1. 執行 `git diff --cached --stat` 確認有 staged 變更
2. 執行 `git status` 和 `git diff --staged` 了解變更內容
3. 判斷 commit 類型（feat/fix/refactor/docs/...）和範圍

**Decision: Pre-Flight Check 結果**
- IF 無 staged 變更 → 引導使用者 `git add`，停止
- IF 有合併衝突標記 → 提示先解決衝突，停止
- IF 類型為 feat/fix → 執行測試 + Spec 追蹤評估

4. 產生 commit message（subject + body + footer）
5. 展示完整 message 供使用者確認

**Decision: Spec 追蹤（僅 feat/fix）**
- IF 有活躍 spec → 建議在 footer 加 `Refs: SPEC-XXX`
- IF 無 spec 且變更顯著（>3 檔案或新 API） → 建議 `/sdd`
- 此為建議性（non-blocking），使用者可忽略

🛑 **STOP**: 展示 commit message 後等待使用者確認或修改

6. 使用者確認後執行 `git commit`

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| Pre-Flight 失敗 | 使用者修復問題後重新執行 |
| Message 展示後 | 確認 message 正確，或要求修改 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無 staged 變更 | 顯示 `git add` 指引，不嘗試 commit |
| 合併衝突存在 | 提示解決衝突，列出衝突檔案 |
| 測試失敗（feat/fix） | 顯示失敗摘要，建議修復後再 commit |
| commit 執行失敗 | 顯示 git 錯誤訊息，不重試 |

## Reference | 參考

- Full standard: [commit-standards](../commit-standards/SKILL.md)
- Core guide: [commit-message-guide](../../core/commit-message-guide.md)
