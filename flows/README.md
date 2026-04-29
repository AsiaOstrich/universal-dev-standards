# UDS Flow Definitions

Machine-readable workflow definitions for software development activities.
Migrated from DevAP `.devap/flows/` (XSPEC-097, 2026-04-28).

## Flows 層子分類（DEC-052）

Flows 層包含兩種子分類：

| 子分類 | 格式 | 目錄 | 定義 |
|--------|------|------|------|
| **Verb-flow** | `*.flow.yaml` | `flows/` | 單一動作編排（本目錄） |
| **Archetype-flow** | `*.archetype.yaml` | `archetypes/` | 使用者旅程編排（多條 verb-flow 的情境組合） |

> 詳見 [archetypes/README.md](../archetypes/README.md) 與 [DEC-052](../../../dev-platform/cross-project/decisions/DEC-052-flow-archetype-layer.md)。

## What are Flows?

Flows are the **universal, tool-agnostic, machine-executable** representation of UDS methodology standards.
They chain together Skills under gate conditions to form enforceable workflows.

### Four-Layer Model (as of 2026-04-29, DEC-051)

```
Standards (.ai.yaml / core/*.md)
    │  "What is correct?"
    ▼
Skills (skills/<name>/SKILL.md)
    │  "How to do ONE action?"
    ▼
Flows (.flow.yaml / TaskPlan .json)
    │  "How to CHAIN actions with gates?"
    ▼
Adapters (integrations/, runtime, agents, configs)
       "Who runs it where?"
```

Each layer answers a different question and references only layers above it (no upward references).

**Adapter sub-types**:
- **Tool Adapter** — tool/language interface (e.g., `integrations/claude-code/`, `integrations/cursor/`)
- **Role Adapter** — agent role prompt + I/O schema (e.g., VibeOps `agents/architect/`)
- **Runtime Adapter** — execution engine (e.g., VibeOps `src/orchestrator/`)
- **Config Adapter** — application-level config (e.g., `vibeops.config.json`)

> Cross-project teaching guide: [dev-platform/cross-project/CONCEPTS.md](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/CONCEPTS.md)

### Standards sub-types (for reference)

Standards include several sub-types that all live in the Standards layer:
- **Core rules**: `.standards/*.ai.yaml` + `core/*.md`
- **Methodologies**: `methodologies/*.methodology.yaml` (combinations of standards)
- **Options / Variants**: `options/*/` (per-standard alternatives)
- **Recipes / Templates**: `recipes/*.yaml`, `templates/*`

### Compatibility note

The earlier three-layer shorthand `Standards → Flows → Adapters` remains valid as a quick reference.
The four-layer model above is the authoritative description that inserts **Skills** as an explicit layer.

## Available Flows

| Flow | File | Standard |
|------|------|---------|
| TDD | tdd.flow.yaml | test-driven-development.ai.yaml |
| BDD | bdd.flow.yaml | behavior-driven-development.ai.yaml |
| ATDD | atdd.flow.yaml | acceptance-test-driven-development.ai.yaml |
| SDD | sdd.flow.yaml | spec-driven-development.ai.yaml |
| Code Review | review.flow.yaml | code-review.ai.yaml |
| Checkin | checkin.flow.yaml | checkin-standards.ai.yaml |
| Commit | commit.flow.yaml | commit-message.ai.yaml |
| Push | push.flow.yaml | push-standards.ai.yaml |
| PR | pr.flow.yaml | (pr-automation-assistant) |

## Execution

Flows are executed by different adapters depending on the AI tool:

- **Claude Code**: `/orchestrate <plan.json>` Skill (Claude-native, no external engine)
- **Future**: VibeOps pipeline engine, Gemini CLI workflows
