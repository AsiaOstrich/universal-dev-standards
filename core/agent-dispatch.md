# Agent Dispatch & Parallel Coordination

> **Language**: English | [繁體中文](../locales/zh-TW/core/agent-dispatch.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-20
**Applicability**: AI-assisted development with multi-agent orchestration
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — dispatching-parallel-agents, subagent-driven-development (MIT)

---

## Purpose

Define standards for dispatching AI sub-agents in parallel, coordinating their work, and handling their return states. This standard ensures efficient parallelization while preventing file conflicts and integration failures.

定義 AI 子代理的並行派遣、工作協調與狀態回報標準。確保高效並行化的同時，防止檔案衝突與整合失敗。

---

## Glossary

| Term | Definition |
|------|-----------|
| Sub-agent | An AI agent spawned by an orchestrator to handle a specific task |
| Independent Domain | A task scope with no shared mutable state with other tasks |
| Status Protocol | The standardized return states a sub-agent must report |
| File Conflict | When multiple agents modify the same file concurrently |

---

## Core Principle — Independence Before Parallelism

> **Before dispatching agents in parallel, verify their task domains are independent (no shared mutable state).**

派遣前必須識別獨立域 — 無共享可變狀態才可並行。

---

## Prompt Design Principles

Every sub-agent prompt must follow three principles:

### 1. Focused（聚焦）

Each agent handles exactly one problem domain. Do not combine unrelated tasks.

每個代理只處理單一問題域，不混合無關任務。

### 2. Self-contained（自足）

The prompt includes all context needed for execution. The agent should not need to ask questions or search for additional information.

Prompt 包含執行所需的完整上下文，代理不需要額外提問或搜尋。

### 3. Specific Output（明確輸出）

Define exactly what format the agent should return its results in.

明確定義期望的回報格式。

---

## Status Protocol

Every sub-agent must report one of four statuses upon completion:

| Status | Description | Orchestrator Action |
|--------|-------------|-------------------|
| `DONE` | Task completed successfully | Continue to next task |
| `DONE_WITH_CONCERNS` | Completed but with concerns to record | Log concerns, continue |
| `NEEDS_CONTEXT` | Needs more context to complete | Inject context, re-dispatch (not a retry) |
| `BLOCKED` | Cannot complete, needs escalation | Upgrade model tier or split task |

### Status Decision Flow

```
Agent completes work
  ├── All acceptance criteria met? → DONE
  ├── Criteria met but concerns exist? → DONE_WITH_CONCERNS
  ├── Missing information to proceed? → NEEDS_CONTEXT
  └── Fundamentally unable to complete? → BLOCKED
```

---

## Conflict Detection

When parallel agents return, the orchestrator must:

1. **Check for file conflicts** — did multiple agents modify the same file?
2. **Run the full test suite** — verify integration after merging all changes
3. **Resolve conflicts** — either automatically or flag for human review

```
Agent A (modifies: src/auth.ts, src/auth.test.ts)  ─┐
                                                      ├─→ Conflict check → Integration test
Agent B (modifies: src/api.ts, src/api.test.ts)     ─┘
```

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| AD-001 | Multiple agents edit the same file | Flag conflict, require merge resolution | Critical |
| AD-002 | Agent reports BLOCKED | Upgrade model tier and retry once | High |
| AD-003 | All parallel agents complete | Run full test suite to verify integration | High |

---

## Examples

### Good: Parallel Independent Tasks

```yaml
# Two agents working on independent modules
Agent 1:
  task: "Add rate limiting to /api/users endpoint"
  files: [src/api/users.ts, src/api/users.test.ts]

Agent 2:
  task: "Add caching to /api/products endpoint"
  files: [src/api/products.ts, src/api/products.test.ts]

# No shared files → safe to parallelize
```

### Bad: Parallel Dependent Tasks

```yaml
# Two agents modifying shared state
Agent 1:
  task: "Refactor database connection pool"
  files: [src/db.ts]  # ⚠️ shared file

Agent 2:
  task: "Add connection retry logic"
  files: [src/db.ts]  # ⚠️ conflict!
```

---

## References

- **Superpowers**: [dispatching-parallel-agents](https://github.com/obra/superpowers), [subagent-driven-development](https://github.com/obra/superpowers) (MIT)
- **MapReduce**: Conceptual parallel execution model
- **Actor Model**: Independent agent communication pattern
