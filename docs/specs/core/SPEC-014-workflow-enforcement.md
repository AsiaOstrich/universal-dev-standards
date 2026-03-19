# SPEC-014: Workflow Enforcement Gates

> **Status**: Implemented
> **Author**: AI Assistant
> **Date**: 2026-03-19
> **Type**: Feature
> **Scope**: universal
> **Retroactive**: Yes — code implemented before spec creation

---

## 1. Objective

Provide machine-enforceable workflow gates that prevent phase skipping in structured development methodologies (SDD, TDD, BDD). Transform UDS workflows from "documentation only" to "documentation + execution" by having AI assistants automatically check prerequisites before executing workflow phases.

讓 UDS 工作流程從「純文件」變成「文件 + 執行」，透過 AI 助手在執行工作流程階段前自動檢查前置條件。

## 2. Problem Statement

### Current Behavior

- UDS defines comprehensive workflows (SDD 6 phases, TDD Red-Green-Refactor, BDD 4 phases)
- File/commit level enforcement exists (git hooks, commitlint, 17 check scripts)
- **Workflow level**: Pure documentation, no enforcement — developers can skip phases freely
- **Methodology level**: Skills are guidance only, cannot prevent skipping steps
- `WorkflowStateManager` exists but is not connected to the skill system

### Desired Behavior

- AI assistants check prerequisites before executing any workflow phase
- Phase skipping is blocked (enforce mode) or warned (suggest mode)
- Existing `WorkflowStateManager` is connected to a new `WorkflowGate` validator
- Git hooks provide non-blocking workflow compliance warnings
- All 10+ AI agent integrations include workflow gate instructions

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | Skill pre-flight checks in sdd/tdd/bdd/commit commands | P0 |
| REQ-002 | Machine-readable workflow-enforcement.ai.yaml standard | P0 |
| REQ-003 | CLAUDE.md and all AI agent integrations include gate instructions | P0 |
| REQ-004 | WorkflowGate module validates phase transitions | P1 |
| REQ-005 | Workflow phase definitions for SDD/TDD/BDD | P1 |
| REQ-006 | Session start protocol checks for active workflows | P1 |
| REQ-007 | Pre-commit hook warns on workflow compliance (non-blocking) | P2 |
| REQ-008 | Commit-msg hook suggests spec references for feat/fix (non-blocking) | P2 |
| REQ-009 | Three enforcement modes: enforce, suggest, off | P0 |
| REQ-010 | integration-generator.js auto-generates gate content | P0 |

## 4. Acceptance Criteria

### AC-1: SDD Phase Gate Enforcement

**Given** a project with an SDD workflow and enforcement mode = `enforce`
**When** the user invokes `/sdd implement` without an Approved spec
**Then** the AI refuses to proceed and guides the user to `/sdd approve` first

### AC-2: TDD Red-Before-Green Enforcement

**Given** a TDD workflow session in RED phase
**When** the user asks to write implementation code before a failing test exists
**Then** the AI reminds the user of the TDD contract and offers to write the test first

### AC-3: BDD Feature-Before-Step Enforcement

**Given** a BDD workflow session
**When** the user asks to write step definitions before a `.feature` file exists
**Then** the AI guides the user to the FORMULATION phase first

### AC-4: Commit Spec Reference Suggestion

**Given** active specs exist in `docs/specs/` and the user is making a `feat` commit
**When** the commit message has no `Refs: SPEC-XXX` footer
**Then** the AI suggests adding a spec reference (non-blocking advisory)

### AC-5: Session Start Workflow Report

**Given** active workflow state files exist in `.workflow-state/`
**When** a new AI session begins
**Then** the AI reports active workflows and offers to resume

### AC-6: Enforcement Mode Configuration

**Given** a project with `.uds/config.yaml` containing `workflow.enforcement_mode: suggest`
**When** a phase gate prerequisite fails
**Then** the AI shows a warning but allows the user to proceed

### AC-7: Pre-commit Workflow Warning

**Given** a project with the check-workflow-compliance.sh hook installed
**When** the developer commits with active workflows and no spec reference
**Then** a non-blocking warning is shown (commit proceeds regardless)

### AC-8: All AI Agents Updated

**Given** UDS supports 10+ AI agent integrations
**When** a project adopts UDS with workflow-enforcement standard
**Then** all AI agent instruction files include workflow gate instructions

## 5. Technical Design

### Architecture: Four-Layer Enforcement

```
Layer 0 (P0): AI-Level Enforcement
├── Skill Pre-Flight Checks (sdd.md, tdd.md, bdd.md, commit.md)
├── workflow-enforcement.ai.yaml (machine-readable standard)
└── CLAUDE.md + all AI agent integration templates

Layer 1 (P1): CLI-Level Integration
├── WorkflowGate (cli/src/utils/workflow-gate.js)
├── Workflow Definitions (cli/src/config/workflow-definitions.js)
└── Session Start Report (WorkflowGate.getSessionStartReport())

Layer 2 (P2): Git-Level Warnings (non-blocking)
├── check-workflow-compliance.sh (pre-commit hook)
├── check-commit-spec-reference.sh (commit-msg hook)
└── commit-msg husky hook
```

