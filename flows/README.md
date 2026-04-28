# UDS Flow Definitions

Machine-readable workflow definitions for software development activities.
Migrated from DevAP `.devap/flows/` (XSPEC-097, 2026-04-28).

## What are Flows?

Flows are the **universal, tool-agnostic, machine-executable** representation of UDS methodology standards.
They bridge the gap between `.standards/*.ai.yaml` (rules) and tool-specific adapters (Skills).

```
Standards (.ai.yaml) → Flows (.flow.yaml) → Adapters (Skills, Workflows, Prompts)
```

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
