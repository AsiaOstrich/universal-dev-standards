---
description: [UDS] Create or review specification documents for Spec-Driven Development
allowed-tools: Read, Write, Grep, Glob, Bash(git:*), Bash(npm test:*)
argument-hint: "[create|review|approve|implement|verify] [spec name or file | 規格名稱或檔案]"
---

# Spec-Driven Development Assistant | 規格驅動開發助手

Create, review, approve, implement, and verify specification documents — full SDD lifecycle management.

建立、審查、核准、實作和驗證規格文件 — 完整 SDD 生命週期管理。

## Pre-Flight Checks | 前置檢查

Before executing ANY SDD phase, the AI assistant MUST run the applicable checks below. If a check fails, STOP and guide the user to the correct phase.

在執行任何 SDD 階段前，AI 助手必須執行以下適用的檢查。如果檢查失敗，停止並引導使用者到正確的階段。

### Phase Gate Matrix | 階段閘門矩陣

| Target Phase | Pre-Flight Check | On Failure |
|-------------|-----------------|------------|
| `discuss` | None (entry point) | — |
| `create` | `ls docs/specs/` → check for existing orphan specs | Warn, offer to close orphans first |
| `review` | Spec file exists AND status = `Draft` | → Guide to `/sdd create` |
| `approve` | Spec file exists AND status = `Review` | → Guide to `/sdd review` |
| `implement` | 1. `ls docs/specs/SPEC-*.md` → at least one spec exists | → Guide to `/sdd create` |
| | 2. Spec status = `Approved` (check `status:` field in spec) | → Guide to `/sdd approve` |
| | 3. Check `.workflow-state/` for active SDD state | Resume if exists |
| `verify` | 1. Spec status = `Implemented` or has implementation commits | → Guide to `/sdd implement` |
| | 2. All AC have code + test references | → List incomplete ACs |

### Check Commands | 檢查指令

```bash
# Check for existing specs
ls docs/specs/SPEC-*.md 2>/dev/null

# Check spec status (grep the status field)
grep -m1 "^status:" docs/specs/SPEC-XXX.md

# Check for active workflow state
ls .workflow-state/sdd-*.yaml 2>/dev/null

# Check AC implementation status
grep -E "^- \[(x|X)\]" docs/specs/SPEC-XXX.md
```

### Enforcement Behavior | 執行行為

- **Mode: `enforce`** (default) — Block phase transition, show guidance
- **Mode: `suggest`** — Show warning but allow override
- **Mode: `off`** — No checks

Check project config: `.uds/config.yaml` → `workflow.enforcement_mode`

---

## SDD Workflow | SDD 工作流程

```
/sdd discuss ──► /sdd create ──► /sdd review ──► /sdd approve ──► /sdd implement ──► /sdd verify
```

### Phase 0.5: Discuss — Capture Gray Areas | 捕捉灰色地帶

Before writing a spec, conduct a structured discussion to resolve ambiguities.

在撰寫規格前，進行結構化討論以解決模糊之處。

**Discuss Checklist | 討論檢查清單：**
- [ ] Gray areas identified and listed | 灰色地帶已識別並列出
- [ ] Scope locked (in/out scope) | 範圍已鎖定（範圍內/外）
- [ ] Canonical refs collected (read_first list) | 必讀參考已收集
- [ ] Prior decisions checked (.project-context/) | 已檢查既有決策
- [ ] Questions based on actual code, not guesses | 問題基於實際程式碼

**Scope Lock Rule**: New features discovered during discussion are classified as **deferred** and tracked separately. They do NOT expand the current scope.

**範圍鎖定規則**：討論中發現的新功能歸類為**延後**，另行追蹤。不擴大當前範圍。

**Output**: A `read_first` list and scope definition that feed into the Create phase.

**產出**：一份 `read_first` 清單和範圍定義，作為建立階段的輸入。

### Phase 1: Create — Write Spec | 撰寫規格

Define requirements, technical design, acceptance criteria, and test plan.

定義需求、技術設計、驗收標準和測試計畫。

**Orphan Check**: Before creating a new spec, check for existing orphan specs (non-terminal state). Consider closing or archiving them first.

**孤兒檢查**：建立新規格前，檢查是否有未關閉的孤兒規格。考慮先關閉或歸檔它們。

### Phase 2: Review — Validate | 審查驗證

Check for completeness, consistency, and feasibility with stakeholders.

與利害關係人檢查完整性、一致性和可行性。

### Phase 3: Approve — Sign Off | 核准

Get stakeholder sign-off before implementation begins. Update spec status from Draft/Review to Approved.

在開始實作前取得利害關係人核准。將規格狀態從 Draft/Review 更新為 Approved。

**Approval checklist | 核准檢查清單：**
- [ ] All review comments addressed | 所有審查意見已處理
- [ ] Requirements are complete and unambiguous | 需求完整且無歧義
- [ ] Acceptance criteria are testable | 驗收標準可測試
- [ ] Technical design is feasible | 技術設計可行
- [ ] Test plan covers all AC | 測試計畫涵蓋所有 AC

