# Workflow State Protocol

**Version**: 1.0.0
**Last Updated**: 2026-03-17
**Applicability**: All projects using multi-phase AI workflows
**Scope**: universal
**Industry Standards**: Inspired by LangGraph checkpointing, OpenHands event sourcing, GSD state frontmatter
**References**: [LangGraph](https://github.com/langchain-ai/langgraph), [OpenHands](https://github.com/All-Hands-AI/OpenHands), [GSD](https://github.com/gsd-build/get-shit-done)

---

## Summary

The Workflow State Protocol defines how to persist and restore workflow state across AI sessions. By combining a structured state file (machine + human readable) with an append-only event log, teams can resume interrupted workflows, audit decision history, and prevent state loss during long-running development processes.

---

## Quick Reference

| Aspect | Description |
|--------|-------------|
| **State Directory** | `.workflow-state/` (project root) |
| **State File** | `.workflow-state/{workflow}-{id}.yaml` |
| **Event Log** | `.workflow-state/{workflow}-{id}.log.yaml` |
| **Save Trigger** | Phase transitions, important decisions, session boundaries |
| **Load Trigger** | Session start, workflow resume, `/sdd` with existing spec |
| **Gitignore** | Recommended: add `.workflow-state/` to `.gitignore` |

---

## State File Format

The state file combines machine-readable frontmatter with a human-readable body, following the GSD frontmatter pattern.

### Structure

```yaml
# .workflow-state/sdd-SPEC-042.yaml

# === Machine-Readable Metadata ===
workflow: sdd
spec_id: SPEC-042
title: Add rate limiting to login endpoint
current_phase: implementation
status: in-progress
iteration_count: 0
created: 2026-03-17T10:00:00Z
updated: 2026-03-17T14:30:00Z
phases_completed:
  - discuss
  - proposal
  - review
artifacts:
  spec: docs/specs/SPEC-042.md
  tests: tests/auth/login.test.js
  implementation: src/auth/login.js

# === Human-Readable Summary ===
progress_summary: |
  Rate limiting feature for login endpoint.
  Spec approved after 1 review iteration.
  Currently implementing AC-2 (valid credentials still work).

completed_steps:
  - "AC-1: Rate limit check added to login.js:45"
  - "AC-1: Test cases added for rate limit exceeded"

next_steps:
  - "AC-2: Verify no regression on valid login flow"
  - "AC-3: Add rate limit headers to response"

open_questions:
  - "Should rate limiting be per-IP or per-user? (deferred to SPEC-043)"

decisions:
  - date: 2026-03-17
    decision: Use sliding window algorithm for rate limiting
    reason: Better UX than fixed window, prevents burst at window boundaries
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `workflow` | string | Workflow type (e.g., `sdd`, `feature-dev`) |
| `spec_id` | string | Spec or task identifier |
| `current_phase` | string | Active phase ID |
| `status` | enum | `in-progress`, `paused`, `blocked`, `completed`, `abandoned` |
| `updated` | datetime | Last state update timestamp |
| `phases_completed` | list | Ordered list of completed phase IDs |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Human-friendly description |
| `iteration_count` | number | Verify iteration counter (for loop cap) |
| `created` | datetime | Workflow start time |
| `artifacts` | map | Key files produced by the workflow |
| `progress_summary` | text | Current status in plain language |
| `completed_steps` | list | What has been done |
| `next_steps` | list | What remains to do |
| `open_questions` | list | Unresolved questions |
| `decisions` | list | Key decisions made during workflow |

---

## Event Log Format

The event log is an append-only YAML list that records workflow events for auditability. Inspired by OpenHands' action-observation stream.

### Structure

```yaml
# .workflow-state/sdd-SPEC-042.log.yaml

- timestamp: 2026-03-17T10:00:00Z
  event_type: phase_enter
  phase: discuss
  actor: user
  summary: Started discuss phase for rate limiting feature

- timestamp: 2026-03-17T10:15:00Z
  event_type: decision
  phase: discuss
  actor: ai
  summary: "Scope locked: rate limiting for login only, not all endpoints"
  details: "User confirmed per-endpoint approach. Global rate limiting deferred."

- timestamp: 2026-03-17T10:30:00Z
  event_type: phase_exit
  phase: discuss
  actor: ai
  summary: Discuss phase complete, all gray areas resolved

- timestamp: 2026-03-17T11:00:00Z
  event_type: checkpoint
  phase: proposal
  actor: ai
  summary: Spec SPEC-042 created with 3 acceptance criteria

- timestamp: 2026-03-17T14:00:00Z
  event_type: error
  phase: implementation
  actor: ai
  summary: "Test failure in AC-2: existing login test broke after rate limiter"
  details: "rateLimiter.check() was called before user lookup, causing null ref"
```

### Event Types

| Type | Description | When to Log |
|------|-------------|-------------|
| `phase_enter` | Workflow enters a new phase | Phase transition |
| `phase_exit` | Workflow exits a phase | Phase completion |
| `checkpoint` | Notable milestone within a phase | Key artifact created |
| `decision` | Important decision made | Design choice, scope change |
| `error` | Error or failure encountered | Test failure, build error |
| `interruption` | Workflow paused (HITL or context limit) | Human intervention needed |
| `resumption` | Workflow resumed from saved state | Session restart |

### Event Fields

| Field | Required | Description |
|-------|----------|-------------|
| `timestamp` | Yes | ISO 8601 timestamp |
| `event_type` | Yes | One of the defined event types |
| `phase` | Yes | Current workflow phase |
| `actor` | No | `user`, `ai`, or `system` |
| `summary` | Yes | One-line description |
| `details` | No | Extended information |

---

## Rules

### State Save Rules

1. **Save on phase transition** (required): When a workflow moves from one phase to another, the state file must be updated with the new phase and completed phases list.

2. **Save on session boundary** (required): Before ending an AI session during an active workflow, save current state so the next session can resume.

3. **Save on important decision** (recommended): When a significant design decision is made, record it in the state file's `decisions` list and the event log.

### State Load Rules

1. **Check on session start** (required): At the beginning of an AI session, check `.workflow-state/` for any `in-progress` or `paused` workflows. If found, inform the user and offer to resume.

2. **Load on workflow command** (required): When the user invokes a workflow command (e.g., `/sdd implement SPEC-042`), check for existing state and load it instead of starting fresh.

3. **Validate state freshness** (recommended): If the state file's `updated` timestamp is older than 7 days, warn the user that the state may be stale.

---

## Directory Structure

```
project-root/
├── .workflow-state/           # Workflow state directory
│   ├── sdd-SPEC-042.yaml     # Active SDD workflow state
│   ├── sdd-SPEC-042.log.yaml # Event log for SPEC-042
│   ├── sdd-SPEC-038.yaml     # Completed workflow (status: completed)
│   └── feature-dev-auth.yaml  # Feature dev workflow state
├── .gitignore                 # Should include .workflow-state/
└── ...
```

### Gitignore Recommendation

Add to `.gitignore`:
```
# Workflow state (session-specific, not for version control)
.workflow-state/
```

**Rationale**: Workflow state is session-specific and contains transient execution data. It should not be version-controlled as it may contain sensitive context or become stale.

**Exception**: Teams that want to share workflow state across developers may choose to version-control it, but should clean up completed workflows regularly.

---

## Integration with SDD

When used with Spec-Driven Development:

| SDD Phase | State Action |
|-----------|-------------|
| Discuss | Create state file, log gray areas and scope decisions |
| Proposal | Update with spec artifact path |
| Review | Log review comments and iterations |
| Implementation | Track AC progress, log commits |
| Verification | Record iteration count (for loop cap), log results |
| Archive | Set status to `completed`, final event log entry |

---

## Integration with Context Reset

When starting a new AI session:

1. Check `.workflow-state/` for active workflows
2. If found, load the state file's `progress_summary`, `next_steps`, and `open_questions`
3. Load only the standards relevant to the current phase (via context-aware-loading)
4. Continue from where the previous session left off

This provides efficient context restoration without loading the entire conversation history.

---

## Best Practices

### Do's

- Save state at every phase transition
- Keep `progress_summary` concise and current
- Log decisions with their reasoning
- Clean up completed workflows periodically

### Don'ts

- Don't store large artifacts in the state file (use paths instead)
- Don't rely solely on state files for critical data (keep specs and code as source of truth)
- Don't version-control state files by default
- Don't modify event logs (append-only)

---

## Related Standards

- [Spec-Driven Development](spec-driven-development.md) — Primary workflow that uses state protocol
- [Project Context Memory](project-context-memory.md) — Persistent decisions in `.project-context/`
- [Context-Aware Loading](context-aware-loading.md) — Phase-based standard loading
- [Structured Task Definition](structured-task-definition.md) — Task structure within workflow steps

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-17 | Initial standard: state file format, event log, save/load rules |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
