---
description: [UDS] Create or review specification documents for Spec-Driven Development
allowed-tools: Read, Write, Grep, Glob, Bash(git:*), Bash(npm test:*)
argument-hint: "[create|review|approve|implement|verify] [spec name or file | 規格名稱或檔案]"
---

# Spec-Driven Development Assistant | 規格驅動開發助手

Create, review, approve, implement, and verify specification documents — full SDD lifecycle management.

建立、審查、核准、實作和驗證規格文件 — 完整 SDD 生命週期管理。

## SDD Workflow | SDD 工作流程

```
/sdd create ──► /sdd review ──► /sdd approve ──► /sdd implement ──► /sdd verify
```

### Phase 1: Create — Write Spec | 撰寫規格

Define requirements, technical design, acceptance criteria, and test plan.

定義需求、技術設計、驗收標準和測試計畫。

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

**Suggested commit format | 建議 commit 格式：**
```
feat(<scope>): implement AC-N — <description>

Implements acceptance criteria AC-N from SPEC-XXX.
See: docs/specs/SPEC-XXX.md#AC-N
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
```

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
/sdd user-authentication              # Phase 1: Create spec
/sdd review specs/SPEC-001.md         # Phase 2: Review
/sdd approve specs/SPEC-001.md        # Phase 3: Approve
/derive-all specs/SPEC-001.md         # Generate test structures
/sdd implement specs/SPEC-001.md      # Phase 4: Track implementation
/sdd verify specs/SPEC-001.md         # Phase 5: Verify
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