**Approval metadata added to spec | 核准元資料：**
```yaml
status: Approved
approved-date: YYYY-MM-DD
approved-by: [approver]
```

### Phase 4: Implement — Code | 實作

Develop following the approved spec, referencing requirements and AC. Track progress per AC.

依照已核准規格開發，追蹤每個 AC 的實作進度。

**For each AC, track | 針對每個 AC 追蹤：**
- [ ] Code implemented | 程式碼已實作
- [ ] Unit test written | 單元測試已撰寫
- [ ] Test passing | 測試通過

**Atomic Commits per AC | 每 AC 一個 Commit：**

Prefer one commit per acceptance criterion for better traceability. Tightly coupled ACs may be combined.

建議每個驗收標準一個 commit 以提升追蹤性。緊耦合的 AC 可合併。

**Suggested commit format | 建議 commit 格式：**
```
feat(<scope>): implement AC-N — <description>

Implements acceptance criteria AC-N from SPEC-XXX.
See: docs/specs/SPEC-XXX.md#AC-N

Refs: SPEC-XXX, AC-N
```

### Phase 5: Verify — Confirm | 驗證

Ensure implementation matches spec, all tests pass, AC satisfied. Generate verification report.

確保實作符合規格、所有測試通過、AC 已滿足。產生驗證報告。

**Verification report output | 驗證報告輸出：**
```markdown
# Verification Report: SPEC-XXX

## Summary
- Status: PASS / FAIL
- Date: YYYY-MM-DD

## AC Coverage
| AC | Implementation | Test | Status |
|----|---------------|------|--------|
| AC-1 | src/auth.js:42 | tests/auth.test.js:15 | PASS |

## Deviation Report | 偏差報告
| Type | Description | Justification |
|------|-------------|---------------|
| Added | Rate limiting on login endpoint | Security requirement discovered during implementation |
| Modified | AC-3 uses JWT instead of session tokens | Team decision (see PRJ-2026-0042) |
| Omitted | AC-5 social login | Deferred to SPEC-XXX-v2 |
```

**Deviation Categories | 偏差類別：**
- **Added**: Functionality not in the original spec | 規格中未列出的功能
- **Modified**: Functionality that differs from spec | 與規格不同的功能
- **Omitted**: Spec requirements not implemented | 未實作的規格需求

Major deviations must be recorded as `decision` type entries in `.project-context/`.

重大偏差必須記錄為 `.project-context/` 中的 `decision` 類型條目。

**Verification Loop Cap | 驗證迴圈上限：**

The verify phase is capped at **3 iterations**. After 3 failed attempts, STOP and choose:

驗證階段上限為 **3 次迭代**。3 次失敗後，停止並選擇：

1. Review spec for ambiguity — are AC unclear? | 審查規格是否有歧義
2. Rethink implementation — try a different approach | 重新思考實作方案
3. Escalate — seek stakeholder guidance | 升級處理至利害關係人

Iteration count is tracked in `.workflow-state/`.

迭代次數記錄在 `.workflow-state/` 中。

**Traceability Matrix (Recommended) | 追蹤矩陣（建議）：**

Generate a REQ → AC → Test → Implementation → Commit traceability matrix:

產生 REQ → AC → Test → Implementation → Commit 追蹤矩陣：

```markdown
| REQ-ID | AC | Test | Implementation | Commit |
|--------|-----|------|----------------|--------|
| REQ-001 | AC-1 | auth.test.js:15 | auth.js:42 | abc1234 |
| REQ-002 | AC-2 | auth.test.js:30 | auth.js:67 | def5678 |
```

Empty cells should be marked `[INCOMPLETE]`. | 空欄位標記為 `[INCOMPLETE]`。

## Enhanced Workflow | 增強工作流程

### Phase 0: Scope Evaluation (NEW) | 範圍評估（新增）

Before creating a spec, evaluate the change scope:

在建立規格前，先評估變更範圍：

**Q1: Scope | 範圍**
- [ ] Project-specific (CLAUDE.md only) | 專案專用
- [ ] Universal (Core Standard) | 通用規則

**Q2: Interaction | 互動**
- [ ] Needs AI interaction → Create Skill | 需要 AI 互動 → 建立 Skill
- [ ] Static rule only | 靜態規則

**Q3: Trigger | 觸發**
- [ ] User-triggered → Create Command | 使用者觸發 → 建立命令
- [ ] AI applies automatically | AI 自動應用

**Record in spec metadata:**
```yaml
scope: universal|project|utility
sync-to:
  - core-standard: pending|complete|N/A
  - skill: pending|complete|N/A
  - command: pending|complete|N/A
  - translations: pending|complete|N/A
```

### Phase 6: Sync Verification (NEW) | 同步驗證（新增）

After implementation, verify all sync targets:

實作後，驗證所有同步目標：

- [ ] Core Standard created/updated (if universal)
- [ ] Skill created/updated (if interactive)
- [ ] Command created/updated (if user-triggered)
- [ ] Translations synchronized

