# SPEC-013: Workflow State Tracking

> **Status**: Approved
> **Author**: AI Assistant
> **Date**: 2026-03-16
> **Type**: Enhancement
> **Scope**: universal

---

## 1. Objective

Extend the Project Context Memory system with a `workflow-state` entry type to enable cross-session workflow state tracking. This allows AI assistants to resume interrupted workflows and provide context-aware suggestions based on the current development phase.

Inspired by the GSD framework's state tracking principle: always know where you are in the process.

## 2. Problem Statement

### Current Behavior

- Project Context Memory supports 6 types: `decision`, `convention`, `structure`, `glossary`, `constraint`, `workflow`
- The `workflow` type stores process rules but not workflow *state* (current phase, progress, blockers)
- When a conversation ends mid-workflow (e.g., mid-release, mid-refactor), the next session has no awareness of the interrupted state
- AI assistants cannot provide phase-appropriate suggestions

### Desired Behavior

- New `workflow-state` type captures the current state of an ongoing workflow
- States are stored in `.project-context/` with clear lifecycle (active → completed → archived)
- AI assistants can read workflow state at session start and offer to resume
- Stale workflow states are detected and flagged for cleanup

## 3. Requirements

| ID | Description | Priority |
|----|-------------|----------|
| REQ-001 | `workflow-state` type added to project-context-memory schema | P0 |
| REQ-002 | Workflow state entries include: phase, progress, blockers, next-steps | P0 |
| REQ-003 | AI proactively checks for active workflow states at session start | P1 |
| REQ-004 | Stale workflow states (>7 days inactive) flagged for review | P1 |
| REQ-005 | Workflow state entries auto-archive when workflow completes | P2 |

## 4. Acceptance Criteria

### AC-1: Workflow State Schema

**Given** the project-context-memory standard
**When** a `workflow-state` entry is created
**Then** it includes: `workflow` (name), `phase` (current step), `progress` (percentage or checklist), `blockers` (list), `next-steps` (list)

### AC-2: Proactive State Check

**Given** active workflow-state entries exist in `.project-context/`
**When** an AI session begins
**Then** the AI surfaces a summary: "Active workflow detected: [name] at phase [phase]. Resume?"

### AC-3: Stale State Detection

**Given** a workflow-state entry with `updated_at` older than 7 days
**When** the AI scans `.project-context/` during session start
**Then** it flags the entry: "Stale workflow: [name] hasn't been updated in N days. Archive or resume?"

### AC-4: Auto-Archive on Completion

**Given** a workflow-state entry where all next-steps are completed
**When** the AI detects completion (progress = 100% or all checklist items done)
**Then** it suggests archiving: "Workflow [name] appears complete. Archive?"

## 5. Workflow State Schema

```markdown
---
id: "PRJ-2026-0042"
type: workflow-state
status: active
workflow: "release-v5.1.0"
phase: "beta-testing"
progress:
  completed: ["alpha-release", "internal-validation"]
  current: "beta-testing"
  remaining: ["stable-release", "changelog-finalize"]
  percentage: 40
blockers:
  - "Waiting for CI fix on Windows tests"
next_steps:
  - "Fix Windows CI (#234)"
  - "Collect beta feedback"
  - "Prepare stable release notes"
created_at: "2026-03-10"
updated_at: "2026-03-16"
scope:
  - "cli/**"
  - "scripts/**"
triggers:
  - "release"
  - "version"
  - "publish"
---

# Release v5.1.0 Workflow State

## Current Phase: Beta Testing

Beta v5.1.0-beta.1 published on 2026-03-14.
Waiting for feedback and CI fix before stable release.

## Decision Log
- 2026-03-10: Started alpha phase
- 2026-03-12: Alpha passed, promoted to beta
- 2026-03-14: Beta published, Windows CI issue found
```

## 6. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `core/project-context-memory.md` | Modify | Add `workflow-state` type and staleness rules |
| `.standards/project-context-memory.ai.yaml` | Modify | Add `workflow-state` schema and proactive rules |
| `CLAUDE.md` | Modify | Reference workflow state tracking |

## 7. Test Plan

- [ ] `project-context-memory.ai.yaml` includes `workflow-state` in type enum
- [ ] Schema includes all required fields (workflow, phase, progress, blockers, next-steps)
- [ ] Proactive state check rule exists with session-start trigger
- [ ] Stale detection rule exists with 7-day threshold
- [ ] Standards sync check passes after changes

## Sync Checklist

### From Core Standard
- [x] AI YAML updated (`project-context-memory.ai.yaml`)
- [ ] Translations synced (Phase: future)
