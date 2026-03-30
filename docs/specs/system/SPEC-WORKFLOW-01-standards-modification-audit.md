# [SPEC-WORKFLOW-01] 修改 .standards/ 檔案時自動觸發審計提醒

**Status**: Archived
**Priority**: P2
**Scope**: universal
**Last Updated**: 2026-03-30
**Approved Date**: 2026-03-30
**Approved By**: AsiaOstrich
**Dependencies**: workflow-enforcement.ai.yaml, checkin-standards.ai.yaml
**Issue**: #61

---

## Summary / 摘要

When developers modify UDS-managed files (`.standards/`, `.claude/skills/`), the existing workflow provides no automatic reminder. This spec adds non-blocking detection to `/checkin` and `/commit`, plus a workflow-enforcement rule, so developers are prompted to run `/audit --friction` before committing upstream-managed file changes.

當開發者修改 UDS 管理的檔案時，現有工作流程不會自動提醒。本規格在 `/checkin` 和 `/commit` 新增非阻斷偵測，並加入 workflow-enforcement 規則，提示開發者在提交前執行 `/audit --friction`。

---

## Motivation / 動機

### Problem Statement / 問題陳述

In VibeOps (AsiaOstrich/vibeops), the full `/sdd` → `/checkin` → `/commit` workflow was completed while modifying `.standards/spec-driven-development.ai.yaml` (+35 lines) and `specs/TEMPLATE.md` (+33 lines). No step in the workflow detected these were UDS upstream files. The user had to manually discover this and create Issue #60.

### Solution / 解決方案

Add a "UDS upstream file detection" check at three layers:
1. **workflow-enforcement.ai.yaml** — new rule `standards-modification-audit`
2. **checkin-standards.ai.yaml** — new checklist dimension `upstream_file_detection`
3. **skills/commands/commit.md** — new pre-flight check alongside existing Spec Tracking

---

## Acceptance Criteria / 驗收條件

### AC-1: Workflow Enforcement Rule

**Given** a developer stages changes that include files in `.standards/` or `.claude/skills/`
**When** the AI reads `workflow-enforcement.ai.yaml` during any workflow phase
**Then** the AI warns: "⚠️ UDS 管理的檔案被修改，建議執行 `/audit --friction` 回報上游"
**And** the warning is non-blocking (`blocking: false`)

### AC-2: Checkin Standards Detection

**Given** a developer runs `/checkin`
**When** `git diff --name-only` includes files matching `.standards/*` or `.claude/skills/*`
**Then** the checkin report includes a new "上游檔案變更" dimension with status ⚠️
**And** suggests running `/audit --friction` before committing

### AC-3: Commit Pre-Flight Check

**Given** a developer runs `/commit` with staged changes
**When** staged files include `.standards/*` or `.claude/skills/*`
**Then** a new pre-flight check row is displayed: "UDS upstream files modified"
**And** the check is advisory (non-blocking), consistent with existing Spec Tracking behavior

### AC-4: No False Positives on Fresh Install

**Given** a developer runs `uds init` which creates `.standards/` files
**When** they run `/checkin` or `/commit` immediately after
**Then** the detection does NOT trigger (only triggers on modifications to existing files, not initial creation)

### AC-5: Detection Pattern Covers Both Directories

**Given** the detection pattern
**When** a file in `.standards/` OR `.claude/skills/` is modified
**Then** both paths are detected
**And** the pattern uses `git diff --name-only | grep -E '^\.(standards|claude/skills)/'`

---

## Input/Output Contract (Optional) / 輸入輸出合約（可選）

### Input Contract

| Field | Type | Required | Source | Description |
|-------|------|----------|--------|-------------|
| staged files | string[] | Yes | `git diff --name-only` or `git diff --cached --name-only` | List of modified file paths |

### Output Contract

| Field | Type | Guarantee | Consumer | Description |
|-------|------|-----------|----------|-------------|
| warning message | string | Always when match | User | "⚠️ UDS 管理的檔案被修改..." |
| suggested action | string | Always when match | User | "/audit --friction" |
| blocking | boolean | Always false | Workflow engine | Non-blocking advisory |

---