## Spec States | 規格狀態

| State | Description | 說明 |
|-------|-------------|------|
| Draft | Work in progress | 草稿中 |
| Review | Under review | 審查中 |
| Approved | Ready for implementation | 已核准 |
| Implemented | Code complete | 已實作 |
| Archived | Completed or deprecated | 已歸檔 |

## Acceptance Criteria Format | 驗收標準格式

All new acceptance criteria **MUST** use Given/When/Then (GWT) format:

所有新的驗收標準**必須**使用 Given/When/Then (GWT) 格式：

```
Given [precondition],
When [action],
Then [expected outcome].
```

**Examples | 範例：**
- `Given a logged-in user, When they click 'Export', Then a CSV file is downloaded`
- `Given an empty cart, When the user adds an item, Then the cart count shows 1`

**Benefits | 好處：**
- Enables structured BDD derivation via `/derive-bdd` | 支援透過 `/derive-bdd` 進行結構化 BDD 推導
- Reduces ambiguity in acceptance criteria | 減少驗收標準的模糊性
- 1:1 mapping to test scenarios | 與測試場景一對一對應

**Note**: Existing specs are NOT required to retroactively adopt GWT format.

**注意**：現有規格不需要回溯更新為 GWT 格式。

## Session Boundaries | Session 分界建議

For long SDD workflows, consider starting a new AI session at natural phase boundaries to prevent context degradation:

對於長時間的 SDD 工作流程，建議在自然階段邊界開啟新的 AI session 以防止上下文退化：

| Boundary | Phases Before | Phases After |
|----------|--------------|--------------|
| 1 | Create + Review | Implement |
| 2 | Implement | Verify |
| 3 | Verify | Archive |

Use `workflow-state` files and `.project-context/` to persist state across sessions. This is a recommendation, not a hard requirement.

使用 `workflow-state` 檔案和 `.project-context/` 在 session 間持久化狀態。這是建議而非強制要求。

## Spec Document Structure | 規格文件結構

```markdown
# Feature: [Feature Name]

## Overview
Brief description of the feature.

## Requirements
- REQ-001: [Requirement description]
- REQ-002: [Requirement description]

## Technical Design
### Architecture
[Design details]

### API Changes
[API specifications]

### Database Changes
[Schema changes]

## Acceptance Criteria
- AC-1: Given [precondition], When [action], Then [expected outcome]
- AC-2: Given [precondition], When [action], Then [expected outcome]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]

## Rollout Plan
[Deployment strategy]
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/sdd` | Interactive spec creation wizard | 互動式規格建立精靈 |
| `/sdd discuss` | Start discuss phase for a feature | 啟動功能討論階段 |
| `/sdd discuss auth-flow` | Discuss specific feature | 討論特定功能 |
| `/sdd auth-flow` | Create spec for specific feature | 為特定功能建立規格 |
| `/sdd create auth-flow` | Explicit create phase | 明確指定建立階段 |
| `/sdd review` | Review existing specs | 審查現有規格 |
| `/sdd review specs/SPEC-001.md` | Review specific spec | 審查指定規格 |
| `/sdd approve` | List specs pending approval | 列出待核准規格 |
| `/sdd approve specs/SPEC-001.md` | Approve specific spec | 核准指定規格 |
| `/sdd implement` | List approved specs | 列出已核准規格 |
| `/sdd implement specs/SPEC-001.md` | Track implementation for spec | 追蹤指定規格的實作 |
| `/sdd verify` | List implemented specs | 列出已實作規格 |
| `/sdd verify specs/SPEC-001.md` | Verify implementation for spec | 驗證指定規格的實作 |
| `/sdd --evaluate` | Run scope evaluation only | 僅執行範圍評估 |
| `/sdd --sync-check` | Check sync status | 檢查同步狀態 |

## Typical SDD Workflow | 典型 SDD 工作流程

```bash
/sdd discuss user-authentication      # Phase 0.5: Discuss gray areas
/sdd user-authentication              # Phase 1: Create spec
/sdd review specs/SPEC-001.md         # Phase 2: Review
/sdd approve specs/SPEC-001.md        # Phase 3: Approve
/derive-all specs/SPEC-001.md         # Generate test structures
/sdd implement specs/SPEC-001.md      # Phase 4: Track implementation
/sdd verify specs/SPEC-001.md         # Phase 5: Verify (max 3 iterations)
```

## Sync Checklist Template | 同步檢查清單範本

Include in every spec:

```markdown
## Sync Checklist

### From Core Standard
- [ ] Skill created/updated?
- [ ] Command created?
- [ ] Translations synced?

### From Skill
- [ ] Core Standard exists? (or marked as [Scope: Utility])
- [ ] Command created?
- [ ] Translations synced?

### From Command
- [ ] Skill documentation updated?
- [ ] Translations synced?
```

## Reference | 參考

- Full standard: [spec-driven-dev](../spec-driven-dev/SKILL.md)
- Core standard: [spec-driven-development.md](../../core/spec-driven-development.md)
