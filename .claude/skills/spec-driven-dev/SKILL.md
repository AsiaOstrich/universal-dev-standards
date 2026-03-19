---
name: sdd
scope: universal
description: "[UDS] Create or review specification documents for Spec-Driven Development"
allowed-tools: Read, Write, Grep, Glob, Bash(git:*)
argument-hint: "[spec name or feature | 規格名稱或功能]"
---

# Spec-Driven Development Assistant | 規格驅動開發助手

Create, review, and manage specification documents before writing code.

在撰寫程式碼前，建立、審查和管理規格文件。

## Workflow | 工作流程

```
CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY
```

### 1. Create - Write Spec | 撰寫規格
Define requirements, technical design, acceptance criteria, and test plan.

### 2. Review - Validate | 審查驗證
Check for completeness, consistency, and feasibility with stakeholders.

### 3. Approve - Sign Off | 核准
Get stakeholder sign-off before implementation begins.

### 4. Implement - Code | 實作
Develop following the approved spec, referencing requirements and AC.

### 5. Verify - Confirm | 驗證
Ensure implementation matches spec, all tests pass, AC satisfied.

## Spec States | 規格狀態

| State | Description | 說明 |
|-------|-------------|------|
| **Draft** | Work in progress | 草稿中 |
| **Review** | Under review | 審查中 |
| **Approved** | Ready for implementation | 已核准 |
| **Implemented** | Code complete | 已實作 |
| **Archived** | Completed or deprecated | 已歸檔 |

## Spec Structure | 規格結構

```markdown
# Feature: [Name]

## Overview
Brief description.

## Requirements
- REQ-001: [Description]

## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]

## Technical Design
[Architecture, API changes, database changes]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]
```

## Usage | 使用方式

```
/sdd                     - Interactive spec creation wizard | 互動式規格建立精靈
/sdd auth-flow           - Create spec for specific feature | 為特定功能建立規格
/sdd review              - Review existing specs | 審查現有規格
/sdd --sync-check        - Check sync status | 檢查同步狀態
```

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [spec-driven-development.md](../../core/spec-driven-development.md)
