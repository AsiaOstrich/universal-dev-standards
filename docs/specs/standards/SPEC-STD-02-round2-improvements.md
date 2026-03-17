# [SPEC-STD-02] 第二輪 SDD/工作流改進（12 項）

## Status: Implemented
## Created: 2026-03-17 (retroactive)
## Implemented: 2026-03-17
## Commit: 9db8f3d

---

## Summary

基於 GSD、CrewAI、LangGraph、OpenHands、DSPy 五個框架的深入研究，提煉出 12 項標準/文件層改進，涵蓋 SDD 工作流增強、任務定義、工作流狀態、驗證管線、Agent 簽名等。

## Motivation

前一輪已從 GSD/PAUL/CARL 實施 7 項改進。本輪針對更深層的工作流品質問題：
- 缺乏結構化討論階段導致範圍蔓延
- 驗證迴圈可能無限迴旋
- AI 任務缺乏標準結構導致幻覺
- 跨 session 工作流狀態丟失
- 缺乏平行執行和驗證管線機制

## Research Sources

| Source | Key Concepts Extracted |
|--------|----------------------|
| [GSD](https://github.com/gsd-build/get-shit-done) | Discuss phase, wave execution, verification loop cap, state frontmatter |
| [CrewAI](https://github.com/crewAIInc/crewAI) | Validation pipeline, context window management |
| [LangGraph](https://github.com/langchain-ai/langgraph) | Checkpointing, HITL interrupt/resume |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Event sourcing, action-observation stream |
| [DSPy](https://github.com/stanfordnlp/dspy) | Signatures (structured I/O), metric functions |

## Acceptance Criteria

### Phase 1: Foundation

- [x] AC-1: Given a new feature request, When `/sdd discuss` is invoked, Then a structured discussion phase captures gray areas, locks scope, and produces a read_first list before proposal.
- [x] AC-2: Given a spec in verify phase, When verification fails 3 times, Then the loop is capped and 3 human-intervention options are presented.
- [x] AC-3: Given a new AI task definition, When the structured-task-definition standard is applied, Then 4 required fields (read_first, action, acceptance_criteria, verification) are enforced.
- [x] AC-4: Given a multi-phase workflow, When a phase transition occurs, Then state is persisted to `.workflow-state/` and can be restored in a new session.

### Phase 2: Workflow Enhancement

- [x] AC-5: Given a workflow with independent steps, When wave grouping is configured, Then steps in the same wave can execute in parallel.
- [x] AC-6: Given a workflow step output, When validation is configured, Then deterministic checks run first, semantic checks run only after deterministic passes.
- [x] AC-7: Given an agent definition, When signatures are defined, Then structured I/O contracts specify expected inputs and outputs with validation criteria.

### Phase 3: Quality & Traceability

- [x] AC-8: Given a completed SDD verify phase, When a traceability matrix is generated, Then it maps REQ→AC→Test→Implementation→Commit with [INCOMPLETE] markers for gaps.
- [x] AC-9: Given context window at 60%, When the context-budget-awareness rule is active, Then a warning is shown suggesting a new session.
- [x] AC-10: Given a scope change during implementation, When the interrupt checkpoint triggers, Then the workflow pauses, saves state, and presents 3 options.

### Phase 4: Advanced

- [x] AC-11: Given agents in a workflow, When communication protocol is defined, Then artifact passing, reducer patterns, and context isolation are specified.
- [x] AC-12: Given a completed SDD workflow, When trace validation is applied, Then intermediate step quality is verified (discuss resolution, proposal coverage, review addressed, commit AC refs).

## Files Changed

### New Files (6)
- `core/structured-task-definition.md`
- `.standards/structured-task-definition.ai.yaml`
- `ai/standards/structured-task-definition.ai.yaml`
- `core/workflow-state-protocol.md`
- `.standards/workflow-state-protocol.ai.yaml`
- `ai/standards/workflow-state-protocol.ai.yaml`

### Modified Files (53)
- Core definitions: sdd.methodology.yaml, spec-driven-development.ai.yaml, methodology-schema.json
- Skills: sdd.md, methodology.md, spec-analyst.md, agents/README.md, workflows/README.md
- Gemini: sdd.toml
- Translations: 16 files across zh-TW and zh-CN
- Adoption guides, CLAUDE.md, GEMINI.md, README.md, integration-generator.js

## Verification

- [x] 15/15 pre-release sync checks passed
- [x] 1536 tests passed, 0 failed
- [x] JSON Schema validation: `sdd.methodology.yaml valid`
- [x] All SDD workflow references updated to include Discuss phase
- [x] New standards registered in manifest.json and standards-registry.json