### Key Design Decisions

1. **Warn, don't block at Git level** — Git hooks only warn; AI layer handles blocking (can explain why)
2. **AI enforcement is primary** — Highest leverage point: AI refuses to skip phases
3. **Reuse existing infrastructure** — `WorkflowStateManager` is the state engine, `WorkflowGate` is the validator
4. **`.workflow-state/` as source of truth** — Both AI instructions and CLI check the same state files
5. **Progressive adoption** — Projects choose `enforce` / `suggest` / `off` via config

### Files Created

| File | Purpose |
|------|---------|
| `.standards/workflow-enforcement.ai.yaml` | Machine-readable AI standard |
| `core/workflow-enforcement.md` | Human-readable core standard |
| `ai/standards/workflow-enforcement.ai.yaml` | AI standards directory copy |
| `cli/src/utils/workflow-gate.js` | Phase transition validator |
| `cli/src/config/workflow-definitions.js` | SDD/TDD/BDD phase graph definitions |
| `scripts/check-workflow-compliance.sh` | Pre-commit warning script |
| `scripts/check-commit-spec-reference.sh` | Commit-msg spec suggestion script |
| `cli/.husky/commit-msg` | Commit-msg hook |
| `locales/zh-TW/core/workflow-enforcement.md` | Traditional Chinese translation |
| `locales/zh-CN/core/workflow-enforcement.md` | Simplified Chinese translation |

### Files Modified

| File | Change |
|------|--------|
| `skills/commands/sdd.md` | Added Pre-Flight Checks section |
| `skills/commands/tdd.md` | Added Pre-Flight Checks section |
| `skills/commands/bdd.md` | Added Pre-Flight Checks section |
| `skills/commands/commit.md` | Added Pre-Flight Checks section |
| `cli/src/utils/integration-generator.js` | Added generateWorkflowGateContent(), STANDARD_TASK_MAPPING, STANDARD_DESCRIPTIONS |
| `cli/.husky/pre-commit` | Added check-workflow-compliance.sh call |
| `cli/standards-registry.json` | Added workflow-enforcement entry |
| `CLAUDE.md` | Added standard index entry + MUST follow row |
| `integrations/claude-code/CLAUDE.md` | Added Workflow Enforcement Gates section |
| `integrations/cursor/.cursorrules` | Added Workflow Enforcement Gates section |
| `integrations/windsurf/.windsurfrules` | Added Workflow Enforcement Gates section |
| `integrations/cline/.clinerules` | Added Workflow Enforcement Gates section |
| `integrations/codex/AGENTS.md` | Added Workflow Enforcement Gates section |
| `integrations/gemini-cli/GEMINI.md` | Added Workflow Enforcement Gates section |
| `integrations/github-copilot/copilot-instructions.md` | Added Workflow Enforcement Gates section |
| `integrations/google-antigravity/.antigravity/rules.md` | Added Workflow Enforcement Gates section |
| `integrations/opencode/AGENTS.md` | Added Workflow Enforcement Gates section |
| `integrations/openspec/AGENTS.md` | Added Workflow Enforcement Gates section (customized) |
| `integrations/spec-kit/AGENTS.md` | Added Workflow Enforcement Gates section (customized) |

## 6. Test Plan

- [x] Unit tests: `cd cli && npm run test:quick` — 1566 passed, 0 failed
- [x] Full test suite: `cd cli && npm test` — 1687 passed (including E2E), 0 failed
- [ ] Manual validation: invoke `/sdd implement` without approved spec → AI should refuse
- [ ] Manual validation: `uds workflow gate sdd implement` → should report Blocked/Allowed
- [ ] Manual validation: `git commit -m "feat(auth): 新增登入"` → should see spec reference suggestion

## 7. Relationship to Other Specs

| Spec | Relationship |
|------|-------------|
| SPEC-013 (Workflow State Tracking) | This spec builds ON TOP of SPEC-013's state infrastructure |
| SPEC-012 (Context-Aware Loading) | Workflow gates use context-aware loading for standard resolution |

## 8. Sync Checklist

### From Core Standard
- [x] AI standard created (`.standards/workflow-enforcement.ai.yaml`)
- [x] Skill commands updated (sdd, tdd, bdd, commit)
- [x] Translations synced (zh-TW, zh-CN)

### From Skill
- [x] Core Standard exists (`core/workflow-enforcement.md`)
- [x] Integration templates updated (all 10+ agents)
- [x] CLI registry updated (`standards-registry.json`)
