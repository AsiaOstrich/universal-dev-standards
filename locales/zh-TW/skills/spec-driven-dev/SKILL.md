---
name: spec-driven-dev
source: ../../../../skills/spec-driven-dev/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-06-02
source_hash: 195f50bcbfb7
status: current
description: "[UDS] 在撰寫程式碼前，建立、審查和管理規格文件"
---
<!-- DEPRECATION NOTICE (XSPEC-086 Phase 4, 2026-04-28):
  SDD 生命週期編排（7 階段狀態機、階段轉換、閘門檢查）已遷移至
  採用層（adoption layer，XSPEC-095，2026-04-28）。本 Skill 保留：規格格式定義、狀態
  描述、delta 操作、決策樹。
  若需強制執行的生命週期，請使用你的採用層工具鏈。
-->

# Spec-Driven Development Assistant | 規格驅動開發助手

在撰寫程式碼前，建立、審查和管理規格文件。

> **語言**: [English](../../../../skills/spec-driven-dev/SKILL.md) | 繁體中文

## When to Use `/sdd` vs `uds spec` | 何時使用

| 情境 | `/sdd` | `uds spec` |
|----------|--------|------------|
| 具審查循環的正式功能開發 | ✅ | ❌ |
| 完整規格生命週期（Draft → Archived） | ✅ | ❌ |
| 快速原型 / Vibe coding | ❌ | ✅ |
| 小型漸進式變更 | ❌ | ✅ |
| 需要利害關係人簽核 | ✅ | ❌ |
| 從自然語言意圖產生微規格（micro-spec） | ❌ | ✅ |

> **`/sdd`** = 正式開發的完整規格生命週期
> **`uds spec`** = 快速迭代的輕量微規格

## TL;DR Quick Checklist | 快速檢查清單

- 搜尋現有規格：查看 `specs/`、`docs/specs/` 或專案規格目錄
- 決定範圍：新功能 vs 修改現有功能
- 挑選唯一的規格 ID：`SPEC-NNN` 或 kebab-case 變更 ID
- 撰寫提案並附明確的 AC（Given/When/Then 格式）
- 在開始實作前取得核准
- 依序實作任務，並對照規格驗證
- 完成後將規格歸檔

## Decision Tree | 決策樹

```
New request? | 新需求？
├─ Bug fix restoring spec behavior? → Fix directly | 直接修復
├─ Typo/format/comment? → Fix directly | 直接修復
├─ Dependency update (non-breaking)? → Fix directly | 直接修復
├─ New feature/capability? → Create proposal | 建立提案
├─ Breaking change? → Create proposal | 建立提案
├─ Architecture change? → Create proposal | 建立提案
├─ Agent/role definition (spans multiple features)? → Use spec-type: agent | 使用 Agent SPEC template
└─ Unclear? → Create proposal (safer) | 建立提案（較安全）
```

## Workflow | 工作流程

```
DISCUSS ──► CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY ──► ARCHIVE
```

### 0. Discuss - Clarify Scope | 釐清範圍
在撰寫規格前，捕捉灰色地帶、建立治理原則、解決模糊之處。

### 1. Create - Write Spec | 撰寫規格
定義需求、技術設計、驗收條件與測試計畫。

### 2. Review - Validate | 審查驗證
與利害關係人一同檢查完整性、一致性與可行性。

### 3. Approve - Sign Off | 核准
在開始實作前取得利害關係人簽核。

### 4. Implement - Code | 實作
依照核准的規格進行開發，參照需求與 AC。

### 5. Verify - Confirm | 驗證
確保實作符合規格、所有測試通過、AC 已滿足。

### 6. Archive - Close | 歸檔
將完成的規格歸檔，並附上 commit／PR 連結。

## Spec States | 規格狀態

| 狀態 | 說明（英） | 說明 |
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

### Agent SPEC Structure | Agent 規格結構（`spec-type: agent`）

```markdown
# [SPEC-ID] Agent: [Role Name]
<!-- spec-type: agent -->
<!-- agent-id auto-referenced by feature SPECs -->

## Role Definition
- **Role**: [Agent Name]
- **Responsibility**: [One sentence]
- **Autonomy Level**: L[1-5] (per DEC-065)

## Capability Scope
**Owns:**
- [Capability 1]
- [Capability 2]

**Does NOT own:**
- [Explicit exclusion]

## Interface Contract
### Input
| Message Type | Required Fields | Optional Fields |
|---|---|---|
| [Type] | [fields] | [fields] |

### Output
| Artifact Type | Success Condition | Failure Condition |
|---|---|---|
| [Type] | [condition] | [condition] |

## Agent Interactions
- **Upstream**: [Who calls this agent]
- **Downstream**: [Who this agent calls]
- **Parallel**: [Agents working alongside]

## Related Feature SPECs
- [SPEC-NNN] — [This agent's role in that spec]
```

### Scenario Formatting Rules | 場景格式規則

- 每個場景使用 `#### Scenario:`（h4 標題）
- 每個需求至少要有一個場景
- 使用 **GIVEN/WHEN/THEN** 格式描述結構化行為
- 規範性需求使用 **SHALL/MUST**，建議性內容使用 **SHOULD**

## Delta Operations | 變更操作

修改現有規格時，使用 delta 區段：

| 操作 | 說明（英） | 說明 |
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

`/sdd` 完成後，AI 助手應建議：

> **規格文件已建立。建議下一步 / Specification document created. Suggested next steps:**
> - 執行 `/derive` 從規格推導測試工件 ⭐ **Recommended / 推薦** — Derive test artifacts from spec
> - 執行 `/derive bdd` 僅推導 BDD 場景 — Derive BDD scenarios only
> - 執行 `/derive tdd` 僅推導 TDD 骨架 — Derive TDD skeletons only
> - 審查 AC 完整性，確保所有驗收條件可測試 — Review AC completeness
> - 檢查 UDS 規範覆蓋率 → 執行 `/audit --patterns` — Check UDS standard coverage → Run `/audit --patterns`

## Reference | 參考

- 詳細指南：[guide.md](./guide.md)
- 核心標準：[spec-driven-development.md](../../core/spec-driven-development.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/sdd`](../../../../skills/commands/sdd.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/sdd`](../../../../skills/commands/sdd.md#ai-agent-behavior--ai-代理行為)
