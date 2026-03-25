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

## When to Use `/sdd` vs `uds spec` | 何時使用

| Scenario | `/sdd` | `uds spec` |
|----------|--------|------------|
| Formal feature development with review cycle | ✅ | ❌ |
| Full spec lifecycle (Draft → Archived) | ✅ | ❌ |
| Quick prototyping / Vibe coding | ❌ | ✅ |
| Small incremental changes | ❌ | ✅ |
| Stakeholder sign-off required | ✅ | ❌ |
| Micro-spec from natural language intent | ❌ | ✅ |

> **`/sdd`** = Full specification lifecycle for formal development
> **`uds spec`** = Lightweight micro-specs for rapid iteration
>
> **`/sdd`** = 正式開發的完整規格生命週期
> **`uds spec`** = 快速迭代的輕量微規格

## TL;DR Quick Checklist | 快速檢查清單

- Search existing specs: look in `specs/`, `docs/specs/`, or project spec directory
- Decide scope: new feature vs modify existing capability
- Pick a unique spec ID: `SPEC-NNN` or kebab-case change ID
- Write proposal with clear AC (Given/When/Then format)
- Get approval before implementation begins
- Implement tasks sequentially, verify against spec
- Archive spec after completion

## Decision Tree | 決策樹

```
New request? | 新需求？
├─ Bug fix restoring spec behavior? → Fix directly | 直接修復
├─ Typo/format/comment? → Fix directly | 直接修復
├─ Dependency update (non-breaking)? → Fix directly | 直接修復
├─ New feature/capability? → Create proposal | 建立提案
├─ Breaking change? → Create proposal | 建立提案
├─ Architecture change? → Create proposal | 建立提案
└─ Unclear? → Create proposal (safer) | 建立提案（較安全）
```

## Workflow | 工作流程

```
DISCUSS ──► CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY ──► ARCHIVE
```

### 0. Discuss - Clarify Scope | 釐清範圍
Capture gray areas, establish governing principles, resolve ambiguities before writing spec.

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

### 6. Archive - Close | 歸檔
Archive completed spec with links to commits/PRs.

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
# [SPEC-ID] Feature: [Name]

## Overview
Brief description of the proposed change.

## Motivation
Why is this change needed? What problem does it solve?

## Requirements
### Requirement: [Name]
The system SHALL [behavior description].

#### Scenario: [Success case]
- **GIVEN** [initial context]
- **WHEN** [action performed]
- **THEN** [expected result]

## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]

## Technical Design
[Architecture, API changes, database changes]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]
```

### Scenario Formatting Rules | 場景格式規則

- Use `#### Scenario:` (h4 header) for each scenario
- Every requirement MUST have at least one scenario
- Use **GIVEN/WHEN/THEN** format for structured behavior
- Use **SHALL/MUST** for normative requirements, **SHOULD** for recommendations

## Delta Operations | 變更操作

When modifying existing specs, use delta sections:

| Operation | Description | 說明 |
|-----------|-------------|------|
| `## ADDED Requirements` | New capabilities | 新增功能 |
| `## MODIFIED Requirements` | Changed behavior | 修改行為 |
| `## REMOVED Requirements` | Deprecated features | 移除功能 |
| `## RENAMED Requirements` | Name changes | 重新命名 |

## Usage | 使用方式

```
/sdd                     - Interactive spec creation wizard | 互動式規格建立精靈
/sdd auth-flow           - Create spec for specific feature | 為特定功能建立規格
/sdd review              - Review existing specs | 審查現有規格
/sdd --sync-check        - Check sync status | 檢查同步狀態
```

## Next Steps Guidance | 下一步引導

After `/sdd` completes, the AI assistant should suggest:

> **規格文件已建立。建議下一步 / Specification document created. Suggested next steps:**
> - 執行 `/derive` 從規格推導測試工件 ⭐ **Recommended / 推薦** — Derive test artifacts from spec
> - 執行 `/derive bdd` 僅推導 BDD 場景 — Derive BDD scenarios only
> - 執行 `/derive tdd` 僅推導 TDD 骨架 — Derive TDD skeletons only
> - 審查 AC 完整性，確保所有驗收條件可測試 — Review AC completeness
> - 檢查 UDS 規範覆蓋率 → 執行 `/audit --patterns` — Check UDS standard coverage → Run `/audit --patterns`

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [spec-driven-development.md](../../core/spec-driven-development.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/sdd`](../commands/sdd.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/sdd`](../commands/sdd.md#ai-agent-behavior--ai-代理行為)
