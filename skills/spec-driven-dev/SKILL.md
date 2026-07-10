---
name: sdd
scope: universal
description: "[UDS] Create or review specification documents for Spec-Driven Development"
allowed-tools: Read, Write, Grep, Glob, Bash(git:*)
argument-hint: "[spec name or feature | 規格名稱或功能]"
---
<!-- DEPRECATION NOTICE (XSPEC-086 Phase 4, 2026-04-28):
  SDD lifecycle orchestration (7-phase state machine, phase transitions, gate checks) relocated to
  adoption layer (XSPEC-095, 2026-04-28). This Skill retains: spec format definition, state
  descriptions, delta operations, decision tree.
  For enforced lifecycle execution, use your adoption layer's toolchain.
-->

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
├─ Agent/role definition (spans multiple features)? → Use spec-type: agent | 使用 Agent SPEC template
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

## Cross-Artifact Analysis (`/sdd analyze`) | 跨 artifact 一致性檢查

The **executable face** of the acceptance-criteria-traceability standard +
forward-derivation single-spine principle (XSPEC-262). Validates that every test
is a faithful projection of the AC spine across specs.
本命令是 acceptance-criteria-traceability + forward-derivation single-spine 的**可執行面**，驗證每個測試是否忠實投影 AC 主幹。

| Signal | Meaning | Gate |
|--------|---------|------|
| **orphan test** | `@SPEC-NNN @AC-N` references an AC no spec defines / 引用不存在的 AC | 🔴 BLOCKING |
| **uncovered** | an AC has no `@SPEC-NNN @AC-N` reference / AC 無測試引用 | report only / 僅報告 |
| **not_implemented** | AC marked so in its `.ac.yaml` / `.ac.yaml` 標記 | 🔴 BLOCKING before UAT |
| **cross-spec conflict** | same AC id defined in >1 spec / 同 AC id 跨多 spec | 🔴 BLOCKING |
| **orphan .feature** | Gherkin `@AC-N` tag referencing a non-existent AC / @AC-N 引用不存在 | 🔴 BLOCKING |
| **AC w/o scenario** | AC has no `.feature` scenario (when BDD in use) / AC 無 BDD scenario | report only / 僅報告 |
| **user-guide drift** | user-guide `T-N` with no matching journey/E2E test id / 手冊 T-N 無對應測試 | 🔴 BLOCKING |

Coverage % uses the acceptance-criteria-traceability formula (not_implemented excluded). `--json` for CI.

```
npm run sdd:analyze -- --specs specs --tests tests [--userguide docs] [--json]
```
`--userguide <dir>` enables user-guide↔E2E drift detection (T-NNN, XSPEC-260/257). / 啟用手冊↔E2E drift 偵測。

**vs `/ac-coverage`**: ac-coverage = per-spec detailed AC↔test matrix；`/sdd analyze` = cross-spec/batch consistency + orphan detection（互補、不取代）。

## Spec-vs-Code Convergence Check | 規格與實作漂移偵測（2026-07-10，spec-kit `/converge` 借鑑）

**vs `/sdd analyze`**：`/sdd analyze` 問「測試有沒有正確引用 AC」（引用完整性，deterministic script）；convergence check 問「程式碼的實際行為是否真的符合 spec 描述」（語意漂移，需要讀碼判斷，走 `sdd.flow.yaml` verify 階段的 `spec-match-check` ai-check step）——兩者互補、檢查的是不同層次的問題，不重疊。

雖然定義在 7-phase 狀態機的 `verify` 階段（一次性 gate），**這個檢查可以在任何時間點對已歸檔的 spec 獨立重跑**——用於偵測 spec 歸檔後、code 持續演進累積出的漂移（例如後續 commit 改了行為但沒回頭更新 spec）。重跑時：

- 落差分類：`missing`（spec 要求但沒做）／`partial`（做一半）／`contradicts`（行為與描述不同）／`unrequested`（做了沒被要求的事）
- 嚴重度：`CRITICAL`（違反 spec 明確 MUST）／`HIGH`／`MEDIUM`／`LOW`
- 唯讀比對——只列出發現，不自動修改 spec 或程式碼
- 適合定期（如季度）對重要 spec 抽查，或懷疑特定 spec 已過時時針對性執行

## Usage | 使用方式

```
/sdd                     - Interactive spec creation wizard | 互動式規格建立精靈
/sdd auth-flow           - Create spec for specific feature | 為特定功能建立規格
/sdd review              - Review existing specs | 審查現有規格
/sdd analyze             - Cross-artifact consistency check | 跨 artifact 一致性檢查
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