## Assumptions & Open Questions / 假設與待釐清

### Assumptions / 假設

| # | Assumption | Impact Scope | Verification Method | Status |
|---|-----------|--------------|---------------------|--------|
| A1 | [Assumption] `.standards/` 和 `.claude/skills/` 是主要由 `uds init` 安裝的上游管理目錄（`.claude/commands/` 為 symlink 引用，偵測 `.claude/skills/` 已足夠） | AC-5 | 檢查 `uds init` 安裝邏輯 | Verified |
| A2 | [Assumption] AI 助手在執行 `/checkin` 時會讀取 checkin-standards.ai.yaml | AC-2 | 觀察實際行為 | Verified |
| A3 | [Assumption] `git diff --name-only` 在 fresh init 後不會顯示新建檔案（untracked 不算 diff） | AC-4 | 測試 `git diff` 行為 | Verified |

### Open Questions / 待釐清

（無）

---

## Technical Design / 技術設計

### 變更 1：workflow-enforcement.ai.yaml

在 `rules:` 區塊新增：

```yaml
- id: standards-modification-audit
  trigger: staging or committing changes to .standards/ or .claude/skills/
  instruction: >
    When staged or modified files include paths matching .standards/ or
    .claude/skills/, warn the user that these are UDS upstream-managed files.
    Suggest running /audit --friction to check for drift and /audit --report
    to submit feedback upstream. This is advisory, not blocking.
  priority: recommended
```

### 變更 2：checkin-standards.ai.yaml

在 `checklist:` 新增 `upstream_file_detection` 維度：

```yaml
upstream_file_detection:
  items:
    - "Check git diff for .standards/ or .claude/skills/ modifications"
    - "If detected: warn user these are UDS-managed files"
    - "Suggest /audit --friction before committing"
  severity: warning
  blocking: false
```

### 變更 3：skills/commands/commit.md

在 Pre-Flight Checks 表格新增一行：

```markdown
| UDS upstream files | `git diff --cached --name-only \| grep -E '^\.(standards\|claude/skills)/'` | → Suggest `/audit --friction` |
```

在 Interaction Script 步驟 3 之後新增 Decision：

```markdown
**Decision: UDS 上游檔案偵測**
- IF staged 包含 `.standards/` 或 `.claude/skills/` → 顯示 ⚠️ 提醒並建議 `/audit --friction`
- 此為建議性（non-blocking），使用者可忽略
```

### 變更 4：skills/checkin-assistant/SKILL.md + .claude/skills/checkin-assistant/SKILL.md

品質關卡表格新增一行：

```markdown
| **上游檔案** | `.standards/` 或 `.claude/skills/` 無修改 | No UDS upstream file modifications |
```

---

## Test Plan / 測試計畫

- [ ] 修改 `.standards/` 檔案後執行 `/checkin`，確認出現 ⚠️ 提醒
- [ ] 修改 `.claude/skills/` 檔案後執行 `/commit`，確認出現 ⚠️ 提醒
- [ ] 修改一般檔案時，確認不會觸發 UDS 提醒
- [ ] `uds init` 後立即 `/checkin`，確認不會誤報
- [ ] 現有 CLI 測試通過（`npm run test:quick`）

---

## Sync Checklist

### From Core Standard
- [ ] checkin-standards.ai.yaml updated
- [ ] workflow-enforcement.ai.yaml updated
- [ ] Translations synced (zh-TW + zh-CN)

### From Skill
- [ ] checkin-assistant SKILL.md updated (both locations)
- [ ] commit.md updated
- [ ] Translations synced

---

## Files Modified / 修改的檔案

| File | Change |
|------|--------|
| `.standards/workflow-enforcement.ai.yaml` | +1 rule |
| `.standards/checkin-standards.ai.yaml` | +1 checklist dimension |
| `skills/commands/commit.md` | +1 pre-flight check + 1 decision |
| `skills/checkin-assistant/SKILL.md` | +1 quality gate row |
| `.claude/skills/checkin-assistant/SKILL.md` | +1 quality gate row (mirror) |
| + 翻譯檔案 (zh-TW, zh-CN) | Sync all above |
